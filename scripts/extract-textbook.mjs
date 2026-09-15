// Authoring helper only; the browser does not run this script.
// Emits extracted exercises for review, never writes the content bank.
import fs from 'node:fs';
const root='materials/textbook/';const files=fs.readdirSync(root).filter(x=>/^Rosen \d/.test(x));
const texts=Object.fromEntries(files.map(f=>[f.match(/Rosen (\d\.\d)/)[1],fs.readFileSync(root+f,'utf8')]));
const cutPages=text=>text.split('\f').map(page=>{
 const lines=page.split('\n');
 const numbered=lines.flatMap(l=>[...l.matchAll(/\b\d{1,2}\. /g)].filter(m=>m.index>57&&m.index<85).map(m=>m.index));
 const cut=numbered.length?Math.min(...numbered)-1:(()=>{let best=65,score=-1;for(let c=56;c<77;c++){const n=lines.filter(l=>l.length>90&&l.slice(c-2,c+1).trim()==='').length;if(n>score){score=n;best=c;}}return best;})();
 return [lines.map(l=>l.slice(0,cut)).join('\n'),lines.map(l=>l.slice(cut)).join('\n')].join('\n');
}).join('\n');
const section=process.argv[2];let text=texts[section].split(/^Exercises\s*$/m).at(-1);
if(section==='1.3')text+='\f'+texts['1.4'].split(/^1\.4\s+Predicates/m)[0];
if(section==='1.4')text+='\f'+texts['1.5'].split(/^1\.5\s+Nested/m)[0];
if(section==='1.6')text+='\f'+texts['1.7'].split(/^1\.7\s+Introduction/m)[0];
if(section==='2.1')text=text.split(/^2\.2\s+Set Operations/m)[0];
text=cutPages(text).normalize('NFKC').replace(/([a-z])\-\s*\n\s*([a-z])/g,'$1$2');
const matches=[...text.matchAll(/^\s*[∗*]*\s*(\d{1,2})\.\s+/gm)];
const result=matches.map((m,i)=>({n:+m[1],prompt:text.slice(m.index+m[0].length,matches[i+1]?.index||text.length).replace(/\n\s*\n/g,'\n').trim()}));
console.log(JSON.stringify(result.sort((a,b)=>a.n-b.n),null,2));
