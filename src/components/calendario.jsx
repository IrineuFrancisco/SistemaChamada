import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, GraduationCap, AlertCircle } from 'lucide-react';

const Calendario = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Configuração de Feriados (Fundo Amarelo)
  const holidays = {
    '2026-02-16': 'Carnaval',
    '2026-02-17': 'Carnaval',
    '2026-02-18': 'Quarta-feira de Cinzas',
    '2026-03-19': 'Feriado',
    '2026-04-03': 'Sexta-feira Santa',
    '2026-04-21': 'Tiradentes',
    '2026-05-01': 'Dia do Trabalho',
    '2026-06-04': 'Corpus Christi',
  };

  const getDayInfo = (year, month, day) => {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = date.getDay();
    const startDate = new Date(2026, 0, 27); // 27 de Jan

    let type = 'normal';
    let label = '';

    // 1. Verificar se é Feriado (Amarelo)
    if (holidays[dateStr]) {
      type = 'holiday';
      label = holidays[dateStr];
    } 
    // 2. Verificar se é dia de aula após a data de início
    else if (date >= startDate && dayOfWeek >= 2 && dayOfWeek <= 5) {
      // Cálculo de quantos dias de aula já se passaram desde o início para o contador de 40 dias
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

  const getDayClassName = (info) => {
    if (!info) return 'p-2';
    let base = 'day-cell ';
    if (info.type === 'holiday') return base + 'bg-yellow-400 text-yellow-950 font-bold';
    if (info.type === 'class-red') return base + 'bg-red-500 text-white';
    if (info.type === 'class-green') return base + 'bg-green-600 text-white';
    if (info.dayOfWeek === 0 || info.dayOfWeek === 6) return base + 'bg-gray-100 text-gray-400';
    return base + 'bg-white text-gray-700 border border-gray-50';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <style>{`
        .mini-cal { font-family: 'Inter', sans-serif; max-width: 320px; }
        .day-cell { 
          aspect-ratio: 1; display: flex; align-items: center; justify-content: center; 
          border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: 0.2s;
        }
        .day-cell:hover { filter: contrast(1.2); }
      `}</style>

      <div className="bg-white rounded-xl shadow-2xl w-full mini-cal overflow-hidden ">
        {/* Header */}
        <div className="bg-blue-700 p-3 text-white flex justify-between items-center">
          <h2 className="text-xs font-bold flex items-center gap-2">
            <CalendarIcon size={14} /> CRONOGRAMA 2026
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X size={16}/></button>
        </div>

        {/* Navegação */}
        <div className="p-2 flex items-center justify-between border-b bg-gray-50">
          <button onClick={() => {
            const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d);
          }}><ChevronLeft size={18}/></button>
          <span className="font-bold text-sm text-gray-800">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button onClick={() => {
            const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d);
          }}><ChevronRight size={18}/></button>
        </div>

        {/* Grade */}
        <div className="p-2">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {daysOfWeek.map(d => <div key={d} className="text-center text-[9px] font-bold text-gray-400 uppercase">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((info, i) => (
              <div key={i} className={getDayClassName(info)} onClick={() => info && setSelectedDay(info)}>
                {info?.day}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="p-3 bg-gray-50 border-t grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-[10px]">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div> <span>Dev 02 (Ter/Qui)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div> <span>Dev 01 (Qua/Sex)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div> <span>Feriado/Recesso</span>
          </div>
          {/* <div className="text-[9px] text-gray-400 italic">Início: 27/jan</div> */}
        </div>

        {/* Info Box */}
        {selectedDay && selectedDay.label && (
          <div className="p-2 bg-blue-50 border-t border-blue-100 flex items-center gap-2">
            <AlertCircle size={14} className="text-blue-500" />
            <span className="text-[10px] font-medium text-blue-700">{selectedDay.label}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendario;