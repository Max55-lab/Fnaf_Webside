import { useEffect, useRef } from "react";

/* ============================================================
   ShaderBackdrop — a hand-written WebGL CRT/VHS static field.
   Raw WebGL1, no libraries: a fullscreen quad running one small
   fragment shader (hash noise + scanlines + slow wave + vignette).
   It pauses itself when the tab hides, when scrolled out of view,
   and renders a single frozen frame under prefers-reduced-motion.
   If WebGL is unavailable it renders nothing and the CSS behind
   it carries the look.
   ============================================================ */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_intensity;
uniform vec3 u_tint;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_time;

  /* Slow VHS wave — bends the scanlines near the bottom. */
  float wave = sin(uv.y * 24.0 - t * 1.7) * 0.0018 * u_intensity
             + sin(uv.y * 90.0 + t * 6.0) * 0.0006 * u_intensity;
  uv.x += wave;

  /* Broadcast static: coarse grain that re-rolls every frame. */
  float grain = hash(floor(uv * u_res * 0.5) + floor(t * 24.0));
  grain = (grain - 0.5) * 0.16 * u_intensity;

  /* Scanlines + a soft rolling bar. */
  float scan = sin(uv.y * u_res.y * 1.6) * 0.045;
  float bar = smoothstep(0.0, 0.22, abs(fract(uv.y - t * 0.05) - 0.5)) * 0.05;

  /* Vignette pulls the corners into darkness. */
  float vig = smoothstep(1.15, 0.35, length(uv - 0.5) * 1.4);

  /* Faint drifting bright specks — dust in the signal. */
  float speck = step(0.9985, hash(floor(uv * 90.0) + floor(t * 3.0))) * 0.5 * u_intensity;

  float lum = (0.05 + grain + scan + bar + speck) * vig;
  vec3 col = u_tint * lum;
  /* Chromatic fringe: push green slightly off-center in bright areas. */
  col.g += grain * 0.35 * vig;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function ShaderBackdrop({
  className = "",
  tint = [0.55, 0.85, 1.0],
  intensity = 1,
  speed = 1,
}) {
  const canvasRef = useRef(null);
  /* Depend on the values, not the array identity — callers may pass
     an inline array without restarting the GL context every render. */
  const tintKey = tint.join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let gl = null;
    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      canvas.style.display = "none";
      return undefined;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      canvas.style.display = "none";
      return undefined;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.style.display = "none";
      return undefined;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uIntensity = gl.getUniformLocation(program, "u_intensity");
    const uTint = gl.getUniformLocation(program, "u_tint");
    const [tr, tg, tb] = tintKey.split(",").map((n) => Number(n) || 0.5);
    gl.uniform1f(uIntensity, intensity);
    gl.uniform3f(uTint, tr, tg, tb);

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = false;
    let inView = true;
    let start = performance.now();

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(canvas.clientWidth * scale));
      const h = Math.max(1, Math.floor(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const draw = (now) => {
      resize();
      gl.uniform1f(uTime, ((now - start) / 1000) * speed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const frame = (now) => {
      if (!running) return;
      draw(now);
      raf = requestAnimationFrame(frame);
    };

    const startLoop = () => {
      if (running || reducedMotion || !inView || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stopLoop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    if (reducedMotion) {
      resize();
      draw(performance.now()); /* one frozen, animated-free frame */
    } else {
      startLoop();
    }

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let observer = null;
    if (!reducedMotion && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          inView = Boolean(entries[0]?.isIntersecting);
          if (inView) startLoop();
          else stopLoop();
        },
        { threshold: 0.02 }
      );
      observer.observe(canvas);
    }

    return () => {
      stopLoop();
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
      try {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      } catch {
        /* context already lost */
      }
    };
  }, [tintKey, intensity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`shader-backdrop ${className}`}
      aria-hidden="true"
      focusable="false"
    />
  );
}
