import { Story } from '../models/stories'
import { HeroSection } from '../../../views/components/HeroSection'

interface StoriesListPageProps {
  stories: Story[]
  page: number
  hasMore: boolean
  tag?: string
}

export const StoriesListPage = ({ stories, page, hasMore, tag }: StoriesListPageProps) => {
  return (
    <div>
      <HeroSection
        title="Historias de la Comunidad"
        subtitle="Experiencias reales, superación y aprendizaje compartido."
        variant="small"
      />

      <section className="section py-12">
        <div className="container mx-auto px-4">

          {tag && (
            <div className="mb-6">
              Mostrando resultados para: <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold ml-2">{tag}</span>
              <a href="/historias" className="ml-3 text-sm underline text-slate-600 hover:text-slate-800">Ver todas</a>
            </div>
          )}

          {stories.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <p className="text-xl text-slate-600 mb-6">Aún no hay historias publicadas{tag ? ' con este tag' : ''}.</p>
              <a href="/comparte-tu-historia" className="btn btn-primary">Comparte la tuya</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {stories.map(story => (
                <div key={story.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                  {story.thumbnail_url && (
                    <div className="h-48 overflow-hidden">
                      <img src={story.thumbnail_url} alt={story.meta_title ?? 'Historia'} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-xs text-slate-500 mb-2">
                      {new Date(story.published_at ?? story.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800 leading-tight">
                      <a href={`/historias/${story.slug}`} className="hover:text-violet-600 transition-colors">
                        {story.meta_title || 'Historia sin título'}
                      </a>
                    </h3>
                    {story.excerpt && (
                      <p className="text-slate-600 text-sm flex-1 mb-4 line-clamp-3">{story.excerpt}</p>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 mt-auto">
                      <span><i className="fas fa-eye mr-1"></i> {story.views}</span>
                      <span><i className="fas fa-heart mr-1"></i> {story.likes}</span>
                    </div>

                    {story.tags && (
                       <div className="mt-3 flex flex-wrap gap-2">
                         {story.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(t => (
                           <a href={`/historias?tag=${encodeURIComponent(t)}`} key={t} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs hover:bg-slate-200 transition-colors no-underline">#{t}</a>
                         ))}
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 flex justify-center gap-4">
            {page > 1 && (
              <a href={`/historias?page=${page - 1}${tag ? `&tag=${tag}` : ''}`} className="btn btn-secondary">
                <i className="fas fa-chevron-left mr-2"></i> Anterior
              </a>
            )}
            {hasMore && (
              <a href={`/historias?page=${page + 1}${tag ? `&tag=${tag}` : ''}`} className="btn btn-secondary">
                Siguiente <i className="fas fa-chevron-right ml-2"></i>
              </a>
            )}
          </div>

        </div>
      </section>
    </div>
  )
}
