// Media Library Logic

export function initMediaLibrary() {
  const dropZone = document.getElementById('dropZone');
  if (!dropZone) return; // Not on media page

  // === Event Listeners for Dynamic Elements (Delete, Copy) ===
  const mediaGrid = document.getElementById('mediaGrid');
  if (mediaGrid) {
    mediaGrid.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;

      // Handle Copy URL
      const copyBtn = target.closest('.copy-btn') as HTMLButtonElement;
      if (copyBtn) {
        const url = copyBtn.dataset.url;
        if (url) copyUrl(url);
      }

      // Handle Delete
      const deleteBtn = target.closest('.media-action-btn.delete') as HTMLButtonElement;
      if (deleteBtn) {
        const key = deleteBtn.dataset.key;
        if (key) deleteFile(key, deleteBtn);
      }
    });
  }

  // === Upload Handling ===
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#8b5cf6';
      dropZone.style.background = '#f5f3ff';
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#cbd5e1';
      dropZone.style.background = '#f8fafc';
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#cbd5e1';
      dropZone.style.background = '#f8fafc';

      if (e.dataTransfer?.files.length) {
        handleFiles(e.dataTransfer.files, dropZone);
      }
    });

    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.length) {
        handleFiles(target.files, dropZone);
      }
    });
  }
}

function copyUrl(url: string) {
  const fullUrl = window.location.origin + url;
  navigator.clipboard.writeText(fullUrl).then(() => {
    showToast('URL copiada al portapapeles');
  });
}

function showToast(message: string) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
}

async function deleteFile(key: string, btn: HTMLElement) {
  if (!confirm('¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.')) return;

  try {
    const response = await fetch('/admin/media/' + encodeURIComponent(key), {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('Archivo eliminado');
      // Remove element from DOM
      const item = btn.closest('.media-item');
      item?.remove();
    } else {
      showToast('Error al eliminar archivo');
    }
  } catch (error) {
    console.error(error);
    showToast('Error de conexión');
  }
}

async function handleFiles(files: FileList, dropZone: HTMLElement) {
  const h3 = dropZone.querySelector('h3');
  const originalText = h3 ? h3.textContent : '';
  if (h3) h3.textContent = 'Subiendo ' + files.length + ' archivo(s)...';

  let successCount = 0;

  for (let i = 0; i < files.length; i++) {
    const formData = new FormData();
    formData.append('file', files[i]);

    try {
      const response = await fetch('/admin/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        successCount++;
      }
    } catch (error) {
      console.error('Error uploading:', error);
    }
  }

  showToast(successCount + ' archivo(s) subido(s) con éxito');
  if (h3) h3.textContent = originalText;

  // Reload page to show new files
  setTimeout(() => window.location.reload(), 1000);
}
