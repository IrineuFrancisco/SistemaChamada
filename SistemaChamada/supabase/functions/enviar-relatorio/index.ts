// supabase/functions/enviar-relatorio/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

// Configure os clientes
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
const resend = new Resend(RESEND_API_KEY!)

// --- CONFIGURAÇÃO DAS TURMAS ---
// Adicione quantas turmas quiser aqui
const TURMAS = [
  { 
    id: 'bc58b633-51dc-44d5-b412-0710791f92ab', 
    nome: 'DEV-1' 
  },
  { 
    id: 'a1ab1b28-0495-4d7b-9910-00f11b1f4948', 
    nome: 'DEV-2' 
  }
]
// -------------------------------

// Função que processa uma única turma (Não mexa aqui)
async function processarTurma(turma: { id: string, nome: string }) {
  console.log(`Iniciando relatório da turma: ${turma.nome}...`)

  // 1. Busca dados
  const { data: presencas, error } = await supabase
    .from('attendances')
    .select(`date, status, time, students!inner ( name, idclasses )`)
    .eq('students.idclasses', turma.id)
    .gte('date', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    console.error(`Erro ao buscar turma ${turma.nome}:`, error)
    return `Erro na turma ${turma.nome}`
  }

  // 2. Se vazio, retorna aviso mas não trava o resto
  if (!presencas || presencas.length === 0) {
    console.log(`Turma ${turma.nome} sem presenças.`)
    return `Turma ${turma.nome}: Sem dados.`
  }

  // 3. Monta HTML
  presencas.sort((a: any, b: any) => {
      if (a.students.name < b.students.name) return -1;
      if (a.students.name > b.students.name) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const linhasTabela = presencas.map((p: any) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${p.students.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${p.date}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${p.time}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${p.status}</td>
    </tr>
  `).join('')

  const htmlEmail = `
    <h1>Relatório Semanal - ${turma.nome}</h1>
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd;">Aluno</th>
          <th style="border: 1px solid #ddd;">Data</th>
          <th style="border: 1px solid #ddd;">Hora</th>
          <th style="border: 1px solid #ddd;">Status</th>
        </tr>
      </thead>
      <tbody>${linhasTabela}</tbody>
    </table>
  `

  // 4. Envia Email
  // ATENÇÃO: Use o e-mail do Hotmail para não dar erro no plano grátis
  const { error: emailError } = await resend.emails.send({
    from: 'Chamada <onboarding@resend.dev>',
    to: ['irineu.souza@docente.senai.br'], // <--- SEU EMAIL CADASTRADO NO RESEND
    subject: `Relatório ${turma.nome} - ${new Date().toLocaleDateString()}`,
    html: htmlEmail,
  })

  if (emailError) {
    console.error(`Erro ao enviar email da turma ${turma.nome}:`, emailError)
    return `Erro envio ${turma.nome}`
  }

  return `Sucesso ${turma.nome}`
}

// --- BLOCO PRINCIPAL ---
Deno.serve(async (_req) => {
  try {
    const resultados = []

    // Passa por cada turma da lista e executa a função
    for (const turma of TURMAS) {
      const resultado = await processarTurma(turma)
      resultados.push(resultado)
    }

    return new Response(JSON.stringify({ status: 'Finalizado', detalhes: resultados }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})