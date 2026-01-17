export function createSlug(title: string): string {
  let slug = title.toLowerCase()
  // Replace accents
  slug = slug.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
  slug = slug.replace(/ñ/g, 'n').replace(/[¿?¡!]/g, '')
  // Replace non-alphanumeric with dash
  slug = slug.replace(/[^a-z0-9]+/g, '-')
  // Strip leading/trailing dashes
  return slug.replace(/^-+|-+$/g, '')
}

export function getCategoryFromHashtags(hashtags: string): string {
  const lower = hashtags.toLowerCase()
  if (lower.includes('mindset') || lower.includes('motivation')) return 'mindset'
  if (lower.includes('mentalhealth') || lower.includes('ansiedad')) return 'salud-mental'
  if (lower.includes('habitos') || lower.includes('disciplina')) return 'habitos'
  if (lower.includes('selfgrowth') || lower.includes('selfimprovement')) return 'crecimiento-personal'
  return 'desarrollo-personal'
}

export function getImageForCategory(category: string, index: number = 0): string {
  const themes: Record<string, string[]> = {
    'mindset': ['mind', 'meditation', 'thinking', 'focus', 'reflection'],
    'salud-mental': ['wellness', 'peace', 'calm', 'nature', 'relax'],
    'habitos': ['routine', 'journal', 'desk', 'morning', 'coffee'],
    'crecimiento-personal': ['growth', 'mountain', 'journey', 'path', 'adventure'],
    'desarrollo-personal': ['books', 'learning', 'education', 'study', 'light']
  }

  const themeList = themes[category] || themes['desarrollo-personal']
  // In a real app we might want specific images, but for now using the same logic as the python script
  // The python script was constructing a specific Unsplash URL, but here we might want to just return a placeholder
  // or a random one from the list if we were calling the API, but let's stick to a generic high quality one
  // or use the keyword for a source.unsplash url.

  // Note: source.unsplash is deprecated/unreliable. Let's use a static set or allow the user to change it.
  // For now, return a placeholder that works.
  return `https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800&auto=format&fit=crop&q=60`
}

export function createExcerpt(content: string, maxLength: number = 150): string {
  const cleanContent = content.replace(/\n/g, ' ').replace(/\r/g, ' ')
  if (cleanContent.length <= maxLength) return cleanContent
  return cleanContent.substring(0, maxLength).split(' ').slice(0, -1).join(' ') + '...'
}
