import { HeroSection } from '../../../views/components/HeroSection'

export const ShareStoryPage = () => {
  return (
    <div>
      <div id="hero-container">
        <HeroSection
          title="Comparte tu Historia"
          subtitle="Analiza tu experiencia con IA y compártela con la comunidad para ayudar a otros"
          variant="small"
        />
      </div>

      {/* Success Section (Hidden by default) */}
      <div id="success-section" style={{ display: 'none', padding: '60px 0' }}>
        <section className="section">
           <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
             <div style={{ color: '#10b981', marginBottom: '30px' }}>
               <i className="fas fa-check-circle fa-5x"></i>
             </div>
             <h2>Hemos recibido tu historia</h2>
             <p className="lead" style={{ marginBottom: '30px' }}>
               Tu historia ha sido enviada correctamente. Nuestro equipo la revisará para asegurar
               que cumple con las normas de la comunidad antes de ser publicada.
             </p>
             <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '40px' }}>
               <p style={{ margin: 0, color: '#64748b' }}>
                 <strong>ID de Envío:</strong> <span id="submission-id-display"></span><br/>
                 <strong>Estado:</strong> <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9em' }}>Pendiente de moderación</span>
               </p>
             </div>
             <a href="/" className="btn btn-primary">Volver al Inicio</a>
           </div>
        </section>
      </div>

      <div id="main-content">
        <section className="section">
          <div className="container" style={{ maxWidth: '800px' }}>

            {/* Stepper Indicators */}
            <div className="stepper-indicators" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>

              <div className="step-indicator active" data-step="1" style={{ zIndex: 1, background: 'white', padding: '0 10px', textAlign: 'center' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 'bold' }}>1</div>
                <span style={{ fontSize: '0.9rem', color: '#1e293b', marginTop: '5px', display: 'block' }}>Analizar</span>
              </div>

              <div className="step-indicator" data-step="2" style={{ zIndex: 1, background: 'white', padding: '0 10px', textAlign: 'center' }}>
                <div className="indicator-circle" style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 'bold' }}>2</div>
                <span style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '5px', display: 'block' }}>Preparar</span>
              </div>

              <div className="step-indicator" data-step="3" style={{ zIndex: 1, background: 'white', padding: '0 10px', textAlign: 'center' }}>
                <div className="indicator-circle" style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 'bold' }}>3</div>
                <span style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '5px', display: 'block' }}>Enviar</span>
              </div>
            </div>

            {/* Step 1: Analyze */}
            <div id="step-1-content" className="step-content">
              <div className="card" style={{ padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px', color: '#8b5cf6' }}>
                  <i className="fas fa-robot fa-4x"></i>
                </div>
                <h2 style={{ marginBottom: '15px' }}>Paso 1: Analiza tu historia con IA</h2>
                <p className="lead" style={{ marginBottom: '25px' }}>
                  Utiliza nuestro asistente de inteligencia artificial para estructurar tu experiencia,
                  eliminar nombres reales y obtener un análisis psicológico profundo.
                </p>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px', textAlign: 'left' }}>
                  <h4 style={{ marginTop: 0 }}>Instrucciones:</h4>
                  <ol style={{ paddingLeft: '20px', margin: 0 }}>
                    <li style={{ marginBottom: '10px' }}>Haz clic en el botón de abajo para abrir el asistente (Google Opal).</li>
                    <li style={{ marginBottom: '10px' }}>Cuéntale tu historia con tus propias palabras.</li>
                    <li style={{ marginBottom: '10px' }}>Pídele que genere el formato de publicación HTML.</li>
                  </ol>
                </div>

                <a href="/asistente-ia" target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" id="btn-open-ai">
                  <i className="fas fa-external-link-alt"></i> Abrir Asistente IA
                </a>

                <div style={{ marginTop: '30px' }}>
                  <button className="btn btn-secondary btn-next" data-next="2">
                    Ya tengo mi historia, continuar <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Prepare */}
            <div id="step-2-content" className="step-content" style={{ display: 'none' }}>
              <div className="card" style={{ padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Paso 2: Prepara el archivo</h2>

                <div style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
                  <div>
                    <p>
                      El asistente IA te generará un código HTML. Debes guardarlo en tu computadora
                      con extensión <code>.html</code>.
                    </p>

                    <div className="alert alert-info" style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '15px', borderRadius: '4px', marginTop: '20px' }}>
                      <strong>Importante:</strong> El archivo debe contener los siguientes marcadores para ser válido:
                      <ul style={{ marginTop: '10px', marginBottom: 0 }}>
                        <li><code>&lt;meta name="madm:title"&gt;</code></li>
                        <li><code>&lt;meta name="madm:author"&gt;</code></li>
                        <li><code>&lt;section data-madm="story"&gt;</code></li>
                      </ul>
                    </div>
                  </div>

                  <div style={{ background: '#1e293b', color: '#e2e8f0', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem', overflowX: 'auto' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '10px' }}>&lt;!-- Ejemplo de estructura --&gt;</div>
                    &lt;!DOCTYPE html&gt;<br/>
                    &lt;html&gt;<br/>
                    &lt;head&gt;<br/>
                    &nbsp;&nbsp;&lt;meta charset="UTF-8"&gt;<br/>
                    &nbsp;&nbsp;&lt;meta name="madm:title" content="Mi Título"&gt;<br/>
                    &nbsp;&nbsp;&lt;meta name="madm:author" content="Anónimo"&gt;<br/>
                    &lt;/head&gt;<br/>
                    &lt;body&gt;<br/>
                    &nbsp;&nbsp;&lt;section data-madm="story"&gt;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;p&gt;Había una vez...&lt;/p&gt;<br/>
                    &nbsp;&nbsp;&lt;/section&gt;<br/>
                    &lt;/body&gt;<br/>
                    &lt;/html&gt;
                  </div>
                </div>

                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn btn-secondary btn-prev" data-prev="1">
                    <i className="fas fa-arrow-left"></i> Atrás
                  </button>
                  <button className="btn btn-primary btn-next" data-next="3">
                    Continuar <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Upload */}
            <div id="step-3-content" className="step-content" style={{ display: 'none' }}>
              <div className="card" style={{ padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Paso 3: Sube tu historia</h2>

                <form id="upload-form">

                  {/* Optional Alias */}
                  <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="alias-input" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Alias / Seudónimo (Opcional)</label>
                    <input type="text" name="alias" id="alias-input" placeholder="Ej. El Viajero" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <small style={{ color: '#64748b' }}>Si lo dejas en blanco, usaremos el autor definido en el archivo.</small>
                  </div>

                  {/* File Drop Area */}
                  <div id="drop-area" style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '30px' }}>
                    <i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#94a3b8', marginBottom: '15px' }}></i>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: '#64748b' }}>Arrastra tu archivo .html aquí o haz clic para seleccionar</p>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '5px' }}>Máximo 2MB</p>
                    <input type="file" name="file" id="file-input" accept=".html" style={{ display: 'none' }} required />
                  </div>

                  {/* File Preview & Validation Status */}
                  <div id="file-preview" style={{ display: 'none', marginBottom: '30px', padding: '15px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <i className="fas fa-file-code fa-2x" style={{ color: '#8b5cf6' }}></i>
                      <div style={{ flex: 1 }}>
                        <strong id="filename-display" style={{ display: 'block' }}>archivo.html</strong>
                        <span id="validation-status" style={{ fontSize: '0.9rem' }}>Validando...</span>
                      </div>
                      <button type="button" id="btn-remove-file" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <div id="validation-errors" style={{ marginTop: '10px', color: '#ef4444', fontSize: '0.9rem', display: 'none' }}></div>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="consent-section" style={{ marginBottom: '30px', opacity: 0.5, pointerEvents: 'none' }} id="consent-section">
                    <h4 style={{ marginBottom: '15px' }}>Consentimiento (Requerido)</h4>

                    <label style={{ display: 'flex', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" name="consent_rights" required />
                      <span>Doy mi consentimiento para publicar esta historia en la plataforma.</span>
                    </label>

                    <label style={{ display: 'flex', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" name="consent_anon" required />
                      <span>Confirmo que la historia ha sido anonimizada y no contiene Información de Identificación Personal (PII).</span>
                    </label>

                    <label style={{ display: 'flex', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" name="consent_defamation" required />
                      <span>Confirmo que el contenido no es difamatorio ni viola leyes locales.</span>
                    </label>

                    <label style={{ display: 'flex', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" name="consent_thirdparty" required />
                      <span>Confirmo que no estoy compartiendo datos privados de terceros sin su autorización.</span>
                    </label>
                  </div>

                  {/* Error Message from API */}
                  <div id="api-error" style={{ display: 'none', color: '#ef4444', marginBottom: '20px', padding: '10px', background: '#fee2e2', borderRadius: '6px' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" className="btn btn-secondary btn-prev" data-prev="2">
                      <i className="fas fa-arrow-left"></i> Atrás
                    </button>
                    <button type="submit" id="btn-submit" className="btn btn-primary" disabled>
                      <i className="fas fa-paper-plane"></i> Enviar Historia
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* Client Logic */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', () => {
          // Navigation
          const steps = document.querySelectorAll('.step-content');
          const indicators = document.querySelectorAll('.step-indicator');
          const circles = document.querySelectorAll('.indicator-circle');

          function goToStep(step) {
            steps.forEach(s => s.style.display = 'none');
            document.getElementById('step-' + step + '-content').style.display = 'block';

            indicators.forEach(i => {
              const s = parseInt(i.dataset.step);
              const circle = i.querySelector('div');
              if (s === step) {
                circle.style.background = '#8b5cf6';
                circle.style.color = 'white';
                i.querySelector('span').style.color = '#1e293b';
              } else if (s < step) {
                circle.style.background = '#10b981'; // Completed
                circle.innerHTML = '<i class="fas fa-check"></i>';
                i.querySelector('span').style.color = '#64748b';
              } else {
                circle.style.background = '#cbd5e1';
                circle.innerHTML = s;
                circle.style.color = 'white';
                i.querySelector('span').style.color = '#64748b';
              }
            });
            window.scrollTo(0, 0);
          }

          document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.next)));
          });

          document.querySelectorAll('.btn-prev').forEach(btn => {
            btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.prev)));
          });

          // File Handling
          const dropArea = document.getElementById('drop-area');
          const fileInput = document.getElementById('file-input');
          const filePreview = document.getElementById('file-preview');
          const filenameDisplay = document.getElementById('filename-display');
          const validationStatus = document.getElementById('validation-status');
          const validationErrors = document.getElementById('validation-errors');
          const btnRemove = document.getElementById('btn-remove-file');
          const consentSection = document.getElementById('consent-section');
          const btnSubmit = document.getElementById('btn-submit');
          const checkboxes = document.querySelectorAll('input[type="checkbox"]');
          const uploadForm = document.getElementById('upload-form');
          const aliasInput = document.getElementById('alias-input');
          const apiError = document.getElementById('api-error');

          const mainContent = document.getElementById('main-content');
          const successSection = document.getElementById('success-section');
          const heroContainer = document.getElementById('hero-container');
          const submissionIdDisplay = document.getElementById('submission-id-display');

          let isFileValid = false;

          dropArea.addEventListener('click', () => fileInput.click());

          dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = '#8b5cf6';
            dropArea.style.background = '#f5f3ff';
          });

          dropArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = '#cbd5e1';
            dropArea.style.background = 'white';
          });

          dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.style.borderColor = '#cbd5e1';
            dropArea.style.background = 'white';
            if (e.dataTransfer.files.length) {
              fileInput.files = e.dataTransfer.files;
              handleFile(e.dataTransfer.files[0]);
            }
          });

          fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
              handleFile(fileInput.files[0]);
            }
          });

          btnRemove.addEventListener('click', () => {
            fileInput.value = '';
            dropArea.style.display = 'block';
            filePreview.style.display = 'none';
            consentSection.style.opacity = '0.5';
            consentSection.style.pointerEvents = 'none';
            btnSubmit.disabled = true;
            isFileValid = false;
            checkboxes.forEach(cb => cb.checked = false);
            apiError.style.display = 'none';
          });

          function handleFile(file) {
            if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
              alert('Por favor sube solo archivos .html');
              return;
            }
            if (file.size > 3 * 1024 * 1024) { // 3MB (Updated to match server)
              alert('El archivo es demasiado grande (Máx 3MB)');
              return;
            }

            dropArea.style.display = 'none';
            filePreview.style.display = 'block';
            filenameDisplay.textContent = file.name;
            validationStatus.textContent = 'Validando estructura...';
            validationStatus.style.color = '#64748b';
            validationErrors.style.display = 'none';
            apiError.style.display = 'none';

            const reader = new FileReader();
            reader.onload = function(e) {
              const content = e.target.result;
              validateHtml(content);
            };
            reader.readAsText(file);
          }

          function validateHtml(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const errors = [];

            // Check Metadata
            if (!doc.querySelector('meta[name="madm:title"]')) {
              errors.push('Falta <meta name="madm:title">');
            }
            if (!doc.querySelector('meta[name="madm:author"]')) {
              errors.push('Falta <meta name="madm:author">');
            }

            // Check Sections
            if (!doc.querySelector('section[data-madm="story"]')) {
              errors.push('Falta <section data-madm="story">');
            }

            if (errors.length > 0) {
              isFileValid = false;
              validationStatus.textContent = 'Archivo inválido';
              validationStatus.style.color = '#ef4444';
              validationErrors.innerHTML = errors.map(e => '<div>• ' + e + '</div>').join('');
              validationErrors.style.display = 'block';
              consentSection.style.opacity = '0.5';
              consentSection.style.pointerEvents = 'none';
              btnSubmit.disabled = true;
            } else {
              isFileValid = true;
              validationStatus.textContent = '✓ Archivo válido';
              validationStatus.style.color = '#10b981';
              consentSection.style.opacity = '1';
              consentSection.style.pointerEvents = 'auto';
              checkSubmit();
            }
          }

          // Checkboxes
          checkboxes.forEach(cb => {
            cb.addEventListener('change', checkSubmit);
          });

          function checkSubmit() {
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            btnSubmit.disabled = !(allChecked && isFileValid);
          }

          // Form Submission via AJAX
          uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (btnSubmit.disabled) return;

            const originalBtnText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            btnSubmit.disabled = true;
            apiError.style.display = 'none';

            try {
              const formData = new FormData();
              if (fileInput.files[0]) {
                formData.append('file', fileInput.files[0]);
              }
              if (aliasInput.value) {
                formData.append('alias', aliasInput.value);
              }

              // Include checkbox values (though API might not strictly validate them yet, good for completeness)
              checkboxes.forEach(cb => {
                formData.append(cb.name, 'on');
              });

              const response = await fetch('/api/stories/submissions', {
                method: 'POST',
                body: formData
              });

              const result = await response.json();

              if (response.ok && result.success) {
                // Success! Show success view
                mainContent.style.display = 'none';
                heroContainer.style.display = 'none'; // Optional: hide hero to focus on success
                successSection.style.display = 'block';
                submissionIdDisplay.textContent = result.submissionId || 'Unknown';

                // Scroll to top
                window.scrollTo(0, 0);
              } else {
                // Error
                throw new Error(result.error || 'Error desconocido al enviar la historia.');
              }

            } catch (err) {
              console.error(err);
              apiError.textContent = err.message;
              apiError.style.display = 'block';
              btnSubmit.innerHTML = originalBtnText;
              btnSubmit.disabled = false;
            }
          });
        });
      `}} />
    </div>
  )
}
