import { Story } from '../models/stories'
import { HeroSection } from '../../../views/components/HeroSection'

interface ShareStoryPageProps {
  stories?: Story[]
}

export const ShareStoryPage = ({ stories = [] }: ShareStoryPageProps) => {
  return (
    <div>
      <HeroSection
        title="Comparte tu Historia"
        subtitle="Lee experiencias de otros y comparte la tuya."
        variant="small"
      />

      {/* Stories Section (Top) */}
      <section className="section py-12 bg-slate-50">
        <div className="container mx-auto px-4">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold text-slate-800">Historias Recientes</h2>
             <a href="/historias" className="text-violet-600 hover:text-violet-800 font-medium">Ver todas <i className="fas fa-arrow-right ml-1"></i></a>
           </div>

           {stories.length > 0 ? (
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
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-center text-slate-500">No hay historias recientes para mostrar.</p>
           )}
        </div>
      </section>

      {/* Submission Form Section (Bottom) */}
      <section className="section py-12">
        <div className="container mx-auto px-4" style={{ maxWidth: '800px' }}>
          <div className="card" style={{ padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Escribe tu Historia</h2>
            <p className="text-center text-slate-600 mb-8">
              Comparte tu experiencia con la comunidad. Tu historia puede ayudar a otros.
            </p>

            <form action="/comparte-tu-historia" method="POST">
              <div className="mb-6">
                <label htmlFor="story_text" className="block text-sm font-medium text-slate-700 mb-2">
                  Tu Historia
                </label>
                <textarea
                  id="story_text"
                  name="story_text"
                  rows={15}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                  placeholder="Escribe aquí tu historia..."
                  required
                ></textarea>
              </div>

              <div className="flex justify-center">
                <button type="submit" className="btn btn-primary btn-lg">
                  <i className="fas fa-paper-plane mr-2"></i> Enviar Historia
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
