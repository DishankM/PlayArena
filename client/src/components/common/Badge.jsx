// client/src/components/common/Badge.jsx

/**
 * @param {{ variant?: string, className?: string, children: import('react').ReactNode }} props
 */
export const Badge = ({ variant = '', className = '', children }) => (
  <span className={`badge ${variant} ${className}`.trim()}>{children}</span>
)
