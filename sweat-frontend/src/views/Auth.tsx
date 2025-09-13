import { useState } from "react";
import { login, register } from "../auth";

export default function Auth({ onDone, onGuest, toast }: { onDone: ()=>void; onGuest: ()=>void; toast: (m:string, t?:"ok"|"error")=>void }) {
  const [tab, setTab] = useState<"login"|"register">("login");
  const [loginEmail, setLoginEmail] = useState(""); const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState(""); const [regEmail, setRegEmail] = useState(""); const [regPass, setRegPass] = useState("");
  const [activeFeature, setActiveFeature] = useState(0);

  const doLogin = async () => {
    try { await login(loginEmail, loginPass); toast("Welcome back!"); onDone(); }
    catch (e:any) { toast(e?.detail || "Login failed", "error"); }
  };
  const doRegister = async () => {
    try { await register(regName, regEmail, regPass); toast("Account created"); onDone(); }
    catch (e:any) { toast(e?.detail || "Registration failed", "error"); }
  };

  const features = [
    {
      icon: "⚡",
      title: "Live Accuracy",
      description: "Real-time form feedback using advanced pose detection technology",
      color: "var(--accent)"
    },
    {
      icon: "📊", 
      title: "Beautiful Summaries",
      description: "Track your progress with detailed analytics and workout insights",
      color: "var(--accent2)"
    },
    {
      icon: "🤝",
      title: "Friends & Feed", 
      description: "Stay accountable with your fitness community and social features",
      color: "#ff6b6b"
    }
  ];

  return (
    <div className="auth-homepage">
      {/* Hero Section */}
      <section className="card auth-hero-enhanced" style={{marginTop:16}}>
        <div className="auth-left-enhanced">
          <div className="hero-badge">
            <span className="badge-icon">🚀</span>
            <span>Next-Gen Fitness Tracking</span>
          </div>
          <h1 className="headline-enhanced">Sweat <span className="grad">Together</span>.</h1>
          <p className="hero-subtitle">Realtime form feedback. Effortless rep tracking. A feed that keeps you accountable.</p>
          
          <div className="mini-features-enhanced">
            <div className="chip-enhanced">⚡ Live accuracy</div>
            <div className="chip-enhanced">📊 Beautiful summaries</div>
            <div className="chip-enhanced">🤝 Friends & feed</div>
          </div>

          <div className="hero-actions">
            <button className="btn ghost-enhanced" onClick={onGuest} title="Try without an account">
              <span className="btn-icon">👤</span>
              Continue as Guest
            </button>
          </div>
        </div>
        
        <div className="auth-panel-enhanced">
          <div className="auth-header">
            <h2>Get Started</h2>
            <div className="tab-switcher">
              <button className={`tab-btn ${tab==="login"?"active":""}`} onClick={()=>setTab("login")}>Login</button>
              <button className={`tab-btn ${tab==="register"?"active":""}`} onClick={()=>setTab("register")}>Sign Up</button>
            </div>
          </div>

          <div className="auth-form">
            {tab==="login" ? (
              <>
                <label className="field-enhanced">
                  <span className="field-label">Email</span>
                  <input value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="you@example.com" />
                </label>
                <label className="field-enhanced">
                  <span className="field-label">Password</span>
                  <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="••••••••" />
                </label>
                <button className="btn primary-enhanced" onClick={doLogin}>
                  <span className="btn-icon">🔑</span>
                  Sign In
                </button>
              </>
            ) : (
              <>
                <label className="field-enhanced">
                  <span className="field-label">Full Name</span>
                  <input value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Alex Johnson" />
                </label>
                <label className="field-enhanced">
                  <span className="field-label">Email</span>
                  <input value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="alex@example.com" />
                </label>
                <label className="field-enhanced">
                  <span className="field-label">Password</span>
                  <input type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="Create a strong password" />
                </label>
                <button className="btn primary-enhanced" onClick={doRegister}>
                  <span className="btn-icon">✨</span>
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="card features-showcase">
        <div className="features-header">
          <h2>Why Choose Sweat Together?</h2>
          <p className="features-subtitle">Experience the future of fitness tracking</p>
        </div>
        
        <div className="features-grid-enhanced">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`feature-card-enhanced ${activeFeature === index ? 'active' : ''}`}
              onClick={() => setActiveFeature(index)}
              style={{ '--feature-color': feature.color } as React.CSSProperties}
            >
              <div className="feature-icon-enhanced">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}