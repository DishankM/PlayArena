import { StatusPage } from '../components/common/StatusPage'

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="404"
      title="Page not found"
      description="The page you are looking for does not exist or may have moved. Head back home and continue from there."
      icon="ti-map-off"
      primaryLabel="Back to Home"
      primaryTo="/"
    />
  )
}
