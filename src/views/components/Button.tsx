import { PropsWithChildren } from 'hono/jsx'

interface ButtonProps {
  href?: string
  variant?: 'primary' | 'secondary' | 'outline-light' | 'light' | 'success' | 'danger' | 'outline' | null
  size?: 'sm' | 'lg'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  id?: string
  target?: string
  rel?: string
  onclick?: string
}

export const Button = ({
  href,
  variant = 'primary',
  size,
  className = '',
  children,
  type = 'button',
  ...props
}: PropsWithChildren<ButtonProps>) => {
  const sizeClass = size ? `btn-${size}` : ''
  const variantClass = variant ? `btn-${variant}` : ''
  const classes = `btn ${variantClass} ${sizeClass} ${className}`.trim()

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
