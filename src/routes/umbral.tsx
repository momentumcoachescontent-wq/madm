
import { Hono } from 'hono'
import { CloudflareBindings } from '../types'
import { runAgent, AgentMessage } from '../features/umbral/agent'
import { html } from 'hono/html'

export function registerUmbralRoutes(app: Hono<{ Bindings: CloudflareBindings }>) {

  // UI Route - Mounted directly on /umbral
  app.get('/umbral', (c) => {
    return c.html(html`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>El Umbral de la Verdad</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
          :root {
            --bg-color: #0f172a;
            --chat-bg: #1e293b;
            --accent: #8b5cf6;
            --system-msg: #334155;
            --user-msg: #4c1d95;
          }
          body {
            background-color: var(--bg-color);
            color: #e2e8f0;
            font-family: 'Inter', sans-serif;
            height: 100vh;
            display: flex;
            flex-direction: column;
            margin: 0;
          }
          .font-mystic {
            font-family: 'Cinzel', serif;
          }
          .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-width: 900px;
            margin: 0 auto;
            width: 100%;
          }
          .message {
            max-width: 80%;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            line-height: 1.6;
            animation: fadeIn 0.3s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .message.assistant {
            align-self: flex-start;
            background-color: var(--chat-bg);
            border-left: 3px solid var(--accent);
          }
          .message.user {
            align-self: flex-end;
            background-color: var(--user-msg);
            color: white;
          }
          .input-area {
            background-color: var(--chat-bg);
            padding: 1.5rem;
            border-top: 1px solid #334155;
          }
          .input-container {
            max-width: 900px;
            margin: 0 auto;
            position: relative;
            display: flex;
            gap: 10px;
          }
          textarea {
            width: 100%;
            background-color: #0f172a;
            border: 1px solid #334155;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            resize: none;
            height: 60px;
            font-family: inherit;
          }
          textarea:focus {
            border-color: var(--accent);
            outline: none;
          }
          .send-btn {
            background: var(--accent);
            border: none;
            color: white;
            padding: 0 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .send-btn:hover {
            background: #7c3aed;
          }
          .typing {
            font-size: 0.8rem;
            color: #94a3b8;
            margin-top: 0.5rem;
            font-style: italic;
            opacity: 0;
            transition: opacity 0.3s;
            text-align: center;
          }
          .typing.active {
            opacity: 1;
          }
          .prose h1, .prose h2, .prose h3 { color: #f8fafc; font-family: 'Cinzel', serif; margin-top: 0.5em; margin-bottom: 0.5em; }
          .prose p { margin-bottom: 0.5em; }
          .prose ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
          .prose strong { color: #a78bfa; font-weight: bold; }
          .prose blockquote { border-left: 3px solid #475569; padding-left: 1em; color: #94a3b8; font-style: italic; margin: 1em 0; }
        </style>
      </head>
      <body>

        <header class="p-6 text-center border-b border-slate-800 bg-slate-900">
          <h1 class="text-3xl font-mystic text-violet-400">El Umbral de la Verdad</h1>
          <p class="text-slate-500 text-sm mt-2">No busques consuelo. Busca despertar.</p>
        </header>

        <div id="chat-box" class="chat-container">
          <div class="message assistant">
            <div class="prose">
              <p>Adelante. Deja tus máscaras en la puerta. ¿Qué verdad vienes a evitar hoy?</p>
            </div>
          </div>
        </div>

        <div class="input-area">
          <div id="typing-indicator" class="typing mb-2">El Umbral contempla...</div>
          <div class="input-container">
            <textarea id="user-input" placeholder="Escribe tu confesión..." onkeydown="handleEnter(event)"></textarea>
            <button class="send-btn" onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>

        <script>
          const chatBox = document.getElementById('chat-box');
          const userInput = document.getElementById('user-input');
          const typingIndicator = document.getElementById('typing-indicator');
          
          let conversationHistory = []; 

          function handleEnter(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }

          async function sendMessage() {
            const text = userInput.value.trim();
            if (!text) return;

            addMessage('user', text);
            userInput.value = '';
            
            typingIndicator.classList.add('active');
            chatBox.scrollTop = chatBox.scrollHeight;

            try {
              // Current turn
              const currentTurn = { role: 'user', content: text };
              
              const response = await fetch('/api/umbral/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                   history: [...conversationHistory, currentTurn] 
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el oráculo (' + response.status + ')');
              }

              const data = await response.json();
              if (data.error) throw new Error(data.error);
              
              addMessage('assistant', data.content);
              
              conversationHistory.push(currentTurn);
              conversationHistory.push({ role: 'assistant', content: data.content });

            } catch (err) {
              console.error(err);
              addMessage('assistant', '**El Silencio Responde:** Hubo un error de conexión.\\n\\n\`' + err.message + '\`');
            } finally {
              typingIndicator.classList.remove('active');
              chatBox.scrollTop = chatBox.scrollHeight;
            }
          }

          function addMessage(role, text) {
            const div = document.createElement('div');
            div.className = 'message ' + role;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'prose';
            
            if (role === 'assistant') {
              contentDiv.innerHTML = marked.parse(text);
            } else {
              contentDiv.textContent = text;
            }

            div.appendChild(contentDiv);
            chatBox.appendChild(div);
          }
        </script>
      </body>
      </html>
    `)
  })

  // API Route - Mounted directly on /api/umbral/chat to avoid path ambiguity
  app.post('/api/umbral/chat', async (c) => {
    try {
      const body = await c.req.json()
      // Logic handled in agent.ts
      const response = await runAgent(c.env, body.history || [])
      return c.json(response)
    } catch (e: any) {
      console.error('Umbral Agent Error:', e);
      return c.json({ error: e.message || 'Error interno del agente' }, 500)
    }
  })
}
