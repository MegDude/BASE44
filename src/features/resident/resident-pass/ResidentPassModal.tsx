import { useEffect, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import QRCode from "qrcode";
import { createResidentQrSession, type ResidentQrSession } from "./createQrSession";

type Props = {
  open: boolean;
  residentName: string;
  buildingName?: string;
  onClose: () => void;
};

export function ResidentPassModal({ open, residentName, buildingName, onClose }: Props) {
  const [session, setSession] = useState<ResidentQrSession | null>(null);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    setSession(null);
    setImage("");
    setError("");
    createResidentQrSession({ purpose: "resident_pass", sourceSurface: "resident_home" })
      .then(async (next) => {
        const dataUrl = await QRCode.toDataURL(next.qrValue, { width: 280, margin: 2, color: { dark: "#0b1f33", light: "#ffffff" } });
        if (active) { setSession(next); setImage(dataUrl); }
      })
      .catch((reason: Error) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="dp-resident-pass-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="dp-resident-pass-modal" role="dialog" aria-modal="true" aria-labelledby="resident-pass-title">
        <header>
          <button type="button" onClick={onClose} aria-label="Back to resident home"><ArrowLeft aria-hidden="true" /></button>
          <span>Resident Pass</span>
          <button type="button" onClick={onClose} aria-label="Close resident pass"><X aria-hidden="true" /></button>
        </header>
        <div className="dp-resident-pass-content">
          <p>Verified resident</p>
          <h2 id="resident-pass-title">{residentName || "Downtown Perks resident"}</h2>
          <span>{buildingName || "Downtown Austin"}</span>
          {error ? <div className="dp-resident-pass-error" role="alert"><strong>Resident pass unavailable</strong><p>{error}</p><button type="button" onClick={onClose}>Close</button></div> : null}
          {!error && !image ? <p role="status">Preparing your secure pass…</p> : null}
          {image && session ? (
            <>
              <p className="dp-resident-pass-ready" role="status">Ready to scan</p>
              <div className="dp-resident-pass-qr"><img src={image} alt={`Short-lived Downtown Perks QR code for ${residentName || "resident"}`} /></div>
              <p>Ask the partner to scan this code. It expires automatically.</p>
              <dl>
                <div><dt>Valid until</dt><dd data-qr-expires-at>{new Date(session.expiresAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</dd></div>
                <div><dt>Pass session</dt><dd>{session.sessionId.slice(0, 8).toUpperCase()}</dd></div>
              </dl>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
