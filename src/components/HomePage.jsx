import React from 'react';
import { Camera } from 'lucide-react';

const HomePage = ({ onNavigate }) => {

  // Função que pede a senha
  const handleTeacherAccess = () => {
    const password = window.prompt("Digite a senha de administrador:");
    
    // Verifica a senha
    if (password === 'S3nai#$p') {
      // AQUI ESTA A CORREÇÃO: Usamos onNavigate, que é o que o seu App entende
      onNavigate('teacher'); 
    } else if (password !== null) {
      alert("Senha incorreta!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          
          {/* Título Secreto: Clique no ícone da câmera ou no texto para entrar */}
          <div 
            onClick={handleTeacherAccess}
            className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-blue-200 transition-colors"
          >
            <Camera className="w-10 h-10 text-blue-600" />
          </div>
          
          <h1 
            onClick={handleTeacherAccess}
            className="text-3xl font-bold text-gray-800 mb-2 cursor-pointer select-none"
          >
            Sistema de Chamada
          </h1>
          <p className="text-gray-600">Registro de presença com QR Code</p>
        </div>

        <div className="space-y-4">
          {/* Apenas o botão do Aluno fica visível */}
          <button
            onClick={() => onNavigate('student')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105"
          >
            <Camera className="w-6 h-6" />
            Registrar Presença (Aluno)
          </button>
          
          {/* Botão roxo do professor foi REMOVIDO daqui */}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Desenvolvido para o curso técnico de Desenvolvimento de Sistemas
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;