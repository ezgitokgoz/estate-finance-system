export enum TransactionStatus {
  AGREEMENT = 'agreement',
  EARNEST_MONEY = 'earnest_money',
  TITLE_DEED = 'title_deed',
  COMPLETED = 'completed',
}

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  [TransactionStatus.AGREEMENT]: 'Agreement',
  [TransactionStatus.EARNEST_MONEY]: 'Earnest Money',
  [TransactionStatus.TITLE_DEED]: 'Title Deed',
  [TransactionStatus.COMPLETED]: 'Completed',
};

export const TRANSACTION_STATUS_ORDER = [
  TransactionStatus.AGREEMENT,
  TransactionStatus.EARNEST_MONEY,
  TransactionStatus.TITLE_DEED,
  TransactionStatus.COMPLETED,
];
