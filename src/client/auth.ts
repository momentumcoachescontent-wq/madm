export function initLogin(formId: string = 'login-form', messageId: string = 'auth-message') {
  const form = document.getElementById(formId) as HTMLFormElement;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageDiv = document.getElementById(messageId);
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalBtnText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    if (messageDiv) messageDiv.style.display = 'none';

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        if (messageDiv) {
          messageDiv.className = 'auth-message success';
          messageDiv.textContent = '¡Bienvenido! Redirigiendo...';
          messageDiv.style.display = 'block';
        }

        setTimeout(() => {
          window.location.href = '/mi-aprendizaje';
        }, 1000);
      } else {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      if (messageDiv) {
        messageDiv.className = 'auth-message error';
        messageDiv.textContent = error.message;
        messageDiv.style.display = 'block';
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

export function initRegister(formId: string = 'register-form', messageId: string = 'auth-message') {
  const form = document.getElementById(formId) as HTMLFormElement;
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageDiv = document.getElementById(messageId);
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalBtnText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
    if (messageDiv) messageDiv.style.display = 'none';

    const formData = new FormData(form);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        if (messageDiv) {
          messageDiv.className = 'auth-message success';
          messageDiv.textContent = '¡Cuenta creada! Redirigiendo...';
          messageDiv.style.display = 'block';
        }

        setTimeout(() => {
          window.location.href = '/mi-aprendizaje';
        }, 1000);
      } else {
        throw new Error(data.error || 'Error al crear cuenta');
      }
    } catch (error: any) {
      if (messageDiv) {
        messageDiv.className = 'auth-message error';
        messageDiv.textContent = error.message;
        messageDiv.style.display = 'block';
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

export async function logout() {
  if (!confirm('¿Estás seguro que deseas cerrar sesión?')) return;

  try {
    const response = await fetch('/api/logout', { method: 'POST' });
    if (response.ok) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
  }
}

export function initLogout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', logout);
  }
}

export async function checkAuth() {
  function remove(id: string) {
    var el = document.getElementById(id);
    if (el) el.remove();
  }
  function show(id: string, display?: string) {
    var el = document.getElementById(id);
    if (el) el.style.display = display || 'inline-flex';
  }

  try {
    const response = await fetch('/api/me');
    const data = await response.json();

    if (data.success && data.user) {
      remove('login-link');
      remove('start-link');
      show('dashboard-link');

      if (data.user.role === 'admin') {
        var adminLink = document.getElementById('admin-link');
        if (adminLink) adminLink.style.display = '';
      } else {
        remove('admin-link');
      }
    } else {
      remove('dashboard-link');
      remove('admin-link');
      show('login-link');
    }
  } catch (error) {
    remove('dashboard-link');
    remove('admin-link');
    show('login-link');
  }
}
