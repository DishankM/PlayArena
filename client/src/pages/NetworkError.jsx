import { StatusPage } from '../components/common/StatusPage'

export default function NetworkError() {
  return (
    <StatusPage
      eyebrow="Connection issue"
      title="We cannot reach PlayArena right now"
      description="Your connection or the server may be unavailable. Check the network and try again in a moment."
      icon="ti-wifi-off"
      primaryLabel="Retry connection"
      onPrimary={() => window.location.reload()}
      secondaryLabel="Go Home"
      onSecondary={() => {
        window.history.pushState({}, '', '/')
        window.location.reload()
      }}
    />
  )
}
