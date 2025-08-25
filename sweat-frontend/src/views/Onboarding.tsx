import React from "react";
export default function Onboarding({ start }: { start: ()=>void }) {
  return (
    <section className="card" style={{marginTop:16}}>
      <div className="view-head"><h2>Let’s set you up</h2></div>
      <div className="grid-2">
        <div><h3>1. Allow camera</h3><p className="muted">Good lighting helps. Keep your body in frame.</p></div>
        <div><h3>2. Pick an exercise</h3><p className="muted">Start with pushups or curls.</p></div>
      </div>
      <div className="row" style={{marginTop:12}}>
        <button className="btn primary" onClick={start}>Start Tracking</button>
      </div>
    </section>
  );
}
