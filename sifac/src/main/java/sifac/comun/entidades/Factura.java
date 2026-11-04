package sifac.comun.entidades;

import java.util.List;

/**
 * Resultado de facturar: las lineas calculadas, los totales y el tipo de cambio
 * con el que se hizo. Inmutable: una factura emitida no se recalcula.
 */
public class Factura {

    private final List<LineaFacturada> lineas;
    private final double subtotal;
    private final int porcentajeIva;
    private final double iva;
    private final double total;
    private final TipoCambio tipoCambio; // null si la factura no tiene lineas en dolares

    public Factura(List<LineaFacturada> lineas, double subtotal, int porcentajeIva, double iva,
                   double total, TipoCambio tipoCambio) {
        this.lineas = List.copyOf(lineas);
        this.subtotal = subtotal;
        this.porcentajeIva = porcentajeIva;
        this.iva = iva;
        this.total = total;
        this.tipoCambio = tipoCambio;
    }

    public List<LineaFacturada> getLineas() {
        return lineas;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public int getPorcentajeIva() {
        return porcentajeIva;
    }

    public double getIva() {
        return iva;
    }

    public double getTotal() {
        return total;
    }

    public TipoCambio getTipoCambio() {
        return tipoCambio;
    }
}
