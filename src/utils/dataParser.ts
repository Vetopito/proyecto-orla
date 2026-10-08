import type { DashboardStats, TeacherVote, VoterRecord } from '../types';

/**
 * Splits a comma-separated string of teachers protecting comma inside parentheses.
 * e.g., "Maria Teresa González (ESTD, CEST, MEA), Juan Pérez (BD)" ->
 * ["Maria Teresa González (ESTD, CEST, MEA)", "Juan Pérez (BD)"]
 */
export function splitTeachers(input: string): string[] {
  if (!input || !input.trim()) return [];

  const results: string[] = [];
  let current = '';
  let inParentheses = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '(') {
      inParentheses++;
      current += char;
    } else if (char === ')') {
      if (inParentheses > 0) inParentheses--;
      current += char;
    } else if (char === ',' && inParentheses === 0) {
      if (current.trim()) {
        results.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    results.push(current.trim());
  }

  return results;
}

/**
 * Parse an individual teacher string:
 * e.g., "Juan Jesús Antonio Getino (AMAT 3) -- Jubilado (no está claro que pueda estar)"
 * -> name: "Juan Jesús Antonio Getino"
 * -> subjects: "AMAT 3"
 * -> badge: "Jubilado/a (Aviso)"
 */
export function parseTeacherInfo(rawTeacher: string): {
  name: string;
  subjects: string;
  badge?: string;
  cleanKey: string;
} {
  let cleaned = rawTeacher.trim();
  let badge: string | undefined;

  // Detect special notes
  if (/jubilad[oa]/i.test(cleaned)) {
    badge = 'Jubilado/a';
    cleaned = cleaned.replace(/--\s*jubilad[oa][^()]*(?:\([^)]*\))?/gi, '')
                     .replace(/\bjubilad[oa][^()]*(?:\([^)]*\))?/gi, '')
                     .trim();
  } else if (/cambio de adscripci[oó]n/i.test(cleaned)) {
    badge = 'Cambio de Adscripción';
    cleaned = cleaned.replace(/--\s*cambio de adscripci[oó]n[^()]*/gi, '')
                     .replace(/\bcambio de adscripci[oó]n[^()]*/gi, '')
                     .trim();
  }

  // Extract subjects/extra note between parentheses (last paren is usually subjects, or handle nick names like (Nacho))
  let subjects = '';
  // Match parenthetical expressions
  const parenMatches = [...cleaned.matchAll(/\(([^)]+)\)/g)];
  if (parenMatches.length > 0) {
    // If multiple parentheses, e.g. "Manuel de Castro (Bolu) (AOC)" or "Luis Ignacio (Nacho) Jiménez (FIA)"
    // Check if any parenthesis looks like subjects (all caps, or codes like AOC, AMAT 2, ESTD, etc.)
    const subjectMatch = parenMatches.find(m => {
      const content = m[1].trim();
      return /^[A-Z0-9\s,eóáíúy\.\-]+$/.test(content) && content.length > 1 && content !== 'Nacho' && content !== 'Bolu';
    }) || parenMatches[parenMatches.length - 1];

    subjects = subjectMatch[1].trim();
    // Remove the subject parenthesis from name
    cleaned = cleaned.replace(subjectMatch[0], '').trim();
  }

  // Clean trailing dashes or remaining punctuation and spaces
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/^[-–—\s]+|[-–—\s]+$/g, '').trim();

  return {
    name: cleaned || rawTeacher.trim(),
    subjects,
    badge,
    cleanKey: (cleaned || rawTeacher.trim()).toLowerCase(),
  };
}

/**
 * Process CSV rows and return Dashboard stats and rankings
 */
export function processVotesData(rows: string[][]): DashboardStats {
  if (!rows || rows.length <= 1) {
    return {
      totalStudents: 0,
      totalVotesCast: 0,
      lastVoteTimestamp: 'N/A',
      estadisticaRanking: [],
      informaticaRanking: [],
      voters: [],
    };
  }

  const header = rows[0].map(h => (h || '').toLowerCase().trim());
  
  let colTimestamp = 0;
  let colName = 1;
  let colEstadistica = 2;
  let colInformatica = 3;

  header.forEach((h, idx) => {
    if (h.includes('marca') || h.includes('timestamp') || h.includes('fecha') || h.includes('hora')) {
      colTimestamp = idx;
    } else if (h.includes('nombre') || h.includes('apellido') || h.includes('alumno') || h.includes('estudiante')) {
      colName = idx;
    } else if (h.includes('estadística') || h.includes('estadistica')) {
      colEstadistica = idx;
    } else if (h.includes('informática') || h.includes('informatica') || h.includes('computa')) {
      colInformatica = idx;
    }
  });

  const voters: VoterRecord[] = [];
  const estadisticaCounts: Map<string, { count: number; name: string; subjects: string; badge?: string; rawText: string }> = new Map();
  const informaticaCounts: Map<string, { count: number; name: string; subjects: string; badge?: string; rawText: string }> = new Map();

  let totalVotesCast = 0;
  let latestTimestamp = '';

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || row.every(cell => !cell || !cell.trim())) {
      continue;
    }

    const timestamp = row[colTimestamp] ? row[colTimestamp].trim() : '';
    const studentName = row[colName] ? row[colName].trim() : `Alumno ${i}`;
    const estadisticaRaw = row[colEstadistica] ? row[colEstadistica].trim() : '';
    const informaticaRaw = row[colInformatica] ? row[colInformatica].trim() : '';

    if (timestamp) {
      latestTimestamp = timestamp;
    }

    const statTeachers = splitTeachers(estadisticaRaw);
    const infTeachers = splitTeachers(informaticaRaw);

    voters.push({
      id: `vote-${i}`,
      timestamp,
      studentName,
      estadisticaRaw,
      informaticaRaw,
      estadisticaTeachers: statTeachers,
      informaticaTeachers: infTeachers,
    });

    // Count estadistica
    statTeachers.forEach(tStr => {
      const parsed = parseTeacherInfo(tStr);
      if (!parsed.cleanKey) return;
      totalVotesCast++;

      const existing = estadisticaCounts.get(parsed.cleanKey);
      if (existing) {
        existing.count++;
        if (!existing.subjects && parsed.subjects) existing.subjects = parsed.subjects;
        if (!existing.badge && parsed.badge) existing.badge = parsed.badge;
      } else {
        estadisticaCounts.set(parsed.cleanKey, {
          count: 1,
          name: parsed.name,
          subjects: parsed.subjects,
          badge: parsed.badge,
          rawText: tStr,
        });
      }
    });

    // Count informatica
    infTeachers.forEach(tStr => {
      const parsed = parseTeacherInfo(tStr);
      if (!parsed.cleanKey) return;
      totalVotesCast++;

      const existing = informaticaCounts.get(parsed.cleanKey);
      if (existing) {
        existing.count++;
        if (!existing.subjects && parsed.subjects) existing.subjects = parsed.subjects;
        if (!existing.badge && parsed.badge) existing.badge = parsed.badge;
      } else {
        informaticaCounts.set(parsed.cleanKey, {
          count: 1,
          name: parsed.name,
          subjects: parsed.subjects,
          badge: parsed.badge,
          rawText: tStr,
        });
      }
    });
  }

  const totalStudents = voters.length;

  const toRankingList = (map: Map<string, { count: number; name: string; subjects: string; badge?: string; rawText: string }>): TeacherVote[] => {
    return Array.from(map.values())
      .map(item => ({
        name: item.name,
        subjects: item.subjects,
        votes: item.count,
        percentage: totalStudents > 0 ? Number(((item.count / totalStudents) * 100).toFixed(1)) : 0,
        badge: item.badge,
        rawText: item.rawText,
      }))
      .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));
  };

  return {
    totalStudents,
    totalVotesCast,
    lastVoteTimestamp: latestTimestamp || 'N/A',
    estadisticaRanking: toRankingList(estadisticaCounts),
    informaticaRanking: toRankingList(informaticaCounts),
    voters,
  };
}
