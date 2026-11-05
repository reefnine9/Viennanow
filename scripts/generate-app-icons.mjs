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

const manifestPath=path.join(dir,'manifest.webmanifest');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
manifest.icons=[
 {src:'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
 {src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
 {src:'/vnow-menu-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}
];
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
const htmlPath=path.join(dir,'index.html');
let html=fs.readFileSync(htmlPath,'utf8');
if(!html.includes('rel="apple-touch-icon"')){
 const needle='<link rel="manifest" href="/manifest.webmanifest">';
 if(!html.includes(needle))throw Error('Missing PWA manifest link');
 html=html.replace(needle,needle+'<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">');
 fs.writeFileSync(htmlPath,html);
}
console.log('Updated manifest and iOS touch icon metadata. Commit generated files and modified manifest/index together.');
