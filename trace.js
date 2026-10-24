const fs=require('fs');
const t=fs.readFileSync('C:/Users/usuario/Desktop/balatro-web/app/page.tsx','utf8');
const re=/<\/?([A-Za-z][A-Za-z0-9]*)\b/g;
let m;
const stack=[];
while((m=re.exec(t))){
  const idx=m.index;
  const line = t.slice(0,idx).split('\n').length;
  const rest=t.slice(idx);
  const fm = rest.match(/^<\/?([A-Za-z][A-Za-z0-9]*)/);
  if(!fm) continue;
  const full=fm[0];
  if(full.startsWith('</')){
    const tname = full.slice(2);
    let found=false;
    for(let i=stack.length-1;i>=0;i--){
      if(stack[i].tag===tname){ stack.splice(i); found=true; break; }
    }
    if(!found) console.log('UNMATCHED CLOSE',tname,'line',line);
  }else{
    // skip self-closing check roughly? look ahead for /> before >
    // but easier to just push
    stack.push({tag:full.slice(1), line});
  }
}
console.log('REMAINING COUNT:', stack.length);
for(let i=Math.max(0,stack.length-40);i<stack.length;i++) console.log('  ',i,stack[i].tag,stack[i].line);
