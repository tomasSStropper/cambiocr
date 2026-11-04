package sifac.servidor.datos;

import java.util.ArrayList;
import java.util.List;

import sifac.comun.entidades.TipoCambio;

/**
 * Implementacion simulada: los datos viven en una lista dentro del programa.
 * Sirve para trabajar y probar sin depender de internet ni del token del BCCR.
 */
public class TipoCambioEnMemoria implements RepositorioTipoCambio {

    private final List<TipoCambio> datos = new ArrayList<>();

    public TipoCambioEnMemoria() {
        datos.add(new TipoCambio("2026-10-30", 504.80, 511.90));
        datos.add(new TipoCambio("2026-11-02", 505.50, 512.75));
        datos.add(new TipoCambio("2026-11-03", 506.25, 513.40));
    }

    @Override
    public TipoCambio obtenerPorFecha(String fecha) {
        for (TipoCambio tc : datos) {
            if (tc.getFecha().equals(fecha)) {
                return tc;
            }
        }
        // No hay dato ese dia (fin de semana, feriado, fecha futura). No es un error:
        // el contrato dice que en ese caso se devuelve null.
        return null;
    }

    @Override
    public TipoCambio obtenerMasReciente() {
        // No confiamos en el orden en que se agregaron: buscamos la fecha mayor.
        // Con el formato AAAA-MM-DD, comparar los textos (compareTo) da el mismo
        // orden que comparar las fechas: "2027-01-05" > "2026-11-03".
        TipoCambio masReciente = null;
        for (TipoCambio tc : datos) {
            if (masReciente == null || tc.getFecha().compareTo(masReciente.getFecha()) > 0) {
                masReciente = tc;
            }
        }
        return masReciente;
    }
}
