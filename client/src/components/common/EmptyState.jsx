// client/src/components/common/EmptyState.jsx
const EmptyState = ({
  icon = 'ti-mood-empty',
  title,
  description,
  actionLabel,
  onAction,
  tone = 'light',
}) => {
  const isDark = tone === 'dark'

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${isDark ? 'bg-white/5' : 'bg-arena-surface'}`}>
        <i className={`ti ${icon} text-4xl ${isDark ? 'text-gray-500' : 'text-gray-300'}`} aria-hidden="true" />
      </div>
      <h3 className={`${isDark ? 'text-xl font-bold text-white' : 'text-h3'} mb-2`}>{title}</h3>
      {description && (
        <p className={`max-w-xs text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className={isDark ? 'mt-6 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-2.5 font-semibold text-white transition-all hover:scale-[1.02]' : 'btn-primary mt-6'}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export { EmptyState }
