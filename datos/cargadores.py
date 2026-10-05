# Regenera stations.json de Chispa a partir del export abierto de Open Charge Map.
# Uso: python3 refresh.py <stations.json actual> <carpeta ocm-export> <fecha AAAA-MM-DD> <salida>
import json,glob,re,collections,sys,os,math
OLD,OCM,DATE,OUT=sys.argv[1:5]
old=json.load(open(OLD,encoding='utf8'))
ref=json.load(open(OCM+'/data/referencedata.json',encoding='utf8'))
ops={o['ID']:o['Title'] for o in ref['Operators']}
OPEN={o['ID'] for o in ref['DataProviders'] if o.get('IsOpenDataLicensed')}
REN={'(Business Owner at Location)':'Local / negocio','(Unknown Operator)':'Sin identificar','Iberdrola | BP Pulse (ES)':'Iberdrola | bp pulse','Repsol - Ibil (ES)':'Repsol','ACCIONA - Cargacoches':'Acciona','Tesla (including non-tesla)':'Tesla','ALDI SÜD (DE)':'Aldi','GALP Electric':'Galp','CEPSA (ES)':'Moeve (Cepsa)','MELIB (ES)':'MELIB','AMB (Àrea metropolitana de Barcelona)':'AMB Barcelona','Telepark (Empark)':'Telepark','Fenie Energía (Spain)':'Fenie Energía','Tesla Motors (Worldwide)':'Tesla'}
def opname(i):
    t=ops.get(i) or 'Sin identificar'
    t=REN.get(t,t)
    return re.sub(r'\s*\((ES|Es|Spain|DE)\)\s*$','',t).strip()
CT={25:1,1036:1,33:2,32:2,2:4,28:8,30:16,27:16,8:16}
num=re.compile(r'(?:€\s*)?(\d+(?:[.,]\d+)?)\s*(?:€|eur|euros?)?\s*/\s*kwh',re.I)
def price(u,kw,dc):
    if not u: return None
    s=u.strip(); l=s.lower()
    ms=list(num.finditer(s))
    if not ms:
        if re.match(r'^(free|gratis|gratuit[oa]?|free of charge|0\s*€?)\b',l) and not re.search(r'\d+[.,]\d+',l): return 0
        return None
    c=[]
    for m in ms:
        v=float(m.group(1).replace(',','.'))
        if v>1.5: continue
        tail=s[m.end():m.end()+14].upper()
        lab='AC' if re.search(r'\bAC\b',tail) else ('DC' if re.search(r'\bDC\b|>',tail) else '')
        c.append((v,lab))
    if not c: return None
    if dc:
        x=[v for v,l in c if l!='AC'] or [v for v,l in c]
        return max(x) if kw>60 else min(x)
    x=[v for v,l in c if l=='AC'] or [v for v,l in c if l!='DC'] or [v for v,l in c]
    return min(x)
rows=[];oc=collections.Counter()
for f in glob.glob(OCM+'/data/ES/*.json'):
    d=json.load(open(f,encoding='utf8'))
    if d.get('DataProviderID') not in OPEN: continue  # solo datos con licencia abierta
    if d.get('StatusTypeID') not in (0,10,20,50,75,None): continue
    if d.get('UsageTypeID')==2: continue
    a=d.get('AddressInfo') or {}
    la,lo=a.get('Latitude'),a.get('Longitude')
    if la is None or not(27<la<44.5 and -18.5<lo<4.8): continue
    kw=0;mask=0;n=0;dc=False
    for c in d.get('Connections') or []:
        if c.get('StatusTypeID') in (100,150,200,210): continue
        p=c.get('PowerKW') or 0
        if p>400: p=0
        kw=max(kw,p);mask|=CT.get(c.get('ConnectionTypeID'),0);n+=c.get('Quantity') or 1
        if c.get('CurrentTypeID')==30 or c.get('ConnectionTypeID') in (33,32,2,27) or p>=43.5: dc=True
    if not mask and not kw: continue
    if kw==0: kw=50 if dc else (3.7 if mask==8 else 7.4)
    u=(d.get('UsageCost') or '').strip()
    p=price(u,kw,dc)
    op=opname(d.get('OperatorID'));oc[op]+=1
    pc=re.sub(r'\D','',a.get('Postcode') or '')
    if len(pc)==4: pc='0'+pc
    if len(pc)!=5: pc=''
    t=(a.get('Title') or '').strip()[:60];ad=(a.get('AddressLine1') or '').strip()[:70]
    if ad.lower()==t.lower(): ad=''
    town=(a.get('Town') or '').strip().title() if (a.get('Town') or '').isupper() else (a.get('Town') or '').strip()
    simple=bool(re.fullmatch(r'\s*(?:€\s*)?\d+[.,]?\d*\s*€?\s*/\s*kWh\s*|free|Free',u))
    cl=[]
    for c in d.get('Connections') or []:
        if c.get('StatusTypeID') in (100,150,200,210): continue
        cl.append([c.get('ConnectionTypeID') or 0,c.get('PowerKW') or 0,{10:1,20:2,30:3}.get(c.get('CurrentTypeID'),0),c.get('Quantity') or 1,c.get('Amps') or 0,c.get('Voltage') or 0])
    ph=[]
    for m in d.get('MediaItems') or []:
        mm=re.match(r'https://s3-ap-southeast-2\.amazonaws\.com/openchargemap/images/ES/OCM%d/OCM-%d\.orig\.(\w+)\.(jpe?g|png)$'%(d['ID'],d['ID']),m.get('ItemURL') or '',re.I)
        if mm and m.get('IsEnabled',True) and not m.get('IsVideo'): ph.append(mm.group(1)+'.'+mm.group(2))
    cm=re.sub(r'\s+',' ',(d.get('GeneralComments') or '')).strip()[:260]
    ac=re.sub(r'\s+',' ',(a.get('AccessComments') or '')).strip()[:200]
    extra=[cl,d.get('UsageTypeID') or 0,(d.get('DateLastVerified') or '')[:10],cm,ac,ph[:4],(a.get('ContactTelephone1') or '').strip()[:20],(a.get('StateOrProvince') or '').strip()[:30],(a.get('AddressLine2') or '').strip()[:50],d.get('StatusTypeID') or 0]
    rows.append([round(la,5),round(lo,5),t,ad,town[:40],pc,op,round(kw,1) if kw%1 else int(kw),mask,min(n,99),-1 if p is None else round(p*100),'' if simple else u[:140],d['ID']]+extra)
top=[o for o,_ in oc.most_common(40) if o not in('Local / negocio','Sin identificar')]
oplist=top+['Local / negocio','Sin identificar','Otras redes']
ix={o:i for i,o in enumerate(oplist)}
for r in rows: r[6]=ix.get(r[6],len(oplist)-1)
geo=old['geo']
cities=[c[:4] for c in old['cities']]
grid=collections.defaultdict(list)
for c in cities: grid[(int(c[1]*4),int(c[2]*4))].append(c)
for r in rows:
    if r[4]: continue
    best=None;bd=0.2
    gx,gy=int(r[0]*4),int(r[1]*4)
    for i in(-1,0,1):
        for j in(-1,0,1):
            for c in grid.get((gx+i,gy+j),[]):
                d=math.hypot(c[1]-r[0],(c[2]-r[1])*0.76)
                if d<bd: bd=d;best=c
    if best: r[4]=best[0]
pcs=collections.defaultdict(list)
for r in rows:
    if r[5]: pcs[r[5]].append(r)
pcl=[[k,round(sum(x[0] for x in v)/len(v),4),round(sum(x[1] for x in v)/len(v),4)] for k,v in sorted(pcs.items())]

if len(rows)<15000: sys.exit('ABORTADO: solo %d cargadores, el export parece incompleto'%len(rows))
json.dump({'ops':oplist,'date':DATE,'geo':geo,'cities':cities,'pcs':pcl},open(OUT+'.tmp','w'))  # prueba de serializacion
os.remove(OUT+'.tmp')
json.dump({'ops':oplist,'date':DATE,'geo':geo,'cities':cities,'pcs':pcl,'s':rows},open(OUT,'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print('OK',len(rows),'cargadores;',sum(1 for r in rows if r[10]>=0),'con precio; antes',len(old['s']),'; fecha',DATE,';',os.path.getsize(OUT),'bytes')
