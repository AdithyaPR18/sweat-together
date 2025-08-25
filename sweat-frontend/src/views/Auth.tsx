import { useState } from "react";
import { login, register } from "../auth";

export default function Auth({ onDone, onGuest, toast }: { onDone: ()=>void; onGuest: ()=>void; toast: (m:string, t?: "ok"|"error")=>void }) {
  const [tab, setTab] = useState<"login"|"register">("login");
  const [loginEmail, setLoginEmail] = useState(""); const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState(""); const [regEmail, setRegEmail] = useState(""); const [regPass, setRegPass] = useState("");

  const doLogin = async () => {
    try { await login(loginEmail, loginPass); toast("Welcome back!"); onDone(); }
    catch (e:any) { toast(e?.detail || "Login failed", "error"); }
  };
  const doRegister = async () => {
    try { await register(regName, regEmail, regPass); toast("Account created"); onDone(); }
    catch (e:any) { toast(e?.detail || "Registration failed", "error"); }
  };

  return (
    <section className="card auth-hero" style={{marginTop:16}}>
      <div className="auth-left">
        <h1 className="headline">Move better <span className="grad">together</span>.</h1>
        <p className="muted">Realtime form feedback. Effortless rep tracking. A feed that keeps you accountable.</p>
        <div className="mini-features">
          <div className="chip">⚡ Live accuracy</div>
          <div className="chip">📊 Beautiful summaries</div>
          <div className="chip">🤝 Friends & feed</div>
        </div>
        <button className="btn ghost" onClick={onGuest} title="Try without an account">Continue as Guest</button>
      </div>
      <div className="auth-panel">
        <div className="row" style={{marginBottom:8}}>
          <button className={`btn ${tab==="login"?"primary":""}`} onClick={()=>setTab("login")}>Login</button>
          <button className={`btn ${tab==="register"?"primary":""}`} onClick={()=>setTab("register")}>Create account</button>
        </div>

        {tab==="login" ? (
          <>
            <label className="field">Email<input value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="you@startup.com" /></label>
            <label className="field">Password<input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="••••••••" /></label>
            <button className="btn primary" style={{width:"100%"}} onClick={doLogin}>Login</button>
          </>
        ) : (
          <>
            <label className="field">Name<input value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Alex Doe" /></label>
            <label className="field">Email<input value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="alex@company.com" /></label>
            <label className="field">Password<input type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="Create a strong password" /></label>
            <button className="btn primary" style={{width:"100%"}} onClick={doRegister}>Create account</button>
          </>
        )}
      </div>
    </section>
  );
}
