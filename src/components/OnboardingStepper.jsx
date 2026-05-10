const statusIcon = (status) => {
  if (status === 'complete') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  if (status === 'warning') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
  return null
}

const OnboardingStepper = ({ steps }) => {
  const completedCount = steps.filter((s) => s.status === 'complete').length
  const activeIndex = steps.findIndex((s) => s.status !== 'complete')
  const progress = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="card stepper-card">
      <div className="panel-header">
        <div>
          <h2>Onboarding flow</h2>
          <p>{completedCount} of {steps.length} steps completed · {progress}% done</p>
        </div>
        <span className="badge badge-success">Active</span>
      </div>

      <div className="h-stepper">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const isCurrent = index === activeIndex
          const segmentFilled = index < completedCount

          return (
            <div key={step.title} className="h-step-wrapper">
              {/* Step node */}
              <div className={`h-step ${step.status}`}>
                <div className={`h-step-circle h-step-circle--${step.status} ${isCurrent ? 'h-step-circle--current' : ''}`}>
                  {statusIcon(step.status) ?? <span>{index + 1}</span>}
                </div>
                <div className="h-step-label">
                  <span className="h-step-title">{step.title}</span>
                  <span className={`badge badge-${step.status} h-step-badge`}>{step.label}</span>
                </div>
                <p className="h-step-desc">{step.description}</p>
              </div>

              {/* Connector line between steps */}
              {!isLast && (
                <div className="h-connector">
                  <div className={`h-connector-fill ${segmentFilled ? 'h-connector-fill--done' : ''}`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OnboardingStepper
