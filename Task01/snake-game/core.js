(function(root,factory){if(typeof module==='object')module.exports=factory();else root.Snake=factory();})(typeof globalThis==='object'?globalThis:this,function(){
const SIZE=18, BANK=['山','海','风','月','林','光','雨','星','云','桥','潮','梦','舟','雪','竹','泉'];
const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
const eq=(a,b)=>a.x===b.x&&a.y===b.y;
function food(snake,rng=Math.random){const free=[];for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(!snake.some(p=>p.x===x&&p.y===y))free.push({x,y});if(!free.length)return null;return {...free[Math.floor(rng()*free.length)],word:BANK[Math.floor(rng()*BANK.length)]};}
function reset(rng=Math.random){const snake=[{x:8,y:9},{x:7,y:9},{x:6,y:9}];return {snake,dir:[1,0],next:[1,0],turned:false,food:food(snake,rng),score:0,words:[],status:'ready'};}
function turn(s,key){const d=directions[key];if(!d||s.turned||d[0]===-s.dir[0]&&d[1]===-s.dir[1])return s;return {...s,next:d,turned:true};}
function step(s,rng=Math.random){if(s.status!=='running')return s;const [dx,dy]=s.next;const head={x:s.snake[0].x+dx,y:s.snake[0].y+dy},eat=s.food&&eq(head,s.food);const body=eat?s.snake:s.snake.slice(0,-1);if(head.x<0||head.y<0||head.x>=SIZE||head.y>=SIZE||body.some(p=>eq(p,head)))return {...s,status:'over'};const snake=[head,...body];const words=eat?[...s.words,s.food.word]:s.words;const nextFood=eat?food(snake,rng):s.food;return {...s,snake,dir:s.next,turned:false,words,score:s.score+(eat?10:0),food:nextFood,status:nextFood?'running':'won'};}
return {SIZE,BANK,reset,turn,step,food};});
