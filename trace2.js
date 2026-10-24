const fs = require('fs');
const t = fs.readFileSync('C:/Users/usuario/Desktop/balatro-web/app/page.tsx', 'utf8');
const re = /<\/?([A-Za-z][A-Za-z0-9]*)/g;
let m;
const stack = [];
while ((m = re.exec(t))) {
  const idx = m.index;
  const line = t.slice(0, idx).split('\n').length;
  const rest = t.slice(idx);
  const fm = rest.match(/^<\/?([A-Za-z][A-Za-z0-9]*)/);
  const tag = fm[1];
  if (rest.startsWith('</')) {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].tag === tag) { stack.splice(i, 1); break; }
    }
  } else {
    if (rest.indexOf('/>') !== -1 && rest.indexOf('>') !== -1 && rest.indexOf('/>') < rest.indexOf('>') + 5) {
      // rough self-close check
      continue;
    }
    stack.push({tag: tag, line: line});
  }
}
console.log('REMAINING', stack.length);
for (let i = 0; i < stack.length; i++) console.log(stack[i].tag, stack[i].line);
