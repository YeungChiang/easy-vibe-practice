(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ContentCore=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
function parseProducts(text){
  const rows=String(text).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if(!rows.length)throw Error('请至少录入一个商品');
  if(rows.length>30)throw Error('每批最多 30 个商品');
  return rows.map((row,i)=>{const p=row.split('|').map(x=>x.trim());if(!p[0]||!p[1]||p.length!==4)throw Error('第 '+(i+1)+' 行需要四列：名称 | 类别 | 特点 | 人群');return {name:p[0],category:p[1],features:p[2],audience:p[3]};});
}
function makeDraft(product,template){
  const p=product;
  const replace=s=>String(s).replace(/\{(name|category|features|audience)\}/g,(_,key)=>p[key]||'');
  const titlePattern=template?.titlePattern||'{name} · {category}';
  const copyPattern=template?.copyPattern||'{features}。适合{audience}。';
  return {...p,title:replace(titlePattern),copy:replace(copyPattern)};
}
function makeTemplate(name,titlePattern,copyPattern){
  if(!String(name).trim()||!String(titlePattern).trim()||!String(copyPattern).trim())throw Error('模板名称、标题格式和文案格式不能为空');
  return {name:String(name).trim(),titlePattern:String(titlePattern).trim(),copyPattern:String(copyPattern).trim()};
}
return {parseProducts,makeDraft,makeTemplate};
});
