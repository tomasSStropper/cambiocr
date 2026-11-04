package sifac.servidor.datos;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import sifac.comun.entidades.TipoCambio;

/**
 * FASE 5 (opcional). Lee el tipo de cambio del servicio web del BCCR.
 *
 * Indicador 317 = compra, 318 = venta. Requiere registrarse para obtener
 * un token. Todo lo que sabe del BCCR (URL, indicadores, formato de fecha,
 * formato XML de la respuesta) vive SOLO en esta clase. Si el BCCR cambia
 * su respuesta, este es el unico archivo que se modifica.
 */
public class TipoCambioBCCR implements RepositorioTipoCambio {

    static final String URL_SERVICIO =
            "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicosXML";
    static final String INDICADOR_COMPRA = "317";
    static final String INDICADOR_VENTA = "318";

    /** Cuantos dias hacia atras buscar el mas reciente (cubre fines de semana y feriados). */
    private static final int DIAS_HACIA_ATRAS = 10;

    private static final DateTimeFormatter FORMATO_BCCR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Pattern NUM_VALOR = Pattern.compile("<NUM_VALOR>\\s*([0-9.,]+)\\s*</NUM_VALOR>");

    private final String correo;
    private final String token;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public TipoCambioBCCR(String correo, String token) {
        this.correo = correo;
        this.token = token;
    }

    @Override
    public TipoCambio obtenerPorFecha(String fecha) {
        Double compra = consultarIndicador(INDICADOR_COMPRA, fecha);
        Double venta = consultarIndicador(INDICADOR_VENTA, fecha);
        if (compra == null || venta == null) {
            return null; // el BCCR no publico ese dia: mismo contrato que la version en memoria
        }
        return new TipoCambio(fecha, compra, venta);
    }

    @Override
    public TipoCambio obtenerMasReciente() {
        LocalDate dia = LocalDate.now(ZoneId.of("America/Costa_Rica"));
        for (int i = 0; i < DIAS_HACIA_ATRAS; i++) {
            TipoCambio tc = obtenerPorFecha(dia.minusDays(i).toString());
            if (tc != null) {
                return tc;
            }
        }
        return null;
    }

    private Double consultarIndicador(String indicador, String fechaIso) {
        String fechaBccr = LocalDate.parse(fechaIso).format(FORMATO_BCCR);
        String url = URL_SERVICIO
                + "?Indicador=" + indicador
                + "&FechaInicio=" + codificar(fechaBccr)
                + "&FechaFinal=" + codificar(fechaBccr)
                + "&Nombre=" + codificar("SIFAC")
                + "&SubNiveles=N"
                + "&CorreoElectronico=" + codificar(correo)
                + "&Token=" + codificar(token);
        return extraerValor(descargar(url));
    }

    /**
     * Hace la peticion HTTP. Es protected para que una prueba la reemplace por
     * la lectura de un archivo guardado, sin internet ni token.
     */
    protected String descargar(String url) {
        HttpRequest peticion = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .GET()
                .build();
        try {
            HttpResponse<String> respuesta = http.send(peticion, HttpResponse.BodyHandlers.ofString());
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
     * Saca NUM_VALOR de la respuesta. El BCCR devuelve el XML "escapado" dentro
     * de un &lt;string&gt;, por eso primero se des-escapa. Devuelve null si no hay valor.
     */
    static Double extraerValor(String respuesta) {
        if (respuesta == null) {
            return null;
        }
        String xml = respuesta.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&");
        Matcher m = NUM_VALOR.matcher(xml);
        if (!m.find()) {
            return null;
        }
        return Double.parseDouble(m.group(1).replace(',', '.'));
    }

    private static String codificar(String valor) {
        return URLEncoder.encode(valor == null ? "" : valor, StandardCharsets.UTF_8);
    }
}
