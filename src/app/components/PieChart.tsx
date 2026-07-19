import { useState } from "react";
import styles from "../loan-calculator.module.css";
import { usd } from "../formatting";

export default function PieChart({ title, segments }: { title: string; segments: { label: string; value: number; color: string }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const total = Math.max(segments.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0), 1);
  const visibleSegments = segments.filter((segment) => segment.value > 0);
  const radius = 32; const circumference = 2 * Math.PI * radius;
  const rings = visibleSegments.map((segment, index) => {
    const percentage = segment.value / total;
    const preceding = visibleSegments.slice(0, index).reduce((sum, item) => sum + item.value / total, 0);
    return { ...segment, percent: percentage * 100, dash: percentage * circumference, gap: circumference - percentage * circumference, rotation: preceding * 360 - 90 };
  });
  const gradientId = `pie-${title.replace(/[^a-z0-9]/gi, "")}`;
  const focused = active !== null ? rings[active] : null;
  const centerValue = focused ? `${focused.percent.toFixed(1)}%` : usd.format(total);
  const centerLabel = focused ? focused.label : "total";
  return <div className={styles.pieCard}><h3>{title}</h3><div className={styles.pieBody}><svg viewBox="0 0 100 100" role="img" aria-label={title}><defs><radialGradient id={`${gradientId}-gloss`} cx="42%" cy="34%" r="72%"><stop offset="0%" stopColor="#fff" stopOpacity="0.28" /><stop offset="45%" stopColor="#fff" stopOpacity="0.05" /><stop offset="100%" stopColor="#000" stopOpacity="0.22" /></radialGradient><filter id={`${gradientId}-shadow`} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.6" floodColor="#04070d" floodOpacity="0.55" /></filter></defs><g filter={`url(#${gradientId}-shadow)`}>{rings.map((ring, index) => <circle key={ring.label} cx="50" cy="50" r={radius} fill="none" stroke={ring.color} strokeWidth={active === index ? 18 : 15} strokeDasharray={`${ring.dash} ${ring.gap}`} strokeDashoffset="0" transform={`rotate(${ring.rotation} 50 50)`} opacity={active === null || active === index ? 1 : .4} onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)} />)}</g><circle cx="50" cy="50" r={radius} fill="none" stroke={`url(#${gradientId}-gloss)`} strokeWidth="15" pointerEvents="none" /><text x="50" y={focused ? 46 : 48} textAnchor="middle" className={styles.pieCenterValue} pointerEvents="none">{centerValue}</text><text x="50" y={focused ? 57 : 59} textAnchor="middle" className={styles.pieCenterLabel} pointerEvents="none">{centerLabel}</text></svg></div><div className={styles.pieLegend}>{rings.map((ring, index) => <span key={ring.label} onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)}><i style={{ background: ring.color }} />{ring.label} <b>{ring.percent.toFixed(1)}%</b></span>)}</div><p>Hover a slice to inspect its percentage and dollar amount.</p></div>;
}
