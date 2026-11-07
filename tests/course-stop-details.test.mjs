import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
test('ViennaNow course stops use matched sightseeing IDs and no guessed coordinate matches',()=>{
 assert.match(html,/function vnCourseSightId\(stop\)/);
 assert.match(html,/Object\.prototype\.hasOwnProperty\.call\(VN_COURSE_SIGHT_LINKS,label\)/);
 assert.match(html,/if\(explicit&&catalogById\(explicit\)\)return explicit/);
 assert.match(html,/CATALOG48\.find\(c=>c\.ko===label\|\|c\.de===label\|\|c\.en===label\)/);
 assert.doesNotMatch(html,/function vnCourseSightId\(stop\)[\s\S]{0,500}vnCoursePoint41/);
});
test('Each resolvable stop has a details button; unlinked rest stops do not',()=>{
 assert.match(html,/c\.stops\.map\(stop=>\{const sightId=vnCourseSightId\(stop\)/);
 assert.match(html,/sightId\?\x60<button type="button" class="vn-course-sight-detail"/);
 assert.match(html,/data-act="vn-course-sight-detail"/);
 assert.match(html,/en\?'Details':'상세보기'/);
});
test('Course detail button opens existing sight drawer without changing course',()=>{
 assert.match(html,/case 'vn-course-sight-detail':\{\s*if\(!catalogById\(id\)\)return;\s*state\.detail=id;state\.expDetail19=null;\s*render\(\);return;/);
 assert.match(html,/function detailLayer\(\)/);
 assert.match(html,/case'close-detail':state\.detail=null;render\(\);return;/);
});
