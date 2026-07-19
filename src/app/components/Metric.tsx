import styles from "../loan-calculator.module.css";

export default function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "warning" | "bad" }) {
  return <div className={styles.metric}><span>{label}</span><strong className={styles[tone]}>{value}</strong></div>;
}
