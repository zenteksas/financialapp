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
  const [viewDate, setViewDate] = useState(new Date());
  const [rangeLabel, setRangeLabel] = useState('');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [series, setSeries] = useState([]);
  const [chartOptions, setChartOptions] = useState({});
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [currentPeriodFilteredTxs, setCurrentPeriodFilteredTxs] = useState([]);

  useEffect(() => {
    processData();
  }, [transactions, categories, type, period, selectedAccountId, customRange, viewDate]);

  const handlePrevPeriod = () => {
    const d = new Date(viewDate);
    if (period === 'día') d.setDate(d.getDate() - 1);
    else if (period === 'semana') d.setDate(d.getDate() - 7);
    else if (period === 'mes') d.setMonth(d.getMonth() - 1);
    else if (period === 'año') d.setFullYear(d.getFullYear() - 1);
    setViewDate(d);
  };

  const handleNextPeriod = () => {
    const d = new Date(viewDate);
    if (period === 'día') d.setDate(d.getDate() + 1);
    else if (period === 'semana') d.setDate(d.getDate() + 7);
    else if (period === 'mes') d.setMonth(d.getMonth() + 1);
    else if (period === 'año') d.setFullYear(d.getFullYear() + 1);
    setViewDate(d);
  };

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
        return txDate.toDateString() === viewDate.toDateString();
      }
      if (period === 'semana') {
        const startOfWeek = new Date(viewDate);
        startOfWeek.setDate(viewDate.getDate() - (viewDate.getDay() === 0 ? 6 : viewDate.getDay() - 1)); // Mon start
        startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);
        return txDate >= startOfWeek && txDate <= endOfWeek;
      }
      if (period === 'mes') {
        return txDate.getMonth() === viewDate.getMonth() && txDate.getFullYear() === viewDate.getFullYear();
      }
      if (period === 'año') {
        return txDate.getFullYear() === viewDate.getFullYear();
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
    if (period === 'día') {
      const today = new Date();
      if (viewDate.toDateString() === today.toDateString()) {
        setRangeLabel('Hoy');
      } else {
        setRangeLabel(viewDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
      }
    }
    else if (period === 'semana') {
      const startOfWeek = new Date(viewDate);
      startOfWeek.setDate(viewDate.getDate() - (viewDate.getDay() === 0 ? 6 : viewDate.getDay() - 1));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const today = new Date();
      const sToday = new Date(today);
      sToday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
      
      if (startOfWeek.toDateString() === sToday.toDateString()) {
        setRangeLabel('Esta semana');
      } else {
        setRangeLabel(`${startOfWeek.getDate()} ${startOfWeek.toLocaleDateString('es-ES', { month: 'short' })} – ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString('es-ES', { month: 'short' })}`);
      }
    }
    else if (period === 'mes') setRangeLabel(viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
    else if (period === 'año') setRangeLabel(viewDate.getFullYear().toString());
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

      {/* 1, 2: Toggles GASTOS/INGRESOS */}
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

      {/* 3: Periods Filter */}
      <div style={styles.periods}>
        {['Día', 'Semana', 'Mes', 'Año', 'Período'].map(p => (
          <button 
            key={p} 
            style={styles.periodBtn(period === p.toLowerCase())}
            onClick={() => {
              const prev = period;
              setPeriod(p.toLowerCase());
              if (p === 'Período') setIsPickerOpen(true);
              else if (prev === p.toLowerCase()) setIsPickerOpen(true); // If already selected, open picker
              else setViewDate(new Date()); // Reset if changing period
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 4: Date Info with Navigation */}
      <div style={styles.rangeNav}>
        <button onClick={handlePrevPeriod} style={styles.navBtn}>
          <ChevronLeft size={20} />
        </button>
        <span 
          style={styles.rangeLabel}
          onClick={() => setIsPickerOpen(true)}
        >
          {rangeLabel}
        </span>
        <button onClick={handleNextPeriod} style={styles.navBtn}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 5: Chart Area (Independent Container) */}
      <div style={styles.chartWrapper}>
        <div style={styles.chartContainer}>
          <div style={styles.chartGlow} />
          {series.length > 0 ? (
            <Chart options={chartOptions} series={series} type="donut" height="260" />
          ) : (
            <div style={styles.noData}>No hay datos en este periodo</div>
          )}
        </div>

        {/* 6: Add Button */}
        <button onClick={() => onAddClick(type)} style={styles.addBtnFloating}>
          <Plus size={20} />
          <span>Nuevo {type === 'expense' ? 'Gasto' : 'Ingreso'}</span>
        </button>
      </div>

      {/* Advanced Picker Modal */}
      {isPickerOpen && (
        <AdvancedPicker 
          mode={period}
          currentDate={viewDate}
          customRange={customRange}
          onSelect={(date) => { setViewDate(date); setIsPickerOpen(false); }}
          onSelectRange={(start, end) => { setCustomRange({ start, end }); setPeriod('período'); setIsPickerOpen(false); }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

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

const AdvancedPicker = ({ mode, currentDate, onSelect, onSelectRange, onClose, customRange }) => {
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const handleMonthYearSelect = (m, y) => {
    const d = new Date(y, m, 1);
    onSelect(d);
  };

  const getWeeksOfMonth = (m, y) => {
    const weeks = [];
    let d = new Date(y, m, 1);
    // Adjust to first Monday
    while (d.getDay() !== 1) {
      d.setDate(d.getDate() - 1);
    }
    
    for (let i = 0; i < 6; i++) {
      const start = new Date(d);
      const end = new Date(d);
      end.setDate(d.getDate() + 6);
      
      // If the entire week is in the next month, stop
      if (i > 0 && start.getMonth() !== (m % 12) && start.getMonth() !== ((m + 11) % 12)) {
         // This logic is a bit tricky, let's just make sure we capture weeks that intersect the month
      }

      weeks.push({ start, end });
      d.setDate(d.getDate() + 7);

      // Stop if we've passed the month and the next week is entirely in next month
      if (d.getMonth() !== m && d.getDate() > 7) break;
    }
    return weeks;
  };

  return (
    <div style={styles.pickerOverlay} onClick={onClose}>
      <div className="glass" style={styles.pickerModal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
            {mode === 'día' ? 'Seleccione el día' : mode === 'semana' ? 'Seleccione la semana' : mode === 'mes' ? 'Seleccione el mes' : mode === 'año' ? 'Seleccione el año' : 'Seleccione periodo'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>Cerrar</button>
        </div>

        {mode === 'día' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="date" 
              defaultValue={currentDate.toISOString().split('T')[0]} 
              onChange={(e) => onSelect(new Date(e.target.value + 'T12:00:00'))}
              style={styles.pickerInput}
            />
          </div>
        )}

        {mode === 'mes' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {months.map((m, i) => (
              <button 
                key={m} 
                onClick={() => handleMonthYearSelect(i, selectedYear)}
                style={styles.pickerChip(selectedMonth === i)}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {mode === 'año' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[2024, 2025, 2026].map(y => (
              <button 
                key={y} 
                onClick={() => handleMonthYearSelect(selectedMonth, y)}
                style={styles.pickerChip(selectedYear === y)}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {mode === 'semana' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button onClick={() => setSelectedYear(selectedYear - 1)} style={styles.navBtn}><ChevronLeft size={16}/></button>
              <span style={{ fontWeight: '700' }}>{selectedYear}</span>
              <button onClick={() => setSelectedYear(selectedYear + 1)} style={styles.navBtn}><ChevronRight size={16}/></button>
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               {months.map((m, i) => (
                 <button 
                  key={m} 
                  onClick={() => setSelectedMonth(i)}
                  style={{ 
                    padding: '6px 12px', borderRadius: '12px', border: 'none',
                    backgroundColor: selectedMonth === i ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                    color: selectedMonth === i ? 'var(--secondary)' : 'var(--text-muted)',
                    fontWeight: selectedMonth === i ? '700' : '400',
                    whiteSpace: 'nowrap'
                  }}
                 >
                   {m}
                 </button>
               ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
               {getWeeksOfMonth(selectedMonth, selectedYear).map((w, idx) => {
                 const isSelected = currentDate >= w.start && currentDate <= w.end;
                 return (
                   <button 
                    key={idx} 
                    onClick={() => onSelect(w.start)}
                    style={{ 
                      padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--glass-border)',
                      backgroundColor: isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#000' : 'var(--text-main)',
                      fontWeight: '700', minWidth: '80px'
                    }}
                   >
                     {w.start.getDate()}-{w.end.getDate()}
                   </button>
                 );
               })}
            </div>
          </div>
        )}

        {mode === 'período' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="date" value={customRange.start} onChange={e => onSelectRange(e.target.value, customRange.end)} style={styles.pickerInput} />
              <span>–</span>
              <input type="date" value={customRange.end} onChange={e => onSelectRange(customRange.start, e.target.value)} style={styles.pickerInput} />
            </div>
            <button 
              className="glass" 
              style={{ padding: '12px', borderRadius: '14px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '700' }}
              onClick={onClose}
            >
              Aplicar Periodo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  topNav: { marginBottom: '16px' },
  tabs: { 
    display: 'flex', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '4px',
    gap: '4px',
    border: '1px solid var(--glass-border)',
  },
  tab: (active) => ({
    flex: 1,
    padding: '10px',
    borderRadius: '12px',
    backgroundColor: active ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
    color: active ? 'var(--secondary)' : 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  }),
  periods: { 
    display: 'flex', 
    justifyContent: 'space-between',
    padding: '4px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: '14px',
    marginBottom: '16px',
    gap: '4px'
  },
  periodBtn: (active) => ({
    flex: 1,
    padding: '8px 4px', 
    borderRadius: '10px',
    background: active ? 'rgba(74, 222, 128, 0.1)' : 'transparent', 
    border: 'none',
    color: active ? 'var(--secondary)' : 'var(--text-muted)',
    fontSize: '0.7rem', 
    fontWeight: '700', 
    cursor: 'pointer',
    transition: 'all 0.2s'
  }),
  rangeNav: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '12px', marginBottom: '20px', color: 'var(--text-main)'
  },
  navBtn: {
    background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)',
    padding: '6px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer'
  },
  rangeLabel: {
    fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)',
    cursor: 'pointer', padding: '6px 16px', backgroundColor: 'rgba(74, 222, 128, 0.05)',
    borderRadius: '14px', minWidth: '140px', textAlign: 'center'
  },
  chartWrapper: {
    padding: '10px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '340px'
  },
  chartContainer: { 
    width: '100%',
    height: '260px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative'
  },
  chartGlow: {
    position: 'absolute',
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
    zIndex: 0,
    opacity: 0.3
  },
  noData: { color: 'var(--text-muted)', fontSize: '0.9rem' },
  addBtnFloating: {
    marginTop: '20px',
    padding: '12px 24px', borderRadius: '24px', 
    backgroundColor: '#fbbf24', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#000',
    boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: '800', transition: 'all 0.2s'
  },
  categoryList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' },
  catItem: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '18px'
  },
  catIcon: (color) => ({
    width: '36px', height: '36px', borderRadius: '12px',
    backgroundColor: `${color}20`, color: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `1px solid ${color}40`
  }),
  catInfo: { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catName: { color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500' },
  catValues: { display: 'flex', gap: '8px', alignItems: 'center' },
  catPercent: { color: 'var(--text-muted)', fontSize: '0.8rem' },
  catAmount: { color: 'var(--text-heading)', fontWeight: '800', fontSize: '0.95rem' },
  activityItem: {
    padding: '16px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '16px'
  },
  pickerOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end',
    zIndex: 5000, backdropFilter: 'blur(8px)'
  },
  pickerModal: {
    width: '100%', borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
    padding: '32px 24px calc(32px + var(--safe-area-bottom))',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto'
  },
  pickerInput: {
    width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)', color: 'var(--text-main)', outline: 'none'
  },
  pickerChip: (active) => ({
    padding: '12px', borderRadius: '14px', border: '1px solid var(--glass-border)',
    backgroundColor: active ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.03)',
    color: active ? 'var(--secondary)' : 'var(--text-muted)',
    fontWeight: active ? '700' : '400', cursor: 'pointer'
  })
};

export default StatsDashboard;
