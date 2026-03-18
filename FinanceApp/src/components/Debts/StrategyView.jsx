import React, { useState, useEffect } from 'react';
import { Rocket, Info, CheckCircle } from 'lucide-react';
import { DebtMath } from '../../utils/calculations';
import { db } from '../../utils/db';

const StrategyView = ({ debts, currency }) => {
  const [strategy, setStrategy] = useState('snowball');
  const [extraMonthly, setExtraMonthly] = useState('0');
  const [results, setResults] = useState(null);

  const runStrategy = () => {
    if (debts.length === 0) return;
    const scheduled = db.getScheduledPayments();
    const res = DebtMath.analyzePayoff(debts, parseFloat(extraMonthly) || 0, strategy, scheduled);
    setResults(res);
  };

  useEffect(() => {
    runStrategy();
  }, [debts, strategy, extraMonthly]);

  const strategyDescs = {
    snowball: "Bola de Nieve: Ataca primero las deudas más pequeñas para victorias rápidas.",
    avalanche: "Avalancha: Ataca las tasas E.A más altas para ahorrar el máximo de intereses.",
    cashflow: "Flujo de Caja: Prioriza liberar flujo mensual (Relación Saldo/Cuota)."
  };

  return (
    <div className="animate-fade">
      <div className="glass" style={styles.config}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Estrategia</label>
          <select 
            value={strategy} 
            onChange={(e) => setStrategy(e.target.value)}
            style={styles.select}
          >
            <option value="snowball">Bola de Nieve</option>
            <option value="avalanche">Avalancha</option>
            <option value="cashflow">Flujo de Caja</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Abono Extra Mensual ({currency})</label>
          <input 
            type="number" 
            value={extraMonthly}
            onChange={(e) => setExtraMonthly(e.target.value)}
            style={styles.input}
          />
        </div>

        <p style={styles.desc}>{strategyDescs[strategy]}</p>
      </div>

      {results && (
        <div style={{ marginTop: '24px' }}>
          <div className="glass" style={styles.resultCard}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '4px' }}>
              ¡Libre en {results?.totalMonths || 0} Meses!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Proyección estimada de libertad financiera</p>
          </div>

          <div style={styles.timeline}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Plan de Acción</h3>
            {results.history.map((item, i) => (
              <div key={i} style={styles.timelineItem(item.type)}>
                {item.type === 'success' && <CheckCircle size={14} />}
                {item.type === 'warning' && <Rocket size={14} />}
                {item.type === 'info' && <Info size={14} />}
                <span style={{ fontSize: '0.85rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  config: { padding: '24px', borderRadius: '24px', marginBottom: '24px' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' },
  select: {
    width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'white'
  },
  input: {
    width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'white'
  },
  desc: { fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' },
  resultCard: { padding: '24px', borderRadius: '24px', textAlign: 'center' },
  timeline: { marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' },
  timelineItem: (type) => ({
    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px',
    backgroundColor: type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 
                     type === 'warning' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    color: type === 'success' ? 'var(--secondary)' : 
           type === 'warning' ? 'var(--primary)' : '#3b82f6',
    border: `1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)'}`
  })
};

export default StrategyView;
