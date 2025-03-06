export const createVStack = (
  spacing: number = 0,
  sizingVertical: LayoutMixin["layoutSizingVertical"] = "HUG",
  sizingHorizontal: LayoutMixin["layoutSizingHorizontal"] = "HUG",
): FrameNode => {
  const vstack = figma.createFrame();
  vstack.layoutMode = "VERTICAL";
  vstack.layoutSizingVertical = sizingVertical;
  vstack.layoutSizingHorizontal = sizingHorizontal;
  vstack.itemSpacing = spacing;
  vstack.fills = [];

  return vstack;
};

export const createHStack = (
  spacing: number = 0,
  sizingVertical: LayoutMixin["layoutSizingVertical"] = "HUG",
  sizingHorizontal: LayoutMixin["layoutSizingHorizontal"] = "HUG",
): FrameNode => {
  const hstack = figma.createFrame();
  hstack.layoutMode = "HORIZONTAL";
  hstack.layoutSizingVertical = sizingVertical;
  hstack.layoutSizingHorizontal = sizingHorizontal;
  hstack.itemSpacing = spacing;
  hstack.fills = [];

  return hstack;
};

export const createColorSheet = (name: string): FrameNode => {
  const sheet = figma.createFrame();
  sheet.name = name;
  sheet.layoutMode = "VERTICAL";
  sheet.layoutSizingHorizontal = "HUG";
  sheet.layoutSizingVertical = "HUG";
  sheet.itemSpacing = 48;
  sheet.paddingTop = 48;
  sheet.paddingBottom = 48;
  sheet.paddingLeft = 48;
  sheet.paddingRight = 48;
  sheet.fills = [figma.util.solidPaint("#FFFFFF")];

  return sheet;
};

export const createTitle = (content: string, color: Variable): TextNode => {
  const title = figma.createText();
  title.characters = content;
  title.fontSize = 72;
  title.fontName = { family: "Inter", style: "Semi Bold" };
  title.letterSpacing = { value: -3, unit: "PERCENT" };
  title.fills = [
    figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      color,
    ),
  ];
  return title;
};

export const createBodyText = (content: string, color: Variable): TextNode => {
  const text = figma.createText();
  text.characters = content;
  text.fontSize = 12;
  text.lineHeight = { value: 16, unit: "PIXELS" };
  text.fontName = { family: "Inter", style: "Regular" };
  text.fills = [
    figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      color,
    ),
  ];
  return text;
};

export const createSwatchFrame = (fill: Variable, name?: string): FrameNode => {
  const swatchWrapper = figma.createFrame();
  name ? (swatchWrapper.name = name) : null;
  swatchWrapper.resize(96, 48);
  swatchWrapper.fills = [
    figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      fill,
    ),
  ];
  return swatchWrapper;
};
