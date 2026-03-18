import React, { useState } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle, FileJson } from 'lucide-react';
import { db } from '../../utils/db';

const BackupRestoreModule = () => {
  const [status, setStatus] = useState({ type: null, message: '' });

  const handleExport = async () => {
    try {
      const data = await db.exportFullData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus({ type: 'success', message: 'Copia de seguridad descargada correctamente.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Error al exportar los datos.' });
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (await db.importFullData(data)) {
          setStatus({ type: 'success', message: 'Datos restaurados correctamente. La página se recargará para aplicar los cambios.' });
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else {
          setStatus({ type: 'error', message: 'El archivo no parece ser una copia de seguridad válida.' });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Error al leer el archivo. Asegúrate de que es un archivo JSON válido.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade" style={{ color: 'var(--text-main)' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>Backup y Restauración</h1>
        <p style={{ color: 'var(--text-muted)' }}>Protege tu información financiera exportando tus datos o restaurando una copia previa.</p>
      </header>

      {status.message && (
        <div className="glass" style={{ 
          padding: '16px', 
          borderRadius: '16px', 
          marginBottom: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${status.type === 'success' ? 'var(--secondary)' : 'var(--danger)'}`,
          color: status.type === 'success' ? 'var(--secondary)' : 'var(--danger)'
        }}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div className="glass" style={{ padding: '32px', borderRadius: '28px', textAlign: 'center' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '20px', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Download size={32} />
          </div>
          <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Exportar Datos</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Descarga un archivo JSON con toda tu información: cuentas, transacciones, deudas y categorías.
          </p>
          <button onClick={handleExport} style={{
            width: '100%', padding: '16px', borderRadius: '16px',
            backgroundColor: 'var(--primary)', color: 'white',
            fontWeight: '700', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            <FileJson size={20} />
            Crear Backup JSON
          </button>
        </div>

        <div className="glass" style={{ padding: '32px', borderRadius: '28px', textAlign: 'center' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '20px', 
            backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Upload size={32} />
          </div>
          <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Restaurar Backup</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Selecciona un archivo de backup previamente exportado para restaurar tu información.
          </p>
          
          <label style={{
            width: '100%', padding: '16px', borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-main)',
            fontWeight: '700', border: '1px dashed var(--glass-border)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            <Upload size={20} color="var(--secondary)" />
            Seleccionar Archivo
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          
          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <AlertTriangle size={14} />
              Atención: Los datos actuales serán reemplazados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestoreModule;
