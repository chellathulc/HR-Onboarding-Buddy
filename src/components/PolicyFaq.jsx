import { useState } from 'react'

const PolicyFaq = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="faq-card">
      <div className="faq-header">
        <div>
          <h2>Quick policy help</h2>
          <p>Tap a question to get instant guidance during onboarding.</p>
        </div>
        <span className="badge badge-soft">Live support</span>
      </div>

      <div className="faq-grid">
        {faqs.map((faq, i) => (
          <article
            key={faq.question}
            className={`faq-item ${openIndex === i ? 'faq-item--open' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="faq-question-row">
              <h3>{faq.question}</h3>
              <svg
                className={`faq-chevron ${openIndex === i ? 'faq-chevron--open' : ''}`}
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            {openIndex === i && <p className="faq-answer">{faq.answer}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

export default PolicyFaq
