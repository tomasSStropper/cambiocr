package sifac.servidor.datos;

import sifac.comun.entidades.TipoCambio;

/**
 * Contrato de la capa de datos para obtener tipos de cambio.
 *
 * Dice QUE se puede pedir, no COMO se consigue. Cada implementacion
 * (en memoria, archivo, BCCR) decide el como. La logica solo conoce esta interfaz.
 */
public interface RepositorioTipoCambio {

    /** Devuelve el tipo de cambio de esa fecha, o null si no lo tiene. */
    TipoCambio obtenerPorFecha(String fecha);

    /** Devuelve el mas reciente que tenga disponible. */
    TipoCambio obtenerMasReciente();
}
