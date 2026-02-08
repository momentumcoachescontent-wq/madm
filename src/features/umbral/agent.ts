
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
                    query: {
                        type: 'string',
                        description: 'Palabras clave emocionales (ej: "traición", "miedo al éxito")',
                    },
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
                    slug: {
                        type: 'string',
                        description: 'El identificador único (slug) de la historia.',
                    },
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

export async function runAgent(
    env: CloudflareBindings,
    history: AgentMessage[]
): Promise<AgentMessage> {
    if (!env.OPENAI_API_KEY) {
        throw new Error('CONFIG_ERROR: OPENAI_API_KEY no está configurada.')
    }

    // Deep copy history and add system prompt
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

        // 1. Call OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: messages,
                tools: TOOLS,
                tool_choice: 'auto',
                temperature: 0.7
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`OpenAI Error: ${response.status} - ${errorText}`)
        }

        const data: any = await response.json()
        const choice = data.choices[0]
        const message = choice.message

        // Add assistant message to history (for next turn)
        messages.push(message)

        // 2. Check for tool calls
        if (message.tool_calls && message.tool_calls.length > 0) {
            // Execute tools
            for (const toolCall of message.tool_calls) {
                const fnName = toolCall.function.name
                const argsStr = toolCall.function.arguments
                let result = ''

                try {
                    const args = JSON.parse(argsStr)

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
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: result
                })
            }
            // Loop again to give OpenAI the tool results
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
