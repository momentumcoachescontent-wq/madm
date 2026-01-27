// Sidebar Toggling Logic
export function initLayout() {
  const sidebar = document.getElementById('sidebar');
  const menuToggles = document.querySelectorAll('.menu-toggle');

  menuToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
    });
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const isClickInside = sidebar?.contains(target) || target.classList.contains('menu-toggle');

    if (!isClickInside && sidebar?.classList.contains('open') && window.innerWidth <= 768) {
      sidebar.classList.remove('open');
    }
  });

  // Logout Logic
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if(!confirm('¿Cerrar sesión?')) return;
      try {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) {
          window.location.href = '/login';
        } else {
          console.error('Logout failed', response.status);
          alert('Error al cerrar sesión');
        }
      } catch (e) {
        console.error('Logout failed', e);
        alert('Error al cerrar sesión');
      }
    });
  }
}
