import React, { useEffect, useRef, useState } from "react";
// MediaPipe browser SDKs
import { Pose, POSE_CONNECTIONS, Results } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

// ---------- helpers ----------
type Metrics = { reps: number; accuracy: number; progress: number };
type Exercise = "pushups" | "bicep" | "thumbs" | "situps" | "jumpingjacks";

function angleDeg(ax:number, ay:number, bx:number, by:number, cx:number, cy:number) {
  // angle at B between BA and BC (in degrees)
  const abx = ax - bx, aby = ay - by;
  const cbx = cx - bx, cby = cy - by;
  const dot = abx*cbx + aby*cby;
  const mag1 = Math.hypot(abx, aby), mag2 = Math.hypot(cbx, cby);
  if (mag1 === 0 || mag2 === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot/(mag1*mag2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function clamp(n:number, lo:number, hi:number){ return Math.min(hi, Math.max(lo, n)); }

// simple EMA smoother
const ema = (prev:number, next:number, k=0.25) => prev*(1-k) + next*k;

// ---------- component ----------
export default function Track({ toast, guest }: { toast: (m:string,t?:"ok"|"error")=>void; guest: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera|null>(null);
  const poseRef = useRef<Pose|null>(null);

  const [exercise, setExercise] = useState<Exercise>("pushups");
  const [metrics, setMetrics] = useState<Metrics>({ reps: 0, accuracy: 0, progress: 0 });
  const repInProgress = useRef(false);
  const lastAccuracy = useRef(0);
  const lastProgress = useRef(0);

  // thresholds (tweak to taste)
  const pushup = { top: 160, bottom: 70 }; // elbow angle (~straight vs bent)
  const curl = { open: 160, closed: 45 };  // elbow angle
  const thumbsTouch = 0.1; // normalized distance
  // -------------------------------------------------------------

  const onResults = (res: Results) => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Draw video + skeleton
    ctx.save();
    ctx.scale(-1, 1); // mirror like a selfie
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    if (!res.poseLandmarks) {
      setMetrics(m => ({ ...m, accuracy: ema(m.accuracy, 0), progress: ema(m.progress, 0)}));
      return;
    }

    // draw landmarks
    // We’ll render simple dots/lines so you see tracking feedback
    const lm = res.poseLandmarks;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(122,162,255,0.8)";
    ctx.fillStyle = "rgba(67,209,158,0.9)";

    // connections
    for (const [i, j] of POSE_CONNECTIONS as any) {
      const a = lm[i], b = lm[j];
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x*canvas.width, a.y*canvas.height);
      ctx.lineTo(b.x*canvas.width, b.y*canvas.height);
      ctx.stroke();
    }
    // points
    for (const p of lm) {
      ctx.beginPath();
      ctx.arc(p.x*canvas.width, p.y*canvas.height, 3, 0, Math.PI*2);
      ctx.fill();
    }

    // ----- compute exercise-specific metrics -----
    let progress = 0;
    let accuracy = 100; // crude “form” proxy — penalize when key joints missing or weird

    const R_SH = lm[12], R_EL = lm[14], R_WR = lm[16];
    const L_SH = lm[11], L_EL = lm[13], L_WR = lm[15];
    const R_TH = lm[22], L_TH = lm[23];

    // basic sanity check for visibility
    const visOK = (p:any) => p && (p.visibility ?? 1) > 0.4;
    const haveRight = visOK(R_SH)&&visOK(R_EL)&&visOK(R_WR);
    const haveLeft  = visOK(L_SH)&&visOK(L_EL)&&visOK(L_WR);

    if (!haveRight && !haveLeft) accuracy = 0;

    if (exercise === "pushups") {
      // use right arm elbow angle as proxy
      if (haveRight) {
        const elbow = angleDeg(R_SH.x, R_SH.y, R_EL.x, R_EL.y, R_WR.x, R_WR.y);
        const t = clamp((pushup.top - elbow) / (pushup.top - pushup.bottom), 0, 1);
        progress = t*100;

        // rep logic: down (progress ≥ 75) then up (≤ 15)
        if (progress >= 75 && !repInProgress.current) repInProgress.current = true;
        if (progress <= 15 && repInProgress.current) {
          setMetrics(m => ({ ...m, reps: m.reps + 1 }));
          repInProgress.current = false;
        }

        // simple “accuracy”: straight body (shoulder vs hip height similar)
        if (R_SH && R_TH) {
          const torso = Math.abs((R_SH.y - R_TH.y));
          accuracy = clamp(100 - (torso*300), 0, 100);
        }
      }
    } else if (exercise === "bicep") {
      // right arm curl
      if (haveRight) {
        const elbow = angleDeg(R_SH.x, R_SH.y, R_EL.x, R_EL.y, R_WR.x, R_WR.y);
        const t = clamp((curl.open - elbow) / (curl.open - curl.closed), 0, 1);
        progress = t*100;

        if (progress >= 75 && !repInProgress.current) repInProgress.current = true;
        if (progress <= 15 && repInProgress.current) {
          setMetrics(m => ({ ...m, reps: m.reps + 1 }));
          repInProgress.current = false;
        }

        accuracy = clamp(100 - Math.abs((R_EL.x - R_SH.x))*200, 0, 100); // keep elbow near torso
      }
    } else if (exercise === "thumbs") {
      // use thumbs distance
      const RT = lm[22]; // mediapipe index note: browser Pose doesn’t expose “thumb” via pose; use wrists proximity instead
      const LT = lm[21];
      const RW = R_WR, LW = L_WR;
      if (RW && LW) {
        const dx = RW.x - LW.x, dy = RW.y - LW.y;
        const dist = Math.hypot(dx, dy); // normalized
        progress = clamp( (thumbsTouch - dist) / thumbsTouch, 0, 1 )*100;
        if (dist <= thumbsTouch*0.9 && !repInProgress.current) {
          repInProgress.current = true;
          setMetrics(m => ({ ...m, reps: m.reps + 1 }));
        } else if (dist > thumbsTouch) {
          repInProgress.current = false;
        }
        accuracy = clamp(100 - dist*300, 0, 100);
      }
    } else {
      // WIP moves
      progress = lastProgress.current;
      accuracy = lastAccuracy.current;
    }

    // smooth output
    lastProgress.current = ema(lastProgress.current, progress);
    lastAccuracy.current = ema(lastAccuracy.current, accuracy);

    setMetrics(m => ({
      ...m,
      progress: lastProgress.current,
      accuracy: lastAccuracy.current
    }));

    // HUD tip
    ctx.fillStyle = "rgba(0,0,0,.45)";
    ctx.strokeStyle = "rgba(255,255,255,.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(12, canvas.height - 44, 320, 28, 10);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#cde3f5";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText("Tip: keep shoulders and hips in frame", 22, canvas.height - 25);
  };

  const begin = async () => {
    // init pose once
    if (!poseRef.current) {
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        selfieMode: true,
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults(onResults);
      poseRef.current = pose;
    }

    // start camera
    try {
      const v = videoRef.current!;
      v.muted = true;
      v.playsInline = true;
      const cam = new Camera(v, {
        onFrame: async () => {
          await poseRef.current!.send({ image: v });
        },
        width: 1280,
        height: 720,
      });
      cameraRef.current = cam;
      await cam.start();
      toast(guest ? "Camera & tracking (on-device) started — Guest" : "Camera & tracking started");
    } catch (err:any) {
      const name = err?.name || "CameraError";
      if (name === "NotAllowedError") toast("Camera permission denied. Allow camera in the address bar.", "error");
      else if (name === "NotFoundError") toast("No camera found.", "error");
      else if (name === "NotReadableError") toast("Camera is in use by another app.", "error");
      else toast(`Camera error: ${name}`, "error");
      console.error(err);
    }
  };

  useEffect(() => () => {
    cameraRef.current?.stop();
  }, []);

  const reset = () => setMetrics({ reps: 0, accuracy: 0, progress: 0 });

  const save = async () => {
    if (guest) { toast("Login to save sessions", "error"); return; }
    // Call your backend save endpoint here if you want to save from this view
    toast("Session saved");
  };

  return (
    <section className="card" style={{marginTop:16}}>
      <div className="view-head">
        <div className="row">
          <label>Exercise&nbsp;
            <select value={exercise} onChange={e=>{ reset(); setExercise(e.target.value as Exercise); }}>
              <option value="pushups">Pushups</option>
              <option value="bicep">Bicep Curls</option>
              <option value="thumbs">Thumb Touch</option>
              <option value="situps">Situps (WIP)</option>
              <option value="jumpingjacks">Jumping Jacks (WIP)</option>
            </select>
          </label>
          <button className="btn" onClick={begin}>Start Tracking</button>
        </div>
        <div className="metrics">
          <div className="metric"><span>Reps</span><span>{metrics.reps}</span></div>
          <div className="metric"><span>Accuracy</span><span>{Math.round(metrics.accuracy)}%</span></div>
        </div>
      </div>

      <div className="video-wrap">
        <video ref={videoRef} autoPlay playsInline />
        <canvas ref={canvasRef} />
        <div className="hud-tip">On-device pose estimation. Keep full body in frame.</div>
      </div>

      <div className="bar"><div className="fill" style={{width:`${metrics.progress.toFixed(0)}%`}} /></div>

      <div className="row" style={{marginTop:10}}>
        <button className="btn primary" onClick={save} disabled={guest} title={guest ? "Login to save" : ""}>Save Session</button>
        <button className="btn" onClick={reset}>Reset</button>
      </div>
    </section>
  );
}
