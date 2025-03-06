import { getScaleName, getColorName } from "./transformColors";

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

export const createSolidColorSheet = (
  name: string,
  scalesArray: Variable[],
  titleTextColor: Variable,
  bodyTextColor: Variable,
): FrameNode => {
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

  const title = createTitle(name, titleTextColor);
  const titleWrapper = createVStack(24);
  const description = createBodyText(
    "Each step is designed with a specific use case in mind, such as backgrounds, hover states, borders, overlays, or text.",
    bodyTextColor,
  );
  description.fontSize = 16;
  description.lineHeight = { value: 24, unit: "PIXELS" };
  titleWrapper.appendChild(title);
  titleWrapper.appendChild(description);
  sheet.appendChild(titleWrapper);
  titleWrapper.layoutSizingHorizontal = "FILL";
  description.maxWidth = 640;

  const rowsWrapper = createVStack(8);
  rowsWrapper.name = "Colors";

  const stepsWrapper = createHStack(8);
  stepsWrapper.name = "Steps";
  stepsWrapper.paddingLeft = 120 + 8;

  for (let i = 0; i < 12; i++) {
    const stepLabelWrapper = figma.createFrame();
    stepLabelWrapper.name = (i + 1).toString();
    stepLabelWrapper.resize(96, 48);
    stepLabelWrapper.layoutMode = "HORIZONTAL";
    stepLabelWrapper.layoutSizingHorizontal = "FIXED";
    stepLabelWrapper.primaryAxisAlignItems = "CENTER";
    stepLabelWrapper.counterAxisAlignItems = "CENTER";

    const stepLabel = createBodyText((i + 1).toString(), bodyTextColor);

    stepLabelWrapper.appendChild(stepLabel);
    stepsWrapper.appendChild(stepLabelWrapper);
  }

  rowsWrapper.appendChild(stepsWrapper);

  for (let i = 0; i < scalesArray.length; i += 12) {
    const row = createHStack(8);
    row.name = getScaleName(scalesArray[i].name);
    const scaleLabel = createScaleLabel(
      getScaleName(scalesArray[i].name),
      bodyTextColor,
    );
    row.appendChild(scaleLabel);

    const rowColors = scalesArray.slice(i, i + 12);
    rowColors.forEach((color) => {
      const swatch = createSwatchFrame(color, getColorName(color.name));
      row.appendChild(swatch);
    });
    rowsWrapper.appendChild(row);
  }
  sheet.appendChild(rowsWrapper);

  return sheet;
};

export const createCheckerboard = (tileColor: Variable, parent: FrameNode) => {
  const createCheckerboardTile = () => {
    const tile = figma.createRectangle();
    tile.resize(8, 8);

    return tile;
  };

  const tiles = [];

  for (let rowIndex = 0; rowIndex < 7; rowIndex++) {
    for (let tileIndex = 0; tileIndex < 7; tileIndex++) {
      const tile = createCheckerboardTile();
      // Space between tiles (8px for tile itself, 8px for space between tile)
      // Increase with the current tile index
      let baseHSpacing = tileIndex * 16;
      // Add 8px space if row index is an even number
      tile.x = (rowIndex + 1) % 2 === 0 ? baseHSpacing + 8 : baseHSpacing;
      // Vertical spacing (8px row height, 0px space between rows)
      // Increase with current row index
      tile.y = rowIndex * 8;
      tiles.push(tile);
    }
  }

  const checkerboard = figma.union(tiles, parent);
  checkerboard.name = "Checkerboard";
  checkerboard.locked = true;
  checkerboard.fills = [
    figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      tileColor,
    ),
  ];
  return checkerboard;
};

export const createAlphaColorSheet = (
  name: string,
  scalesArray: Variable[],
  titleTextColor: Variable,
  bodyTextColor: Variable,
  checkerBoardBaseColor: Variable,
  checkerBoardTileColor: Variable,
): FrameNode => {
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

  const title = createTitle(name, titleTextColor);
  const titleWrapper = createVStack(24);
  const description = createBodyText(
    "Each scale has a matching alpha color variant, which is handy for UI components that need to blend into colored backgrounds.",
    bodyTextColor,
  );
  description.fontSize = 16;
  description.lineHeight = { value: 24, unit: "PIXELS" };
  titleWrapper.appendChild(title);
  titleWrapper.appendChild(description);
  sheet.appendChild(titleWrapper);
  titleWrapper.layoutSizingHorizontal = "FILL";
  description.maxWidth = 640;

  const rowsWrapper = createVStack(8);
  rowsWrapper.name = "Colors";

  const stepsWrapper = createHStack(8);
  stepsWrapper.name = "Steps";
  stepsWrapper.paddingLeft = 120 + 8;

  for (let i = 0; i < 12; i++) {
    const stepLabelWrapper = figma.createFrame();
    stepLabelWrapper.name = (i + 1).toString();
    stepLabelWrapper.resize(96, 48);
    stepLabelWrapper.layoutMode = "HORIZONTAL";
    stepLabelWrapper.layoutSizingHorizontal = "FIXED";
    stepLabelWrapper.primaryAxisAlignItems = "CENTER";
    stepLabelWrapper.counterAxisAlignItems = "CENTER";

    const stepLabel = createBodyText((i + 1).toString(), bodyTextColor);

    stepLabelWrapper.appendChild(stepLabel);
    stepsWrapper.appendChild(stepLabelWrapper);
  }

  rowsWrapper.appendChild(stepsWrapper);

  for (let i = 0; i < scalesArray.length; i += 12) {
    const row = createHStack(8);
    row.name = getScaleName(scalesArray[i].name);
    const scaleLabel = createScaleLabel(
      getScaleName(scalesArray[i].name),
      bodyTextColor,
    );
    row.appendChild(scaleLabel);

    const rowColors = scalesArray.slice(i, i + 12);
    rowColors.forEach((color) => {
      const swatchWrapper = createSwatchFrame(checkerBoardBaseColor, "Wrapper");
      const checkerboard = createCheckerboard(
        checkerBoardTileColor,
        swatchWrapper,
      );
      const swatch = createSwatchFrame(color, getColorName(color.name));
      swatchWrapper.appendChild(checkerboard);
      swatchWrapper.appendChild(swatch);
      row.appendChild(swatchWrapper);
    });
    rowsWrapper.appendChild(row);
  }
  sheet.appendChild(rowsWrapper);

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

export const createScaleLabel = (
  scaleName: string,
  color: Variable,
): FrameNode => {
  const labelWrapper = figma.createFrame();
  labelWrapper.name = "Label";
  labelWrapper.layoutMode = "HORIZONTAL";
  labelWrapper.layoutSizingHorizontal = "FIXED";
  labelWrapper.counterAxisAlignItems = "CENTER";
  labelWrapper.resize(120, 48);
  labelWrapper.fills = [];

  const label = createBodyText(scaleName, color);

  labelWrapper.appendChild(label);

  return labelWrapper;
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
