import { Hono } from 'hono'
import { html } from 'hono/html'

type Bindings = {
  IMAGES_BUCKET: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Helper for Admin Layout (simplified)
const AdminLayout = (children: unknown, title: string) => html`
  <div class="admin-container" style="padding: 20px;">
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h1>${title}</h1>
      <a href="/admin" class="btn btn-secondary">
        <i class="fas fa-arrow-left"></i> Volver al Dashboard
      </a>
    </div>
    ${children}
  </div>
`

// View: Media Library
const MediaLibrary = (objects: R2Object[], cursor?: string) => html`
  <style>
    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .media-item {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      transition: all 0.2s;
      position: relative;
    }
    .media-item:hover {
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    .media-preview {
      height: 120px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .media-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .media-icon {
      font-size: 3rem;
      color: #94a3b8;
    }
    .media-info {
      padding: 10px;
      font-size: 0.85rem;
    }
    .media-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 5px;
      font-weight: 500;
      color: #1e293b;
    }
    .media-meta {
      color: #64748b;
      font-size: 0.75rem;
      display: flex;
      justify-content: space-between;
    }
    .media-actions {
      display: flex;
      border-top: 1px solid #e2e8f0;
    }
    .media-action-btn {
      flex: 1;
      border: none;
      background: none;
      padding: 8px;
      cursor: pointer;
      color: #64748b;
      transition: background 0.2s;
      font-size: 0.9rem;
    }
    .media-action-btn:hover {
      background: #f8fafc;
      color: #8b5cf6;
    }
    .media-action-btn.delete:hover {
      color: #ef4444;
    }
    .upload-area {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 30px;
    }
    .upload-area:hover {
      border-color: #8b5cf6;
      background: #f5f3ff;
    }
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1e293b;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      display: none;
      animation: fadeIn 0.3s;
      z-index: 1000;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  </style>

  <div class="upload-area" id="dropZone">
    <i class="fas fa-cloud-upload-alt fa-3x" style="color: #94a3b8; margin-bottom: 15px;"></i>
    <h3 style="margin-bottom: 5px; color: #1e293b;">Arrastra archivos aquí o haz clic para subir</h3>
    <p style="color: #64748b;">Soporta imágenes, PDFs y documentos</p>
    <input type="file" id="fileInput" multiple style="display: none">
  </div>

  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h2 style="font-size: 1.2rem; color: #1e293b;">Archivos Recientes</h2>
    <span style="color: #64748b; font-size: 0.9rem;">Total: ${objects.length} archivos mostrados</span>
  </div>

  <div class="media-grid" id="mediaGrid">
    ${objects.length === 0 ? html`<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">No hay archivos en la biblioteca.</p>` : ''}
    ${objects.map(obj => {
      const isImage = obj.key.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      const url = '/media/' + obj.key

      return html`
        <div class="media-item" data-key="${obj.key}">
          <div class="media-preview">
            ${isImage
              ? html`<img src="${url}" alt="${obj.key}" loading="lazy">`
              : html`<div class="media-icon"><i class="fas fa-file-alt"></i></div>`
            }
          </div>
          <div class="media-info">
            <div class="media-name" title="${obj.key}">${obj.key}</div>
            <div class="media-meta">
              <span>${(obj.size / 1024).toFixed(1)} KB</span>
              <span>${obj.uploaded.toLocaleDateString()}</span>
            </div>
          </div>
          <div class="media-actions">
            <button class="media-action-btn" onclick="copyUrl('${url}')" title="Copiar URL">
              <i class="fas fa-link"></i>
            </button>
            <a href="${url}" target="_blank" class="media-action-btn" title="Ver / Descargar">
              <i class="fas fa-external-link-alt"></i>
            </a>
            <button class="media-action-btn delete" onclick="deleteFile('${obj.key}')" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `
    })}
  </div>

  <div id="toast" class="toast"></div>

  <script>
    // Copy URL
    function copyUrl(url) {
      const fullUrl = window.location.origin + url;
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast('URL copiada al portapapeles');
      });
    }

    // Show Toast
    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3000);
    }

    // Delete File
    async function deleteFile(key) {
      if (!confirm('¿Estás seguro de eliminar este archivo? Esta acción no se puede deshacer.')) return;

      try {
        const response = await fetch('/admin/media/' + encodeURIComponent(key), {
          method: 'DELETE'
        });

        if (response.ok) {
          showToast('Archivo eliminado');
          // Remove element from DOM
          const el = document.querySelector('.media-item[data-key="' + key + '"]');
          if (el) el.remove();
        } else {
          showToast('Error al eliminar archivo');
        }
      } catch (error) {
        console.error(error);
        showToast('Error de conexión');
      }
    }

    // Upload Handling
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

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

      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleFiles(e.target.files);
      }
    });

    async function handleFiles(files) {
      const originalText = dropZone.querySelector('h3').textContent;
      dropZone.querySelector('h3').textContent = 'Subiendo ' + files.length + ' archivo(s)...';

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
      dropZone.querySelector('h3').textContent = originalText;

      // Reload page to show new files
      setTimeout(() => window.location.reload(), 1000);
    }
  </script>
`

// Routes
app.get('/', async (c) => {
  try {
    const list = await c.env.IMAGES_BUCKET.list({ limit: 100 })
    return c.render(AdminLayout(MediaLibrary(list.objects), 'Biblioteca Multimedia'))
  } catch (error) {
    return c.text('Error listing files: ' + (error as Error).message, 500)
  }
})

app.delete('/:key', async (c) => {
  const key = c.req.param('key')
  try {
    await c.env.IMAGES_BUCKET.delete(key)
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete file' }, 500)
  }
})

export default app
