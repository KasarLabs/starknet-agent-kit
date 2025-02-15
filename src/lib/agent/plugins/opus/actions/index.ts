export interface TroveActionResult {
  status: 'success' | 'failure';
  trove_id?: string;
  transaction_hash?: string;
  error?: string;
  step?: string;
}

export interface BorrowActionResult {
  borrow_fee?: string;
  borrow_fee_pct?: string;
}

export interface DebtActionResult {
  amount?: string;
  before_debt?: string;
  after_debt?: string;
  before_ltv?: string;
  after_ltv?: string;
}

export interface CollateralActionResult {
  before_value?: string;
  after_value?: string;
  before_ltv?: string;
  after_ltv?: string;
}

export interface OpenTroveResult extends TroveActionResult, BorrowActionResult {}
export interface RepayTroveResult extends TroveActionResult, DebtActionResult {}
export interface BorrowTroveResult extends TroveActionResult, DebtActionResult, BorrowActionResult {}
export interface DepositTroveResult extends TroveActionResult, CollateralActionResult {}
