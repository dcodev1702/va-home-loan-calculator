export type LoanInputs = {
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  termYears: number;
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  fundingFeeExempt: boolean;
  priorVaUse: boolean;
  extraMonthly: number;
  annualLumpSum: number;
};

export type AmortizationMonth = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPrincipal: number;
  balance: number;
};

export type Schedule = {
  months: number;
  totalInterest: number;
  totalPaid: number;
  entries: AmortizationMonth[];
};

export type LoanResult = {
  baseLoan: number;
  fundingFeeRate: number;
  fundingFee: number;
  financedLoan: number;
  principalAndInterest: number;
  escrowAndHoa: number;
  totalMonthlyPayment: number;
  baseline: Schedule;
  accelerated: Schedule;
  interestSaved: number;
  monthsSaved: number;
  annualSavings: { year: number; baselineInterest: number; acceleratedInterest: number; saved: number; baselineBalance: number; acceleratedBalance: number }[];
};

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function getFundingFeeRate(exempt: boolean, priorUse: boolean, downPayment: number, purchasePrice = 1): number {
  if (exempt) return 0;
  const ratio = purchasePrice > 0 ? downPayment / purchasePrice : 0;
  if (ratio >= 0.1) return 0.0125;
  if (ratio >= 0.05) return 0.015;
  return priorUse ? 0.033 : 0.0215;
}

export function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  const rate = annualRate / 100 / 12;
  if (rate === 0) return principal / months;
  return principal * (rate * (1 + rate) ** months) / ((1 + rate) ** months - 1);
}

export function buildSchedule(principal: number, annualRate: number, months: number, extraMonthly = 0, annualLumpSum = 0): Schedule {
  const rate = annualRate / 100 / 12;
  const scheduledPayment = monthlyPayment(principal, annualRate, months);
  const entries: AmortizationMonth[] = [];
  let balance = money(principal);
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (balance > 0.005 && month < months + 600) {
    month += 1;
    const interest = money(balance * rate);
    const payment = Math.min(scheduledPayment, balance + interest);
    const principalPaid = money(payment - interest);
    let extra = Math.min(Math.max(0, extraMonthly), Math.max(0, balance - principalPaid));
    if (annualLumpSum > 0 && month % 12 === 0) {
      extra = Math.min(extra + annualLumpSum, Math.max(0, balance - principalPaid));
    }
    balance = money(Math.max(0, balance - principalPaid - extra));
    totalInterest = money(totalInterest + interest);
    totalPaid = money(totalPaid + payment + extra);
    entries.push({ month, payment: money(payment), principal: principalPaid, interest, extraPrincipal: money(extra), balance });
  }
  return { months: month, totalInterest, totalPaid, entries };
}

export function quarterlyBalanceTimeline(entries: Pick<AmortizationMonth, "month" | "balance">[], startYear: number) {
  return entries.filter((entry) => entry.month % 3 === 0).map((entry) => {
    const quarterIndex = entry.month / 3 - 1;
    const year = startYear + Math.floor(quarterIndex / 4);
    const quarter = quarterIndex % 4 + 1;
    return { month: entry.month, label: `Q${quarter} ${year}`, axisLabel: quarter === 1 ? String(year) : `Q${quarter}`, balance: entry.balance };
  });
}

export function calculateLoan(input: LoanInputs): LoanResult {
  const baseLoan = money(Math.max(0, input.purchasePrice - input.downPayment));
  const fundingFeeRate = getFundingFeeRate(input.fundingFeeExempt, input.priorVaUse, input.downPayment, input.purchasePrice);
  const fundingFee = money(baseLoan * fundingFeeRate);
  const financedLoan = money(baseLoan + fundingFee);
  const termMonths = Math.max(0, Math.round(input.termYears * 12));
  const principalAndInterest = money(monthlyPayment(financedLoan, input.interestRate, termMonths));
  const escrowAndHoa = money(input.propertyTaxAnnual / 12 + input.insuranceAnnual / 12 + input.hoaMonthly);
  const baseline = buildSchedule(financedLoan, input.interestRate, termMonths);
  const accelerated = buildSchedule(financedLoan, input.interestRate, termMonths, input.extraMonthly, input.annualLumpSum);
  const maxMonths = Math.max(baseline.months, accelerated.months);
  const annualSavings = Array.from({ length: Math.ceil(maxMonths / 12) }, (_, index) => {
    const start = index * 12;
    const baselineYear = baseline.entries.slice(start, start + 12);
    const acceleratedYear = accelerated.entries.slice(start, start + 12);
    const baselineInterest = money(baselineYear.reduce((sum, row) => sum + row.interest, 0));
    const acceleratedInterest = money(acceleratedYear.reduce((sum, row) => sum + row.interest, 0));
    return {
      year: index + 1,
      baselineInterest,
      acceleratedInterest,
      saved: money(baselineInterest - acceleratedInterest),
      baselineBalance: baselineYear.at(-1)?.balance ?? 0,
      acceleratedBalance: acceleratedYear.at(-1)?.balance ?? 0,
    };
  });
  return {
    baseLoan,
    fundingFeeRate,
    fundingFee,
    financedLoan,
    principalAndInterest,
    escrowAndHoa,
    totalMonthlyPayment: money(principalAndInterest + escrowAndHoa),
    baseline,
    accelerated,
    interestSaved: money(baseline.totalInterest - accelerated.totalInterest),
    monthsSaved: baseline.months - accelerated.months,
    annualSavings,
  };
}
