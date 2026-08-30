import fs from 'fs';

const typesContent = fs.readFileSync('./src/integrations/supabase/types.ts', 'utf8');

const tables = [];
let enums = {};

// Parse Enums
const enumsMatch = typesContent.match(/Enums:\s*{([\s\S]*?)}\s*(?:CompositeTypes|Views|Tables|Functions|$)/);
if (enumsMatch) {
  const enumsBlock = enumsMatch[1];
  const enumRegex = /([a-zA-Z0-9_]+):\s*"([^"]+)"(?:\s*\|\s*"([^"]+)")*/g;
  // This is a naive enum parser, a better way is to split by lines or use a better regex
  const enumEntries = enumsBlock.split('\n');
  let currentEnum = null;
  for (const line of enumEntries) {
    const trimmed = line.trim();
    if (trimmed.endsWith(': {') || (trimmed.includes(':') && !trimmed.includes('"'))) {
      currentEnum = trimmed.split(':')[0].trim();
      enums[currentEnum] = [];
    } else if (trimmed.includes('"') && currentEnum) {
      const vals = trimmed.match(/"([^"]+)"/g);
      if (vals) {
        vals.forEach(v => enums[currentEnum].push(v.replace(/"/g, '')));
      }
    }
  }
}

// Extract Tables block
const tablesMatch = typesContent.match(/Tables:\s*{([\s\S]*?)}\s*(?:Views:|Functions:|Enums:|CompositeTypes:)/);
if (!tablesMatch) {
    console.error("Could not find Tables block");
    process.exit(1);
}

const tablesBlock = tablesMatch[1];
let currentTable = null;
let currentSection = null;
let currentRelation = null;

const lines = tablesBlock.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect new table (e.g. `audit_findings: {`)
    // Must be indented by exactly 6 spaces
    if (line.startsWith('      ') && line.endsWith(': {') && !line.startsWith('        ')) {
        currentTable = {
            name: trimmed.replace(': {', '').trim(),
            columns: [],
            relationships: []
        };
        tables.push(currentTable);
        continue;
    }

    if (!currentTable) continue;

    // Detect section (Row, Insert, Update, Relationships)
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

fs.writeFileSync('schema_dump.json', JSON.stringify({ tables, enums }, null, 2));
console.log("Dumped schema to schema_dump.json");
