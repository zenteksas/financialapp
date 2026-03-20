import React, { useState } from 'react';
import { FileDown, FileSpreadsheet, FileText, CheckCircle, Table, ChevronDown, List } from 'lucide-react';
import { db } from '../../utils/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportModule = ({ currency, compact = false }) => {
  const [status, setStatus] = useState({ type: null, message: '' });
  const [exportType, setExportType] = useState('all'); // all, income, expense

  const getFilteredTransactions = async () => {
    const [transactions, categories, accounts] = await Promise.all([
      db.getTransactions(),
      db.getCategories(),
      db.getAccounts()
    ]);

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

  const handleExportCSV = async () => {
    try {
      const txs = await getFilteredTransactions();
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

  const handleExportPDF = async () => {
    try {
      const txs = await getFilteredTransactions();
      if (txs.length === 0) {
        setStatus({ type: 'error', message: 'No hay transacciones para exportar.' });
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Header
      doc.setFillColor(16, 185, 129); // Zen Green
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ZenFinance', 14, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Reporte de Movimientos Financieros', 14, 32);
      
      doc.setFontSize(8);
      doc.text(`Generado: ${new Date().toLocaleString()}`, pageWidth - 14, 25, { align: 'right' });
      doc.text(`Moneda: ${currency}`, pageWidth - 14, 32, { align: 'right' });

      // Summary
      const totalIncome = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;

      doc.setTextColor(51, 51, 51);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN DEL PERIODO', 14, 55);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total Ingresos: ${totalIncome.toLocaleString('es-ES')} ${currency}`, 14, 65);
      doc.text(`Total Gastos: ${totalExpense.toLocaleString('es-ES')} ${currency}`, 14, 72);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(balance >= 0 ? 16 : 239, balance >= 0 ? 185 : 68, balance >= 0 ? 129 : 68);
      doc.text(`Balance Neto: ${balance.toLocaleString('es-ES')} ${currency}`, 14, 82);

      // Table
      const tableRows = txs.map(tx => [
        tx.date,
        tx.type === 'income' ? 'Ingreso' : tx.type === 'expense' ? 'Gasto' : 'Transferencia',
        tx.categoryName,
        tx.accountName,
        tx.note || '-',
        { content: `${tx.amount.toLocaleString('es-ES')} ${currency}`, styles: { halign: 'right', fontStyle: 'bold' } }
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['Fecha', 'Tipo', 'Categoría', 'Cuenta', 'Nota', { content: 'Monto', styles: { halign: 'right' } }]],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        styles: { fontSize: 8, cellPadding: 4 },
        columnStyles: {
          5: { cellWidth: 40 }
        }
      });

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages} - ZenFinance by Zentek`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      doc.save(`ZenFinance_Reporte_${new Date().toISOString().split('T')[0]}.pdf`);
      setStatus({ type: 'success', message: 'Reporte PDF generado con éxito.' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Error al generar el reporte PDF.' });
    }
  };

  return (
    <div className="animate-fade">

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

      {compact ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button 
            onClick={handleExportPDF}
            style={{
              width: '100%', padding: '16px 0', border: 'none', background: 'none', 
              cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px',
              borderBottom: '1px solid var(--glass-border)'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="var(--danger)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)' }}>Generar Reporte PDF</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Documento profesional listo para imprimir</p>
            </div>
          </button>

          <button 
            onClick={handleExportCSV}
            style={{
              width: '100%', padding: '16px 0', border: 'none', background: 'none', 
              cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={20} color="var(--secondary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)' }}>Exportar a Excel (.csv)</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Archivo compatible con hojas de cálculo</p>
            </div>
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default ExportModule;
