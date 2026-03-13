import React, { useState } from 'react';
import { Scale, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { DebtMath } from '../../utils/calculations';

const SimulatorView = ({ debts }) => {
  const [inputs, setInputs] = useState({
    ea: '15.0',
    term: '60',
    insurance: '0',
    management: '0'
  });
  const [results, setResults] = useState(null);

  const simulate = () => {
    const res = DebtMath.simulateConsolidation(
      debts,
      parseFloat(inputs.ea) || 0,
      parseFloat(inputs.management) || 0,
      parseFloat(inputs.insurance) || 0,
      parseInt(inputs.term) || 0
    );
    setResults(res);
  };

  const handleChange = (e) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="animate-fade">
      <div className="glass" style={styles.card}>
        <p style={styles.helpText}>Simula si unificar tus deudas en un solo crédito es una buena decisión.</p>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Nueva Tasa E.A (%)</label>
          <input name="ea" type="number" value={inputs.ea} onChange={handleChange} style={styles.input} />
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Plazo (Meses)</label>
            <input name="term" type="number" value={inputs.term} onChange={handleChange} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Seguros ($)</label>
            <input name="insurance" type="number" value={inputs.insurance} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        <button onClick={simulate} style={styles.simBtn}>
          <Scale size={20} style={{ marginRight: '8px' }} />
          Calcular Simulación
        </button>
      </div>

      {results && results.valido && (
        <div className="animate-fade" style={{ marginTop: '24px' }}>
          <div className="glass" style={styles.verdictCard}>
            <p style={{ fontWeight: '600', marginBottom: '16px', lineHeight: '1.4' }}>{results.analisis.veredicto}</p>
            
            <div style={styles.compRow}>
              <div style={styles.compItem}>
                <span style={styles.compLabel}>Actual</span>
                <p style={styles.compVal}>${results.statu_quo.cuota_mensual.toLocaleString()}</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cuota Global</span>
              </div>
              <div style={styles.compItem}>
                <span style={{ ...styles.compLabel, color: 'var(--primary)' }}>Nueva</span>
                <p style={{ ...styles.compVal, color: 'var(--primary)' }}>${results.nueva_oferta.cuota_mensual.toLocaleString()}</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cuota Global</span>
              </div>
            </div>

            <div style={styles.details}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Efecto Liquidez:</span>
                <span style={{ color: results.analisis.ahorro_mensual > 0 ? 'var(--secondary)' : 'var(--danger)', fontWeight: '600' }}>
                  ${results.analisis.ahorro_mensual.toLocaleString()} /mes
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Ahorro Total:</span>
                <span style={{ color: results.analisis.ahorro_total_dinero > 0 ? 'var(--secondary)' : 'var(--danger)', fontWeight: '600' }}>
                  ${results.analisis.ahorro_total_dinero.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {results && !results.valido && (
        <div className="glass" style={{ padding: '20px', marginTop: '20px', border: '1px solid var(--danger)' }}>
          <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{results.error}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { padding: '24px', borderRadius: '24px' },
  helpText: { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' },
  inputGroup: { marginBottom: '16px' },
  row: { display: 'flex', gap: '12px', marginBottom: '20px' },
  label: { display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' },
  input: {
    width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'white', outline: 'none'
  },
  simBtn: {
    width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--accent)',
    color: 'var(--bg-color)', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  verdictCard: { padding: '24px', borderRadius: '24px', textAlign: 'center' },
  compRow: { display: 'flex', justifyContent: 'space-around', margin: '20px 0', padding: '20px 0', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' },
  compItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  compLabel: { fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px', color: 'var(--text-muted)' },
  compVal: { fontSize: '1.2rem', fontWeight: '700' },
  details: { textAlign: 'left', marginTop: '16px' },
  detailItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' },
  detailLabel: { color: 'var(--text-muted)' }
};

export default SimulatorView;
