import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import {
  GraduationCap,
  BarChart2,
  Users,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Award,
} from 'lucide-react';
import type { DashboardStats } from './types';
import { processVotesData } from './utils/dataParser';
import { buildGoogleSheetUrl, DEFAULT_SHEET_ID } from './utils/sheetConfig';
import { MetricCards } from './components/MetricCards';
import { Podium } from './components/Podium';
import { DepartmentChart } from './components/DepartmentChart';
import { DepartmentTable } from './components/DepartmentTable';
import { VotersAudit } from './components/VotersAudit';
import { FinalElectionView } from './components/FinalElectionView';

const INITIAL_STATS: DashboardStats = {
  totalStudents: 0,
  totalVotesCast: 0,
  lastVoteTimestamp: 'Cargando...',
  estadisticaRanking: [],
  informaticaRanking: [],
  voters: [],
  finalElection: {
    top3Estadistica: [],
    top3Informatica: [],
    selectedOverall: [],
    tiedCandidates: [],
    notSelectedCandidates: [],
    allCandidates: [],
    cutoffVotes: null,
    totalSelectedCount: 0,
    hasTieAtCutoff: false,
  },
};

export const App: React.FC = () => {
  const [topCutoff, setTopCutoff] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<'final' | 'rankings' | 'voters'>('final');
  const [departmentView, setDepartmentView] = useState<'both' | 'estadistica' | 'informatica'>('both');

  // Data & Fetch State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const csvUrl = buildGoogleSheetUrl();
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error(
          `No se pudo obtener la hoja de cálculo (HTTP ${response.status}). Asegúrate de tener conexión a Internet.`
        );
      }

      const csvText = await response.text();

      if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
        throw new Error(
          'La hoja de cálculo requiere autorización de Google. Verifica que el enlace esté compartido con "Cualquier persona con el enlace: Lector".'
        );
      }

      Papa.parse<string[]>(csvText, {
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length <= 1) {
            setError('La hoja de cálculo no contiene filas de respuestas suficientes.');
          } else {
            const processed = processVotesData(results.data);
            setStats(processed);
            setLastUpdated(new Date());
          }
          setLoading(false);
        },
        error: (err: Error) => {
          setError(`Error al parsear las respuestas: ${err.message}`);
          setLoading(false);
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con la hoja de Google Sheets.';
      setError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">
                Elección de Profesores
              </h1>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Orla de Promoción Universitaria
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado en tiempo real
            </div>
            <a
              href={`https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/edit?gid=1484206016`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="Abrir hoja de Google Forms"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Ver Hoja de Google</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">Error de conexión con las respuestas</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* KPIs Cards */}
        <MetricCards
          totalStudents={stats.totalStudents}
          totalVotesCast={stats.totalVotesCast}
          lastVote={stats.lastVoteTimestamp}
          loading={loading}
          onRefresh={fetchData}
          lastUpdated={lastUpdated}
        />

        {/* Navigation Tabs and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          {/* Main Navigation (Elección Final vs Rankings vs Voters) */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('final')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'final'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              Elección Final Orla
              {stats.finalElection.hasTieAtCutoff && (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Hay empate en el corte" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'rankings'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Rankings Departamentos
            </button>
            <button
              onClick={() => setActiveTab('voters')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'voters'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Auditoría Votantes ({stats.voters.length})
            </button>
          </div>

          {/* Controls for Cutoff & Department Filter when in rankings */}
          {activeTab === 'rankings' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Department View filter */}
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setDepartmentView('both')}
                  className={`px-3 py-1.5 rounded-md transition ${
                    departmentView === 'both'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Ambos
                </button>
                <button
                  onClick={() => setDepartmentView('estadistica')}
                  className={`px-3 py-1.5 rounded-md transition ${
                    departmentView === 'estadistica'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Estadística
                </button>
                <button
                  onClick={() => setDepartmentView('informatica')}
                  className={`px-3 py-1.5 rounded-md transition ${
                    departmentView === 'informatica'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Informática
                </button>
              </div>

              {/* Top N Cutoff Selector */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-xs">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Corte:
                </span>
                <select
                  value={topCutoff}
                  onChange={e => setTopCutoff(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
                >
                  <option value={3}>Top 3</option>
                  <option value={4}>Top 4</option>
                  <option value={5}>Top 5</option>
                  <option value={6}>Top 6</option>
                  <option value={10}>Top 10</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tab 0: Elección Final de la Orla (Criterio oficial) */}
        {activeTab === 'final' && (
          <section className="space-y-4">
            <FinalElectionView
              finalElection={stats.finalElection}
              totalStudents={stats.totalStudents}
            />
          </section>
        )}

        {/* Tab 1: Department Rankings */}
        {activeTab === 'rankings' && (
          <div className="space-y-12">
            {/* Ranking A: Profesores de Estadística */}
            {(departmentView === 'both' || departmentView === 'estadistica') && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-8 bg-indigo-600 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      Ranking A: Profesores de Estadística
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {stats.estadisticaRanking.length} profesores con votos
                  </span>
                </div>

                <Podium
                  topTeachers={stats.estadisticaRanking}
                  departmentName="Estadística"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DepartmentChart
                    data={stats.estadisticaRanking}
                    topCutoff={topCutoff}
                    colorTheme="indigo"
                  />
                  <DepartmentTable
                    data={stats.estadisticaRanking}
                    topCutoff={topCutoff}
                  />
                </div>
              </section>
            )}

            {/* Ranking B: Profesores de Informática */}
            {(departmentView === 'both' || departmentView === 'informatica') && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-8 bg-emerald-600 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      Ranking B: Profesores de Informática
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {stats.informaticaRanking.length} profesores con votos
                  </span>
                </div>

                <Podium
                  topTeachers={stats.informaticaRanking}
                  departmentName="Informática"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DepartmentChart
                    data={stats.informaticaRanking}
                    topCutoff={topCutoff}
                    colorTheme="emerald"
                  />
                  <DepartmentTable
                    data={stats.informaticaRanking}
                    topCutoff={topCutoff}
                  />
                </div>
              </section>
            )}
          </div>
        )}

        {/* Tab 2: Voter Audit */}
        {activeTab === 'voters' && (
          <section className="space-y-4">
            <VotersAudit voters={stats.voters} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 justify-center sm:justify-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Conectado a las respuestas del formulario de la orla
          </p>
          <div className="flex items-center gap-4">
            <a
              href={`https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/edit?gid=1484206016`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Abrir Google Sheet
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
