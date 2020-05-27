function hexToRGB(color: number, opacity: number = 1.0): string {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default hexToRGB;
