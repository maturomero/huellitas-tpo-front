export const detectMime = (b64) => {
  if (!b64) return "image/jpeg";
  if (b64.startsWith("data:")) return ""; 
  if (b64.startsWith("iVBORw0K")) return "image/png";
  if (b64.startsWith("/9j/")) return "image/jpeg";
  if (b64.startsWith("R0lGOD")) return "image/gif";
  if (b64.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
};
