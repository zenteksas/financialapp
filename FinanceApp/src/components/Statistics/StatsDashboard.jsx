import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Calendar, Filter } from 'lucide-react';

const StatsDashboard = ({ transactions }) => {
  const [filter, setFilter] = useState('monthly');
  const [chartData, setChartData] = useState({
    series: [],
    options: {}
  });

  useEffect(() => {
    prepareChartData();
  }, [transactions, filter]);

  const prepareChartData = () => {
    // Basic implementation: Group by category or type
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const options = {
      chart: {
        type: 'donut',
        background: 'transparent',
        foreColor: '#94a3b8',
        toolbar: { show: false }
      },
      labels: ['Ingresos', 'Gastos'],
      colors: ['#10b981', '#ef4444'],
      stroke: { show: false },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontWeight: 500,
        markers: { radius: 12 }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Flujo Neto',
                formatter: () => `$${(income - expense).toFixed(0)}`
              }
            }
          }
        }
      },
      tooltip: { theme: 'dark' }
    };

    setChartData({
      series: [income, expense],
      options: options
    });
  };

  const barOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['#4f46e5'],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%',
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { theme: 'dark' }
  };

  const barSeries = [{
    name: 'Gastos',
    data: [30, 40, 35, 50, 49, 60, 70] // Placeholder for now
  }];

  return (
    <div className="animate-fade">
      <header style={styles.header}>
        <h1 style={{ marginBottom: '8px' }}>Estadísticas</h1>
        <div style={styles.filterRow}>
          <button 
            style={styles.filterBtn(filter === 'weekly')} 
            onClick={() => setFilter('weekly')}
          >
            Semana
          </button>
          <button 
            style={styles.filterBtn(filter === 'monthly')} 
            onClick={() => setFilter('monthly')}
          >
            Mes
          </button>
          <button 
            style={styles.filterBtn(filter === 'yearly')} 
            onClick={() => setFilter('yearly')}
          >
            Año
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div className="glass" style={styles.card}>
          <h3 style={styles.cardTitle}>Balance General</h3>
          <div style={{ minHeight: '300px' }}>
            {chartData.series.length > 0 && (
              <Chart 
                options={chartData.options} 
                series={chartData.series} 
                type="donut" 
                width="100%" 
                height="320" 
              />
            )}
          </div>
        </div>

        <div className="glass" style={styles.card}>
          <h3 style={styles.cardTitle}>Gasto Semanal</h3>
          <Chart 
            options={barOptions} 
            series={barSeries} 
            type="bar" 
            width="100%" 
            height="200" 
          />
        </div>
      </main>
    </div>
  );
};

const styles = {
  header: { marginBottom: '32px' },
  filterRow: {
    display: 'flex',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: '4px',
    borderRadius: '12px',
    width: 'fit-content'
  },
  filterBtn: (active) => ({
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
    backgroundColor: active ? 'var(--primary)' : 'transparent',
    color: active ? 'white' : 'var(--text-muted)',
    transition: 'all 0.2s ease'
  }),
  main: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { padding: '24px', borderRadius: '24px' },
  cardTitle: { fontSize: '1rem', marginBottom: '20px', color: 'var(--text-main)', fontWeight: '600' }
};

export default StatsDashboard;
