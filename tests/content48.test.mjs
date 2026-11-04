import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=file=>JSON.parse(readFileSync(new URL('../'+file, import.meta.url),'utf8'));
const content=load('content_48.json');
const catalog=load('catalog_48.json');
const byId=Object.fromEntries(content.map(v=>[v.id,v]));
test('48 distinct attractions with 16 first-release planner places and 32 non-planner places',()=>{
 assert.equal(content.length,48);assert.equal(new Set(content.map(x=>x.id)).size,48);
 assert.equal(content.filter(x=>x.planner_eligible).length,16);
 assert.equal(content.filter(x=>!x.planner_eligible).length,32);
 assert.deepEqual(content.map(x=>x.id),catalog.map(x=>x.id));
});
test('every place has original Korean and English editorial content',()=>{
 for(const x of content){
 assert.ok(x.overview_ko.length>=25,x.id+' short Korean');
 assert.ok(x.overview_en.length>=35,x.id+' short English');
 assert.equal(x.highlights_ko.length,2,x.id);
 assert.equal(x.highlights_en.length,2,x.id);
 assert.ok(x.tip_ko.length>=15&&x.tip_en.length>=25,x.id+' missing tip');
 }
});
test('duration values are approximate bounds and not official claims',()=>{
 for(const x of content){assert.ok(x.estimated_minutes_min>=10&&x.estimated_minutes_min<x.estimated_minutes_max&&x.estimated_minutes_max<=250,x.id);
 assert.match(x.duration_basis,/not official/);}
});
test('source links if present are https and none are invented null or empty',()=>{
 for(const x of content){if(x.official_url){const u=new URL(x.official_url);assert.equal(u.protocol,'https:');assert.ok(u.hostname.includes('.'),x.id);}
 assert.ok(['needs_date_check','partially_checked'].includes(x.operational_status));}
});
test('verified price examples are provided only for selected source pages, all prices dated in prose',()=>{
 const priced=content.filter(x=>x.price_example_ko);
 assert.equal(priced.length,5);
 for(const x of priced){assert.ok(x.official_url);assert.ok(x.price_example_en);assert.match(x.price_example_ko,/조회일 기준/);}
});
test('high-risk visit conditions documented separately for sampled places',()=>{
 assert.match(byId.A13.tip_ko,/내부 관광은 불가능/);
 assert.match(byId.B02.booking_ko,/시간대 예약/);
 assert.match(byId.C03.hours_note_ko,/정오/);
 assert.match(byId.C10.hours_note_en,/winter/i);
 assert.match(byId.B13.tip_en,/park walk/);
 assert.match(byId.A14.tip_en,/Sundays/);
});
test('package export and Netlify public content have matching records',()=>{
 assert.deepEqual(load('public/content_48.json'),content);
});
test('app includes localized detail rendering, safe links and no new planner unlock',()=>{
 const js=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.match(js,/function editorialInfo\(c\)/);
 assert.match(js,/case'content-lang'/);
 assert.match(js,/rel="noopener noreferrer"/);
 assert.match(js,/이 장소는 자동 일정 추천에 넣지 않습니다/);
 assert.match(js,/const CONTENT48=/);
});
test('all 48 places have a relevant institution or Vienna tourism reference page',()=>{
 assert.equal(content.filter(x=>x.official_url&&x.official_link_status==='direct_source_checked').length,48);
});
test('reference pages for distinct secondary places are attached explicitly',()=>{
 assert.match(byId.B07.official_url,/kunsthauswien/i);
 assert.match(byId.C01.official_url,/peterskirche/i);
 assert.match(byId.C02.official_url,/judenplatz/i);
 assert.match(byId.C14.official_url,/danube-island/i);
});
