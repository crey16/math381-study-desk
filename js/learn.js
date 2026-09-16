// Quizlet-style Learn: rounds of multiple-choice questions, then a Know / Still learning
// self-mark per card. Status lives in state.flashcards[id].learn and feeds the Leitner boxes.
import {state,save,rate} from './store.js';
import {esc,markdown} from './math.js';
export const ROUND=7;
export function shuffle(a,rnd=Math.random){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
export const status=c=>state.flashcards[c.id]?.learn||'new';
const sec=c=>c.id.split('-')[1];
// Four answer choices: the card plus distractors from the same topic, then section, then anywhere; backs are distinct.
export function choices(card,all,n=4,rnd=Math.random){const seen=new Set([card.back]),out=[card];for(const tier of [x=>x.topic===card.topic,x=>sec(x)===sec(card),()=>true]){for(const x of shuffle(all.filter(tier),rnd)){if(out.length>=n)break;if(x.id!==card.id&&!seen.has(x.back)){seen.add(x.back);out.push(x);}}}return shuffle(out,rnd);}
export function nextRound(pool,rnd=Math.random){const rank={learning:0,new:1,known:2};return shuffle(pool.filter(c=>status(c)!=='known'),rnd).sort((a,b)=>rank[status(a)]-rank[status(b)]).slice(0,ROUND);}
export function mark(id,known){rate(id,known?'good':'again',known?'known':'learning');}
export function resetLearn(ids){for(const id of ids)if(state.flashcards[id])delete state.flashcards[id].learn;save();}
let filter={section:'',priority:''},round=[],i=0,q=null,picked=null,results=[];
export async function learn(section){const {app,data,register,sections,options,setNames}=await import('./app.js');if(section!==undefined)filter.section=section;
 const pool=()=>data.flashcards.filter(c=>(!filter.section||sec(c)===filter.section)&&(!filter.priority||c.priority==filter.priority));
 const title=c=>data.topics.find(t=>t.id===c.topic)?.title||c.topic;
 function start(){round=nextRound(pool());i=0;results=[];question();}
 function question(){picked=null;q=round[i]?{card:round[i],opts:choices(round[i],data.flashcards)}:null;render();}
 function pick(k){if(picked!==null||!q||!q.opts[k])return;picked=k;render();}
 function decide(known){if(picked===null||!q)return;const correct=q.opts[picked].id===q.card.id;mark(q.card.id,known);results.push({card:q.card,correct,known});i++;question();}
 function render(){const p=pool(),n={new:0,learning:0,known:0};for(const c of p)n[status(c)]++;const pct=p.length?Math.round(100*n.known/p.length):0;
  let body;
  if(!p.length)body='<p>No cards match these filters.</p>';
  else if(!round.length)body=`<div class="panel center"><h2>Everything here is marked known.</h2><p class="muted">${p.length} cards. Ready for speed?</p><div class="toolbar center"><a class="mode-card-link" href="#rapidfire"><button class="primary">Go to Rapid-fire →</button></a><button id="restart">Start over</button></div></div>`;
  else if(!q){const right=results.filter(r=>r.correct).length;body=`<div class="panel"><h2>Round done: ${right} / ${results.length} correct.</h2><table><tr><th>Card</th><th>Answer</th><th>Marked</th></tr>${results.map(r=>`<tr><td>${esc(r.card.front)}</td><td>${r.correct?'✓':'✗'}</td><td>${r.known?'Know':'Still learning'}</td></tr>`).join('')}</table><button id="nextRound" class="primary">Next round (Enter)</button></div>`;}
  else{const correct=picked!==null&&q.opts[picked].id===q.card.id;body=`<p class="muted">Question ${i+1} of ${round.length} · ${esc(title(q.card))} · ${status(q.card)==='learning'?'still learning':status(q.card)}</p><div class="panel"><h2 class="question">${esc(q.card.front)}</h2><div class="choices">${q.opts.map((o,k)=>`<button class="choice ${picked===null?'':o.id===q.card.id?'right':k===picked?'wrong':''}" data-k="${k}" ${picked===null?'':'disabled'}><span class="num">${k+1}</span><div>${markdown(o.back)}</div></button>`).join('')}</div>${picked===null?'<p class="muted">Press 1–4 to choose.</p>':`<p class="${correct?'good':'error'}"><strong>${correct?'Correct.':'Not quite.'}</strong> ${correct?'':'The highlighted answer is right. '}Do you know this card?</p><div class="toolbar"><button id="dont" class="${correct?'':'primary'}">← Still learning</button><button id="know" class="${correct?'primary':''}">I know it →</button><small class="muted">Enter picks the highlighted one.</small></div>`}</div>`;}
  app.innerHTML=`<div class="eyebrow">01 / Recall · Learn${filter.section?` · §${esc(filter.section)}`:''}</div><h1>${filter.section?esc(setNames[filter.section]||filter.section):'Learn'}</h1><div class="toolbar"><a href="#flashcards">← All sets</a> · ${filter.section?`<a href="#flashcards/${esc(filter.section)}">Flashcards</a>`:''} · <strong>Learn</strong> · <a href="#rapidfire">Rapid-fire →</a></div><div class="toolbar"><label>Section <select id="lnSection">${options(['',...sections],filter.section)}</select></label><label>Priority <select id="lnPriority">${options(['','1','2','3'],filter.priority)}</select></label></div><div class="meter" aria-label="Known cards"><span style="width:${pct}%"></span></div><p class="muted">${n.known} known · ${n.learning} still learning · ${n.new} new · ${pct}% of ${p.length}</p>${body}`;
  for(const [id,key] of [['lnSection','section'],['lnPriority','priority']])document.getElementById(id).onchange=e=>{filter[key]=e.target.value;if(key==='section')history.replaceState(null,'','#flashcards/learn'+(filter.section?'/'+filter.section:''));start();};
  document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>pick(+b.dataset.k));
  const on=(id,f)=>{const el=document.getElementById(id);if(el)el.onclick=f;};
  on('know',()=>decide(true));on('dont',()=>decide(false));on('nextRound',start);on('restart',()=>{if(confirm('Clear the Know / Still learning marks for these cards? Leitner boxes are kept.')){resetLearn(p.map(c=>c.id));start();}});
 }
 register(e=>{if(/^[1-4]$/.test(e.key)&&picked===null)pick(+e.key-1);else if(e.key==='ArrowRight')decide(true);else if(e.key==='ArrowLeft')decide(false);else if(e.key==='Enter'){e.preventDefault();if(q&&picked!==null)decide(q.opts[picked].id===q.card.id);else if(!q&&round.length)start();}});
 start();
}
