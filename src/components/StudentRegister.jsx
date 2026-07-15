import React, { useState, useEffect } from 'react';
import { UserPlus, Save, ChevronLeft, Camera, X, CheckCircle } from 'lucide-react';
import { createStudent, getClasses } from '../services/supabase';
import QRScanner from './QRScanner';
import ThemeToggle from './ThemeToggle';

const StudentRegister = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_code: '',
    qr_code: '',
    class_id: ''
  });
  
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const { data, error } = await getClasses();
    if (!error && data) {
      setClasses(data);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleScanValues = (code) => {
    setFormData(prev => ({
      ...prev,
      qr_code: code
    }));
    setScanning(false);
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(() => {}); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.name || !formData.student_code || !formData.qr_code || !selectedClass) {
      setMessage('Preencha os campos obrigatórios (*) e selecione a turma');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      class_id: selectedClass
    };

    const result = await createStudent(dataToSend);
    
    setLoading(false);
    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');

    if (result.success) {
      setFormData({ name: '', email: '', student_code: '', qr_code: '' });
      setSelectedClass('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
      {/* Header simples */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar ao Portal
        </button>
        <ThemeToggle />
      </header>

      {/* --- MODAL DA CÂMERA --- */}
      {scanning && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 dark:bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800">
            <button 
              onClick={() => setScanning(false)}
              className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl text-center font-bold text-slate-800 dark:text-slate-100 mb-6">Escaneie o Crachá</h3>
            
            <div className="overflow-hidden rounded-2xl ring-4 ring-blue-500/20 shadow-inner">
              <QRScanner onScan={handleScanValues} />
            </div>
            
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 font-medium">
              Aproxime o QR Code do aluno na câmera
            </p>
          </div>
        </div>
      )}

      {/* --- FORMULÁRIO DE CADASTRO --- */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 py-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
          
          <div className="border-b border-slate-100 dark:border-slate-800 p-8 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-2xl">
              <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cadastro de Aluno</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Insira os dados e vincule o QR Code do estudante.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none transition-all"
                  placeholder="Ex: Maria Silva"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none transition-all"
                  placeholder="Ex: maria@escola.com"
                />
              </div>

              {/* Turma */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Turma *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none transition-all appearance-none"
                  disabled={scanning}
                >
                  <option value="">Selecione a turma...</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.schedule && `- ${cls.schedule}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Matrícula */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Número de Matrícula *</label>
                <input
                  type="text"
                  name="student_code"
                  value={formData.student_code}
                  onChange={handleChange}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none transition-all"
                />
              </div>

              {/* QR Code */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Conteúdo do QR Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="qr_code"
                    value={formData.qr_code}
                    onChange={handleChange}
                    className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none transition-all"
                    placeholder="Clique na câmera ->"
                  />
                  <button
                    type="button"
                    onClick={() => setScanning(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0"
                    title="Ler QR Code com a câmera"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            {message && (
              <div className={`p-4 rounded-xl flex items-start gap-3 mt-4 animate-in fade-in duration-300 ${
                messageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/30'
              }`}>
                <div className={`p-1 rounded-full mt-0.5 ${messageType === 'success' ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'}`}>
                  {messageType === 'success' ? <CheckCircle className="w-4 h-4 text-green-800 dark:text-green-100" /> : <X className="w-4 h-4 text-red-800 dark:text-red-100" />}
                </div>
                <p className="font-semibold">{message}</p>
              </div>
            )}

            {/* Botões */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-md shadow-blue-500/20 hover:-translate-y-1"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Salvar Aluno
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StudentRegister;