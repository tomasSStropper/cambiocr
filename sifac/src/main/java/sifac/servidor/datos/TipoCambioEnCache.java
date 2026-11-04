package sifac.servidor.datos;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.function.LongSupplier;

import sifac.comun.entidades.TipoCambio;

/**
 * Decorador: envuelve a CUALQUIER otro repositorio y recuerda sus respuestas un rato.
 *
 * Implementa la misma interfaz, asi que la logica no se entera de que existe:
 *   new TipoCambioEnCache(new TipoCambioBCCR(token), Duration.ofMinutes(10))
 * Evita llamar al BCCR en cada conversion. Este es el poder de programar contra
 * la interfaz: se agrega comportamiento sin tocar ni la logica ni la otra clase.
 */
public class TipoCambioEnCache implements RepositorioTipoCambio {

    private final RepositorioTipoCambio origen;
    private final long vigenciaNanos;
    private final LongSupplier relojNanos;

    private TipoCambio masReciente;
    private long masRecienteGuardadoEn;
    private final Map<String, TipoCambio> porFecha = new HashMap<>();

    public TipoCambioEnCache(RepositorioTipoCambio origen, Duration vigencia) {
        this(origen, vigencia, System::nanoTime);
    }

    /** Constructor para pruebas: permite controlar el reloj. */
    TipoCambioEnCache(RepositorioTipoCambio origen, Duration vigencia, LongSupplier relojNanos) {
        if (origen == null) {
            throw new IllegalArgumentException("La cache necesita un repositorio de origen");
        }
        this.origen = origen;
        this.vigenciaNanos = vigencia.toNanos();
        this.relojNanos = relojNanos;
    }

    @Override
    public synchronized TipoCambio obtenerMasReciente() {
        long ahora = relojNanos.getAsLong();
        if (masReciente == null || ahora - masRecienteGuardadoEn > vigenciaNanos) {
            masReciente = origen.obtenerMasReciente();
            masRecienteGuardadoEn = ahora;
        }
        return masReciente;
    }

    /**
     * Un dia ya publicado no cambia, asi que se guarda sin vencimiento.
     * Los null no se guardan: ese dia podria publicarse mas tarde.
     */
    @Override
    public synchronized TipoCambio obtenerPorFecha(String fecha) {
        TipoCambio guardado = porFecha.get(fecha);
        if (guardado != null) {
            return guardado;
        }
        TipoCambio tc = origen.obtenerPorFecha(fecha);
        if (tc != null) {
            porFecha.put(fecha, tc);
        }
        return tc;
    }
}
