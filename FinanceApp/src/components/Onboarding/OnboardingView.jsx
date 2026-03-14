import React, { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, Check, Wallet, 
  User, Smile, Star, Heart, Zap, Coffee, 
  Gamepad, Rocket, Globe, Landmark, Coins
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

const CURRENCIES = [
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' }
];

const OnboardingView = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '',
    currency: 'COP',
    accountName: 'Efectivo',
    accountBalance: '',
    avatar: 'User'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = () => {
    onComplete({
      profile: {
        name: data.name,
        avatar: data.avatar,
        onboardingComplete: true
      },
      currency: data.currency,
      initialAccount: {
        name: data.accountName,
        balance: parseFloat(data.accountBalance) || 0,
        icon: 'Wallet',
        color: '#10b981',
        includeInTotal: true
      }
    });
  };

  const isNextDisabled = () => {
    if (step === 1 && !data.name.trim()) return true;
    if (step === 3 && !data.accountName.trim()) return true;
    return false;
  };

  return (
    <div style={styles.container} className="animate-fade">
      <div className="glass" style={styles.card}>
        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar(step)} />
        </div>

        {step === 1 && (
          <div className="animate-fade">
            <div style={styles.iconCircle}>
              <User size={32} color="var(--primary)" />
            </div>
            <h1 style={styles.title}>¡Bienvenido!</h1>
            <p style={styles.subtitle}>Comencemos configurando tu perfil básico.</p>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>¿Cómo te llamas?</label>
              <input 
                type="text" 
                placeholder="Tu nombre o apodo"
                value={data.name}
                onChange={e => setData({...data, name: e.target.value})}
                style={styles.input}
                autoFocus
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Divisa Principal</label>
              <div style={styles.currencyGrid}>
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setData({...data, currency: c.code})}
                    style={styles.currencyBtn(data.currency === c.code)}
                  >
                    <span style={{ fontWeight: '700' }}>{c.code}</span>
                    <span style={{ fontSize: '0.7rem' }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade">
            <div style={styles.iconCircle}>
              <Wallet size={32} color="var(--secondary)" />
            </div>
            <h1 style={styles.title}>Tu Primera Cuenta</h1>
            <p style={styles.subtitle}>Agreguemos el saldo con el que empiezas hoy.</p>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nombre de la Cuenta</label>
              <input 
                type="text" 
                placeholder="Ej: Efectivo, Nequi, Banco"
                value={data.accountName}
                onChange={e => setData({...data, accountName: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Saldo Actual ({data.currency})</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={data.accountBalance}
                onChange={e => setData({...data, accountBalance: e.target.value})}
                style={styles.input}
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade">
            <div style={styles.iconCircle}>
              <Smile size={32} color="var(--accent)" />
            </div>
            <h1 style={styles.title}>Personaliza tu Avatar</h1>
            <p style={styles.subtitle}>Elige un icono que te represente.</p>
            
            <div style={styles.avatarGrid}>
              {AVATARS.map(ava => {
                const Icon = ava.icon;
                return (
                  <button
                    key={ava.id}
                    onClick={() => setData({...data, avatar: ava.id})}
                    style={styles.avatarBtn(data.avatar === ava.id, ava.color)}
                  >
                    <Icon size={24} />
                  </button>
                );
              })}
              <button
                onClick={() => setData({...data, avatar: ''})}
                style={styles.avatarBtn(data.avatar === '', '#94a3b8')}
              >
                <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>Aa</span>
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
              {data.avatar ? 'Usarás un icono como perfil.' : 'Se usarán tus iniciales como perfil.'}
            </p>
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
          {step < 3 ? (
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
  progressBar: (step) => ({
    height: '100%',
    width: `${(step / 3) * 100}%`,
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
  subtitle: { fontSize: '0.95rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' },
  inputGroup: { marginBottom: '24px' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', marginLeft: '4px' },
  input: {
    width: '100%', padding: '16px', borderRadius: '18px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'white', fontSize: '1.1rem', outline: 'none',
  },
  currencyGrid: { display: 'flex', gap: '12px' },
  currencyBtn: (active) => ({
    flex: 1, padding: '16px 8px', borderRadius: '18px',
    backgroundColor: active ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
    color: active ? 'white' : 'var(--text-muted)',
    border: '1px solid ' + (active ? 'var(--primary)' : 'var(--glass-border)'),
    display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer',
  }),
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
  footer: { display: 'flex', alignItems: 'center', marginTop: '40px', minHeight: '56px' },
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
