from pathlib import Path
root=Path(__file__).resolve().parents[1]
app=(root/'app.js').read_text()
for path in [root/'index.html',root/'public/index.html']:
  raw=path.read_text()
  first=raw.index("<script>\n'use strict';")
  end=raw.index('</script>',first)
  out=raw[:first]+'<script>\n'+app+'\n</script>'+raw[end+len('</script>'):]
  path.write_text(out)
(root/'public/coordinate_audit_pending.csv').write_bytes((root/'coordinate_audit_pending.csv').read_bytes())
print('Refreshed both HTML files from app.js')
