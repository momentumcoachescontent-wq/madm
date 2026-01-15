# Configuración de Webhooks - Más Allá del Miedo

## 📋 Resumen

Los webhooks permiten que Stripe y PayPal notifiquen automáticamente a nuestra aplicación sobre eventos importantes de pago, como pagos exitosos, fallos y reembolsos. Esto asegura que la base de datos siempre esté sincronizada con el estado real de los pagos.

---

## 🔧 Endpoints de Webhooks

### Stripe Webhook
```
POST /api/webhooks/stripe
```

### PayPal Webhook
```
POST /api/webhooks/paypal
```

---

## 🎯 Eventos Manejados

### Stripe

#### ✅ `payment_intent.succeeded`
**Descripción**: Pago completado exitosamente  
**Acción**: 
- Crea inscripción si no existe
- Actualiza estado a 'completed'
- Registra transacción exitosa

#### ❌ `payment_intent.payment_failed`
**Descripción**: Pago fallido  
**Acción**:
- Actualiza estado de inscripción a 'failed'
- Registra transacción fallida con mensaje de error

#### 💰 `charge.refunded`
**Descripción**: Cargo reembolsado  
**Acción**:
- Actualiza estado de inscripción a 'refunded'
- Revoca acceso al curso
- Registra transacción de reembolso

#### ⚠️ `charge.dispute.created`
**Descripción**: Disputa de cargo creada  
**Acción**:
- Marca inscripción como 'disputed'
- Registra evento en logs

### PayPal

#### ✅ `PAYMENT.CAPTURE.COMPLETED`
**Descripción**: Pago capturado exitosamente  
**Acción**:
- Confirma inscripción existente
- Actualiza estado a 'completed'
- Registra transacción exitosa

#### 💰 `PAYMENT.CAPTURE.REFUNDED`
**Descripción**: Pago reembolsado  
**Acción**:
- Actualiza estado de inscripción a 'refunded'
- Revoca acceso al curso
- Registra transacción de reembolso

#### ❌ `PAYMENT.CAPTURE.DENIED` / `PAYMENT.CAPTURE.DECLINED`
**Descripción**: Pago denegado o rechazado  
**Acción**:
- Registra evento en logs

---

## 🗃️ Tabla de Logs de Webhooks

Se crea automáticamente la primera vez que se recibe un webhook:

```sql
CREATE TABLE webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,           -- 'stripe' o 'paypal'
  event_type TEXT NOT NULL,         -- Tipo de evento
  event_id TEXT,                    -- ID único del evento
  payload TEXT NOT NULL,            -- JSON completo del evento
  status TEXT DEFAULT 'received',   -- 'received', 'processed', 'failed'
  error_message TEXT,               -- Mensaje de error si falló
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Consultar Logs

```bash
# Ver últimos webhooks recibidos
npx wrangler d1 execute mas-alla-del-miedo-db --remote \
  --command="SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 20"

# Ver webhooks fallidos
npx wrangler d1 execute mas-alla-del-miedo-db --remote \
  --command="SELECT * FROM webhook_logs WHERE status = 'failed'"

# Ver webhooks de Stripe
npx wrangler d1 execute mas-alla-del-miedo-db --remote \
  --command="SELECT * FROM webhook_logs WHERE provider = 'stripe' ORDER BY created_at DESC LIMIT 10"
```

---

## ⚙️ Configuración en Stripe

### 1. Acceder al Dashboard de Stripe
- **Test Mode**: https://dashboard.stripe.com/test/webhooks
- **Live Mode**: https://dashboard.stripe.com/webhooks

### 2. Crear Webhook Endpoint

1. Clic en "Add endpoint"
2. **Endpoint URL**: 
   - Desarrollo: `https://your-dev-url.com/api/webhooks/stripe`
   - Producción: `https://mas-alla-del-miedo.pages.dev/api/webhooks/stripe`

3. **Eventos a seleccionar**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`

4. Clic en "Add endpoint"

### 3. Obtener Signing Secret

Después de crear el endpoint, Stripe mostrará el **Signing Secret** (comienza con `whsec_`).

### 4. Configurar en Variables de Entorno

**Desarrollo (`.dev.vars`)**:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...your_test_webhook_secret
```

**Producción**:
```bash
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name mas-alla-del-miedo
# Pegar el signing secret cuando se solicite
```

---

## ⚙️ Configuración en PayPal

### 1. Acceder al Dashboard de PayPal
- **Sandbox**: https://developer.paypal.com/dashboard/applications/sandbox
- **Live**: https://developer.paypal.com/dashboard/applications/live

### 2. Configurar Webhooks

1. Selecciona tu aplicación
2. Ve a la sección "Webhooks"
3. Clic en "Add Webhook"

4. **Webhook URL**:
   - Desarrollo: `https://your-dev-url.com/api/webhooks/paypal`
   - Producción: `https://mas-alla-del-miedo.pages.dev/api/webhooks/paypal`

5. **Eventos a seleccionar**:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.DECLINED`

6. Guardar webhook

### 3. Verificación de Webhook (Opcional pero Recomendado)

PayPal envía headers especiales para verificar webhooks:
- `paypal-transmission-id`
- `paypal-transmission-time`
- `paypal-transmission-sig`

Actualmente nuestra implementación registra todos los webhooks. Para producción, considera implementar verificación adicional.

---

## 🧪 Testing de Webhooks

### Stripe CLI (Recomendado para desarrollo local)

#### 1. Instalar Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
# Descargar desde https://github.com/stripe/stripe-cli/releases
```

#### 2. Login a Stripe
```bash
stripe login
```

#### 3. Forward webhooks a localhost
```bash
# Reenviar webhooks de Stripe a tu servidor local
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Stripe te dará un webhook secret temporal (whsec_...)
# Úsalo en tu .dev.vars para desarrollo
```

#### 4. Trigger eventos manualmente
```bash
# Simular pago exitoso
stripe trigger payment_intent.succeeded

# Simular pago fallido
stripe trigger payment_intent.payment_failed

# Simular reembolso
stripe trigger charge.refunded
```

### Dashboard de Stripe

También puedes enviar webhooks de prueba desde el dashboard:
1. Ve a tu endpoint de webhook
2. Clic en "Send test webhook"
3. Selecciona el evento
4. Enviar

### PayPal Sandbox

Para PayPal, completa transacciones reales en el sandbox:
1. Usa credenciales de sandbox
2. Completa un pago
3. PayPal enviará automáticamente webhooks

---

## 🔍 Monitoreo y Debugging

### Ver Logs en Tiempo Real

```bash
# Logs de PM2 (desarrollo)
pm2 logs webapp --nostream

# Logs de Wrangler (desarrollo)
npx wrangler pages dev dist --live-reload
```

### Verificar Webhooks en Stripe Dashboard

1. Ve a tu endpoint de webhook
2. Verás historial de intentos de entrega
3. Cada intento muestra:
   - Estado (succeeded/failed)
   - Código de respuesta
   - Payload enviado
   - Respuesta recibida

### Verificar Webhooks en PayPal Dashboard

1. Ve a la sección de Webhooks
2. Selecciona tu webhook
3. Ve el historial de eventos enviados

### Consultar Base de Datos

```bash
# Ver todos los webhooks recibidos hoy
npx wrangler d1 execute mas-alla-del-miedo-db --remote \
  --command="SELECT * FROM webhook_logs WHERE DATE(created_at) = DATE('now') ORDER BY created_at DESC"

# Ver webhooks fallidos con detalles
npx wrangler d1 execute mas-alla-del-miedo-db --remote \
  --command="SELECT provider, event_type, error_message, created_at FROM webhook_logs WHERE status = 'failed'"

# Contar webhooks por tipo
npx wrangler d1 execute mas-alla-del-miedo-db --remote \
  --command="SELECT provider, event_type, COUNT(*) as count FROM webhook_logs GROUP BY provider, event_type"
```

---

## 🔒 Seguridad

### Buenas Prácticas Implementadas

✅ **Verificación de firma de Stripe**: Usamos `stripe.webhooks.constructEvent()` para verificar que el webhook viene realmente de Stripe

✅ **Registro completo**: Todos los webhooks se registran en `webhook_logs` para auditoría

✅ **Idempotencia**: La lógica maneja correctamente webhooks duplicados

✅ **Logging de errores**: Errores se guardan en la base de datos para debugging

### Consideraciones Adicionales

⚠️ **Verificación de PayPal**: Considera implementar verificación de firma de PayPal usando sus headers

⚠️ **Rate Limiting**: Implementa rate limiting para prevenir abuso

⚠️ **Timeout**: Los webhooks deben responder rápido (< 30 segundos)

---

## 🐛 Troubleshooting

### Error: "Invalid signature" (Stripe)

**Causa**: El `STRIPE_WEBHOOK_SECRET` no coincide con el del endpoint

**Solución**:
1. Ve al dashboard de Stripe
2. Copia el signing secret del endpoint
3. Actualiza `STRIPE_WEBHOOK_SECRET`

### Webhook recibido pero no procesado

**Causa**: Error en la lógica de procesamiento

**Solución**:
```bash
# Ver logs de webhook
npx wrangler d1 execute mas-alla-del-miedo-db --remote \
  --command="SELECT * FROM webhook_logs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5"

# Ver mensaje de error específico
# Ajustar lógica según el error
```

### Webhooks no llegan

**Causa**: URL incorrecta o problemas de red

**Solución**:
1. Verifica que la URL es correcta
2. Asegúrate de que el endpoint es público (no localhost)
3. Verifica en el dashboard que el endpoint está activo
4. Revisa logs del servidor

### Duplicación de inscripciones

**Causa**: Webhook se procesa dos veces

**Solución**: La lógica ya maneja esto verificando si existe la inscripción antes de crearla

---

## 📊 Flujo Completo de Webhook

### Stripe
```
1. Usuario completa pago en frontend
2. Stripe procesa el pago
3. Stripe envía webhook a /api/webhooks/stripe
4. Servidor verifica firma
5. Servidor registra webhook en webhook_logs
6. Servidor procesa evento según tipo
7. Servidor actualiza/crea inscripción en D1
8. Servidor registra transacción
9. Servidor marca webhook como 'processed'
10. Servidor responde 200 OK a Stripe
```

### PayPal
```
1. Usuario completa pago en PayPal
2. PayPal procesa el pago
3. PayPal envía webhook a /api/webhooks/paypal
4. Servidor verifica headers
5. Servidor registra webhook en webhook_logs
6. Servidor procesa evento según tipo
7. Servidor actualiza/crea inscripción en D1
8. Servidor registra transacción
9. Servidor marca webhook como 'processed'
10. Servidor responde 200 OK a PayPal
```

---

## 🔄 Reintentos

### Stripe
- Stripe reintenta webhooks fallidos automáticamente
- Hasta 3 días de reintentos
- Puedes forzar un reintento manualmente desde el dashboard

### PayPal
- PayPal también reintenta webhooks fallidos
- Hasta 10 reintentos con backoff exponencial
- Configurable en el dashboard

---

## 📚 Recursos

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [PayPal Webhooks Guide](https://developer.paypal.com/api/rest/webhooks/)
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)

---

## 🎨 Próximas Mejoras

- [ ] Dashboard de webhooks en admin panel
- [ ] Alertas por email cuando fallan webhooks críticos
- [ ] Implementar verificación completa de PayPal webhooks
- [ ] Rate limiting específico para webhooks
- [ ] Retry queue para webhooks fallidos

---

**Desarrollado con ❤️ para "Más Allá del Miedo"**
