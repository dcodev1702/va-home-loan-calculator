import { semiannualBalanceTimeline, type LadderRung } from "@/lib/calculations";
import styles from "../loan-calculator.module.css";
import { usd } from "../formatting";

// Value-based tier colors: each extra-payment amount owns a fixed hue so the
// palette stays stable as tiers or the user's current plan change.
// 1500 = pink, 2500 = neon green, per product intent.
const TIER_COLORS: Record<number, string> = {
  0: "#fbbf24",     // baseline — amber
  1000: "#42d9ff",  // cyan
  1500: "#fb7185",  // pink
  2000: "#a78bfa",  // purple
  2500: "#38f5ac",  // neon green
};
// Fallback for any dynamic tier (e.g. the user's current extra) not in the map.
const FALLBACK_COLOR = "#94a3b8";
const tierColor = (extra: number) => TIER_COLORS[extra] ?? FALLBACK_COLOR;
const yearsLabel = (months: number) => `${Math.floor(months / 12)}y ${months % 12}m`;

export default function SweetSpotChart({ ladder, initialBalance, currentExtra, baseMonthly }: { ladder: LadderRung[]; initialBalance: number; currentExtra: number; baseMonthly: number }) {
  const baseMonths = ladder[0]?.months ?? 1;
  const max = Math.max(initialBalance, 1);
  const span = Math.max(baseMonths, 1);
  const line = (rung: LadderRung) => {
    const points = semiannualBalanceTimeline(rung.entries, 2026, initialBalance);
    return points.map((point) => `${(point.month / span) * 100},${92 - (point.balance / max) * 78}`).join(" ");
  };
  // Year axis from the baseline (longest) timeline, positioned by month so ticks line up with the time-scaled lines.
  const axisPoints = semiannualBalanceTimeline(ladder[0]?.entries ?? [], 2026, initialBalance);
  const label = (extra: number) => (extra <= 0 ? "Baseline" : `+${usd.format(extra)}/mo`);
  return (
    <div className={styles.sweetSpot}>
      <div className={styles.chart}>
        <div className={styles.chartLegend}>
          {ladder.map((rung) => (
            <span key={rung.extraMonthly}>
              <i style={{ background: tierColor(rung.extraMonthly) }} />
              {label(rung.extraMonthly)}
              {rung.extraMonthly === currentExtra ? " ★" : ""}
            </span>
          ))}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Remaining balance across extra-payment tiers">
          <line x1="0" y1="92" x2="100" y2="92" /><line x1="0" y1="53" x2="100" y2="53" /><line x1="0" y1="14" x2="100" y2="14" />
          {ladder.map((rung) => (
            <polyline key={rung.extraMonthly} points={line(rung)} className={styles.ladderLine} style={{ stroke: tierColor(rung.extraMonthly), color: tierColor(rung.extraMonthly), strokeWidth: rung.extraMonthly === currentExtra ? 3 : 2 }} />
          ))}
        </svg>
        <div className={styles.axis}>{axisPoints.map((point) => <span key={point.month} style={{ left: `${(point.month / span) * 100}%` }} title={point.label}><i>|</i>{point.isYearStart ? point.axisLabel : ""}</span>)}</div>
        <p className={styles.chartCaption}>Remaining balance by extra-payment tier; ★ marks your current plan.</p>
      </div>
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Extra / month</th><th>Total / mo</th><th>Payoff</th><th>Time saved</th><th>Total interest</th><th>Interest saved</th></tr></thead>
          <tbody>
            {ladder.map((rung) => (
              <tr key={rung.extraMonthly} className={rung.extraMonthly === currentExtra ? styles.ladderCurrent : undefined}>
                <td>{rung.extraMonthly <= 0 ? "— baseline" : `+${usd.format(rung.extraMonthly)}`}</td>
                <td>{usd.format(baseMonthly + Math.max(0, rung.extraMonthly))}</td>
                <td>{yearsLabel(rung.months)}</td>
                <td>{rung.monthsSaved > 0 ? yearsLabel(rung.monthsSaved) : "—"}</td>
                <td>{usd.format(rung.totalInterest)}</td>
                <td className={styles.good}>{rung.interestSaved > 0 ? usd.format(rung.interestSaved) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
