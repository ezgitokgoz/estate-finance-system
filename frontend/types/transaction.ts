import { TransactionStatus } from '../utils/constants';

export interface AppliedPolicy {
  /** Agency share rate active at creation time, e.g. 0.5 */
  agencyShare: number;
  /** Agent collective share rate, e.g. 0.5 */
  agentShare: number;
  /** Per-agent split ratio when two agents share, e.g. 0.25 */
  splitRatio: number;
}

export interface FinancialBreakdown {
  totalServiceFee: number;
  agencyEarned: number;
  listingAgentEarned: number;
  sellingAgentEarned: number;
  /** Total earned by agents (same as listingAgentEarned when isSingleAgent) */
  totalAgentEarned?: number;
  /** True when listing and selling agent are the same person */
  isSingleAgent?: boolean;
  calculationLog: string;
  /** Immutable snapshot of CommissionPolicy rates at creation time */
  appliedPolicy?: AppliedPolicy;
}

export interface StageDates {
  agreement?: string;
  earnest_money?: string;
  title_deed?: string;
  completed?: string;
}

export interface Transaction {
  _id: string;
  propertyAddress: string;
  totalServiceFee: number;
  status: TransactionStatus | string;
  listingAgent: string;
  sellingAgent: string;
  financialBreakdown: FinancialBreakdown;
  stageDates?: StageDates;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  propertyAddress: string;
  totalServiceFee: number;
  listingAgent: string;
  sellingAgent: string;
}
