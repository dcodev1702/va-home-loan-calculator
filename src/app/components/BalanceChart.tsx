import { semiannualBalanceTimeline } from "@/lib/calculations";
import styles from "../loan-calculator.module.css";

export default function BalanceChart({ baseline, accelerated, initialBalance }: { baseline: { month: number; balance: number }[]; accelerated: { month: number; balance: number }[]; initialBalance: number }) {
  const basePoints = semiannualBalanceTimeline(baseline, 2026, initialBalance); const extraPoints = semiannualBalanceTimeline(accelerated, 2026, initialBalance); const max = Math.max(basePoints[0]?.balance ?? 1, 1);
  const line = (points: { balance: number }[]) => points.map((point, index) => `${(index / Math.max(basePoints.length - 1, 1)) * 100},${92 - (point.balance / max) * 78}`).join(" ");
  const labels = basePoints;
  return <div className={styles.chart}><div className={styles.chartLegend}><span><i className={styles.yellowDot} />Baseline balance</span><span><i className={styles.greenDot} />With extra principal</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Semiannual remaining loan balance comparison"><line x1="0" y1="92" x2="100" y2="92" /><line x1="0" y1="53" x2="100" y2="53" /><line x1="0" y1="14" x2="100" y2="14" /><polyline points={line(basePoints)} className={styles.baselineLine} /><polyline points={line(extraPoints)} className={styles.acceleratedLine} /></svg><div className={styles.axis}>{labels.map((point, index) => <span key={point.month} style={{ left: `${(index / Math.max(basePoints.length - 1, 1)) * 100}%` }} title={point.label}><i>|</i>{point.isYearStart ? point.axisLabel : ""}</span>)}</div><p className={styles.chartCaption}>Semiannual points; calendar year labels begin in 2026.</p></div>;
}
