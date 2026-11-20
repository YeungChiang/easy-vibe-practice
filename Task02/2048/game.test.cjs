const test=require('node:test');const assert=require('node:assert/strict');const G=require('./game.js');
test('两对相同数字分别合并',()=>{const v=G.slide([2,2,2,2]);assert.deepEqual(v.line,[4,4,0,0]);assert.equal(v.gain,8);});
test('隔开的数字不会错误合并',()=>assert.deepEqual(G.slide([2,4,2,0]).line,[2,4,2,0]));
test('初始存在两块数字',()=>{const s=G.init(()=>0);assert.equal(s.board.filter(Boolean).length,2);assert.equal(s.status,'ready');});
test('按左键合并计分并记录步数',()=>{const s={board:[2,2,0,0,...Array(12).fill(0)],score:0,moves:0,status:'playing',history:null};const v=G.move(s,'left',()=>0.5);assert.equal(v.score,4);assert.equal(v.board[0],4);assert.equal(v.moves,1);});
test('方向不合法时不变动',()=>{const s=G.begin(G.init(()=>0));assert.equal(G.move(s,'diagonal'),s);});
test('撤销还原盘面和得分',()=>{const s={board:[2,2,0,0,...Array(12).fill(0)],score:0,moves:0,status:'playing',history:null};const v=G.undo(G.move(s,'left',()=>0));assert.deepEqual(v.board,s.board);assert.equal(v.score,0);});
test('满盘但存在相邻同数仍可移动',()=>assert.equal(G.canMove(Array.from({length:16},(_,i)=>i%4===0?2:4)),true));
test('满盘且无相邻同数时无法移动',()=>assert.equal(G.canMove([2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2]),false));
