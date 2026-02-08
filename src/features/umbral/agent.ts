
import { CloudflareBindings } from '../../types'
import { searchStories, getPublicStoryBySlug } from '../stories/models/stories'
import { listPublishedCourses } from '../courses/models/courses'

export interface AgentMessage {
    role: 'system' | 'user' | 'assistant' | 'tool'
    content: string | null
    tool_calls?: any[]
    tool_call_id?: string
    name?: string
}

const SYSTEM_PROMPT = `
Eres "El Umbral de la Verdad", una IA diseñada para el diagnóstico de sombra radical. No eres un asistente servicial; eres un espejo implacable.

### TU CÓDIGO DE HONOR:
1.  **No consueles**: El consuelo adormece. La verdad despierta.
2.  **Busca la proyección**: Si el usuario culpa a otros, muéstrale dónde es él el tirano.
3.  **Usa el "Nosotros"**: Conecta su dolor con el dolor colectivo usando la herramienta \`search_stories\`.
4.  **Provoca la acción**: No des consejos teóricos. Da "Decretos de Poder" y "Totems de Miedo" (descripciones visuales).

### TU PROCESO DE DIAGNÓSTICO:

**FASE 1: LA CONFESIÓN (Input del Usuario)**
Escucha su historia. Detecta las palabras clave de su dolor (ej: "traición", "fracaso", "soledad").

**FASE 2: EL REFLEJO (Uso de Herramientas)**
*   INVOCA \`search_stories\` con esas palabras clave.
*   Si encuentras historias similares, diles: "No eres único en tu dolor. Mira cómo otros han sangrado igual..." y cita fragmentos anónimos.

**FASE 3: LA CIRUGÍA (El Análisis)**
Identifica su **Herida Primaria** y su **Beneficio Oculto** (¿Qué ganan al mantener este problema? ej: atención, seguridad, inocencia).

**FASE 4: LA PRESCRIPCIÓN**
*   **Shadow Map**: Define su miedo y su deseo en una frase.
*   **Fear Totem**: Describe una imagen que represente su miedo.
*   **El Camino**: Recomienda un curso específico usando la herramienta \`list_courses\`.

### FORMATO DE RESPUESTA:
Usa Markdown. Sé solemne pero moderno. Habla como un oráculo cyberpunk.
`

const TOOLS = [
    {
        type: 'function',
        function: {
            name: 'search_stories',
            description: 'Busca historias de otros usuarios que coincidan con temas o palabras clave emocionales.',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Palabras clave emocionales' },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_story',
            description: 'Recupera el contenido completo de una historia específica por su slug.',
            parameters: {
                type: 'object',
                properties: {
                    slug: { type: 'string', description: 'El identificador único (slug)' },
                },
                required: ['slug'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'list_courses',
            description: 'Lista los cursos disponibles en la plataforma para recomendar uno.',
            parameters: {
                type: 'object',
                properties: {},
            },
        },
    },
]

// --- OpenAI Client ---

async function callOpenAI(env: CloudflareBindings, messages: any[], tools: any[]) {
    if (!env.OPENAI_API_KEY) throw new Error('MISSING_KEY: OpenAI Key not found');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: messages,
            tools: tools,
            tool_choice: 'auto',
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;
        throw new Error(`OPENAI_ERROR: ${status} - ${errorText}`);
    }

    const data: any = await response.json();
    return data.choices[0].message;
}

// --- Gemini Client (REST) ---

async function callGemini(env: CloudflareBindings, messages: any[], tools: any[]) {
    if (!env.GEMINI_API_KEY) throw new Error('MISSING_KEY: Gemini Key not found');

    let geminiContents: any[] = [];
    let systemInstructionText = "";

    for (const m of messages) {
        if (m.role === 'system') {
            systemInstructionText += m.content + "\n";
        } else if (m.role === 'user') {
            geminiContents.push({ role: 'user', parts: [{ text: m.content }] });
        } else if (m.role === 'assistant') {
            geminiContents.push({ role: 'model', parts: [{ text: m.content || " " }] });
        } else if (m.role === 'tool') {
            // Simplified tool handling for fallback
            geminiContents.push({
                role: 'function',
                parts: [{
                    functionResponse: {
                        name: m.name || 'unknown_tool',
                        response: { content: m.content }
                    }
                }]
            });
        }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

    const geminiTools = {
        function_declarations: tools.map(t => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters
        }))
    };

    const body: any = {
        contents: geminiContents,
        systemInstruction: { parts: [{ text: systemInstructionText || SYSTEM_PROMPT }] },
        tools: [geminiTools],
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GEMINI_ERROR: ${response.status} - ${errorText}`);
    }

    const data: any = await response.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content;

    const resultMessage: any = { role: 'assistant', content: null, tool_calls: [] };

    if (content?.parts) {
        for (const part of content.parts) {
            if (part.text) {
                resultMessage.content = (resultMessage.content || "") + part.text;
            }
            if (part.functionCall) {
                resultMessage.tool_calls.push({
                    id: 'gemini_call_' + Math.random().toString(36).substr(2, 9),
                    function: {
                        name: part.functionCall.name,
                        arguments: JSON.stringify(part.functionCall.args)
                    },
                    type: 'function'
                });
            }
        }
    }

    return resultMessage;
}


// --- Main Agent Logic ---

export async function runAgent(
    env: CloudflareBindings,
    history: AgentMessage[]
): Promise<AgentMessage> {

    const messages: any[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map(m => ({
            role: m.role,
            content: m.content,
            tool_calls: m.tool_calls,
            tool_call_id: m.tool_call_id,
            name: m.name
        }))
    ]

    let turns = 0
    const maxTurns = 5

    while (turns < maxTurns) {
        turns++

        let message: any;

        // --- Provider Fallback Logic: SAVINGS MODE (Gemini First) ---
        try {
            // Try Gemini (Cheaper/Free Tier) FIRST
            console.log('Trying Gemini (Savings Mode)...');
            message = await callGemini(env, messages, TOOLS);
        } catch (e: any) {
            console.warn(`Gemini Failed (${e.message}). Switching to OpenAI Fallback...`);
            try {
                // Fallback to OpenAI (More Expensive) ONLY if Gemini fails
                message = await callOpenAI(env, messages, TOOLS);
            } catch (openaiError: any) {
                // Return graceful failure message if BOTH fail
                console.error(`ALL_ORACLES_FAILED: Gemini (${e.message}) | OpenAI (${openaiError.message})`);
                return {
                    role: 'assistant',
                    content: `**El Silencio ha caído.**\n\nMis oráculos están momentáneamente cegados por la niebla (Error de Conexión o Límites de Energía).\n\nNo fuerces la puerta ahora. *Respira. Reflexiona.* E inténtalo de nuevo más tarde, cuando la marea baje.`
                };
            }
        }

        // Add assistant message to history (for next turn)
        messages.push(message)

        // Check for tool calls
        if (message.tool_calls && message.tool_calls.length > 0) {
            // Execute tools
            for (const toolCall of message.tool_calls) {
                const fnName = toolCall.function.name
                const argsStr = toolCall.function.arguments
                let result = ''

                try {
                    const args = typeof argsStr === 'string' ? JSON.parse(argsStr) : argsStr;

                    if (fnName === 'search_stories') {
                        const stories = await searchStories(env.DB, { query: args.query, limit: 3 })
                        result = JSON.stringify(stories.map(s => ({
                            slug: s.slug,
                            title: s.meta_title,
                            excerpt: s.excerpt
                        })))
                    } else if (fnName === 'get_story') {
                        const story = await getPublicStoryBySlug(env.DB, args.slug)
                        result = story ? JSON.stringify({
                            title: story.meta_title,
                            text: story.story_text,
                            analysis: story.analysis_text
                        }) : 'Historia no encontrada.'
                    } else if (fnName === 'list_courses') {
                        const courses = await listPublishedCourses(env.DB, { columns: ['title', 'slug', 'description'] })
                        result = JSON.stringify(courses)
                    } else {
                        result = 'Herramienta desconocida.'
                    }
                } catch (e: any) {
                    result = `Error ejecutando herramienta: ${e.message}`
                }

                // Add tool result to history
                messages.push({
                    role: 'tool', // OpenAI uses 'tool', Gemini 'function'
                    tool_call_id: toolCall.id,
                    name: fnName, // Important for Gemini mapping context if we loop back
                    content: result
                })
            }
            // Loop again to give LLM the tool results
        } else {
            // No tool calls, return final response
            return {
                role: 'assistant',
                content: message.content
            }
        }
    }

    return {
        role: 'assistant',
        content: 'Discúlpame, me he perdido en mis propios pensamientos. Inténtalo de nuevo.'
    }
}
