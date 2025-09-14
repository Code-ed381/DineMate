// src/theme/shadows.js
const shadows = [
  "none", // 0
  "0px 2px 8px rgba(0,0,0,0.1)", // 1
  "0px 4px 16px rgba(0,0,0,0.15)", // 2
  // fill the rest with "none"
  ...Array(22).fill("none"),
];

export default shadows;
