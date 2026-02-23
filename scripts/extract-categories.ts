import fs from 'fs';
import path from 'path';
import { apps } from '../src/lib/data';

function sanitizeFilename(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.json';
}

const outDir = path.join(__dirname, '../src/lib/apps');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const byCategory: Record<string, typeof apps> = {};
for (const app of apps) {
    if (!byCategory[app.category]) {
        byCategory[app.category] = [];
    }
    byCategory[app.category].push(app);
}

for (const [category, categoryApps] of Object.entries(byCategory)) {
    const filename = sanitizeFilename(category);
    fs.writeFileSync(path.join(outDir, filename), JSON.stringify(categoryApps, null, 4));
    console.log(`Wrote ${filename}`);
}
