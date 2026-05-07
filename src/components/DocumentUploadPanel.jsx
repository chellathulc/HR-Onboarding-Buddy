import { useState, useRef } from 'react'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const DocumentItem = ({ doc }) => {
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

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  return (
    <div
      className={`document-item ${isDragging ? 'document-item--dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="document-info">
        <h3>{doc.name}</h3>
        {fileName
          ? <p className="document-filename">📎 {fileName}</p>
          : <p>{doc.hint}</p>
        }
        {error && <p className="document-error">⚠ {error}</p>}
        {isDragging && <p className="document-drag-hint">Drop to upload</p>}
      </div>
      <div className="document-status">
        <span className={`badge badge-${status}`}>{label}</span>
        <button
          type="button"
          className="upload-button"
          onClick={() => inputRef.current?.click()}
        >
          {status === 'success' ? 'Replace' : 'Upload'}
        </button>
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

const DocumentUploadPanel = ({ documents }) => (
  <div className="card">
    <div className="panel-header">
      <div>
        <h2>Document validation</h2>
        <p>Drag & drop or click Upload. Files are validated instantly.</p>
      </div>
      <span className="badge badge-info">Auto-check</span>
    </div>

    <div className="document-list">
      {documents.map((doc) => (
        <DocumentItem key={doc.name} doc={doc} />
      ))}
    </div>

    <p className="document-note">
      Accepted: PDF, JPG, PNG · Max {MAX_SIZE_MB} MB · Missing or invalid files are flagged in real time.
    </p>
  </div>
)

export default DocumentUploadPanel
