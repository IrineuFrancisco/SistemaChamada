import React, { useState } from 'react';
import { Calendar1Icon, Clock } from 'lucide-react';

const CalendarWidget = () => {
  const [currentDate] = useState(new Date());

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysOfWeekLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
  const fullDayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const today = currentDate.getDate();
  const dayOfWeekIndex = currentDate.getDay();

  const getSchedule = (dayIndex) => {
    switch (dayIndex) {
      case 2: // Terça-feira
        return [
          { name: "PBE2", time: "07:00 - 11:00", color: "bg-blue-500" },
          { name: "IOT", time: "12:00 - 16:00", color: "bg-purple-500" }
        ];
      case 3: // Quarta-feira
        return [
          { name: "PBE1", time: "07:00 - 11:00", color: "bg-green-500" },
          { name: "LIMA", time: "12:00 - 16:00", color: "bg-orange-500" }
        ];
      case 4: // Quinta-feira
        return [
          { name: "PPDM", time: "07:00 - 10:15", color: "bg-red-500" },
          { name: "PSOF3", time: "10:16 - 14:15", color: "bg-indigo-500" },
          { name: "TSOF2", time: "14:16 - 16:00", color: "bg-blue-500" }
        ];
      case 5: // Sexta-feira
        return [
          { name: "BCD", time: "07:00 - 10:15", color: "bg-yellow-500" },
          { name: "PSOF1", time: "12:00 - 12:50", color: "bg-indigo-500" },
          { name: "TSOF2", time: "12:51 - 16:00", color: "bg-blue-500" }
        ];
      default:
        return [];
    }
  };

  const todaySchedule = getSchedule(dayOfWeekIndex);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
      {/* Header with Date */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 transition-colors duration-300">
        <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest">{fullDayNames[dayOfWeekIndex]}</h3>
        <div className="text-2xl font-bold mt-1">{today}</div>
        <div className="text-sm font-medium mt-1 opacity-90">{months[month]} {year}</div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
          {daysOfWeekLabels.map((day, idx) => <div key={idx}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {blanks.map(b => <div key={`b-${b}`} />)}
          {daysArray.map((day, idx) => (
            <div
              key={idx}
              className={`p-1.5 rounded-lg flex items-center justify-center
                ${day === today
                  ? 'bg-blue-600 dark:bg-blue-700 text-white font-bold shadow-md'
                  : day
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : ''}
              `}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-300">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          Aulas de Hoje
        </h4>
        {todaySchedule.length > 0 ? (
          <div className="space-y-3">
            {todaySchedule.map((cls, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                <div className={`w-3 h-3 rounded-full ${cls.color}`}></div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{cls.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{cls.time}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            Nenhuma aula programada para hoje.
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;
