import React, { useState, useEffect } from 'react';
import { Camera, Users, Calendar, CheckCircle, Clock, BarChart3, X, Lock, FormInput, FormIcon, WebhookIcon, 
  HomeIcon, NotebookIcon, DoorOpenIcon, Menu, 
  Calendar1Icon} from 'lucide-react'; // <--- Adicionei 'Menu' aqui
import QRScanner from './components/QRScanner';
import StudentRegister from './components/StudentRegister';
// Função importada
import { registerAttendance, getAttendances, getClasses, getStudentsByClass } from './services/supabase';
import senaiLogo from './assets/img/senai_logo.png'; 
import senaiBackground from './assets/img/bk_image_senai.png';

const App = () => {
  const [view, setView] = useState('home');
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NOVO ESTADO: Lista unificada de todos os alunos com status de presença
  const [allStudents, setAllStudents] = useState([]);

  // Estados para o Modal de Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Novo estado para o Menu Hambúrguer
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const { data, error } = await getClasses();
    if (!error && data) {
      setClasses(data);
    }

    console.log('--- DEBUG VERCEL ---');
    console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
  };

  // --- FUNÇÃO loadAttendances ORIGINAL FOI REMOVIDA/COMENTADA ---
  // A lógica de carregamento e combinação foi movida para o useEffect

  const handleTeacherAccess = () => {
    setShowPasswordModal(true);
    setPasswordInput('');
  };

  const verifyPassword = () => {
    if (passwordInput === 'S3nai#$p') {
      setShowPasswordModal(false);
      setView('teacher');
    } else {
      alert("Senha incorreta!");
      setPasswordInput('');
    }
  };

  useEffect(() => {
    if (view === 'teacher') {

      const fetchData = async () => {
        if (!selectedClass) {
          setAllStudents([]);
          setAttendances([]);
          return;
        }

        const today = new Date().toISOString().split('T')[0];

        // 1. Carregar TODOS os alunos da turma
        const { data: studentsData, error: studentsError } = await getStudentsByClass(selectedClass);
        if (studentsError) {
          console.error("Erro ao carregar alunos:", studentsError);
          setAllStudents([]);
          return;
        }

        // 2. Carregar Presenças de HOJE
        const { data: attendanceData, error: attendanceError } = await getAttendances(selectedClass, today);
        if (attendanceError) {
          console.error("Erro ao carregar presenças:", attendanceError);
        }
        
        // Mapear presenças por ID do aluno para busca rápida
        const presentMap = (attendanceData || []).reduce((acc, att) => {
            // Note: O retorno de getAttendances já tem 'student_id' (o ID do aluno)
            acc[att.student_id] = att; 
            return acc;
        }, {});
        
        // 3. Combinar as listas e definir o status
        const combinedList = (studentsData || []).map(student => {
            const attendance = presentMap[student.id]; // Verifica se o aluno está no mapa de presentes

            return {
                id: student.id,
                student_code: student.student_code,
                name: student.name,
                // Define o status e a hora baseados na presença
                status: attendance ? 'Presente' : 'Faltou',
                time: attendance ? attendance.time : 'N/A', 
                // Útil para a contagem
                isPresent: !!attendance 
            };
        });
        
        // Ordenar a lista combinada por nome do aluno (Português-Brasil)
        const sortedCombinedList = combinedList.sort((a, b) => 
          a.name.localeCompare(b.name, 'pt-BR')
        );

        setAllStudents(sortedCombinedList);
        // Atualiza attendances APENAS para a contagem no painel superior
        setAttendances(attendanceData || []); 
      };

      fetchData(); // Roda imediatamente

      const interval = setInterval(fetchData, 5000); // Roda a cada 5 segundos
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
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{ backgroundImage: `url(${senaiBackground})` }}>
        
        {/* --- MODAL DE SENHA --- */}
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

        {/* --- MENU HAMBÚRGUER --- */}
        
        {/* Botão de Abrir */}
        {!isMenuOpen && (
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="absolute top-6 left-6 z-20 bg-white/90 p-3 rounded-xl shadow-lg hover:bg-white hover:scale-105 transition-all text-gray-700 border border-white/20 backdrop-blur-sm"
            title="Menu de Utilidades"
          >
            <Menu className="w-8 h-8" />
          </button>
        )}

        {/* Fundo Escuro (Backdrop) */}
        <div 
          className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 backdrop-blur-sm ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Gaveta Lateral (Drawer) */}
        <div 
          className={`fixed top-0 left-0 h-full w-[340px] bg-white/95 backdrop-blur-md shadow-2xl z-40 transform transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Cabeçalho do Menu */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Utilidades</h2>
              {/* <p className="text-xs text-gray-500">Links rápidos</p> */}
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lista de Links */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)]">
            
            {/* Link 1: Meu Senai */}
            <a href="https://identidade.senai.br/authenticationendpoint/login.do?RelayState=https%3A%2F%2Fmeusenai.senai.br%2F&commonAuthCallerPath=%2Fsamlsso&forceAuth=false&passiveAuth=false&tenantDomain=carbon.super&sessionDataKey=7c791ccc-3748-4d46-bc53-2bb71c8144cf&relyingParty=https%3A%2F%2Fmeusenai.senai.br&type=samlsso&sp=meusenai.senai.br&isSaaSApp=false&authenticators=BasicAuthenticator%3ALOCAL" target='blank' className="group">
              <div className="bg-white border border-gray-200 hover:border-red-500 hover:shadow-md p-4 rounded-xl flex items-center gap-4 transition-all">
                <div className="bg-red-100 p-3 rounded-lg group-hover:bg-red-600 transition-colors">
                  <HomeIcon className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Meu Senai</h3>
                  <p className="text-xs text-gray-500">Acesso ao portal</p>
                </div>
              </div>
            </a>

            {/* Link 2: Google Classroom */}
            <a href="https://classroom.google.com/" target='blank' className="group">
              <div className="bg-white border border-gray-200 hover:border-green-500 hover:shadow-md p-4 rounded-xl flex items-center gap-4 transition-all">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-600 transition-colors">
                  <NotebookIcon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Classroom</h3>
                  <p className="text-xs text-gray-500">Salas de aula</p>
                </div>
              </div>
            </a>

            {/* Link 3: TransitRoom */}
            <a href="https://niloweb.com.br/transit-room/" target='blank' className="group">
              <div className="bg-white border border-gray-200 hover:border-purple-500 hover:shadow-md p-4 rounded-xl flex items-center gap-4 transition-all">
                <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-600 transition-colors">
                  <DoorOpenIcon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">TransitRoom</h3>
                  <p className="text-xs text-gray-500">Gestão de salas</p>
                </div>
              </div>
            </a>

            {/* Link 4: Registrar Atestado */}
            <a href="https://forms.gle/GKWVwv8z7qHhBNqd8" target='blank' className="group">
              <div className="bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md p-4 rounded-xl flex items-center gap-4 transition-all">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <FormIcon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Atestado</h3>
                  <p className="text-xs text-gray-500">Registrar justificativa</p>
                </div>
              </div>
            </a>
            {/* Link 5: Calendário */}
            <a href="https://calendar.google.com/calendar/u/0/r/month/2026/2/1?pli=1" target='blank' className="group">
              <div className="bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md p-4 rounded-xl flex items-center gap-4 transition-all">
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <Calendar1Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Calendário</h3>
                  <p className="text-xs text-gray-500">Aulas e Feriados</p>
                </div>
              </div>
            </a>

          </div>
          
          <div className="absolute bottom-0 w-full p-6 text-center text-xs text-gray-400 border-t border-gray-100">
            IrineuFrancisco &copy; 2025
          </div>
        </div>

        {/* --- CARD PRINCIPAL (SISTEMA) --- */}
        <div className="bg-white/80 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div 
              onClick={handleTeacherAccess}
              className="flex items-center justify-center mx-auto mb-4 cursor-pointer transition-colors"
              title="Acesso Administrativo"
            >
              <Camera className="w-10 h-10 text-blue-600" />
            </div>
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
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 opacity-1 "
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
      <div className="min-h-screen bg-cover bg-center p-4" style={{ backgroundImage: `url(${senaiBackground})` }}>
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

  // --- PAINEL DO PROFESSOR (Com alterações) ---
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
                      {/* Usando attendances, que agora só tem os presentes */}
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
                      <p className="text-gray-600 text-sm">Total de Alunos</p>
                      {/* Usando a lista completa de alunos */}
                      <p className="text-xl font-bold text-green-600">{allStudents.length}</p>
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

                {allStudents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Nenhum aluno encontrado ou erro de carregamento.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notebook</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Aluno</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Horário</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {/* Iterando sobre a lista completa e combinada */}
                        {allStudents.map(student => ( 
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student.student_code}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {student.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.time}</td>
                            <td className="px-4 py-3">
                              {/* Lógica de cor baseada no status */}
                              <span 
                                className={`text-xs px-3 py-1 rounded-full ${
                                  student.status === 'Presente' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800' // 'Faltou' agora tem cor vermelha
                                }`}
                              >
                                {student.status}
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