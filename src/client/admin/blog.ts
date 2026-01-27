// Admin Blog Editor Logic

declare const Quill: any;

export function initBlogEditor() {
  const editorElement = document.getElementById('editor');
  if (!editorElement) return;

  // === Quill Initialization ===
  if (typeof Quill !== 'undefined') {
    const quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          ['link', 'image', 'video'],
          ['clean']
        ]
      }
    });

    // Handle Image Upload within Editor
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('image', () => showImageHandler(quill));

    // Form Submit
    const form = document.getElementById('postForm') as HTMLFormElement;
    if (form) {
      form.onsubmit = function() {
        const contentInput = document.getElementById('contentInput') as HTMLInputElement;
        if (contentInput) {
          contentInput.value = quill.root.innerHTML;
        }
      };
    }
  }

  // === Featured Image Upload ===
  const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
  if (imageUpload) {
    imageUpload.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        const btn = document.querySelector('label[for="imageUpload"]');
        let originalText = '';
        if (btn) {
          originalText = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        }

        try {
          const response = await fetch('/admin/upload', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();

          if (btn) btn.innerHTML = originalText;

          if (data.url) {
            const imageUrlInput = document.getElementById('imageUrlInput') as HTMLInputElement;
            if (imageUrlInput) imageUrlInput.value = data.url;
          } else {
            alert('Error uploading image');
          }
        } catch (e) {
          console.error(e);
          if (btn) btn.innerHTML = originalText;
          alert('Error uploading image');
        }
      }
    });
  }

  // === Scheduled Date Handling ===
  const localInput = document.getElementById('scheduledAtLocalInput') as HTMLInputElement;
  const hiddenInput = document.getElementById('scheduledAtHiddenInput') as HTMLInputElement;
  const publishBtn = document.getElementById('publishBtn') as HTMLButtonElement;

  if (localInput && hiddenInput && publishBtn) {
    // 1. Initialize Local Input from UTC Hidden Input
    if (hiddenInput.value) {
      let utcString = hiddenInput.value;
      if (!utcString.endsWith('Z') && !utcString.includes('+')) {
          utcString += 'Z';
      }

      try {
          const date = new Date(utcString);
          if (!isNaN(date.getTime())) {
              const offset = date.getTimezoneOffset() * 60000;
              const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
              localInput.value = localISOTime;
              updateButtonState(localInput, publishBtn);
          }
      } catch (e) {
          console.error('Error parsing date:', e);
      }
    }

    // 2. Listen for changes to update Hidden Input (UTC)
    localInput.addEventListener('change', () => {
      if (localInput.value) {
          const date = new Date(localInput.value);
          const iso = date.toISOString();
          const sqliteFormat = iso.replace('T', ' ').slice(0, 19);
          hiddenInput.value = sqliteFormat;
      } else {
          hiddenInput.value = '';
      }
      updateButtonState(localInput, publishBtn);
    });
  }
}

function showImageHandler(quill: any) {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (file) {
      uploadAndInsertImage(file, quill);
    }
  };
}

async function uploadAndInsertImage(file: File, quill: any) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/admin/upload', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.url) {
      const range = quill.getSelection();
      quill.insertEmbed(range.index, 'image', data.url);
    } else {
      alert('Error uploading image');
    }
  } catch (e) {
    console.error(e);
    alert('Error uploading image');
  }
}

function updateButtonState(localInput: HTMLInputElement, publishBtn: HTMLButtonElement) {
  if (localInput.value) {
      const date = new Date(localInput.value);
      const now = new Date();
      if (date > now) {
          publishBtn.innerHTML = '<i class="fas fa-clock"></i> Programar Publicación';
          publishBtn.classList.remove('btn-primary');
          publishBtn.classList.add('btn-warning');
          publishBtn.style.backgroundColor = '#f59e0b';
          publishBtn.style.borderColor = '#d97706';
          publishBtn.style.color = 'white';
      } else {
          publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Cambios';
          publishBtn.className = 'btn btn-primary btn-lg';
          publishBtn.style.backgroundColor = '';
          publishBtn.style.borderColor = '';
          publishBtn.style.color = '';
      }
  } else {
      publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Cambios';
      publishBtn.className = 'btn btn-primary btn-lg';
      publishBtn.style.backgroundColor = '';
      publishBtn.style.borderColor = '';
      publishBtn.style.color = '';
  }
}
