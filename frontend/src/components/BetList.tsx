import React, { memo } from 'react';
import { calculateRemainingCredits } from '../utils/storage';
import './BetList.css';

interface BetListProps {
  bets: number[];
  onBetChange: (index: number, newValue: number) => void;
}

const BetList: React.FC<BetListProps> = memo(({ bets, onBetChange }) => {
  const remaining = calculateRemainingCredits(bets);
  const totalBets = bets.reduce((sum, bet) => sum + bet, 0);

  const handleIncrement = (index: number, amount: number) => {
    const newValue = bets[index] + amount;
    
    // Check if new value would exceed 600
    const newTotal = totalBets - bets[index] + newValue;
    if (newTotal > 600) return;

    // Check ordering: can't be higher than above or lower than below
    if (index > 0 && newValue > bets[index - 1]) return;
    if (index < bets.length - 1 && newValue < bets[index + 1]) return;

    // Check minimum value
    if (newValue < 0) return;

    onBetChange(index, newValue);
  };

  return (
    <div className="bet-list">
      <h3>Offerte</h3>
      <div className="bets-container">
        {bets.map((bet, index) => (
          <div key={index} className="bet-item">
            <button
              className="bet-btn bet-btn-minus"
              onClick={() => handleIncrement(index, -10)}
              title="Decrease by 10"
            >
              -10
            </button>
            <button
              className="bet-btn bet-btn-minus"
              onClick={() => handleIncrement(index, -1)}
              title="Decrease by 1"
            >
              -1
            </button>
            <div className="bet-value">{bet}</div>
            <button
              className="bet-btn bet-btn-plus"
              onClick={() => handleIncrement(index, 1)}
              title="Increase by 1"
            >
              +1
            </button>
            <button
              className="bet-btn bet-btn-plus"
              onClick={() => handleIncrement(index, 10)}
              title="Increase by 10"
            >
              +10
            </button>
          </div>
        ))}
      </div>
      <div className="bet-summary">
        <div className="bet-total">Totale: {totalBets}/600</div>
        <div className={`bet-remaining ${remaining < 0 ? 'negative' : ''}`}>
          Crediti rimasti: {remaining}
        </div>
      </div>
    </div>
  );
});

BetList.displayName = 'BetList';

export default BetList;
