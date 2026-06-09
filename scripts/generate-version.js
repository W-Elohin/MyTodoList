import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));
const versionJson = JSON.stringify({ version: pkg.version });
writeFileSync(join(__dirname, '../public/version.json'), versionJson);
console.log('Generated version.json:', versionJson);
