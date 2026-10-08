import React from 'react';
import { Users, Vote, Clock, RefreshCw } from 'lucide-react';

interface MetricCardsProps {
  totalStudents: number;
  totalVotesCast: number;
  lastVote: string;
  loading: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalStudents,
  totalVotesCast,
  lastVote,
  loading,
  onRefresh,
  lastUpdated,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Resumen General
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {lastUpdated
              ? `Última sincronización: ${lastUpdated.toLocaleTimeString()}`
              : 'Sin sincronizar aún'}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar datos'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Alumnos */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Alumnos Participantes
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalStudents}
            </p>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Formularios respondidos
            </span>
          </div>
        </div>

        {/* Total Votos */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Votos Emitidos
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalVotesCast}
            </p>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Suma entre ambos departamentos
            </span>
          </div>
        </div>

        {/* Último Voto */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              Último Voto Registrado
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate" title={lastVote}>
              {lastVote || 'N/A'}
            </p>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Fecha y hora en hoja de cálculo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
