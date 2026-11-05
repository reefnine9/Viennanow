import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const problems=[];
const warnings=[];
const index=read('public/index.html');
const privacy=read('public/privacy.html');
const legal=read('public/legal.html');
const pkg=JSON.parse(read('package.json'));
const cap=read('capacitor.config.ts');

if(!pkg.scripts?.['native:sync']?.includes('native:build:web'))problems.push('Native sync does not stage API URLs');
if(!cap.includes("webDir: 'dist-native'"))problems.push('Capacitor webDir must use staged native files');
if(!fs.existsSync(path.join(root,'functions/api/_middleware.js')))problems.push('Native API CORS middleware missing');
if(!fs.existsSync(path.join(root,'tests/native-cors.test.mjs')))problems.push('Native CORS regression tests missing');
if(!index.includes('navigator.geolocation'))warnings.push('Location access needs physical-device permission testing');
if(/noindex,nofollow/.test(index))warnings.push('Public app page is noindex');
if(/Pre-release draft|출시 전 검토 초안/i.test(privacy))warnings.push('Privacy notice remains a draft');
if(/Impressum 미완성|Operator identification pending/i.test(legal))warnings.push('Operator/legal notice incomplete');
for(const file of ['icon-192.png','icon-512.png','apple-touch-icon.png','store-icon-1024.png']){
 if(!fs.existsSync(path.join(root,'public',file)))warnings.push(file+' not generated yet');
}
for(const item of problems)console.error('BLOCKER:',item);
for(const item of warnings)console.warn('RELEASE WARNING:',item);
console.log('Phase 40: '+problems.length+' structural blockers; '+warnings.length+' release warnings');
if(problems.length)process.exitCode=1;
