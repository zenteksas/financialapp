import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ChevronLeft, ChevronRight, Utensils, Car, Home, ShoppingBag, Heart, Gamepad, Briefcase, GraduationCap, Plane, Coffee, Tv, Zap, Tag, Plus, Minus, Smartphone, PiggyBank, Receipt, ChevronDown } from 'lucide-react';
import DashboardView from './DashboardView';

const ICONS = { Utensils, Car, Home, ShoppingBag, Heart, Gamepad, Briefcase, GraduationCap, Plane, Coffee, Tv, Zap, Smartphone, PiggyBank, Receipt, Tag };

const StatsDashboard = ({ transactions, categories, onAddClick, selectedAccountId, accounts, currency, userProfile, onEditGoals }) => {
  const [type, setType] = useState('expense');
  const [period, setPeriod] = useState('semana');
  const [rangeLabel, setRangeLabel] = useState('');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isPickingRange, setIsPickingRange] = useState(false);
  const [series, setSeries] = useState([]);
  const [chartOptions, setChartOptions] = useState({});
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

  useEffect(() => {
    processData();
  }, [transactions, categories, type, period, selectedAccountId, customRange]);

  const processData = () => {
    // Filter by account
    let filteredTxs = transactions;
    if (selectedAccountId) {
      filteredTxs = transactions.filter(t => 
        (t.type === 'transfer' && (t.fromAccountId === selectedAccountId || t.toAccountId === selectedAccountId)) ||
        (t.type !== 'transfer' && (t.accountId || 'default') === selectedAccountId)
      );
    }

    // Filter by period
    const now = new Date();
    filteredTxs = filteredTxs.filter(tx => {
      const txDate = new Date(parseInt(tx.id));
      if (period === 'día') {
        return txDate.toDateString() === now.toDateString();
      }
      if (period === 'semana') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        return txDate >= startOfWeek;
      }
      if (period === 'mes') {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      if (period === 'año') {
        return txDate.getFullYear() === now.getFullYear();
      }
      if (period === 'período' && customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        end.setHours(23, 59, 59, 999);
        return txDate >= start && txDate <= end;
      }
      return true;
    });

    // Update range label
    if (period === 'día') setRangeLabel(now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
    else if (period === 'semana') setRangeLabel('Esta semana');
    else if (period === 'mes') setRangeLabel(now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
    else if (period === 'año') setRangeLabel(now.getFullYear().toString());
    else if (period === 'período' && customRange.start) setRangeLabel(`${customRange.start} – ${customRange.end}`);
    else setRangeLabel('Todo el tiempo');

    // Filter by type (income/expense)
    filteredTxs = filteredTxs.filter(t => t.type === type);
    
    // Group by category
    const totals = {};
    let grandTotal = 0;

    filteredTxs.forEach(tx => {
      const catId = tx.categoryId || 'other';
      totals[catId] = (totals[catId] || 0) + tx.amount;
      grandTotal += tx.amount;
    });

    const breakdown = Object.entries(totals).map(([id, amount]) => {
      const cat = categories.find(c => c.id === id) || { name: 'Otros', color: '#94a3b8', icon: 'Tag' };
      return {
        id,
        name: cat.name,
        amount,
        color: cat.color,
        icon: cat.icon,
        percentage: grandTotal > 0 ? (amount / grandTotal) * 100 : 0
      };
    }).sort((a, b) => b.amount - a.amount);

    setCategoryBreakdown(breakdown);

    setSeries(breakdown.map(b => b.amount));
    setChartOptions({
      chart: { type: 'donut', background: 'transparent' },
      labels: breakdown.map(b => b.name),
      colors: breakdown.map(b => b.color),
      stroke: { show: false },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: { theme: 'dark' },
      plotOptions: {
        pie: {
          donut: {
            size: '80%',
            labels: {
              show: false, // Moved outside for stability
            }
          }
        }
      }
    });
  };

  const grandTotal = series.reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade">
      <div style={styles.summaryContainer}>
         <div 
          style={styles.summaryBox} 
          onClick={() => onEditGoals(type)}
        >
          <p style={styles.summaryLabel}>Total {type === 'income' ? 'Ingresos' : 'Gastos'} ({period})</p>
          <h2 style={{ ...styles.summaryValue, color: type === 'income' ? 'var(--secondary)' : 'var(--danger)' }}>
            {grandTotal.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}
          </h2>
          <p style={styles.editHint}>Toca para editar meta mensual</p>
        </div>
      </div>

      <div style={styles.topNav}>
        <div style={styles.tabs}>
          <button 
            style={styles.tab(type === 'expense')} 
            onClick={() => setType('expense')}
          >
            GASTOS
          </button>
          <button 
            style={styles.tab(type === 'income')} 
            onClick={() => setType('income')}
          >
            INGRESOS
          </button>
        </div>
      </div>

      <div style={styles.periods}>
        {['Día', 'Semana', 'Mes', 'Año', 'Período'].map(p => (
          <button 
            key={p} 
            style={styles.periodBtn(period === p.toLowerCase())}
            onClick={() => {
              setPeriod(p.toLowerCase());
              if (p === 'Período') setIsPickingRange(true);
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {isPickingRange && (
        <div className="glass" style={{ padding: '16px', marginBottom: '16px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
          <input type="date" value={customRange.start} onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))} style={styles.dateInput} />
          <span style={{ color: 'var(--text-muted)' }}>–</span>
          <input type="date" value={customRange.end} onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))} style={styles.dateInput} />
          <button className="glass" style={{ padding: '6px 12px', borderRadius: '8px', color: 'var(--secondary)', border: '1px solid var(--secondary)' }} onClick={() => setIsPickingRange(false)}>OK</button>
        </div>
      )}

      <div className="glass" style={styles.chartCard}>
        <div style={styles.rangeNav}>
          <ChevronLeft size={20} style={{ opacity: 0.5 }} />
          <span>{rangeLabel}</span>
          <ChevronRight size={20} style={{ opacity: 0.5 }} />
        </div>

        <div style={styles.chartContainer}>
          {series.length > 0 ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Chart options={chartOptions} series={series} type="donut" height="250" />
              <div style={styles.chartFooter}>
                <p style={styles.footerLabel}>DISTRIBUCIÓN DE {type === 'income' ? 'INGRESOS' : 'GASTOS'}</p>
              </div>
            </div>
          ) : (
            <div style={styles.noData}>No hay datos en este periodo</div>
          )}
        </div>

        <button onClick={onAddClick} style={styles.addBtn}>
          <Plus size={24} />
        </button>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>DESGLOSE POR CATEGORÍA</h4>
        <div style={styles.categoryList}>
          {categoryBreakdown.map(cat => {
            const Icon = ICONS[cat.icon] || Tag;
            return (
              <div key={cat.id} style={styles.catItem}>
                <div style={styles.catIcon(cat.color)}>
                  <Icon size={20} />
                </div>
                <div style={styles.catInfo}>
                  <span style={styles.catName}>{cat.name}</span>
                  <div style={styles.catValues}>
                    <span style={styles.catPercent}>{cat.percentage.toFixed(0)} %</span>
                    <span style={styles.catAmount}>{cat.amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}</span>
                  </div>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--secondary)', opacity: 0.5 }} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>ACTIVIDAD RECIENTE</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {transactions.filter(t => t.type === type).slice(0, 5).map(tx => (
            <div 
              key={tx.id} 
              className="glass" 
              style={{ ...styles.activityItem, cursor: 'pointer' }}
              onClick={() => onEditTransaction(tx)}
            >
              <div style={styles.activityIcon(type === 'income' ? 'var(--secondary)' : 'var(--danger)')}>
                {type === 'income' ? <Plus size={16} /> : <Minus size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{tx.note || (categories.find(c => c.id === tx.categoryId)?.name) || 'Transacción'}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.date}</p>
              </div>
              <p style={{ fontWeight: '700', color: type === 'income' ? 'var(--secondary)' : 'var(--danger)', fontSize: '0.95rem' }}>
                {type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}
              </p>
            </div>
          ))}
          {transactions.filter(t => t.type === type).length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No hay actividad para mostrar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  topNav: { marginBottom: '16px' },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tab: (active) => ({
    flex: 1, padding: '12px', border: 'none', background: 'none',
    color: active ? 'var(--text-heading)' : 'var(--text-muted)',
    fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer',
    borderBottom: active ? '3px solid var(--secondary)' : '3px solid transparent',
    transition: 'all 0.2s'
  }),
  periods: { 
    display: 'flex', justifyContent: 'space-between', marginBottom: '16px',
    padding: '0 8px'
  },
  periodBtn: (active) => ({
    padding: '6px 0', background: 'none', border: 'none',
    color: active ? 'var(--secondary)' : 'var(--text-muted)',
    fontSize: '0.85rem', fontWeight: '400', cursor: 'pointer',
    borderBottom: active ? '2px solid var(--secondary)' : '2px solid transparent'
  }),
  summaryContainer: { marginBottom: '24px' },
  summaryBox: { 
    padding: '24px', 
    borderRadius: '24px', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    border: '1px solid var(--glass-border)',
    textAlign: 'center',
    cursor: 'pointer'
  },
  summaryLabel: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' },
  summaryValue: { fontSize: '2.2rem', fontWeight: '800', marginBottom: '4px' },
  editHint: { fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.6 },
  chartCard: {
    padding: '20px', borderRadius: '24px', position: 'relative',
    backgroundColor: '#1e1e1a' // Specific dark brown/green from image
  },
  rangeNav: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '24px', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)'
  },
  chartContainer: { 
    height: '300px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  chartFooter: {
    marginTop: '8px',
    textAlign: 'center'
  },
  footerLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    letterSpacing: '0.1em'
  },
  noData: { color: 'var(--text-muted)', fontSize: '0.9rem' },
  addBtn: {
    position: 'absolute', right: '16px', bottom: '16px', width: '48px', height: '48px',
    borderRadius: '24px', backgroundColor: '#fbbf24', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer'
  },
  categoryList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' },
  catItem: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px'
  },
  catIcon: (color) => ({
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: color, color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }),
  catInfo: { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catName: { color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '400' },
  catValues: { display: 'flex', gap: '8px', alignItems: 'center' },
  catPercent: { color: 'var(--text-muted)', fontSize: '0.85rem' },
  catAmount: { color: 'var(--text-heading)', fontWeight: '600', fontSize: '1rem' },
  activityItem: {
    padding: '16px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  activityIcon: (color) => ({
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    backgroundColor: `${color}20`,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }),
  dateInput: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-main)', padding: '6px 10px', borderRadius: '8px',
    outline: 'none', fontSize: '0.85rem'
  }
};

export default StatsDashboard;
