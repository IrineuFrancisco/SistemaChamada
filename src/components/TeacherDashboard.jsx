import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, Clock, BarChart3, ChevronLeft } from 'lucide-react';
import { getStudentsByClass, getAttendances } from '../services/supabase';
import ThemeToggle from './ThemeToggle';

const TeacherDashboard = ({ classes, selectedClass, setSelectedClass, onNavigate }) => {
  const [allStudents, setAllStudents] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const todayStr = new Date().toLocaleDateString('pt-BR');

  useEffect(() => {
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

      // Mapear presenças
      const presentMap = (attendanceData || []).reduce((acc, att) => {
        acc[att.student_id] = att;
        return acc;
      }, {});

      // 3. Combinar as listas
      const combinedList = (studentsData || []).map(student => {
        const attendance = presentMap[student.id];
        return {
          id: student.id,
          student_code: student.student_code,
          name: student.name,
          status: attendance ? 'Presente' : 'Faltou',
          time: attendance ? attendance.time : 'N/A',
          isPresent: !!attendance
        };
      });

      const sortedCombinedList = combinedList.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR')
      );

      setAllStudents(sortedCombinedList);
      setAttendances(attendanceData || []);
    };

    fetchData(); // Roda imediatamente
    const interval = setInterval(fetchData, 5000); // Polling
    return () => clearInterval(interval);
  }, [selectedClass]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30 transition-colors duration-300">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Sair do Painel
        </button>
        <ThemeToggle />
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Dashboard Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-2xl">
              <Users className="w-8 h-8 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Painel do Professor</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhamento e listagem de chamadas em tempo real.</p>
            </div>
          </div>

          <div className="w-full md:w-96">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Filtrar por Turma
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-4 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-all font-medium appearance-none"
            >
              <option value="">Selecione uma turma...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.schedule ? `- ${cls.schedule}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedClass ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-700 dark:bg-blue-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">Presenças Hoje</p>
                  <p className="text-5xl font-bold">{attendances.length}</p>
                </div>
                <CheckCircle className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group transition-colors duration-300">
                <div className="relative z-10">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Data</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{todayStr}</p>
                </div>
                <Calendar className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-200 dark:text-slate-800 opacity-50 dark:opacity-100 group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group transition-colors duration-300">
                <div className="relative z-10">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total de Alunos</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{allStudents.length}</p>
                </div>
                <BarChart3 className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-200 dark:text-slate-800 opacity-50 dark:opacity-100 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>

            {/* List Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
              <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                  Lista de Chamada
                </h3>
              </div>

              {allStudents.length === 0 ? (
                <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                  <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-lg font-medium">Nenhum aluno encontrado na turma.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registro</th>
                        <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aluno</th>
                        <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Horário</th>
                        <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {allStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-8 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {student.student_code}
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {student.name}
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {student.time}
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold ${
                                student.status === 'Presente'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-transparent dark:border-green-800/50'
                                  : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-transparent dark:border-red-800/50'
                              }`}
                            >
                              {student.status === 'Presente' && <CheckCircle className="w-3 h-3 mr-1.5" />}
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
          </div>
        ) : (
          <div className="text-center py-32 animate-in fade-in duration-500">
            <div className="bg-slate-100 dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhuma Turma Selecionada</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Selecione uma turma no seletor acima para visualizar a lista de chamada e os registros de hoje.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
