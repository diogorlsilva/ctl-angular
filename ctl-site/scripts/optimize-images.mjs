// Builds the deployed images in src/assets/images from the originals in raw-images:
//   <section>/<name>_background.{jpg,png}  ->  <name>_background.webp (1920w) and <name>_background-960.webp
//   <section>/<name>_logo.{jpg,png}        ->  <name>_logo.webp (400w, never enlarged)
// Run with: npm run optimize-images
import { mkdir, readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SOURCE = 'raw-images';
const TARGET = 'src/assets/images';
const QUALITY = 75;

async function* walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);

        if (entry.isDirectory()) {
            yield* walk(path);
        } else {
            yield path;
        }
    }
}

async function encode(file, output, width) {
    await sharp(file)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(output);

    console.log(`${output}: ${Math.round((await stat(output)).size / 1024)} kB`);
}

for await (const file of walk(SOURCE)) {
    const { dir, name, ext } = parse(file);

    if (!/^\.(jpe?g|png)$/i.test(ext)) {
        continue;
    }

    const outDir = dir.replace(SOURCE, TARGET);
    await mkdir(outDir, { recursive: true });

    if (name.endsWith('_background')) {
        await encode(file, join(outDir, `${name}.webp`), 1920);
        await encode(file, join(outDir, `${name}-960.webp`), 960);
    } else if (name.endsWith('_logo')) {
        await encode(file, join(outDir, `${name}.webp`), 400);
    }
}
