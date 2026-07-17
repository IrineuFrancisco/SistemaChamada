import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, GraduationCap, AlertCircle } from 'lucide-react';

const Calendario = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // =====================================================================
  // FERIADOS - Osvaldo Cruz/SP 2026
  // Nacionais + Estaduais (SP) + Municipais (Osvaldo Cruz)
  // =====================================================================
  const holidays = {
    // --- NACIONAIS ---
    '2026-01-01': '🎆 Confraternização Universal (Ano Novo)',
    '2026-02-16': '🎭 Carnaval',
    '2026-02-17': '🎭 Carnaval',
    '2026-02-18': '🎭 Quarta-feira de Cinzas (ponto facultativo)',
    '2026-04-03': '✝️ Sexta-feira Santa (Paixão de Cristo)',
    '2026-04-05': '✝️ Páscoa',
    '2026-04-21': '⛓️ Tiradentes',
    '2026-05-01': '👷 Dia do Trabalho',
    '2026-06-04': '✝️ Corpus Christi',
    '2026-09-07': '🇧🇷 Independência do Brasil',
    '2026-10-12': '🙏 Nossa Senhora Aparecida',
    '2026-11-02': '🕯️ Finados',
    '2026-11-15': '🏛️ Proclamação da República',
    '2026-11-20': '✊ Consciência Negra',
    '2026-12-25': '🎄 Natal',

    // --- ESTADUAIS (São Paulo) ---
    '2026-07-09': '⚔️ Revolução Constitucionalista de 1932',

    // --- MUNICIPAIS (Osvaldo Cruz - SP) ---
    '2026-10-14': '🏙️ Aniversário de Osvaldo Cruz',

    // --- RECESSO ESCOLAR (24/Jun a 21/Jul) ---
    '2026-06-24': '📚 Recesso Escolar',
    '2026-06-25': '📚 Recesso Escolar',
    '2026-06-26': '📚 Recesso Escolar',
    '2026-06-27': '📚 Recesso Escolar',
    '2026-06-28': '📚 Recesso Escolar',
    '2026-06-29': '📚 Recesso Escolar',
    '2026-06-30': '📚 Recesso Escolar',
    '2026-07-01': '📚 Recesso Escolar',
    '2026-07-02': '📚 Recesso Escolar',
    '2026-07-03': '📚 Recesso Escolar',
    '2026-07-04': '📚 Recesso Escolar',
    '2026-07-05': '📚 Recesso Escolar',
    '2026-07-06': '📚 Recesso Escolar',
    '2026-07-07': '📚 Recesso Escolar',
    '2026-07-08': '📚 Recesso Escolar',
    '2026-07-09': '📚 Recesso Escolar / ⚔️ Rev. Constitucionalista',
    '2026-07-10': '📚 Recesso Escolar',
    '2026-07-11': '📚 Recesso Escolar',
    '2026-07-12': '📚 Recesso Escolar',
    '2026-07-13': '📚 Recesso Escolar',
    '2026-07-14': '📚 Recesso Escolar',
    '2026-07-15': '📚 Recesso Escolar',
    '2026-07-16': '📚 Recesso Escolar',
    '2026-07-17': '📚 Recesso Escolar',
    '2026-07-18': '📚 Recesso Escolar',
    '2026-07-19': '📚 Recesso Escolar',
    '2026-07-20': '📚 Recesso Escolar',
    '2026-07-21': '📚 Recesso Escolar',
  };

  const getDayInfo = (year, month, day) => {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = date.getDay();
    const startDate = new Date(2026, 6, 22); // 22 de Julho
    const endDate = new Date(2026, 11, 18);  // 18 de Dezembro

    let type = 'normal';
    let label = '';

    // 1. Verificar se é Feriado (Amarelo)
    if (holidays[dateStr]) {
      type = 'holiday';
      label = holidays[dateStr];
    }
    // 2. Verificar se é dia de aula dentro do período letivo
    else if (date >= startDate && date <= endDate && dayOfWeek >= 2 && dayOfWeek <= 5) {
      // Cálculo de quantos dias de aula já se passaram desde o início
      let countRed = 0; // Terça e Quinta
      let countGreen = 0; // Quarta e Sexta

      let tempDate = new Date(startDate);
      while (tempDate <= date) {
        const dStr = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`;
        const dWeek = tempDate.getDay();

        // Só conta se não for feriado
        if (!holidays[dStr]) {
          if (dWeek === 2 || dWeek === 4) countRed++;
          if (dWeek === 3 || dWeek === 5) countGreen++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }

      if ((dayOfWeek === 2 || dayOfWeek === 4) && countRed <= 40) {
        type = 'class-red';
        label = `Aula Ter/Qui (Dia ${countRed}/40)`;
      } else if ((dayOfWeek === 3 || dayOfWeek === 5) && countGreen <= 40) {
        type = 'class-green';
        label = `Aula Qua/Sex (Dia ${countGreen}/40)`;
      }
    }

    return { day, dateStr, dayOfWeek, type, label };
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(getDayInfo(year, month, day));
    return days;
  };

  // Contadores globais de dias de aula no período
  const countClassDays = () => {
    const startDate = new Date(2026, 6, 22);
    const endDate = new Date(2026, 11, 18);
    let red = 0, green = 0;
    let d = new Date(startDate);
    while (d <= endDate) {
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dw = d.getDay();
      if (!holidays[dStr]) {
        if (dw === 2 || dw === 4) red++;
        if (dw === 3 || dw === 5) green++;
      }
      d.setDate(d.getDate() + 1);
    }
    return { red, green };
  };
  const totalDays = countClassDays();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="bg-blue-700 dark:bg-blue-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <CalendarIcon size={22} />
            <div>
              <h2 className="font-bold text-lg leading-tight">Cronograma Letivo 2026</h2>
              <p className="text-blue-200 text-xs font-medium">SENAI · Osvaldo Cruz – SP · 22/Jul a 18/Dez</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Coluna do Calendário ── */}
          <div className="flex-1 flex flex-col overflow-y-auto">


            {/* Navegação de mês */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <button
                onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-bold text-base text-slate-800 dark:text-slate-100">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button
                onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Grade */}
            <div className="p-4 flex-1">
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {daysOfWeek.map(d => (
                  <div key={d} className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {generateCalendarDays().map((info, i) => {
                  if (!info) return <div key={i} />;
                  const isToday = info.dateStr === todayStr;
                  const isSelected = selectedDay?.dateStr === info.dateStr;
                  let cellClass = 'aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold cursor-pointer transition-all ';
                  if (isSelected) cellClass += 'ring-2 ring-offset-2 ring-blue-400 ';
                  // Hoje sempre fica azul, sobrepondo qualquer outra cor
                  if (isToday) {
                    cellClass += 'bg-blue-600 text-white shadow-lg ';
                  } else if (info.type === 'holiday') {
                    cellClass += 'bg-yellow-400 dark:bg-yellow-500 text-yellow-950 ';
                  } else if (info.type === 'class-red') {
                    cellClass += 'bg-red-500 text-white ';
                  } else if (info.type === 'class-green') {
                    cellClass += 'bg-green-600 text-white ';
                  } else if (info.dayOfWeek === 0 || info.dayOfWeek === 6) {
                    cellClass += 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 ';
                  } else {
                    cellClass += 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 ';
                  }
                  return (
                    <div key={i} className={cellClass} onClick={() => setSelectedDay(info)}>
                      {info.day}
                      {isToday && <div className="w-1 h-1 rounded-full bg-white/70 mt-0.5" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legenda */}
            <div className="px-4 pb-4 flex flex-wrap gap-x-4 gap-y-2 shrink-0 border-t border-slate-100 dark:border-slate-800 pt-3">
              {[
                { color: 'bg-red-500', label: 'Aula (Ter/Qui)' },
                { color: 'bg-green-600', label: 'Aula (Qua/Sex)' },
                { color: 'bg-yellow-400', label: 'Feriado / Recesso' },
                { color: 'bg-blue-600', label: 'Hoje' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm shrink-0 ${color}`} />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Painel de detalhes (lado direito) ── */}
          <div className="w-56 border-l border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {selectedDay ? 'Dia Selecionado' : 'Selecione um dia'}
              </h3>
            </div>

            {selectedDay ? (
              <div className="p-4 space-y-3 flex-1">
                <div className="text-center bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="text-4xl font-black text-slate-800 dark:text-slate-100">{selectedDay.day}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {daysOfWeek[selectedDay.dayOfWeek]}
                  </div>
                </div>

                {selectedDay.label ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 leading-snug">{selectedDay.label}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Sem eventos</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className={`rounded-lg px-3 py-2 text-xs font-bold text-center
                    ${selectedDay.type === 'holiday' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      selectedDay.type === 'class-red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        selectedDay.type === 'class-green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {selectedDay.type === 'holiday' ? '🟡 Feriado / Recesso' :
                      selectedDay.type === 'class-red' ? '🔴 Dia de Aula' :
                        selectedDay.type === 'class-green' ? '🟢 Dia de Aula' :
                          '⬜ Dia Normal'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 text-center">
                <div>
                  <CalendarIcon size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">Clique em um dia no calendário para ver os detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendario;

