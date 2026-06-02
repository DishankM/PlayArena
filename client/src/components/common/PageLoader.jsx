// client/src/components/common/PageLoader.jsx
const PageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-arena-surface">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-3 border-arena-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  </div>
)

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="flex justify-between mt-4">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
)

const SkeletonEventCard = () => (
  <div className="card animate-pulse">
    <div className="h-36 bg-gray-200 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-2 bg-gray-200 rounded-full w-full mt-3" />
      <div className="flex justify-between mt-4">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
)

const SkeletonRow = ({ cols = 6 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </td>
    ))}
  </tr>
)

export { PageLoader, SkeletonCard, SkeletonEventCard, SkeletonRow }
