'use client';

import { FormEvent, useState } from 'react';

export function TextLinkForm({
  title = 'Get the text link',
  description = 'Send the resident app to your phone. Twilio sends live SMS when configured, otherwise the request is still recorded.',
  source = 'site',
}: {
  title?: string;
  description?: string;
  source?: string;
}) {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage('');
    try {
      const response = await fetch('/api/text-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, source }),
      });
      const data = await response.json();
      setMessage(data.message || 'Request saved.');
      if (response.ok) setPhone('');
    } catch {
      setMessage('Unable to save the request right now.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="card card-pad stack">
      <div>
        <div className="kicker">Text Link</div>
        <h3 className="feature-title">{title}</h3>
        <p className="section-copy">{description}</p>
      </div>
      <form className="inline-form" onSubmit={onSubmit}>
        <input
          aria-label="Phone number"
          className="input"
          inputMode="tel"
          onChange={(event) => setPhone(event.target.value)}
          placeholder="(512) 555-0123"
          required
          value={phone}
        />
        <button className="btn" disabled={isPending} type="submit">
          {isPending ? 'Sending…' : 'Text me'}
        </button>
      </form>
      {message ? <p className="small status-text">{message}</p> : null}
    </div>
  );
}
