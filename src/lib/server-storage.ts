import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

export function readData<T>(filename: string, defaults: T[]): T[] {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaults, null, 2));
        return defaults;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

export function writeData<T>(filename: string, data: T[]): void {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
