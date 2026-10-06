// Re-encodes every src/assets/images/**/*_background.{jpg,jpeg,png} to a
// 1920px-wide WebP next to the original. Run with: npm run optimize-images
import {readdir, stat} from 'node:fs/promises';
import {join, parse} from 'node:path';
import sharp from 'sharp';

const ROOT = 'src/assets/images';
const MAX_WIDTH = 1920;
const QUALITY = 75;

async function* walk(dir) {
    for (const entry of await readdir(dir, {withFileTypes: true})) {
        const path = join(dir, entry.name);

        if (entry.isDirectory()) {
            yield* walk(path);
        } else {
            yield path;
        }
    }
}

for await (const file of walk(ROOT)) {
    const {dir, name, ext} = parse(file);

    if (!name.endsWith('_background') || !/^\.(jpe?g|png)$/i.test(ext)) {
        continue;
    }

    const output = join(dir, `${name}.webp`);
    const before = (await stat(file)).size;

    await sharp(file)
        .rotate()
        .resize({width: MAX_WIDTH, withoutEnlargement: true})
        .webp({quality: QUALITY})
        .toFile(output);

    const after = (await stat(output)).size;

    console.log(`${file}: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
}
