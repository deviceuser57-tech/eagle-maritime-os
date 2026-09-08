import fs from 'fs';
import path from 'path';

const SRC_DIR = 'd:\\Eagle Maritime OS- 06-07-2026- 0135Hrs\\eagle-maritime-os\\src';
const MIGRATIONS_DIR = 'd:\\Eagle Maritime OS- 06-07-2026- 0135Hrs\\eagle-maritime-os\\supabase\\migrations';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const inputs = [];

walkDir(SRC_DIR, (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Look for form fields, inputs, selects
    const lines = content.split('\n');
    let currentComponent = path.basename(filePath, path.extname(filePath));
    
    // Basic heuristics for UI fields
    const fieldRegex = /<(Input|Select|Textarea|Checkbox|Switch|RadioGroup|Dropdown|Combobox|DatePicker)[^>]*name=["']([^"']+)["'][^>]*>/gi;
    const formFieldRegex = /<FormField[^>]*name=["']([^"']+)["'][^>]*>/gi;
    const selectRegex = /<Select[^>]*>/gi;

    let match;
    while ((match = formFieldRegex.exec(content)) !== null) {
        inputs.push({
            file: filePath.replace(SRC_DIR, ''),
            component: currentComponent,
            field: match[1],
            type: 'FormField (Unknown)',
            code: match[0].substring(0, 50)
        });
    }

    while ((match = fieldRegex.exec(content)) !== null) {
        inputs.push({
            file: filePath.replace(SRC_DIR, ''),
            component: currentComponent,
            field: match[2],
            type: match[1],
            code: match[0].substring(0, 50)
        });
    }
});

fs.writeFileSync('d:\\Eagle Maritime OS- 06-07-2026- 0135Hrs\\eagle-maritime-os\\field_inventory_raw.json', JSON.stringify(inputs, null, 2));
console.log('Done mapping UI fields. Found:', inputs.length);
