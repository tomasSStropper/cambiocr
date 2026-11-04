package sifac.servidor.datos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

import sifac.comun.entidades.TipoCambio;
import sifac.servidor.logica.ServicioTipoCambio;

/** TipoCambioBCCR probado contra respuestas JSON guardadas: sin internet. */
class TipoCambioBCCRTest {

    /** Igual que la real, pero "descarga" desde src/test/resources/bccr. */
    static class BccrDesdeArchivo extends TipoCambioBCCR {
        final List<String> urlsPedidas = new ArrayList<>();

        BccrDesdeArchivo() {
            super("TOKEN-DE-PRUEBA");
        }

        @Override
        protected String descargar(String url) {
            urlsPedidas.add(url);
            boolean incluyeEl3 = url.contains("fechaInicio=2026/11/0") || url.contains("fechaFin=2026/11/03");
            if (!incluyeEl3 || url.contains("fechaInicio=2026/10/31")) {
                return leer("serie-vacia.json");
            }
            return leer(url.contains("/317/") ? "serie-317.json" : "serie-318.json");
        }

        private static String leer(String nombre) {
            try (InputStream in = TipoCambioBCCRTest.class.getResourceAsStream("/bccr/" + nombre)) {
                return new String(in.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }
    }

    @Test
    void leeCompraYVentaDelJson() {
        BccrDesdeArchivo repo = new BccrDesdeArchivo();
        assertEquals("2026-11-03  compra 506.25  venta 513.40", repo.obtenerPorFecha("2026-11-03").toString());
    }

    @Test
    void elTokenNoViajaEnLaUrl() {
        BccrDesdeArchivo repo = new BccrDesdeArchivo();
        repo.obtenerPorFecha("2026-11-03");
        assertEquals(2, repo.urlsPedidas.size());
        for (String url : repo.urlsPedidas) {
            assertTrue(url.startsWith(TipoCambioBCCR.URL_BASE));
            assertFalse(url.contains("TOKEN-DE-PRUEBA"));
        }
    }

    @Test
    void diaSinPublicacionDevuelveNull() {
        assertNull(new BccrDesdeArchivo().obtenerPorFecha("2026-10-31"));
    }

    @Test
    void estadoFalsoEsError() {
        assertThrows(IllegalStateException.class,
                () -> TipoCambioBCCR.parsearSerie("{\"estado\": false, \"mensaje\": \"Token invalido\"}"));
    }

    @Test
    void fechaConTextoRaroNoLlegaALaUrl() {
        BccrDesdeArchivo repo = new BccrDesdeArchivo();
        assertNull(repo.obtenerPorFecha("2026-11-03&idioma=EN"));
        assertTrue(repo.urlsPedidas.isEmpty());
    }

    @Test
    void jsonMalFormadoEsErrorClaro() {
        IllegalStateException e = assertThrows(IllegalStateException.class,
                () -> TipoCambioBCCR.parsearSerie("<html>error</html>"));
        assertEquals("Respuesta del BCCR con formato inesperado", e.getMessage());
    }

    @Test
    void valoresNulosSeIgnoran() {
        String json = "{\"estado\":true,\"datos\":[{\"series\":["
                + "{\"fecha\":\"2026-11-02T00:00:00\",\"valorDatoPorPeriodo\":null},"
                + "{\"valorDatoPorPeriodo\":1.5,\"fecha\":\"2026-11-03\"}]}]}";
        assertEquals(java.util.Map.of("2026-11-03", 1.5), TipoCambioBCCR.parsearSerie(json));
    }

    @Test
    void sinTokenNoSePuedeCrear() {
        assertThrows(IllegalArgumentException.class, () -> new TipoCambioBCCR(" "));
    }

    /** El punto de la actividad: la misma logica, otra fuente, cero cambios en el servicio. */
    @Test
    void elServicioNoNotaLaDiferencia() {
        BccrDesdeArchivo bccr = new BccrDesdeArchivo();
        RepositorioTipoCambio fijoAl3 = new RepositorioTipoCambio() {
            @Override
            public TipoCambio obtenerPorFecha(String fecha) {
                return bccr.obtenerPorFecha(fecha);
            }

            @Override
            public TipoCambio obtenerMasReciente() {
                return bccr.obtenerPorFecha("2026-11-03"); // fija la fecha: la prueba no depende de hoy
            }
        };
        ServicioTipoCambio servicio = new ServicioTipoCambio(fijoAl3);
        assertEquals(61608.00, servicio.convertirAColonesParaPagar(120.00), 0.001);
        assertEquals(715.00, servicio.diferencialPorCada100(), 0.001);
    }
}
