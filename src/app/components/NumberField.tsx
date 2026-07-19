import styles from "../loan-calculator.module.css";
import { num } from "../formatting";

export default function NumberField({ label, value, onChange, prefix = "$", step = "1" }: { label: string; value: number; onChange: (value: number) => void; prefix?: string; step?: string }) {
  return <label className={styles.field}><span>{label}</span><div className={styles.inputWrap}>{prefix && <b>{prefix}</b>}<input aria-label={label} type="number" step={step} min="0" value={value || ""} onChange={(event) => onChange(num(event.target.value))} /></div></label>;
}
