import { useEffect, useMemo, useState } from 'react'
import App from './App'
import './App.css'

const LOGIN_ROUTE = '/login'
const HOME_ROUTE = '/home'
const AUTH_STORAGE_KEY = 'neo-authenticated-user-v1'

const getHashRoute = () => {
  const hashValue = window.location.hash.replace(/^#/, '')
  if (!hashValue) return LOGIN_ROUTE
  return hashValue.startsWith('/') ? hashValue : `/${hashValue}`
}

const setHashRoute = (route) => {
  if (window.location.hash !== `#${route}`) {
    window.location.hash = route
  }
}

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const RootApp = () => {
  const [route, setRoute] = useState(getHashRoute)
  const [authUser, setAuthUser] = useState(() => {
    try {
      return window.sessionStorage.getItem(AUTH_STORAGE_KEY)
    } catch {
      return null
    }
  })
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [email, setEmail] = useState('')
  const [idLast4, setIdLast4] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!window.location.hash) {
      setHashRoute(LOGIN_ROUTE)
    }
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getHashRoute())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!authUser && route !== LOGIN_ROUTE) {
      setHashRoute(LOGIN_ROUTE)
      return
    }
    if (authUser && route === LOGIN_ROUTE) {
      setHashRoute(HOME_ROUTE)
    }
  }, [authUser, route])

  const maxDob = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const handleLogin = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!dob) nextErrors.dob = 'Date of birth is required.'
    if (!email.trim()) {
      nextErrors.email = 'Registered email is required.'
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!/^\d{4}$/.test(idLast4.trim())) {
      nextErrors.idLast4 = 'Enter exactly 4 digits.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setSubmitError('')
      return
    }

    const normalizedName = fullName.trim()
    const normalizedEmail = email.trim().toLowerCase()
    const isValidationPassed = normalizedName.length >= 3 && normalizedEmail.length > 5

    if (!isValidationPassed) {
      setSubmitError('Unable to validate your details. Please review your information and try again.')
      return
    }

    try {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, normalizedName)
    } catch {
      // Continue with in-memory auth if storage is unavailable.
    }
    setErrors({})
    setSubmitError('')
    setAuthUser(normalizedName)
    setHashRoute(HOME_ROUTE)
  }

  if (authUser && route === HOME_ROUTE) {
    return <App userName={authUser} />
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Welcome to Neo Onboarding</h1>
        <p>
          Please validate your details to access your onboarding workspace.
        </p>
        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <label>
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
            {errors.fullName ? <span className="auth-error">{errors.fullName}</span> : null}
          </label>

          <label>
            DOB
            <input
              type="date"
              value={dob}
              max={maxDob}
              onChange={(e) => setDob(e.target.value)}
            />
            {errors.dob ? <span className="auth-error">{errors.dob}</span> : null}
          </label>

          <label>
            Registered Email ID
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
            {errors.email ? <span className="auth-error">{errors.email}</span> : null}
          </label>

          <label>
            Last 4 digits of SSN/Aadhaar
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={idLast4}
              onChange={(e) => setIdLast4(e.target.value.replace(/\D/g, ''))}
              placeholder="####"
            />
            {errors.idLast4 ? <span className="auth-error">{errors.idLast4}</span> : null}
          </label>

          {submitError ? <div className="auth-submit-error">{submitError}</div> : null}

          <button type="submit">Validate and Continue</button>
        </form>
      </div>
    </div>
  )
}

export default RootApp
