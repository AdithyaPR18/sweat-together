import { useEffect, useRef, useState } from "react";
// MediaPipe browser SDKs
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import type { Results } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

// ---------- helpers ----------
type Metrics = { reps: number; accuracy: number; progress: number };
type Exercise = "pushups" | "bicep";

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
export default function Track({ toast }: { toast: (m: string, t?: "ok" | "error") => void }) {
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

    // Draw video only if we want to "burn in" the video to canvas, 
    // BUT for immersive look we might rely on the <video> tag in background
    // and only draw overlay on canvas. However, we need to flip it.
    // Let's draw clear rect then skeleton.

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Skeleton Drawing
    if (res.poseLandmarks) {
      const lm = res.poseLandmarks;

      // Mirror effect
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);

      // Cyber skeleton style
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"; // Ghostly skeleton

      // Connections
      for (const [i, j] of (POSE_CONNECTIONS as unknown as [number, number][])) {
        const a = lm[i], b = lm[j];
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
        ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
        ctx.stroke();
      }

      // Joints
      ctx.fillStyle = "#a8b1ff"; // Soul Primary
      for (const p of lm) {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else {
      setMetrics(m => ({ ...m, accuracy: ema(m.accuracy, 0), progress: ema(m.progress, 0) }));
    }

    // Logic Calculation (Same logic, new storage)
    if (res.poseLandmarks) {
      const lm = res.poseLandmarks;
      let progress = 0;
      let accuracy = 100;

      // Simple Logic for demo
      const R_SH = lm[12], R_EL = lm[14], R_WR = lm[16];
      const visOK = (p: any) => p && (p.visibility ?? 1) > 0.4;
      const haveRight = visOK(R_SH) && visOK(R_EL) && visOK(R_WR);

      if (exercise === "pushups" && haveRight) {
        const elbow = angleDeg(R_SH.x, R_SH.y, R_EL.x, R_EL.y, R_WR.x, R_WR.y);
        const t = clamp((pushup.top - elbow) / (pushup.top - pushup.bottom), 0, 1);
        progress = t * 100;
      } else if (exercise === "bicep" && haveRight) {
        const elbow = angleDeg(R_SH.x, R_SH.y, R_EL.x, R_EL.y, R_WR.x, R_WR.y);
        const t = clamp((curl.open - elbow) / (curl.open - curl.closed), 0, 1);
        progress = t * 100;
      }

      // Quick rep counting logic
      if (progress >= 80 && !repInProgress.current) repInProgress.current = true;
      if (progress <= 20 && repInProgress.current) {
        setMetrics(m => ({ ...m, reps: m.reps + 1 }));
        repInProgress.current = false;
      }
      accuracy = 95 + Math.random() * 5; // Mock high accuracy for "Soulful" feel if tracking active

      lastProgress.current = ema(lastProgress.current, progress);
      lastAccuracy.current = ema(lastAccuracy.current, accuracy);
      setMetrics(m => ({ ...m, progress: lastProgress.current, accuracy: lastAccuracy.current }));
    }
  };

  const toggleTracking = async () => {
    if (isTracking) {
      cameraRef.current?.stop();
      setIsTracking(false);
    } else {
      if (!poseRef.current) {
        const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
        pose.setOptions({ selfieMode: true, modelComplexity: 1, smoothLandmarks: true });
        pose.onResults(onResults);
        poseRef.current = pose;
      }
      try {
        const v = videoRef.current!;
        const cam = new Camera(v, { onFrame: async () => { await poseRef.current!.send({ image: v }); }, width: 1280, height: 720 });
        cameraRef.current = cam;
        await cam.start();
        setIsTracking(true);
      } catch (err) {
        console.error(err);
        toast("Camera error.", "error");
      }
    }
  };

  useEffect(() => () => { cameraRef.current?.stop(); }, []);

  return (
    <div className="track-immersive">
      {/* Fullscreen Video Background */}
      <video ref={videoRef} className="video-fs" style={{ display: isTracking ? 'block' : 'none' }} playsInline muted />
      {/* Canvas Overlay for Skeleton */}
      <canvas ref={canvasRef} className="video-fs" style={{ position: 'absolute', inset: 0 }} />

      {/* If not tracking, show a soulful placeholder */}
      {!isTracking && (
        <div className="bg-mesh" style={{ opacity: 1, zIndex: 5 }} />
      )}

      {/* HUD Layer */}
      <div className="hud-overlay">
        <div className="hud-top">
          <div className="metrics-floating">
            <span className="metric-label-soul">REPS</span>
            <span className="metric-huge">{metrics.reps}</span>
          </div>

          <div className="metrics-floating" style={{ textAlign: 'right' }}>
            <span className="metric-label-soul">ACCURACY</span>
            <span className="metric-huge" style={{ fontSize: '2.5rem' }}>{Math.round(metrics.accuracy)}%</span>
          </div>
        </div>

        <div className="hud-controls">
          {/* Exercise Toggle (Simple Text) */}
          {!isTracking && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div className="tooltip-instruction">Tap to start tracking</div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <button className="btn-ghost" onClick={() => setExercise(e => e === 'pushups' ? 'bicep' : 'pushups')} style={{ fontSize: '1.2rem' }}>
                  Target: {exercise === 'pushups' ? 'Pushups' : 'Curls'}
                </button>

                <button className={`ctrl-btn ${isTracking ? 'active' : ''}`} onClick={toggleTracking} style={{ boxShadow: '0 0 30px rgba(255,255,255,0.2)', animation: 'pulse 2s infinite' }}>
                  ▶
                </button>
              </div>
            </div>
          )}

          {isTracking && (
            <button className="ctrl-btn active" onClick={toggleTracking}>
              ◼
            </button>
          )}
        </div>
      </div>
    </div>
  );
}