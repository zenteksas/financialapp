import React, { useState } from 'react';
import DebtsModule from '../Debts/DebtsModule';
import FinancialPlanner from './FinancialPlanner';
import { Wallet, Landmark } from 'lucide-react';

const ToolsModule = ({ debts, totals, onUpdate, currency }) => {
  const [activeSubTab, setActiveSubTab] = useState('debts');

  return (
    <div className="animate-fade">
      <div style={styles.tabBar}>
        <button 
          style={styles.tab(activeSubTab === 'debts')}
          onClick={() => setActiveSubTab('debts')}
        >
          <Wallet size={18} />
          <span>Deudas</span>
        </button>
        <button 
          style={styles.tab(activeSubTab === 'planner')}
          onClick={() => setActiveSubTab('planner')}
        >
          <Landmark size={18} />
          <span>Planeador</span>
        </button>
      </div>

      <div style={styles.content}>
        {activeSubTab === 'debts' ? (
          <DebtsModule 
            debts={debts} 
            totals={totals} 
            onUpdate={onUpdate} 
            currency={currency} 
          />
        ) : (
          <FinancialPlanner currency={currency} />
        )}
      </div>
    </div>
  );
};

const styles = {
  tabBar: {
    display: 'flex',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '4px',
    gap: '4px',
    marginBottom: '24px',
    border: '1px solid var(--glass-border)',
  },
  tab: (active) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '12px',
    backgroundColor: active ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
    color: active ? 'var(--secondary)' : 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  }),
  content: {
    minHeight: '400px',
  }
};

export default ToolsModule;
