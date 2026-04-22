// src/components/NameEntry.jsx
// Prompt the player for a handle before saving their run.

import React, { useState, useEffect, useRef } from "react";

export function NameEntry({ score, accent = "var(--neon-green)", onSubmit }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handle = (e) => {
    e.preventDefault();
    const clean = name.trim().slice(0, 24);
    if (!clean) return;
    onSubmit(clean.toUpperCase());
  };

  return (
    <form
      onSubmit={handle}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
        marginTop: "24px",
      }}
    >
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "11px",
        letterSpacing: "0.3em",
        color: accent,
      }}>
        PUNTAJE ▸ {score}
      </div>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "12px",
        letterSpacing: "0.25em",
        color: "rgba(255,255,255,0.75)",
      }}>
        INGRESA TU IDENTIFICADOR
      </div>
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value.toUpperCase())}
        maxLength={24}
        placeholder="HANDLE"
        style={{
          background: "rgba(0,0,0,0.6)",
          border: `1px solid ${accent}`,
          color: accent,
          fontFamily: "var(--font-mono)",
          fontSize: "14px",
          letterSpacing: "0.2em",
          padding: "8px 14px",
          textAlign: "center",
          outline: "none",
          minWidth: "220px",
          textTransform: "uppercase",
        }}
      />
      <button
        type="submit"
        disabled={!name.trim()}
        style={{
          background: "none",
          border: `2px solid ${accent}`,
          color: accent,
          fontFamily: "var(--font-display)",
          fontSize: "12px",
          letterSpacing: "0.3em",
          padding: "10px 26px",
          cursor: name.trim() ? "pointer" : "not-allowed",
          opacity: name.trim() ? 1 : 0.4,
          boxShadow: `0 0 16px ${accent}`,
        }}
      >
        [ REGISTRAR ]
      </button>
    </form>
  );
}
