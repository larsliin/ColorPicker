import { normalizeHexColor } from './colorFormats';

interface HSL {
    h: number;
    s: number;
    l: number;
}

export type SchemeType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary';

function hexToHsl(hex: string): HSL {
    const normalized = normalizeHexColor(hex);
    if (!normalized) {
        throw new Error('Invalid hex color');
    }

    const r = Number.parseInt(normalized.slice(1, 3), 16) / 255;
    const g = Number.parseInt(normalized.slice(3, 5), 16) / 255;
    const b = Number.parseInt(normalized.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const diff = max - min;

    let h = 0;
    let s = 0;

    if (diff !== 0) {
        s = diff / (1 - Math.abs(2 * l - 1));
        switch (max) {
            case r:
                h = ((g - b) / diff) % 6;
                break;
            case g:
                h = (b - r) / diff + 2;
                break;
            default:
                h = (r - g) / diff + 4;
        }
        h = h * 60;
        if (h < 0) h += 360;
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const hp = hNorm * 6;
    const x = c * (1 - Math.abs((hp % 2) - 1));

    let r = 0;
    let g = 0;
    let b = 0;

    if (hp >= 0 && hp < 1) {
        r = c;
        g = x;
    } else if (hp >= 1 && hp < 2) {
        r = x;
        g = c;
    } else if (hp >= 2 && hp < 3) {
        g = c;
        b = x;
    } else if (hp >= 3 && hp < 4) {
        g = x;
        b = c;
    } else if (hp >= 4 && hp < 5) {
        r = x;
        b = c;
    } else if (hp >= 5 && hp < 6) {
        r = c;
        b = x;
    }

    const m = lNorm - c / 2;
    const rInt = Math.round((r + m) * 255);
    const gInt = Math.round((g + m) * 255);
    const bInt = Math.round((b + m) * 255);

    const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };

    return `#${toHex(rInt)}${toHex(gInt)}${toHex(bInt)}`.toUpperCase();
}

function normalizeHue(hue: number): number {
    let normalized = hue % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
}

export function generateColorScheme(baseHex: string, schemeType: SchemeType): string[] {
    const hsl = hexToHsl(baseHex);

    const colors: string[] = [baseHex];

    switch (schemeType) {
        case 'complementary': {
            const complementaryHue = normalizeHue(hsl.h + 180);
            colors.push(hslToHex(complementaryHue, hsl.s, hsl.l));
            break;
        }

        case 'analogous': {
            const analogous1 = normalizeHue(hsl.h + 30);
            const analogous2 = normalizeHue(hsl.h - 30);
            colors.push(hslToHex(analogous1, hsl.s, hsl.l));
            colors.push(hslToHex(analogous2, hsl.s, hsl.l));
            break;
        }

        case 'triadic': {
            const triadic1 = normalizeHue(hsl.h + 120);
            const triadic2 = normalizeHue(hsl.h + 240);
            colors.push(hslToHex(triadic1, hsl.s, hsl.l));
            colors.push(hslToHex(triadic2, hsl.s, hsl.l));
            break;
        }

        case 'tetradic': {
            const tetradic1 = normalizeHue(hsl.h + 90);
            const tetradic2 = normalizeHue(hsl.h + 180);
            const tetradic3 = normalizeHue(hsl.h + 270);
            colors.push(hslToHex(tetradic1, hsl.s, hsl.l));
            colors.push(hslToHex(tetradic2, hsl.s, hsl.l));
            colors.push(hslToHex(tetradic3, hsl.s, hsl.l));
            break;
        }

        case 'split-complementary': {
            const split1 = normalizeHue(hsl.h + 150);
            const split2 = normalizeHue(hsl.h + 210);
            colors.push(hslToHex(split1, hsl.s, hsl.l));
            colors.push(hslToHex(split2, hsl.s, hsl.l));
            break;
        }
    }

    return colors;
}
