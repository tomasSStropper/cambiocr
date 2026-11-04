package sifac.servidor.logica;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;

import sifac.comun.entidades.Factura;
import sifac.comun.entidades.LineaFactura;
import sifac.comun.entidades.Moneda;
import sifac.comun.entidades.TipoCambio;
import sifac.servidor.datos.RepositorioTipoCambio;

class ServicioFacturacionTest {

    /** Fuente que cambia de tasa cada vez que la consultan, como si el BCCR publicara a mitad de la factura. */
    static class FuenteCambiante implements RepositorioTipoCambio {
        final AtomicInteger consultas = new AtomicInteger();

        @Override
        public TipoCambio obtenerPorFecha(String fecha) {
            return null;
        }

        @Override
        public TipoCambio obtenerMasReciente() {
            int n = consultas.incrementAndGet();
            return new TipoCambio("2026-11-0" + n, 500.00, 510.00 + n);
        }
    }

    @Test
    void unaFacturaUsaUnSoloTipoDeCambio() {
        FuenteCambiante fuente = new FuenteCambiante();
        ServicioFacturacion facturacion = new ServicioFacturacion(new ServicioTipoCambio(fuente));

        Factura factura = facturacion.facturar(List.of(
                new LineaFactura("Taladro", 1, 100.00, Moneda.DOLARES),
                new LineaFactura("Sierra", 1, 100.00, Moneda.DOLARES)));

        assertEquals(1, fuente.consultas.get());
        assertEquals(51100.00, factura.getLineas().get(0).getTotalColones(), 0.001);
        assertEquals(51100.00, factura.getLineas().get(1).getTotalColones(), 0.001);
        assertEquals(102200.00, factura.getSubtotal(), 0.001);
    }

    @Test
    void sinLineasEnDolaresNoSeConsultaElTipoDeCambio() {
        FuenteCambiante fuente = new FuenteCambiante();
        ServicioFacturacion facturacion = new ServicioFacturacion(new ServicioTipoCambio(fuente));

        Factura factura = facturacion.facturar(List.of(new LineaFactura("Clavos", 5, 1200.00, Moneda.COLONES)));

        assertEquals(0, fuente.consultas.get());
        assertNull(factura.getTipoCambio());
        assertEquals(6780.00, factura.getTotal(), 0.001);
    }

    @Test
    void facturaVaciaOConCantidadCeroEsError() {
        ServicioFacturacion facturacion = new ServicioFacturacion(new ServicioTipoCambio(new FuenteCambiante()));
        assertThrows(IllegalArgumentException.class, () -> facturacion.facturar(List.of()));
        assertThrows(IllegalArgumentException.class,
                () -> facturacion.facturar(List.of(new LineaFactura("X", 0, 1, Moneda.COLONES))));
    }
}
