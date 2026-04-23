// src/hooks/useQueryEvaluator.js
// Parses the player's MongoDB-shell-style input, runs it with Mingo against
// the scenario's dataset, then asks the scenario to decide correctness.
// The correctness rule lives on each scenario (Strategy pattern) so adding a
// level only means writing its evaluate() — no changes here.

import { useCallback } from "react";
import mingo from "mingo";
import "mingo/init/system";

function parseQuery(raw) {
  let str = raw.trim();

  const findMatch = str.match(/^db\.\w+\.find\s*\(([\s\S]*)\)\s*$/i);
  if (findMatch) str = findMatch[1].trim();

  const aggMatch = str.match(/^db\.\w+\.aggregate\s*\(([\s\S]*)\)\s*$/i);
  if (aggMatch) str = aggMatch[1].trim();

  const jsonified = str
    .replace(/([{,]\s*)(\$?[a-zA-Z_][a-zA-Z0-9_.]*)\s*:/g, '$1"$2":')
    .replace(/:\s*'([^']*)'/g, ': "$1"');

  return JSON.parse(jsonified);
}

function runFind(queryObj, data) {
  return mingo.find(data, queryObj).all();
}

function runAggregate(pipeline, scenario) {
  const resolver = (name) => {
    if (name === scenario.collection) return scenario.data;
    if (name === scenario.extraCollection) return scenario.extraData || [];
    return [];
  };
  return mingo.aggregate(scenario.data, pipeline, {
    collectionResolver: resolver,
  });
}

function crypticError(type) {
  const messages = {
    syntax: [
      "▸ ERROR DE SINTAXIS — La máquina no reconoce tu lenguaje. Revisa los operadores.",
      "▸ PARSE FAILURE — NEXUS-7 rechaza comandos malformados. Revisa llaves y comillas.",
      "▸ COMANDO INVÁLIDO — La IA Guardiana no procesa ruido. Estructura tu query.",
    ],
    wrong_results: [
      "▸ RESULTADO INCORRECTO — Obtuviste documentos, pero no los que el sistema necesita.",
      "▸ FILTRO FALLIDO — Tu query ejecuta, pero apunta al objetivo equivocado.",
      "▸ ACCESO DENEGADO — Los datos que extraes no coinciden con la clave requerida.",
    ],
    empty: [
      "▸ CONJUNTO VACÍO — Tu filtro no encuentra nada. ¿Revisaste los valores exactos?",
      "▸ NULL RETURN — El sistema devuelve silencio. Ajusta las condiciones.",
    ],
  };
  const arr = messages[type] || messages.syntax;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useQueryEvaluator() {
  const evaluate = useCallback((rawInput, scenario) => {
    try {
      const parsed = parseQuery(rawInput);
      const results = Array.isArray(parsed)
        ? runAggregate(parsed, scenario)
        : runFind(parsed, scenario.data);

      if (results.length === 0) {
        return { ok: false, message: crypticError("empty"), results: [] };
      }

      const correct = scenario.evaluate(results);
      if (correct) {
        return {
          ok: true,
          message: `▸ ACCESO CONCEDIDO — Clave extraída: ${scenario.accessCode}`,
          results,
        };
      }
      return { ok: false, message: crypticError("wrong_results"), results };
    } catch (_err) {
      return { ok: false, message: crypticError("syntax"), results: [] };
    }
  }, []);

  return { evaluate };
}
