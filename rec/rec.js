const {chromium}=require('playwright');
const V=process.env.ORIENT==='v',OUT=V?'out_v':'out_h',SH=V?'shots_v/':'shots_h/';
const W=V?1080:1920,H=V?1920:1080;
(async()=>{
const b=await chromium.launch({executablePath:process.env.LOCAL?'/opt/pw-browsers/chromium':undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
const c=await b.newContext({viewport:{width:W,height:H},recordVideo:{dir:OUT,size:{width:W,height:H}}});
await c.addInitScript(()=>{let cfg='';window.Android={abrirApp(){},ubicacion(){},avisoEstado(){return cfg},avisoActivar(j){cfg=j;setTimeout(()=>window.__aviso&&window.__aviso('activo'),150)},avisoQuitar(){cfg='';setTimeout(()=>window.__aviso&&window.__aviso('quitado'),150)}}});
if(process.env.LOCAL){await c.route(/routing|osrm/,r=>{const u=r.request().url();const a=[-0.41,39.42],z=[-3.7038,40.4168];const co=[];for(let i=0;i<=200;i++){const k=i/200;co.push([a[0]+(z[0]-a[0])*k+Math.sin(k*9)*.08,a[1]+(z[1]-a[1])*k+Math.sin(k*5)*.05])}
  r.fulfill({contentType:'application/json',body:JSON.stringify({code:'Ok',routes:[{distance:/overview=false/.test(u)?4300:356000,duration:12600,geometry:{type:'LineString',coordinates:co}}]})})})}
const p=await c.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message));
const T0=Date.now();const now=()=>(Date.now()-T0)/1000;let S0=0;const mark=n=>{S0=now();console.log('MARK',n,S0.toFixed(2))};
const padTo=async s=>{const r=s-(now()-S0);console.log('  used',(now()-S0).toFixed(2),'of',s);if(r>0)await p.waitForTimeout(r*1000)};
const shot=async n=>{if(process.env.SHOTS)await p.screenshot({path:SH+n+'.jpg',quality:80})};
await p.goto('http://localhost:'+(process.env.PORT||8770)+'/'+(V?'stage_v.html':'stage.html'));
const f=p.frameLocator('#app');const fr=()=>p.frames().find(x=>x.url().includes('app.html'));
const w=ms=>p.waitForTimeout(ms);
await f.locator('#list .card').first().waitFor({timeout:60000});
// precalentar (oculto tras la intro)
const glWait=()=>fr().evaluate(()=>new Promise(r=>{const t0=Date.now();(function k(){const m=window.GL&&GL.map;if(m&&m.isStyleLoaded()&&m.areTilesLoaded())return r(true);if(Date.now()-t0>25000||!m)return r(false);setTimeout(k,250)})()}));
await w(1200);await fr().evaluate(()=>{const d=document.querySelector('#vdlg');if(d.open)d.close()});
await fr().evaluate(()=>{const q=document.querySelector('#q');q.focus();q.value='Alfafar';q.dispatchEvent(new Event('input',{bubbles:true}))});await w(600);
await fr().evaluate(()=>{const b=document.querySelector('#sugg button');b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));b.click()});await w(1000);
console.log('LOC',await fr().evaluate(()=>document.querySelector('#hereName').textContent));
await fr().evaluate(()=>document.querySelector('#tabs [data-v=map]').click());console.log('GL0',await glWait());
const ctr=await fr().evaluate(()=>{try{return GL.map.getSource('center').serialize().data.features[0].geometry.coordinates}catch(e){return null}});console.log('CTR',JSON.stringify(ctr));
if(ctr){await fr().evaluate(c=>GL.map.jumpTo({center:c,zoom:13.6}),ctr);console.log('GL1',await glWait());await fr().evaluate(c=>GL.map.jumpTo({center:[c[0],c[1]-0.004],zoom:13.6}),ctr);await glWait();
  await fr().evaluate(()=>GL.map.jumpTo({center:[-2.0,40.0],zoom:6.2}));await glWait();await fr().evaluate(c=>GL.map.jumpTo({center:c,zoom:11.5}),ctr);await glWait()}
await fr().evaluate(()=>{document.querySelector('#tabs [data-v=list]').click();const q=document.querySelector('#q');q.value='';q.blur();const sg=document.querySelector('#sugg');if(sg)sg.hidden=true;scrollTo(0,0)});await w(1200);

const cap=(s,t,l)=>p.evaluate(([s,t,l])=>cap(s,t,l),[s,t,l]);
async function tap(sel,opt={}){const l=f.locator(sel).first();await l.scrollIntoViewIfNeeded().catch(()=>{});await w(80);const r=await l.boundingBox();if(!r){console.log('NO BOX',sel);return}
  await p.evaluate(([x,y])=>dotTo(x,y),[r.x+r.width/2,r.y+r.height/2]);await w(380);await p.evaluate(()=>dotTap());await w(110);if(!opt.fake)await l.click({force:true});await w(opt.after||450)}
const scrollTo=async(sel,off=10)=>{await fr().evaluate(([sel,off])=>{const e=document.querySelector(sel);const y=e.getBoundingClientRect().top+scrollY-off;scrollTo({top:y,behavior:'smooth'})},[sel,off]);await w(700)};
const slide=async(sel,to,ms=700)=>{await fr().evaluate(([sel,to,ms])=>new Promise(res=>{const e=document.querySelector(sel);const from=+e.value;const t0=performance.now();const st=+e.step||1;(function k(t){const u=Math.min(1,(t-t0)/ms);e.value=Math.round((from+(to-from)*u)/st)*st;e.dispatchEvent(new Event('input',{bubbles:true}));u<1?requestAnimationFrame(k):res()})(t0)}),[sel,to,ms]);await w(250)};
const hide=()=>p.evaluate(()=>dotHide());

mark('intro');await w(2700);
await p.evaluate(()=>document.getElementById('intro').classList.add('go'));await w(800);await shot('0');
// 1 precios
mark('s1');await cap('Precios oficiales','Toda España, <em>al día</em>',['Diésel, gasolina, eléctrico y GLP','Los más baratos, primero']);await w(300);
await tap('#modes [data-g=g]',{after:350});await tap('#modes [data-g=e]',{after:350});await tap('#modes [data-g=d]',{after:300});
await scrollTo('#stats',10);await w(300);await shot('1');
await padTo(4.6);
// 2 vehículo
mark('s2');await cap('Nuevo · Tu vehículo','Dile qué <em>conduces</em>',['Coche, furgoneta o camión','Marca, modelo, motor y año']);
await fr().evaluate(()=>scrollTo({top:0,behavior:'smooth'}));await w(350);
await tap('#vehBtn',{after:500});await tap('#vTypes [data-t=tt]',{after:400});await tap('#vTypes [data-t=car]',{after:300});
await tap('#vBrand',{fake:true,after:100});await fr().evaluate(()=>{const s=document.querySelector('#vBrand');s.value='Seat';s.dispatchEvent(new Event('change'))});await w(250);
await tap('#vModel',{fake:true,after:100});await fr().evaluate(()=>{const s=document.querySelector('#vModel');s.value='León';s.dispatchEvent(new Event('change'))});await w(250);
await fr().evaluate(()=>{const s=document.querySelector('#vMotor');s.value='1';s.dispatchEvent(new Event('change'));document.querySelector('#vdlg').scrollTo({top:300,behavior:'smooth'})});await w(500);await shot('2');
await tap('#vSave',{after:300});await hide();
await padTo(4.4);
// 3 coste y ahorro
mark('s3');await cap('Nuevo · Tu repostaje','Lo que cuesta y <em>lo que ahorras</em>',['Depósito, ir y volver, y total','Frente a la media y la más cara']);
await scrollTo('#stats',10);await tap('#list .card h3',{after:300});await hide();await w(1400);
await fr().evaluate(t=>document.querySelector('#dlg').scrollTo({top:t,behavior:'smooth'}),V?170:190);await w(1500);await shot('3');
await padTo(6.4);
// 4 mapa y ruta
mark('s4');await cap('Mapa y rutas','Planifica tu <em>viaje</em>',['Marca y precio en el mapa','Las paradas más baratas']);
await fr().evaluate(()=>document.querySelector('#dlg').close());await scrollTo('#tabs',14);await tap('#tabs [data-v=map]',{after:200});await hide();await fr().evaluate(()=>{const x=document.querySelector('#pop .x');if(x)x.click()});
if(ctr){await fr().evaluate(c=>GL.map.flyTo({center:c,zoom:13.6,duration:1800}),ctr);await w(2100)}else await w(1200);await shot('4a');
await fr().evaluate(()=>scrollTo({top:0,behavior:'smooth'}));await w(300);
await tap('#routeBtn',{after:500});await f.locator('#rTo').fill('Madri');await fr().evaluate(()=>document.querySelector('#rTo').dispatchEvent(new Event('input',{bubbles:true})));await w(300);
await tap('#rToS button',{after:200});await hide();await slide('#rStep',125,600);
await tap('#rGo',{after:200});await hide();
await f.locator('#rRes .stops li').first().waitFor({timeout:25000}).catch(e=>console.log('NO ROUTE'));
await scrollTo('#mapbox',10);await w(1600);await shot('4b');
await padTo(6.6);
// 5 avisos
mark('s5');await cap('Y además','Te avisa si <em>baja</em>',['Aviso de bajada en tu zona','Gratis y sin anuncios']);
await tap('#rOff',{after:300});await fr().evaluate(()=>scrollTo({top:0,behavior:'smooth'}));await w(500);
await tap('#avisoBtn',{after:800});await hide();
await p.evaluate(n=>{document.getElementById('notiT').textContent='Baja el Diésel en '+n;document.getElementById('noti').classList.add('on')},await fr().evaluate(()=>document.querySelector('#hereName').textContent));await w(2000);await shot('5');
await padTo(5.2);
mark('fade');await w(1200);
mark('end');const v=p.video();await c.close();console.log('VIDEO',await v.path());await b.close()})().catch(e=>{console.log('FATAL',e.message.split('\n')[0]);process.exit(1)});
