import React, { useState, useEffect } from 'react';
import HomeView from './components/HomeView';
import StudentView from './components/StudentView';
import TeacherDashboard from './components/TeacherDashboard';
import StudentRegister from './components/StudentRegister';
import { getClasses, registerAttendance } from './services/supabase';

const App = () => {
  const [view, setView] = useState('home');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  // Estados para Registro do Aluno
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const { data, error } = await getClasses();
    if (!error && data) {
      setClasses(data);
    }
  };

  const handleNavigate = (newView) => {
    setView(newView);
    // Resetar mensagens ao trocar de tela
    setMessage('');
    setScanning(false);
    
    // Se voltar para a home, não necessariamente limpa a turma, 
    // mas pode ser útil limpar. Mantemos para facilitar o uso.
  };

  const handleScan = async (qrCode, classId) => {
    setLoading(true);
    const result = await registerAttendance(qrCode, classId);
    setLoading(false);

    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');

    if (result.success) {
      setScanning(false);
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  return (
    <>
      {view === 'home' && (
        <HomeView onNavigate={handleNavigate} />
      )}
      
      {view === 'student' && (
        <StudentView 
          classes={classes}
          onNavigate={handleNavigate}
          onScan={handleScan}
          scanning={scanning}
          setScanning={setScanning}
          loading={loading}
          message={message}
          messageType={messageType}
        />
      )}
      
      {view === 'teacher' && (
        <TeacherDashboard 
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          onNavigate={handleNavigate}
        />
      )}
      
      {view === 'register' && (
        <StudentRegister onBack={() => handleNavigate('home')} />
      )}
    </>
  );
};

export default App;
