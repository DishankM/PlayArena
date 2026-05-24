
/**
 * @param {{
 *   id: string,
 *   name: string,
 *   label: string,
 *   type?: string,
 *   icon?: string,
 *   value: string,
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void,
 *   error?: string,
 *   placeholder?: string,
 *   autoComplete?: string,
 *   disabled?: boolean,
 *   optional?: boolean,
 *   showToggle?: boolean,
 *   showPassword?: boolean,
 *   onTogglePassword?: () => void,
 * }} props
 */
export const AuthInput = ({
  id,
  name,
  label,
  type = 'text',
  icon = 'ti-user',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete,
  disabled = false,
  optional = false,
  showToggle = false,
  showPassword = false,
  onTogglePassword,
}) => {
  const inputType = showToggle ? (showPassword ? 'text' : 'password') : type
  const hasError = Boolean(error)

  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">
        {label}
        {optional && <span className="font-normal text-gray-400"> (optional)</span>}
      </label>
      <div className={`auth-input-wrap ${hasError ? 'auth-input-wrap--error' : ''}`}>
        <i className={`ti ${icon} auth-input-icon`} aria-hidden="true" />
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className="auth-input"
        />
        {showToggle && onTogglePassword && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onTogglePassword}
            className="auth-input-toggle"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <i
              className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
      {hasError && (
        <p id={`${id}-error`} className="auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
