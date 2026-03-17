import React, { useState } from 'react';
import { FileDown, FileSpreadsheet, FileText, CheckCircle, Table, ChevronDown, List } from 'lucide-react';
import { db } from '../../utils/db';

const ExportModule = ({ currency }) => {
  const [status, setStatus] = useState({ type: null, message: '' });
  const [exportType, setExportType] = useState('all'); // all, income, expense

  const getFilteredTransactions = () => {
    const transactions = db.getTransactions();
    const categories = db.getCategories();
    const accounts = db.getAccounts();

    return transactions.filter(tx => {
      if (exportType === 'all') return true;
      return tx.type === exportType;
    }).map(tx => {
      const cat = categories.find(c => c.id === tx.categoryId);
      const acc = accounts.find(a => a.id === (tx.accountId || 'default'));
      return {
        ...tx,
        categoryName: cat ? cat.name : 'Sin categoría',
        accountName: acc ? acc.name : 'Efectivo'
      };
    });
  };

  const handleExportCSV = () => {
    try {
      const txs = getFilteredTransactions();
      if (txs.length === 0) {
        setStatus({ type: 'error', message: 'No hay transacciones para exportar.' });
        return;
      }

      const headers = ['Fecha', 'Tipo', 'Categoría', 'Cuenta', 'Monto', 'Nota'];
      const rows = txs.map(tx => [
        tx.date,
        tx.type === 'income' ? 'Ingreso' : tx.type === 'expense' ? 'Gasto' : 'Transferencia',
        tx.categoryName,
        tx.accountName,
        tx.amount,
        `"${tx.note || ''}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance_export_${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setStatus({ type: 'success', message: 'Archivo CSV generado y descargado.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Error al generar el archivo CSV.' });
    }
  };

  const handleExportPDF = () => {
    const txs = getFilteredTransactions();
    if (txs.length === 0) {
      setStatus({ type: 'error', message: 'No hay transacciones para exportar.' });
      return;
    }

    // Create a printable window
    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>Exportación de Transacciones - FinanceApp</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
            .header-info { margin-bottom: 30px; color: #6b7280; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background-color: #f9fafb; padding: 12px; border-bottom: 2px solid #e5e7eb; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .amount { text-align: right; font-weight: 700; }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
            .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Reporte de Transacciones</h1>
          <div class="header-info">
            <p><strong>Tipo de Reporte:</strong> ${exportType === 'all' ? 'Todos los movimientos' : exportType === 'income' ? 'Solo ingresos' : 'Solo gastos'}</p>
            <p><strong>Fecha de Generación:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Moneda:</strong> ${currency}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Cuenta</th>
                <th>Nota</th>
                <th class="amount">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${txs.map(tx => `
                <tr>
                  <td>${tx.date}</td>
                  <td>${tx.type === 'income' ? 'Ingreso' : tx.type === 'expense' ? 'Gasto' : 'Transferencia'}</td>
                  <td>${tx.categoryName}</td>
                  <td>${tx.accountName}</td>
                  <td>${tx.note || '-'}</td>
                  <td class="amount ${tx.type}">${tx.amount.toLocaleString('es-ES')} ${currency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Generado por FinanceApp - Tu control financiero personal
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    setStatus({ type: 'success', message: 'Documento generado. Revisa la ventana de impresión.' });
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Exportar Reportes</h1>
        <p style={{ color: 'var(--text-muted)' }}>Genera documentos CSV o PDF con tus movimientos financieros.</p>
      </header>

      {status.message && (
        <div className="glass" style={{ 
          padding: '16px', borderRadius: '16px', marginBottom: '24px', 
          display: 'flex', alignItems: 'center', gap: '12px',
          backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${status.type === 'success' ? 'var(--secondary)' : 'var(--danger)'}`,
          color: status.type === 'success' ? 'var(--secondary)' : 'var(--danger)'
        }}>
          <CheckCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{status.message}</span>
        </div>
      )}

      <div className="glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '32px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: '600' }}>FILTRAR MOVIMIENTOS</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'Todo', icon: List },
            { id: 'income', label: 'Ingresos', icon: ChevronDown, color: 'var(--secondary)' },
            { id: 'expense', label: 'Gastos', icon: ChevronDown, color: 'var(--danger)' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setExportType(type.id)}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                backgroundColor: exportType === type.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                color: exportType === type.id ? (type.color || 'var(--text-main)') : 'var(--text-muted)',
                border: `1px solid ${exportType === type.id ? (type.color || 'var(--glass-border)') : 'transparent'}`,
                fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
              }}
            >
              <type.icon size={18} />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <button onClick={handleExportCSV} className="glass" style={{ 
          padding: '32px', borderRadius: '28px', border: '1px solid var(--glass-border)',
          backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', cursor: 'pointer',
          textAlign: 'center', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '18px', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
          }}>
            <FileSpreadsheet size={32} />
          </div>
          <h3 style={{ marginBottom: '8px' }}>Exportar CSV</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Ideal para abrir en Excel o Google Sheets y realizar análisis detallados.</p>
          <div style={{ 
            padding: '10px 20px', borderRadius: '12px', backgroundColor: 'var(--secondary)', color: 'white',
            fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <FileDown size={18} />
            Descargar .csv
          </div>
        </button>

        <button onClick={handleExportPDF} className="glass" style={{ 
          padding: '32px', borderRadius: '28px', border: '1px solid var(--glass-border)',
          backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', cursor: 'pointer',
          textAlign: 'center', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '18px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
          }}>
            <FileText size={32} />
          </div>
          <h3 style={{ marginBottom: '8px' }}>Exportar PDF</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Genera un reporte profesional listo para imprimir o enviar por correo.</p>
          <div style={{ 
            padding: '10px 20px', borderRadius: '12px', backgroundColor: 'var(--danger)', color: 'white',
            fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <FileDown size={18} />
            Descargar .pdf
          </div>
        </button>
      </div>
    </div>
  );
};

export default ExportModule;
