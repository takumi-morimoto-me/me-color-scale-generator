// --- Type Definitions ---
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

// --- Core Conversion Functions ---

/**
 * Converts a HEX color string to an RGB object.
 */
export const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Converts an RGB color object to a HEX string.
 */
export const rgbToHex = ({ r, g, b }: RGB): string => {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};


/**
 * Converts an RGB color object to an HSL object.
 */
export const rgbToHsl = ({ r, g, b }: RGB): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h, s, l };
};

/**
 * Converts an HSL color object to an RGB object.
 */
export const hslToRgb = ({ h, s, l }: HSL): RGB => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: r * 255,
    g: g * 255,
    b: b * 255,
  };
};

/**
 * Converts a HEX color string to an HSL object.
 */
export const hexToHsl = (hex: string): HSL | null => {
    const rgb = hexToRgb(hex);
    return rgb ? rgbToHsl(rgb) : null;
}

/**
 * Converts an HSL color object to a HEX string.
 */
export const hslToHex = (hsl: HSL): string => {
    const rgb = hslToRgb(hsl);
    return rgbToHex(rgb);
}


// --- Main Exported Functions ---

/**
 * Generates a 10-step monochromatic color scale anchored around a base HEX color.
 * The base color will be the 5th step in the scale.
 */
export const generateColorScale = (baseHex: string): string[] => {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return Array(10).fill('#000000');

  const { h, s, l: baseLightness } = rgbToHsl(rgb);
  const scale: string[] = [];
  const numSteps = 10;
  
  const baseIndex = 4;

  const maxLightness = 0.98;
  const minLightness = 0.05;

  const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

  for (let i = 0; i < numSteps; i++) {
    let l: number;

    if (i <= baseIndex) {
      // FIX: `baseIndex` is a constant with value 4, so `baseIndex === 0` is always false.
      // The unnecessary conditional logic was removed to resolve the compiler error.
      const t = i / baseIndex;
      l = lerp(maxLightness, baseLightness, t);
    } else {
      const t = (i - baseIndex) / (numSteps - 1 - baseIndex);
      l = lerp(baseLightness, minLightness, t);
    }
    
    const clampedL = Math.max(0, Math.min(1, l));

    const newRgb = hslToRgb({ h, s, l: clampedL });
    scale.push(rgbToHex(newRgb));
  }
  
  return scale;
};


/**
 * Determines whether to use light or dark text based on the background color's brightness.
 */
export const getTextColorForBackground = (baseHex: string): 'light' | 'dark' => {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return 'light';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  
  return brightness > 128 ? 'dark' : 'light';
};

/**
 * Extracts dominant colors from an image using a simplified clustering algorithm.
 */
export const extractColorsFromImage = (imageData: ImageData, count = 8): string[] => {
    const pixels = imageData.data;
    const pixelCount = pixels.length / 4;

    // Step 1: Sample pixels to reduce workload
    const sampleSize = Math.min(pixelCount, 5000);
    const sampledPixels: RGB[] = [];
    const step = Math.floor(pixelCount / sampleSize);

    for (let i = 0; i < pixelCount; i += step) {
        const offset = i * 4;
        sampledPixels.push({
            r: pixels[offset],
            g: pixels[offset + 1],
            b: pixels[offset + 2],
        });
    }
    
    // Step 2: K-means like clustering
    let centroids: RGB[] = sampledPixels.slice(0, count);
    const clusters: RGB[][] = Array.from({ length: count }, () => []);

    const distance = (a: RGB, b: RGB) => Math.sqrt(
        Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
    );

    for (let iter = 0; iter < 5; iter++) { // Iterate a few times to converge
        // Assign pixels to the nearest centroid
        clusters.forEach(c => c.length = 0);
        for (const pixel of sampledPixels) {
            let minDistance = Infinity;
            let clusterIndex = 0;
            for (let i = 0; i < count; i++) {
                const d = distance(pixel, centroids[i]);
                if (d < minDistance) {
                    minDistance = d;
                    clusterIndex = i;
                }
            }
            clusters[clusterIndex].push(pixel);
        }

        // Recalculate centroids
        for (let i = 0; i < count; i++) {
            if (clusters[i].length > 0) {
                const sum = clusters[i].reduce((acc, p) => ({
                    r: acc.r + p.r,
                    g: acc.g + p.g,
                    b: acc.b + p.b,
                }), { r: 0, g: 0, b: 0 });
                centroids[i] = {
                    r: sum.r / clusters[i].length,
                    g: sum.g / clusters[i].length,
                    b: sum.b / clusters[i].length,
                };
            }
        }
    }

    // Step 3: Convert centroids to hex
    return centroids.map(rgbToHex);
};
