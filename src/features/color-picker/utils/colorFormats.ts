import type { ColorFormat } from '../types';

export function normalizeHexColor(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const digits = value.startsWith('#') ? value.slice(1) : value;
    return /^[\da-f]{6}$/i.test(digits) ? `#${digits.toUpperCase()}` : null;
}

export function getColorFormats(hex: string): ColorFormat[] {
    const normalizedHex = normalizeHexColor(hex);
    if (!normalizedHex) {
        return [];
    }

    const red = Number.parseInt(normalizedHex.slice(1, 3), 16);
    const green = Number.parseInt(normalizedHex.slice(3, 5), 16);
    const blue = Number.parseInt(normalizedHex.slice(5, 7), 16);
    const redNormalized = red / 255;
    const greenNormalized = green / 255;
    const blueNormalized = blue / 255;
    const maximum = Math.max(redNormalized, greenNormalized, blueNormalized);
    const minimum = Math.min(redNormalized, greenNormalized, blueNormalized);
    const difference = maximum - minimum;
    const lightness = (maximum + minimum) / 2;
    let hue = 0;
    let saturation = 0;

    if (difference !== 0) {
        saturation = difference / (1 - Math.abs(2 * lightness - 1));

        switch (maximum) {
            case redNormalized:
                hue = ((greenNormalized - blueNormalized) / difference) % 6;
                break;
            case greenNormalized:
                hue = (blueNormalized - redNormalized) / difference + 2;
                break;
            default:
                hue = (redNormalized - greenNormalized) / difference + 4;
        }

        hue = Math.round(hue * 60);
        if (hue < 0) hue += 360;
    }

    return [
        { name: 'HEX', value: normalizedHex },
        { name: 'RGB', value: `rgb(${red}, ${green}, ${blue})` },
        {
            name: 'HSL',
            value: `hsl(${hue}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`,
        },
    ];
}
