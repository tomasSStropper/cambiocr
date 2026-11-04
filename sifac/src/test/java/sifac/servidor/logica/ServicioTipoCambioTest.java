package sifac.servidor.logica;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import sifac.comun.entidades.TipoCambio;
import sifac.servidor.datos.RepositorioTipoCambio;
import sifac.servidor.datos.TipoCambioEnMemoria;

/** Verificacion 3 del enunciado. */
class ServicioTipoCambioTest {

    // La PRUEBA si puede escoger la implementacion; el servicio no.
    private final ServicioTipoCambio servicio = new ServicioTipoCambio(new TipoCambioEnMemoria());

    @Test
    void pagarUsaVenta() {
        assertEquals(61608.00, servicio.convertirAColonesParaPagar(120.00), 0.001);
        assertEquals(43895.70, servicio.convertirAColonesParaPagar(85.50), 0.001);
    }

    @Test
    void recibirUsaCompra() {
        assertEquals(50625.00, servicio.convertirAColonesParaRecibir(100.00), 0.001);
        assertEquals(126562.50, servicio.convertirAColonesParaRecibir(250.00), 0.001);
    }

    @Test
    void dolaresParaPagarEsElInverso() {
        assertEquals(120.00, servicio.convertirADolaresParaPagar(61608.00), 0.001);
    }

    @Test
    void diferencialPorCada100() {
        assertEquals(715.00, servicio.diferencialPorCada100(), 0.001);
    }

    @Test
    void delDiaSinDatoLanzaExcepcion() {
        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> servicio.delDia("2026-10-31"));
        assertEquals("No hay tipo de cambio para 2026-10-31", e.getMessage());
    }

    /**
     * Prueba de arquitectura: el servicio funciona con CUALQUIER repositorio,
     * incluso uno inventado aqui mismo, sin cambiar una sola linea del servicio.
     */
    @Test
    void funcionaConOtraFuenteSinTocarElServicio() {
        RepositorioTipoCambio otraFuente = new RepositorioTipoCambio() {
            @Override
            public TipoCambio obtenerPorFecha(String fecha) {
                return null;
            }

            @Override
            public TipoCambio obtenerMasReciente() {
                return new TipoCambio("2027-01-04", 500.00, 510.00);
            }
        };
        ServicioTipoCambio otro = new ServicioTipoCambio(otraFuente);
        assertEquals(1020.00, otro.convertirAColonesParaPagar(2), 0.001);
        assertEquals(1000.00, otro.convertirAColonesParaRecibir(2), 0.001);
    }
}
