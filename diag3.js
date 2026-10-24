const ts = require('typescript');
const fs = require('fs');
const src = fs.readFileSync('app/page.tsx','utf8');
const sf = ts.createSourceFile('app/page.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const options = { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler };
const program = ts.createProgram(['app/page.tsx'], options, {
  getSourceFile: (fileName) => fileName === 'app/page.tsx' ? sf : undefined,
  fileExists: () => true,
  readFile: () => undefined,
  getCurrentDirectory: () => process.cwd(),
  getDirectories: () => [],
  getCanonicalFileName: f => f,
  useCaseSensitiveFileNames: () => true,
  getNewLine: () => '\n',
  getDefaultLibFileName: o => ts.getDefaultLibFilePath(o),
  writeFile: () => {}
});
const diags = ts.getPreEmitDiagnostics(program);
console.log('count', diags.length);
for (const d of diags) {
  const msg = typeof d.messageText === 'string' ? d.messageText : d.messageText.messageText;
  if (d.file && d.start !== undefined) {
    const pos = d.file.getLineAndCharacterOfPosition(d.start);
    console.log('L'+(pos.line+1)+':'+pos.character, msg);
  } else {
    console.log(msg);
  }
}
