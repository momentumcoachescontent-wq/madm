export function initCertificate() {
  const downloadBtn = document.getElementById('downloadPdfBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
       alert('Usa el botón de imprimir y selecciona "Guardar como PDF" en tu navegador.');
       window.print();
    });
  }
}
