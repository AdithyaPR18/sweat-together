import { useEffect, useRef, useState } from "react";
// MediaPipe browser SDKs
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import type { Results } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

// ---------- helpers ----------
type Metrics = { reps: number; accuracy: number; progress: number };
type Exercise = "pushups" | "bicep" | "situps" | "jumpingjacks";

function angleDeg(ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
  const abx = ax - bx, aby = ay - by;
  const cbx = cx - bx, cby = cy - by;
  const dot = abx * cbx + aby * cby;
  const mag1 = Math.hypot(abx, aby), mag2 = Math.hypot(cbx, cby);
  if (mag1 === 0 || mag2 === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / (mag1 * mag2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function clamp(n: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, n)); }
const ema = (prev: number, next: number, k = 0.25) => prev * (1 - k) + next * k;

// ---------- component ----------
export default function Track({ toast, guest }: { toast: (m: string, t?: "ok" | "error") => void; guest: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const [exercise, setExercise] = useState<Exercise>("pushups");
  const [metrics, setMetrics] = useState<Metrics>({ reps: 0, accuracy: 0, progress: 0 });
  const [isTracking, setIsTracking] = useState(false);

  const repInProgress = useRef(false);
  const lastAccuracy = useRef(0);
  const lastProgress = useRef(0);

  const pushup = { top: 160, bottom: 70 };
  const curl = { open: 160, closed: 45 };

  const onResults = (res: Results) => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    if (!res.poseLandmarks) {
      setMetrics(m => ({ ...m, accuracy: ema(m.accuracy, 0), progress: ema(m.progress, 0) }));
      return;
    }

    const lm = res.poseLandmarks;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(122,162,255,0.8)";
    ctx.fillStyle = "rgba(67,209,158,0.9)";

    for (const [i, j] of (POSE_CONNECTIONS as unknown as [number, number][])) {
      const a = lm[i], b = lm[j];
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
      ctx.stroke();
    }
    for (const p of lm) {
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    let progress = 0;
    let accuracy = 100;
    const R_SH = lm[12], R_EL = lm[14], R_WR = lm[16];
    const L_SH = lm[11], L_EL = lm[13], L_WR = lm[15];
    const R_HIP = lm[24];
    const visOK = (p: any) => p && (p.visibility ?? 1) > 0.4;
    const haveRight = visOK(R_SH) && visOK(R_EL) && visOK(R_WR);
    const haveLeft = visOK(L_SH) && visOK(L_EL) && visOK(L_WR);

    if (!haveRight && !haveLeft) accuracy = 0;

    if (exercise === "pushups") {
      if (haveRight) {
        const elbow = angleDeg(R_SH.x, R_SH.y, R_EL.x, R_EL.y, R_WR.x, R_WR.y);
        const t = clamp((pushup.top - elbow) / (pushup.top - pushup.bottom), 0, 1);
        progress = t * 100;
        if (progress >= 75 && !repInProgress.current) repInProgress.current = true;
        if (progress <= 15 && repInProgress.current) {
          setMetrics(m => ({ ...m, reps: m.reps + 1 }));
          repInProgress.current = false;
        }
        if (R_SH && R_HIP) {
          const torso = Math.abs(R_SH.y - R_HIP.y);
          accuracy = clamp(100 - (torso * 300), 0, 100);
        }
      }
    } else if (exercise === "bicep") {
      if (haveRight) {
        const elbow = angleDeg(R_SH.x, R_SH.y, R_EL.x, R_EL.y, R_WR.x, R_WR.y);
        const t = clamp((curl.open - elbow) / (curl.open - curl.closed), 0, 1);
        progress = t * 100;
        if (progress >= 75 && !repInProgress.current) repInProgress.current = true;
        if (progress <= 15 && repInProgress.current) {
          setMetrics(m => ({ ...m, reps: m.reps + 1 }));
          repInProgress.current = false;
        }
        accuracy = clamp(100 - Math.abs(R_EL.x - R_SH.x) * 200, 0, 100);
      }
    } else {
      progress = lastProgress.current;
      accuracy = lastAccuracy.current;
    }

    lastProgress.current = ema(lastProgress.current, progress);
    lastAccuracy.current = ema(lastAccuracy.current, accuracy);

    setMetrics(m => ({ ...m, progress: lastProgress.current, accuracy: lastAccuracy.current }));
  };

  const toggleTracking = async () => {
    if (isTracking) {
      // Stop tracking
      cameraRef.current?.stop();
      setIsTracking(false);
      toast("Tracking stopped");
    } else {
      // Start tracking
      if (!poseRef.current) {
        const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
        pose.setOptions({ selfieMode: true, modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        pose.onResults(onResults);
        poseRef.current = pose;
      }
      try {
        const v = videoRef.current!;
        v.muted = true; v.playsInline = true;
        const cam = new Camera(v, { onFrame: async () => { await poseRef.current!.send({ image: v }); }, width: 1280, height: 720 });
        cameraRef.current = cam;
        await cam.start();
        setIsTracking(true);
        toast(guest ? "Camera & tracking (on-device) started — Guest" : "Camera & tracking started");
      } catch (err: any) {
        const name = err?.name || "CameraError";
        if (name === "NotAllowedError") toast("Camera permission denied. Allow camera in the address bar.", "error");
        else if (name === "NotFoundError") toast("No camera found.", "error");
        else if (name === "NotReadableError") toast("Camera is in use by another app.", "error");
        else toast(`Camera error: ${name}`, "error");
        console.error(err);
      }
    }
  };

  useEffect(() => () => { cameraRef.current?.stop(); }, []);

  const reset = () => setMetrics({ reps: 0, accuracy: 0, progress: 0 });
  const save = async () => {
    if (guest) { toast("Login to save sessions", "error"); return; }
    toast("Session saved");
  };

  return (
    <div className="track-modern">
        <section className="control-panel">
          <div className="exercise-selector">
            <label className="selector-label">Choose Exercise</label>
            <div className="exercise-options">
              {[
                { value: "pushups", label: "Pushups", available: true },
                { value: "bicep", label: "Bicep Curls", available: true },
                { value: "situps", label: "Situps", available: false },
                { value: "jumpingjacks", label: "Jumping Jacks", available: false }
              ].map(option => (
                <button 
                  key={option.value} 
                  className={`exercise-option ${exercise === option.value ? 'active' : ''} ${!option.available ? 'disabled' : ''}`} 
                  onClick={() => { 
                    if (option.available) {
                      reset(); 
                      setExercise(option.value as Exercise); 
                    }
                  }}
                  disabled={!option.available}
                >
                  <div className="option-content">
                    <span className="option-label">{option.label}</span>
                    {!option.available && <span className="wip-label">Work in Progress</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="action-controls">
            <button className="btn-modern primary large" onClick={toggleTracking}>
              <span className="btn-icon">{isTracking ? "⏹️" : "🎬"}</span>
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </button>
          </div>
        </section>

        <section className="metrics-dashboard">
          <div className="metric-card"><div className="metric-icon">🔢</div><div className="metric-content"><span className="metric-value">{metrics.reps}</span><span className="metric-label">Reps</span></div></div>
          <div className="metric-card"><div className="metric-icon">🎯</div><div className="metric-content"><span className="metric-value">{Math.round(metrics.accuracy)}%</span><span className="metric-label">Accuracy</span></div></div>
          <div className="metric-card"><div className="metric-icon">⚡</div><div className="metric-content"><span className="metric-value">{Math.round(metrics.progress)}%</span><span className="metric-label">Progress</span></div></div>
        </section>

        <section className="video-section">
          <div className="video-container">
            <video ref={videoRef} autoPlay playsInline />
            <canvas ref={canvasRef} />
          </div>
        </section>

        <section className="action-section">
          <div className="action-buttons">
            <button className="btn-modern secondary" onClick={reset}><span className="btn-icon">🔄</span>Reset</button>
            <button className="btn-modern primary" onClick={save} disabled={guest} title={guest ? "Login to save sessions" : "Save your workout"}><span className="btn-icon">💾</span>Save Session</button>
          </div>
        </section>
    </div>
  );
}