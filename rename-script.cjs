const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/pacpa/OneDrive/Documentos Escritorio/.0 - IRRF TRANSMITIDAS/1.BACKUP/Área de Trabalho/FAMILIA TRIBUTARIA 2026/SISTEMAS/PRIXES';

const dirsToScan = [
  path.join(projectRoot, 'src'),
  path.join(projectRoot, 'supabase'),
  path.join(projectRoot, 'public'),
];

const rootFiles = [
  path.join(projectRoot, 'index.html'),
  path.join(projectRoot, 'package.json'),
  path.join(projectRoot, 'README.md'),
];

const extensionsToScan = ['.ts', '.tsx', '.html', '.json', '.toml', '.md'];

function replaceInString(content) {
  let newContent = content;
  // Replace PRIXES
  newContent = newContent.replace(/PRIXES/g, 'CORTEXCONT');
  newContent = newContent.replace(/Prixes/g, 'CortexCont');
  newContent = newContent.replace(/prixes/g, 'cortexcont');
  
  // Replace PRAXIS
  newContent = newContent.replace(/PRAXIS/g, 'CORTEXCONT');
  newContent = newContent.replace(/Praxis/g, 'CortexCont');
  newContent = newContent.replace(/praxis/g, 'cortexcont');
  
  return newContent;
}

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!extensionsToScan.includes(ext) && !path.basename(filePath).startsWith('.env')) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = replaceInString(content);
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated content: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

function renameFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    
    const fullPath = path.join(dirPath, entry.name);
    let currentPath = fullPath;
    
    // Check if name needs rename
    if (entry.name.toLowerCase().includes('praxis') || entry.name.toLowerCase().includes('prixes')) {
      const newName = entry.name
        .replace(/praxis/g, 'cortexcont')
        .replace(/Praxis/g, 'CortexCont')
        .replace(/PRAXIS/g, 'CORTEXCONT')
        .replace(/prixes/g, 'cortexcont')
        .replace(/Prixes/g, 'CortexCont')
        .replace(/PRIXES/g, 'CORTEXCONT');
        
      const newPath = path.join(dirPath, newName);
      fs.renameSync(currentPath, newPath);
      console.log(`Renamed: ${currentPath} -> ${newPath}`);
      currentPath = newPath;
    }
    
    if (entry.isDirectory()) {
      renameFiles(currentPath);
    }
  }
}

// 1. Rename files first
console.log('Renaming files...');
for (const dir of dirsToScan) {
  renameFiles(dir);
}

// 2. Process content in directories
console.log('Processing directory contents...');
for (const dir of dirsToScan) {
  processDirectory(dir);
}

// 3. Process root files
console.log('Processing root files...');
for (const file of rootFiles) {
  if (fs.existsSync(file)) {
    processFile(file);
  }
}

console.log('Done.');
