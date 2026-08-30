import fs from 'fs';
import path from 'path';

const SRC_DIR = 'd:\\Eagle Maritime OS- 06-07-2026- 0135Hrs\\eagle-maritime-os\\src';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const fields = [];
const components = new Set();
const forms = new Set();
const setupSources = new Set();

walkDir(SRC_DIR, (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const componentName = path.basename(filePath, path.extname(filePath));
    
    // Better regex for finding input fields
    // We look for common input components in JSX
    const tagRegex = /<(Input|Select|Textarea|Checkbox|Switch|RadioGroup|Dropdown|Combobox|DatePicker|FormField|Autocomplete|MultiSelect)([\s\S]*?)>/gi;
    
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
        const tag = match[1];
        const props = match[2];
        
        let nameMatch = props.match(/(?:name|id)=["']([^"']+)["']/i);
        let labelMatch = props.match(/label=["']([^"']+)["']/i);
        
        // FormField in shadcn/react-hook-form usually has name
        // Sometimes name is passed as {name} dynamically
        
        fields.push({
            file: filePath.replace(SRC_DIR, ''),
            component: componentName,
            tag: tag,
            name: nameMatch ? nameMatch[1] : 'Unknown',
            label: labelMatch ? labelMatch[1] : 'Unknown',
            isDropdown: ['Select', 'Dropdown', 'Combobox', 'Autocomplete'].includes(tag),
            fullMatch: match[0].substring(0, 100).replace(/\s+/g, ' ')
        });
    }
});

fs.writeFileSync('d:\\Eagle Maritime OS- 06-07-2026- 0135Hrs\\eagle-maritime-os\\audit_fields.json', JSON.stringify(fields, null, 2));
console.log('Found', fields.length, 'fields.');
