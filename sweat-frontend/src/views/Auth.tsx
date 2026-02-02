import { useState } from "react";
import { login, register } from "../auth";

export default function Auth({ onDone, onGuest, toast }: { onDone: () => void; onGuest: () => void; toast: (m: string, t?: "ok" | "error") => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");

  const doSubmit = async () => {
    try {
      if (isRegister) {
        if (!name) throw { detail: "Name is required to enter." };
        await register(name, email, pass);
        toast("Welcome to the fold.");
      } else {
        await login(email, pass);
        toast("Welcome back.");
      }
      onDone();
    } catch (e: any) {
      toast(e?.detail || "Access denied.", "error");
    }
  };

  return (
    <div className="auth-portal">
      <div className="bg-mesh" />

      <div className="auth-header-anim">
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, letterSpacing: -1, background: 'linear-gradient(to right, var(--soul-primary), var(--soul-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: 16 }}>
          Sweat Together
        </h2>
        <h1 className="auth-greeting">Enter the flow.</h1>
        <p className="auth-sub">Your movement, reimagined.</p>
      </div>

      <div className="auth-card glass-panel">
        {isRegister && (
          <input
            className="input-minimal"
            placeholder="How shall we call you?"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        )}
        <input
          className="input-minimal"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="input-minimal"
          type="password"
          placeholder="Password"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />

        <button className="btn-soul" onClick={doSubmit}>
          {isRegister ? "Begin Journey" : "Resume"}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <button className="btn-ghost" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Already have an account?" : "Create an account"}
          </button>
          <button className="btn-ghost" onClick={onGuest}>
            Guest Access
          </button>
        </div>
      </div>
    </div>
  );
}