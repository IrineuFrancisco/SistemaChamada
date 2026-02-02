import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AttendanceRecord {
  student_id: string
  class_id: string
  session_id: string
  date: string
  time: string
}

interface Student {
  id: string
  name: string
}

interface Class {
  id: string
  name: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calculate date range for last week
    const today = new Date()
    const lastWeekEnd = new Date(today)
    lastWeekEnd.setDate(today.getDate() - today.getDay()) // Last Sunday
    lastWeekEnd.setHours(23, 59, 59, 999)
    
    const lastWeekStart = new Date(lastWeekEnd)
    lastWeekStart.setDate(lastWeekEnd.getDate() - 6) // Previous Monday
    lastWeekStart.setHours(0, 0, 0, 0)

    const startDateStr = lastWeekStart.toISOString().split('T')[0]
    const endDateStr = lastWeekEnd.toISOString().split('T')[0]

    // Fetch attendance records from last week
    const { data: attendances, error: attendanceError } = await supabaseClient
      .from('attendance_sessions')
      .select('student_id, class_id, session_id, date, time')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })

    if (attendanceError) {
      throw new Error(`Error fetching attendances: ${attendanceError.message}`)
    }

    if (!attendances || attendances.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No attendances found for last week',
          period: `${startDateStr} to ${endDateStr}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get unique student IDs and class IDs
    const studentIds = [...new Set(attendances.map(a => a.student_id))]
    const classIds = [...new Set(attendances.map(a => a.class_id))]

    // Fetch student details
    const { data: students, error: studentsError } = await supabaseClient
      .from('students')
      .select('id, name')
      .in('id', studentIds)

    if (studentsError) {
      throw new Error(`Error fetching students: ${studentsError.message}`)
    }

    // Fetch class details
    const { data: classes, error: classesError } = await supabaseClient
      .from('classes')
      .select('id, name')
      .in('id', classIds)

    if (classesError) {
      throw new Error(`Error fetching classes: ${classesError.message}`)
    }

    // Create maps for easy lookup
    const studentMap = new Map(students?.map(s => [s.id, s.name]) || [])
    const classMap = new Map(classes?.map(c => [c.id, c.name]) || [])

    // Group attendances by student
    const studentAttendances = new Map<string, AttendanceRecord[]>()
    attendances.forEach((attendance: AttendanceRecord) => {
      if (!studentAttendances.has(attendance.student_id)) {
        studentAttendances.set(attendance.student_id, [])
      }
      studentAttendances.get(attendance.student_id)!.push(attendance)
    })

    // Build HTML email
    const emailHtml = generateEmailHtml(
      studentAttendances,
      studentMap,
      classMap,
      startDateStr,
      endDateStr,
      attendances.length
    )

    // Send email using Resend (you'll need to set up Resend API key)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const recipientEmail = Deno.env.get('REPORT_RECIPIENT_EMAIL')

    if (!resendApiKey || !recipientEmail) {
      throw new Error('Missing RESEND_API_KEY or REPORT_RECIPIENT_EMAIL environment variables')
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Sistema Chamada <noreply@yourdomain.com>',
        to: recipientEmail,
        subject: `Relatório Semanal de Presença - ${startDateStr} a ${endDateStr}`,
        html: emailHtml,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailResult)}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weekly report sent successfully',
        period: `${startDateStr} to ${endDateStr}`,
        totalAttendances: attendances.length,
        totalStudents: studentIds.length,
        emailId: emailResult.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateEmailHtml(
  studentAttendances: Map<string, AttendanceRecord[]>,
  studentMap: Map<string, string>,
  classMap: Map<string, string>,
  startDate: string,
  endDate: string,
  totalAttendances: number
): string {
  const studentRows = Array.from(studentAttendances.entries())
    .map(([studentId, records]) => {
      const studentName = studentMap.get(studentId) || 'Aluno Desconhecido'
      const attendanceDetails = records
        .map(r => {
          const className = classMap.get(r.class_id) || 'Turma Desconhecida'
          return `<li>${r.date} às ${r.time} - ${className}</li>`
        })
        .join('')
      
      return `
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd;">${studentName}</td>
          <td style="padding: 12px; border: 1px solid #ddd;">${records.length}</td>
          <td style="padding: 12px; border: 1px solid #ddd;">
            <ul style="margin: 0; padding-left: 20px;">
              ${attendanceDetails}
            </ul>
          </td>
        </tr>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório Semanal de Presença</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin: 0 0 10px 0;">📊 Relatório Semanal de Presença</h1>
        <p style="color: #7f8c8d; margin: 0;">Período: ${formatDate(startDate)} a ${formatDate(endDate)}</p>
      </div>

      <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">📈 Resumo</h2>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Total de Presenças:</strong> ${totalAttendances}
          </li>
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Total de Alunos Presentes:</strong> ${studentAttendances.size}
          </li>
          <li style="padding: 8px 0;">
            <strong>Média de Presenças por Aluno:</strong> ${(totalAttendances / studentAttendances.size).toFixed(2)}
          </li>
        </ul>
      </div>

      <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">👥 Detalhes por Aluno</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #3498db; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Aluno</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Total de Presenças</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            ${studentRows}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">
        <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
          Este relatório foi gerado automaticamente pelo Sistema de Chamada
        </p>
      </div>
    </body>
    </html>
  `
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
