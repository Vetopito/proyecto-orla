import React, { useState, useMemo } from 'react';
import { Search, UserCheck, AlertCircle } from 'lucide-react';
import type { VoterRecord } from '../types';

interface VotersAuditProps {
  voters: VoterRecord[];
}

export const VotersAudit: React.FC<VotersAuditProps> = ({ voters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDuplicatesOnly, setFilterDuplicatesOnly] = useState(false);

  // Group by name (normalized lowercase) to find duplicates
  const nameCounts = useMemo(() => {
    const counts = new Map<string, number>();
    voters.forEach(v => {
      const key = v.studentName.toLowerCase().trim();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [voters]);

  const duplicateNamesCount = useMemo(() => {
    let dups = 0;
    nameCounts.forEach(c => {
      if (c > 1) dups++;
    });
    return dups;
  }, [nameCounts]);

  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const nameMatch = v.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const dateMatch = v.timestamp.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || dateMatch;

      if (!matchesSearch) return false;

      if (filterDuplicatesOnly) {
        const count = nameCounts.get(v.studentName.toLowerCase().trim()) || 0;
        return count > 1;
      }

      return true;
    });
  }, [voters, searchTerm, filterDuplicatesOnly, nameCounts]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
      {/* Search and Duplicate Filter header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Auditoría y Verificación de Votantes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comprueba el registro de alumnos y detecta posibles votos duplicados.
            </p>
          </div>

          {duplicateNamesCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{duplicateNamesCount} nombre(s) con envíos múltiples</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre de alumno o fecha..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-slate-100 dark:bg-slate-750 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={filterDuplicatesOnly}
              onChange={e => setFilterDuplicatesOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Mostrar solo nombres duplicados
          </label>
        </div>
      </div>

      {/* Table of voters */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Alumno (Nombre y Apellidos)</th>
              <th className="py-3 px-4">Fecha / Marca Temporal</th>
              <th className="py-3 px-4">Votos Estadística</th>
              <th className="py-3 px-4">Votos Informática</th>
              <th className="py-3 px-4 text-center">Auditoría</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredVoters.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                  No se encontraron registros que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredVoters.map((voter, index) => {
                const count = nameCounts.get(voter.studentName.toLowerCase().trim()) || 0;
                const isDuplicate = count > 1;

                return (
                  <tr
                    key={voter.id}
                    className={`transition hover:bg-slate-50 dark:hover:bg-slate-750/50 ${
                      isDuplicate
                        ? 'bg-amber-50/40 dark:bg-amber-950/20'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center text-xs text-slate-400">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {voter.studentName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {voter.timestamp || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate" title={voter.estadisticaRaw}>
                      {voter.estadisticaTeachers.length > 0 ? (
                        <span>{voter.estadisticaTeachers.join(', ')}</span>
                      ) : (
                        <span className="text-slate-400 italic">Sin votos</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate" title={voter.informaticaRaw}>
                      {voter.informaticaTeachers.length > 0 ? (
                        <span>{voter.informaticaTeachers.join(', ')}</span>
                      ) : (
                        <span className="text-slate-400 italic">Sin votos</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isDuplicate ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Repetido ({count})
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          Único
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
