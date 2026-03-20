import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, AlertTriangle, CheckCircle2, Trash2, Plus, X } from 'lucide-react';
import { db } from '../../utils/db';

const REMINDER_COLORS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Naranja', value: '#f59e0b' },
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Púrpura', value: '#8b5cf6' }
];

const RemindersModule = () => {
  const [reminders, setReminders] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    color: '#3b82f6',
    recurrence: 'none'
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setReminders(await db.getReminders());
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.title.trim()) return;
    
    await db.addReminder(newReminder);
    setNewReminder({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      color: '#3b82f6',
      recurrence: 'none'
    });
    setIsFormOpen(false);
    await loadReminders();
    
    // Dispatch custom event to update notification bell in App.jsx
    window.dispatchEvent(new Event('dataUpdated'));
  };

  const handleToggleComplete = async (id) => {
    await db.toggleReminderComplete(id);
    await loadReminders();
    window.dispatchEvent(new Event('dataUpdated'));
  };

  const handleDelete = async (id) => {
    await db.deleteReminder(id);
    await loadReminders();
    window.dispatchEvent(new Event('dataUpdated'));
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Recordatorios</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona tus tareas y alertas personalizadas</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          style={{
            padding: '12px 20px', borderRadius: '14px', backgroundColor: 'var(--primary)',
            color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={20} />
          Nuevo
        </button>
      </header>

      {isFormOpen && (
        <div className="glass animate-fade-in" style={styles.formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Nuevo Recordatorio</h3>
            <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleAddReminder}>
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>TÍTULO</label>
              <input 
                type="text" 
                placeholder="Ej: Pagar internet, Revisar ahorros..." 
                value={newReminder.title}
                onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                style={styles.input}
                required
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>FECHA</label>
                <input 
                  type="date" 
                  value={newReminder.date}
                  onChange={e => setNewReminder({...newReminder, date: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>HORA</label>
                <input 
                  type="time" 
                  value={newReminder.time}
                  onChange={e => setNewReminder({...newReminder, time: e.target.value})}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={styles.label}>REPETIR</label>
              <select 
                value={newReminder.recurrence}
                onChange={e => setNewReminder({...newReminder, recurrence: e.target.value})}
                style={styles.input}
              >
                <option value="none">Ninguna</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={styles.label}>COLOR DE ALERTA</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {REMINDER_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setNewReminder({...newReminder, color: c.value})}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      backgroundColor: c.value, border: 'none', cursor: 'pointer',
                      outline: newReminder.color === c.value ? '2px solid white' : 'none',
                      outlineOffset: '2px'
                    }}
                  />
                ))}
              </div>
            </div>

            <button type="submit" style={styles.submitBtn}>
              Guardar Recordatorio
            </button>
          </form>
        </div>
      )}

      <div style={styles.list}>
        {reminders.length === 0 ? (
          <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '24px', opacity: 0.7 }}>
            <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-muted)' }}>No tienes recordatorios programados.</p>
          </div>
        ) : (
          reminders.sort((a,b) => a.date.localeCompare(b.date)).map(rem => (
            <div key={rem.id} className="glass" style={{ ...styles.card, opacity: rem.completed ? 0.5 : 1 }}>
              <button 
                onClick={() => handleToggleComplete(rem.id)}
                style={{
                  ...styles.statusCircle,
                  backgroundColor: rem.completed ? rem.color : 'transparent',
                  border: `2px solid ${rem.color}`
                }}
              >
                {rem.completed && <CheckCircle2 size={16} color="white" />}
              </button>
              
              <div style={styles.info}>
                <h3 style={{ ...styles.title, textDecoration: rem.completed ? 'line-through' : 'none' }}>{rem.title}</h3>
                <div style={styles.dateRow}>
                  <Calendar size={14} />
                  <span>{rem.date}</span>
                  <Clock size={14} style={{ marginLeft: '8px' }} />
                  <span>{rem.time || '--:--'}</span>
                  {rem.recurrence && rem.recurrence !== 'none' && (
                    <span style={{ 
                      marginLeft: '8px', padding: '2px 6px', borderRadius: '6px', 
                      backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '0.7rem',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      🔄 {rem.recurrence === 'daily' ? 'Diario' : 
                         rem.recurrence === 'weekly' ? 'Semanal' : 
                         rem.recurrence === 'monthly' ? 'Mensual' : 'Anual'}
                    </span>
                  )}
                </div>
              </div>
              
              <button onClick={() => handleDelete(rem.id)} style={styles.deleteBtn}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="glass" style={styles.infoBox}>
        <h4 style={{ marginBottom: '8px', color: 'var(--secondary)' }}>Gestión de Alertas:</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Los recordatorios aparecerán en tu bandeja de notificaciones (campana) en la fecha programada. 
          Márcalos como completados para quitarlos de tus notificaciones activas.
        </p>
      </div>
    </div>
  );
};

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { padding: '16px 20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' },
  statusCircle: { 
    width: '28px', height: '28px', borderRadius: '50%', 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s', padding: 0
  },
  info: { flex: 1 },
  title: { fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '4px' },
  dateRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' },
  deleteBtn: { background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.6, padding: '8px' },
  infoBox: { padding: '24px', borderRadius: '28px', marginTop: '32px', backgroundColor: 'var(--surface-color)' },
  formCard: { padding: '24px', borderRadius: '28px', marginBottom: '24px', border: '1px solid var(--primary-light)' },
  label: { display: 'block', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)',
    backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '0.95rem'
  },
  submitBtn: {
    width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--secondary)',
    color: 'white', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer'
  }
};

export default RemindersModule;
