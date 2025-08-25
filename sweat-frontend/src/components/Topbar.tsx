export default function Topbar({ label, me, guest }: { label: string; me?: { name: string } | null; guest: boolean }) {
  return (
    <header className="topbar">
      <div style={{fontWeight:800}}>{label}{guest ? " (Guest)" : ""}</div>
      <div className="me">
        <div>{guest ? "Guest" : (me?.name ?? "You")}</div>
        <div className="dot" />
      </div>
    </header>
  );
}
