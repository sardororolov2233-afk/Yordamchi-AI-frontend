const fs = require('fs');
const path = require('path');
const baseDir = './public/pro_perviews';
const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

const result = folders.map(folder => {
  const files = fs.readdirSync(path.join(baseDir, folder));
  const images = files.filter(i => i.endsWith('.png') || i.endsWith('.jpg') || i.endsWith('.jpeg')).slice(0, 2);
  let nameObj = folder.charAt(0).toUpperCase() + folder.slice(1).replace(/_/g, ' ');
  return {
    id: folder,
    name: nameObj,
    images: images.map(img => `/pro_perviews/${folder}/${img}`)
  };
});

fs.writeFileSync('./src/constants/proTemplates.ts', `export const proTemplates = ${JSON.stringify(result, null, 2)};\n`);
console.log('Script finished successfully.');
