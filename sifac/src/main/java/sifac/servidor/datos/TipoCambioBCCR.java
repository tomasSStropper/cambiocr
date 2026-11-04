package sifac.servidor.datos;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;

import sifac.comun.entidades.TipoCambio;

/**
 * Lee el tipo de cambio de la API SDDE del BCCR (sitio nuevo de Indicadores Economicos).
 *
 * Indicador 317 = compra, 318 = venta. Autenticacion: encabezado
 * "Authorization: Bearer <token>". Todo lo que sabe del BCCR (URL, indicadores,
 * formato de fecha y forma del JSON) vive SOLO en esta clase.
 */
public class TipoCambioBCCR implements RepositorioTipoCambio {

    static final String URL_BASE =
            "https://apim.bccr.fi.cr/SDDE/api/Bccr.GE.SDDE.Publico.Indicadores.API/indicadoresEconomicos/";
    static final String INDICADOR_COMPRA = "317";
    static final String INDICADOR_VENTA = "318";

    /** Cuantos dias hacia atras buscar el mas reciente (fines de semana y feriados). */
    private static final int DIAS_HACIA_ATRAS = 10;

    /** Formato de fecha aceptado; cualquier otra cosa no se manda al BCCR. */
    private static final Pattern FECHA_ISO = Pattern.compile("\\d{4}-\\d{2}-\\d{2}");

    private final String token;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public TipoCambioBCCR(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Falta el token del BCCR (variable de entorno BCCR_TOKEN)");
        }
        this.token = token.trim();
    }

    @Override
    public TipoCambio obtenerPorFecha(String fecha) {
        if (fecha == null || !FECHA_ISO.matcher(fecha).matches()) {
            return null; // nunca se arma una URL con texto arbitrario del usuario
        }
        return masRecienteEntre(fecha, fecha);
    }

    @Override
    public TipoCambio obtenerMasReciente() {
        LocalDate hoy = LocalDate.now(ZoneId.of("America/Costa_Rica"));
        return masRecienteEntre(hoy.minusDays(DIAS_HACIA_ATRAS).toString(), hoy.toString());
    }

    /** Pide compra y venta para el rango y devuelve el dia mas reciente que tenga las dos. */
    private TipoCambio masRecienteEntre(String desde, String hasta) {
        Map<String, Double> compras = serie(INDICADOR_COMPRA, desde, hasta);
        Map<String, Double> ventas = serie(INDICADOR_VENTA, desde, hasta);
        TipoCambio masReciente = null;
        for (Map.Entry<String, Double> c : compras.entrySet()) { // TreeMap: fechas en orden
            Double venta = ventas.get(c.getKey());
            if (venta != null) {
                masReciente = new TipoCambio(c.getKey(), c.getValue(), venta);
            }
        }
        return masReciente; // null si el BCCR no publico: mismo contrato que la version en memoria
    }

    private Map<String, Double> serie(String indicador, String desde, String hasta) {
        String url = URL_BASE + indicador + "/series"
                + "?fechaInicio=" + desde.replace('-', '/')
                + "&fechaFin=" + hasta.replace('-', '/')
                + "&idioma=ES";
        return parsearSerie(descargar(url));
    }

    /**
     * Hace la peticion HTTP con el token en el encabezado (nunca en la URL).
     * Es protected para que una prueba la reemplace por un archivo guardado.
     */
    protected String descargar(String url) {
        HttpRequest peticion = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/json")
                .GET()
                .build();
        try {
            HttpResponse<String> respuesta = http.send(peticion, HttpResponse.BodyHandlers.ofString());
            if (respuesta.statusCode() == 401 || respuesta.statusCode() == 403) {
                throw new IllegalStateException("El BCCR rechazo el token (HTTP " + respuesta.statusCode() + ")");
            }
            if (respuesta.statusCode() != 200) {
                throw new IllegalStateException("El BCCR respondio HTTP " + respuesta.statusCode());
            }
            return respuesta.body();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo consultar el BCCR: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Consulta al BCCR interrumpida", e);
        }
    }

    /**
     * Convierte el JSON de la API en fecha -> valor, ordenado por fecha.
     * Forma esperada: { estado, mensaje, datos: [ { series: [ { fecha, valorDatoPorPeriodo } ] } ] }
     */
    static Map<String, Double> parsearSerie(String json) {
        Map<String, Double> valores = new TreeMap<>();
        if (json == null || json.isBlank()) {
            return valores;
        }
        JsonObject raiz = leerObjeto(json);
        if (raiz.has("estado") && !raiz.get("estado").getAsBoolean()) {
            String mensaje = raiz.has("mensaje") ? raiz.get("mensaje").getAsString() : "consulta sin exito";
            throw new IllegalStateException("El BCCR respondio: " + mensaje);
        }
        try {
            for (JsonElement indicador : arreglo(raiz, "datos")) {
                for (JsonElement punto : arreglo(indicador.getAsJsonObject(), "series")) {
                    JsonObject p = punto.getAsJsonObject();
                    JsonElement fecha = p.get("fecha");
                    JsonElement valor = p.get("valorDatoPorPeriodo");
                    if (fecha != null && !fecha.isJsonNull() && valor != null && !valor.isJsonNull()) {
                        valores.put(fecha.getAsString().substring(0, 10), valor.getAsDouble());
                    }
                }
            }
        } catch (RuntimeException e) { // tipos inesperados dentro del JSON
            throw new IllegalStateException("Respuesta del BCCR con formato inesperado", e);
        }
        return valores;
    }

    private static JsonObject leerObjeto(String json) {
        try {
            return JsonParser.parseString(json).getAsJsonObject();
        } catch (JsonParseException | IllegalStateException e) {
            throw new IllegalStateException("Respuesta del BCCR con formato inesperado", e);
        }
    }

    private static JsonArray arreglo(JsonObject objeto, String campo) {
        JsonElement e = objeto.get(campo);
        return e != null && e.isJsonArray() ? e.getAsJsonArray() : new JsonArray();
    }
}
