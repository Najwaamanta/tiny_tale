import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Pick Base',
      desc: 'Select from keychain, strap, or bracelet bases.'
    },
    {
      num: '02',
      title: 'Strap & Frame',
      desc: 'Choose colorways and personalized photo frame shapes.'
    },
    {
      num: '03',
      title: 'Add Photo & Charms',
      desc: 'Upload your memory and select cute secondary charms.'
    },
    {
      num: '04',
      title: 'Instant Preview',
      desc: 'See your customized charm rendered before checkout!'
    }
  ];

  return (
    <section className="section-how-it-works" id="how-it-works">
      <div className="container">
        <div className="how-it-works-header">
          <h2 className="section-title-center">Simple Steps to Your Own Charm</h2>
          <p className="section-subtitle-center">
            Our live builder lets you choose and preview your exact configuration
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, idx) => (
            <div key={step.num} className="step-col">
              <div className="step-num-row">
                <span className="step-num">{step.num}</span>
                {idx < steps.length - 1 && <div className="step-line-divider" />}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
