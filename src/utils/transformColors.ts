export const getColorName = (str: string): string => {
  return str.replace(/^[^/]*\/[^/]*\//, "");
};

export const getScaleName = (str: string): string => {
  return str.replace(/^[^/]*\/([^/]*)\/.*$/, "$1");
};

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function createVariableName(string: string) {
  const capitalized = capitalize(string);

  // Add space between last lowercase letter and number (Amber 1)
  // add space between last lowercase letter and uppercase letter (Amber A1)
  const formattedString = capitalized
    .replace(/([a-z])(\d)/, "$1 $2")
    .replace(/([a-z])([A-Z])/, "$1 $2");

  return formattedString;
}

export function createWebSyntax(string: string) {
  // From https://github.com/radix-ui/colors/blob/8a03dad3bc93ea4ed48ce2b70847a3538097e02f/scripts/build-css-modules.js#L53
  // Adds a hyphen between the lowercase letter and digit (e.g. yellow10 -> yellow-10)
  // Then adds a hyphen before the capital letter (e.g. yellowA10 -> yellow-a10)
  const formattedString = string
    .replace(/([a-z])(\d)/, "$1-$2")
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase();
  return `--${formattedString}`;
}

export function sortColorStrings(colors: string[], order: string[]): string[] {
  const orderMap = new Map<string, number>();
  const orderAlphaMap = new Map<string, number>();
  const orderAlpha = order.map((color) => color.toLowerCase() + "A");

  order.forEach((color, index) => {
    orderMap.set(color.toLowerCase(), index);
  });

  orderAlpha.forEach((color, index) => {
    orderAlphaMap.set(color, index);
  });

  return [...colors].sort((a, b) => {
    const isAAlpha = a.endsWith("A");
    const isBAlpha = b.endsWith("A");

    // if a is not alpha, place a before b
    // if (!isAAlpha && isBAlpha) return -1;
    // // if b is alpha, place b after a
    // if (isAAlpha && !isBAlpha) return 1;
    if (isAAlpha !== isBAlpha) {
      return isAAlpha ? 1 : -1;
    }

    let orderA;
    let orderB;
    if (isAAlpha) {
      orderA = orderAlphaMap.has(a) ? orderAlphaMap.get(a)! : Infinity;
      orderB = orderAlphaMap.has(b) ? orderAlphaMap.get(b)! : Infinity;
    } else {
      orderA = orderMap.has(a) ? orderMap.get(a)! : Infinity;
      orderB = orderMap.has(b) ? orderMap.get(b)! : Infinity;
    }

    return orderA - orderB;
  });
}

export function sortColors(variables: Variable[], order: string[]): Variable[] {
  const orderMap = new Map<string, number>();
  order.forEach((color, index) => {
    orderMap.set(color, index);
  });

  return [...variables].sort((a, b) => {
    const scaleA = getScaleName(a.name);
    const scaleB = getScaleName(b.name);

    const orderA = orderMap.has(scaleA) ? orderMap.get(scaleA)! : Infinity;
    const orderB = orderMap.has(scaleB) ? orderMap.get(scaleB)! : Infinity;

    return orderA - orderB;
  });
}
