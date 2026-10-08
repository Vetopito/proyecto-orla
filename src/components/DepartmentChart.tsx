import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TeacherVote } from '../types';

interface DepartmentChartProps {
  data: TeacherVote[];
  topCutoff: number;
  colorTheme?: 'indigo' | 'emerald';
}

export const DepartmentChart: React.FC<DepartmentChartProps> = ({
  data,
  topCutoff,
  colorTheme = 'indigo',
}) => {
  if (data.length === 0) return null;

  // Truncate names for chart label if very long
  const chartData = data.map((t, idx) => ({
    name: t.name,
    displayName: t.name.length > 20 ? t.name.slice(0, 18) + '...' : t.name,
    votes: t.votes,
    percentage: t.percentage,
    subjects: t.subjects,
    isTop: idx < topCutoff,
    rank: idx + 1,
  }));

  const primaryColor = colorTheme === 'indigo' ? '#4f46e5' : '#059669';
  const secondaryColor = colorTheme === 'indigo' ? '#c7d2fe' : '#a7f3d0';

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
            Distribución de Votos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Resaltados los {topCutoff} primeros puestos clasificados para la orla
          </p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis
              type="number"
              domain={[0, 'dataMax + 1']}
              tick={{ fill: '#64748b', fontSize: 12 }}
              allowDecimals={false}
            />
            <YAxis
              dataKey="displayName"
              type="category"
              width={140}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                      <p className="font-bold text-sm text-amber-300">
                        #{item.rank} {item.name}
                      </p>
                      {item.subjects && (
                        <p className="text-slate-300">Asignaturas: {item.subjects}</p>
                      )}
                      <p className="font-semibold">
                        Votos: <span className="text-white">{item.votes}</span> ({item.percentage}% de alumnos)
                      </p>
                      {item.isTop ? (
                        <span className="inline-block mt-1 text-[10px] text-emerald-300 font-medium">
                          ✓ Clasificado dentro del Top {topCutoff}
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-[10px] text-slate-400">
                          Fuera del corte actual
                        </span>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isTop ? primaryColor : secondaryColor}
                  className="transition-all hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
