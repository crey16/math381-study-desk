export const KEY='math381.v1';
export const fresh=()=>({version:1,settings:{theme:'dark',rfDuration:120,rfWrongDelayMs:1200},flashcards:{},rapidfire:{attempts:[],sessions:[]},problems:{}});
export function validate(s){
 if(!s||s.version!==1||!s.settings||!s.flashcards||!s.problems||!Array.isArray(s.rapidfire?.attempts)||!Array.isArray(s.rapidfire?.sessions))throw Error('Not a MATH 381 version 1 progress file.');
 if(!['dark','light'].includes(s.settings.theme)||![0,60,120,180].includes(s.settings.rfDuration)||!Number.isFinite(s.settings.rfWrongDelayMs)||s.settings.rfWrongDelayMs<0)throw Error('Invalid settings.');
 for(const v of Object.values(s.flashcards))if(![1,2,3,4].includes(v.box)||!['again','hard','good','easy'].includes(v.lastRating)||!Number.isFinite(v.lastSeen)||!Number.isFinite(v.seen)||(v.learn!==undefined&&!['learning','known'].includes(v.learn)))throw Error('Invalid card progress.');
 for(const a of s.rapidfire.attempts)if(typeof a.ok!=='boolean'||!Number.isFinite(a.ms)||a.ms<0||typeof a.topic!=='string'||typeof a.cat!=='string')throw Error('Invalid rapid-fire attempt.');
 for(const v of Object.values(s.problems)){if(!Array.isArray(v.attempts)||typeof v.scratch!=='string'||v.attempts.some(a=>![1,2,3].includes(a.grade)))throw Error('Invalid problem progress.');}
 return s;
}
export let state=fresh();
export function load(){const raw=localStorage.getItem(KEY);if(raw)state=validate(JSON.parse(raw));return state;}
export function save(){state.rapidfire.attempts=state.rapidfire.attempts.slice(-2000);state.rapidfire.sessions=state.rapidfire.sessions.slice(-200);for(const p of Object.values(state.problems))p.attempts=p.attempts.slice(-100);try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){alert('Progress could not be saved. Export it now. '+e.message);}}
export function replace(s){state=validate(s);save();}
export function rate(id,rating,learn){const old=state.flashcards[id]||{box:1,seen:0};state.flashcards[id]={...old,learn:learn||old.learn,box:rating==='again'?1:Math.min(4,old.box+({hard:0,good:1,easy:2}[rating]||0)),seen:old.seen+1,lastSeen:Date.now(),lastRating:rating};if(!state.flashcards[id].learn)delete state.flashcards[id].learn;save();}
export function median(a){if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;}
export function mastery(topic,cards,problems,s=state){
 const fc=cards.filter(c=>c.topic===topic),rated=fc.filter(c=>s.flashcards[c.id]);
 const rf=s.rapidfire.attempts.filter(a=>a.topic===topic),recent=rf.slice(-20);
 const pa=problems.filter(p=>p.topic===topic).flatMap(p=>s.problems[p.id]?.attempts||[]);
 const studied=!!(rated.length+rf.length+pa.length);
 const f=fc.length?fc.reduce((sum,c)=>sum+({again:0,hard:.4,good:.8,easy:1}[s.flashcards[c.id]?.lastRating]||0),0)/fc.length:0;
 const r=recent.length?(recent.filter(a=>a.ok).length+1)/(recent.length+2):0;
 const p=pa.length?pa.reduce((sum,a)=>sum+(a.grade-1)/2,0)/pa.length:0;
 const avg=a=>a.length?a.filter(x=>x.ok).length/a.length:0;
 return {mastery:studied?.4*f+.4*r+.2*p:0,studied,attempts:rf.length+pa.length+rated.reduce((n,c)=>n+s.flashcards[c.id].seen,0),accuracy:rf.length?avg(rf):null,median:median(rf.map(a=>a.ms)),trend:rf.length>=20?avg(rf.slice(-10))-avg(rf.slice(-20,-10)):null};
}
