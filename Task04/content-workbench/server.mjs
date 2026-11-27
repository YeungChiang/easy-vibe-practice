import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {generateCopy,validateProduct} from './ai.mjs';
const key=process.env.DEEPSEEK_API_KEY||'';
const model=process.env.DEEPSEEK_MODEL||'deepseek-flash';
const port=Number(process.env.PORT||8766);
const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/core.js':'core.js','/app.js':'app.js'};
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8'};
let busy=false;
http.createServer(async(req,res)=>{
 const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
 const allowed=['127.0.0.1:'+port,'localhost:'+port];
 if(!allowed.includes(req.headers.host))return send(403,{error:'仅支持本地访问'});
 const origin=req.headers.origin;
 if(origin&&!allowed.map(h=>'http://'+h).includes(origin))return send(403,{error:'不允许跨站请求'});
 const path=new URL(req.url,'http://127.0.0.1').pathname;
 try{
  if(req.method==='GET'&&path==='/api/status')return send(200,{configured:!!key,model});
  if(req.method==='POST'&&path==='/api/generate-copy'){
   if(!key)return send(503,{error:'尚未配置 DEEPSEEK_API_KEY'});
   if(busy)return send(429,{error:'已有生成任务，请等待'});
   if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return send(415,{error:'请使用 JSON 请求'});
   busy=true;
   try{
    let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>8192)return send(413,{error:'输入过长'});}
    let product;try{product=validateProduct(JSON.parse(raw));}catch(e){return send(400,{error:'商品输入无效：'+(e instanceof SyntaxError?'JSON 格式错误':e.message)});}
    try{const result=await generateCopy(product,{key,model,signal:AbortSignal.timeout(60000)});
     console.log(JSON.stringify({time:new Date().toISOString(),model:result.model,request_id:result.request_id,usage:result.usage}));
     return send(200,result);
    }catch(e){console.error(JSON.stringify({time:new Date().toISOString(),upstreamStatus:e.upstreamStatus||null,error:e.name}));
     return send(e.status||502,{error:e.status?e.message:e.name==='TimeoutError'?'模型请求超时，请稍后重试':'模型请求失败或响应格式不正确，请检查网络及服务日志'});}
   }finally{busy=false;}
  }
  if(req.method==='GET'&&files[path]){const file=files[path],data=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'X-Content-Type-Options':'nosniff'});return res.end(data);}
  return send(404,{error:'Not found'});
 }catch{return send(500,{error:'本地服务异常'});}
}).listen(port,'127.0.0.1',()=>console.log('http://127.0.0.1:'+port+' / configured='+Boolean(key)));
