import React from 'react';
import { AlertTriangle, BookOpen, CheckCircle2 } from 'lucide-react';
import type { TeacherVote } from '../types';

interface DepartmentTableProps {
  data: TeacherVote[];
  topCutoff: number;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({ data, topCutoff }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
          Tabla Detallada de Clasificación
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Total profesores: {data.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-3 px-4 w-14 text-center">Pos.</th>
              <th className="py-3 px-4">Profesor / Profesora</th>
              <th className="py-3 px-4">Asignaturas</th>
              <th className="py-3 px-4 text-center">Estado / Avisos</th>
              <th className="py-3 px-4 text-right">Votos</th>
              <th className="py-3 px-4 text-right">% Alumnos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {data.map((teacher, index) => {
              const isSelected = index < topCutoff;

              return (
                <tr
                  key={teacher.name + index}
                  className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-700/50 ${
                    isSelected
                      ? 'bg-indigo-50/20 dark:bg-indigo-950/20 font-medium'
                      : ''
                  }`}
                >
                  {/* Posición */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200'
                          : index === 1
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                          : index === 2
                          ? 'bg-amber-200/50 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>

                  {/* Nombre */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {teacher.name}
                      </span>
                      {isSelected && (
                        <span
                          title={`Clasificado en Top ${topCutoff}`}
                          className="inline-flex items-center text-indigo-600 dark:text-indigo-400"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Asignaturas */}
                  <td className="py-3.5 px-4">
                    {teacher.subjects ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        {teacher.subjects}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  {/* Badges / Avisos */}
                  <td className="py-3.5 px-4 text-center">
                    {teacher.badge ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-300/60 dark:border-amber-800">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {teacher.badge}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>

                  {/* Votos */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {teacher.votes}
                    </span>
                  </td>

                  {/* Porcentaje */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 hidden sm:block overflow-hidden">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full"
                          style={{ width: `${Math.min(teacher.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {teacher.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
