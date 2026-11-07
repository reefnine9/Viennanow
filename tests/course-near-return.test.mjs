import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');

test('Nearby route map remembers the originating ViennaNow course and main-scroll position',()=>{
 assert.match(html,/case 'vn-course-near-map':\{[\s\S]*?vnCourseReturnFromNear=\{id,scrollTop:\$\('main'\)\?\.scrollTop\|\|0\}/);
 assert.match(html,/state\.nearPlanChoice=id;state\.nearSection='plan';state\.tab='map'/);
});
test('Bottom Plan tab restores course detail only when coming from the Nearby plan map',()=>{
 assert.match(html,/const returnToCourse=t==='itinerary'&&state\.tab==='map'&&state\.nearSection==='plan'&&vnCourseReturnFromNear/);
 assert.match(html,/state\.planSection='premium';\s*state\.vnCourseDetail=returnToCourse\.id/);
 assert.match(html,/main\.scrollTop=returnToCourse\.scrollTop/);
 assert.match(html,/if\(t!=='map'\)vnCourseReturnFromNear=null/);
});
