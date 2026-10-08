import type {
  DashboardStats,
  TeacherVote,
  VoterRecord,
  FinalCandidate,
  FinalElectionResult,
} from '../types';

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
 * -> badge: "Jubilado/a"
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
    cleaned = cleaned
      .replace(/--\s*jubilad[oa][^()]*(?:\([^)]*\))?/gi, '')
      .replace(/\bjubilad[oa][^()]*(?:\([^)]*\))?/gi, '')
      .trim();
  } else if (/cambio de adscripci[oó]n/i.test(cleaned)) {
    badge = 'Cambio de Adscripción';
    cleaned = cleaned
      .replace(/--\s*cambio de adscripci[oó]n[^()]*/gi, '')
      .replace(/\bcambio de adscripci[oó]n[^()]*/gi, '')
      .trim();
  }

  let subjects = '';
  const parenMatches = [...cleaned.matchAll(/\(([^)]+)\)/g)];
  if (parenMatches.length > 0) {
    const subjectMatch =
      parenMatches.find((m) => {
        const content = m[1].trim();
        return (
          /^[A-Z0-9\s,eóáíúy\.\-]+$/.test(content) &&
          content.length > 1 &&
          content !== 'Nacho' &&
          content !== 'Bolu'
        );
      }) || parenMatches[parenMatches.length - 1];

    subjects = subjectMatch[1].trim();
    cleaned = cleaned.replace(subjectMatch[0], '').trim();
  }

  cleaned = cleaned.replace(/\s+/g, ' ').replace(/^[-–—\s]+|[-–—\s]+$/g, '').trim();

  return {
    name: cleaned || rawTeacher.trim(),
    subjects,
    badge,
    cleanKey: (cleaned || rawTeacher.trim()).toLowerCase(),
  };
}

/**
 * Computes the final election selection:
 * - Top 3 from Estadística (with ties at 3rd place highlighted)
 * - Top 3 from Informática (with ties at 3rd place highlighted)
 * - Next 6 candidates overall by votes among the remaining pool
 * - If there is a tie for the 6th overall spot (which defines entry into the 9 spots),
 *   all candidates tied at that exact vote count are marked with a distinct status.
 */
export function computeFinalElection(
  statRanking: TeacherVote[],
  infRanking: TeacherVote[]
): FinalElectionResult {
  // 1. Identify Top 3 of Estadística (handling any tie at 3rd spot)
  const statSorted = [...statRanking];
  const infSorted = [...infRanking];

  const top3StatCandidates: FinalCandidate[] = [];
  const top3StatKeys = new Set<string>();

  if (statSorted.length > 0) {
    // Determine cutoff votes for top 3 in Estadística
    const statCutoffIndex = Math.min(2, statSorted.length - 1);
    const statThirdVotes = statSorted[statCutoffIndex].votes;

    // Check if there is a tie on the 3rd spot border
    const candidatesAtOrAbove = statSorted.filter(t => t.votes >= statThirdVotes);
    const isTieAtStat3rd = candidatesAtOrAbove.length > 3 && statSorted[2].votes === statSorted[3]?.votes;

    statSorted.forEach((t, idx) => {
      if (t.votes > statThirdVotes || (t.votes === statThirdVotes && !isTieAtStat3rd && idx < 3)) {
        top3StatCandidates.push({
          ...t,
          department: 'Estadística',
          status: 'top3_direct',
          statusReason: `Top 3 directo de Estadística (#${idx + 1})`,
        });
        top3StatKeys.add(t.name.toLowerCase());
      } else if (t.votes === statThirdVotes && isTieAtStat3rd) {
        top3StatCandidates.push({
          ...t,
          department: 'Estadística',
          status: 'tied_cutoff',
          statusReason: `Empatado en corte del Top 3 de Estadística (${t.votes} votos)`,
        });
        top3StatKeys.add(t.name.toLowerCase());
      }
    });
  }

  // 2. Identify Top 3 of Informática (handling any tie at 3rd spot)
  const top3InfCandidates: FinalCandidate[] = [];
  const top3InfKeys = new Set<string>();

  if (infSorted.length > 0) {
    const infCutoffIndex = Math.min(2, infSorted.length - 1);
    const infThirdVotes = infSorted[infCutoffIndex].votes;
    const candidatesAtOrAbove = infSorted.filter(t => t.votes >= infThirdVotes);
    const isTieAtInf3rd = candidatesAtOrAbove.length > 3 && infSorted[2].votes === infSorted[3]?.votes;

    infSorted.forEach((t, idx) => {
      if (t.votes > infThirdVotes || (t.votes === infThirdVotes && !isTieAtInf3rd && idx < 3)) {
        top3InfCandidates.push({
          ...t,
          department: 'Informática',
          status: 'top3_direct',
          statusReason: `Top 3 directo de Informática (#${idx + 1})`,
        });
        top3InfKeys.add(t.name.toLowerCase());
      } else if (t.votes === infThirdVotes && isTieAtInf3rd) {
        top3InfCandidates.push({
          ...t,
          department: 'Informática',
          status: 'tied_cutoff',
          statusReason: `Empatado en corte del Top 3 de Informática (${t.votes} votos)`,
        });
        top3InfKeys.add(t.name.toLowerCase());
      }
    });
  }

  // 3. Form remaining pool of candidates for the next 3 overall spots (total 9 slots: 3 + 3 + 3)
  const remainingPool: { teacher: TeacherVote; department: 'Estadística' | 'Informática' }[] = [];

  statSorted.forEach(t => {
    if (!top3StatKeys.has(t.name.toLowerCase())) {
      remainingPool.push({ teacher: t, department: 'Estadística' });
    }
  });

  infSorted.forEach(t => {
    if (!top3InfKeys.has(t.name.toLowerCase())) {
      remainingPool.push({ teacher: t, department: 'Informática' });
    }
  });

  // Sort remaining pool strictly descending by votes, then alphabetically
  remainingPool.sort((a, b) => b.teacher.votes - a.teacher.votes || a.teacher.name.localeCompare(b.teacher.name));

  const selectedOverall: FinalCandidate[] = [];
  const tiedCandidates: FinalCandidate[] = [];
  const notSelectedCandidates: FinalCandidate[] = [];

  let cutoffVotes: number | null = null;
  let hasTieAtCutoff = false;

  const targetNextSlots = 3; // 3 additional spots to reach 9 total

  if (remainingPool.length <= targetNextSlots) {
    // Everyone in remaining pool gets selected (no cutoff needed)
    remainingPool.forEach((item, idx) => {
      selectedOverall.push({
        ...item.teacher,
        department: item.department,
        status: 'top3_overall',
        statusReason: `Entre los 3 mejores globales (#${idx + 1})`,
      });
    });
  } else {
    // There are more candidates than 3 slots. Look at candidate in 3rd slot (index 2)
    cutoffVotes = remainingPool[targetNextSlots - 1].teacher.votes;
    const candidatesWithCutoffVotes = remainingPool.filter(item => item.teacher.votes === cutoffVotes);
    const candidatesStrictlyAbove = remainingPool.filter(item => item.teacher.votes > (cutoffVotes || 0));

    if (candidatesStrictlyAbove.length + candidatesWithCutoffVotes.length > targetNextSlots && candidatesStrictlyAbove.length < targetNextSlots) {
      // There is an exact tie spanning the 3rd spot boundary!
      hasTieAtCutoff = true;

      // Add strictly above candidates as fully selected
      candidatesStrictlyAbove.forEach((item, idx) => {
        selectedOverall.push({
          ...item.teacher,
          department: item.department,
          status: 'top3_overall',
          statusReason: `Entre los 3 mejores globales (#${idx + 1})`,
        });
      });

      // Mark ALL candidates with cutoffVotes as tied_cutoff
      candidatesWithCutoffVotes.forEach(item => {
        const cand: FinalCandidate = {
          ...item.teacher,
          department: item.department,
          status: 'tied_cutoff',
          statusReason: `Empate en el corte de las 9 plazas (${cutoffVotes} votos)`,
        };
        tiedCandidates.push(cand);
      });

      // Mark the rest as not_selected
      remainingPool
        .filter(item => item.teacher.votes < (cutoffVotes || 0))
        .forEach(item => {
          notSelectedCandidates.push({
            ...item.teacher,
            department: item.department,
            status: 'not_selected',
            statusReason: `Fuera del corte (${item.teacher.votes} votos)`,
          });
        });
    } else {
      // Clean cutoff without tie crossing the 3rd boundary
      remainingPool.forEach((item, idx) => {
        if (idx < targetNextSlots) {
          selectedOverall.push({
            ...item.teacher,
            department: item.department,
            status: 'top3_overall',
            statusReason: `Entre los 3 mejores globales (#${idx + 1})`,
          });
        } else {
          notSelectedCandidates.push({
            ...item.teacher,
            department: item.department,
            status: 'not_selected',
            statusReason: `Fuera del corte (${item.teacher.votes} votos)`,
          });
        }
      });
    }
  }

  // Combine list in ranked order
  const allCandidates: FinalCandidate[] = [
    ...top3StatCandidates,
    ...top3InfCandidates,
    ...selectedOverall,
    ...tiedCandidates,
    ...notSelectedCandidates,
  ];

  return {
    top3Estadistica: top3StatCandidates,
    top3Informatica: top3InfCandidates,
    selectedOverall,
    tiedCandidates,
    notSelectedCandidates,
    allCandidates,
    cutoffVotes,
    totalSelectedCount: top3StatCandidates.length + top3InfCandidates.length + selectedOverall.length,
    hasTieAtCutoff,
  };
}

/**
 * Process CSV rows and return Dashboard stats and rankings
 */
export function processVotesData(rows: string[][]): DashboardStats {
  const emptyElection: FinalElectionResult = {
    top3Estadistica: [],
    top3Informatica: [],
    selectedOverall: [],
    tiedCandidates: [],
    notSelectedCandidates: [],
    allCandidates: [],
    cutoffVotes: null,
    totalSelectedCount: 0,
    hasTieAtCutoff: false,
  };

  if (!rows || rows.length <= 1) {
    return {
      totalStudents: 0,
      totalVotesCast: 0,
      lastVoteTimestamp: 'N/A',
      estadisticaRanking: [],
      informaticaRanking: [],
      voters: [],
      finalElection: emptyElection,
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

  const estadisticaRanking = toRankingList(estadisticaCounts);
  const informaticaRanking = toRankingList(informaticaCounts);

  const finalElection = computeFinalElection(estadisticaRanking, informaticaRanking);

  return {
    totalStudents,
    totalVotesCast,
    lastVoteTimestamp: latestTimestamp || 'N/A',
    estadisticaRanking,
    informaticaRanking,
    voters,
    finalElection,
  };
}
