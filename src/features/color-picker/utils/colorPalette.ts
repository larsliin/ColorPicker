import { normalizeHexColor } from './colorFormats';

interface HSL {
    h: number;
    s: number;
    l: number;
}

export type SchemeMode =
    | 'monochrome'
    | 'monochrome-dark'
    | 'monochrome-light'
    | 'analogic'
    | 'complement'
    | 'analogic-complement'
    | 'triad'
    | 'quad';

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

    return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
    const hNorm = normalizeHue(h) / 360;
    const sNorm = Math.min(100, Math.max(0, s)) / 100;
    const lNorm = Math.min(100, Math.max(0, l)) / 100;

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

    const toHex = (channel: number) => Math.round(channel).toString(16).padStart(2, '0');

    return `#${toHex(rInt)}${toHex(gInt)}${toHex(bInt)}`.toUpperCase();
}

function normalizeHue(hue: number): number {
    return ((hue % 360) + 360) % 360;
}

interface ColorVariation {
    hue: number;
    saturation: number;
    lightness: number;
}

const schemeVariations: Record<Exclude<SchemeMode, 'monochrome' | 'monochrome-dark' | 'monochrome-light'>, ColorVariation[]> = {
    analogic: [
        { hue: 0, saturation: 0, lightness: 0 },
        { hue: -30, saturation: 0, lightness: -8 },
        { hue: -15, saturation: 5, lightness: 4 },
        { hue: 15, saturation: -5, lightness: -4 },
        { hue: 30, saturation: 0, lightness: 8 },
    ],
    complement: [
        { hue: 0, saturation: 0, lightness: 0 },
        { hue: 180, saturation: 0, lightness: 0 },
        { hue: 150, saturation: -5, lightness: -8 },
        { hue: 210, saturation: 5, lightness: 8 },
        { hue: 180, saturation: -10, lightness: 12 },
    ],
    'analogic-complement': [
        { hue: 0, saturation: 0, lightness: 0 },
        { hue: -30, saturation: 0, lightness: -8 },
        { hue: 30, saturation: 0, lightness: 8 },
        { hue: 150, saturation: -5, lightness: -8 },
        { hue: 180, saturation: 0, lightness: 0 },
    ],
    triad: [
        { hue: 0, saturation: 0, lightness: 0 },
        { hue: 120, saturation: 0, lightness: 0 },
        { hue: 240, saturation: 0, lightness: 0 },
        { hue: 120, saturation: -10, lightness: -12 },
        { hue: 240, saturation: -10, lightness: 12 },
    ],
    quad: [
        { hue: 0, saturation: 0, lightness: 0 },
        { hue: 90, saturation: 0, lightness: 0 },
        { hue: 180, saturation: 0, lightness: 0 },
        { hue: 270, saturation: 0, lightness: 0 },
        { hue: 90, saturation: -10, lightness: 12 },
    ],
};

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(maximum, Math.max(minimum, value));
}

export function generateColorScheme(baseHex: string, mode: SchemeMode): string[] {
    const normalizedHex = normalizeHexColor(baseHex);
    if (!normalizedHex) {
        throw new Error('Invalid hex color');
    }

    const base = hexToHsl(normalizedHex);

    if (mode === 'monochrome' || mode === 'monochrome-dark' || mode === 'monochrome-light') {
        const lightnessLevels = mode === 'monochrome'
            ? [-24, -12, 0, 12, 24].map((offset) => clamp(base.l + offset, 8, 92))
            : mode === 'monochrome-dark'
                ? [12, 22, 32, 42, 52]
                : [48, 58, 68, 78, 88];

        return lightnessLevels.map((lightness, index) => (
            mode === 'monochrome' && index === 2
                ? normalizedHex
                : hslToHex(base.h, base.s, lightness)
        ));
    }

    const baseHue = base.s === 0 ? 210 : base.h;
    const baseSaturation = base.s === 0 ? 65 : base.s;

    return schemeVariations[mode].map(({ hue, saturation, lightness }, index) => (
        index === 0
            ? normalizedHex
            : hslToHex(
                baseHue + hue,
                baseSaturation + saturation,
                base.l + lightness,
            )
    ));
}
