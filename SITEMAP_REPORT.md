# Site Directory / Sitemap Report

This report lists the URL structure of the deployed website for the "Más Allá del Miedo" project, based on the codebase analysis.

## 🌐 Public Pages
*   `/` - Home Page
*   `/el-libro` - The Book Info
*   `/metodo` - The Method
*   `/recursos-gratuitos` - Free Resources
*   `/contacto` - Contact Page
*   `/comunidad` - Community Info
*   `/sobre-nosotros` - About Us
*   `/login` - Login Page
*   `/registro` - Registration Page
*   `/verificar/:code` - Certificate Verification
*   `/blog` - Blog List
*   `/blog/:slug` - Blog Post Detail
*   `/cursos` - Courses List
*   `/cursos/:slug` - Course Detail
*   `/media/:key` - Media Proxy (Images/Files)

## 🎓 Student Area
*   `/mi-aprendizaje` - Student Dashboard
*   `/cursos/:courseSlug/leccion/:lessonId` - Lesson View
*   `/cursos/:courseSlug/quiz/:quizId` - Take Quiz
*   `/cursos/:courseSlug/quiz/:quizId/resultado/:attemptId` - Quiz Result
*   `/certificado/:certificateId` - Certificate View
*   `/checkout/:courseId` - Course Checkout
*   `/pago-exitoso` - Payment Success Page

## 🛠️ Admin Panel (`/admin`)
*   `/admin/` - Admin Dashboard
*   **Blog Management**
    *   `/admin/blog-posts` - List Posts
    *   `/admin/blog-posts/new` - Create New Post
    *   `/admin/blog-posts/:id/edit` - Edit Post
    *   `/admin/blog-posts/versions/:versionId` - View Version History
*   **Course Management**
    *   `/admin/courses` - List Courses
    *   `/admin/courses/new` - Create New Course
    *   `/admin/courses/:id` - Edit Course
*   **Lesson Management**
    *   `/admin/lessons` - List Lessons
    *   `/admin/lessons/new` - Create New Lesson
    *   `/admin/lessons/:id` - Edit Lesson
*   **User Management**
    *   `/admin/users` - List Users
    *   `/admin/users/:id` - Edit User
*   **Media Management**
    *   `/admin/media` - Media Library
    *   `/admin/upload` - File Upload Endpoint

## 🔌 API Endpoints
*   **General**
    *   `POST /api/contact` - Submit Contact Form
    *   `POST /api/subscribe` - Subscribe to Resources/Newsletter
*   **Authentication**
    *   `POST /api/register` - User Registration
    *   `POST /api/login` - User Login
    *   `POST /api/logout` - User Logout
    *   `GET /api/me` - Get Current User Info
*   **Payments**
    *   `POST /api/create-payment-intent` - Stripe Payment Intent
    *   `POST /api/verify-payment` - Verify Stripe Payment
    *   `POST /api/create-paypal-order` - Create PayPal Order
    *   `POST /api/capture-paypal-order` - Capture PayPal Order
*   **Learning Progress**
    *   `POST /api/lessons/:lessonId/complete` - Mark Lesson Complete
    *   `POST /api/lessons/:lessonId/notes` - Save Lesson Notes
    *   `POST /api/lessons/:lessonId/progress` - Update Video Progress
    *   `POST /api/quiz/submit` - Submit Quiz Answers

## 🔔 Webhooks
*   `POST /api/webhooks/stripe` - Stripe Events
*   `POST /api/webhooks/paypal` - PayPal IPN
