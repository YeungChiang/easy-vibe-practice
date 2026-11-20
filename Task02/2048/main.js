const $=id=>document.getElementById(id);
let state=Game2048.init();
let best=0;try{best=Number(localStorage.getItem('easyVibe2048Best')||0);}catch{}
function render(){
$('board').replaceChildren();state.board.forEach((v,i)=>{const el=document.createElement('div');el.className='tile';el.dataset.v=String(v);el.textContent=v?String(v):'';el.setAttribute('role','gridcell');el.setAttribute('aria-label','第'+(Math.floor(i/4)+1)+'行第'+(i%4+1)+'列 '+(v||'空'));$('board').appendChild(el);});
best=Math.max(best,state.score);try{localStorage.setItem('easyVibe2048Best',String(best));}catch{}
$('score').textContent=state.score;$('best').textContent=best;$('moves').textContent=state.moves;
const visible=state.status!=='playing';$('overlay').hidden=!visible;
const names={ready:'准备开始',playing:'游戏中',won:'挑战成功',lost:'游戏结束'};
$('status').textContent=names[state.status]+' · '+(state.status==='playing'?'使用方向键移动':state.status==='won'?'已合成 2048':state.status==='lost'?'没有可移动的位置':'等待开始');
$('over-title').textContent=names[state.status];
$('over-desc').textContent=state.status==='won'?'已合成 2048，可以重新开始':state.status==='lost'?'已无可移动位置，再来一局吧':'点击开始，移动数字并合并';
$('overlay-button').textContent=state.status==='ready'?'开始游戏':'再来一局';
$('start').textContent=state.status==='playing'?'进行中':'开始游戏';
$('undo').disabled=!state.history;
}
function newGame(){state=Game2048.begin(Game2048.init());render();}
function start(){if(state.status==='ready'){state=Game2048.begin(state);render();}else if(state.status!=='playing')newGame();}
function move(dir){const next=Game2048.move(state,dir);if(next!==state){state=next;render();}}
$('start').onclick=start;$('restart').onclick=newGame;$('overlay-button').onclick=start;$('undo').onclick=()=>{state=Game2048.undo(state);render();};
document.querySelectorAll('[data-move]').forEach(btn=>btn.onclick=()=>move(btn.dataset.move));
const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'};
document.addEventListener('keydown',e=>{const dir=map[e.key];if(dir){e.preventDefault();move(dir);}});
let touch=null;const board=$('board');
board.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
board.addEventListener('touchend',e=>{if(!touch||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));},{passive:true});
render();
