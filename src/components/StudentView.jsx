import React, { useState } from 'react';
import { Camera, ChevronLeft, QrCode, X, CheckCircle } from 'lucide-react';
import QRScanner from './QRScanner';
import ThemeToggle from './ThemeToggle';

const StudentView = ({ classes, onNavigate, onScan, scanning, setScanning, loading, message, messageType }) => {
  const [selectedClass, setSelectedClass] = useState('');

  const handleClassSelection = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleScanAction = async (qrCode) => {
    if (!selectedClass) return;
    await onScan(qrCode, selectedClass);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <button
          onClick={() => { setScanning(false); onNavigate('home'); }}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar ao Portal
        </button>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-colors duration-300">
          
          <div className="bg-blue-600 dark:bg-blue-700 p-8 text-center text-white">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Registro de Presença</h2>
            <p className="text-blue-100 mt-2 text-sm">Posicione seu QR Code na câmera após selecionar a turma.</p>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Sua Turma
              </label>
              <select
                value={selectedClass}
                onChange={handleClassSelection}
                className="w-full p-4 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-all font-medium appearance-none"
                disabled={scanning}
              >
                <option value="">Selecione na lista...</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.schedule ? `- ${cls.schedule}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedClass && (
              <div className="animate-in slide-in-from-bottom-4 duration-300">
                {!scanning ? (
                  <button
                    onClick={() => setScanning(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-1"
                  >
                    <Camera className="w-6 h-6" />
                    Iniciar Escaneamento
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-900 rounded-2xl p-2 overflow-hidden shadow-inner relative ring-4 ring-blue-500/20">
                      <QRScanner onScan={handleScanAction} />
                    </div>

                    <button
                      onClick={() => setScanning(false)}
                      className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 font-bold py-3.5 px-6 rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="mt-6 flex justify-center items-center gap-3 text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </div>
                )}

                {message && (
                  <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in zoom-in-95 duration-300 ${messageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/30'}`}>
                    <div className={`p-1.5 rounded-full mt-0.5 ${messageType === 'success' ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'}`}>
                      {messageType === 'success' ? <CheckCircle className="w-4 h-4 text-green-800 dark:text-green-100" /> : <X className="w-4 h-4 text-red-800 dark:text-red-100" />}
                    </div>
                    <div>
                      <p className="font-bold">{messageType === 'success' ? 'Sucesso!' : 'Erro'}</p>
                      <p className="text-sm opacity-90">{message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentView;
