# Chispa

Buscador de cargadores de coche eléctrico y gasolineras de España al mejor precio, con lista y mapa.

**Descargar la app:** en esta página, entra en *Releases* (a la derecha) y pulsa **Chispa.apk**.
Enlace directo a la última versión: `releases/latest/download/Chispa.apk`

- Cada cambio que se sube a la rama `main` compila una APK y un AAB nuevos automáticamente (pestaña *Actions*, «Compilar APK»).
- Los datos se actualizan solos (pestaña *Actions*, «Actualizar datos»): gasolineras cada día y cargadores los días 1 y 15. Se publican en la rama `datos` y la app los descarga al abrirse, sin necesidad de publicar una versión nueva.
- En iPhone se usa como web: https://tonisanchezdela.github.io/chispa/ (Safari → Compartir → «Añadir a pantalla de inicio»).
- La app es una sola página: `app/src/main/assets/index.html`.

Datos: Open Charge Map (CC BY 4.0), Ministerio para la Transición Ecológica y el Reto Demográfico (precios de carburantes), GeoNames (CC BY 4.0) y Natural Earth.
