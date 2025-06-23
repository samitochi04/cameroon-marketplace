const fs = require('fs');
const path = require('path');

// Problematic icon imports to search for
const problematicIcons = ['ZapFast', 'Lightning'];

// Valid replacement icon
const replacementIcon = 'Bolt';

function searchFilesForProblematicIcons(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      // Recursively search directories
      searchFilesForProblematicIcons(fullPath);
    } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js') || file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      // Read file content
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for problematic imports
      let hasProblematic = false;
      for (const icon of problematicIcons) {
        if (content.includes(icon)) {
          console.log(`Found problematic icon '${icon}' in ${fullPath}`);
          hasProblematic = true;
        }
      }
      
      // If found, replace with valid icon
      if (hasProblematic) {
        let updatedContent = content;
        
        // Replace imports
        for (const icon of problematicIcons) {
          const importRegex = new RegExp(`(import [^;]*)(${icon})([^;]*from ['"]lucide-react['"])`, 'g');
          updatedContent = updatedContent.replace(importRegex, (match, before, icon, after) => {
            // Check if Bolt is already in the import
            if (!match.includes('Bolt')) {
              return `${before}${replacementIcon}${after}`;
            }
            // If Bolt is already there, just remove the problematic icon
            return match.replace(`, ${icon}`, '').replace(`${icon}, `, '');
          });
        }
        
        // Replace usage
        for (const icon of problematicIcons) {
          const usageRegex = new RegExp(`<${icon}([^>]*)>`, 'g');
          updatedContent = updatedContent.replace(usageRegex, `<${replacementIcon}$1>`);
        }
        
        // Write back to file
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

// Start searching from src directory
console.log('Scanning for problematic Lucide icon imports...');
searchFilesForProblematicIcons(path.join(__dirname, 'src'));
console.log('Done.');
