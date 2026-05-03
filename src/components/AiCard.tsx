type AiCardProps = {
  icon: string
  label: string
  heading: string
}

function AiCardIcon({ icon }: { icon: string }) {
  return (
    <div className="ai_icon" aria-hidden="true">
      <span>{icon}</span>
    </div>
  )
}

function AiCardCopy({ label, heading }: { label: string; heading: string }) {
  return (
    <div className="ai_copy">
      <p>{label}</p>
      <h2>{heading}</h2>
    </div>
  )
}

function AiCardCameraButton() {
  return (
    <button className="camera_button" type="button" aria-label="카메라">
      📷
    </button>
  )
}

export default function AiCard({ icon, label, heading }: AiCardProps) {
  return (
    <section className="ai_card">
      <AiCardIcon icon={icon} />
      <AiCardCopy label={label} heading={heading} />
      <AiCardCameraButton />
    </section>
  )
}
