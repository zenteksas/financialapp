import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const PerformanceStats = ({ transactions }) => {
  const [period, setPeriod] = useState('monthly');
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({});

  useEffect(() => {
    generateChartData();
  }, [transactions, period]);

  const generateChartData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    const monthlyData = months.map((_, index) => {
      const monthTxs = transactions.filter(tx => {
        const date = new Date(parseInt(tx.id));
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });

      const income = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      return { income, expense };
    });

    const incomeSeries = monthlyData.map(d => d.income);
    const expenseSeries = monthlyData.map(d => d.expense);

    setSeries([
      { name: 'Ingresos', data: incomeSeries },
      { name: 'Gastos', data: expenseSeries }
    ]);

    setOptions({
      chart: {
        type: 'bar',
        background: 'transparent',
        toolbar: { show: false },
        foreColor: 'var(--text-muted)'
      },
      colors: ['var(--secondary)', 'var(--danger)'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '60%',
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: false,
      },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: {
        categories: months,
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { labels: { formatter: (val) => `$${(val / 1000).toFixed(0)}k` } },
      fill: { opacity: 1 },
      legend: { position: 'top', horizontalAlign: 'right' },
      grid: { borderColor: 'var(--glass-border)', strokeDashArray: 4 },
      tooltip: { theme: 'dark' }
    });
  };

  const totalIncome = series[0]?.data.reduce((a, b) => a + b, 0) || 0;
  const totalExpense = series[1]?.data.reduce((a, b) => a + b, 0) || 0;

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>Rendimiento Anual</h1>
        <p style={{ color: 'var(--text-muted)' }}>Comparativa de ingresos vs gastos</p>
      </header>

      <div style={styles.metricsGrid}>
        <div className="glass" style={styles.metricCard}>
          <div style={styles.metricIcon('var(--secondary)')}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p style={styles.metricLabel}>Total Ingresos</p>
            <h3 style={styles.metricValue}>${totalIncome.toLocaleString()}</h3>
          </div>
        </div>
        <div className="glass" style={styles.metricCard}>
          <div style={styles.metricIcon('var(--danger)')}>
            <TrendingDown size={20} />
          </div>
          <div>
            <p style={styles.metricLabel}>Total Gastos</p>
            <h3 style={styles.metricValue}>${totalExpense.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="glass" style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>Flujo de Caja {new Date().getFullYear()}</h3>
          <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div style={{ minHeight: '300px' }}>
          {series.length > 0 && (
            <Chart options={options} series={series} type="bar" height="320" />
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  metricsGrid: { display: 'flex', gap: '16px', marginBottom: '24px' },
  metricCard: { flex: 1, padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px' },
  metricIcon: (color) => ({
    width: '40px', height: '40px', borderRadius: '12px',
    backgroundColor: `${color}20`, color: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }),
  metricLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' },
  metricValue: { fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)' },
  chartCard: { padding: '24px', borderRadius: '28px' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  chartTitle: { fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }
};

export default PerformanceStats;
