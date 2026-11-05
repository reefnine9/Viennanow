import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir=path.resolve('public');
const source=path.join(dir,'vnow-menu-icon.svg');
if(!fs.existsSync(source))throw Error('Missing approved ViennaNow SVG icon');
const svg=fs.readFileSync(source);
const sizes=[
  ['icon-192.png',192],
  ['icon-512.png',512],
  ['apple-touch-icon.png',180],
  ['store-icon-1024.png',1024]
];
for(const [file,size] of sizes){
 await sharp(svg,{density:300}).resize(size,size,{fit:'contain'}).png().toFile(path.join(dir,file));
 console.log('Generated',file,size+'x'+size);
}
console.log('Review platform icons visually before submission; iOS and Android native assets require platform-specific generation.');
