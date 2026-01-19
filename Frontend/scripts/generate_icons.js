import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Minimal 1x1 transparent PNG buffer
const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');

// Paths for the icons
const icon144 = path.join(iconsDir, 'icon-144x144.png');
const icon512 = path.join(iconsDir, 'icon-512x512.png');

// Write the files
fs.writeFileSync(icon144, pngBuffer);
fs.writeFileSync(icon512, pngBuffer);

console.log('Icons generated successfully in ' + iconsDir);
