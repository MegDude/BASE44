
'use client';
import type { Mode } from '@/lib/types';

export function ModeSwitch({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
}) {
  return (
    <div className="mode-switch">
      <button className={mode === 'resident' ? 'active' : ''} onClick={() => setMode('resident')}>Resident</button>
      <button className={mode === 'partner' ? 'active' : ''} onClick={() => setMode('partner')}>Partner</button>
    </div>
  );
}
