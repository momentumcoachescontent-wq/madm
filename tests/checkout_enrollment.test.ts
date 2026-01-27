import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { registerApiRoutes } from '../src/routes/api'
import { CloudflareBindings } from '../src/types'

// Mocks
vi.mock('../src/auth-utils', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    getCurrentUser: vi.fn(),
    userHasAccess: vi.fn(),
  }
})

vi.mock('../src/models/courses', () => ({
  getCourseById: vi.fn(),
}))

vi.mock('../src/models/enrollments', () => ({
  createEnrollment: vi.fn(),
}))

vi.mock('../src/models/payments', () => ({
  recordTransaction: vi.fn(),
}))

vi.mock('stripe', () => {
  const retrieve = vi.fn()
  const create = vi.fn()
  return {
    default: class Stripe {
      paymentIntents = {
        retrieve,
        create
      }
    }
  }
})

// Import mocked modules to set implementations
import * as AuthUtils from '../src/auth-utils'
import * as CourseModels from '../src/models/courses'
import * as EnrollmentModels from '../src/models/enrollments'
import * as PaymentModels from '../src/models/payments'
import Stripe from 'stripe'

describe('Checkout -> Enrollment Flow', () => {
  let app: Hono<{ Bindings: CloudflareBindings }>
  let mockDB: D1Database

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup Mock DB
    mockDB = {
      prepare: vi.fn().mockReturnThis(),
      bind: vi.fn().mockReturnThis(),
      first: vi.fn(),
      all: vi.fn(),
      run: vi.fn(),
      batch: vi.fn(),
      dump: vi.fn(),
      exec: vi.fn(),
    } as unknown as D1Database

    // Setup App
    app = new Hono<{ Bindings: CloudflareBindings }>()
    registerApiRoutes(app)
  })

  it('POST /api/verify-payment (Stripe) - success', async () => {
    // 1. Setup Data
    const mockUser = { id: 123, email: 'test@example.com' }
    const mockCourse = {
      id: 456,
      title: 'Test Course',
      price: 99.99,
      currency: 'USD',
      published: 1
    }
    const paymentIntentId = 'pi_test_12345'

    // 2. Setup Mocks
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue(mockUser as any)
    vi.mocked(CourseModels.getCourseById).mockResolvedValue(mockCourse as any)

    // Mock Stripe
    const mockStripeInstance = new Stripe('sk_test', { apiVersion: '2025-01-27.acacia' as any })
    // Since retrieve is shared from the factory, we can mock it here
    const retrieveSpy = mockStripeInstance.paymentIntents.retrieve as unknown as ReturnType<typeof vi.fn>
    retrieveSpy.mockResolvedValue({
      id: paymentIntentId,
      status: 'succeeded',
    } as any)

    vi.mocked(EnrollmentModels.createEnrollment).mockResolvedValue({
      last_row_id: 789,
      changes: 1,
      duration: 0,
      served_by: 'mock'
    } as any)

    vi.mocked(PaymentModels.recordTransaction).mockResolvedValue({
      last_row_id: 101,
      changes: 1,
      duration: 0,
      served_by: 'mock'
    } as any)

    // 3. Execute Request
    const res = await app.request('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=test-token'
      },
      body: JSON.stringify({
        paymentIntentId,
        courseId: mockCourse.id
      })
    }, {
      DB: mockDB,
      STRIPE_SECRET_KEY: 'sk_test_key'
    })

    // 4. Assertions
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      success: true,
      message: 'Inscripción completada exitosamente'
    })

    // Verify Models called
    expect(AuthUtils.getCurrentUser).toHaveBeenCalled()
    expect(CourseModels.getCourseById).toHaveBeenCalledWith(mockDB, mockCourse.id)

    expect(EnrollmentModels.createEnrollment).toHaveBeenCalledWith(mockDB, {
      user_id: mockUser.id,
      course_id: mockCourse.id,
      payment_id: paymentIntentId,
      payment_status: 'completed',
      amount_paid: mockCourse.price,
      currency: mockCourse.currency,
      payment_method: 'stripe'
    })

    expect(PaymentModels.recordTransaction).toHaveBeenCalledWith(mockDB, {
      user_id: mockUser.id,
      enrollment_id: 789,
      stripe_payment_intent_id: paymentIntentId,
      amount: mockCourse.price,
      currency: mockCourse.currency,
      status: 'succeeded',
      payment_method_type: 'card'
    })
  })

  it('POST /api/capture-paypal-order (PayPal) - success', async () => {
    // 1. Setup Data
    const mockUser = { id: 123, email: 'test@example.com' }
    const mockCourse = {
      id: 456,
      title: 'Test Course',
      price: 50.00,
      currency: 'USD',
      published: 1
    }
    const orderId = 'ORDER-123'
    const captureId = 'CAPTURE-456'

    // 2. Setup Mocks
    vi.mocked(AuthUtils.getCurrentUser).mockResolvedValue(mockUser as any)
    vi.mocked(CourseModels.getCourseById).mockResolvedValue(mockCourse as any)

    // Mock global fetch for PayPal
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: captureId,
        status: 'COMPLETED'
      })
    } as Response)

    vi.mocked(EnrollmentModels.createEnrollment).mockResolvedValue({
      last_row_id: 888,
      changes: 1,
      duration: 0,
      served_by: 'mock'
    } as any)

    vi.mocked(PaymentModels.recordTransaction).mockResolvedValue({
      last_row_id: 202,
      changes: 1,
      duration: 0,
      served_by: 'mock'
    } as any)

    // 3. Execute Request
    const res = await app.request('/api/capture-paypal-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=test-token'
      },
      body: JSON.stringify({
        orderId,
        courseId: mockCourse.id
      })
    }, {
      DB: mockDB,
      PAYPAL_CLIENT_ID: 'mock_client_id',
      PAYPAL_CLIENT_SECRET: 'mock_secret',
      PAYPAL_MODE: 'sandbox'
    })

    // 4. Assertions
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      success: true,
      message: 'Inscripción completada exitosamente'
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/v2/checkout/orders/${orderId}/capture`),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Basic ')
        })
      })
    )

    expect(EnrollmentModels.createEnrollment).toHaveBeenCalledWith(mockDB, {
      user_id: mockUser.id,
      course_id: mockCourse.id,
      payment_id: orderId,
      payment_status: 'completed',
      amount_paid: mockCourse.price,
      currency: mockCourse.currency,
      payment_method: 'paypal'
    })

    expect(PaymentModels.recordTransaction).toHaveBeenCalledWith(mockDB, {
      user_id: mockUser.id,
      enrollment_id: 888,
      amount: mockCourse.price,
      currency: mockCourse.currency,
      status: 'succeeded',
      payment_method_type: 'paypal',
      metadata: { orderId, captureId }
    })
  })
})
