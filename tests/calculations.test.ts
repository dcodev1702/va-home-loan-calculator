import { describe, expect, it } from "vitest";
import { calculateLoan, getFundingFeeRate } from "../src/lib/calculations";

describe("VA loan calculation", () => {
  it("uses the first-use VA funding fee for zero-down, non-exempt financing", () => {
    expect(getFundingFeeRate(false, false, 0)).toBe(0.0215);
  });

  it("calculates a standard $400,000 30-year payment at 6.5%", () => {
    const result = calculateLoan({
      purchasePrice: 400000,
      downPayment: 0,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 4500,
      insuranceAnnual: 1800,
      hoaMonthly: 0,
      fundingFeeExempt: true,
      priorVaUse: false,
      extraMonthly: 0,
      annualLumpSum: 0,
    });
    expect(result.principalAndInterest).toBeCloseTo(2528.27, 1);
    expect(result.totalMonthlyPayment).toBeCloseTo(3053.27, 1);
  });

  it("matches baseline when no extra principal is paid", () => {
    const result = calculateLoan({
      purchasePrice: 400000,
      downPayment: 0,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 0,
      insuranceAnnual: 0,
      hoaMonthly: 0,
      fundingFeeExempt: true,
      priorVaUse: false,
      extraMonthly: 0,
      annualLumpSum: 0,
    });
    expect(result.accelerated.totalInterest).toBeCloseTo(result.baseline.totalInterest, 2);
    expect(result.interestSaved).toBe(0);
  });

  it("saves interest and pays off earlier with extra monthly principal", () => {
    const result = calculateLoan({
      purchasePrice: 400000,
      downPayment: 0,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 0,
      insuranceAnnual: 0,
      hoaMonthly: 0,
      fundingFeeExempt: true,
      priorVaUse: false,
      extraMonthly: 250,
      annualLumpSum: 0,
    });
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.monthsSaved).toBeGreaterThan(0);
    expect(result.accelerated.months).toBeLessThan(result.baseline.months);
  });
});
