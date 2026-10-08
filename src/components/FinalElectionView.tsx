import React from 'react';
import {
  Award,
  Crown,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { FinalElectionResult, FinalCandidate } from '../types';

interface FinalElectionViewProps {
  finalElection: FinalElectionResult;
  totalStudents: number;
}

export const FinalElectionView: React.FC<FinalElectionViewProps> = ({
  finalElection,
  totalStudents,
}) => {
  const {
    top3Estadistica,
    top3Informatica,
    selectedOverall,
    tiedCandidates,
    hasTieAtCutoff,
    cutoffVotes,
  } = finalElection;

  const totalConfirmed = top3Estadistica.length + top3Informatica.length + selectedOverall.length;

  return (
    <div className="space-y-8">
      {/* Banner explicativo del Criterio Oficial */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Criterio Oficial de Selección
            </span>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-200">
              <Layers className="w-4 h-4" />
              Top 3 Estadística + Top 3 Informática + 3 Siguientes Más Votados
            </div>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            Profesores Seleccionados para la Orla
          </h2>
          <p className="text-xs md:text-sm text-indigo-100 max-w-3xl leading-relaxed">
            La orla final se compone de <strong>9 profesores en total</strong>: los 3 profesores más votados de
            Estadística, los 3 profesores más votados de Informática, y los <strong>3 siguientes</strong> con
            mayor número de votos entre ambos departamentos. Si existe un empate por el corte que define
            la entrada a estas 9 plazas, todos los profesores implicados quedan señalizados en ámbar.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="px-3.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              Confirmados directos: <span className="text-amber-300 text-sm font-extrabold">{totalConfirmed}</span> / 9 plazas base
            </div>
            {hasTieAtCutoff && (
              <div className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>
                  ¡Empate en el corte final! ({tiedCandidates.length} profesores con {cutoffVotes} votos)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de Empate en la última posición */}
      {hasTieAtCutoff && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-600 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">
                Empate por la última plaza de la Orla ({cutoffVotes} votos)
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                Los siguientes profesores tienen exactamente la misma cantidad de votos ({cutoffVotes})
                y compiten por entrar en la orla. Al no haber criterio de desempate automático, todos
                se muestran marcados en color ámbar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {tiedCandidates.map((c) => (
              <CandidateCard key={c.name} candidate={c} totalStudents={totalStudents} />
            ))}
          </div>
        </div>
      )}

      {/* Sección 1: Top 3 Directo de Cada Departamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 3 Estadística */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-slate-700 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Top 3 Estadística (Directos)
                </h3>
                <p className="text-xs text-slate-500">Clasificación directa por departamento</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-1 rounded-full">
              {top3Estadistica.length} plazas
            </span>
          </div>

          <div className="space-y-3">
            {top3Estadistica.map((c, i) => (
              <CandidateCard
                key={c.name}
                candidate={c}
                rankBadge={`#${i + 1} Estadística`}
                totalStudents={totalStudents}
              />
            ))}
          </div>
        </div>

        {/* Top 3 Informática */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Crown className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Top 3 Informática (Directos)
                </h3>
                <p className="text-xs text-slate-500">Clasificación directa por departamento</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full">
              {top3Informatica.length} plazas
            </span>
          </div>

          <div className="space-y-3">
            {top3Informatica.map((c, i) => (
              <CandidateCard
                key={c.name}
                candidate={c}
                rankBadge={`#${i + 1} Informática`}
                totalStudents={totalStudents}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sección 2: 6 Siguientes Más Votados Globales */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Los 3 Siguientes Más Votados (Conjunto Global)
              </h3>
              <p className="text-xs text-slate-500">
                Añadidos por mayor número total de votos entre ambos departamentos (hasta completar 9)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-1 rounded-full self-start sm:self-auto">
            {selectedOverall.length} plazas adjudicadas
          </span>
        </div>

        {selectedOverall.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No hay candidatos adicionales confirmados fuera de los Top 3 departamentales.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedOverall.map((c, i) => (
              <CandidateCard
                key={c.name}
                candidate={c}
                rankBadge={`Global +${i + 1}`}
                totalStudents={totalStudents}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sección 3: Tabla Global Consolidada de Estado de Entrada */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Listado Completo y Estado de Admisión a la Orla
          </h3>
          <span className="text-xs text-slate-500">
            {finalElection.allCandidates.length} profesores registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Profesor / Profesora</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Asignaturas</th>
                <th className="py-3 px-4 text-right">Votos</th>
                <th className="py-3 px-4 text-center">Resolución Orla</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {finalElection.allCandidates.map((candidate, idx) => {
                const isSelected = candidate.status === 'top3_direct' || candidate.status === 'top3_overall';
                const isTied = candidate.status === 'tied_cutoff';

                return (
                  <tr
                    key={candidate.name + idx}
                    className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-700/50 ${
                      isTied
                        ? 'bg-amber-50/60 dark:bg-amber-950/40 border-l-4 border-amber-500'
                        : isSelected
                        ? 'bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'opacity-70'
                    }`}
                  >
                    <td className="py-3 px-4 text-center text-xs text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {candidate.name}
                        </span>
                        {candidate.badge && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300/60">
                            {candidate.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs font-semibold">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md ${
                          candidate.department === 'Estadística'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {candidate.department}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {candidate.subjects || '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {candidate.votes}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        ({candidate.percentage}%)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {candidate.status === 'top3_direct' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                          <Crown className="w-3.5 h-3.5 text-indigo-600" />
                          Top 3 Depto.
                        </span>
                      ) : candidate.status === 'top3_overall' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Top 3 Global
                        </span>
                      ) : candidate.status === 'tied_cutoff' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-amber-950 dark:bg-amber-500 dark:text-amber-950 shadow-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Empate en Corte
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                          No entra
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface CandidateCardProps {
  candidate: FinalCandidate;
  rankBadge?: string;
  totalStudents: number;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  rankBadge,
}) => {
  const isTied = candidate.status === 'tied_cutoff';

  return (
    <div
      className={`p-4 rounded-xl border transition ${
        isTied
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600 shadow-sm'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            candidate.department === 'Estadística'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
          }`}
        >
          {candidate.department}
        </span>

        {rankBadge && (
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {rankBadge}
          </span>
        )}

        {isTied && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
            Empatado
          </span>
        )}
      </div>

      <div className="mt-2.5">
        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">
          {candidate.name}
        </h4>
        {candidate.subjects && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 line-clamp-1">
            <BookOpen className="w-3 h-3 shrink-0" />
            {candidate.subjects}
          </p>
        )}
        {candidate.badge && (
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-300/50">
            <AlertTriangle className="w-2.5 h-2.5" />
            {candidate.badge}
          </span>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-700 dark:text-slate-300">
          {candidate.votes} votos
        </span>
        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
          {candidate.percentage}% alumnos
        </span>
      </div>
    </div>
  );
};
