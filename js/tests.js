import {fresh,mastery,validate} from './store.js';
import {matches,parse,canonical} from './normalize.js';
const results=[];export function test(name,fn){try{if(!fn())throw Error('Assertion false');results.push('PASS '+name);}catch(e){results.push('FAIL '+name+': '+e.message);}document.querySelector('#results').textContent=results.join('\n');document.title=results.some(r=>r.startsWith('FAIL'))?'FAIL':'PASS';}
test('Empty progress has zero mastery',()=>mastery('t',[],[],fresh()).mastery===0);
test('Unrated cards count as zero',()=>{const s=fresh();s.flashcards.a={lastRating:'easy',seen:1};return mastery('t',[{id:'a',topic:'t'},{id:'b',topic:'t'}],[],s).mastery===.2;});
test('Mastery weights and Laplace smoothing',()=>{const s=fresh();s.flashcards.a={lastRating:'easy',seen:1};s.rapidfire.attempts=[{topic:'t',ok:true,ms:1000}];s.problems.p={attempts:[{grade:3}]};return Math.abs(mastery('t',[{id:'a',topic:'t'}],[{id:'p',topic:'t'}],s).mastery-(.4+.4*2/3+.2))<1e-10;});
test('Reject bad import',()=>{try{validate({version:2});return false;}catch{return true;}});
for(const s of ['~p v q','¬p ∨ q','q or not p','(q | !p)'])test('Canonical OR: '+s,()=>matches(s,'¬p ∨ q','symbolic'));
for(const s of ['p ^ q','q & p','q and p'])test('Canonical AND: '+s,()=>matches(s,'p ∧ q','symbolic'));
test('Implication direction retained',()=>!matches('q -> p','p → q','symbolic'));
test('Associative flattening',()=>matches('r and (q and p)','(p ∧ q) ∧ r','symbolic'));
test('Quantifier aliases and power',()=>matches('E x A y (x^2 + y != 2)','∃x ∀y (x^2 + y ≠ 2)','symbolic'));
test('Arithmetic power is not conjunction',()=>!matches('x^2','x ∧ 2','symbolic'));
test('Implicit multiplication',()=>matches('2*k+1','2k+1','symbolic'));
test('Malformed input rejected',()=>!matches('p or','p','symbolic'));
test('Unknown characters rejected',()=>!matches('p @','p','symbolic'));
test('Quantifier order retained',()=>!matches('forall x exists y (x < y)','exists y forall x (x < y)','symbolic'));
for(const [a,b] of [['dm',"de morgan’s"],['7.1','conditional disjunction'],['mp','modus ponens'],['Y','yes'],['TRUE','T']])test('Text aliases '+a,()=>matches(a,b));
