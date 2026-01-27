import { PropsWithChildren, Child } from 'hono/jsx'

interface CardProps {
  title?: string
  icon?: string
  iconSize?: string
  iconClass?: string
  className?: string
  footer?: Child
}

export const Card = ({
  title,
  icon,
  iconSize = 'fa-3x',
  iconClass = 'card-icon',
  className = 'card',
  children,
  footer
}: PropsWithChildren<CardProps>) => {
  return (
    <div className={className}>
      {icon && <i className={`${icon} ${iconSize} ${iconClass}`.trim()}></i>}
      {title && <h3>{title}</h3>}
      {children}
      {footer}
    </div>
  )
}
