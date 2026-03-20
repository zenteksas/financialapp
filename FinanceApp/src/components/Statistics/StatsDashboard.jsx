import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ChevronLeft, ChevronRight, Utensils, Car, Home, ShoppingBag, Heart, Gamepad, Briefcase, GraduationCap, Plane, Coffee, Tv, Zap, Tag, Plus, Minus, Smartphone, PiggyBank, Receipt, ChevronDown } from 'lucide-react';

const ICONS = { Utensils, Car, Home, ShoppingBag, Heart, Gamepad, Briefcase, GraduationCap, Plane, Coffee, Tv, Zap, Smartphone, PiggyBank, Receipt, Tag };

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '');
};

const StatsDashboard = ({ transactions, categories, onAddClick, selectedAccountId, accounts, currency, userProfile, onEditGoals, onEditTransaction }) => {
  const [type, setType] = useState('expense');
  const [period, setPeriod] = useState('semana');
  const [rangeLabel, setRangeLabel] = useState('');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isPickingRange, setIsPickingRange] = useState(false);
  const [series, setSeries] = useState([]);
  const [chartOptions, setChartOptions] = useState({});
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [currentPeriodFilteredTxs, setCurrentPeriodFilteredTxs] = useState([]);

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
    const periodFiltered = filteredTxs.filter(tx => {
      const txDate = tx.date ? new Date(tx.date + 'T12:00:00') : new Date(parseInt(tx.id));
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
    
    setCurrentPeriodFilteredTxs(periodFiltered);

    // Filter by type (income/expense)
    let typedTxs = periodFiltered.filter(t => t.type === type);
    
    // Group by category
    const totals = {};
    let grandTotal = 0;

    typedTxs.forEach(tx => {
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
      chart: { type: 'donut', background: 'transparent', toolbar: { show: false }, animations: { enabled: true } },
      labels: breakdown.map(b => b.name),
      colors: breakdown.map(b => b.color),
      stroke: { show: false },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: { theme: 'dark' },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                offsetY: -10,
                formatter: () => 'TOTAL'
              },
              value: {
                show: true,
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--text-heading)',
                offsetY: 10,
                formatter: (val) => `${formatCompactNumber(parseFloat(val))} ${currency}`
              },
              total: {
                show: true,
                label: 'TOTAL',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                formatter: () => `${formatCompactNumber(grandTotal)} ${currency}`
              }
            }
          }
        }
      }
    });
  };

  const formatCompactNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' M';
    }
    if (number >= 1000) {
      return (number / 1000).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' K';
    }
    return number.toLocaleString('es-ES');
  };

  const grandTotal = series.reduce((a, b) => a + b, 0);

  useEffect(() => {
    setChartOptions(prev => ({
      ...prev,
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                offsetY: -10,
                formatter: () => 'TOTAL'
              },
              value: {
                show: true,
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--text-heading)',
                offsetY: 10,
                formatter: (val) => `${formatCompactNumber(parseFloat(val))} ${currency}`
              },
              total: {
                show: true,
                label: 'TOTAL',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                formatter: () => `${formatCompactNumber(grandTotal)} ${currency}`
              }
            }
          }
        }
      }
    }));
  }, [grandTotal, currency]);

  return (
    <div className="animate-fade" style={{ width: '100%' }}>

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
              setIsPickingRange(p === 'Período');
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

      <div style={styles.chartAreaWrapper}>
        <div style={styles.rangeNav}>
          <ChevronLeft size={20} style={{ opacity: 0.5 }} />
          <span>{rangeLabel}</span>
          <ChevronRight size={20} style={{ opacity: 0.5 }} />
        </div>

        <div style={styles.chartContainer}>
          <div style={styles.chartGlow} />
          {series.length > 0 ? (
            <Chart options={chartOptions} series={series} type="donut" height="100%" />
          ) : (
            <div style={styles.noData}>No hay datos en este periodo</div>
          )}
        </div>

        <button onClick={() => onAddClick(type)} style={styles.addBtnFloating}>
          <Plus size={20} />
          <span>Nuevo {type === 'expense' ? 'Gasto' : 'Ingreso'}</span>
        </button>
      </div>

      <div style={{ marginTop: '24px' }}>
        <div style={styles.categoryList}>
          {categoryBreakdown.map(cat => {
            const Icon = ICONS[cat.icon] || Tag;
            const isExpanded = expandedCategoryId === cat.id;
            const catTransactions = currentPeriodFilteredTxs.filter(t => t.categoryId === cat.id && t.type === type);

            return (
              <div key={cat.id} style={{ marginBottom: '8px' }}>
                <div 
                  style={{ ...styles.catItem, cursor: 'pointer' }}
                  onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                >
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
                  <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
                    <ChevronDown size={14} style={{ color: 'var(--secondary)', opacity: 0.5 }} />
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '8px 8px 8px 48px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {catTransactions.map(tx => (
                      <div 
                        key={tx.id} 
                        className="glass" 
                        style={{ ...styles.activityItem, padding: '12px', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); onEditTransaction(tx); }}
                      >
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>{tx.note || 'Sin nota'}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(tx.date)}</p>
                        </div>
                        <p style={{ fontWeight: '600', color: type === 'income' ? 'var(--secondary)' : 'var(--danger)', fontSize: '0.85rem' }}>
                          {tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {currency}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
    display: 'grid', 
    gridTemplateColumns: 'repeat(5, 1fr)',
    marginBottom: '16px',
    padding: '0 8px',
    width: '100%',
    boxSizing: 'border-box'
  },
  periodBtn: (active) => ({
    padding: '6px 0', 
    background: 'none', 
    border: 'none',
    color: active ? 'var(--secondary)' : 'var(--text-muted)',
    fontSize: '0.85rem', 
    fontWeight: '400', 
    cursor: 'pointer',
    borderBottom: active ? '2px solid var(--secondary)' : '2px solid transparent',
    flex: 1,
    textAlign: 'center'
  }),
  chartAreaWrapper: {
    padding: '20px 0',
    position: 'relative',
    height: '380px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'visible',
    boxSizing: 'border-box'
  },
  rangeNav: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '24px', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-main)'
  },
  chartContainer: { 
    width: '100%',
    height: '260px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
    flex: 'none'
  },
  chartGlow: {
    position: 'absolute',
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
    zIndex: 0,
    opacity: 0.5
  },
  chartFooter: {
    marginTop: '16px',
    textAlign: 'center'
  },
  footerLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase'
  },
  footerValue: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--text-heading)',
    margin: '4px 0'
  },
  noData: { color: 'var(--text-muted)', fontSize: '0.9rem' },
  addBtnFloating: {
    marginTop: '12px',
    padding: '12px 24px', borderRadius: '24px', 
    backgroundColor: '#fbbf24', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#000',
    boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)', cursor: 'pointer',
    fontSize: '0.9rem', fontWeight: '800', transition: 'all 0.2s',
    zIndex: 2
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
