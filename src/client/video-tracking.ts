// Video Tracking
export function initVideoTracking(lessonId: number, courseId: number, lastPosition: number, videoDuration: number) {
  let currentVideoTime = 0;
  let currentVideoDuration = videoDuration || 0;
  let videoReady = false;
  let videoProgressInterval: any;

  const saveVideoProgress = async (position: number, duration: number) => {
    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: Math.round(position),
          duration: Math.round(duration),
          courseId
        })
      });
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  };

  // YouTube
  function initYouTubeTracking() {
    const isTrustedYouTubeUrl = (urlString: string): boolean => {
      try {
        const parsedUrl = new URL(urlString, window.location.origin);
        const protocol = parsedUrl.protocol;
        if (protocol !== 'https:' && protocol !== 'http:') {
          return false;
        }
        const hostname = parsedUrl.hostname.toLowerCase();
        const allowedHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
        return allowedHosts.includes(hostname) || hostname.endsWith('.youtube.com');
      } catch {
        return false;
      }
    };

    const iframe = document.querySelector('iframe');
    if (!iframe || !isTrustedYouTubeUrl(iframe.src)) return;

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    (window as any).onYouTubeIframeAPIReady = function() {
      new (window as any).YT.Player(iframe, {
        events: {
          'onReady': function(event: any) {
            videoReady = true;
            currentVideoDuration = event.target.getDuration();

            if (lastPosition > 0 && lastPosition < currentVideoDuration - 5) {
              event.target.seekTo(lastPosition, true);
              console.log('Restored video position:', lastPosition);
            }

            videoProgressInterval = setInterval(() => {
              try {
                const currentTime = event.target.getCurrentTime();
                const duration = event.target.getDuration();
                if (currentTime > 0 && duration > 0) {
                  currentVideoTime = currentTime;
                  currentVideoDuration = duration;
                  saveVideoProgress(currentTime, duration);
                }
              } catch (err) {
                console.error('Error tracking YouTube progress:', err);
              }
            }, 10000);
          },
          'onStateChange': function(event: any) {
            if (event.data === (window as any).YT.PlayerState.PAUSED || event.data === (window as any).YT.PlayerState.ENDED) {
               const currentTime = event.target.getCurrentTime();
               const duration = event.target.getDuration();
               saveVideoProgress(currentTime, duration);
            }
            if (event.data === (window as any).YT.PlayerState.ENDED) {
               // Auto-complete logic handled separately or trigger event
               document.dispatchEvent(new CustomEvent('video-ended'));
            }
          }
        }
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      (window as any).onYouTubeIframeAPIReady();
    }
  }

  // Vimeo
  function initVimeoTracking() {
    const isTrustedVimeoUrl = (urlString: string): boolean => {
      try {
        const parsedUrl = new URL(urlString, window.location.origin);
        const protocol = parsedUrl.protocol;
        if (protocol !== 'https:' && protocol !== 'http:') {
          return false;
        }
        const hostname = parsedUrl.hostname.toLowerCase();
        const allowedHosts = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];
        return allowedHosts.includes(hostname) || hostname.endsWith('.vimeo.com');
      } catch {
        return false;
      }
    };

    const iframe = document.querySelector('iframe');
    if (!iframe || !isTrustedVimeoUrl(iframe.src)) return;

    if (!(window as any).Vimeo) {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.onload = setupVimeoPlayer;
      document.head.appendChild(script);
    } else {
      setupVimeoPlayer();
    }

    function setupVimeoPlayer() {
      const player = new (window as any).Vimeo.Player(iframe);
      player.ready().then(() => {
        videoReady = true;
        player.getDuration().then((duration: number) => {
          currentVideoDuration = duration;
          if (lastPosition > 0 && lastPosition < duration - 5) {
            player.setCurrentTime(lastPosition);
          }
        });

        player.on('timeupdate', (data: any) => {
          currentVideoTime = data.seconds;
          currentVideoDuration = data.duration;
        });

        videoProgressInterval = setInterval(() => {
          if (currentVideoTime > 0 && currentVideoDuration > 0) {
            saveVideoProgress(currentVideoTime, currentVideoDuration);
          }
        }, 10000);

        player.on('ended', () => {
          saveVideoProgress(currentVideoTime, currentVideoDuration);
          document.dispatchEvent(new CustomEvent('video-ended'));
        });
      });
    }
  }

  // HTML5
  function initHTML5VideoTracking() {
    const video = document.querySelector('video');
    if (!video) return;

    video.addEventListener('loadedmetadata', () => {
      videoReady = true;
      currentVideoDuration = video.duration;
      if (lastPosition > 0 && lastPosition < video.duration - 5) {
        video.currentTime = lastPosition;
      }
    });

    video.addEventListener('timeupdate', () => {
      currentVideoTime = video.currentTime;
      currentVideoDuration = video.duration;
    });

    videoProgressInterval = setInterval(() => {
      if (video.currentTime > 0 && video.duration > 0) {
        saveVideoProgress(video.currentTime, video.duration);
      }
    }, 10000);

    video.addEventListener('ended', () => {
      saveVideoProgress(video.currentTime, video.duration);
      document.dispatchEvent(new CustomEvent('video-ended'));
    });
  }

  setTimeout(() => {
    initYouTubeTracking();
    initVimeoTracking();
    initHTML5VideoTracking();
  }, 1000);

  window.addEventListener('beforeunload', () => {
    if (currentVideoTime > 0 && currentVideoDuration > 0) {
      const data = JSON.stringify({
        position: Math.round(currentVideoTime),
        duration: Math.round(currentVideoDuration),
        courseId
      });
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(`/api/lessons/${lessonId}/progress`, blob);
    }
  });

  window.addEventListener('unload', () => {
    if (videoProgressInterval) clearInterval(videoProgressInterval);
  });
}

// Completion
export function initCompletion(lessonId: number, courseId: number, isCompletedInitial: boolean) {
  let isCompleted = isCompletedInitial;
  const btn = document.getElementById('completeBtn');
  if (!btn) return;

  const toggleComplete = async () => {
    try {
      btn.setAttribute('disabled', 'true');

      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !isCompleted, courseId })
      });

      const data = await response.json() as any;

      if (data.success) {
        isCompleted = !isCompleted;
        btn.innerHTML = isCompleted
          ? '<i class="fas fa-check-circle"></i> Completada'
          : '<i class="far fa-circle"></i> Marcar Completa';
        btn.style.background = isCompleted ? '#10b981' : '#64748b';

        if (data.certificateGenerated && data.certificateId) {
          if (confirm('¡Felicitaciones! Has completado el curso al 100%. Tu certificado ha sido generado. ¿Deseas verlo ahora?')) {
            window.location.href = '/certificado/' + data.certificateId;
            return;
          }
        }

        setTimeout(() => window.location.reload(), 500);
      } else {
        alert('Error al actualizar el progreso');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el progreso');
    } finally {
      btn.removeAttribute('disabled');
    }
  };

  btn.addEventListener('click', toggleComplete);

  // Auto-complete on video ended
  document.addEventListener('video-ended', () => {
    if (!isCompleted) {
      setTimeout(toggleComplete, 1000);
    }
  });
}

// Notes
export function initNotes(lessonId: number, courseId: number) {
  const notesArea = document.getElementById('notesArea') as HTMLTextAreaElement;

  const saveNotes = async () => {
    if (!notesArea) return;
    try {
      const notes = notesArea.value;
      const saveStatus = document.getElementById('saveStatus');

      const response = await fetch(`/api/lessons/${lessonId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, courseId })
      });

      const data = await response.json() as any;

      if (data.success) {
        if (saveStatus) {
          saveStatus.style.display = 'inline';
          setTimeout(() => saveStatus.style.display = 'none', 3000);
        }
      } else {
        alert('Error al guardar notas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar notas');
    }
  };

  let notesTimeout: any;
  if (notesArea) {
    notesArea.addEventListener('input', () => {
      clearTimeout(notesTimeout);
      notesTimeout = setTimeout(saveNotes, 30000);
    });
  }

  const btn = document.getElementById('saveNotesBtn');
  if (btn) {
    btn.addEventListener('click', saveNotes);
  }
}
