import React, { useState, useEffect } from 'react';
import { Camera, Users, Calendar, CheckCircle, Clock, BarChart3, X, Lock } from 'lucide-react';
import QRScanner from './components/QRScanner';
import StudentRegister from './components/StudentRegister';
import { registerAttendance, getAttendances, getClasses } from './services/supabase';
import senaiLogo from './assets/img/senai_logo.png'; 

const App = () => {
  const [view, setView] = useState('home');
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para o Modal de Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const { data, error } = await getClasses();
    if (!error && data) {
      setClasses(data);
    }
  };

  const loadAttendances = async () => {
    if (!selectedClass) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await getAttendances(selectedClass, today);

    if (!error && data) {
      setAttendances(data);
    }
  };

  // 1. Função que abre o modal
  const handleTeacherAccess = () => {
    setShowPasswordModal(true);
    setPasswordInput(''); // Limpa o campo
  };

  // 2. Função que verifica a senha digitada no modal
  const verifyPassword = () => {
    if (passwordInput === 'S3nai#$p') {
      setShowPasswordModal(false);
      setView('teacher');
    } else {
      alert("Senha incorreta!");
      setPasswordInput(''); // Limpa para tentar de novo
    }
  };

  useEffect(() => {
    if (view === 'teacher') {
      loadAttendances();
      const interval = setInterval(loadAttendances, 5000);
      return () => clearInterval(interval);
    }
  }, [view, selectedClass]);

  const handleScan = async (qrCode) => {
    console.log("CÓDIGO LIDO:", qrCode);
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

  if (view === 'register') {
    return <StudentRegister onBack={() => setView('home')} />;
  }

  // --- TELA INICIAL (HOME) ---
  if (view === 'home') {
    return (
      // <div className="min-h-screen bg-gradient-to-br from-blue-200 to-red-600 flex items-center justify-center p-4">
        <div className="min-h-screen bg-gradient-to-br from-red-600 to-black  flex items-center justify-center p-4">
        
        {/* --- MODAL DE SENHA (JANELA FLUTUANTE) --- */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                  Acesso Restrito
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">Digite a senha de administrador para acessar o painel.</p>
              
              <input
                type="password"
                autoFocus
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                placeholder="Senha"
              />
              
              <button
                onClick={verifyPassword}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Entrar
              </button>
            </div>
          </div>
        )}
        {/* ----------------------------------------- */}

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            
            {/* ÍCONE SECRETO */}
            <div 
              onClick={handleTeacherAccess}
              className=" flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-blue-200 transition-colors"
              title="Acesso Administrativo"
            >
              <img src={senaiLogo} alt="Logo" className="w-300 h-300" />
            </div>
            
            {/* TÍTULO SECRETO */}
            <h1 
              onClick={handleTeacherAccess}
              className="text-3xl font-bold text-gray-800 mb-2 cursor-pointer select-none hover:text-blue-600 transition-colors"
            >
              Sistema de Chamada
            </h1>
            <p className="text-gray-600">Registro de presença com QR Code</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setView('student')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105"
            >
              <Camera className="w-6 h-6" />
              Registrar Presença (Aluno)
            </button>

            <button
              onClick={() => setView('register')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105"
            >
              <div className="bg-white/20 p-2 rounded-full">
                <Users className="w-5 h-5" />
              </div>
              Cadastrar Novo Aluno
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA DO ALUNO ---
  if (view === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-black p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => { setScanning(false); setView('home'); }}
            className="mb-4 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={scanning}
              >
                <option value="">-- Escolha a turma --</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.schedule}
                  </option>
                ))}
              </select>
            </div>

            {selectedClass && (
              <>
                {!scanning ? (
                  <button
                    onClick={() => setScanning(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 mb-4"
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
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancelar
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="mt-4 text-center text-gray-600">
                    Processando...
                  </div>
                )}

                {message && (
                  <div className={`mt-4 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
  }

  // --- PAINEL DO PROFESSOR ---
  if (view === 'teacher') {
    const today = new Date().toLocaleDateString('pt-BR');

    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setView('home')}
            className="mb-4 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 shadow"
          >
            ← Voltar
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-7 h-7 text-purple-600" />
              Painel do Professor
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione a turma:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full md:w-96 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Escolha a turma --</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedClass && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Presenças Hoje</p>
                      <p className="text-3xl font-bold text-blue-600">{attendances.length}</p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Data</p>
                      <p className="text-xl font-bold text-purple-600">{today}</p>
                    </div>
                    <Calendar className="w-12 h-12 text-purple-600 opacity-20" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <p className="text-xl font-bold text-green-600">Ativo</p>
                    </div>
                    <BarChart3 className="w-12 h-12 text-green-600 opacity-20" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-gray-600" />
                  Registros de Hoje
                </h3>

                {attendances.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Nenhuma presença registrada ainda</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Aluno</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Horário</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {attendances.map(attendance => (
                          <tr key={attendance.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {attendance.students?.student_code}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {attendance.students?.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{attendance.time}</td>
                            <td className="px-4 py-3">
                              <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                                Presente
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
};

export default App;