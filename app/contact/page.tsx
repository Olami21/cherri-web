'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setErrorMsg] = useState('');

  function handleSend(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    setErrorMsg('');

    const body = `From: ${name} (${email})\n\n${message}`;
    const mailtoUrl = `mailto:hello@cherri.com?subject=${encodeURIComponent(
      subject || 'Message from Cherri website'
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
  }

  return (
    <main className="contact-wrap">
      <section className="contact-hero">
        <div className="wrap">
          <h1 className="section-title size-l">Get in touch.</h1>
          <p className="section-desc">
            Have a question, feedback, or partnership inquiry? We&apos;d
            love to hear from you.
          </p>
        </div>
      </section>

      <section className="contact-content-section">
        <div className="wrap contact-grid">
          <div className="contact-info">
            <span className="tag">
              <span className="dot" />
              Direct
            </span>
            <h2 className="section-title">Prefer email?</h2>
            <p className="contact-email-line">
              <a href="mailto:hello@cherri.com">hello@cherri.com</a>
            </p>
            <p className="contact-info-note">
              We read every message and try to reply within a couple of
              days.
            </p>
          </div>

          <form onSubmit={handleSend} className="contact-form">
            <div className="log-meal-field">
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="log-meal-field">
              <label htmlFor="email">Your email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="log-meal-field">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                placeholder="What's this about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="log-meal-field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {error && <p className="log-meal-error">{error}</p>}

            <button type="submit" className="log-meal-save-btn">
              Send message
            </button>
            <p className="contact-form-note">
              This opens your email app with your message ready to send.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}