export default function CardQRCode({ value = 'downtown-perks', size = 80 }) {
  const gridSize = 7;
  const cellSize = size / gridSize;

  const hash = value.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const filled = (r, c) => {
    if (r === 0 || r === 6 || c === 0 || c === 6) return true;
    if (r === 1 || r === 5) return c === 1 || c === 5;
    if (r === 2 || r === 4) return c === 2 || c === 4;
    if (r === 3 && c === 3) return true;
    return ((hash * (r + 1) * (c + 1)) % 5) === 0;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`QR code for ${value}`}
      role="img"
      className="rounded"
      style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
    >
      {[...Array(gridSize)].map((_, r) =>
        [...Array(gridSize)].map((_, c) =>
          filled(r, c) ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize + 2}
              y={r * cellSize + 2}
              width={cellSize - 2}
              height={cellSize - 2}
              rx="1"
              fill="rgba(255,255,255,0.85)"
            />
          ) : null
        )
      )}
    </svg>
  );
}
