import React from 'react';
import { Crown, Medal, Award, AlertTriangle, BookOpen } from 'lucide-react';
import type { TeacherVote } from '../types';

interface PodiumProps {
  topTeachers: TeacherVote[];
  departmentName: string;
}

export const Podium: React.FC<PodiumProps> = ({ topTeachers, departmentName }) => {
  if (topTeachers.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <p className="text-slate-500 text-sm">No hay votos registrados para {departmentName}</p>
      </div>
    );
  }

  const first = topTeachers[0];
  const second = topTeachers[1];
  const third = topTeachers[2];

  return (
    <div className="bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-800/60 dark:to-slate-800 p-6 rounded-2xl border border-indigo-100 dark:border-slate-700/60 shadow-xs mb-8">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
          <Crown className="w-3.5 h-3.5" /> Podio de Honor
        </span>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1">
          Top 3 Profesores Más Votados
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-3xl mx-auto pt-4">
        {/* 2nd Place */}
        {second ? (
          <div className="order-2 md:order-1 flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-lg mb-2 shadow-inner ring-4 ring-slate-200/50 dark:ring-slate-700/50">
              <Medal className="w-6 h-6 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">
              2º Puesto
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
              {second.name}
            </h4>
            {second.subjects && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 line-clamp-1">
                <BookOpen className="w-3 h-3 shrink-0" />
                {second.subjects}
              </p>
            )}
            {second.badge && (
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/70 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" /> {second.badge}
              </span>
            )}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 w-full flex justify-between text-xs font-medium">
              <span className="text-slate-600 dark:text-slate-400">{second.votes} votos</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{second.percentage}%</span>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 hidden md:block" />
        )}

        {/* 1st Place */}
        {first && (
          <div className="order-1 md:order-2 flex flex-col items-center text-center p-5 rounded-2xl bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-600/60 shadow-md transition hover:-translate-y-1 relative">
            <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] tracking-wide uppercase shadow-sm">
              Ganador
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-2xl mb-2 ring-4 ring-amber-300/40">
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 tracking-wider uppercase mb-1">
              1º Puesto
            </span>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg line-clamp-2">
              {first.name}
            </h4>
            {first.subjects && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1 line-clamp-1">
                <BookOpen className="w-3 h-3 shrink-0" />
                {first.subjects}
              </p>
            )}
            {first.badge && (
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" /> {first.badge}
              </span>
            )}
            <div className="mt-4 pt-2 border-t border-amber-200 dark:border-amber-900/40 w-full flex justify-between text-sm font-semibold">
              <span className="text-slate-700 dark:text-slate-300">{first.votes} votos</span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">{first.percentage}%</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third ? (
          <div className="order-3 flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-lg mb-2 ring-4 ring-amber-200/50 dark:ring-amber-900/40">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 tracking-wider uppercase mb-1">
              3º Puesto
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2">
              {third.name}
            </h4>
            {third.subjects && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 line-clamp-1">
                <BookOpen className="w-3 h-3 shrink-0" />
                {third.subjects}
              </p>
            )}
            {third.badge && (
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/70 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" /> {third.badge}
              </span>
            )}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 w-full flex justify-between text-xs font-medium">
              <span className="text-slate-600 dark:text-slate-400">{third.votes} votos</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{third.percentage}%</span>
            </div>
          </div>
        ) : (
          <div className="order-3 hidden md:block" />
        )}
      </div>
    </div>
  );
};
