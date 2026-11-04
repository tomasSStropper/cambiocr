package sifac.comun.entidades;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class TipoCambioTest {

    @Test
    void guardaLosTresDatos() {
        TipoCambio tc = new TipoCambio("2026-11-03", 506.25, 513.40);
        assertEquals("2026-11-03", tc.getFecha());
        assertEquals(506.25, tc.getCompra(), 0.0001);
        assertEquals(513.40, tc.getVenta(), 0.0001);
    }

    @Test
    void diferencialEsVentaMenosCompra() {
        TipoCambio tc = new TipoCambio("2026-11-03", 506.25, 513.40);
        assertEquals(7.15, tc.diferencial(), 0.0001);
    }

    @Test
    void toStringConPuntoDecimal() {
        TipoCambio tc = new TipoCambio("2026-11-03", 506.25, 513.40);
        assertEquals("2026-11-03  compra 506.25  venta 513.40", tc.toString());
    }
}
