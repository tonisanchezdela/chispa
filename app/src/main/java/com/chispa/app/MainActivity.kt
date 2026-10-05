package com.chispa.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.location.Location
import android.location.LocationManager
import android.os.CancellationSignal
import android.os.Handler
import android.os.Looper
import android.net.Uri
import android.os.Bundle
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.location.LocationManagerCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat

class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView

    private var geoOrigen: String? = null
    private var geoRespuesta: GeolocationPermissions.Callback? = null

    private val pedirUbicacion =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { res ->
            val ok = res.values.any { it }
            geoRespuesta?.invoke(geoOrigen, ok, false)
            geoRespuesta = null
            geoOrigen = null
        }

    private val pedirUbicacionNativa =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { res ->
            if (res.values.any { it }) buscarUbicacion() else responderUbicacion(null, "permiso")
        }

    private fun responderUbicacion(l: Location?, error: String?) {
        val js = if (l != null) "window.__ubi&&window.__ubi(" + l.latitude + "," + l.longitude + ",null)"
        else "window.__ubi&&window.__ubi(0,0,'" + (error ?: "sin_senal") + "')"
        runOnUiThread { web.evaluateJavascript(js, null) }
    }

    @SuppressLint("MissingPermission")
    private fun buscarUbicacion() {
        val lm = getSystemService(LOCATION_SERVICE) as LocationManager
        if (!LocationManagerCompat.isLocationEnabled(lm)) {
            responderUbicacion(null, "apagada")
            return
        }
        val activos = try { lm.getProviders(true) } catch (e: Exception) { emptyList<String>() }
        var mejor: Location? = null
        for (p in activos) {
            val l = try { lm.getLastKnownLocation(p) } catch (e: Exception) { null } ?: continue
            val m = mejor
            if (m == null || l.time > m.time) mejor = l
        }
        val ultima = mejor
        if (ultima != null && System.currentTimeMillis() - ultima.time < 5 * 60 * 1000) {
            responderUbicacion(ultima, null)
            return
        }
        val orden = listOf("fused", LocationManager.NETWORK_PROVIDER, LocationManager.GPS_PROVIDER).filter { activos.contains(it) }
        if (orden.isEmpty()) {
            if (ultima != null) responderUbicacion(ultima, null) else responderUbicacion(null, "sin_senal")
            return
        }
        var hecho = false
        val senal = CancellationSignal()
        Handler(Looper.getMainLooper()).postDelayed({
            if (!hecho) {
                hecho = true
                senal.cancel()
                if (ultima != null) responderUbicacion(ultima, null) else responderUbicacion(null, "sin_senal")
            }
        }, 20000)
        for (p in orden) {
            try {
                LocationManagerCompat.getCurrentLocation(lm, p, senal, ContextCompat.getMainExecutor(this)) { l: Location? ->
                    if (l != null && !hecho) {
                        hecho = true
                        senal.cancel()
                        responderUbicacion(l, null)
                    }
                }
            } catch (e: Exception) {
            }
        }
    }

    private fun tieneUbicacion(): Boolean =
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val cargador = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        val noche = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

        web = WebView(this)
        val raiz = FrameLayout(this)
        raiz.setBackgroundColor(if (noche) 0xFF17123F.toInt() else 0xFFE4F7FF.toInt())
        raiz.addView(web, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        setContentView(raiz)
        WindowCompat.getInsetsController(window, raiz).apply {
            isAppearanceLightStatusBars = !noche
            isAppearanceLightNavigationBars = !noche
        }
        ViewCompat.setOnApplyWindowInsetsListener(raiz) { v, insets ->
            val barras = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            val teclado = insets.getInsets(WindowInsetsCompat.Type.ime())
            v.setPadding(barras.left, barras.top, barras.right, maxOf(barras.bottom, teclado.bottom))
            WindowInsetsCompat.CONSUMED
        }

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            setGeolocationEnabled(true)
        }

        web.webViewClient = object : WebViewClientCompat() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                return cargador.shouldInterceptRequest(request.url)
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url
                if (url.host == "appassets.androidplatform.net") return false
                abrirFuera(url)
                return true
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread { request.deny() }
            }

            override fun onGeolocationPermissionsShowPrompt(origin: String, callback: GeolocationPermissions.Callback) {
                if (tieneUbicacion()) {
                    callback.invoke(origin, true, false)
                    return
                }
                geoRespuesta?.invoke(geoOrigen, false, false)
                geoOrigen = origin
                geoRespuesta = callback
                try {
                    pedirUbicacion.launch(
                        arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
                    )
                } catch (e: Exception) {
                    geoRespuesta = null
                    geoOrigen = null
                    callback.invoke(origin, false, false)
                }
            }
        }

        web.addJavascriptInterface(Puente(), "Android")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                web.evaluateJavascript("(window.__atras&&window.__atras())?'1':'0'") { r ->
                    if (r == null || !r.contains("1")) finish()
                }
            }
        })

        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    private fun abrirFuera(url: Uri) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, url))
        } catch (_: Exception) {
        }
    }

    inner class Puente {

        /** Ubicación del móvil, pedida directamente a Android. Responde llamando a window.__ubi(lat, lon, error). */
        @JavascriptInterface
        fun ubicacion() {
            runOnUiThread {
                if (tieneUbicacion()) {
                    buscarUbicacion()
                } else {
                    try {
                        pedirUbicacionNativa.launch(
                            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
                        )
                    } catch (e: Exception) {
                        responderUbicacion(null, "permiso")
                    }
                }
            }
        }

        /** Abre la app del operador si está instalada; si no, su ficha en Google Play para instalarla. */
        @JavascriptInterface
        fun abrirApp(paquete: String) {
            if (!Regex("^[A-Za-z0-9_.]+$").matches(paquete)) return
            runOnUiThread {
                val lanzar = try {
                    packageManager.getLaunchIntentForPackage(paquete)
                } catch (e: Exception) {
                    null
                }
                if (lanzar != null) {
                    try {
                        startActivity(lanzar)
                        return@runOnUiThread
                    } catch (_: Exception) {
                    }
                }
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$paquete")))
                } catch (e: Exception) {
                    abrirFuera(Uri.parse("https://play.google.com/store/apps/details?id=$paquete"))
                }
            }
        }
    }
}
