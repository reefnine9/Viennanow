from playwright.sync_api import sync_playwright
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
html=re.sub(r'<link[^>]+unpkg\.com[^>]*>','',html)
html=re.sub(r'<script\s+src="https://unpkg\.com[^>]*></script>','',html)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 page.route('https://upload.wikimedia.org/**',lambda route:route.abort())
 page.set_content(html)
 page.locator('[data-act="go-explore"]').first.click()
 page.screenshot(path=str(root/'preview_phase18_gallery.png'))
 page.locator('.gallery-card [data-id="B02"]').first.click()
 page.locator('.editorial-feature').scroll_into_view_if_needed()
 page.screenshot(path=str(root/'preview_phase18_detail_ko.png'))
 # Language toggle should preserve drawer scroll rather than reset it
 before=page.locator('.drawer').evaluate('(e)=>e.scrollTop')
 page.locator('[data-act="content-lang"][data-value="en"]').click()
 after=page.locator('.drawer').evaluate('(e)=>e.scrollTop')
 assert abs(before-after)<50, (before,after)
 page.locator('.editorial-feature').scroll_into_view_if_needed()
 page.screenshot(path=str(root/'preview_phase18_detail_en.png'))
 print('Preview screenshots created. Language toggle scroll preserved:',before,after)
 b.close()
