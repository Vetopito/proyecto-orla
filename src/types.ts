export interface TeacherVote {
  name: string;
  subjects: string;
  votes: number;
  percentage: number;
  badge?: string; // e.g. "Jubilado", "Cambio de Adscripción"
  rawText: string;
}

export type SelectionStatus = 'top3_direct' | 'top3_overall' | 'tied_cutoff' | 'not_selected';

export interface FinalCandidate extends TeacherVote {
  department: 'Estadística' | 'Informática';
  status: SelectionStatus;
  statusReason?: string;
  selectionOrder?: number;
}

export interface FinalElectionResult {
  top3Estadistica: FinalCandidate[];
  top3Informatica: FinalCandidate[];
  selectedOverall: FinalCandidate[];
  tiedCandidates: FinalCandidate[];
  notSelectedCandidates: FinalCandidate[];
  allCandidates: FinalCandidate[];
  cutoffVotes: number | null;
  totalSelectedCount: number;
  hasTieAtCutoff: boolean;
}

export interface VoterRecord {
  id: string;
  timestamp: string;
  studentName: string;
  estadisticaRaw: string;
  informaticaRaw: string;
  estadisticaTeachers: string[];
  informaticaTeachers: string[];
}

export interface DashboardStats {
  totalStudents: number;
  totalVotesCast: number;
  lastVoteTimestamp: string;
  estadisticaRanking: TeacherVote[];
  informaticaRanking: TeacherVote[];
  voters: VoterRecord[];
  finalElection: FinalElectionResult;
}
