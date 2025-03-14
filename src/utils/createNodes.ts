import {
  SWATCH_WIDTH,
  SWATCH_HEIGHT,
  SPACING,
  GRADIENT_BORDER_FILLS,
} from "./constants";
import { getScaleName, getColorName } from "./transformColors";

export function createGradientBorder(
  node: FrameNode,
  mode: "LIGHT" | "DARK" = "LIGHT",
) {
  if (mode === "LIGHT") {
    node.strokes = [
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
  }
  if (mode === "DARK") {
    node.strokes = [
      {
        type: "GRADIENT_LINEAR",
        gradientTransform: [
          [1, 0, 0],
          [0, 1, 0],
        ],
        gradientStops: [
          { position: 0, color: { r: 1, g: 1, b: 1, a: 0 } },
          { position: 0.5, color: { r: 1, g: 1, b: 1, a: 0.2 } },
          { position: 1, color: { r: 1, g: 1, b: 1, a: 0 } },
        ],
      },
    ];
  }
  node.strokeAlign = "OUTSIDE";
  node.strokeBottomWeight = 1;
  return node;
}

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
  alignItemsHorizontal: AutoLayoutMixin["primaryAxisAlignItems"] = "CENTER",
  alignItemsVertical: AutoLayoutMixin["counterAxisAlignItems"] = "CENTER",
  sizingVertical: LayoutMixin["layoutSizingVertical"] = "HUG",
  sizingHorizontal: LayoutMixin["layoutSizingHorizontal"] = "HUG",
): FrameNode => {
  const hstack = figma.createFrame();
  hstack.layoutMode = "HORIZONTAL";
  hstack.primaryAxisAlignItems = alignItemsHorizontal;
  hstack.counterAxisAlignItems = alignItemsVertical;
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
  mode: "LIGHT" | "DARK" = "LIGHT",
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
  if (mode === "LIGHT") {
    sheet.fills = [figma.util.solidPaint("#FFFFFF")];
  } else if (mode === "DARK") {
    sheet.fills = [figma.util.solidPaint("#0B0B0B")];
  }

  const title = createTitle(name, titleTextColor);
  const titleWrapper = createVStack(24);
  titleWrapper.name = "Header";
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

  const rowsWrapper = createVStack(SPACING);
  rowsWrapper.name = "Colors";

  const stepGroupsWrapper = createHStack(SPACING);
  stepGroupsWrapper.name = "Step groups";
  stepGroupsWrapper.paddingLeft = 120 + SPACING;
  stepGroupsWrapper.clipsContent = false;

  const backgroundsWrapper = createHStack();
  backgroundsWrapper.name = "Backgrounds";
  backgroundsWrapper.resize(SWATCH_WIDTH * 2 + SPACING, SWATCH_HEIGHT);
  createGradientBorder(backgroundsWrapper, mode);
  backgroundsWrapper.appendChild(createBodyText("Backgrounds", bodyTextColor));

  const componentsWrapper = createHStack();
  componentsWrapper.name = "Interactive components";
  componentsWrapper.resize(SWATCH_WIDTH * 3 + SPACING * 2, SWATCH_HEIGHT);
  createGradientBorder(componentsWrapper, mode);
  componentsWrapper.appendChild(
    createBodyText("Interactive components", bodyTextColor),
  );

  const bordersWrapper = createHStack();
  bordersWrapper.name = "Borders and separators";
  bordersWrapper.resize(SWATCH_WIDTH * 3 + SPACING * 2, SWATCH_HEIGHT);
  createGradientBorder(bordersWrapper, mode);
  bordersWrapper.appendChild(
    createBodyText("Borders and separators", bodyTextColor),
  );

  const solidColorsWrapper = createHStack();
  solidColorsWrapper.name = "Solid colors";
  solidColorsWrapper.resize(SWATCH_WIDTH * 2 + SPACING, SWATCH_HEIGHT);
  createGradientBorder(solidColorsWrapper, mode);
  solidColorsWrapper.appendChild(createBodyText("Solid colors", bodyTextColor));

  const accessibleTextWrapper = createHStack();
  accessibleTextWrapper.name = "Accessible text";
  accessibleTextWrapper.resize(SWATCH_WIDTH * 2 + SPACING, SWATCH_HEIGHT);
  createGradientBorder(accessibleTextWrapper, mode);
  accessibleTextWrapper.appendChild(
    createBodyText("Accessible text", bodyTextColor),
  );

  stepGroupsWrapper.appendChild(backgroundsWrapper);
  stepGroupsWrapper.appendChild(componentsWrapper);
  stepGroupsWrapper.appendChild(bordersWrapper);
  stepGroupsWrapper.appendChild(solidColorsWrapper);
  stepGroupsWrapper.appendChild(accessibleTextWrapper);

  rowsWrapper.appendChild(stepGroupsWrapper);

  const stepsWrapper = createHStack(SPACING);
  stepsWrapper.name = "Steps";
  stepsWrapper.paddingLeft = 120 + SPACING;

  for (let i = 0; i < 12; i++) {
    const stepLabelWrapper = figma.createFrame();
    stepLabelWrapper.name = (i + 1).toString();
    stepLabelWrapper.resize(SWATCH_WIDTH, SWATCH_HEIGHT);
    stepLabelWrapper.layoutMode = "HORIZONTAL";
    stepLabelWrapper.layoutSizingHorizontal = "FIXED";
    stepLabelWrapper.primaryAxisAlignItems = "CENTER";
    stepLabelWrapper.counterAxisAlignItems = "CENTER";
    stepLabelWrapper.fills = [];

    const stepLabel = createBodyText((i + 1).toString(), bodyTextColor);

    stepLabelWrapper.appendChild(stepLabel);
    stepsWrapper.appendChild(stepLabelWrapper);
  }

  rowsWrapper.appendChild(stepsWrapper);

  for (let i = 0; i < scalesArray.length; i += 12) {
    const row = createHStack(SPACING);
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
      tile.x = (rowIndex + 1) % 2 === 0 ? baseHSpacing + SPACING : baseHSpacing;
      // Vertical spacing (8px row height, 0px space between rows)
      // Increase with current row index
      tile.y = rowIndex * SPACING;
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
  blackWhiteScales: Variable[],
  titleTextColor: Variable,
  bodyTextColor: Variable,
  checkerBoardBaseColor: Variable,
  checkerBoardTileColor: Variable,
  mode: "LIGHT" | "DARK" = "LIGHT",
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
  if (mode === "LIGHT") sheet.fills = [figma.util.solidPaint("#FFFFFF")];
  else sheet.fills = [figma.util.solidPaint("#0B0B0B")];

  const title = createTitle(name, titleTextColor);
  const titleWrapper = createVStack(24);
  titleWrapper.name = "Header";
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

  const rowsWrapper = createVStack(SPACING);
  rowsWrapper.name = "Colors";

  const stepGroupsWrapper = createHStack(SPACING);
  stepGroupsWrapper.name = "Step groups";
  stepGroupsWrapper.paddingLeft = 120 + SPACING;
  stepGroupsWrapper.clipsContent = false;

  const backgroundsWrapper = createHStack();
  backgroundsWrapper.name = "Backgrounds";
  backgroundsWrapper.resize(SWATCH_WIDTH * 2 + SPACING, SWATCH_HEIGHT);
  createGradientBorder(backgroundsWrapper, mode);
  backgroundsWrapper.appendChild(createBodyText("Backgrounds", bodyTextColor));

  const componentsWrapper = createHStack();
  componentsWrapper.name = "Interactive components";
  componentsWrapper.resize(SWATCH_WIDTH * 3 + SPACING * 2, SWATCH_HEIGHT);
  createGradientBorder(componentsWrapper, mode);
  componentsWrapper.appendChild(
    createBodyText("Interactive components", bodyTextColor),
  );

  const bordersWrapper = createHStack();
  bordersWrapper.name = "Borders and separators";
  bordersWrapper.resize(SWATCH_WIDTH * 3 + SPACING * 2, SWATCH_HEIGHT);
  createGradientBorder(bordersWrapper, mode);
  bordersWrapper.appendChild(
    createBodyText("Borders and separators", bodyTextColor),
  );

  const solidColorsWrapper = createHStack();
  solidColorsWrapper.name = "Solid colors";
  solidColorsWrapper.resize(SWATCH_WIDTH * 2 + SPACING, SWATCH_HEIGHT);
  createGradientBorder(solidColorsWrapper, mode);
  solidColorsWrapper.appendChild(createBodyText("Solid colors", bodyTextColor));

  const accessibleTextWrapper = createHStack();
  accessibleTextWrapper.name = "Accessible text";
  accessibleTextWrapper.resize(SWATCH_WIDTH * 2 + SPACING, SWATCH_HEIGHT);
  createGradientBorder(accessibleTextWrapper, mode);
  accessibleTextWrapper.appendChild(
    createBodyText("Accessible text", bodyTextColor),
  );

  stepGroupsWrapper.appendChild(backgroundsWrapper);
  stepGroupsWrapper.appendChild(componentsWrapper);
  stepGroupsWrapper.appendChild(bordersWrapper);
  stepGroupsWrapper.appendChild(solidColorsWrapper);
  stepGroupsWrapper.appendChild(accessibleTextWrapper);

  rowsWrapper.appendChild(stepGroupsWrapper);

  const stepsWrapper = createHStack(SPACING);
  stepsWrapper.name = "Steps";
  stepsWrapper.paddingLeft = 120 + SPACING;

  for (let i = 0; i < 12; i++) {
    const stepLabelWrapper = figma.createFrame();
    stepLabelWrapper.name = (i + 1).toString();
    stepLabelWrapper.resize(SWATCH_WIDTH, SWATCH_HEIGHT);
    stepLabelWrapper.layoutMode = "HORIZONTAL";
    stepLabelWrapper.layoutSizingHorizontal = "FIXED";
    stepLabelWrapper.primaryAxisAlignItems = "CENTER";
    stepLabelWrapper.counterAxisAlignItems = "CENTER";
    stepLabelWrapper.fills = [];

    const stepLabel = createBodyText((i + 1).toString(), bodyTextColor);

    stepLabelWrapper.appendChild(stepLabel);
    stepsWrapper.appendChild(stepLabelWrapper);
  }

  rowsWrapper.appendChild(stepsWrapper);

  for (let i = 0; i < scalesArray.length; i += 12) {
    const row = createHStack(SPACING);
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

  // Create section with black and white colors
  const bwWrapper = createVStack(SPACING);
  bwWrapper.name = "Shadows, highlights, and overlays";

  const bwHeaderWrapper = createHStack();
  bwHeaderWrapper.name = "Header Wrapper";
  bwHeaderWrapper.paddingLeft = 120 + SPACING;
  bwHeaderWrapper.clipsContent = false;

  const bwHeader = createHStack(SPACING);
  bwHeader.name = "Header";
  bwHeader.counterAxisAlignItems = "CENTER";
  bwHeader.primaryAxisAlignItems = "CENTER";
  bwHeader.paddingTop = 16;
  bwHeader.paddingBottom = 16;
  createGradientBorder(bwHeader, mode);

  const bwHeaderTitle = createBodyText(
    "Shadows, highlights, and overlays",
    bodyTextColor,
  );

  bwHeader.appendChild(bwHeaderTitle);
  bwHeaderWrapper.appendChild(bwHeader);
  bwHeader.layoutSizingHorizontal = "FILL";
  bwWrapper.appendChild(bwHeaderWrapper);
  bwHeaderWrapper.layoutSizingHorizontal = "FILL";

  const bwStepsWrapper = createHStack(SPACING);
  bwStepsWrapper.name = "Steps";
  bwStepsWrapper.paddingLeft = 120 + SPACING;

  for (let i = 0; i < 12; i++) {
    const stepLabelWrapper = figma.createFrame();
    stepLabelWrapper.name = (i + 1).toString();
    stepLabelWrapper.resize(SWATCH_WIDTH, SWATCH_HEIGHT);
    stepLabelWrapper.layoutMode = "HORIZONTAL";
    stepLabelWrapper.layoutSizingHorizontal = "FIXED";
    stepLabelWrapper.primaryAxisAlignItems = "CENTER";
    stepLabelWrapper.counterAxisAlignItems = "CENTER";
    stepLabelWrapper.fills = [];

    const stepLabel = createBodyText((i + 1).toString(), bodyTextColor);

    stepLabelWrapper.appendChild(stepLabel);
    bwStepsWrapper.appendChild(stepLabelWrapper);
  }

  bwWrapper.appendChild(bwStepsWrapper);

  // Create black and white transparent color swatches
  for (let i = 0; i < blackWhiteScales.length; i += 12) {
    const row = figma.createFrame();
    row.name = getScaleName(blackWhiteScales[i].name);
    row.layoutMode = "HORIZONTAL";
    row.layoutSizingHorizontal = "HUG";
    row.layoutSizingVertical = "HUG";
    row.itemSpacing = SPACING;
    row.fills = [];

    const scaleLabel = createScaleLabel(
      getScaleName(blackWhiteScales[i].name),
      bodyTextColor,
    );
    row.appendChild(scaleLabel);

    const scaleColors = blackWhiteScales.slice(i, i + 12);

    scaleColors.forEach((color) => {
      const swatchWrapper = createSwatchFrame(checkerBoardBaseColor, "Wrapper");
      const swatch = createSwatchFrame(color, getColorName(color.name));
      const checkerboard = createCheckerboard(
        checkerBoardTileColor,
        swatchWrapper,
      );
      swatchWrapper.appendChild(checkerboard);
      swatchWrapper.appendChild(swatch);
      row.appendChild(swatchWrapper);
    });
    bwWrapper.appendChild(row);
  }
  sheet.appendChild(bwWrapper);
  bwWrapper.layoutSizingHorizontal = "FILL";

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
  labelWrapper.resize(120, SWATCH_HEIGHT);
  labelWrapper.fills = [];

  const label = createBodyText(scaleName, color);

  labelWrapper.appendChild(label);

  return labelWrapper;
};

export const createSwatchFrame = (fill: Variable, name?: string): FrameNode => {
  const swatchWrapper = figma.createFrame();
  name ? (swatchWrapper.name = name) : null;
  swatchWrapper.resize(SWATCH_WIDTH, SWATCH_HEIGHT);
  swatchWrapper.fills = [
    figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      fill,
    ),
  ];
  return swatchWrapper;
};
