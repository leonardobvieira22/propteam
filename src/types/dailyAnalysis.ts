export interface DailyMetrics {
  date: string;
  dayOfWeek: string;
  totalOperations: number;
  winningOperations: number;
  losingOperations: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  netResult: number;
  maxSingleWin: number;
  maxSingleLoss: number;
  averageWin: number;
  averageLoss: number;
  riskLevel: 'low' | 'medium' | 'high';
  profitFactor: number;
}

export interface DailyViolation {
  code: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  value?: number;
  limit?: number;
}

export interface TradeOperation {
  ativo: string;
  abertura: string;
  fechamento: string;
  res_operacao: number;
  lado: string;
  [key: string]: unknown;
}

export interface DailyAnalysis extends DailyMetrics {
  violations: DailyViolation[];
  status: 'approved' | 'warning' | 'critical';
  operationsDetails: TradeOperation[];
  isWinningDay: boolean;
  exceedsConsistencyLimit: boolean;
  exceedsDailyLimit: boolean;
}

export interface DailyAnalysisFilters {
  status: 'all' | 'approved' | 'warning' | 'critical';
  sortBy: 'date' | 'netResult' | 'operations' | 'winRate';
  sortOrder: 'asc' | 'desc';
}

export interface DailyAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  operations: TradeOperation[];
  accountType: 'MASTER_FUNDED' | 'INSTANT_FUNDING';
  withdrawalThreshold: number;
}
