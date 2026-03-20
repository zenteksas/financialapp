import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { getRandomTip } from '../../utils/tips';

const FinancialTipCard = () => {
  const [tip, setTip] = useState('');

  useEffect(() => {
    setTip(getRandomTip());
  }, []);

  const handleRefresh = (e) => {
    e.stopPropagation();
    setTip(getRandomTip());
  };

  return (
    <div className="glass animate-fade-in" style={styles.card}>
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Lightbulb size={18} color="var(--primary)" />
        </div>
        <span style={styles.title}>Tip Financiero</span>
        <button onClick={handleRefresh} style={styles.refreshBtn}>
          <RefreshCw size={14} />
        </button>
      </div>
      <p style={styles.content}>{tip}</p>
    </div>
  );
};

const styles = {
  card: {
    padding: '20px',
    borderRadius: '20px',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    border: '1px solid rgba(74, 222, 128, 0.15)',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  iconContainer: {
    padding: '6px',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: 'var(--secondary)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    flex: 1,
  },
  content: {
    fontSize: '0.9rem',
    color: 'var(--text-main)',
    lineHeight: '1.5',
    margin: 0,
    fontWeight: '500',
  },
  refreshBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  }
};

export default FinancialTipCard;
