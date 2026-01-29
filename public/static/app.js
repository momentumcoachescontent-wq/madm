// Manejo de formularios con fetch API
document.addEventListener('DOMContentLoaded', function() {
  
  // Manejar envío de formulario de contacto
  const contactForm = document.querySelector('form[action="/api/contact"]');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const button = this.querySelector('button[type="submit"]');
      const originalText = button.innerHTML;
      
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert('✅ ' + data.message);
          this.reset();
        } else {
          alert('❌ ' + (data.error || 'Error al enviar el mensaje'));
        }
      } catch (error) {
        alert('❌ Error de conexión. Por favor, intenta de nuevo.');
      } finally {
        button.disabled = false;
        button.innerHTML = originalText;
      }
    });
  }
  
  // Manejar envío de formularios de suscripción
  const subscribeForms = document.querySelectorAll('form[action="/api/subscribe"]');
  for (const form of subscribeForms) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const button = this.querySelector('button[type="submit"]');
      const originalText = button.innerHTML;
      
      // Limpiar mensajes anteriores
      const existingMsg = this.querySelector('.auth-message');
      if (existingMsg) existingMsg.remove();

      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      
      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          body: formData
        });
        
        let data;
        try {
          data = await response.json();
        } catch (err) {
          throw new Error('Respuesta inválida del servidor');
        }
        
        if (response.ok && data.success) {
          // Mostrar mensaje de éxito en el DOM
          const msgDiv = document.createElement('div');
          msgDiv.className = 'auth-message success';
          msgDiv.style.marginTop = '15px';
          msgDiv.innerHTML = '✅ ' + (data.message || 'Suscripción exitosa');
          this.appendChild(msgDiv);

          this.reset();

          // Manejar descarga automática
          if (data.downloadUrl) {
            const win = window.open(data.downloadUrl, "_blank", "noopener");
            if (!win || win.closed || typeof win.closed === 'undefined') {
              // Si el popup fue bloqueado, usar redirección
              window.location.href = data.downloadUrl;
            }
          }
        } else {
          // Mostrar error del servidor
          const msgDiv = document.createElement('div');
          msgDiv.className = 'auth-message error';
          msgDiv.style.marginTop = '15px';
          msgDiv.innerHTML = '❌ ' + (data.error || 'Error al procesar suscripción');
          this.appendChild(msgDiv);
        }
      } catch (error) {
        // Mostrar error de conexión/parsing
        const msgDiv = document.createElement('div');
        msgDiv.className = 'auth-message error';
        msgDiv.style.marginTop = '15px';
        msgDiv.innerHTML = '❌ Error de conexión. Por favor, intenta de nuevo.';
        this.appendChild(msgDiv);
      } finally {
        button.disabled = false;
        button.innerHTML = originalText;
      }
    });
  }
  
  // Smooth scroll para enlaces internos
  for (const anchor of document.querySelectorAll('a[href^="#"]')) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }
  
});
