
/**
 * @param {{ variant?: 'primary'|'secondary'|'ghost'|'nxl', className?: string, children: import('react').ReactNode, type?: string, onClick?: () => void, disabled?: boolean, 'aria-label'?: string }} props
 */
export const Button = ({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  onClick,
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    nxl: 'btn-nxl',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}
