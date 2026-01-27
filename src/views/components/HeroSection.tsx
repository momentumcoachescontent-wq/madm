import { PropsWithChildren, Child } from 'hono/jsx'

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  image?: Child
  variant?: 'small' | 'large'
  className?: string
}

export const HeroSection = ({
  title,
  subtitle,
  description,
  image,
  variant = 'small',
  className = '',
  children
}: PropsWithChildren<HeroSectionProps>) => {
  // Prevent duplicate hero classes if passed in className
  const baseClass = variant === 'small' ? 'hero hero-small' : 'hero'
  // If className already contains 'hero', don't duplicate it, but 'hero-small' might be tricky.
  // Easiest is to just append. Tailwind/CSS handles it.

  const combinedClass = `${baseClass} ${className}`.trim()

  if (variant === 'small') {
    return (
      <section className={combinedClass}>
        <div className="container">
          <h1>{title}</h1>
          {subtitle && <p className="lead">{subtitle}</p>}
          {children}
        </div>
      </section>
    )
  }

  return (
    <section className={combinedClass}>
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">{title}</h1>
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
          {description && <p className="hero-description">{description}</p>}
          {children && <div className="hero-buttons">{children}</div>}
        </div>
        {image && <div className="hero-image">{image}</div>}
      </div>
    </section>
  )
}
