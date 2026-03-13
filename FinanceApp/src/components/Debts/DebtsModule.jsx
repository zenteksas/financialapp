import DebtModal from './DebtModal';
import StrategyView from './StrategyView';
import SimulatorView from './SimulatorView';
import { db } from '../../utils/db';

const DebtsModule = ({ debts, totals, onUpdate }) => {
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [editingDebt, setEditingDebt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incomeInput, setIncomeInput] = useState(db.getIncome() || '');

  const handleAdd = () => {
    setEditingDebt(null);
    setIsModalOpen(true);
  };

  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    db.addDebt(data);
    onUpdate();
  };

  const handleDelete = (id) => {
    db.deleteDebt(id);
    onUpdate();
  }

  // Determine Health color
  const getHealthColor = () => {
    if (totals.debtRatio <= 30) return 'var(--secondary)';
    if (totals.debtRatio <= 50) return 'var(--accent)';
    return 'var(--danger)';
  };

  return (
    <div className="animate-fade">
      <header style={styles.header}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Mis Deudas</h1>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => setIsIncomeModalOpen(true)}
          >
            <div style={{ ...styles.healthIndicator, backgroundColor: getHealthColor() }}>
              <Heart size={14} fill="white" color="white" />
              <span>{Math.round(totals.debtRatio)}%</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Indice de Deuda</p>
          </div>
        </div>
      </header>

      {/* Internal Sub-Tabs */}
      <div style={styles.tabBar}>
        <button 
          onClick={() => setActiveSubTab('list')}
          style={styles.tab(activeSubTab === 'list')}
        >
          Deudas
        </button>
        <button 
          onClick={() => setActiveSubTab('strategy')}
          style={styles.tab(activeSubTab === 'strategy')}
        >
          Estrategia
        </button>
        <button 
          onClick={() => setActiveSubTab('sim')}
          style={styles.tab(activeSubTab === 'sim')}
        >
          Simulador
        </button>
      </div>

      <main style={{ marginTop: '24px' }}>
        {activeSubTab === 'list' && (
          <div className="animate-fade">
            <div className="glass" style={styles.summaryCard}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Deuda Total</span>
                <h2 style={styles.summaryVal}>${totals.totalDebt.toLocaleString()}</h2>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Cuota Mensual</span>
                <h2 style={styles.summaryVal}>${totals.totalDebtQuota.toLocaleString()}</h2>
              </div>
            </div>

            <button onClick={handleAdd} style={styles.addBtn}>
              <Plus size={20} style={{ marginRight: '8px' }} />
              Agregar Nueva Deuda
            </button>

            <div style={styles.debtList}>
              {debts.length === 0 ? (
                <div className="glass" style={styles.empty}>
                  <p style={{ color: 'var(--text-muted)' }}>No tienes deudas registradas.</p>
                </div>
              ) : (
                debts.map(d => (
                  <div 
                    key={d.id} 
                    className="glass" 
                    style={styles.debtCard}
                    onClick={() => handleEdit(d)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>{d.nombre}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{(d.ea * 100).toFixed(1)}% E.A</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={styles.cardLabel}>Monto</p>
                        <p style={styles.cardVal}>${d.monto.toLocaleString()}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={styles.cardLabel}>Cuota Mín.</p>
                        <p style={styles.cardVal}>${d.cuotaMinima.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'strategy' && (
          <StrategyView debts={debts} />
        )}

        {activeSubTab === 'sim' && (
          <SimulatorView debts={debts} />
        )}
      </main>

      <DebtModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        initialData={editingDebt}
      />

      {isIncomeModalOpen && (
        <div style={modalStyles.overlay} className="animate-fade">
          <div className="glass" style={modalStyles.modal}>
            <h3>Ingresos Mensuales</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '12px 0' }}>
              Define tus ingresos para calcular tu salud financiera.
            </p>
            <input 
              type="number" 
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              placeholder="Ej: 3000000"
              style={modalStyles.input}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                onClick={() => setIsIncomeModalOpen(false)} 
                style={modalStyles.cancelBtn}
              >
                Cerrar
              </button>
              <button 
                onClick={() => { db.saveIncome(parseFloat(incomeInput) || 0); onUpdate(); setIsIncomeModalOpen(false); }}
                style={modalStyles.saveBtn}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2500, padding: '20px', backdropFilter: 'blur(4px)'
  },
  modal: { width: '100%', maxWidth: '350px', padding: '24px', borderRadius: '24px' },
  input: {
    width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'white', outline: 'none'
  },
  saveBtn: { flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: '600' },
  cancelBtn: { padding: '12px', color: 'var(--text-muted)', background: 'none' },
};

const styles = {
  header: { marginBottom: '28px' },
  healthIndicator: {
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  tabBar: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '4px',
    gap: '4px',
  },
  tab: (active) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '12px',
    backgroundColor: active ? 'var(--surface-color)' : 'transparent',
    color: active ? 'var(--text-main)' : 'var(--text-muted)',
    fontSize: '0.9rem',
    fontWeight: active ? '600' : '400',
    border: active ? '1px solid var(--glass-border)' : '1px solid transparent',
  }),
  summaryCard: {
    display: 'flex',
    padding: '24px',
    borderRadius: '24px',
    gap: '24px',
    marginBottom: '20px',
  },
  summaryItem: { flex: 1 },
  summaryLabel: { display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' },
  summaryVal: { fontSize: '1.4rem', fontWeight: '700' },
  addBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '18px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px dashed var(--glass-border)',
    color: 'var(--text-main)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '28px',
  },
  debtList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  debtCard: { padding: '20px', borderRadius: '20px', cursor: 'pointer' },
  cardLabel: { fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' },
  cardVal: { fontWeight: '700', fontSize: '1.1rem' },
  empty: { padding: '40px', borderRadius: '24px', textAlign: 'center' },
};

export default DebtsModule;
