package sifac.servidor.logica;

import sifac.comun.entidades.TipoCambio;
import sifac.servidor.datos.RepositorioTipoCambio;

/**
 * Reglas del negocio del tipo de cambio para la ferreteria.
 *
 * Regla central: el banco gana con la diferencia entre venta y compra.
 *  - Cuando la ferreteria PAGA en dolares (proveedor), tiene que comprarle
 *    dolares al banco: el banco se los VENDE -> se usa la tasa de VENTA.
 *  - Cuando la ferreteria RECIBE dolares (cliente), se los va a vender al
 *    banco: el banco se los COMPRA -> se usa la tasa de COMPRA.
 *
 * Esta clase solo conoce la interfaz RepositorioTipoCambio. No crea ninguna
 * implementacion concreta y no imprime nada: devuelve valores o lanza excepciones.
 */
public class ServicioTipoCambio {

    private final RepositorioTipoCambio repositorio;

    /** El repositorio llega desde afuera (inyeccion por constructor). */
    public ServicioTipoCambio(RepositorioTipoCambio repositorio) {
        if (repositorio == null) {
            throw new IllegalArgumentException("El servicio necesita un repositorio de tipo de cambio");
        }
        this.repositorio = repositorio;
    }

    /** Proveedor cotiza en dolares y hay que pagarle: tasa de VENTA. */
    public double convertirAColonesParaPagar(double usd) {
        validarMonto(usd);
        return redondear(usd * actual().getVenta());
    }

    /** Cliente paga con dolares y la ferreteria los recibe: tasa de COMPRA. */
    public double convertirAColonesParaRecibir(double usd) {
        validarMonto(usd);
        return redondear(usd * actual().getCompra());
    }

    /** Inverso de convertirAColonesParaPagar: divide entre la tasa de VENTA. */
    public double convertirADolaresParaPagar(double crc) {
        validarMonto(crc);
        return redondear(crc / actual().getVenta());
    }

    /**
     * Tipo de cambio de una fecha. Para el NEGOCIO, pedir un dia sin tipo de
     * cambio es un error (no se puede facturar con eso), por eso aqui se lanza
     * la excepcion, aunque el repositorio solo haya devuelto null.
     */
    public TipoCambio delDia(String fecha) {
        TipoCambio tc = repositorio.obtenerPorFecha(fecha);
        if (tc == null) {
            throw new IllegalArgumentException("No hay tipo de cambio para " + fecha);
        }
        return tc;
    }

    /** Colones de diferencia entre pagar y recibir, por cada 100 dolares. */
    public double diferencialPorCada100() {
        return redondear(actual().diferencial() * 100);
    }

    /** El tipo de cambio mas reciente disponible (el "del dia" para facturar). */
    public TipoCambio actual() {
        TipoCambio tc = repositorio.obtenerMasReciente();
        if (tc == null) {
            throw new IllegalStateException("No hay ningun tipo de cambio disponible");
        }
        return tc;
    }

    private static void validarMonto(double monto) {
        if (monto < 0) {
            throw new IllegalArgumentException("El monto no puede ser negativo: " + monto);
        }
    }

    /**
     * Redondea a 2 decimales (centimos). double no representa exacto 513.40,
     * asi que 100 * 7.15 da 714.9999...; redondear es una regla del negocio
     * (se cobra en centimos), por eso vive aqui y no en la presentacion.
     */
    private static double redondear(double monto) {
        return Math.round(monto * 100.0) / 100.0;
    }
}
