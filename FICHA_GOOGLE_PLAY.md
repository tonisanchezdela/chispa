# Chispa · Datos para la ficha de Google Play

Copia y pega cada bloque en el apartado de Play Console que se indica.

## 1. Crear la app (Play Console → Crear app)

| Campo | Valor |
|---|---|
| Nombre de la app | Chispa: gasolineras y recarga |
| Idioma predeterminado | Español (España) – es-ES |
| App o juego | App |
| Gratuita o de pago | **Gratuita** (no se podrá cambiar a de pago) |

## 2. Ficha principal de Play Store (Crecer → Presencia en Play Store → Ficha principal)

**Nombre de la app** (máx. 30):
```
Chispa: gasolineras y recarga
```

**Descripción breve** (máx. 80):
```
Gasolineras y cargadores eléctricos más baratos cerca de ti, en lista y en mapa.
```

**Descripción completa** (máx. 4000):
```
Chispa te dice dónde repostar o recargar tu coche más barato y más cerca, en toda España.

⛽ DIÉSEL, GASOLINA Y GLP
Elige tu combustible (diésel normal o premium, gasolina 95 o 98, GLP) y verás las gasolineras de tu zona ordenadas por precio. Los precios son los oficiales que publica cada día el Ministerio para la Transición Ecológica.

🔌 COCHE ELÉCTRICO
Miles de cargadores públicos con su precio por kWh, potencia, tipo de conector (Tipo 2, CCS, CHAdeMO, Tesla) y número de tomas. Filtra por velocidad de carga, de lenta a ultrarrápida.

📍 BUSCA COMO QUIERAS
Cerca de ti, por pueblo o ciudad, por código postal o marcando un punto en el mapa. Tú eliges el radio de búsqueda.

💶 FILTRA Y ORDENA
Por rango de precio, por marca y, en gasolineras, solo las abiertas 24 horas. Ordena por precio o por distancia y mira el resultado en lista o en mapa, con cada punto coloreado según lo caro o barato que es.

🧮 CUÁNTO TE VA A COSTAR
Indica los litros o los kWh que quieres y verás el importe aproximado en cada sitio.

🧭 FICHA COMPLETA
Todos los precios de la gasolinera, horario, conectores del cargador, fotos cuando las hay, y un botón para ir con Google Maps. En los cargadores, un botón abre directamente la app del operador para iniciar la recarga.

✅ Gratis, sin anuncios y sin registro.
✅ Los precios se actualizan solos, sin tener que actualizar la app.

Los precios son orientativos y pueden haber cambiado: confírmalos en el surtidor o en la app del operador. Chispa es una app independiente y no está afiliada a ningún operador ni marca.

Datos: Open Charge Map y sus colaboradores (CC BY 4.0) y Ministerio para la Transición Ecológica y el Reto Demográfico.
```

**Recursos gráficos** (carpeta `graficos` del repositorio):

| Campo | Archivo |
|---|---|
| Icono de la app (512 × 512) | icono-512.png |
| Gráfico destacado (1024 × 500) | cabecera-1024x500.png |
| Capturas de pantalla del teléfono (mín. 2) | captura-1.png … captura-7.png |

## 3. Detalles de la tienda (Presencia en Play Store → Configuración de la tienda)

| Campo | Valor |
|---|---|
| Categoría | Mapas y navegación |
| Etiquetas | Gasolineras, Vehículos eléctricos |
| Correo de contacto | tu correo (se muestra públicamente) |
| Sitio web | https://github.com/tonisanchezdela/chispa (opcional) |

## 4. Contenido de la app (Política → Contenido de la app)

**Política de privacidad (URL):**
```
https://github.com/tonisanchezdela/chispa/blob/main/PRIVACIDAD.md
```

**Acceso a la app:** «Toda la funcionalidad está disponible sin restricciones de acceso» (no hay usuario ni contraseña).

**Anuncios:** No, la app no contiene anuncios.

**Clasificación de contenido:** categoría «Todos los demás tipos de app». Responde **No** a violencia, sexo, lenguaje, drogas, apuestas y compras.
- ¿Los usuarios pueden interactuar entre sí? **No**.
- ¿Comparte la ubicación del usuario con otros usuarios? **No**.
- ¿Permite compras digitales? **No**.

**Público objetivo:** 18 años o más (evita los requisitos adicionales de apps para niños).

**App de noticias:** No. **App de salud:** No. **Servicios financieros:** No. **App gubernamental:** No (aunque use datos públicos, no representa a ningún organismo).

**Seguridad de los datos:**

| Pregunta | Respuesta |
|---|---|
| ¿Recopila o comparte datos de usuario? | **No** |

La ubicación solo se usa dentro del teléfono para calcular distancias y no sale del dispositivo, así que según los criterios de Google no cuenta como dato «recopilado».

**Permisos:** Internet y ubicación (aproximada y precisa), solo mientras se usa la app. Si Play Console pregunta por el uso de la ubicación: «Mostrar las gasolineras y cargadores más cercanos al usuario cuando pulsa "Cerca de mí"». No usa ubicación en segundo plano.

## 5. Prueba cerrada (obligatoria en cuentas personales nuevas)

1. Probar y publicar → Pruebas → **Prueba cerrada** → Crear canal.
2. Sube **Chispa-GooglePlay.aab** (descárgalo del enlace de abajo).
3. Añade una lista de probadores con **al menos 12 correos de Gmail**.
4. Envía la versión a revisión. Cuando esté aprobada, copia el **enlace de participación** y mándalo a los probadores: tienen que aceptarlo e instalar la app desde Google Play.
5. Pasados **14 días seguidos** con al menos 12 probadores, en el Panel aparece **Solicitar acceso a producción**. Respondes el cuestionario y, tras la revisión, publicas.

**Archivo para subir a Google Play (siempre la última versión):**
https://github.com/tonisanchezdela/chispa/releases/latest/download/Chispa-GooglePlay.aab

Al subir la primera versión, acepta **Firma de apps de Play** (Play App Signing). Google guarda la clave de firma definitiva.

**Identificador de la app:** `com.chispa.app`. Una vez subida la primera versión ya no se puede cambiar.
