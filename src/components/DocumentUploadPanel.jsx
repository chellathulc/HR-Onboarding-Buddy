import { useState, useRef, useEffect } from 'react'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const DocumentItem = ({ doc, isUploadEnabled, externalDocumentState, onRemoveExternalFile }) => {
  const [status, setStatus] = useState(doc.status)
  const [label, setLabel] = useState(doc.label)
  const [fileName, setFileName] = useState(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const processFile = (file) => {
    setError(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus('warning')
      setLabel('Invalid type')
      setError('Only PDF, JPG, or PNG files are accepted.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setStatus('warning')
      setLabel('Too large')
      setError(`File exceeds ${MAX_SIZE_MB} MB limit.`)
      return
    }
    setFileName(file.name)
    setStatus('success')
    setLabel('Verified')
  }

  const resetItem = () => {
    setStatus(doc.status)
    setLabel(doc.label)
    setFileName(null)
    setError(null)
    setIsDragging(false)
  }

  useEffect(() => {
    if (!externalDocumentState) {
      resetItem()
      return
    }
    setStatus(externalDocumentState.status)
    setLabel(externalDocumentState.label)
    setFileName(externalDocumentState.fileName || null)
    setError(null)
  }, [externalDocumentState, doc.label, doc.status])

  const handleDrop = (e) => {
    e.preventDefault()
    if (!isUploadEnabled) return
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e) => {
    if (!isUploadEnabled) return
    const file = e.target.files[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleRemoveFile = () => {
    resetItem()
    onRemoveExternalFile?.()
  }

  const isVerified = status === 'success'
  const isDisabled = !isUploadEnabled && !isVerified
  const isUploading = status === 'info'

  return (
    <div
      className={`document-item ${isDragging ? 'document-item--dragging' : ''} ${isDisabled ? 'document-item--disabled' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        if (isDisabled) return
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="document-info">
        <h3>{doc.name}</h3>
        {fileName ? (
          <div className="document-filename-row">
            <p className="document-filename">📎 {fileName}</p>
            <button
              type="button"
              className="document-remove-btn"
              onClick={handleRemoveFile}
              aria-label="Remove uploaded document"
              title="Remove file"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                <path
                  d="M4 7h16M9 7V5h6v2m-8 0 1 12h8l1-12M10 11v6M14 11v6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <p>{doc.hint}</p>
        )}
        {error && <p className="document-error">⚠ {error}</p>}
        {isDragging && <p className="document-drag-hint">Drop to upload</p>}
      </div>
      <div className="document-status">
        <span className={`badge badge-${status}`}>{label}</span>
        {isUploadEnabled && (
          <button
            type="button"
            className={`upload-button ${isUploading ? 'upload-button--loading' : ''}`}
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? 'UPLOADING' : 'Upload'}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

const DocumentUploadPanel = ({
  documents,
  isPanelDisabled,
  enabledDocumentNames = [],
  documentMetaByName = {},
  isChatConfirmed,
  onRemoveGovernmentId,
  onRemovePassport,
  onRemoveAddressProof,
  onRemoveCertification,
}) => (
  <div className={`card document-panel ${isPanelDisabled ? 'document-panel--disabled' : ''}`}>
    <div className="panel-header">
      <div>
        <h2>Document validation</h2>
        <p>Drag & drop or click Upload. Files are validated instantly.</p>
      </div>
      <span className="badge badge-info">Auto-check</span>
    </div>

    <div className="document-list">
      {documents.map((doc) => (
        <DocumentItem
          key={doc.name}
          doc={doc}
          isUploadEnabled={enabledDocumentNames.includes(doc.name)}
          externalDocumentState={documentMetaByName[doc.name]}
          onRemoveExternalFile={
            doc.name === 'Government ID proof'
              ? onRemoveGovernmentId
              : doc.name === 'Passport'
                ? onRemovePassport
                : doc.name === 'Proof of address'
                  ? onRemoveAddressProof
                  : doc.name === 'Certification files'
                    ? onRemoveCertification
                : undefined
          }
        />
      ))}
    </div>

    <p className="document-note">
      {!isChatConfirmed
        ? 'Chat with your onboarding buddy and confirm you are ready to unlock upload.'
        : isPanelDisabled
          ? 'Use Upload Documents in AI Chat to submit the requested file. Only the current step is unlocked.'
          : `Accepted: PDF, JPG, PNG · Max ${MAX_SIZE_MB} MB · Current document step is active.`}
    </p>
  </div>
)

export default DocumentUploadPanel
