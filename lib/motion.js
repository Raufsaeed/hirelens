import tokens from "@/design/tokens.json";

// Motion values for framer-motion, read from design/tokens.json (the single source of truth).

function tokenValue(group, name) {
  return tokens[group].tokens.find((token) => token.name === name)?.value;
}

// "220ms" -> 0.22 (framer-motion uses seconds)
function seconds(name) {
  return parseFloat(tokenValue("duration", name)) / 1000;
}

// "cubic-bezier(0.16, 1, 0.3, 1)" -> [0.16, 1, 0.3, 1]
function bezier(name) {
  return tokenValue("easing", name).match(/[\d.]+/g).map(Number);
}

export const EASE_OUT = bezier("ease-out");

export const DURATION = {
  fast: seconds("duration-fast"),
  base: seconds("duration-base"),
  slow: seconds("duration-slow"),
  score: seconds("duration-score"),
  chart: seconds("duration-chart"),
  rotate: seconds("duration-rotate"),
  float: seconds("duration-float"),
  floatFast: seconds("duration-float-fast"),
  stagger: seconds("duration-stagger"),
};
