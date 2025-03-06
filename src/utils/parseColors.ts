export function parseHex(hex: string): VariableValue {
  // Remove the hash
  hex = hex.replace(/^#/, "");

  let [r, g, b, a] = [1, 1, 1, 1];

  if (hex.length === 6) {
    // 6 digits (#RRGGBB)
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else if (hex.length === 8) {
    // 8 digits (#RRGGBBAA)
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
    a = parseInt(hex.substring(6, 8), 16) / 255;
  }

  // Return the RGB or RGBA value
  if (a === 1) {
    return { r: r, g: g, b: b };
  } else {
    a = Math.round(a * 100) / 100;
    return { r: r, g: g, b: b, a: a };
  }
}

export function parseRgba(rgbaValue: string): VariableValue {
  let [r, g, b, a] = [1, 1, 1, 1];

  // Extract numbers from original value string
  // Before: "rgba(0, 0, 0, 0.05)"
  // After: ["0", "0", "0", "0.05"]
  const regex = /-?\d+(\.\d+)?/g;
  const values = rgbaValue.match(regex)!;

  // White or Black
  if (parseInt(values[0]) === 255) {
    r = 1;
    g = 1;
    b = 1;
  } else {
    r = 0;
    g = 0;
    b = 0;
  }

  a = parseFloat(values[3]);

  return { r: r, g: g, b: b, a: a };
}
