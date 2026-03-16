import React, { useState, useEffect } from 'react';
import { CreditCard, Zap, Tv, Home, Shield, Plus, MoreVertical, ShoppingBag, Heart } from 'lucide-react';
import { db } from '../../utils/db';
import PaymentModal from './PaymentModal';

const ICONS = { Tv, Zap, Shield, Home, ShoppingBag, Heart };

const PaymentsModule = ({ currency }) => {
  const [payments, setPayments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  useEffect(() => {
    setPayments(db.getPayments());
  }, []);

  const handleSave = (data) => {
    const updated = db.addPayment(data);
    setPayments(updated);
  };

  const handleDelete = (id) => {
    const updated = db.deletePayment(id);
    setPayments(updated);
  };

  const totalMonthly = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Pagos Habituales</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gestiona tus suscripciones y facturas fijas</p>
      </header>

      <div style={styles.list}>
        {payments.map(payment => {
          const Icon = ICONS[payment.icon] || CreditCard;
          return (
            <div key={payment.id} className="glass" style={styles.card} onClick={() => { setEditingPayment(payment); setIsModalOpen(true); }}>
              <div style={styles.iconCircle(payment.color)}>
                <Icon size={20} />
              </div>
              <div style={styles.info}>
                <h3 style={styles.name}>{payment.name}</h3>
                <p style={styles.meta}>{payment.category || 'Varios'} • Día {payment.date}</p>
              </div>
              <div style={styles.amountArea}>
                <p style={styles.amount}>{payment.amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</p>
                <MoreVertical size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          );
        })}
        
        <button className="glass" style={styles.addBtn} onClick={() => { setEditingPayment(null); setIsModalOpen(true); }}>
          <Plus size={20} style={{ marginRight: '8px' }} />
          Programar Nuevo Pago
        </button>
      </div>

      <div className="glass" style={styles.totalCard}>
        <p style={styles.totalLabel}>Total Mensual Habitual</p>
        <h2 style={styles.totalValue}>{totalMonthly.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</h2>
      </div>

      <PaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        initialData={editingPayment}
        currency={currency}
      />
    </div>
  );
};

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  card: { padding: '16px 20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' },
  iconCircle: (color) => ({
    width: '44px', height: '44px', borderRadius: '14px',
    backgroundColor: `${color}20`, color: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }),
  info: { flex: 1 },
  name: { fontSize: '1rem', fontWeight: '600', color: 'var(--text-heading)' },
  meta: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  amountArea: { textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' },
  amount: { fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' },
  addBtn: {
    padding: '18px', borderRadius: '20px', border: '1px dashed var(--primary)',
    color: 'var(--primary)', fontWeight: '700', background: 'rgba(74, 222, 128, 0.05)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
    marginTop: '8px'
  },
  totalCard: { padding: '24px', borderRadius: '28px', backgroundColor: 'var(--surface-color)', textAlign: 'center' },
  totalLabel: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' },
  totalValue: { fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-heading)' }
};

export default PaymentsModule;
