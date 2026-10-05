# Descarga los precios oficiales de carburantes (MITECO) y los deja en un CSV
# con las columnas que espera gasolineras.py. Si el servicio del Ministerio no
# responde, usa como respaldo una copia pública diaria de esos mismos datos.
# Uso: python3 miteco.py <salida.csv>   -> imprime la fecha AAAA-MM-DD de los datos
import csv,json,sys,urllib.request,datetime,io
OUT=sys.argv[1]
API='https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'
RESPALDO='https://raw.githubusercontent.com/IvanAraque/precios-carburantes/main/data/latest/estaciones.csv'
COLS=['id','rotulo','provincia','municipio','localidad','direccion','cp','lat','lon','horario','gasolina_95_e5','gasolina_98_e5','gasoleo_a','gasoleo_premium','glp']
def baja(url,t):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (Chispa; datos abiertos)','Accept':'application/json,text/csv,*/*'})
    return urllib.request.urlopen(req,timeout=t).read()
def num(v): return (v or '').strip().replace(',','.')
hoy=datetime.date.today().isoformat()
try:
    d=json.loads(baja(API,120).decode('utf-8-sig'))
    lista=d['ListaEESSPrecio']
    if len(lista)<9000: raise ValueError('pocas estaciones: %d'%len(lista))
    try: fecha=datetime.datetime.strptime(d['Fecha'].split()[0],'%d/%m/%Y').date().isoformat()
    except Exception: fecha=hoy
    with open(OUT,'w',newline='',encoding='utf8') as f:
        w=csv.writer(f);w.writerow(COLS)
        for e in lista:
            w.writerow([e.get('IDEESS',''),e.get('Rótulo',''),e.get('Provincia',''),e.get('Municipio',''),e.get('Localidad',''),e.get('Dirección',''),e.get('C.P.',''),num(e.get('Latitud')),num(e.get('Longitud (WGS84)')),e.get('Horario',''),num(e.get('Precio Gasolina 95 E5')),num(e.get('Precio Gasolina 98 E5')),num(e.get('Precio Gasoleo A')),num(e.get('Precio Gasoleo Premium')),num(e.get('Precio Gases licuados del petróleo'))])
    sys.stderr.write('Fuente: Ministerio (%d estaciones)\n'%len(lista))
except Exception as ex:
    sys.stderr.write('El servicio del Ministerio ha fallado (%s); uso la copia de respaldo\n'%ex)
    txt=baja(RESPALDO,120).decode('utf8')
    if next(csv.reader(io.StringIO(txt)))!=COLS: sys.exit('La copia de respaldo ha cambiado de formato')
    open(OUT,'w',encoding='utf8').write(txt);fecha=hoy
print(fecha)
