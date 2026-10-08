// A minimal .xlsx reader for the site's Google Sheets exports. It replaces ExcelJS
// (~1 MB) and reads only what the site uses: the first sheet's cell values and
// the images placed on it. An .xlsx file is a zip of XML parts; the browser
// unzips them with DecompressionStream and parses them with DOMParser.

export type SheetValue = string | number | null;

export type SheetImage = {
    // 1-based row of the cell the image's top-left corner is anchored to.
    row: number;
    blob: Blob;
};

export type Sheet = {
    // rows[row - 1][col - 1]; missing rows and cells are empty / null.
    rows: SheetValue[][];
    // In the order they appear in the sheet's drawing.
    images: SheetImage[];
};

const MIME_TYPES: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
};

export async function readFirstSheet(data: ArrayBuffer): Promise<Sheet> {
    const zip = new Zip(data);

    const workbookRels = await readRels(zip, 'xl/workbook.xml');
    const firstSheet = byTag(await readXml(zip, 'xl/workbook.xml'), 'sheet')[0];
    const sheetPath = workbookRels.get(firstSheet?.getAttributeNS(REL_NS, 'id') ?? '');

    if (!sheetPath) {
        throw new Error('xlsx: workbook has no sheets');
    }

    const sharedStringsPath = [...workbookRels.values()].find(path => path.endsWith('/sharedStrings.xml'));
    const sharedStrings = sharedStringsPath && zip.has(sharedStringsPath)
        ? byTag(await readXml(zip, sharedStringsPath), 'si').map(textOf)
        : [];

    return {
        rows: readRows(await readXml(zip, sheetPath), sharedStrings),
        images: await readImages(zip, sheetPath)
    };
}

const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

function readRows(sheet: Document, sharedStrings: string[]): SheetValue[][] {
    const rows: SheetValue[][] = [];

    for (const rowElement of byTag(sheet, 'row')) {
        const rowIndex = Number(rowElement.getAttribute('r')) - 1;
        const row: SheetValue[] = rows[rowIndex] = [];

        for (const cell of byTag(rowElement, 'c')) {
            row[columnIndex(cell.getAttribute('r') ?? '')] = cellValue(cell, sharedStrings);
        }
    }

    // Fill the gaps so rows[i] and rows[i][j] are always safe to read.
    return Array.from(rows, row => Array.from(row ?? [], value => value ?? null));
}

function cellValue(cell: Element, sharedStrings: string[]): SheetValue {
    const value = byTag(cell, 'v')[0]?.textContent ?? null;

    switch (cell.getAttribute('t')) {
        case 's':
            return value === null ? null : sharedStrings[Number(value)] ?? null;
        case 'inlineStr':
            return textOf(byTag(cell, 'is')[0]);
        case 'str':
            return value;
        case 'b':
        case 'e':
            return null;
        default:
            return value === null || value === '' ? null : Number(value);
    }
}

// "AB12" -> 27
function columnIndex(reference: string): number {
    let index = 0;

    for (const char of reference.match(/^[A-Z]+/)?.[0] ?? '') {
        index = index * 26 + char.charCodeAt(0) - 64;
    }

    return index - 1;
}

// Text of a shared or inline string, joining rich-text runs and skipping
// phonetic hints.
function textOf(element: Element | undefined): string {
    return byTag(element, 't')
        .filter(t => t.parentElement?.localName !== 'rPh')
        .map(t => t.textContent ?? '')
        .join('');
}

async function readImages(zip: Zip, sheetPath: string): Promise<SheetImage[]> {
    const sheetRels = await readRels(zip, sheetPath);
    const drawingPath = [...sheetRels.values()].find(path => path.includes('/drawings/'));

    if (!drawingPath || !zip.has(drawingPath)) {
        return [];
    }

    const drawingRels = await readRels(zip, drawingPath);
    const images: SheetImage[] = [];

    for (const anchor of byTag(await readXml(zip, drawingPath), '*')) {
        if (anchor.localName !== 'oneCellAnchor' && anchor.localName !== 'twoCellAnchor') {
            continue;
        }

        const row = byTag(byTag(anchor, 'from')[0], 'row')[0]?.textContent;
        const mediaPath = drawingRels.get(byTag(anchor, 'blip')[0]?.getAttributeNS(REL_NS, 'embed') ?? '');

        if (row && mediaPath && zip.has(mediaPath)) {
            const extension = mediaPath.split('.').pop()!.toLowerCase();

            images.push({
                row: Number(row) + 1,
                blob: new Blob([await zip.read(mediaPath)], { type: MIME_TYPES[extension] ?? '' })
            });
        }
    }

    return images;
}

// Relationship id -> full zip path of the target, for the given part.
async function readRels(zip: Zip, partPath: string): Promise<Map<string, string>> {
    const directory = partPath.slice(0, partPath.lastIndexOf('/') + 1);
    const relsPath = `${directory}_rels/${partPath.slice(directory.length)}.rels`;
    const rels = new Map<string, string>();

    if (!zip.has(relsPath)) {
        return rels;
    }

    for (const rel of byTag(await readXml(zip, relsPath), 'Relationship')) {
        rels.set(rel.getAttribute('Id') ?? '', resolvePath(directory, rel.getAttribute('Target') ?? ''));
    }

    return rels;
}

function resolvePath(directory: string, target: string): string {
    const parts = target.startsWith('/') ? [] : directory.split('/').filter(Boolean);

    for (const part of target.split('/')) {
        if (part === '..') {
            parts.pop();
        } else if (part && part !== '.') {
            parts.push(part);
        }
    }

    return parts.join('/');
}

async function readXml(zip: Zip, path: string): Promise<Document> {
    const text = new TextDecoder().decode(await zip.read(path));

    return new DOMParser().parseFromString(text, 'application/xml');
}

function byTag(parent: Document | Element | undefined, localName: string): Element[] {
    return parent ? [...parent.getElementsByTagNameNS('*', localName)] : [];
}


// Reads entries from a zip archive via its central directory.
class Zip {
    private readonly entries = new Map<string, { offset: number; method: number; size: number }>();
    private readonly view: DataView;

    constructor(private readonly data: ArrayBuffer) {
        this.view = new DataView(data);

        // The end-of-central-directory record sits in the last 22 bytes plus an optional comment.
        let end = data.byteLength - 22;

        while (end >= 0 && this.view.getUint32(end, true) !== 0x06054b50) {
            end--;
        }

        if (end < 0) {
            throw new Error('xlsx: not a zip file');
        }

        const decoder = new TextDecoder();
        const count = this.view.getUint16(end + 10, true);
        let position = this.view.getUint32(end + 16, true);

        for (let i = 0; i < count; i++) {
            const nameLength = this.view.getUint16(position + 28, true);
            const name = decoder.decode(new Uint8Array(data, position + 46, nameLength));

            this.entries.set(name, {
                method: this.view.getUint16(position + 10, true),
                size: this.view.getUint32(position + 20, true),
                offset: this.view.getUint32(position + 42, true)
            });

            position += 46 + nameLength + this.view.getUint16(position + 30, true) + this.view.getUint16(position + 32, true);
        }
    }

    has(path: string): boolean {
        return this.entries.has(path);
    }

    async read(path: string): Promise<Uint8Array<ArrayBuffer>> {
        const entry = this.entries.get(path);

        if (!entry) {
            throw new Error(`xlsx: missing ${path}`);
        }

        // The local header's name and extra field lengths can differ from the central directory's.
        const start = entry.offset + 30 + this.view.getUint16(entry.offset + 26, true) + this.view.getUint16(entry.offset + 28, true);
        const bytes = new Uint8Array(this.data, start, entry.size);

        if (entry.method === 0) {
            return bytes.slice();
        }

        if (entry.method !== 8) {
            throw new Error(`xlsx: unsupported compression in ${path}`);
        }

        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));

        return new Uint8Array(await new Response(stream).arrayBuffer());
    }
}
