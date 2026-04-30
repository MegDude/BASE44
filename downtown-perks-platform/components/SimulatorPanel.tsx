'use client';

import { useEffect, useState } from 'react';
import type { ModelWeights, SimulationResult } from '@/lib/simulator/types';

const samplePayload = {
  offer: {
    id: 'offer-coffee-rush',
    category: 'coffee',
    discount: 20,
    urgencyHours: 3,
    radiusKm: 1.2,
  },
  currentTime: Date.now(),
  targetUsers: [
    {
      userId: 'u1',
      preferredCategories: ['coffee', 'breakfast'],
      avgActiveHour: 9,
      avgDistanceKm: 0.4,
      engagementScore: 0.82,
    },
    {
      userId: 'u2',
      preferredCategories: ['coffee', 'wellness'],
      avgActiveHour: 8,
      avgDistanceKm: 0.8,
      engagementScore: 0.71,
    },
    {
      userId: 'u3',
      preferredCategories: ['nightlife', 'coffee'],
      avgActiveHour: 10,
      avgDistanceKm: 0.6,
      engagementScore: 0.76,
    },
  ],
};

export default function SimulatorPanel() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [weights, setWeights] = useState<ModelWeights | null>(null);
  const [actualCTR, setActualCTR] = useState('0.42');
  const [actualRedemption, setActualRedemption] = useState('0.25');
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetch('/api/learn')
      .then((response) => response.json())
      .then((data) => setWeights(data.weights ?? null))
      .catch(() => {
        setWeights(null);
      });
  }, []);

  async function simulateOffer() {
    setIsBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...samplePayload, currentTime: Date.now() }),
      });

      const data = await response.json();
      setResult(data);
      setWeights(data.weightsSnapshot ?? null);
      setMessage('Prediction stored and ready for campaign feedback.');
    } catch {
      setMessage('Unable to run the simulation right now.');
    } finally {
      setIsBusy(false);
    }
  }

  async function applyLearning() {
    if (!result) return;

    setIsBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predicted: result,
          actual: {
            offerId: samplePayload.offer.id,
            actualCTR: Number(actualCTR),
            actualRedemption: Number(actualRedemption),
          },
        }),
      });

      const data = await response.json();
      setWeights(data.learning?.updatedWeights ?? null);
      setMessage('Learning applied from the latest campaign outcome.');
    } catch {
      setMessage('Learning update failed.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <article className="surface-card">
      <div className="stack">
        <div className="kicker">Behavioral simulation</div>
        <h3 className="feature-title">Predict, observe, learn</h3>
        <p className="section-copy">
          This closed loop predicts campaign response, stores the forecast, and tunes model weights when actual results come back.
        </p>

        <div className="cards-2">
          <div className="stack">
            <div className="kicker">Scenario</div>
            <div className="data-list">
              <div className="data-row"><strong>Offer</strong><span className="small">20% coffee perk</span></div>
              <div className="data-row"><strong>Radius</strong><span className="small">1.2 km</span></div>
              <div className="data-row"><strong>Audience</strong><span className="small">3 seeded users</span></div>
            </div>
            <div className="actions">
              <button className="btn" disabled={isBusy} onClick={simulateOffer} type="button">
                {isBusy ? 'Working…' : 'Run simulation'}
              </button>
            </div>
          </div>

          <div className="stack">
            <div className="kicker">Feedback loop</div>
            <label className="small" htmlFor="sim-ctr">Actual CTR</label>
            <input className="input" id="sim-ctr" onChange={(event) => setActualCTR(event.target.value)} value={actualCTR} />
            <label className="small" htmlFor="sim-redemption">Actual redemption</label>
            <input className="input" id="sim-redemption" onChange={(event) => setActualRedemption(event.target.value)} value={actualRedemption} />
            <div className="actions">
              <button className="btn-ghost" disabled={isBusy || !result} onClick={applyLearning} type="button">
                Apply learning
              </button>
            </div>
          </div>
        </div>

        {result ? (
          <div className="cards-3">
            <div className="metric-card">
              <div className="kicker">Predicted CTR</div>
              <div className="metric-card__value">{Math.round(result.predictedCTR * 100)}%</div>
              <p className="small">Confidence {Math.round(result.confidence * 100)}%</p>
            </div>
            <div className="metric-card">
              <div className="kicker">Redemption</div>
              <div className="metric-card__value">{Math.round(result.predictedRedemption * 100)}%</div>
              <p className="small">Audience {result.audienceSize}</p>
            </div>
            <div className="metric-card">
              <div className="kicker">Revenue</div>
              <div className="metric-card__value">${result.expectedRevenue}</div>
              <p className="small">Forecasted lift</p>
            </div>
          </div>
        ) : null}

        {weights ? (
          <div className="result-meta">
            <span className="meta-pill">Distance {weights.distanceWeight.toFixed(2)}</span>
            <span className="meta-pill">Time {weights.timeWeight.toFixed(2)}</span>
            <span className="meta-pill">Category {weights.categoryWeight.toFixed(2)}</span>
            <span className="meta-pill">Engagement {weights.engagementWeight.toFixed(2)}</span>
          </div>
        ) : null}

        {message ? <div className="notice-banner">{message}</div> : null}
      </div>
    </article>
  );
}
