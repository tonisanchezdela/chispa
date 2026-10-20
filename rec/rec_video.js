const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:process.env.LOCAL?'/opt/pw-browsers/chromium':undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
const c=await b.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:'out',size:{width:1920,height:1080}}});
await c.addInitScript(()=>{let cfg='';window.Android={abrirApp(){},ubicacion(){setTimeout(()=>window.__ubi&&window.__ubi(39.4699,-0.3763,null),900)},avisoEstado(){return cfg},avisoActivar(j){cfg=j;setTimeout(()=>window.__aviso&&window.__aviso('activo'),150)},avisoQuitar(){cfg='';setTimeout(()=>window.__aviso&&window.__aviso('quitado'),150)}}});
if(process.env.LOCAL){await c.route(/routing|osrm/,r=>{const a=[-0.3763,39.4699],z=[-3.7038,40.4168];const co=[];for(let i=0;i<=200;i++){const u=i/200;co.push([a[0]+(z[0]-a[0])*u+Math.sin(u*9)*.08,a[1]+(z[1]-a[1])*u+Math.sin(u*5)*.05])}r.fulfill({contentType:'application/json',body:JSON.stringify({code:'Ok',routes:[{distance:356000,duration:12600,geometry:{type:'LineString',coordinates:co}}]})})})}
const p=await c.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,200))});
const T0=Date.now();const now=()=>(Date.now()-T0)/1000;let S0=0;const mark=n=>{S0=now();console.log('MARK',n,S0.toFixed(2))};
const padTo=async s=>{const r=s-(now()-S0);console.log('  used',(now()-S0).toFixed(2),'of',s);if(r>0)await p.waitForTimeout(r*1000)};
const shot=async n=>{await p.screenshot({path:'shots/'+n+'.png'})};
await p.goto('http://localhost:8770/stage.html');
const f=p.frameLocator('#app');const fr=()=>p.frames().find(x=>x.url().includes('app.html'));
const w=ms=>p.waitForTimeout(ms);
await f.locator('#list .card').first().waitFor({timeout:60000});
await fr().evaluate(()=>{try{localStorage.removeItem('chispa')}catch(e){}});
// precalentar (oculto tras la intro): Valencia, mapa cargado y punto con más gasolineras
const glWait=()=>fr().evaluate(()=>new Promise(r=>{const t0=Date.now();(function k(){const m=window.GL&&GL.map;if(m&&m.isStyleLoaded()&&m.areTilesLoaded())return r(true);if(Date.now()-t0>25000)return r(false);setTimeout(k,250)})()}));
await fr().evaluate(()=>{const q=document.querySelector('#q');q.focus();q.value='Valenc';q.dispatchEvent(new Event('input',{bubbles:true}))});await w(600);
await fr().evaluate(()=>{const b=document.querySelector('#sugg button');b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));b.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));b.click()});await w(1000);
console.log('LOC',await fr().evaluate(()=>document.querySelector('#hereName').textContent));
await fr().evaluate(()=>document.querySelector('#tabs [data-v=map]').click());console.log('GL0',await glWait());
await fr().evaluate(()=>GL.map.jumpTo({center:[-0.3763,39.4699],zoom:10.3}));console.log('GL0b',await glWait());await w(500);
const best=await fr().evaluate(()=>{const fs=GL.map.querySourceFeatures('pts');const c=fs.map(f=>f.geometry.coordinates);let b=null,bn=-1;for(const a of c){let n=0;for(const q of c)if(Math.abs(q[0]-a[0])<.013&&Math.abs(q[1]-a[1])<.009)n++;if(n>bn){bn=n;b=a}}return {b,bn,tot:c.length}});console.log('BEST',JSON.stringify(best));
await fr().evaluate(b=>{GL.map.jumpTo({center:b,zoom:13.7})},best.b);console.log('GL1',await glWait());await w(800);
await fr().evaluate(b=>{GL.map.jumpTo({center:[b[0]-0.012,b[1]+0.012],zoom:13.7})},best.b);console.log('GL1b',await glWait());
await fr().evaluate(()=>{document.querySelector('#tabs [data-v=list]').click();const q=document.querySelector('#q');q.value='';q.blur();const sg=document.querySelector('#sugg');if(sg)sg.hidden=true});await fr().evaluate(()=>scrollTo(0,0));await w(1200);
mark('intro');await w(4100);
await p.evaluate(()=>document.getElementById('intro').classList.add('go'));await w(900);
const cap=(s,t,l)=>p.evaluate(([s,t,l])=>cap(s,t,l),[s,t,l]);
async function tap(sel,opt={}){const l=f.locator(sel).first();await l.scrollIntoViewIfNeeded().catch(()=>{});await w(100);const r=await l.boundingBox();if(!r){console.log('NO BOX',sel);return}
  await p.evaluate(([x,y])=>dotTo(x,y),[r.x+r.width/2,r.y+r.height/2]);await w(430);await p.evaluate(()=>dotTap());await w(120);if(!opt.fake)await l.click({force:true});await w(opt.after||600)}
const scrollTo=async(sel,off=10)=>{await fr().evaluate(([sel,off])=>{const e=document.querySelector(sel);const y=e.getBoundingClientRect().top+scrollY-off;scrollTo({top:y,behavior:'smooth'})},[sel,off]);await w(800)};
const slide=async(sel,to,ms=1000)=>{await fr().evaluate(([sel,to,ms])=>new Promise(res=>{const e=document.querySelector(sel);const from=+e.value;const t0=performance.now();const st=+e.step||1;(function k(t){const u=Math.min(1,(t-t0)/ms);e.value=Math.round((from+(to-from)*u)/st)*st;e.dispatchEvent(new Event('input',{bubbles:true}));u<1?requestAnimationFrame(k):res()})(t0)}),[sel,to,ms]);await w(400)};
const hide=()=>p.evaluate(()=>dotHide());

// 1 busca
mark('s1');await cap('1 · Busca','Elige y <em>busca</em>',['Diésel, gasolina, eléctrico o GLP','Cerca de ti, por pueblo o código postal']);await w(500);
await tap('#modes [data-g=e]',{after:500});await tap('#modes [data-g=d]',{after:300});
await tap('#q',{after:250});await f.locator('#q').pressSequentially('Valenc',{delay:80});await w(400);await tap('#sugg button',{after:700});
await padTo(7.4);
// 2 compara
mark('s2');await cap('2 · Compara','Los <em>más baratos</em>, primero',['Ordena por precio o distancia','Filtra por precio, marca o 24 horas']);await w(300);
await scrollTo('#stats');await w(500);await tap('#sortChips [data-s=d]',{after:700});await tap('#sortChips [data-s=p]',{after:400});
await scrollTo('#filters');await hide();await slide('#rad',25,800);await tap('#moreF',{after:700});await hide();
await padTo(7.2);
// 3 mapa
mark('s3');await cap('Nuevo · Mapa','Un <em>mapa real</em>',['Con todas las calles','Marca y precio en cada punto','Verde barato · rosa caro']);
await fr().evaluate(()=>scrollTo({top:0,behavior:'smooth'}));await w(500);await scrollTo('#tabs',14);await tap('#tabs [data-v=map]',{after:300});
console.log('t',now().toFixed(1));console.log('GL',await glWait(),now().toFixed(1));await fr().evaluate(()=>GL.map.jumpTo({center:[-0.3763,39.4699],zoom:10.3}));await w(1300);
await fr().evaluate(b=>{GL.map.flyTo({center:b,zoom:13.7,duration:3000})},best.b);await w(3600);console.log('t',now().toFixed(1));
await fr().evaluate(()=>GL.map.panBy([-110,110],{duration:1500}));await w(1800);
await padTo(11);
// 4 ruta
mark('s4');await cap('Nuevo · Rutas','Planifica tu <em>viaje</em>',['Destino y desvío máximo','Cada cuántos km repostar','Las paradas más baratas de la ruta']);
await fr().evaluate(()=>scrollTo({top:0,behavior:'smooth'}));await w(500);
await tap('#routeBtn',{after:900});await tap('#rTo',{after:200});await f.locator('#rTo').pressSequentially('Madri',{delay:110});await w(600);await tap('#rToS button',{after:600});
await hide();await slide('#rDev',3,800);await slide('#rStep',125,1100);
await tap('#rGo',{after:300});
await f.locator('#rRes .stops li').first().waitFor({timeout:25000}).catch(e=>console.log('NO ROUTE',e.message.split('\n')[0]));
await w(600);await scrollTo('#rRes',72);await w(2000);
await scrollTo('#mapbox',10);await w(2300);await shot('s4b');
await padTo(15.5);
// 5 ficha
mark('s5');await cap('3 · Ficha','Todo, en <em>un toque</em>',['Todos los precios y el horario','Ve con Google Maps']);
await scrollTo('#rRes .stops',60);await tap('#rRes .stops li[data-k]',{after:1200});await hide();
await fr().evaluate(()=>document.querySelector('#dlg').scrollTo({top:300,behavior:'smooth'}));await w(1200);
await fr().evaluate(()=>document.querySelector('#dlg').scrollTo({top:0,behavior:'smooth'}));await w(700);await tap('#dlg .go',{fake:true,after:700});await tap('#dlg [data-x]',{after:400});
await padTo(6.8);
// 6 avisos
mark('s6');await cap('Y además','Te avisa si <em>baja</em>',['Aviso de bajada en tu zona','Precios oficiales, al día','Gratis y sin registro']);
await tap('#rOff',{after:500});await fr().evaluate(()=>scrollTo({top:0,behavior:'smooth'}));await w(600);
await tap('#avisoBtn',{after:1300});await hide();
await p.evaluate(n=>{document.getElementById('notiT').textContent='Baja el Diésel en '+n;document.getElementById('noti').classList.add('on')},await fr().evaluate(()=>document.querySelector('#hereName').textContent));await w(2600);await shot('s6a');
await p.evaluate(()=>document.getElementById('noti').classList.remove('on'));
await padTo(7.6);
mark('fade');await p.evaluate(()=>document.getElementById('black').classList.add('on'));await w(2200);
mark('end');const v=p.video();await c.close();console.log('VIDEO',await v.path());await b.close()})().catch(e=>{console.log('FATAL',e.message.split('\n')[0]);process.exit(1)});
