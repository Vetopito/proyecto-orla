export interface TeacherVote {
  name: string;
  subjects: string;
  votes: number;
  percentage: number;
  badge?: string; // e.g. "Jubilado", "Cambio de Adscripción"
  rawText: string;
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
}
