const ts = require('typescript');
const fs = require('fs');
const src = fs.readFileSync('app/page.tsx','utf8');
const sf = ts.createSourceFile('x.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const host = ts.createCompilerHost({});
const diags = [...ts.getSyntacticDiagnostics(sf), ...ts.getSemanticDiagnostics(sf, undefined, host)];
console.log('count', diags.length);
for (const d of diags) {
  const msg = typeof d.messageText === 'string' ? d.messageText : d.messageText.messageText;
  if (d.start !== undefined) {
    const pos = sf.getLineAndCharacterOfPosition(d.start);
    console.log('L'+(pos.line+1)+':'+pos.character, msg);
  } else {
    console.log(msg);
  }
}
