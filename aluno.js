import React, { useState, useEffect, useRef } from 'react';
import { Camera, Users, Calendar, CheckCircle, Clock, BarChart3 } from 'lucide-react';

const AttendanceSystem = () => {
  const [view, setView] = useState('home'); // home, student, teacher
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [message, setMessage] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Simular banco de dados local (em produção, usar Supabase)
  const classes = [
    { id: '1', name: 'Desenvolvimento Web - Turma A', schedule: 'Seg/Qua 19h' },
    { id: '2', name: 'Banco de Dados - Turma B', schedule: 'Ter/Qui 19h' },
  ];

  const students = [
    { id: 'ALU001', name: 'João Silva', qrCode: 'ALU001' },
    { id: 'ALU002', name: 'Maria Santos', qrCode: 'ALU002' },
    { id: 'ALU003', name: 'Pedro Oliveira', qrCode: 'ALU003' },
  ];

  // Iniciar câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        startScanning();
      }
    } catch (err) {
      setMessage('❌ Erro ao acessar câmera: ' + err.message);
    }
  };

  // Parar câmera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setScanning(false);
  };

  // Simular leitura de QR Code
  const startScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      // Em produção real, usar biblioteca jsQR ou html5-qrcode aqui
      // Por enquanto, simular com botão de teste
    }, 500);
  };

  // Simular escaneamento de QR Code para demonstração
  const simulateScan = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      registerAttendance(student.qrCode);
    }
  };

  // Registrar presença
  const registerAttendance = (qrCode) => {
    const student = students.find(s => s.qrCode === qrCode);
    if (!student) {
      setMessage('❌ QR Code não reconhecido!');
      return;
    }

    const now = new Date();
    const attendance = {
      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      classId: selectedClass,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR'),
    };

    setAttendances(prev => [...prev, attendance]);
    setScannedCode(qrCode);
    setMessage(`✅ Presença registrada: ${student.name}`);
    stopCamera();
    
    setTimeout(() => {
      setMessage('');
      setScannedCode('');
    }, 3000);
  };

  // Limpar ao trocar de view
  useEffect(() => {
    return () => stopCamera();
  }, [view]);

  // HOME VIEW
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Chamada</h1>
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
              onClick={() => setView('teacher')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105"
            >
              <Users className="w-6 h-6" />
              Painel do Professor
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Desenvolvido para o curso técnico de Desenvolvimento de Sistemas
            </p>
          </div>
        </div>
      </div>
    );
  }

  // STUDENT VIEW
  if (view === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => { stopCamera(); setView('home'); }}
            className="mb-4 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            ← Voltar
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Camera className="w-7 h-7 text-blue-600" />
              Registrar Presença
            </h2>

            {/* Seleção de turma */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione sua turma:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    onClick={startCamera}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 mb-4"
                  >
                    <Camera className="w-6 h-6" />
                    Abrir Câmera e Escanear QR Code
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-xl overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-80 object-cover"
                        playsInline
                      />
                      <div className="absolute inset-0 border-4 border-blue-500 m-12 rounded-lg pointer-events-none"></div>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    
                    <button
                      onClick={stopCamera}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl"
                    >
                      Cancelar
                    </button>

                    {/* Botões de simulação para demonstração */}
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-2">Simulação (para teste):</p>
                      <div className="grid grid-cols-3 gap-2">
                        {students.map(student => (
                          <button
                            key={student.id}
                            onClick={() => simulateScan(student.id)}
                            className="bg-gray-200 hover:bg-gray-300 text-xs p-2 rounded"
                          >
                            {student.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {message && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

  // TEACHER VIEW
  if (view === 'teacher') {
    const today = new Date().toLocaleDateString('pt-BR');
    const todayAttendances = attendances.filter(a => a.date === today);

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
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Users className="w-7 h-7 text-purple-600" />
              Painel do Professor
            </h2>
            <p className="text-gray-600">Gerencie e visualize as presenças dos alunos</p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Presenças Hoje</p>
                  <p className="text-3xl font-bold text-blue-600">{todayAttendances.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Registros</p>
                  <p className="text-3xl font-bold text-purple-600">{attendances.length}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Turmas Ativas</p>
                  <p className="text-3xl font-bold text-green-600">{classes.length}</p>
                </div>
                <Calendar className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Lista de presenças */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-gray-600" />
              Registros de Hoje
            </h3>

            {todayAttendances.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Nenhuma presença registrada hoje</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Aluno</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Horário</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {todayAttendances.map(attendance => (
                      <tr key={attendance.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{attendance.studentName}</td>
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
        </div>
      </div>
    );
  }
};

export default AttendanceSystem;