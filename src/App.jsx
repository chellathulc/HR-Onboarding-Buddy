import { useState } from 'react'
import './App.css'
import TopNavigation from './components/TopNavigation'
import DashboardHeader from './components/DashboardHeader'
import OnboardingStepper from './components/OnboardingStepper'
import DocumentUploadPanel from './components/DocumentUploadPanel'
import ChatAssistant from './components/ChatAssistant'
import PolicyFaq from './components/PolicyFaq'

const GOVERNMENT_ID_DOC_NAME = 'Government ID proof'
const PASSPORT_DOC_NAME = 'Passport'
const PROOF_OF_ADDRESS_DOC_NAME = 'Proof of address'
const CERTIFICATION_DOC_NAME = 'Certification files'
const DOCUMENT_TARGET_ORDER = ['government', 'passport', 'address', 'certification']

const onboardingStepsTemplate = [
  {
    title: 'Collect personal details',
    description: 'Capture name, contact, role, and team details from the joinee.',
    status: 'complete',
    label: 'Complete',
  },
  {
    title: 'Verify documents',
    description: 'Confirm identity, tax forms, and compliance paperwork are uploaded and valid.',
    status: 'warning',
    label: 'Review',
  },
  {
    title: 'Schedule orientation',
    description: 'Arrange the first-day agenda, team introduction, and mandatory training sessions.',
    status: 'pending',
    label: 'Pending',
  },
  {
    title: 'Answer policy questions',
    description: 'Provide instant guidance on benefits, leave, expenses, and company culture.',
    status: 'pending',
    label: 'Pending',
  },
]

const requiredDocuments = [
  {
    name: GOVERNMENT_ID_DOC_NAME,
    hint: 'Upload a government-issued ID (Driving License, Green Card, or Ration Card).',
    status: 'pending',
    label: 'Upload',
  },
  {
    name: PASSPORT_DOC_NAME,
    hint: 'Upload your passport copy (photo page).',
    status: 'pending',
    label: 'Upload',
  },
  {
    name: PROOF_OF_ADDRESS_DOC_NAME,
    hint: 'Recent utility bill or bank statement (dated within 3 months).',
    status: 'pending',
    label: 'Upload',
  },
  {
    name: CERTIFICATION_DOC_NAME,
    hint: 'Upload your college certificates (degree/provisional/marksheet).',
    status: 'pending',
    label: 'Upload',
  },
]

const policyFaqs = [
  {
    question: 'How do I request vacation or leave?',
    answer: 'Submit a leave request through the HR portal at least 10 days before your planned absence. Annual leave accrues at 1.5 days per month from day one.',
  },
  {
    question: 'What healthcare benefits do I get?',
    answer: 'Medical, dental, and vision plans are available. Coverage begins on the first of the month following your start date. You can choose from three tier options in the benefits portal.',
  },
  {
    question: 'Can I work remotely?',
    answer: 'Most roles support hybrid work after the first 30 days. Your manager will confirm the schedule. A home office allowance of $500 is available for eligible roles.',
  },
  {
    question: 'When and how is payroll processed?',
    answer: 'Payroll runs on the 25th of each month. Set up direct deposit in the employee portal under "Banking". First-month pay may be prorated based on your start date.',
  },
  {
    question: 'How do I submit expenses?',
    answer: 'Expenses up to $50 are self-approved. Anything above that requires manager sign-off. Submit within 30 days of incurring the cost via the Expense module.',
  },
  {
    question: 'What mandatory training do I need to complete?',
    answer: 'All new hires must complete security awareness, code of conduct, and data privacy training within the first 30 days. Access your Learning Hub dashboard to view and track progress.',
  },
]

function App() {
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [activeUploadDocument, setActiveUploadDocument] = useState(null)
  const [verificationEvent, setVerificationEvent] = useState(null)
  const [documentRemovalEvent, setDocumentRemovalEvent] = useState(null)
  const [documentStates, setDocumentStates] = useState({
    [GOVERNMENT_ID_DOC_NAME]: { status: 'pending', label: 'Upload', fileName: null },
    [PASSPORT_DOC_NAME]: { status: 'pending', label: 'Upload', fileName: null },
    [PROOF_OF_ADDRESS_DOC_NAME]: { status: 'pending', label: 'Upload', fileName: null },
    [CERTIFICATION_DOC_NAME]: { status: 'pending', label: 'Upload', fileName: null },
  })
  const userName = 'Thulasi Chellamuthu'

  const handleReadyForDocument = (target) => {
    const panel = document.getElementById('document-validation-panel')
    panel?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const getStatusByTarget = (states) => ({
    government: states[GOVERNMENT_ID_DOC_NAME]?.status,
    passport: states[PASSPORT_DOC_NAME]?.status,
    address: states[PROOF_OF_ADDRESS_DOC_NAME]?.status,
    certification: states[CERTIFICATION_DOC_NAME]?.status,
  })

  const getNextTargetAfter = (target, states) => {
    const statusByTarget = getStatusByTarget(states)
    const currentIndex = DOCUMENT_TARGET_ORDER.indexOf(target)
    if (currentIndex < 0) return null
    for (let i = currentIndex + 1; i < DOCUMENT_TARGET_ORDER.length; i += 1) {
      const candidate = DOCUMENT_TARGET_ORDER[i]
      if (statusByTarget[candidate] !== 'success') return candidate
    }
    return null
  }

  const handleUploadDocument = (target, file) => {
    const docName = target === 'passport'
      ? PASSPORT_DOC_NAME
      : target === 'address'
        ? PROOF_OF_ADDRESS_DOC_NAME
        : target === 'certification'
          ? CERTIFICATION_DOC_NAME
        : GOVERNMENT_ID_DOC_NAME
    setActiveUploadDocument(docName)
    setDocumentStates((prev) => ({
      ...prev,
      [docName]: { status: 'info', label: 'Parsing...', fileName: file.name },
    }))

    window.setTimeout(() => {
      const updatedStates = {
        ...documentStates,
        [docName]: { status: 'success', label: 'Verified', fileName: file.name },
      }
      setDocumentStates(updatedStates)
      setActiveUploadDocument(null)
      setVerificationEvent({
        id: Date.now(),
        target,
        nextTarget: getNextTargetAfter(target, updatedStates),
        docName,
        fileName: file.name,
        fields: target === 'passport'
          ? {
              'Document Name': 'Passport',
              Name: 'Thulasi Chellamuthu',
              Surname: 'Chellamuthu',
              'Given Name': 'Thulasi',
              Sex: 'F',
              PassportNo: 'N8765432',
              'Place of Issue': 'Chennai',
              'Date of Issue': '12-04-2021',
              'Date of Expiry': '11-04-2031',
              Nationality: 'Indian',
            }
          : target === 'address'
            ? {
                'Document Name': /bank|stmt|statement/i.test(file.name) ? 'Bank Statement' : 'Utility Bill',
                Name: 'Thulasi Chellamuthu',
                Address: '24 Lake View Road, Velachery, Chennai, Tamil Nadu 600042',
              }
          : target === 'certification'
            ? {
                'Document Name': 'College Certificate',
                Name: 'Thulasi Chellamuthu',
                Degree: 'B.E. Computer Science',
                University: 'Anna University',
                YearOfPassing: '2018',
              }
          : {
              'Document Name': 'Driving License',
              Name: 'Thulasi Chellamuthu',
              DOB: '07-05-1997',
              BloodGroup: 'O+',
            },
      })
    }, 1600)
  }

  const handleRemoveDocument = (docName) => {
    setDocumentStates((prev) => ({
      ...prev,
      [docName]: { status: 'pending', label: 'Upload', fileName: null },
    }))
    setActiveUploadDocument(null)
    setDocumentRemovalEvent({
      id: Date.now(),
      docName,
      target: docName === PASSPORT_DOC_NAME
        ? 'passport'
        : docName === PROOF_OF_ADDRESS_DOC_NAME
          ? 'address'
          : docName === CERTIFICATION_DOC_NAME
            ? 'certification'
            : 'government',
    })
  }

  const enabledDocumentNames = activeUploadDocument ? [activeUploadDocument] : []
  const isDocumentPanelDisabled = !activeUploadDocument

  const documentMetaByName = {
    [GOVERNMENT_ID_DOC_NAME]: documentStates[GOVERNMENT_ID_DOC_NAME],
    [PASSPORT_DOC_NAME]: documentStates[PASSPORT_DOC_NAME],
    [PROOF_OF_ADDRESS_DOC_NAME]: documentStates[PROOF_OF_ADDRESS_DOC_NAME],
    [CERTIFICATION_DOC_NAME]: documentStates[CERTIFICATION_DOC_NAME],
  }

  const handleRemoveGovernmentId = () => {
    handleRemoveDocument(GOVERNMENT_ID_DOC_NAME)
  }

  const handleRemovePassport = () => {
    handleRemoveDocument(PASSPORT_DOC_NAME)
  }

  const handleRemoveAddressProof = () => {
    handleRemoveDocument(PROOF_OF_ADDRESS_DOC_NAME)
  }

  const handleRemoveCertification = () => {
    handleRemoveDocument(CERTIFICATION_DOC_NAME)
  }

  const handleScrollToDocuments = () => {
    const panel = document.getElementById('document-validation-panel')
    panel?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const missingDocs = requiredDocuments.filter((doc) => {
    const currentStatus = documentStates[doc.name]?.status ?? doc.status
    return currentStatus === 'warning' || currentStatus === 'pending' || currentStatus === 'info'
  })

  const allDocumentsVerified = requiredDocuments.every(
    (doc) => (documentStates[doc.name]?.status ?? doc.status) === 'success',
  )

  const onboardingSteps = onboardingStepsTemplate.map((step) => {
    if (step.title !== 'Verify documents') return step
    return allDocumentsVerified
      ? {
          ...step,
          status: 'complete',
          label: 'Complete',
        }
      : {
          ...step,
          status: 'warning',
          label: 'Review',
        }
  })

  return (
    <div className="app-container">
      <TopNavigation userName={userName} />

      {!alertDismissed && missingDocs.length > 0 && (
        <div className="alert-banner">
          <span className="alert-icon">⚠</span>
          <span>
            <strong>{missingDocs.length} document{missingDocs.length > 1 ? 's' : ''} need{missingDocs.length === 1 ? 's' : ''} attention:</strong>{' '}
            {missingDocs.map((d) => d.name).join(', ')}. Please upload or correct them to continue onboarding.
          </span>
          <button className="alert-close" onClick={() => setAlertDismissed(true)} aria-label="Dismiss">✕</button>
        </div>
      )}

      <div className="app-shell">
        <DashboardHeader />

        <OnboardingStepper steps={onboardingSteps} />

        <div className="grid-layout">
          <div className="left-column" id="document-validation-panel">
            <DocumentUploadPanel
              documents={requiredDocuments}
              isPanelDisabled={isDocumentPanelDisabled}
              enabledDocumentNames={enabledDocumentNames}
              documentMetaByName={documentMetaByName}
              isChatConfirmed
              onRemoveGovernmentId={handleRemoveGovernmentId}
              onRemovePassport={handleRemovePassport}
              onRemoveAddressProof={handleRemoveAddressProof}
              onRemoveCertification={handleRemoveCertification}
            />
          </div>

          <ChatAssistant
            userName={userName}
            verificationEvent={verificationEvent}
            documentRemovalEvent={documentRemovalEvent}
            onReadyForDocument={handleReadyForDocument}
            onUploadDocument={handleUploadDocument}
            onScrollToDocuments={handleScrollToDocuments}
          />
        </div>

        <PolicyFaq faqs={policyFaqs} />
      </div>
    </div>
  )
}

export default App
