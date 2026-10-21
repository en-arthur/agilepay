'use client';

import React from 'react';

/**
 * Clean SVG-rendered QR Code visual for payment links.
 */
export default function QRCodePreview({ value = 'https://agilepay.me/x/8492', size = 160 }) {
  // Deterministic SVG QR pattern based on value hash
  const cells = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 21;
    const grid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false));

    // Corner finder patterns (7x7)
    const drawFinder = (startX, startY) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startY + r][startX + c] = isBorder || isCenter;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);

    // Fill pseudo-random cells based on value hash
    let state = Math.abs(hash);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder zones
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= gridSize - 8;
        const inBottomLeft = r >= gridSize - 8 && c < 8;

        if (!inTopLeft && !inTopRight && !inBottomLeft) {
          state = (state * 1664525 + 1013904223) % 4294967296;
          grid[r][c] = (state % 10) > 4;
        }
      }
    }

    return { grid, gridSize };
  }, [value]);

  const { grid, gridSize } = cells;
  const cellSize = size / gridSize;

  return (
    <div
      className="p-3 bg-white rounded-xl shadow-md border border-slate-200 inline-block"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize - 0.4}
                height={cellSize - 0.4}
                rx={1}
                fill="#1E1B4B"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
