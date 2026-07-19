import { describe, expect, it } from "vitest";
import { calculateLoan, dtiStatus, getFundingFeeRate, payoffLadder, semiannualBalanceTimeline } from "../src/lib/calculations";

describe("VA loan calculation", () => {
  it("uses the first-use VA funding fee for zero-down, non-exempt financing", () => {
    expect(getFundingFeeRate(false, false, 0)).toBe(0.0215);
  });

  it("applies the full VA funding-fee rate chart (effective April 7, 2023)", () => {
    const price = 400000;
    // Exempt always waives the fee regardless of down payment or prior use.
    expect(getFundingFeeRate(true, false, 0, price)).toBe(0);
    expect(getFundingFeeRate(true, true, 80000, price)).toBe(0);
    // First use: <5% -> 2.15%, >=5% -> 1.5%, >=10% -> 1.25%.
    expect(getFundingFeeRate(false, false, 0, price)).toBe(0.0215);
    expect(getFundingFeeRate(false, false, 19999, price)).toBe(0.0215); // 4.99% down
    expect(getFundingFeeRate(false, false, 20000, price)).toBe(0.015); // exactly 5%
    expect(getFundingFeeRate(false, false, 39999, price)).toBe(0.015); // 9.99% down
    expect(getFundingFeeRate(false, false, 40000, price)).toBe(0.0125); // exactly 10%
    // Subsequent use: only the <5% tier differs (3.3%); >=5% matches first use.
    expect(getFundingFeeRate(false, true, 0, price)).toBe(0.033);
    expect(getFundingFeeRate(false, true, 19999, price)).toBe(0.033); // 4.99% down
    expect(getFundingFeeRate(false, true, 20000, price)).toBe(0.015); // exactly 5%
    expect(getFundingFeeRate(false, true, 40000, price)).toBe(0.0125); // exactly 10%
    // Guard against divide-by-zero when purchase price is 0.
    expect(getFundingFeeRate(false, false, 0, 0)).toBe(0.0215);
  });

  it("finances the funding fee into the loan and payment when not exempt", () => {
    const base = {
      purchasePrice: 400000,
      downPayment: 0,
      interestRate: 6.5,
      termYears: 30,
      propertyTaxAnnual: 0,
      insuranceAnnual: 0,
      hoaMonthly: 0,
      priorVaUse: false,
      extraMonthly: 0,
      annualLumpSum: 0,
    };
    const exempt = calculateLoan({ ...base, fundingFeeExempt: true });
    const financed = calculateLoan({ ...base, fundingFeeExempt: false });
    expect(exempt.fundingFee).toBe(0);
    expect(exempt.financedLoan).toBe(400000);
    // First-use zero-down fee is 2.15% of the $400k base loan = $8,600, financed on top.
    expect(financed.fundingFeeRate).toBe(0.0215);
    expect(financed.fundingFee).toBeCloseTo(8600, 2);
    expect(financed.financedLoan).toBeCloseTo(408600, 2);
    expect(financed.principalAndInterest).toBeGreaterThan(exempt.principalAndInterest);
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

  it("classifies DTI ratios with the requested green, yellow, and red thresholds", () => {
    expect(dtiStatus(41.0)).toBe("good");
    expect(dtiStatus(41.1)).toBe("warning");
    expect(dtiStatus(46.0)).toBe("warning");
    expect(dtiStatus(46.1)).toBe("bad");
  });

  it("builds a payoff ladder anchored to the zero-extra baseline", () => {
    const P = 500000, rate = 5.5, months = 360;
    const ladder = payoffLadder(P, rate, months, [0, 250, 2500]);
    expect(ladder.map((r) => r.extraMonthly)).toEqual([0, 250, 2500]);
    // Baseline rung: no savings, ~30-year payoff.
    expect(ladder[0].interestSaved).toBe(0);
    expect(ladder[0].monthsSaved).toBe(0);
    expect(ladder[0].months).toBe(360);
    // Each higher tier saves strictly more interest and pays off sooner.
    expect(ladder[1].interestSaved).toBeGreaterThan(0);
    expect(ladder[2].interestSaved).toBeGreaterThan(ladder[1].interestSaved);
    expect(ladder[2].months).toBeLessThan(ladder[1].months);
    // +$2,500/mo on $500k @ 5.5% -> ~123 months and ~$367k saved (matches the app).
    expect(ladder[2].months).toBe(123);
    expect(ladder[2].interestSaved).toBeCloseTo(367289, -2);
    // A ladder rung matches a direct calculateLoan run at the same extra.
    const direct = calculateLoan({ purchasePrice: P, downPayment: 0, interestRate: rate, termYears: 30, propertyTaxAnnual: 0, insuranceAnnual: 0, hoaMonthly: 0, fundingFeeExempt: true, priorVaUse: false, extraMonthly: 2500, annualLumpSum: 0 });
    expect(ladder[2].interestSaved).toBeCloseTo(direct.interestSaved, 2);
  });

  it("creates semiannual balance points with one calendar-year label per year", () => {
    const points = semiannualBalanceTimeline([{ month: 1, balance: 98 }, { month: 6, balance: 90 }, { month: 12, balance: 80 }], 2026, 100);
    expect(points).toEqual([
      { month: 0, label: "Start 2026", axisLabel: "2026", isYearStart: true, balance: 100 },
      { month: 6, label: "Mid 2026", axisLabel: "", isYearStart: false, balance: 90 },
      { month: 12, label: "Start 2027", axisLabel: "2027", isYearStart: true, balance: 80 },
    ]);
  });
});
