export default function Toasts({ items }: { items: { id: number; msg: string; type?: "ok"|"error" }[] }) {
  return (
    <div className="toasts">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.type==='error'?'error':''}`}>{t.msg}</div>
      ))}
    </div>
  );
}
