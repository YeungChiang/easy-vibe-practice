const $=id=>document.getElementById(id);
const single=new URLSearchParams(location.search).get('mode')==='single';
if(single)document.querySelector('.shell').classList.add('single');
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
let templates=read('easyvibe04_templates',[]), drafts=read('easyvibe04_drafts',[]);
if(!Array.isArray(templates))templates=[];if(!Array.isArray(drafts))drafts=[];
function make(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function setMessage(id,msg,error=false){$(id).textContent=msg;$(id).className=error?'error':'';}
function route(){const id=single?'workspace':(['overview','workspace','templates'].includes(location.hash.slice(1))?location.hash.slice(1):'overview');document.querySelectorAll('.page').forEach(x=>x.hidden=x.id!==id);document.querySelectorAll('nav a').forEach(x=>x.classList.toggle('active',x.dataset.page===id));$('page-title').textContent={overview:'内容工作台',workspace:'内容制作',templates:'模板库'}[id];render();}
function render(){
 $('draft-count').textContent=drafts.length;$('template-count').textContent=templates.length;
 const selection=$('template-select').value;$('template-select').replaceChildren(new Option('默认格式',''));templates.forEach((t,i)=>$('template-select').append(new Option(t.name,String(i))));if([...$('template-select').options].some(x=>x.value===selection))$('template-select').value=selection;
 const results=$('results');results.replaceChildren();if(!drafts.length)results.append(make('p','录入商品后即可生成草稿。','empty'));
 drafts.forEach((d,i)=>{
 const card=make('article',undefined,'result'),poster=make('div',undefined,'poster');poster.append(make('small',d.category),make('strong',d.name),make('span',d.features));card.append(poster,make('small',d.source==='ai'?'AI 文案 · '+d.model:'规则草稿 · 非模型生成'));
 const titleLabel=make('label','商品标题'),title=make('input');title.value=d.title;titleLabel.append(title);const copyLabel=make('label','卖点文案'),copy=make('textarea');copy.rows=3;copy.value=d.copy;copyLabel.append(copy);
 const update=()=>{d.title=title.value;d.copy=copy.value;write('easyvibe04_drafts',drafts)};title.oninput=update;copy.oninput=update;
 const actions=make('div',undefined,'actions'),save=make('button','保存为模板'),del=make('button','移除草稿');save.onclick=()=>{update();const name=prompt('模板名称',d.category+'内容模板');if(name===null)return;try{const fields=['name','category','features','audience'].filter(k=>d[k]).sort((a,b)=>d[b].length-d[a].length);const format=s=>{let result=s;for(const k of fields){result=result.split(d[k]).join('{'+k+'}')}return result};templates.push(ContentCore.makeTemplate(name,format(d.title),format(d.copy)));const ok=write('easyvibe04_templates',templates);setMessage('message',ok?'模板已保存':'模板已保存在本次会话，浏览器存储不可用');render()}catch(e){setMessage('message',e.message,true)}};del.onclick=()=>{drafts.splice(i,1);write('easyvibe04_drafts',drafts);render()};actions.append(save,del);card.append(titleLabel,copyLabel,actions);results.append(card);
 });
 const list=$('template-list');list.replaceChildren();if(!templates.length)list.append(make('p','尚无模板，可新增或从草稿中收藏。','empty'));
 templates.forEach((t,i)=>{const card=make('article',undefined,'result');card.append(make('h2',t.name),make('p',t.titlePattern),make('p',t.copyPattern));const edit=make('button','编辑'),use=make('button','套用'),del=make('button','删除');edit.onclick=()=>{$('t-name').value=t.name;$('t-title').value=t.titlePattern;$('t-copy').value=t.copyPattern;$('add-template').dataset.edit=String(i);$('add-template').textContent='保存修改';$('t-name').focus()};use.onclick=()=>{location.hash='workspace';route();$('template-select').value=String(i);setMessage('message','已选中模板：'+t.name)};del.onclick=()=>{if(!confirm('删除模板 '+t.name+'？'))return;templates.splice(i,1);delete $('add-template').dataset.edit;$('add-template').textContent='保存模板';write('easyvibe04_templates',templates);render()};const a=make('div',undefined,'actions');a.append(edit,use,del);card.append(a);list.append(card)});
}
$('example').onclick=()=>{$('products').value='山野随行杯 | 户外水杯 | 轻便耐用 | 徒步爱好者\n云岚旅行包 | 旅行配件 | 分区收纳 | 周末出游人群';setMessage('message','已载入两条虚构教学商品')};
$('generate').onclick=()=>{try{const ps=ContentCore.parseProducts($('products').value),t=$('template-select').value;drafts=ps.map(p=>ContentCore.makeDraft(p,t===''?null:templates[Number(t)]));const ok=write('easyvibe04_drafts',drafts);setMessage('message','已生成 '+drafts.length+' 条规则草稿'+(ok?'':'（仅本次会话）'));render()}catch(e){setMessage('message',e.message,true)}};
$('add-template').onclick=()=>{try{const t=ContentCore.makeTemplate($('t-name').value,$('t-title').value,$('t-copy').value);const edit=$('add-template').dataset.edit;if(edit!==undefined&&templates[Number(edit)])templates[Number(edit)]=t;else templates.push(t);delete $('add-template').dataset.edit;$('add-template').textContent='保存模板';const ok=write('easyvibe04_templates',templates);$('t-name').value='';setMessage('template-message',ok?'已保存':'已保存至本次会话');render()}catch(e){setMessage('template-message',e.message,true)}};
window.addEventListener('hashchange',route);route();

// AI capability: distinct from the offline rule-based generator.
const aiButton=$('generate-ai');let aiReady=false, busy=false;
async function checkApi(){
 try {const r=await fetch('/api/status',{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();aiReady=data.configured===true;$('ai-status').textContent=aiReady?'已配置 '+data.model+' · 待调用':'规则模式 · 未配置 API Key';}
 catch{$('ai-status').textContent='规则模式 · 服务未启动';}
 aiButton.disabled=!aiReady;
}
aiButton.onclick=async()=>{
 if(busy||!aiReady)return;
 let product;try{const products=ContentCore.parseProducts($('products').value);if(products.length!==1)throw Error('AI 生成请只保留一行商品资料');product=products[0];}catch(e){setMessage('message',e.message,true);return;}
 busy=true;aiButton.disabled=true;$('generate').disabled=true;$('example').disabled=true;$('products').disabled=true;setMessage('message','正在调用模型，请等待…');
 try{
  const response=await fetch('/api/generate-copy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(product)});
  const data=await response.json();if(!response.ok)throw Error(data.error||'生成失败');
  const copy=[data.summary,...data.selling_points.map((s,i)=>(i+1)+'. '+s)].join('\n');
  drafts=[{...product,title:data.title,copy,source:'ai',model:data.model}];const saved=write('easyvibe04_drafts',drafts);render();
  setMessage('message','模型已返回 · '+data.model+' · Token '+(data.usage?.total_tokens??'未返回')+' · 请求 '+(data.request_id??'未返回')+(saved?'':' · 仅本次会话')+'。发布前请核对商品事实。');
 }catch(e){setMessage('message','AI 生成失败：'+e.message+'。已保留原草稿，可稍后重试。',true);}
 finally{busy=false;aiButton.disabled=!aiReady;$('generate').disabled=false;$('example').disabled=false;$('products').disabled=false;}
};
if(location.protocol!=='file:')checkApi();else $('ai-status').textContent='离线规则模式 · 请启动 Node 服务';
