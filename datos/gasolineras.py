# Genera fuel.json de Chispa a partir del CSV diario de precios oficiales de carburantes (MITECO).
# Uso: python3 refresh_fuel.py <estaciones.csv> <fecha AAAA-MM-DD> <salida fuel.json>
import csv,json,sys,os,re,collections
SRC,DATE,OUT=sys.argv[1:4]
rows=list(csv.DictReader(open(SRC,encoding='utf8')))
def pr(v):
    try:
        f=float(v)
        return round(f*1000) if 0.3<f<4 else -1
    except: return -1
def brand(r): return re.sub(r'\s+',' ',(r['rotulo'] or '').upper().strip()) or 'SIN RÓTULO'
cnt=collections.Counter(brand(r) for r in rows)
top=[b for b,n in cnt.most_common(60) if n>=8 and not re.match(r'^N[ºO°]',b)][:45]
ops=top+['OTRAS MARCAS'];ix={b:i for i,b in enumerate(ops)}
out=[]
for r in rows:
    try: la,lo=float(r['lat']),float(r['lon'])
    except: continue
    if not(27<la<44.5 and -18.5<lo<4.8): continue
    p=[pr(r['gasolina_95_e5']),pr(r['gasolina_98_e5']),pr(r['gasoleo_a']),pr(r['gasoleo_premium']),pr(r['glp'])]
    if max(p)<0: continue
    cp=re.sub(r'\D','',r['cp'] or '').zfill(5)[:5]
    out.append([round(la,5),round(lo,5),(r['rotulo'] or '').strip()[:50],(r['direccion'] or '').strip().title()[:70],(r['municipio'] or '').strip()[:40],cp,ix.get(brand(r),len(ops)-1)]+p+[(r['horario'] or '').strip()[:90],(r['provincia'] or '').strip()[:30],int(r['id'])])
if len(out)<9000: sys.exit('ABORTADO: solo %d gasolineras, el fichero parece incompleto'%len(out))
json.dump({'date':DATE,'ops':ops,'s':out},open(OUT,'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
print('OK',len(out),'gasolineras; fecha',DATE,';',os.path.getsize(OUT),'bytes; con 95:',sum(1 for r in out if r[7]>=0),'diésel A:',sum(1 for r in out if r[9]>=0),'GLP:',sum(1 for r in out if r[11]>=0))
