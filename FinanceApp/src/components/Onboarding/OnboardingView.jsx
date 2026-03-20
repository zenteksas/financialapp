import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Check, Wallet, Plus, Trash2,
  User, Smile, Star, Heart, Zap, Coffee, 
  Gamepad, Rocket
} from 'lucide-react';

const AVATARS = [
  { id: 'User', icon: User, color: '#4f46e5' },
  { id: 'Smile', icon: Smile, color: '#10b981' },
  { id: 'Star', icon: Star, color: '#f59e0b' },
  { id: 'Heart', icon: Heart, color: '#ef4444' },
  { id: 'Zap', icon: Zap, color: '#8b5cf6' },
  { id: 'Coffee', icon: Coffee, color: '#06b6d4' },
  { id: 'Gamepad', icon: Gamepad, color: '#ec4899' },
  { id: 'Rocket', icon: Rocket, color: '#f97316' },
];

const COUNTRIES = [
  { code: 'CO', name: 'Colombia', currency: 'COP', symbol: '$', emoji: '🇨🇴' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD', symbol: '$', emoji: '🇺🇸' },
  { code: 'ES', name: 'España', currency: 'EUR', symbol: '€', emoji: '🇪🇸' },
  { code: 'MX', name: 'México', currency: 'MXN', symbol: '$', emoji: '🇲🇽' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', symbol: '$', emoji: '🇦🇷' },
  { code: 'CL', name: 'Chile', currency: 'CLP', symbol: '$', emoji: '🇨🇱' },
  { code: 'PE', name: 'Perú', currency: 'PEN', symbol: 'S/', emoji: '🇵🇪' }
];

const ACCOUNT_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#f97316', '#06b6d4',
  '#64748b', '#a3e635'
];

// Format number with dot thousands separator
const formatWithDots = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  const numericStr = val.toString().replace(/\D/g, '');
  if (!numericStr) return '';
  return numericStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormatted = (val) => {
  return parseFloat(val.toString().replace(/\./g, '')) || 0;
};

const OnboardingView = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '',
    country: 'CO',
    currency: 'COP',
    theme: 'dark'
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.theme);
  }, [data.theme]);

  // Multiple accounts support
  const [accounts, setAccounts] = useState([
    { name: '', balanceRaw: '', colorIndex: 0, includeInTotal: true }
  ]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // --- Account handlers ---
  const updateAccount = (index, field, value) => {
    setAccounts(prev => prev.map((acc, i) => i === index ? { ...acc, [field]: value } : acc));
  };

  const handleBalanceChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    updateAccount(index, 'balanceRaw', raw);
  };

  const addAccount = () => {
    setAccounts(prev => [
      ...prev,
      { name: '', balanceRaw: '', colorIndex: prev.length % ACCOUNT_COLORS.length, includeInTotal: true }
    ]);
  };

  const removeAccount = (index) => {
    if (accounts.length <= 1) return;
    setAccounts(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    const initialAccounts = accounts
      .filter(a => a.name.trim())
      .map((a) => ({
        name: a.name.trim(),
        balance: parseFormatted(a.balanceRaw),
        icon: 'Wallet',
        color: ACCOUNT_COLORS[a.colorIndex % ACCOUNT_COLORS.length],
        includeInTotal: a.includeInTotal !== false
      }));

    onComplete({
      profile: {
        name: data.name,
        avatar: 'User',
        onboardingComplete: true
      },
      currency: data.currency,
      theme: data.theme,
      accounts: initialAccounts
    });
  };

  const isNextDisabled = () => {
    if (step === 2 && !data.name.trim()) return true;
    if (step === 3 && !accounts[0].name.trim()) return true; // first account name required
    return false;
  };

  const totalSteps = 3;

  return (
    <div style={styles.container} className="animate-fade">
      <div className="glass" style={styles.card}>
        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar(step, totalSteps)} />
        </div>

        {step === 1 && (
          <div className="animate-fade">
            <div style={styles.iconCircle}>
              <Zap size={32} color="var(--primary)" />
            </div>
            <h1 style={styles.title}>¡Empecemos tu viaje!</h1>
            <p style={styles.subtitle}>Te ayudaremos a organizar tu dinero en unos sencillos pasos.</p>
            
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={styles.stepBadge}>1</div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>Perfil y Ubicación</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Dinos cómo te llamas y dónde vives.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={styles.stepBadge}>2</div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>Tus Cuentas</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Agrega tu saldo actual para empezar.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade">
            <div style={styles.iconCircle}>
              <User size={32} color="var(--primary)" />
            </div>
            <h1 style={styles.title}>¿Cómo te llamas?</h1>
            <p style={styles.subtitle}>Configura tu perfil básico.</p>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tu nombre o apodo</label>
              <input 
                type="text" 
                placeholder="Ej: Juan"
                value={data.name}
                onChange={e => setData({...data, name: e.target.value})}
                style={styles.input}
                autoFocus
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>País de Residencia</label>
              <div style={styles.countryGrid}>
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setData({...data, country: c.code, currency: c.currency})}
                    style={styles.currencyBtn(data.country === c.code)}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{c.emoji}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Estilo visual de la App</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setData({...data, theme: 'dark'})}
                  style={{
                    flex: 1, padding: '16px', borderRadius: '16px', 
                    border: data.theme === 'dark' ? '2px solid var(--secondary)' : '1px solid rgba(255,255,255,0.05)',
                    fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    backgroundColor: data.theme === 'dark' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    color: data.theme === 'dark' ? 'white' : 'var(--text-muted)'
                  }}
                >
                  <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🌙</span>
                  <span>Oscuro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setData({...data, theme: 'light'})}
                  style={{
                    flex: 1, padding: '16px', borderRadius: '16px', 
                    border: data.theme === 'light' ? '2px solid var(--secondary)' : '1px solid rgba(255,255,255,0.05)',
                    fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    backgroundColor: data.theme === 'light' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    color: data.theme === 'light' ? 'white' : 'var(--text-muted)'
                  }}
                >
                  <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>☀️</span>
                  <span>Claro</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade">
            <div style={styles.iconCircle}>
              <Wallet size={32} color="var(--secondary)" />
            </div>
            <h1 style={styles.title}>Mis Cuentas</h1>
            <p style={styles.subtitle}>
              Agrega tus cuentas y el saldo con el que empiezas hoy.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {accounts.map((acc, index) => (
                <div key={index} className="glass" style={styles.accountCard}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: ACCOUNT_COLORS[acc.colorIndex % ACCOUNT_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>
                      {index === 0 ? 'Cuenta Principal ✱' : `Cuenta ${index + 1}`}
                    </span>
                    {index > 0 && (
                      <button onClick={() => removeAccount(index)} style={styles.removeBtn}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Nombre */}
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder={index === 0 ? 'Ej: Efectivo, Banco...' : 'Nombre de la cuenta'}
                      value={acc.name}
                      onChange={e => updateAccount(index, 'name', e.target.value)}
                      style={styles.input}
                      autoFocus={index === 0}
                    />
                  </div>

                  {/* Saldo */}
                  <div style={{ marginBottom: '14px' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={`Saldo inicial (${data.currency})`}
                      value={formatWithDots(acc.balanceRaw)}
                      onChange={e => handleBalanceChange(index, e)}
                      style={styles.input}
                    />
                  </div>

                  {/* Color selector */}
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>COLOR</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {ACCOUNT_COLORS.map((color, ci) => (
                        <button
                          key={ci}
                          type="button"
                          onClick={() => updateAccount(index, 'colorIndex', ci)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: color, border: 'none', cursor: 'pointer',
                            outline: acc.colorIndex === ci ? `3px solid white` : '3px solid transparent',
                            outlineOffset: '2px',
                            transition: 'outline 0.15s',
                            flexShrink: 0
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Incluir en balance */}
                  <button
                    type="button"
                    onClick={() => updateAccount(index, 'includeInTotal', !acc.includeInTotal)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
                      backgroundColor: acc.includeInTotal ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${acc.includeInTotal ? 'rgba(16,185,129,0.4)' : 'var(--glass-border)'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Toggle pill */}
                    <div style={{
                      width: '36px', height: '20px', borderRadius: '10px', flexShrink: 0,
                      backgroundColor: acc.includeInTotal ? '#10b981' : 'rgba(255,255,255,0.15)',
                      position: 'relative', transition: 'background-color 0.2s',
                    }}>
                      <div style={{
                        width: '14px', height: '14px', borderRadius: '50%',
                        backgroundColor: 'white', position: 'absolute',
                        top: '3px', left: acc.includeInTotal ? '19px' : '3px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: '600', color: acc.includeInTotal ? '#10b981' : 'var(--text-muted)' }}>
                        {acc.includeInTotal ? 'Incluida en el balance' : 'Excluida del balance'}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addAccount} style={styles.addAccountBtn}>
              <Plus size={18} style={{ marginRight: '6px' }} />
              Añadir otra cuenta
            </button>
          </div>
        )}

        <div style={styles.footer}>
          {step > 1 && (
            <button onClick={prevStep} style={styles.backBtn}>
              <ChevronLeft size={20} />
              Atrás
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < totalSteps ? (
            <button 
              onClick={nextStep} 
              disabled={isNextDisabled()}
              style={{...styles.nextBtn, opacity: isNextDisabled() ? 0.5 : 1}}
            >
              Siguiente
              <ChevronRight size={20} />
            </button>
          ) : (
            <button onClick={handleFinish} style={styles.finishBtn}>
              <Check size={20} style={{ marginRight: '8px' }} />
              Comenzar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'var(--bg-color)',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    padding: '40px 32px',
    borderRadius: '32px',
    position: 'relative',
    overflow: 'hidden',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  progressBar: (step, total) => ({
    height: '100%',
    width: `${(step / total) * 100}%`,
    backgroundColor: 'var(--primary)',
    transition: 'width 0.3s ease',
  }),
  iconCircle: {
    width: '70px', height: '70px', borderRadius: '24px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px auto',
    border: '1px solid var(--glass-border)',
  },
  title: { fontSize: '1.8rem', fontWeight: '800', textAlign: 'center', marginBottom: '8px' },
  subtitle: { fontSize: '0.95rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '28px' },
  inputGroup: { marginBottom: '24px' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', marginLeft: '4px' },
  input: {
    width: '100%', padding: '14px 16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box',
  },
  accountCard: {
    padding: '16px',
    borderRadius: '20px',
    border: '1px solid var(--glass-border)',
  },
  colorDot: {
    width: '12px', height: '12px', borderRadius: '50%',
  },
  removeBtn: {
    background: 'none', color: 'var(--danger)', padding: '4px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  addAccountBtn: {
    width: '100%', padding: '14px', marginTop: '16px',
    borderRadius: '16px', border: '1px dashed var(--primary)',
    color: 'var(--primary)', background: 'rgba(74,222,128,0.05)',
    fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  currencyGrid: { display: 'flex', gap: '12px' },
  currencyBtn: (active) => ({
    flex: 1, padding: '16px 8px', borderRadius: '18px',
    backgroundColor: active ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : 'var(--text-muted)',
    border: '1px solid ' + (active ? 'var(--primary)' : 'var(--glass-border)'),
    display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer',
  }),
  stepBadge: {
    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(74, 222, 128, 0.2)',
    color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0
  },
  countryGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' },
  avatarGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
    justifyItems: 'center',
  },
  avatarBtn: (active, color) => ({
    width: '60px', height: '60px', borderRadius: '20px',
    backgroundColor: active ? color : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : 'var(--text-muted)',
    border: '1px solid ' + (active ? color : 'var(--glass-border)'),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s', cursor: 'pointer',
  }),
  footer: { display: 'flex', alignItems: 'center', marginTop: '32px', minHeight: '56px' },
  nextBtn: {
    padding: '12px 24px', borderRadius: '16px', backgroundColor: 'var(--primary)',
    color: 'white', fontWeight: '700', border: 'none', display: 'flex', alignItems: 'center', gap: '8px',
    cursor: 'pointer',
  },
  backBtn: {
    padding: '12px 16px', borderRadius: '16px', color: 'var(--text-muted)',
    background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px',
    cursor: 'pointer',
  },
  finishBtn: {
    padding: '16px 32px', borderRadius: '18px', backgroundColor: 'var(--secondary)',
    color: 'white', fontWeight: '800', border: 'none', display: 'flex', alignItems: 'center',
    cursor: 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
  }
};

export default OnboardingView;
