import { Story } from '../models/stories'
import { HeroSection } from '../../../views/components/HeroSection'
import { sanitizeHtml } from '../../../lib/sanitize'

interface StoryDetailPageProps {
  story: Story
}

export const StoryDetailPage = ({ story }: StoryDetailPageProps) => {
  const safeStory = sanitizeHtml(story.story_text || '')
  const safeAnalysis = sanitizeHtml(story.analysis_text || '')

  const tags = story.tags ? story.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  return (
    <div>
      <HeroSection
        title={story.meta_title || 'Historia'}
        subtitle={`Por ${story.meta_author || 'Anónimo'}`}
        variant="small"
      >
        <div className="mt-2 text-sm opacity-90">
           Publicado el {new Date(story.published_at ?? story.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </HeroSection>

      <section className="section py-12">
        <div className="container max-w-3xl mx-auto px-4">

          {/* Metadata Bar */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
            <a href="/historias" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center">
              <i className="fas fa-arrow-left mr-2"></i> Volver a historias
            </a>
            <div className="flex gap-6 text-slate-500 text-sm">
              <span><i className="fas fa-eye mr-1"></i> {story.views} vistas</span>
              <span><i className="fas fa-heart mr-1" style={{ color: story.likes > 0 ? '#ef4444' : 'inherit' }}></i> {story.likes} likes</span>
            </div>
          </div>

          {/* Story Content */}
          <details open className="mb-6 border border-slate-200 rounded-lg overflow-hidden group">
            <summary className="p-4 bg-slate-50 cursor-pointer font-bold flex items-center select-none hover:bg-slate-100 transition-colors">
              <span className="mr-3 text-xl">📖</span> La Historia
            </summary>
            <div className="p-6 prose prose-slate max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: safeStory }} />
          </details>

          {/* Analysis Content */}
          {safeAnalysis && (
            <details className="mb-8 border border-slate-200 rounded-lg overflow-hidden group">
              <summary className="p-4 bg-blue-50 cursor-pointer font-bold text-blue-800 flex items-center select-none hover:bg-blue-100 transition-colors">
                <span className="mr-3 text-xl">🧠</span> Resultado del Análisis
              </summary>
              <div className="p-6 prose prose-slate max-w-none leading-relaxed bg-white" dangerouslySetInnerHTML={{ __html: safeAnalysis }} />
            </details>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-8 mb-8">
              <h4 className="text-sm uppercase tracking-wide text-slate-500 font-bold mb-3">Temas relacionados:</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <a href={`/historias?tag=${encodeURIComponent(tag)}`} key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm hover:bg-slate-200 transition-colors">
                    #{tag}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Like CTA */}
          <div className="text-center mt-12 p-8 bg-slate-50 rounded-xl">
            <p className="text-lg text-slate-700 mb-6 font-medium">¿Te ha servido esta historia?</p>
            <form action={`/historias/${story.slug}/like`} method="POST">
              <button type="submit" className="btn btn-secondary px-6 py-2">
                <i className="far fa-heart mr-2"></i> Dar Like
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  )
}
