package com.chispa.app

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale
import java.util.concurrent.TimeUnit

/** Aviso de bajada de precio en la zona guardada. Todo ocurre en el móvil: no se envía la ubicación a ningún servidor. */
object Avisos {
    private const val CANAL = "precios"
    private const val TRABAJO = "avisos"

    fun programar(c: Context) {
        val red = Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()
        val tarea = PeriodicWorkRequestBuilder<AvisoWorker>(6, TimeUnit.HOURS).setConstraints(red).build()
        WorkManager.getInstance(c).enqueueUniquePeriodicWork(TRABAJO, ExistingPeriodicWorkPolicy.UPDATE, tarea)
    }

    fun cancelar(c: Context) {
        WorkManager.getInstance(c).cancelUniqueWork(TRABAJO)
    }

    fun notificar(c: Context, titulo: String, texto: String, id: Int) {
        val nm = c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.createNotificationChannel(NotificationChannel(CANAL, "Bajadas de precio", NotificationManager.IMPORTANCE_DEFAULT))
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(c, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) return
        val abrir = Intent(c, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val pi = PendingIntent.getActivity(c, 0, abrir, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(c, CANAL)
            .setSmallIcon(R.drawable.ic_notif)
            .setContentTitle(titulo)
            .setContentText(texto)
            .setStyle(NotificationCompat.BigTextStyle().bigText(texto))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .build()
        nm.notify(id, n)
    }
}

class AvisoWorker(c: Context, p: WorkerParameters) : Worker(c, p) {

    override fun doWork(): Result {
        val sp = applicationContext.getSharedPreferences("aviso", Context.MODE_PRIVATE)
        val cfg = sp.getString("cfg", "") ?: ""
        if (cfg.isEmpty()) return Result.success()
        try {
            val o = JSONObject(cfg)
            val base = "https://raw.githubusercontent.com/tonisanchezdela/chispa/datos/"
            val ultima = sp.getString("fecha", "") ?: ""
            val publicada = try { descargar(base + "fecha.txt").trim() } catch (e: Exception) { "" }
            if (publicada.isNotEmpty() && publicada == ultima) return Result.success()

            val datos = JSONObject(descargar(base + "fuel.json"))
            val fecha = datos.optString("date")
            if (fecha == ultima) return Result.success()

            val lista = datos.getJSONArray("s")
            val lat = o.getDouble("lat")
            val lon = o.getDouble("lon")
            val radio = o.getDouble("r")
            val fi = o.getInt("fi")
            var min = Int.MAX_VALUE
            var rotulo = ""
            var dist = 0.0
            for (i in 0 until lista.length()) {
                val e = lista.getJSONArray(i)
                val precio = e.getInt(7 + fi)
                if (precio <= 0) continue
                val d = km(lat, lon, e.getDouble(0), e.getDouble(1))
                if (d > radio) continue
                if (precio < min) {
                    min = precio
                    rotulo = e.getString(2)
                    dist = d
                }
            }
            if (min == Int.MAX_VALUE) {
                sp.edit().putString("fecha", fecha).apply()
                return Result.success()
            }
            val antes = sp.getInt("min", 0)
            if (antes > 0 && min < antes) {
                val es = Locale("es", "ES")
                val dif = (antes - min) / 10.0
                val difTxt = if (dif == Math.floor(dif)) dif.toInt().toString() else String.format(es, "%.1f", dif)
                Avisos.notificar(
                    applicationContext,
                    "Baja el " + o.optString("comb") + " en " + o.optString("nombre"),
                    rotulo + ": " + String.format(es, "%.3f", min / 1000.0) + " €/L, " + difTxt + " cént. menos. A " +
                        String.format(es, "%.1f", dist) + " km.",
                    2
                )
            }
            sp.edit().putInt("min", min).putString("fecha", fecha).apply()
            return Result.success()
        } catch (e: Exception) {
            return Result.retry()
        }
    }

    private fun descargar(direccion: String): String {
        val c = URL(direccion).openConnection() as HttpURLConnection
        c.connectTimeout = 20000
        c.readTimeout = 60000
        try {
            if (c.responseCode != 200) throw IOException("HTTP " + c.responseCode)
            return c.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
        } finally {
            c.disconnect()
        }
    }

    private fun km(la1: Double, lo1: Double, la2: Double, lo2: Double): Double {
        val r = 6371.0
        val dLa = Math.toRadians(la2 - la1)
        val dLo = Math.toRadians(lo2 - lo1)
        val a = Math.sin(dLa / 2) * Math.sin(dLa / 2) +
            Math.cos(Math.toRadians(la1)) * Math.cos(Math.toRadians(la2)) * Math.sin(dLo / 2) * Math.sin(dLo / 2)
        return 2 * r * Math.asin(Math.sqrt(a))
    }
}
