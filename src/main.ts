import * as allColors from "./colors/values";
import {
  capitalize,
  createVariableName,
  createWebSyntax,
  parseHex,
  parseRgba,
  getScaleName,
  getColorName,
  sortColors,
  sortColorStrings,
} from "./utils/generic";
import { descriptions } from "./colors/descriptions";
import { scalesOrder } from "./colors/scalesOrder";
import {
  createTitle,
  createBodyText,
  createColorSheet,
  createHStack,
  createVStack,
  createSwatchFrame,
} from "./utils/createFrames";

export default async function () {
  try {
    const localCollections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const collectionNames = localCollections.map(
      (collection) => collection.name,
    );

    // -------------------------------------------------------------------------
    // Create variables
    // -------------------------------------------------------------------------

    if (!collectionNames.includes("Colors")) {
      const notification = figma.notify("Generating color variables…");
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create a variable collection "Colors" with two modes: "Light" and "Dark"
      const collection = figma.variables.createVariableCollection("Colors");
      collection.renameMode(collection.modes[0].modeId, "Light");
      const lightModeId = collection.modes[0].modeId;
      const darkModeId = collection.addMode("Dark");

      // Holds references to created variables to avoid duplicates
      const createdVariablesMap: Map<string, Variable> = new Map();

      // Remove P3 and BW alpha scales
      const filteredColors = Object.keys(allColors).filter(
        (key) =>
          !key.includes("P3") &&
          !key.includes("white") &&
          !key.includes("black"),
      );

      const sortedColorStrings = sortColorStrings(filteredColors, scalesOrder);

      sortedColorStrings.forEach((key) => {
        // scales[0] = "amber"
        // scales[1] = { amber1: "#fefdfb", ...}
        const scales = Object.entries(allColors).find(
          ([name]) => name === key,
        ) as [string, Record<string, string>];
        Object.entries(scales[1]).forEach(([colorStep, value]) => {
          const variable = createdVariablesMap.get(colorStep);
          // Check if variable already exists
          if (!createdVariablesMap.has(colorStep)) {
            if (colorStep.includes("A")) {
              // Create variables for transparent colors (e.g. amberA1)
              const variable = figma.variables.createVariable(
                // Variable path and name in Figma will look like this:
                // Colors/Alpha/Amber/Amber A1
                `Alpha/${capitalize(scales[0].slice(0, -1))}/${createVariableName(colorStep)}`,
                collection,
                "COLOR",
              );
              // Set light mode values for transparent colors
              createdVariablesMap.set(colorStep, variable);
              variable.setValueForMode(lightModeId, parseHex(value));
            } else if (!colorStep.includes("A")) {
              // Create variables for solid colors (e.g. amber1)
              const variable = figma.variables.createVariable(
                // Variable path and name in Figma will look like this:
                // Colors/Solid/Amber/Amber 1
                `Solid/${capitalize(scales[0])}/${createVariableName(colorStep)}`,
                collection,
                "COLOR",
              );
              // Set light mode values for solid colors
              createdVariablesMap.set(colorStep, variable);
              variable.setValueForMode(lightModeId, parseHex(value));
            }
          } else if (createdVariablesMap.has(colorStep)) {
            // Go through all colors again and set dark mode values
            variable?.setValueForMode(darkModeId, parseHex(value));
          }
          // Regex to get scale from 1 to 12, to use it to get the corresponding variable description
          const regex = /-?\d+(\.\d+)?/g;
          const scale = colorStep.match(regex)![0];
          if (variable) {
            variable.setVariableCodeSyntax("WEB", createWebSyntax(colorStep));
            variable.description = descriptions.get(parseInt(scale)) ?? "";
          }
        });
      });

      // Create variables for Black and White transparent colors
      Object.keys(allColors)
        .filter(
          (key) =>
            (!key.includes("P3") && key === "whiteA") ||
            (!key.includes("P3") && key === "blackA"),
        )
        .forEach((key) => {
          const values = Object.entries(allColors).find(
            ([name]) => name === key,
          )!;
          Object.entries(values[1]).forEach(([name, value]) => {
            const groupName = capitalize(name)
              .replace(/(\d)/g, "")
              .replace(/([a-z])([A-Z])/, "$1");
            const variable = figma.variables.createVariable(
              `Alpha/${groupName}/${createVariableName(name)}`,
              collection,
              "COLOR",
            );
            createdVariablesMap.set(name, variable);
            variable.setValueForMode(lightModeId, parseRgba(value));
            variable.setValueForMode(darkModeId, parseRgba(value));
            variable.setVariableCodeSyntax("WEB", createWebSyntax(name));
          });
        });
      notification.cancel();
    }

    // -------------------------------------------------------------------------
    // Render color sample sheets
    // -------------------------------------------------------------------------

    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

    const swatchWidth = 96;
    const swatchHeight = 48;
    const gridSpacing = 8;

    // -------------------------------------------------------------------------
    // Get and sort local color variables

    const localColorVariables =
      await figma.variables.getLocalVariablesAsync("COLOR");

    const notification = figma.notify("Creating color sheets…");
    await new Promise((resolve) => setTimeout(resolve, 100));

    const solidColors = localColorVariables.filter(
      (variable) => !variable.name.includes("Alpha"),
    );

    const alphaColors = localColorVariables.filter(
      (variable) =>
        variable.name.includes("Alpha") &&
        !variable.name.includes("Black") &&
        !variable.name.includes("White"),
    );

    const blackWhiteColors = localColorVariables.filter(
      (variable) =>
        variable.name.includes("Black") || variable.name.includes("White"),
    );

    const sortedSolidColors = sortColors(solidColors, scalesOrder);
    const sortedAlphaColors = sortColors(alphaColors, scalesOrder);

    // -------------------------------------------------------------------------
    // Colors for use in the file

    const colorGray1 = localColorVariables.find(
      (variable) => variable.name === "Solid/Gray/Gray 1",
    )!;

    const colorGray5 = localColorVariables.find(
      (variable) => variable.name === "Solid/Gray/Gray 5",
    )!;

    const colorCheckerboardTileContrast = colorGray5;
    const colorCheckerboardTileBase = colorGray1;

    const colorTextPrimary = localColorVariables.find(
      (variable) => variable.name === "Solid/Gray/Gray 12",
    )!;

    const colorTextSecondary = localColorVariables.find(
      (variable) => variable.name === "Solid/Gray/Gray 11",
    )!;

    // -------------------------------------------------------------------------
    // Create sheet with solid colors
    const solidColorsTitle = createTitle("Colors", colorTextPrimary);
    const solidColorsSheet = createColorSheet("Colors");
    solidColorsSheet.appendChild(solidColorsTitle);

    const rowsWrapper = createVStack(gridSpacing);
    rowsWrapper.name = "Colors";

    const stepsWrapper = createHStack(gridSpacing);
    stepsWrapper.name = "Steps";
    stepsWrapper.paddingLeft = 120 + gridSpacing;

    for (let i = 0; i < 12; i++) {
      const stepLabelWrapper = figma.createFrame();
      stepLabelWrapper.resize(swatchWidth, swatchHeight);
      stepLabelWrapper.layoutMode = "HORIZONTAL";
      stepLabelWrapper.layoutSizingHorizontal = "FIXED";
      stepLabelWrapper.primaryAxisAlignItems = "CENTER";
      stepLabelWrapper.counterAxisAlignItems = "CENTER";

      const stepLabel = createBodyText((i + 1).toString(), colorTextSecondary);

      stepLabelWrapper.appendChild(stepLabel);
      stepsWrapper.appendChild(stepLabelWrapper);
    }

    rowsWrapper.appendChild(stepsWrapper);

    // -------------------------------------------------------------------------
    // Create solid color swatches

    for (let i = 0; i < solidColors.length; i += 12) {
      const row = createHStack(gridSpacing);
      row.name = getScaleName(sortedSolidColors[i].name);

      const rowLabelWrapper = figma.createFrame();
      rowLabelWrapper.name = "Label";
      rowLabelWrapper.layoutMode = "HORIZONTAL";
      rowLabelWrapper.layoutSizingHorizontal = "FIXED";
      rowLabelWrapper.counterAxisAlignItems = "CENTER";
      rowLabelWrapper.resize(120, swatchHeight);
      rowLabelWrapper.fills = [];

      const rowLabel = createBodyText(
        getScaleName(sortedSolidColors[i].name),
        colorTextSecondary,
      );

      rowLabelWrapper.appendChild(rowLabel);
      row.appendChild(rowLabelWrapper);

      const rowColors = sortedSolidColors.slice(i, i + 12);
      rowColors.forEach((color) => {
        const swatch = figma.createFrame();
        swatch.resize(swatchWidth, swatchHeight);
        swatch.name = getColorName(color.name);
        swatch.fills = [
          figma.variables.setBoundVariableForPaint(
            { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
            "color",
            color,
          ),
        ];

        row.appendChild(swatch);
      });
      rowsWrapper.appendChild(row);
    }
    solidColorsSheet.appendChild(rowsWrapper);

    // -------------------------------------------------------------------------
    // Create sheet with transparent colors

    const alphaColorsTitle = createTitle(
      "Transparent colors",
      colorTextPrimary,
    );
    const alphaColorsSheet = createColorSheet("Transparent colors");
    alphaColorsSheet.appendChild(alphaColorsTitle);
    alphaColorsSheet.x = solidColorsSheet.width + 128;

    // -------------------------------------------------------------------------
    // Create checkerboard pattern

    const createCheckerboard = (parent: FrameNode) => {
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
          colorCheckerboardTileContrast,
        ),
      ];
      return checkerboard;
    };

    // -------------------------------------------------------------------------
    // Create transparent color swatches

    const alphaRowsWrapper = createVStack(gridSpacing);
    alphaRowsWrapper.name = "Transparent colors";

    for (let i = 0; i < alphaColors.length; i += 12) {
      const row = createHStack(gridSpacing);
      row.name = getScaleName(sortedAlphaColors[i].name);
      const scaleColors = sortedAlphaColors.slice(i, i + 12);

      scaleColors.forEach((color) => {
        const swatchWrapper = createSwatchFrame(
          colorCheckerboardTileBase,
          "Wrapper",
        );
        const swatch = createSwatchFrame(color, getColorName(color.name));
        const checkerboard = createCheckerboard(swatchWrapper);
        swatchWrapper.appendChild(checkerboard);
        swatchWrapper.appendChild(swatch);
        row.appendChild(swatchWrapper);
      });

      alphaRowsWrapper.appendChild(row);
    }
    alphaColorsSheet.appendChild(alphaRowsWrapper);

    const bwWrapper = createVStack(gridSpacing);
    bwWrapper.name = "Shadows, highlights, and overlays";

    const bwHeaderWrapper = createHStack(gridSpacing);
    bwHeaderWrapper.name = "Header";
    bwHeaderWrapper.counterAxisAlignItems = "CENTER";
    bwHeaderWrapper.primaryAxisAlignItems = "CENTER";
    bwHeaderWrapper.paddingTop = 16;
    bwHeaderWrapper.paddingBottom = 16;

    const bwHeaderTitle = createBodyText(
      "Shadows, highlights, and overlays",
      colorTextSecondary,
    );

    bwHeaderWrapper.appendChild(bwHeaderTitle);
    bwWrapper.appendChild(bwHeaderWrapper);
    bwHeaderWrapper.layoutSizingHorizontal = "FILL";

    const bwStepsWrapper = createHStack(gridSpacing);
    bwStepsWrapper.name = "Steps";

    for (let i = 0; i < 12; i++) {
      const stepLabelWrapper = figma.createFrame();
      stepLabelWrapper.name = (i + 1).toString();
      stepLabelWrapper.resize(swatchWidth, swatchHeight);
      stepLabelWrapper.layoutMode = "HORIZONTAL";
      stepLabelWrapper.layoutSizingHorizontal = "FIXED";
      stepLabelWrapper.primaryAxisAlignItems = "CENTER";
      stepLabelWrapper.counterAxisAlignItems = "CENTER";

      const stepLabel = createBodyText((i + 1).toString(), colorTextSecondary);

      stepLabelWrapper.appendChild(stepLabel);
      bwStepsWrapper.appendChild(stepLabelWrapper);
    }

    bwWrapper.appendChild(bwStepsWrapper);

    // -------------------------------------------------------------------------
    // Create black and white transparent color swatches

    for (let i = 0; i < blackWhiteColors.length; i += 12) {
      const row = figma.createFrame();
      row.name = getScaleName(blackWhiteColors[i].name);
      row.layoutMode = "HORIZONTAL";
      row.layoutSizingHorizontal = "HUG";
      row.layoutSizingVertical = "HUG";
      row.itemSpacing = gridSpacing;
      row.fills = [];

      const scaleColors = blackWhiteColors.slice(i, i + 12);

      scaleColors.forEach((color) => {
        const swatchWrapper = createSwatchFrame(
          colorCheckerboardTileBase,
          "Wrapper",
        );
        const swatch = createSwatchFrame(color, getColorName(color.name));
        const checkerboard = createCheckerboard(swatchWrapper);
        swatchWrapper.appendChild(checkerboard);
        swatchWrapper.appendChild(swatch);
        row.appendChild(swatchWrapper);
      });
      bwWrapper.appendChild(row);
    }
    alphaColorsSheet.appendChild(bwWrapper);

    notification.cancel();

    // -------------------------------------------------------------------------
    // CLOSE PLUGIN
    // -------------------------------------------------------------------------
    figma.closePlugin();
  } catch (error) {
    console.log(error);
  }
}
