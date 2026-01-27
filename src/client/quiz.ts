export function initQuiz(quizId: number, courseId: number, timeLimit: number, slug: string) {
  let timeRemaining = timeLimit * 60; // seconds
  let timerInterval: any;
  const startTime = Date.now();
  const form = document.getElementById('quizForm') as HTMLFormElement;

  if (!form) return;

  // Tick function
  const tick = () => {
    timeRemaining--;

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = minutes + ':' + seconds.toString().padStart(2, '0');

    const timerEl = document.getElementById('timerDisplay');
    if (timerEl) {
      timerEl.textContent = display;

      // Change colors based on remaining time
      timerEl.classList.remove('warning', 'danger');
      if (timeRemaining <= 60) {
        timerEl.classList.add('danger');
      } else if (timeRemaining <= 180) {
        timerEl.classList.add('warning');
      }
    }

    // Auto-submit when time runs out
    if (timeRemaining <= 0) {
      if (timerInterval) clearInterval(timerInterval);
      alert('¡Tiempo agotado! La evaluación se enviará automáticamente.');
      form.dispatchEvent(new Event('submit'));
    }
  };

  // Start timer if time limit exists
  if (timeLimit > 0) {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (timerInterval) clearInterval(timerInterval);

    // If triggered manually (not by timeout), ask for confirmation
    if (timeRemaining > 0 && !confirm('¿Estás seguro de enviar la evaluación? No podrás cambiar tus respuestas.')) {
      // Restart timer if cancelled
      if (timeLimit > 0) {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(tick, 1000);
      }
      return;
    }

    const formData = new FormData(form);
    const answers: Record<string, number[]> = {};

    // Collect answers
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('question_')) {
        const questionId = key.replace('question_', '');
        if (!answers[questionId]) {
          answers[questionId] = [];
        }
        answers[questionId].push(parseInt(value as string));
      }
    }

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.innerHTML;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          courseId,
          answers,
          timeTaken
        })
      });

      const data = await response.json() as any;

      if (data.success) {
        window.location.href = `/cursos/${slug}/quiz/${quizId}/resultado/${data.attemptId}`;
      } else {
        alert('Error: ' + (data.error || 'No se pudo enviar la evaluación'));
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar la evaluación. Por favor, intenta de nuevo.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Prevent accidental exit
  window.addEventListener('beforeunload', (e) => {
    // Standard behavior shows prompt
    e.preventDefault();
    e.returnValue = '';
  });
}
