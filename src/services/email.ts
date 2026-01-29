export async function sendResourceEmail(
  to: string,
  resourceCode: string,
  downloadUrl: string,
  apiKey: string,
  fromEmail: string
): Promise<boolean> {
  const resourceNames: Record<string, string> = {
    'test-limites': 'Test de Límites',
    '7-senales': '7 Señales que indican que necesitas poner límites',
    'checklist-limites': 'Checklist de Límites',
    'audio-respiracion': 'Audio de Respiración',
    'general': 'Recurso Gratuito'
  }

  const friendlyName = resourceNames[resourceCode] || 'Recurso Gratuito'

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Aquí tienes tu recurso: ${friendlyName}</h1>
      <p>Hola,</p>
      <p>Gracias por suscribirte. Puedes descargar el recurso que solicitaste en el siguiente enlace:</p>
      <p>
        <a href="${downloadUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Descargar ${friendlyName}
        </a>
      </p>
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p>${downloadUrl}</p>
      <hr />
      <p style="font-size: 12px; color: #666;">Si no solicitaste este correo, puedes ignorarlo.</p>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: `Tu descarga: ${friendlyName}`,
        html: html
      })
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('Resend API Error:', res.status, text)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
