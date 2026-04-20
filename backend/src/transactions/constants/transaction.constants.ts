export enum TransactionStatus {
  AGREEMENT = 'agreement',
  EARNEST_MONEY = 'earnest_money',
  TITLE_DEED = 'title_deed',
  COMPLETED = 'completed',
}

/**
 * CommissionPolicy — Single source of truth for all commission ratios.
 *
 * Company Policy (as per Case Document - "Company Commission Policy"):
 *   - Total service fee is split equally: 50% Agency / 50% Agents.
 *   - If there are two agents (listing + selling), the agent half is split 50/50.
 *   - If a single agent handles both sides, they receive the full agent half (50%).
 *
 * Changing any policy only requires updating AGENCY_SHARE here.
 * All other ratios are derived automatically.
 */
export const CommissionPolicy = {
  /** Agency keeps 50% of total service fee */
  AGENCY_SHARE: 0.5,

  /** Agents collectively receive the remaining 50% */
  get AGENT_SHARE() { return 1 - this.AGENCY_SHARE; },

  /** When two agents split the agent portion equally — fraction of TOTAL service fee per agent */
  get SPLIT_RATIO() { return this.AGENT_SHARE / 2; },

  /** Description shown in reports and logs */
  describe(isSingleAgent: boolean): string {
    const agencyPct = Math.round(this.AGENCY_SHARE * 100);
    const agentPct = Math.round(this.AGENT_SHARE * 100);
    const splitPct = Math.round(this.SPLIT_RATIO * 100);
    return isSingleAgent
      ? `Agency ${agencyPct}% / Agent (Solo) ${agentPct}%`
      : `Agency ${agencyPct}% / Listing Agent ${splitPct}% / Selling Agent ${splitPct}%`;
  },
} as const;

/** @deprecated Use CommissionPolicy instead */
export const FINANCIAL_RATES = {
  AGENCY_SHARE_PERCENT: CommissionPolicy.AGENCY_SHARE,
  AGENT_TOTAL_SHARE_PERCENT: CommissionPolicy.AGENT_SHARE,
  SPLIT_AGENT_SHARE_PERCENT: 0.5, // split ratio out of agent portion
};

export const TRANSACTION_STATUS_ORDER = [
  TransactionStatus.AGREEMENT,
  TransactionStatus.EARNEST_MONEY,
  TransactionStatus.TITLE_DEED,
  TransactionStatus.COMPLETED,
];
