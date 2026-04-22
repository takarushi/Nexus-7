// src/components/EndScreens.jsx
import React, { useEffect, useState } from "react";
import { playGameOver, playVictory } from "../sounds/audioEngine";
import { submitRun } from "../ranking/rankingClient";
import { NameEntry } from "./NameEntry";
import { Ranking } from "./Ranking";

const ASCII_GAMEOVER = `
 ██████╗  █████╗ ███╗   ███╗███████╗
██╔════╝ ██╔══██╗████╗ ████║██╔════╝
██║  ███╗███████║██╔████╔██║█████╗
██║   ██║██╔══██║██║╚██╔╝██║██╔══╝
╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
          ██████╗ ██╗   ██╗███████╗██████╗
         ██╔═══██╗██║   ██║██╔════╝██╔══██╗
         ██║   ██║██║   ██║█████╗  ██████╔╝
         ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
         ╚██████╔╝ ╚████╔╝ ███████╗██║  ██║
          ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝
`;

const ASCII_WIN = `
███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗ █████╗
██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║██╔══██╗
███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║███████║
╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║██╔══██║
███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║██║  ██║
╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝
`;

function GlitchText({ text, color }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <pre style={{
      color,
      fontSize: "8px",
      lineHeight: "1.1",
      textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
      fontFamily: "var(--font-mono)",
      filter: glitch ? "blur(1px) brightness(2)" : "none",
      transition: "filter 0.1s",
      overflow: "hidden",
    }}>
      {text}
    </pre>
  );
}

/**
 * Shared container for both endings.
 */
function EndLayout({ children, ascii, asciiColor }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "#050810",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      padding: "28px",
      overflowY: "auto",
      fontFamily: "var(--font-display)",
    }}>
      <GlitchText text={ascii} color={asciiColor} />
      {children}
    </div>
  );
}

/**
 * Internal: handles post-game name entry + ranking display. Shared by both
 * VictoryScreen and GameOverScreen — only colors and copy differ.
 */
function EndScreen({
  accentColor,
  tagline,
  onRestart,
  runData,
}) {
  const [highlightId, setHighlightId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleSubmit = async (name) => {
    const resp = await submitRun({ ...runData, name });
    if (resp?.id) setHighlightId(resp.id);
    setSubmitted(true);
    setReloadKey((k) => k + 1);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      width: "100%",
      marginTop: "16px",
    }}>
      <p style={{
        color: accentColor,
        fontSize: "12px",
        letterSpacing: "0.3em",
        margin: "12px 0 20px",
        textAlign: "center",
        lineHeight: "1.8",
        opacity: 0.85,
      }}>
        {tagline}
      </p>

      {!submitted ? (
        <NameEntry score={runData.score} accent={accentColor} onSubmit={handleSubmit} />
      ) : (
        <div style={{
          color: accentColor,
          fontFamily: "var(--font-display)",
          fontSize: "12px",
          letterSpacing: "0.25em",
          marginBottom: "18px",
        }}>
          RUN REGISTRADO — SCORE {runData.score}
        </div>
      )}

      <div style={{ marginTop: "24px", width: "100%", display: "flex", justifyContent: "center" }}>
        <Ranking
          accent={accentColor}
          highlightId={highlightId}
          reloadKey={reloadKey}
        />
      </div>

      <button
        onClick={onRestart}
        style={{
          marginTop: "26px",
          background: "none",
          border: `2px solid ${accentColor}`,
          color: accentColor,
          fontFamily: "var(--font-display)",
          fontSize: "13px",
          letterSpacing: "0.3em",
          padding: "12px 30px",
          cursor: "pointer",
          boxShadow: `0 0 20px ${accentColor}`,
          marginBottom: "24px",
        }}
      >
        [ NUEVA INFILTRACIÓN ]
      </button>
    </div>
  );
}

export function GameOverScreen({ onRestart, runData }) {
  useEffect(() => { playGameOver(); }, []);
  return (
    <EndLayout ascii={ASCII_GAMEOVER} asciiColor="#ff2244">
      <EndScreen
        accentColor="#ff2244"
        tagline="NEXUS-7 HA ELIMINADO TU CONEXIÓN · TODOS TUS DATOS HAN SIDO BORRADOS"
        onRestart={onRestart}
        runData={runData}
      />
    </EndLayout>
  );
}

export function VictoryScreen({ onRestart, runData }) {
  useEffect(() => { playVictory(); }, []);
  return (
    <EndLayout ascii={ASCII_WIN} asciiColor="#00ff88">
      <EndScreen
        accentColor="#00ff88"
        tagline="NEXUS-7 HA SIDO COMPROMETIDO · LOS DATOS HAN SIDO LIBERADOS"
        onRestart={onRestart}
        runData={runData}
      />
    </EndLayout>
  );
}
