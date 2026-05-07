import { useState } from 'react'
import './App.css'
import TopNavigation from './components/TopNavigation'
import DashboardHeader from './components/DashboardHeader'
import OnboardingStepper from './components/OnboardingStepper'
import DocumentUploadPanel from './components/DocumentUploadPanel'
import ChatAssistant from './components/ChatAssistant'
import PolicyFaq from './components/PolicyFaq'

const onboardingSteps = [
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
    name: 'ID proof',
    hint: 'Passport, driver\'s license, or national ID — all four corners must be visible.',
    status: 'success',
    label: 'Verified',
  },
  {
    name: 'Employment form',
    hint: 'Signed offer letter and W-4 or local tax form.',
    status: 'warning',
    label: 'Needs review',
  },
  {
    name: 'Proof of address',
    hint: 'Recent utility bill or bank statement (dated within 3 months).',
    status: 'warning',
    label: 'Missing',
  },
  {
    name: 'Certification files',
    hint: 'Any required professional certificates relevant to your role.',
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

const missingDocs = requiredDocuments.filter((d) => d.status === 'warning' || d.status === 'pending')

function App() {
  const [alertDismissed, setAlertDismissed] = useState(false)

  return (
    <div className="app-container">
      <TopNavigation userName="Thulasi Chellamuthu" />

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
          <div className="left-column">
            <DocumentUploadPanel documents={requiredDocuments} />
          </div>

          <ChatAssistant />
        </div>

        <PolicyFaq faqs={policyFaqs} />
      </div>
    </div>
  )
}

export default App
