import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

const icons = [
    'icon-16.svg',
    'icon-48.svg',
    'icon-128.svg',
    'icon-16-disabled.svg',
    'icon-48-disabled.svg',
    'icon-128-disabled.svg',
];

async function convertSvgToPng() {
    console.log('Converting SVG icons to PNG...');

    for (const name of icons) {
        const svgPath = path.join(iconsDir, name);
        const pngPath = path.join(iconsDir, name.replace('.svg', '.png'));

        if (!fs.existsSync(svgPath)) {
            console.warn(`⚠ ${name} not found`);
            continue;
        }

        try {
            await sharp(svgPath)
                .png()
                .toFile(pngPath);

            console.log(`✓ Converted ${name} → ${path.basename(pngPath)}`);
        } catch (error) {
            console.error(`✗ Failed to convert ${name}:`, error.message);
        }
    }

    console.log('Conversion complete!');
}

convertSvgToPng();
