import { descriptions } from "./data/descriptions";
import * as allColors from "./data/scales";
import { scalesOrder } from "./data/scalesOrder";
import {
  createAlphaColorSheet,
  createSolidColorSheet,
} from "./utils/createNodes";
import { parseHex, parseRgba } from "./utils/parseColors";
import {
  capitalize,
  createVariableName,
  createWebSyntax,
  sortColors,
  sortColorStrings,
} from "./utils/transformColors";

export default async function () {
  try {
    // -------------------------------------------------------------------------
    // Create variables
    // -------------------------------------------------------------------------

    const notification = figma.notify("Generating color variables…");
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create a variable collection "Colors" with two modes: "Light" and "Dark"
    const collection = figma.variables.createVariableCollection("Radix Colors");
    collection.renameMode(collection.modes[0].modeId, "Light");
    const lightModeId = collection.modes[0].modeId;
    const darkModeId = collection.addMode("Dark");

    // Holds references to created variables to avoid duplicates
    const createdVariablesMap: Map<string, Variable> = new Map();

    // Remove P3 and BW alpha scales
    const filteredColors = Object.keys(allColors).filter(
      (key) =>
        !key.includes("P3") && !key.includes("white") && !key.includes("black"),
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
          variable.description = name.includes("black")
            ? "Shadows and overlays"
            : "Highlights and overlays";
        });
      });
    notification.cancel();

    // -------------------------------------------------------------------------
    // Render color sample sheets
    // -------------------------------------------------------------------------

    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

    const colorSheetsNotification = figma.notify("Creating color sheets…");
    await new Promise((resolve) => setTimeout(resolve, 100));

    const localColorVariables =
      await figma.variables.getLocalVariablesAsync("COLOR");

    const isSolidColor = (variable: { name: string }) =>
      !variable.name.includes("Alpha");

    const isAlphaColor = (variable: { name: string }) =>
      variable.name.includes("Alpha") &&
      !variable.name.includes("Black") &&
      !variable.name.includes("White");

    const solidColors = sortColors(
      localColorVariables.filter(isSolidColor),
      scalesOrder,
    );

    const alphaColors = sortColors(
      localColorVariables.filter(isAlphaColor),
      scalesOrder,
    );

    const blackWhiteColors = localColorVariables.filter(
      (variable) => !isSolidColor(variable) && !isAlphaColor(variable),
    );

    // Colors for use in the "style guide"
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

    // Create sheet with solid colors
    const solidColorsSheet = createSolidColorSheet(
      "Colors",
      solidColors,
      colorTextPrimary,
      colorTextSecondary,
    );

    const solidColorsSheetDarkMode = createSolidColorSheet(
      "Dark colors",
      solidColors,
      colorTextPrimary,
      colorTextSecondary,
      "DARK",
    );
    solidColorsSheetDarkMode.setExplicitVariableModeForCollection(
      collection,
      darkModeId,
    );
    solidColorsSheetDarkMode.y = solidColorsSheet.height + 128;

    // Create sheet with transparent colors
    const alphaColorsSheet = createAlphaColorSheet(
      "Transparent colors",
      alphaColors,
      blackWhiteColors,
      colorTextPrimary,
      colorTextSecondary,
      colorCheckerboardTileBase,
      colorCheckerboardTileContrast,
    );
    alphaColorsSheet.x = solidColorsSheet.width + 128;

    const alphaColorsSheetDarkMode = createAlphaColorSheet(
      "Transparent colors",
      alphaColors,
      blackWhiteColors,
      colorTextPrimary,
      colorTextSecondary,
      colorCheckerboardTileBase,
      colorCheckerboardTileContrast,
      "DARK",
    );
    alphaColorsSheetDarkMode.setExplicitVariableModeForCollection(
      collection,
      darkModeId,
    );
    alphaColorsSheetDarkMode.x = alphaColorsSheet.x;
    alphaColorsSheetDarkMode.y = alphaColorsSheet.height + 128;

    colorSheetsNotification.cancel();

    // -------------------------------------------------------------------------
    // CLOSE PLUGIN
    // -------------------------------------------------------------------------
    figma.closePlugin();
  } catch (error) {
    console.log(error);
  }
}
