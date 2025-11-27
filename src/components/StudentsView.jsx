import React, { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import QRScanner from './QRScanner';
import { registerAttendance, getClasses } from '../services/supabase';

const StudentView = ({ onBack }) => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const { data, error } = await getClasses();
    if (!error && data) {
      setClasses(data);
    }
  };

  const handleScan = async (qrCode) => {
     console.log("CÓDIGO LIDO:", qrCode); // <--- Adicione isso aqui para ver no F12
    if (!selectedClass) {
      showMessage('Selecione uma turma primeiro', 'error');
      return;
    }

    setLoading(true);
    const result = await registerAttendance(qrCode, selectedClass);
    setLoading(false);
    
    showMessage(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
      setScanning(false);
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => { setScanning(false); onBack(); }}
          className="mb-4 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Camera className="w-7 h-7 text-blue-600" />
            Registrar Presença
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione sua turma:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={scanning}
            >
              <option value="">-- Escolha a turma --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.schedule && `- ${cls.schedule}`}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <>
              {!scanning ? (
                <button
                  onClick={() => setScanning(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 mb-4 transition"
                >
                  <Camera className="w-6 h-6" />
                  Abrir Câmera e Escanear QR Code
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-xl p-4">
                    <QRScanner onScan={handleScan} />
                  </div>
                  
                  <button
                    onClick={() => setScanning(false)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              )}

              {loading && (
                <div className="mt-4 text-center text-gray-600">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2">Processando...</p>
                </div>
              )}

              {message && (
                <div className={`mt-4 p-4 rounded-lg ${
                  messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentView;