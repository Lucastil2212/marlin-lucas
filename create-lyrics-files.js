const fs = require('fs');
const path = require('path');

// Directory containing the lyrics files
const lyricsDir = path.join(__dirname, 'chingon-full-album', 'lyrics');

// Ensure lyrics directory exists
if (!fs.existsSync(lyricsDir)) {
    fs.mkdirSync(lyricsDir, { recursive: true });
}

// Get music files list - must match script.js exactly
const musicFiles = [
    '¿Dónde estaban los policías? (Remastered).wav',
    'FAST! (Remastered).wav',
    'Berlín (Remastered).wav',
    'Brisa (Remastered).wav',
    'CHILL (Remastered).wav',
    'Chingón (Remastered).wav',
    'Corrido para cantar (Remastered).wav',
    'De nuevo tropiezo (Remastered).wav',
    'Desaparecer (Remastered).wav',
    'Destruir el Sistema (Remastered).wav',
    'El León (Remastered).wav',
    'En el rancho (Remastered).wav',
    'Estambul Turquía (Remastered).wav',
    'Halloween (Remastered).wav',
    'Harmonizing at the Campfire (Remastered).wav',
    'India (Remastered).wav',
    'Invierno (Remastered).wav',
    'Lluvia (Remastered).wav',
    'Look at Me Now (Remastered).wav',
    'Loving You Is Easy (Remastered).wav',
    'Me ahogo en alcohol (Remastered).wav',
    'Mi religión (Remastered).wav',
    'Nunca Olvidaré Aquella Noche (Remastered).wav',
    'Nunca vuelvo a California (Remastered).wav',
    'Odio cuando no estás aquí (Remastered).wav',
    'Paysundú (Remastered).wav',
    'Pecadores (Remastered).wav',
    'Si el cielo cae (Remastered).wav',
    'Siempre traigo cruz (Remastered).wav',
    'Soy Quien Soy (Remastered).wav',
    'Te Dejo Mi Amor (Remastered).wav',
    'Un Beso Más Antes de Irme (Remastered).wav',
    'You Lost My Trust (Remastered).wav'
];

console.log(`📝 Creating ${musicFiles.length} empty .txt files for lyrics...\n`);

let created = 0;
let skipped = 0;

musicFiles.forEach(file => {
    try {
        // Change extension from .wav to .txt
        const txtFile = file.replace(/\.wav$/i, '.txt');
        const txtPath = path.join(lyricsDir, txtFile);
        
        // Check if file already exists and has content
        if (fs.existsSync(txtPath)) {
            const stats = fs.statSync(txtPath);
            // If file exists and is not empty, skip it (user might have already added lyrics)
            if (stats.size > 0) {
                console.log(`⚠️  Skipping ${txtFile} - file already exists with content`);
                skipped++;
                return;
            }
        }
        
        // Create empty .txt file
        fs.writeFileSync(txtPath, '', 'utf8');
        console.log(`✅ Created ${txtFile}`);
        created++;
    } catch (error) {
        console.error(`❌ Error creating ${file}:`, error.message);
    }
});

console.log(`\n✨ Done! Created ${created} file(s), skipped ${skipped} file(s).`);
console.log(`📁 Lyrics directory: ${lyricsDir}`);

