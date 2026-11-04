package sifac.servidor.datos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

import sifac.comun.entidades.TipoCambio;

/** Verificacion 2 del enunciado. */
class TipoCambioEnMemoriaTest {

    // El tipo declarado es la interfaz: la prueba tambien trabaja contra el contrato.
    private final RepositorioTipoCambio repo = new TipoCambioEnMemoria();

    @Test
    void masRecienteEsEl3DeNoviembre() {
        assertEquals("2026-11-03  compra 506.25  venta 513.40", repo.obtenerMasReciente().toString());
    }

    @Test
    void obtienePorFecha() {
        assertEquals("2026-11-02  compra 505.50  venta 512.75", repo.obtenerPorFecha("2026-11-02").toString());
    }

    @Test
    void sabadoDevuelveNull() {
        assertNull(repo.obtenerPorFecha("2026-10-31"));
    }

    @Test
    void diferencialDel3DeNoviembre() {
        TipoCambio tc = repo.obtenerPorFecha("2026-11-03");
        assertEquals(7.15, tc.diferencial(), 0.0001);
    }
}
