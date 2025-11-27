import React, { useState, useEffect  } from 'react';
import { UserPlus, Save, ArrowLeft, Camera, X } from 'lucide-react';
import { createStudent, getClasses  } from '../services/supabase';
import QRScanner from './QRScanner'; // Importamos o scanner que já configuramos
import senaiBackground from '.././assets/img/bk_image_senai.png';

const StudentRegister = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_code: '',
    qr_code: '',
    class_id: ''

  });
  
  const [scanning, setScanning] = useState(false); // Controla se a câmera está aberta
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

  // Função chamada quando a câmera lê o código
  const handleScanValues = (code) => {
    setFormData(prev => ({
      ...prev,
      qr_code: code // Preenche o campo automaticamente
    }));
    setScanning(false); // Fecha a câmera
    // Toca um som de beep (opcional)
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(() => {}); 
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 1. Adicionei a validação do selectedClass aqui
    if (!formData.name || !formData.student_code || !formData.qr_code || !selectedClass) {
      setMessage('Preencha os campos obrigatórios (*) e selecione a turma');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // 2. Criamos um objeto novo juntando o formData com o ID da turma
    const dataToSend = {
      ...formData,
      class_id: selectedClass // <--- O PULO DO GATO: Enviando a turma selecionada
    };

    // 3. Enviamos esse objeto completo
    const result = await createStudent(dataToSend);
    
    setLoading(false);
    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');

    if (result.success) {
      setFormData({ name: '', email: '', student_code: '', qr_code: '' });
      setSelectedClass(''); // 4. Limpar a seleção da turma após salvar
    }
  };

  return (
    // <div className="min-h-screen bg-gradient-to-br from-red-600 to-black p-4">
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
          style={{ backgroundImage: `url(${senaiBackground})` }}>
      {/* --- MODAL DA CÂMERA (Aparece quando scanning é true) --- */}
      {scanning && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-md relative">
            <button 
              onClick={() => setScanning(false)}
              className="absolute top-2 right-2 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-center font-bold text-gray-700 mb-4">Escaneie o Crachá</h3>
            
            <div className="overflow-hidden rounded-xl border-2 border-blue-500">
              <QRScanner onScan={handleScanValues} />
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Aproxime o QR Code do aluno
            </p>
          </div>
        </div>
      )}

      {/* --- FORMULÁRIO DE CADASTRO --- */}
      <div className="max-w-xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 shadow flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Novo Aluno</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Ex: Maria Silva"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Ex: maria@escola.com"
              />
            </div>

            {/* Turma */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matrícula */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número*</label>
                <input
                  type="text"
                  name="student_code"
                  value={formData.student_code}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                //   placeholder="Ex: 2024001"
                />
              </div>

              {/* QR Code com Botão de Câmera */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo do QR * 
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="qr_code"
                    value={formData.qr_code}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Clique na câmera ->"
                  />
                  <button
                    type="button"
                    onClick={() => setScanning(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition shadow-lg"
                    title="Ler QR Code com a câmera"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            {message && (
              <div className={`p-4 rounded-lg text-sm ${
                messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Botão Salvar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.02]"
            >
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Cadastrar Aluno
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;