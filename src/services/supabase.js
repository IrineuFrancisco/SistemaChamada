import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// COLOQUE DIRETO (Substitua pelos seus valores reais):
const supabaseUrl = "https://dtgyfdlhkbgsnqvjhpzv.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Z3lmZGxoa2Jnc25xdmpocHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTg5ODQsImV4cCI6MjA3OTU3NDk4NH0.Jk2dja_5Zhtk0hB1AiCgme4hnlXzJuKU3YyzUzIb2yM" // (Sua chave inteira aqui)

export const supabase = createClient(supabaseUrl, supabaseKey);


// Funções auxiliares
export const registerAttendance = async (studentCode, classId) => {

console.log('--- DEBUG VERCEL ---');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
  try {
    // 1. LIMPEZA TOTAL: Converte para texto e remove espaços das pontas
    const cleanCode = String(studentCode).trim();

    // Debug: Mostra no console exatamente o que está buscando (com aspas para ver espaços)
    console.log(`🔍 Buscando aluno: "${cleanCode}"`);

    // Buscar aluno pelo QR Code
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('qr_code', cleanCode) // <--- Usa a variável limpa
      .single();

    if (studentError || !student) {
      console.log("Erro do banco:", studentError); // Ajuda a ver o erro real
      return { success: false, message: 'Aluno não encontrado' };
    }

    // Verificar se já registrou presença hoje
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('attendances')
      .select('*')
      .eq('student_id', student.id)
      .eq('class_id', classId)
      .eq('date', today)
      .single();

    if (existing) {
      return { success: false, message: 'Presença já registrada hoje' };
    }

    // Registrar presença
    const { data, error } = await supabase
      .from('attendances')
      .insert({
        student_id: student.id,
        class_id: classId,
        date: today,
        time: new Date().toTimeString().split(' ')[0],
        status: 'present'
      })
      .select();

    if (error) {
      return { success: false, message: 'Erro ao registrar presença' };
    }

    return { success: true, message: `Presença registrada: ${student.name}`, student };
  } catch (error) {
    return { success: false, message: 'Erro: ' + error.message };
  }
};

export const getAttendances = async (classId, date) => {
  const { data, error } = await supabase
    .from('attendances')
    .select(`
      *,
      students (name, student_code),
      classes (name)
    `)
    .eq('class_id', classId)
    .eq('date', date)
    .order('time', { ascending: false });

  return { data, error };
};

export const getClasses = async () => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('active', true)
    .order('name');

  return { data, error };
};

export const createStudent = async (studentData) => {
    console.log("DADOS DO ALUNO:", studentData); // <--- Adicione isso aqui para ver no F12
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          name: studentData.name,
          email: studentData.email,
          student_code: studentData.student_code, // Matrícula
          qr_code: studentData.qr_code,           // O texto que está no QR Code
          active: true,
          idclasses: studentData.class_id
        }
      ])
      .select();

    if (error) {
      // Se der erro de código duplicado (código 23505 no Postgres)
      if (error.code === '23505') {
        return { success: false, message: 'Já existe um aluno com este código ou QR Code.' };
      }
      return { success: false, message: 'Erro ao cadastrar: ' + error.message };
    }

    return { success: true, message: 'Aluno cadastrado com sucesso!' };
  } catch (error) {
    return { success: false, message: 'Erro inesperado: ' + error.message };
  }
};


export const getStudentsByClass = async (classId) => {
  // Busca todos os alunos da tabela 'students' que pertencem à turma selecionada
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('idclasses', classId)
    .eq('active', true) // Opcional: só trazer alunos ativos
    .order('name');
    
  return { data, error };
};

