export interface BorrowActionResult {
  borrow_fee?: string;
  borrow_fee_pct?: string;
}

export interface OpenTroveResult extends BorrowActionResult {
  status: 'success' | 'failure';
  trove_id?: string;
  transaction_hash?: string;
  error?: string;
  step?: string;
}

export interface DebtActionResult {
  status: 'success' | 'failure';
  amount?: string;
  trove_id?: string;
  before_debt?: string;
  after_debt?: string;
  before_ltv?: string;
  after_ltv?: string;
  transaction_hash?: string;
  error?: string;
  step?: string;
}

export interface RepayTroveResult extends DebtActionResult {}

export interface BorrowTroveResult extends DebtActionResult, BorrowActionResult {}