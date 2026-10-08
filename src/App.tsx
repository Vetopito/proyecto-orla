import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import {
  GraduationCap,
  Settings2,
  Database,
  BarChart2,
  Users,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import type { DashboardStats } from './types';
import { processVotesData } from './utils/dataParser';
import { buildGoogleSheetUrl, SAMPLE_CSV } from './utils/sheetConfig';
import { MetricCards } from './components/MetricCards';
import { Podium } from './components/Podium';
import { DepartmentChart } from './components/DepartmentChart';
import { DepartmentTable } from './components/DepartmentTable';
import { VotersAudit } from './components/VotersAudit';

export const App: React.FC = () => {
  // Configuration State
  const [sheetId, setSheetId] = useState<string>(() => {
    return localStorage.getItem('orla_sheet_id') || '';
  });
  const [sheetTabName, setSheetTabName] = useState<string>('Respuestas de formulario 1');
  const [useSampleData, setUseSampleData] = useState<boolean>(!sheetId);
  const [topCutoff, setTopCutoff] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<'rankings' | 'voters'>('rankings');
  const [departmentView, setDepartmentView] = useState<'both' | 'estadistica' | 'informatica'>('both');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // Data & Fetch State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState<DashboardStats>(() => {
    // Initial parse with sample data if no sheet configured
    const parsed = Papa.parse<string[]>(SAMPLE_CSV, { skipEmptyLines: true });
    return processVotesData(parsed.data);
  });

  const fetchData = useCallback(async (targetSheetId: string, isSample: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      if (isSample || !targetSheetId.trim()) {
        const parsed = Papa.parse<string[]>(SAMPLE_CSV, { skipEmptyLines: true });
        const processed = processVotesData(parsed.data);
        setStats(processed);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      const csvUrl = buildGoogleSheetUrl(targetSheetId, sheetTabName);
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error(
          `No se pudo obtener la hoja (HTTP ${response.status}). Asegúrate de que la hoja de cálculo de Google tenga permisos de lectura ("Cualquiera con el enlace puede ver") o esté publicada en la web.`
        );
      }

      const csvText = await response.text();

      // Check if Google returned an HTML login page instead of CSV
      if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
        throw new Error(
          'La hoja de cálculo requiere inicio de sesión. Por favor, abre el botón "Compartir" de Google Sheets y selecciona "Cualquiera con el enlace: Lector".'
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
          setError(`Error al parsear el CSV: ${err.message}`);
          setLoading(false);
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con la hoja de Google Sheets.';
      setError(msg);
      setLoading(false);
    }
  }, [sheetTabName]);

  // Handle Sheet ID save
  const handleSaveSheetId = (newId: string) => {
    const trimmed = newId.trim();
    // If user pasted a full URL, extract the ID
    const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const finalId = match ? match[1] : trimmed;

    setSheetId(finalId);
    localStorage.setItem('orla_sheet_id', finalId);

    if (finalId) {
      setUseSampleData(false);
      fetchData(finalId, false);
    } else {
      setUseSampleData(true);
      fetchData('', true);
    }
    setIsConfigOpen(false);
  };

  useEffect(() => {
    if (sheetId) {
      fetchData(sheetId, false);
    }
  }, [fetchData, sheetId]);

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

          {/* Quick actions in header */}
          <div className="flex items-center gap-2">
            {useSampleData && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5" /> Modo Demostración
              </span>
            )}
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="Configurar conexión con Google Sheets"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden md:inline">Fuente de datos</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sheet Configuration Modal/Drawer */}
      {isConfigOpen && (
        <div className="bg-indigo-900/10 border-b border-indigo-200 dark:border-indigo-900/50 p-4 lg:p-6 transition-all">
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                Configurar Google Sheet
              </h3>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕ Cerrar
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Pega el ID o la URL completa de tu hoja de cálculo vinculada al Google Form.
              La hoja debe tener permiso de lectura para <em>"Cualquier persona con el enlace"</em>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ID o URL de la Hoja de Google:
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms o https://docs.google.com/spreadsheets/d/..."
                  defaultValue={sheetId}
                  id="sheetIdInput"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la pestaña (Sheet name):
                </label>
                <input
                  type="text"
                  value={sheetTabName}
                  onChange={e => setSheetTabName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    handleSaveSheetId('');
                  }}
                  className="text-xs text-slate-500 hover:text-indigo-600 underline"
                >
                  Restaurar datos de prueba (Demo)
                </button>

                <button
                  onClick={() => {
                    const input = document.getElementById('sheetIdInput') as HTMLInputElement;
                    if (input) handleSaveSheetId(input.value);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Guardar y Sincronizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">Error de sincronización con Google Sheets</p>
              <p>{error}</p>
              <p className="text-red-600 dark:text-red-400 font-medium pt-1">
                Tip: Verifica que en Google Sheets hayas pulsado <strong>Compartir &gt; Cualquier persona con el enlace &gt; Lector</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Demo Mode Banner (if sample data is used) */}
        {useSampleData && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Visualizando datos de prueba (Simulación de votos)</p>
                <p className="text-amber-700 dark:text-amber-400">
                  Para conectar tus respuestas reales de Google Forms, introduce el ID de tu hoja.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition shrink-0"
            >
              Conectar mi Google Sheet
            </button>
          </div>
        )}

        {/* KPIs Cards */}
        <MetricCards
          totalStudents={stats.totalStudents}
          totalVotesCast={stats.totalVotesCast}
          lastVote={stats.lastVoteTimestamp}
          loading={loading}
          onRefresh={() => fetchData(sheetId, useSampleData)}
          lastUpdated={lastUpdated}
        />

        {/* Navigation Tabs and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          {/* Main Navigation (Rankings vs Voters) */}
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'rankings'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Rankings de Departamentos
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
              Auditoría de Votantes ({stats.voters.length})
            </button>
          </div>

          {/* Controls for Cutoff & Department Filter */}
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
                  Corte para la Orla:
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
                    {stats.estadisticaRanking.length} profesores votados
                  </span>
                </div>

                {/* Podio Top 3 */}
                <Podium
                  topTeachers={stats.estadisticaRanking}
                  departmentName="Estadística"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico interactivo */}
                  <DepartmentChart
                    data={stats.estadisticaRanking}
                    topCutoff={topCutoff}
                    colorTheme="indigo"
                  />

                  {/* Tabla detallada */}
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
                    {stats.informaticaRanking.length} profesores votados
                  </span>
                </div>

                {/* Podio Top 3 */}
                <Podium
                  topTeachers={stats.informaticaRanking}
                  departmentName="Informática"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico interactivo */}
                  <DepartmentChart
                    data={stats.informaticaRanking}
                    topCutoff={topCutoff}
                    colorTheme="emerald"
                  />

                  {/* Tabla detallada */}
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
          <p>
            Plataforma de Votación y Escrutinio de Orla Universitaria &bull; Desarrollada con React, Vite &amp; Tailwind CSS
          </p>
          <div className="flex items-center gap-4">
            {sheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Abrir Google Sheet en pestaña nueva
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
