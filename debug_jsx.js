const ts = require('typescript');
const fs = require('fs');
const src = fs.readFileSync('C:/Users/usuario/Desktop/balatro-web/app/page.tsx', 'utf8');
const sf = ts.createSourceFile('page.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function findJsxReturn(n) {
  let found = null;
  const visit = (x) => {
    if (found) return;
    if (ts.isReturnStatement(x) && x.expression && (ts.isJsxElement(x.expression) || ts.isJsxSelfClosingElement(x.expression))) { found = x; return; }
    ts.forEachChild(x, visit);
  };
  visit(n);
  return found;
}
const ret = findJsxReturn(sf);
const jsx = ret.expression;

function walk(n, depth) {
  if (ts.isJsxElement(n)) {
    const tag = n.openingElement.tagName.getText(sf);
    console.log('  '.repeat(depth) + '<' + tag + '>');
    for (const c of n.children || []) walk(c, depth + 1);
    console.log('  '.repeat(depth) + '</' + tag + '>');
  } else if (ts.isJsxSelfClosingElement(n)) {
    console.log('  '.repeat(depth) + '<' + n.tagName.getText(sf) + ' />');
  } else if (ts.isJsxOpeningElement(n)) {
    console.log('  '.repeat(depth) + '<' + n.tagName.getText(sf));
    for (const a of n.attributes || []) {
      const an = ts.isJsxAttribute(a) ? a.name.getText(sf) : '?';
      console.log('  '.repeat(depth + 1) + 'attr: ' + an);
    }
  } else if (ts.isJsxClosingElement(n)) {
    console.log('  '.repeat(depth) + '</' + n.tagName.getText(sf) + '>');
  }
}
walk(jsx, 0);
console.log('DONE');
