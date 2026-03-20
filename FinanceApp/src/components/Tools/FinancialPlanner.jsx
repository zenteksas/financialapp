import React, { useState, useEffect } from 'react';
import { Calculator, PieChart, TrendingUp, ShieldCheck, Heart, Save, Share2, RefreshCw, User, Plus, Trash2, HelpCircle } from 'lucide-react';
import { db } from '../../utils/db';
import FinancialTipCard from '../Layout/FinancialTipCard';

const DEFAULT_STRATEGIES = [
  {
    id: '503020',
    name: 'Regla 50-30-20',
    description: 'La más equilibrada: divide en necesidades, deseos y ahorro.',
    details: [
      { label: 'Necesidades', percent: 50, color: '#4ADE80', icon: ShieldCheck, desc: 'Alquiler, comida, servicios' },
      { label: 'Deseos', percent: 30, color: '#60A5FA', icon: Heart, desc: 'Suscripciones, salidas, gustos' },
      { label: 'Ahorro/Deuda', percent: 20, color: '#FACC15', icon: TrendingUp, desc: 'Fondo de emergencia, abonos extra' }
    ]
  },
  {
    id: '702010',
    name: 'Regla 70-20-10',
    description: 'Ideal si buscas rapidez en el ahorro y pago de deudas.',
    details: [
      { label: 'Gastos de Vida', percent: 70, color: '#4ADE80', icon: ShieldCheck, desc: 'Todo lo básico para vivir' },
      { label: 'Ahorro', percent: 20, color: '#FACC15', icon: TrendingUp, desc: 'Inversión y jubilación' },
      { label: 'Deuda', percent: 10, color: '#EF4444', icon: Calculator, desc: 'Pago mínimo de obligaciones' }
    ]
  },
  {
    id: '6040',
    name: 'Solución del 60%',
    description: 'Para quienes prefieren enfocarse en gastos fijos y flexibilidad.',
    details: [
      { label: 'Gastos Comprometidos', percent: 60, color: '#4ADE80', icon: ShieldCheck, desc: 'Gastos fijos mensuales' },
      { label: 'Ahorro Retiro', percent: 10, color: '#FACC15', icon: TrendingUp, desc: 'Largo plazo' },
      { label: 'Ahorro Corto Plazo', percent: 10, color: '#60A5FA', icon: TrendingUp, desc: 'Vacaciones, regalos' },
      { label: 'Diversión', percent: 10, color: '#F472B6', icon: Heart, desc: 'Entretenimiento' },
      { label: 'Regalos/Donación', percent: 10, color: '#A78BFA', icon: Heart, desc: 'Otros' }
    ]
  },
  {
    id: 'custom',
    name: 'Estrategia Personalizada',
    description: 'Define tus propios porcentajes según tus prioridades.',
    details: [
      { label: 'Necesidades', percent: 40, color: '#4ADE80', icon: ShieldCheck, desc: 'Gastos básicos' },
      { label: 'Deseos', percent: 30, color: '#60A5FA', icon: Heart, desc: 'Estilo de vida' },
      { label: 'Ahorro', percent: 20, color: '#FACC15', icon: TrendingUp, desc: 'Futuro' },
      { label: 'Inversión', percent: 10, color: '#A78BFA', icon: TrendingUp, desc: 'Crecimiento' }
    ]
  }
];

const FinancialPlanner = ({ currency }) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState('503020');
  const [income, setIncome] = useState(0);
  const [incomeInput, setIncomeInput] = useState('');
  const [customDetails, setCustomDetails] = useState(DEFAULT_STRATEGIES.find(s => s.id === 'custom').details);
  const [isVariableIncome, setIsVariableIncome] = useState(false);
  const [incomeHistory, setIncomeHistory] = useState(['', '', '']);
  const [loading, setLoading] = useState(true);

  // Load persistence
  useEffect(() => {
    const load = async () => {
      const prefs = await db.getPlannerPrefs();
      if (prefs) {
        setSelectedStrategyId(prefs.strategyId);
        setIncome(prefs.income);
        setIncomeInput(formatThousand(prefs.income.toString()));
        if (prefs.customPercentages) setCustomDetails(prefs.customPercentages);
        setIsVariableIncome(prefs.isVariableIncome);
        if (prefs.incomeHistory && prefs.incomeHistory.length > 0) setIncomeHistory(prefs.incomeHistory);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Save persistence
  useEffect(() => {
    if (!loading) {
      db.savePlannerPrefs({
        strategyId: selectedStrategyId,
        income,
        customPercentages: customDetails,
        isVariableIncome,
        incomeHistory
      });
    }
  }, [selectedStrategyId, income, customDetails, isVariableIncome, incomeHistory, loading]);

  const formatThousand = (val) => {
    if (!val) return '';
    const num = val.toString().replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleIncomeChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    // Remove leading zeros
    if (rawValue.length > 1 && rawValue.startsWith('0')) {
      rawValue = rawValue.replace(/^0+/, '');
    }
    setIncomeInput(formatThousand(rawValue));
    setIncome(parseFloat(rawValue) || 0);
  };

  const handleVariableIncomeChange = (idx, val) => {
    const newHistory = [...incomeHistory];
    let rawValue = val.replace(/\D/g, '');
    if (rawValue.length > 1 && rawValue.startsWith('0')) {
      rawValue = rawValue.replace(/^0+/, '');
    }
    newHistory[idx] = rawValue;
    setIncomeHistory(newHistory);
    
    // Auto-calculate average
    const validIncomes = newHistory.filter(v => v !== '').map(v => parseFloat(v));
    if (validIncomes.length > 0) {
      const avg = validIncomes.reduce((a, b) => a + b, 0) / validIncomes.length;
      setIncome(Math.round(avg));
      setIncomeInput(formatThousand(Math.round(avg).toString()));
    }
  };

  const handleCustomPercentChange = (idx, val) => {
    const newDetails = [...customDetails];
    let rawValue = val.replace(/\D/g, '');
    if (rawValue.length > 1 && rawValue.startsWith('0')) {
      rawValue = rawValue.replace(/^0+/, '');
    }
    newDetails[idx].percent = parseInt(rawValue) || 0;
    setCustomDetails(newDetails);
  };

  const totalCustomPercent = customDetails.reduce((a, b) => a + b.percent, 0);

  const calculateAmount = (percent) => {
    return (income * percent) / 100;
  };

  const selectedStrategy = selectedStrategyId === 'custom' 
    ? { ...DEFAULT_STRATEGIES.find(s => s.id === 'custom'), details: customDetails }
    : DEFAULT_STRATEGIES.find(s => s.id === selectedStrategyId);

  const handleShare = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const text = `📊 Mi Planeación Financiera (${selectedStrategy.name})\n\n💰 Ingreso: ${income.toLocaleString()} ${currency}\n\nDistribución:\n` + 
                 selectedStrategy.details.map(d => `- ${d.label} (${d.percent}%): ${calculateAmount(d.percent).toLocaleString()} ${currency}`).join('\n') +
                 `\n\nGenerado con ZenFinance ✨`;

    if (navigator.share && isMobile) {
      try {
        await navigator.share({ title: 'Mi Plan Financiero', text });
      } catch (err) {
        window.print();
      }
    } else {
      // Logic for desktop / Fallback
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (loading) return null;

  return (
    <div className="animate-fade">
      {/* Input Header section */}
      <div className="glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
              <Calculator size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Simulador de Planeación</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configura tu futuro financiero</p>
            </div>
          </div>
          <button onClick={handleShare} style={styles.shareBtn}>
            <Share2 size={16} /> Compartir
          </button>
        </div>

        {/* Variable Income Toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
           <button 
            onClick={() => setIsVariableIncome(!isVariableIncome)}
            style={{ 
              background: 'none', border: 'none', color: isVariableIncome ? 'var(--secondary)' : 'var(--text-muted)',
              fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              fontWeight: '700'
            }}
           >
             <User size={14} /> {isVariableIncome ? 'Desactivar Ingresos Variables' : 'Tengo Ingresos Variables (Freelance)'}
           </button>
        </div>

        {isVariableIncome ? (
          <div style={{ marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={14} /> Promedia tus últimos meses:
             </p>
             <div style={{ display: 'flex', gap: '8px' }}>
               {incomeHistory.map((h, i) => (
                 <div key={i} style={{ flex: 1 }}>
                   <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Mes {i+1}</label>
                   <input 
                    type="text"
                    inputMode="numeric"
                    value={formatThousand(h)}
                    onChange={(e) => handleVariableIncomeChange(i, e.target.value)}
                    placeholder="0"
                    style={{ ...styles.input, fontSize: '0.9rem', padding: '10px' }}
                   />
                 </div>
               ))}
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '8px', fontWeight: '600' }}>
               Promedio calculado: {income.toLocaleString()} {currency}
             </p>
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Ingreso Mensual Estimado</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                inputMode="numeric"
                value={incomeInput}
                onChange={handleIncomeChange}
                placeholder="0"
                style={styles.input}
              />
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', color: 'var(--primary)' }}>{currency}</span>
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Elige tu Estrategia</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEFAULT_STRATEGIES.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedStrategyId(s.id)}
                style={{ 
                  ...styles.strategyCard, 
                  border: selectedStrategyId === s.id ? '1px solid var(--secondary)' : '1px solid var(--glass-border)',
                  backgroundColor: selectedStrategyId === s.id ? 'rgba(74, 222, 128, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: selectedStrategyId === s.id ? 'var(--secondary)' : 'var(--text-heading)' }}>{s.name}</span>
                  {selectedStrategyId === s.id && <ShieldCheck size={18} color="var(--secondary)" />}
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'left' }}>{s.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Strategy Editor */}
      {selectedStrategyId === 'custom' && (
        <div className="glass animate-slide-up" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
               <RefreshCw size={18} color="var(--secondary)" /> Personaliza tus Porcentajes
             </h4>
             <span style={{ fontSize: '0.9rem', fontWeight: '800', color: totalCustomPercent === 100 ? 'var(--secondary)' : 'var(--danger)' }}>
               {totalCustomPercent}% / 100%
             </span>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {customDetails.map((detail, idx) => (
                <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '16px' }}>
                   <label style={{ fontSize: '0.75rem', color: detail.color, fontWeight: '700', display: 'block', marginBottom: '8px' }}>{detail.label}</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <input 
                      type="text"
                      inputMode="numeric"
                      value={detail.percent === 0 ? '0' : detail.percent}
                      onChange={(e) => handleCustomPercentChange(idx, e.target.value)}
                      style={{ ...styles.input, fontSize: '1rem', padding: '8px', textAlign: 'center' }}
                     />
                     <span style={{ fontWeight: '700' }}>%</span>
                   </div>
                </div>
              ))}
           </div>
           {totalCustomPercent !== 100 && (
             <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '12px', textAlign: 'center' }}>
               ⚠️ La suma de los porcentajes debe ser exactamente 100%. Actual: {totalCustomPercent}%
             </p>
           )}
        </div>
      )}

      {/* Results area */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} color="var(--primary)" />
          Resultado de la Distribución
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {selectedStrategy.details.map((detail, idx) => (
            <div key={idx} className="glass" style={{ padding: '16px', borderRadius: '18px', borderLeft: `4px solid ${detail.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <detail.icon size={18} style={{ color: detail.color }} />
                  </div>
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{detail.label}</span>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{detail.desc}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-heading)' }}>
                    {calculateAmount(detail.percent).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{detail.percent}%</div>
                </div>
              </div>
              <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${detail.percent}%`, backgroundColor: detail.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <FinancialTipCard />
    </div>
  );
};

const styles = {
  input: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-main)',
    fontSize: '1.2rem',
    fontWeight: '700',
    outline: 'none',
    transition: 'all 0.2s',
  },
  strategyCard: {
    padding: '12px 16px',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  shareBtn: {
    padding: '8px 16px',
    borderRadius: '12px',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    border: '1px solid rgba(74, 222, 128, 0.2)',
    color: 'var(--primary)',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default FinancialPlanner;
