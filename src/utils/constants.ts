export const SWATCH_WIDTH = 96;
export const SWATCH_HEIGHT = 48;
export const SPACING = 8;

export const GRADIENT_BORDER_FILLS: GradientPaint[] = [
  {
    type: "GRADIENT_LINEAR",
    gradientTransform: [
      [1, 0, 0],
      [0, 1, 0],
    ],
    gradientStops: [
      { position: 0, color: { r: 0, g: 0, b: 0, a: 0 } },
      { position: 0.5, color: { r: 0, g: 0, b: 0, a: 0.2 } },
      { position: 1, color: { r: 0, g: 0, b: 0, a: 0 } },
    ],
  },
];
