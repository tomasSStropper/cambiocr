package sifac.servidor.datos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

import sifac.servidor.logica.ServicioTipoCambio;

/**
 * Fase 5: TipoCambioBCCR probado contra respuestas guardadas en archivos,
 * sin internet y sin token.
 */
class TipoCambioBCCRTest {

    /** Igual que la real, pero "descarga" desde src/test/resources/bccr. */
    static class BccrDesdeArchivo extends TipoCambioBCCR {
        BccrDesdeArchivo() {
            super("prueba@ejemplo.com", "TOKEN-DE-PRUEBA");
        }

        @Override
        protected String descargar(String url) {
            if (!url.contains("FechaInicio=03%2F11%2F2026")) {
                return leer("respuesta-vacia.xml");
            }
            String indicador = url.contains("Indicador=317") ? "317" : "318";
            return leer("respuesta-" + indicador + "-2026-11-03.xml");
        }

        private static String leer(String nombre) {
            try (InputStream in = TipoCambioBCCRTest.class.getResourceAsStream("/bccr/" + nombre)) {
                return new String(in.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        }
    }

    private final RepositorioTipoCambio repo = new BccrDesdeArchivo();

    @Test
    void leeCompraYVentaDelXml() {
        assertEquals("2026-11-03  compra 506.25  venta 513.40", repo.obtenerPorFecha("2026-11-03").toString());
    }

    @Test
    void diaSinPublicacionDevuelveNull() {
        assertNull(repo.obtenerPorFecha("2026-10-31"));
    }

    @Test
    void respuestaSinValorDaNull() {
        assertNull(TipoCambioBCCR.extraerValor("<string>&lt;Datos /&gt;</string>"));
    }

    /** El punto de la actividad: la misma logica, otra fuente, cero cambios en el servicio. */
    @Test
    void elServicioNoNotaLaDiferencia() {
        RepositorioTipoCambio soloEl3 = new RepositorioTipoCambio() {
            @Override
            public sifac.comun.entidades.TipoCambio obtenerPorFecha(String fecha) {
                return repo.obtenerPorFecha(fecha);
            }

            @Override
            public sifac.comun.entidades.TipoCambio obtenerMasReciente() {
                return repo.obtenerPorFecha("2026-11-03"); // fija la fecha para que la prueba no dependa de hoy
            }
        };
        ServicioTipoCambio servicio = new ServicioTipoCambio(soloEl3);
        assertEquals(61608.00, servicio.convertirAColonesParaPagar(120.00), 0.001);
        assertEquals(715.00, servicio.diferencialPorCada100(), 0.001);
    }
}
