import React from 'react';
import { Scissors } from 'lucide-react';

export default function AppHeader() {
  return (
    <header>
      <div className="header-title-container">
        <div className="header-logo">
          <Scissors size={20} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <h1>Trimify</h1>
          <p>Bulk Auto Crop Transparent PNG — 100% Local</p>
        </div>
      </div>
      <div className="header-stats">
        <div className="header-stat-item">
          <div className="header-stat-label">Space Saved</div>
          <div className="header-stat-value font-num" id="stat-saved-space">0.00 KB (0%)</div>
        </div>
        <div className="header-stat-item">
          <div className="header-stat-label">Diproses</div>
          <div className="header-stat-value font-num" id="stat-processed-count">0 / 0</div>
        </div>
      </div>
    </header>
  );
}
