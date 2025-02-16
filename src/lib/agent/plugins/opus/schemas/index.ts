import { z } from "zod";
import { formatValue } from "../utils/format";

// Wadray types

export const valSchema = z.object({ val: z.bigint() }).transform(transformVal);

export function transformVal(val: { val: bigint }) {
  return val.val;
}
export const wadSchema = valSchema.transform((val) => {
  return {
    /** @type Wad */
    value: val,
    formatted: formatValue(val, "wad"),
  };
});
export type Wad = z.infer<typeof wadSchema>;

export const raySchema = valSchema.transform((val) => {
  return {
    /** @type Ray */
    value: val,
    formatted: formatValue(val, "ray"),
  };
});
export type Ray = z.infer<typeof raySchema>;


// Custom types

export const assetBalanceInputSchema = z.object({
  symbol: z.string().describe("Symbol of asset"),
  amount: z.string().describe("Amount of asset"),
});
export const assetBalancesInputSchema = z.array(assetBalanceInputSchema);

export type AssetBalanceInput = z.infer<typeof assetBalanceInputSchema>;
export type AssetBalancesInput = z.infer<typeof assetBalancesInputSchema>;

export const assetBalanceSchema = z.object({
  address: z.string().describe("Address of asset"),
  amount: z.bigint().describe("Amount of asset"),
});
export const assetBalancesSchema = z.array(assetBalanceSchema);

export type AssetBalance = z.infer<typeof assetBalanceSchema>;
export type AssetBalances = z.infer<typeof assetBalancesSchema>;

export const healthSchema = z.object({
  debt: wadSchema.describe("Debt of trove"),
  value: wadSchema.describe("Value of trove"),
  ltv: raySchema.describe("LTV of trove"),
  threshold: raySchema.describe("Threshold of trove"),
});
export type Health = z.infer<typeof healthSchema>;

// Transaction schemas

export const getUserTrovesSchema = z.object({
  user: z.string().describe("Address of user"),
});
export type GetUserTrovesParams = z.infer<typeof getUserTrovesSchema>;

export const openTroveSchema = z.object({
  collaterals: assetBalancesInputSchema.describe("Collateral assets to deposit"),
  borrowAmount: z.string().describe("Amount of CASH to borrow"),
  maxBorrowFeePct: z.string().describe("Maximum borrow fee as a % of borrow amount"),
});

export type OpenTroveParams = z.infer<typeof openTroveSchema>;

export const collateralActionSchema = z.object({
  troveId: z.number().describe("Trove ID"),
  collateral: assetBalanceInputSchema.describe("Collateral to deposit"),
});

export type DepositTroveParams = z.infer<typeof collateralActionSchema>;
export type WithdrawTroveParams = z.infer<typeof collateralActionSchema>;

export const borrowTroveSchema = z.object({
  troveId: z.number().describe("Trove ID"),
  amount: z.string().describe("Amount of CASH to repay"),
  maxBorrowFeePct: z.string().describe("Maximum borrow fee as a % of borrow amount"),
});

export type BorrowTroveParams = z.infer<typeof borrowTroveSchema>;

export const repayTroveSchema = z.object({
  troveId: z.number().describe("Trove ID"),
  amount: z.string().describe("Amount to repay"),
});

export type RepayTroveParams = z.infer<typeof repayTroveSchema>;

// Event schemas

export const troveOpenedEventSchema = z.object({
  user: z.bigint(),
  trove_id: z.bigint(),
});

export const forgeFeePaidEventSchema = z.object({
  trove_id: z.bigint(),
  fee: wadSchema,
  fee_pct: wadSchema,
});
