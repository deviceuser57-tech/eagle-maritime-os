import fs from 'fs';
const lines = fs.readFileSync('./src/integrations/supabase/types.ts', 'utf8').split('\n');

const tables = [];
const enums = {};
let currentTable = null;
let currentSection = null;
let currentRelation = null;

let inEnums = false;
let inTables = false;
let currentEnum = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === 'Enums: {') {
        inEnums = true;
        inTables = false;
        continue;
    }
    if (trimmed === 'Tables: {') {
        inTables = true;
        inEnums = false;
        continue;
    }
    if (trimmed === 'Views: {' || trimmed === 'CompositeTypes: {' || trimmed === 'Functions: {') {
        inEnums = false;
        inTables = false;
    }

    if (inEnums) {
        if (line.startsWith('      ') && line.endsWith(': {') && !line.startsWith('        ')) {
            currentEnum = trimmed.replace(': {', '').trim();
            enums[currentEnum] = [];
        } else if (currentEnum && trimmed.includes('"')) {
            const vals = trimmed.match(/"([^"]+)"/g);
            if (vals) {
                vals.forEach(v => enums[currentEnum].push(v.replace(/"/g, '')));
            }
        }
    }

    if (inTables) {
        if (line.startsWith('      ') && line.endsWith(': {') && !line.startsWith('        ')) {
            currentTable = {
                name: trimmed.replace(': {', '').trim(),
                columns: [],
                relationships: []
            };
            tables.push(currentTable);
            currentSection = null;
            continue;
        }

        if (!currentTable) continue;

        if (line.startsWith('        ') && line.endsWith(': {') && !line.startsWith('          ')) {
            currentSection = trimmed.replace(': {', '').trim();
            continue;
        }
        if (line.startsWith('        ') && line.endsWith(': [') && !line.startsWith('          ')) {
            currentSection = trimmed.replace(': [', '').trim(); // Relationships
            continue;
        }

        if (currentSection === 'Row') {
            if (line.startsWith('          ') && !line.startsWith('            ') && trimmed !== '}') {
                const [colName, ...rest] = trimmed.split(':');
                if (colName && rest.length > 0) {
                    let typeStr = rest.join(':').trim();
                    const isNullable = typeStr.includes('null');
                    const cleanType = typeStr.replace(/\s*\|\s*null/g, '').trim();
                    currentTable.columns.push({
                        name: colName.trim(),
                        type: cleanType,
                        nullable: isNullable
                    });
                }
            }
        } else if (currentSection === 'Relationships') {
            if (trimmed === '{') {
                currentRelation = {};
            } else if (trimmed === '}' || trimmed === '},') {
                if (currentRelation && currentRelation.foreignKeyName) {
                    currentTable.relationships.push(currentRelation);
                }
                currentRelation = null;
            } else if (currentRelation) {
                const [k, ...v] = trimmed.split(':');
                if (k && v.length > 0) {
                    const key = k.trim();
                    let val = v.join(':').trim().replace(/,$/, '').replace(/^"/, '').replace(/"$/, '');
                    if (val.startsWith('[') && val.endsWith(']')) {
                        val = val.replace(/[[\]"]/g, '').split(',').map(s => s.trim());
                    }
                    currentRelation[key] = val;
                }
            }
        }
    }
}

fs.writeFileSync('schema_dump.json', JSON.stringify({ tables, enums }, null, 2));
console.log("Dumped schema to schema_dump.json");
