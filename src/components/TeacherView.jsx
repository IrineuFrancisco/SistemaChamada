import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
// Importamos a função de buscar alunos da turma
import { getAttendances, getClasses, getStudentsByClass } from '../services/supabase';

const TeacherView = ({ onBack }) => {
  const [fullStudentList, setFullStudentList] = useState([]); 
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estatísticas
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadData();
      const interval = setInterval(loadData, 5000); 
      return () => clearInterval(interval);
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    setLoading(true);
    const { data, error } = await getClasses();
    if (!error && data) {
      setClasses(data);
    }
    setLoading(false);
  };

  // const loadData = async () => {
  //   if (!selectedClass) return;
    
  //   const today = new Date().toISOString().split('T')[0];

  //   // 1. Busca TODOS os alunos da turma selecionada
  //   const { data: studentsData } = await getStudentsByClass(selectedClass);
    
  //   // 2. Busca QUEM ESTÁ PRESENTE hoje
  //   const { data: attendanceData } = await getAttendances(selectedClass, today);

  //   if (studentsData) {
  //     // 3. Cruza as duas listas
  //     const combinedList = studentsData.map(student => {
  //       // Verifica se o aluno está na lista de presença
  //       const presence = attendanceData?.find(a => 
  //         // Compara ID do aluno (pode vir como students.id ou student_id dependendo do Supabase)
  //         String(a.students?.id || a.student_id) === String(student.id)
  //       );
        
  //       return {
  //         ...student,
  //         isPresent: !!presence, // true ou false
  //         checkInTime: presence ? presence.time : null
  //       };
  //     });

  //     setFullStudentList(combinedList);
      
  //     setStats({
  //       total: studentsData.length,
  //       present: attendanceData?.length || 0,
  //       absent: studentsData.length - (attendanceData?.length || 0)
  //     });
  //   }
  // };

  const loadData = async () => {
    if (!selectedClass) return;
    
    const today = new Date().toISOString().split('T')[0];

    // 1. Busca TODOS os alunos da turma selecionada
    const { data: studentsData } = await getStudentsByClass(selectedClass);
    
    // 2. Busca QUEM ESTÁ PRESENTE hoje
    const { data: attendanceData } = await getAttendances(selectedClass, today);

    if (studentsData) {
      // 3. Cruza as duas listas
      const combinedList = studentsData.map(student => {
        // Verifica se o aluno está na lista de presença
        const presence = attendanceData?.find(a => 
          String(a.students?.id || a.student_id) === String(student.id)
        );
        
        return {
          ...student,
          isPresent: !!presence, // true ou false
          checkInTime: presence ? presence.time : null
        };
      });

      // --- ALTERAÇÃO AQUI: Ordenação Alfabética ---
      // Ordena a lista pelo nome do aluno (A -> Z)
      combinedList.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      // --------------------------------------------

      setFullStudentList(combinedList);

      console.log(combinedList);
      
      setStats({
        total: studentsData.length,
        present: attendanceData?.length || 0,
        absent: studentsData.length - (attendanceData?.length || 0)
      });
    }
  };

  const today = new Date().toLocaleDateString('pt-BR');
  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || 'Turma';

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 shadow transition"
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
              className="w-full md:w-96 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
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
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Alunos</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                  </div>
                  <Users className="w-10 h-10 text-gray-300" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Presentes</p>
                    <p className="text-3xl font-bold text-green-600">{stats.present}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-200" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Ausentes</p>
                    <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-200" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Data</p>
                    <p className="text-xl font-bold text-purple-600">{today}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Tabela de Alunos */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-gray-600" />
                Lista de Chamada - {selectedClassName}
              </h3>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">Carregando dados...</p>
                </div>
              ) : fullStudentList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Nenhum aluno encontrado nesta turma.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Aluno</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Turma</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Horário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {fullStudentList.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            {student.isPresent ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                                <CheckCircle className="w-3 h-3" /> PRESENTE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                                <XCircle className="w-3 h-3" /> AUSENTE
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800 font-bold">{student.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{student.student_code}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{selectedClassName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {student.isPresent ? (
                              <span className="font-semibold text-blue-600">{student.checkInTime}</span>
                            ) : (
                              <span className="text-gray-400">--:--</span>
                            )}
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
};

export default TeacherView;