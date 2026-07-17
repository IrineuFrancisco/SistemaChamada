import React, { useState } from 'react';
import { Camera, Users, Lock, ChevronRight, BookOpen, Calendar as CalendarIcon, CheckCircle, FileText, Settings, LogOut } from 'lucide-react';
import CalendarWidget from './CalendarWidget';
import Calendario from './calendario';
import ThemeToggle from './ThemeToggle';
import senaiLogo from '../assets/img/senai_logo.png';
import senaiIcon from '../../public/vite.svg';
import manualPdf from '../assets/img/Manual do aluno atualizado.pdf';

const HomeView = ({ onNavigate }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showCalendario, setShowCalendario] = useState(false);

  const handleTeacherAccess = () => {
    setShowPasswordModal(true);
    setPasswordInput('');
  };

  const verifyPassword = () => {
    if (passwordInput === 'S3nai#$p') {
      setShowPasswordModal(false);
      setPasswordInput('');
      onNavigate('teacher');
    } else {
      alert("Senha incorreta!");
      setPasswordInput('');
    }
  };

  const quickLinks = [
    { title: "Meu Senai", desc: "Acesso ao portal acadêmico", icon: BookOpen, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/30", href: "https://meusenai.senai.br" },
    { title: "Classroom", desc: "Google Classroom", icon: Users, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/30", href: "https://classroom.google.com/" },
    { title: "Simulados", desc: "Plataforma de testes", icon: CheckCircle, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30", href: "http://10.137.146.102:3000/" },
    { title: "TransitRoom", desc: "Gestão de saídas da sala", icon: Settings, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30", href: "https://niloweb.com.br/transit-room/" },
    { title: "Atestados", desc: "Envio de justificativas", icon: FileText, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-900/30", href: "https://forms.gle/1Uys3EZ2hQMdwehh7" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">

      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          {/* <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-xl">S</span>
          </div> */}
          <img src={senaiIcon} alt="SENAI" className="w-12 h-12" />
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">Portal SENAI</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sistema Integrado de Gestão</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleTeacherAccess}
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg transition-all"
          >
            <Lock className="w-4 h-4" />
            Acesso Professor
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Primary Actions */}
        <div className="lg:col-span-8 space-y-8">

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-900 dark:to-indigo-950 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden transition-colors duration-300">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Bem-vindo ao Sistema de Chamada</h2>
              <p className="text-blue-100 dark:text-blue-200 max-w-lg mb-8 text-lg">Registre sua presença de forma rápida e segura utilizando seu QR Code estudantil.</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('student')}
                  className="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-xl hover:-translate-y-1"
                >
                  <Camera className="w-5 h-5" />
                  Registrar Presença
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/50 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1"
                >
                  <Users className="w-5 h-5" />
                  Cadastrar Aluno
                </button>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
          </div>

          {/* Quick Links / Applications */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              Aplicativos e Serviços
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {quickLinks.map((link, idx) => (
                <a key={idx} href={link.href} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${link.bg} group-hover:scale-110 transition-transform`}>
                        <link.icon className={`w-6 h-6 ${link.color}`} />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-all" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{link.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{link.desc}</p>
                    </div>
                  </div>
                </a>
              ))}

              {/* Calendário Botão */}
              <button onClick={() => setShowCalendario(true)} className="group text-left h-full">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 group-hover:scale-110 transition-transform">
                      <CalendarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Calendário Acadêmico</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Datas importantes</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <CalendarWidget />

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Avisos Importantes</h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full h-fit">
                  <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Manual do Aluno</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-2">Leia as diretrizes atualizadas para o semestre vigente.</p>
                  <button onClick={() => window.open(manualPdf, '_blank')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Baixar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* --- MODAL DE SENHA PROFESSOR --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Acesso Professor</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Insira a credencial administrativa para acessar o painel de chamadas.</p>
            <input
              type="password"
              autoFocus
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
              className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
              placeholder="Senha de acesso"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={verifyPassword}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-blue-500/30"
              >
                Acessar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCalendario && <Calendario onClose={() => setShowCalendario(false)} />}
    </div>
  );
};

export default HomeView;
