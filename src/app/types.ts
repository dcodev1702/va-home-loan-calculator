import type { LoanInputs } from "@/lib/calculations";

export type Income = { id: string; label: string; type: "monthly" | "annual" | "hourly"; amount: number; hours: number; taxFree: boolean };
export type Budget = { id: string; label: string; amount: number; onCreditReport: boolean };
export type Scenario = { id: number; name: string; payload: { loan: LoanInputs; incomes: Income[]; budgets: Budget[]; childcare: number; state: string; householdSize: number } };
