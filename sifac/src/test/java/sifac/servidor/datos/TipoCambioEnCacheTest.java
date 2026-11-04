package sifac.servidor.datos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import org.junit.jupiter.api.Test;

import sifac.comun.entidades.TipoCambio;

class TipoCambioEnCacheTest {

    /** Repositorio que cuenta cuantas veces lo llaman. */
    static class Contador implements RepositorioTipoCambio {
        final AtomicInteger recientes = new AtomicInteger();
        final AtomicInteger porFecha = new AtomicInteger();
        private final RepositorioTipoCambio real = new TipoCambioEnMemoria();

        @Override
        public TipoCambio obtenerPorFecha(String fecha) {
            porFecha.incrementAndGet();
            return real.obtenerPorFecha(fecha);
        }

        @Override
        public TipoCambio obtenerMasReciente() {
            recientes.incrementAndGet();
            return real.obtenerMasReciente();
        }
    }

    private final AtomicLong reloj = new AtomicLong();
    private final Contador origen = new Contador();
    private final RepositorioTipoCambio cache = new TipoCambioEnCache(origen, Duration.ofMinutes(10), reloj::get);

    @Test
    void elMasRecienteSeConsultaUnaVezMientrasEsteVigente() {
        cache.obtenerMasReciente();
        cache.obtenerMasReciente();
        reloj.addAndGet(Duration.ofMinutes(9).toNanos());
        cache.obtenerMasReciente();
        assertEquals(1, origen.recientes.get());
    }

    @Test
    void alVencerSeVuelveAConsultar() {
        cache.obtenerMasReciente();
        reloj.addAndGet(Duration.ofMinutes(11).toNanos());
        cache.obtenerMasReciente();
        assertEquals(2, origen.recientes.get());
    }

    @Test
    void unDiaPublicadoSeGuardaPeroUnNullNo() {
        cache.obtenerPorFecha("2026-11-02");
        cache.obtenerPorFecha("2026-11-02");
        assertEquals(1, origen.porFecha.get());

        assertNull(cache.obtenerPorFecha("2026-10-31"));
        assertNull(cache.obtenerPorFecha("2026-10-31"));
        assertEquals(3, origen.porFecha.get());
    }
}
