package sifac.servidor.logica;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

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

    /** Proveedor cotiza en dolares y hay que pagarle: tasa de VENTA del dia mas reciente. */
    public double convertirAColonesParaPagar(double usd) {
        return convertirAColonesParaPagar(usd, actual());
    }

    /** Igual, pero con un tipo de cambio ya fijado (por ejemplo, el de una factura). */
    public double convertirAColonesParaPagar(double usd, TipoCambio tc) {
        Dinero.validarNoNegativo(usd);
        return Dinero.redondear(usd * tc.getVenta());
    }

    /** Cliente paga con dolares y la ferreteria los recibe: tasa de COMPRA. */
    public double convertirAColonesParaRecibir(double usd) {
        Dinero.validarNoNegativo(usd);
        return Dinero.redondear(usd * actual().getCompra());
    }

    /** Inverso de convertirAColonesParaPagar: divide entre la tasa de VENTA. */
    public double convertirADolaresParaPagar(double crc) {
        Dinero.validarNoNegativo(crc);
        return Dinero.redondear(crc / actual().getVenta());
    }

    /**
     * Tipo de cambio de una fecha. Para el NEGOCIO, pedir un dia sin tipo de
     * cambio es un error (no se puede facturar con eso), por eso aqui se lanza
     * la excepcion, aunque el repositorio solo haya devuelto null.
     */
    public TipoCambio delDia(String fecha) {
        validarFecha(fecha);
        TipoCambio tc = repositorio.obtenerPorFecha(fecha);
        if (tc == null) {
            throw new IllegalArgumentException("No hay tipo de cambio para " + fecha);
        }
        return tc;
    }

    /** Colones de diferencia entre pagar y recibir, por cada 100 dolares. */
    public double diferencialPorCada100() {
        return Dinero.redondear(actual().diferencial() * 100);
    }

    /** El tipo de cambio mas reciente disponible (el "del dia" para facturar). */
    public TipoCambio actual() {
        TipoCambio tc = repositorio.obtenerMasReciente();
        if (tc == null) {
            throw new IllegalStateException("No hay ningun tipo de cambio disponible");
        }
        return tc;
    }

    /** Regla: una fecha valida es AAAA-MM-DD y existe en el calendario. */
    private static void validarFecha(String fecha) {
        try {
            if (fecha == null || fecha.length() != 10) {
                throw new DateTimeParseException("largo", String.valueOf(fecha), 0);
            }
            LocalDate.parse(fecha);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Fecha invalida: " + fecha + ". Use el formato AAAA-MM-DD");
        }
    }
}
