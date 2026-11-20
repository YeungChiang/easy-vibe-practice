(function(root,factory){if(typeof module==='object'&&module.exports){module.exports=factory();}else{root.Game2048=factory();}})(typeof globalThis!=='undefined'?globalThis:this,function(){
function slide(line){
  const nums=line.filter(n=>n!==0);let gain=0;const out=[];
  for(let i=0;i<nums.length;i++){
    if(i+1<nums.length && nums[i]===nums[i+1]){const sum=nums[i]*2;out.push(sum);gain+=sum;i++;}
    else out.push(nums[i]);
  }
  while(out.length<4)out.push(0);
  return {line:out,gain};
}
function spawn(board,rng=Math.random){
  const cells=[];for(let i=0;i<16;i++)if(board[i]===0)cells.push(i);
  const next=board.slice();if(!cells.length)return next;
  const index=cells[Math.min(cells.length-1,Math.floor(rng()*cells.length))];
  next[index]=rng()<0.9?2:4;return next;
}
function canMove(board){
  if(board.includes(0))return true;
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    const p=r*4+c;if(c<3&&board[p]===board[p+1])return true;
    if(r<3&&board[p]===board[p+4])return true;
  }return false;
}
function init(rng=Math.random){
  const first=spawn(Array(16).fill(0),rng);
  return {board:spawn(first,rng),score:0,moves:0,status:'ready',history:null};
}
function begin(s){return {...s,status:'playing'};}
function move(s,direction,rng=Math.random){
  if(s.status!=='playing'||!['left','right','up','down'].includes(direction))return s;
  const b=s.board.slice();let gain=0,changed=false;
  for(let n=0;n<4;n++){
    const ids=[];for(let k=0;k<4;k++){
      if(direction==='left')ids.push(n*4+k);
      if(direction==='right')ids.push(n*4+3-k);
      if(direction==='up')ids.push(k*4+n);
      if(direction==='down')ids.push((3-k)*4+n);
    }
    const old=ids.map(i=>b[i]);const result=slide(old);
    for(let k=0;k<4;k++){if(b[ids[k]]!==result.line[k])changed=true;b[ids[k]]=result.line[k];}
    gain+=result.gain;
  }
  if(!changed)return s;
  const after=spawn(b,rng),score=s.score+gain;
  const status=after.some(v=>v>=2048)?'won':canMove(after)?'playing':'lost';
  return {board:after,score,moves:s.moves+1,status,history:{board:s.board.slice(),score:s.score,moves:s.moves,status:s.status}};
}
function undo(s){
  if(!s.history)return s;
  const h=s.history;return {board:h.board.slice(),score:h.score,moves:h.moves,status:h.status,history:null};
}
return {slide,spawn,canMove,init,begin,move,undo};
});
