import * as THREE from "three";
import { colors } from "@/theme/colors";

export function makeHullTexture(soot = false): THREE.Texture {
  if (typeof document === "undefined") {
    return new THREE.Texture();
  }

  const { rocket: rc } = colors.three;
  const W = 1024;
  const H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;

  g.fillStyle = rc.hullBase;
  g.fillRect(0, 0, W, H);

  // subtle grime
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(60,70,90,${Math.random() * 0.06})`;
    g.fillRect(
      Math.random() * W,
      Math.random() * H,
      Math.random() * 6,
      Math.random() * 30
    );
  }

  // panel seams
  g.strokeStyle = rc.seam;
  g.lineWidth = 2.5;
  [0.18, 0.5, 0.82].forEach((v) => {
    g.beginPath();
    g.moveTo(0, v * H);
    g.lineTo(W, v * H);
    g.stroke();
  });
  for (let i = 0; i < 8; i++) {
    g.beginPath();
    g.moveTo((i / 8) * W, 0);
    g.lineTo((i / 8) * W, H);
    g.stroke();
  }

  // rivets
  g.fillStyle = rc.rivet;
  [0.18, 0.5, 0.82].forEach((v) => {
    for (let x = 0; x < W; x += 16) {
      g.beginPath();
      g.arc(x, v * H + 7, 1.6, 0, 7);
      g.fill();
      g.beginPath();
      g.arc(x, v * H - 7, 1.6, 0, 7);
      g.fill();
    }
  });

  // brand stripe + label (twice around the hull)
  g.fillStyle = rc.stripe;
  g.fillRect(0, H * 0.62, W, 14);
  g.fillStyle = rc.label;
  g.fillRect(0, H * 0.62 + 20, W, 4);

  [0.25, 0.75].forEach((u) => {
    g.save();
    g.translate(u * W, H * 0.34);
    g.rotate(-Math.PI / 2);
    g.fillStyle = rc.label;
    g.font = '700 72px "JetBrains Mono", monospace';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("DEV-1", 0, 0);
    g.restore();
  });

  if (soot) {
    const sg = g.createLinearGradient(0, H, 0, H * 0.7);
    sg.addColorStop(0, rc.sootGradientStart);
    sg.addColorStop(1, rc.sootGradientEnd);
    g.fillStyle = sg;
    g.fillRect(0, H * 0.7, W, H * 0.3);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
