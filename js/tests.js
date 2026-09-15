import {fresh,mastery,validate} from './store.js';
const results=[];export function test(name,fn){try{if(!fn())throw Error('Assertion false');results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.message);}document.querySelector('#results').textContent=results.join('\n');document.title=results.some(r=>r.startsWith('FAIL'))?'FAIL':'PASS';}
test('Empty progress has zero mastery',()=>mastery('t',[],[],fresh()).mastery===0);
test('Unrated cards count as zero',()=>{const s=fresh();s.flashcards.a={lastRating:'easy',seen:1};return mastery('t',[{id:'a',topic:'t'},{id:'b',topic:'t'}],[],s).mastery===.2;});
test('Mastery weights and Laplace smoothing',()=>{const s=fresh();s.flashcards.a={lastRating:'easy',seen:1};s.rapidfire.attempts=[{topic:'t',ok:true,ms:1000}];s.problems.p={attempts:[{grade:3}]};return Math.abs(mastery('t',[{id:'a',topic:'t'}],[{id:'p',topic:'t'}],s).mastery-(.4+.4*2/3+.2))<1e-10;});
test('Reject bad import',()=>{try{validate({version:2});return false;}catch{return true;}});
