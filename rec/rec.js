const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const c=await b.newContext({viewport:{width:400,height:844},deviceScaleFactor:2});
await c.addInitScript(()=>{localStorage.setItem('chispa',JSON.stringify({lat:39.4699,lon:-0.3763,name:'Valencia',r:15,mode:'da'}));localStorage.setItem('chispa_veh',JSON.stringify({type:'car',brand:'Seat',model:'León',motor:'2.0 TDI 115-150 CV',motorI:1,year:2021,mode:'da',cons:4.9,tank:50,lvl:.1}))});
const p=await c.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('CONSOLE',m.text().slice(0,160))});
await p.goto('http://localhost:8770/app.html');await p.waitForSelector('#list .card',{timeout:60000});
await p.click('#tabs [data-v=map]');
const ok=await p.evaluate(()=>new Promise(r=>{const t0=Date.now();(function k(){const m=GL.map;if(m&&GL.on&&m.isStyleLoaded()&&m.areTilesLoaded())return r(true);if(Date.now()-t0>30000)return r(false);setTimeout(k,300)})()}));console.log('GL',ok);
await p.evaluate(()=>{document.querySelector('#mapbox').scrollIntoView();GL.map.jumpTo({center:[-0.3763,39.4699],zoom:12.5})});await p.waitForTimeout(4000);await p.screenshot({path:'shots/m1.png'});
console.log('hasImg',await p.evaluate(()=>GL.map.hasImage('me')),await p.evaluate(()=>GL.map.getLayoutProperty('center','icon-offset')));
await p.click('#tabs [data-v=list]');await p.click('#list .card h3');await p.waitForTimeout(6000);await p.screenshot({path:'shots/d1.png'});
console.log('trip',await p.evaluate(()=>document.querySelector('#vbox .vk:nth-child(2) small').textContent));
// furgoneta
await p.evaluate(()=>{document.querySelector('#dlg').close()});await p.click('#vehBtn');await p.click('#vTypes [data-t=tm]');await p.click('#vSave');await p.waitForTimeout(1500);
await p.click('#tabs [data-v=map]');await p.evaluate(()=>{document.querySelector('#mapbox').scrollIntoView();GL.map.jumpTo({center:[-0.3763,39.4699],zoom:14})});await p.waitForTimeout(4000);await p.screenshot({path:'shots/m2.png'});
await b.close()})().catch(e=>{console.log('FATAL',e.message.split('\n')[0]);process.exit(1)});
