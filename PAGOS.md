# Sistema de Pagos - Más Allá del Miedo

## 📋 Resumen

Sistema completo de checkout y procesamiento de pagos integrado con **Stripe** y **PayPal** para la compra de cursos online.

---

## 🔧 Tecnologías Utilizadas

- **Stripe** - Pagos con tarjeta de crédito/débito
- **PayPal** - Pagos con cuenta PayPal
- **Cloudflare D1** - Base de datos para registrar transacciones
- **Hono Framework** - Backend APIs

---

## 🎯 Funcionalidades Implementadas

### ✅ Página de Checkout (`/checkout/:courseId`)
- Selección entre Stripe y PayPal
- Formulario de tarjeta integrado con Stripe Elements
- Botones de PayPal integrados
- Resumen del pedido con información del curso
- Validación de autenticación de usuario
- Prevención de compras duplicadas

### ✅ APIs de Pago

#### Stripe
- `POST /api/create-payment-intent` - Crear intención de pago
- `POST /api/verify-payment` - Verificar y completar pago

#### PayPal
- `POST /api/create-paypal-order` - Crear orden de pago
- `POST /api/capture-paypal-order` - Capturar y completar pago

### ✅ Página de Confirmación
- `/pago-exitoso` - Confirmación visual del pago exitoso
- Redirección automática a "Mi Aprendizaje"

### ✅ Integración en Páginas
- Botón "Comprar ahora" en detalle de curso
- Detección de inscripciones existentes
- Redirección inteligente según estado de autenticación

---

## 🔐 Configuración de Variables de Entorno

### Desarrollo (`.dev.vars`)
```bash
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_51...your_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_51...your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret

# PayPal (Sandbox)
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_MODE=sandbox
```

### Producción (Cloudflare Secrets)
```bash
# Configurar secrets en producción
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name mas-alla-del-miedo
npx wrangler pages secret put STRIPE_PUBLISHABLE_KEY --project-name mas-alla-del-miedo
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name mas-alla-del-miedo
npx wrangler pages secret put PAYPAL_CLIENT_ID --project-name mas-alla-del-miedo
npx wrangler pages secret put PAYPAL_CLIENT_SECRET --project-name mas-alla-del-miedo
npx wrangler pages secret put PAYPAL_MODE --project-name mas-alla-del-miedo
```

---

## 🗃️ Base de Datos

### Tabla: `paid_enrollments`
Registra inscripciones pagadas a cursos.

```sql
CREATE TABLE paid_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  payment_id TEXT,  -- Stripe Payment Intent ID o PayPal Order ID
  payment_status TEXT DEFAULT 'pending',  -- pending, completed, failed, refunded
  amount_paid REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,  -- stripe, paypal
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  access_revoked BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

### Tabla: `payment_transactions`
Registra todas las transacciones de pago.

```sql
CREATE TABLE payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  enrollment_id INTEGER,
  stripe_payment_intent_id TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,  -- pending, succeeded, failed, refunded
  payment_method_type TEXT,  -- card, paypal
  metadata TEXT,  -- JSON con información adicional
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (enrollment_id) REFERENCES paid_enrollments(id)
);
```

---

## 🚀 Flujo de Pago

### Stripe (Tarjeta)
1. Usuario hace clic en "Comprar ahora"
2. Redirección a `/checkout/:courseId`
3. Usuario llena formulario de tarjeta
4. Frontend llama a `/api/create-payment-intent`
5. Stripe Elements maneja la captura segura de datos
6. Confirmación del pago con `stripe.confirmCardPayment()`
7. Verificación en servidor con `/api/verify-payment`
8. Creación de inscripción en D1
9. Redirección a `/pago-exitoso`

### PayPal
1. Usuario hace clic en "Comprar ahora"
2. Redirección a `/checkout/:courseId`
3. Usuario selecciona PayPal
4. SDK de PayPal carga dinámicamente
5. Frontend llama a `/api/create-paypal-order`
6. Usuario completa pago en ventana de PayPal
7. PayPal callback llama a `/api/capture-paypal-order`
8. Creación de inscripción en D1
9. Redirección a `/pago-exitoso`

---

## 🧪 Testing

### Tarjetas de Prueba de Stripe

#### Tarjetas exitosas:
- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **Amex**: `3782 822463 10005`

**Fecha de expiración**: Cualquier fecha futura  
**CVC**: Cualquier 3 dígitos (4 para Amex)  
**ZIP**: Cualquier código postal

#### Tarjetas de error:
- **Declinada**: `4000 0000 0000 0002`
- **Fondos insuficientes**: `4000 0000 0000 9995`
- **Procesamiento fallido**: `4000 0000 0000 0119`

### PayPal Sandbox
Usa las credenciales de sandbox de tu cuenta de desarrollador de PayPal.

**URL de sandbox**: https://www.sandbox.paypal.com

---

## 📊 Monitoreo

### Ver transacciones en D1
```bash
# Ver inscripciones pagadas
npx wrangler d1 execute mas-alla-del-miedo-db --remote \
  --command="SELECT * FROM paid_enrollments WHERE payment_status = 'completed'"

# Ver transacciones
npx wrangler d1 execute mas-alla-del-miedo-db --remote \
  --command="SELECT * FROM payment_transactions WHERE status = 'succeeded'"
```

### Dashboard de Stripe
- **Test Mode**: https://dashboard.stripe.com/test/payments
- **Live Mode**: https://dashboard.stripe.com/payments

### Dashboard de PayPal
- **Sandbox**: https://www.sandbox.paypal.com
- **Live**: https://www.paypal.com

---

## 🔒 Seguridad

### Buenas Prácticas Implementadas
✅ Datos de tarjeta nunca tocan nuestro servidor (Stripe Elements)  
✅ Claves secretas almacenadas en variables de entorno  
✅ Validación de autenticación en todas las APIs  
✅ Prevención de compras duplicadas  
✅ Registro completo de transacciones  
✅ Verificación server-side de todos los pagos  

### Consideraciones Adicionales
- [ ] Implementar webhooks de Stripe para eventos asíncronos
- [ ] Implementar webhooks de PayPal para IPN
- [ ] Añadir rate limiting a las APIs de pago
- [ ] Implementar 3D Secure para pagos con tarjeta (SCA)
- [ ] Logging avanzado de errores de pago
- [ ] Sistema de reembolsos

---

## 🐛 Troubleshooting

### Error: "Curso no encontrado"
- Verificar que el `courseId` es válido
- Verificar que el curso está publicado (`published = 1`)

### Error: "No autenticado"
- Usuario debe estar logueado
- Verificar que la cookie de sesión existe

### Error: "Ya estás inscrito en este curso"
- El usuario ya tiene una inscripción pagada
- Redireccionar a `/mi-aprendizaje`

### Error de Stripe: "Invalid API key"
- Verificar que `STRIPE_SECRET_KEY` está configurada
- Asegurarse de usar la clave correcta (test vs live)

### Error de PayPal: "Authentication failed"
- Verificar `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`
- Asegurarse de que el modo (`sandbox` vs `live`) es correcto

---

## 📚 Recursos

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [PayPal REST API](https://developer.paypal.com/api/rest/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **[Webhooks Documentation](./WEBHOOKS.md)** - Configuración completa de webhooks

---

## 🔔 Webhooks

El sistema incluye webhooks completos para Stripe y PayPal que manejan eventos asíncronos como pagos exitosos, fallos y reembolsos.

**Ver documentación completa**: [WEBHOOKS.md](./WEBHOOKS.md)

### Endpoints de Webhooks
- `POST /api/webhooks/stripe` - Webhook de Stripe
- `POST /api/webhooks/paypal` - Webhook de PayPal (IPN)

### Eventos Manejados
- ✅ Pagos exitosos (`payment_intent.succeeded`, `PAYMENT.CAPTURE.COMPLETED`)
- ❌ Pagos fallidos (`payment_intent.payment_failed`)
- 💰 Reembolsos (`charge.refunded`, `PAYMENT.CAPTURE.REFUNDED`)
- ⚠️ Disputas (`charge.dispute.created`)

---

## 🎨 Personalización

### Cambiar moneda
Modificar el campo `currency` en la tabla `courses`:
```sql
UPDATE courses SET currency = 'EUR' WHERE id = 1;
```

### Añadir descuentos
Implementar lógica en la página de checkout para aplicar cupones:
```typescript
const discount = couponCode ? calculateDiscount(course.price, couponCode) : 0;
const finalPrice = course.price - discount;
```

---

**Desarrollado con ❤️ para "Más Allá del Miedo"**
