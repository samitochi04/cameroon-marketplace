import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public/locales directory if it doesn't exist
const publicLocalesDir = path.join(__dirname, '../public/locales');  try {
    await fs.mkdir(publicLocalesDir, { recursive: true });

    // Copy locales from src to public
    const srcLocalesDir = path.join(__dirname, '../src/locales');
    const languages = ['en', 'fr'];

    for (const lang of languages) {
      const srcDir = path.join(srcLocalesDir, lang);
      const destDir = path.join(publicLocalesDir, lang);
      
      await fs.mkdir(destDir, { recursive: true });
      
      const files = await fs.readdir(srcDir);
      for (const file of files) {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);
        await fs.copyFile(srcFile, destFile);
      }
    }

    console.log('✅ Locales copied successfully!');
  } catch (error) {
    console.error('Error copying locales:', error);
    process.exit(1);
  }
