import React, { useState, useEffect } from 'react';
import { Rocket, Info, CheckCircle } from 'lucide-react';
import { DebtMath } from '../../utils/calculations';
import { db } from '../../utils/db';
import FinancialTipCard from '../Layout/FinancialTipCard';

const StrategyView = ({ debts, currency }) => {
  const [strategy, setStrategy] = useState('snowball');
  const [extraMonthly, setExtraMonthly] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const prefs = await db.getDebtPrefs();
      setStrategy(prefs.strategy);
      setExtraMonthly(prefs.extraMonthly > 0 ? prefs.extraMonthly.toString() : '');
      setLoading(false);
    };
    init();
  }, []);

  const runStrategy = () => {
    if (debts.length === 0) {
      setResults(null);
      return;
    }
    const scheduled = db.getScheduledPayments();
    const extra = parseFloat(extraMonthly) || 0;
    const res = DebtMath.analyzePayoff(debts, extra, strategy, scheduled);
    const sq = DebtMath.getStatusQuo(debts);
    
    // Save prefs whenever they change and calculation runs
    db.saveDebtPrefs(strategy, extra);
    
    setResults({ ...res, statusQuo: sq });
  };

  useEffect(() => {
    if (!loading) runStrategy();
  }, [debts, strategy, extraMonthly, loading]);

  const handleExportPDF = async () => {
    if (!results) return;
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (navigator.share && isMobile) {
      const text = `🎯 Mi Estrategia: ${strategy === 'snowball' ? 'Bola de Nieve' : strategy === 'avalanche' ? 'Avalancha' : 'Flujo de Caja'}\n\n💸 Abono extra: ${extraMonthly || 0} ${currency}\n🎉 ¡Libre de deudas en ${results.totalMonths} meses!\n💰 Intereses totales: ${results.totalInterest.toLocaleString()} ${currency}\n\n📋 Plan de Acción:\n` + 
                   results.history.map(h => `- ${h.text}`).join('\n');
      try {
        await navigator.share({
          title: 'Mi Plan de Deudas',
          text: text
        });
      } catch (err) {
        window.print();
      }
    } else {
      window.print();
    }
  };

  const formatAmountDisplay = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const numericStr = val.toString().replace(/\D/g, '');
    if (!numericStr) return '';
    return numericStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleExtraMonthlyChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length > 1 && rawValue.startsWith('0')) {
      rawValue = rawValue.replace(/^0+/, '');
    }
    setExtraMonthly(rawValue);
  };

  const getDebtFreeDate = (totalMonths) => {
    const d = new Date();
    d.setMonth(d.getMonth() + totalMonths);
    const name = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const strategyDescs = {
    snowball: "Bola de Nieve: Ataca primero las deudas más pequeñas para victorias rápidas.",
    avalanche: "Avalancha: Ataca las tasas E.A más altas para ahorrar el máximo de intereses.",
    cashflow: "Flujo de Caja: Prioriza liberar flujo mensual (Relación Saldo/Cuota)."
  };

  if (loading) return null;

  return (
    <div className="animate-fade strategy-print-target">
      <div className="glass no-print" style={styles.config}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Configura tu Plan</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ ...styles.inputGroup, flex: 1, minWidth: '200px' }}>
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

          <div style={{ ...styles.inputGroup, flex: 1, minWidth: '200px' }}>
            <label style={styles.label}>Abono Extra Mensual ({currency})</label>
            <input 
              type="text" 
              inputMode="numeric"
              placeholder="0"
              value={formatAmountDisplay(extraMonthly)}
              onChange={handleExtraMonthlyChange}
              style={styles.input}
            />
          </div>
        </div>

        <p style={{ ...styles.desc, marginTop: '12px', borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
           {strategyDescs[strategy]}
        </p>
      </div>

      {results && results.totalMonths > 0 ? (
        <div style={{ marginTop: '24px' }}>
          {/* Main Results Dashboard */}
          <div className="glass" style={styles.resultCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
               <div style={{ textAlign: 'left' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em' }}>META DE LIBERTAD</p>
                  <h2 style={{ fontSize: '2rem', color: 'var(--secondary)', lineHeight: 1.1 }}>
                    {getDebtFreeDate(results.totalMonths)}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>En aproximadamente {results.totalMonths} meses</p>
               </div>
               <button onClick={handleExportPDF} style={styles.exportBtn} className="no-print">
                  <Rocket size={16} /> Compartir
               </button>
            </div>

            <div style={styles.statsGrid}>
               <div style={styles.statItem}>
                 <p style={styles.statLabel}>Intereses Totales</p>
                 <p style={styles.statVal}>{Math.round(results.totalInterest).toLocaleString()} {currency}</p>
               </div>
               <div style={styles.statItem}>
                 <p style={styles.statLabel}>Ahorro Estimado</p>
                 <p style={{ ...styles.statVal, color: 'var(--secondary)' }}>
                   {(results.statusQuo.totalInterest - results.totalInterest > 0) 
                     ? (results.statusQuo.totalInterest - results.totalInterest).toLocaleString() 
                     : 0} {currency}
                 </p>
               </div>
               <div style={styles.statItem}>
                 <p style={styles.statLabel}>Total a Pagar</p>
                 <p style={styles.statVal}>{Math.round(results.totalPaid).toLocaleString()} {currency}</p>
               </div>
            </div>
            
            {(results.statusQuo.totalMonths - results.totalMonths > 0) && (
              <div style={styles.successBadge}>
                 ✨ ¡Te librarás de tus deudas <b>{results.statusQuo.totalMonths - results.totalMonths} meses antes</b> que solo pagando el mínimo!
              </div>
            )}
          </div>

          <div style={styles.timeline}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Plan de Acción Paso a Paso</h3>
            </div>
            
            {results.excluded && results.excluded.length > 0 && (
              <div style={styles.warningBox}>
                <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px', color: '#f59e0b' }}>⚠️ Deudas Pendientes de Activar:</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                  {results.excluded.length} deudas no se incluyeron porque su cuota actual no cubre ni los intereses.
                </p>
                <ul style={{ marginTop: '8px', fontSize: '0.8rem', paddingLeft: '20px' }}>
                  {results.excluded.map((d, i) => (
                    <li key={i}><b>{d.nombre}:</b> Necesita cuota {'>'} {Math.round(d.monto * (DebtMath.eaToEm(d.ea)) + (d.cuotaManejo || 0) + (d.seguros || 0)).toLocaleString()}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.historyScroll}>
              {results.history.map((item, i) => (
                <div key={i} style={styles.timelineItem(item.type)}>
                  <div style={styles.dot(item.type)} />
                  <span style={{ fontSize: '0.85rem', flex: 1 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass" style={{ padding: '60px 40px', textAlign: 'center', borderRadius: '32px', marginTop: '24px' }}>
          <Info size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-muted)' }}>No hay suficientes datos</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
            Asegúrate de tener deudas registradas con cuotas que cubran al menos los intereses para generar un plan.
          </p>
        </div>
      )}
      <div style={{ marginTop: '24px' }}>
        <FinancialTipCard />
      </div>
    </div>
  );
};

const styles = {
  config: { padding: '24px', borderRadius: '24px', marginBottom: '24px', border: '1px solid var(--glass-border)' },
  inputGroup: { marginBottom: '8px' },
  label: { display: 'block', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' },
  select: {
    width: '100%', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
  },
  input: {
    width: '100%', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
  },
  desc: { fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' },
  resultCard: { padding: '32px 24px', borderRadius: '24px', textAlign: 'center', background: 'var(--surface-color)', border: '1px solid var(--glass-border)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' },
  statItem: { padding: '16px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.03)', textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)' },
  statLabel: { fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' },
  statVal: { fontSize: '1.1rem', fontWeight: '800' },
  successBadge: { 
    padding: '12px 16px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    color: 'var(--secondary)', fontSize: '0.85rem', textAlign: 'left', border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  timeline: { marginTop: '32px' },
  historyScroll: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' },
  timelineItem: (type) => ({
    display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '18px',
    backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
  }),
  dot: (type) => ({
    width: '10px', height: '10px', borderRadius: '50%', marginTop: '4px',
    backgroundColor: type === 'success' ? 'var(--secondary)' : 
                     type === 'warning' ? 'var(--primary)' : '#3b82f6',
    boxShadow: `0 0 10px ${type === 'success' ? 'var(--secondary)' : 'var(--primary)'}`
  }),
  exportBtn: {
    padding: '10px 18px', borderRadius: '14px', backgroundColor: 'var(--primary)',
    color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer',
    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
  },
  warningBox: {
    padding: '20px', borderRadius: '24px', backgroundColor: 'rgba(245, 158, 11, 0.05)',
    border: '1px solid rgba(245, 158, 11, 0.15)', color: 'var(--text-main)', marginBottom: '24px'
  }
};

export default StrategyView;
