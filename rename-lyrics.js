const fs = require('fs');
const path = require('path');

// Directory containing the lyrics files
const lyricsDir = path.join(__dirname, 'chingon-full-album', 'lyrics');

// Check if lyrics directory exists
if (!fs.existsSync(lyricsDir)) {
    console.error('❌ Lyrics directory does not exist:', lyricsDir);
    process.exit(1);
}

// Get all .wav files in the lyrics directory
const files = fs.readdirSync(lyricsDir).filter(file => file.endsWith('.wav'));

if (files.length === 0) {
    console.log('ℹ️  No .wav files found in lyrics directory.');
    process.exit(0);
}

console.log(`📝 Found ${files.length} .wav files in lyrics directory.\n`);

let renamed = 0;
let errors = 0;

files.forEach(file => {
    try {
        const oldPath = path.join(lyricsDir, file);
        // Change extension from .wav to .txt (you can change this to .md if you prefer)
        const newFile = file.replace(/\.wav$/i, '.txt');
        const newPath = path.join(lyricsDir, newFile);
        
        // Check if new file already exists
        if (fs.existsSync(newPath)) {
            console.log(`⚠️  Skipping ${file} - ${newFile} already exists`);
            return;
        }
        
        // Rename the file
        fs.renameSync(oldPath, newPath);
        console.log(`✅ ${file} → ${newFile}`);
        renamed++;
    } catch (error) {
        console.error(`❌ Error renaming ${file}:`, error.message);
        errors++;
    }
});

console.log(`\n✨ Done! Renamed ${renamed} file(s).`);
if (errors > 0) {
    console.log(`⚠️  ${errors} error(s) occurred.`);
}

