package sifac.comun.entidades;

/** Una linea de factura ya calculada: la linea original y su total en colones. */
public class LineaFacturada {

    private final LineaFactura linea;
    private final double totalColones;

    public LineaFacturada(LineaFactura linea, double totalColones) {
        this.linea = linea;
        this.totalColones = totalColones;
    }

    public LineaFactura getLinea() {
        return linea;
    }

    public double getTotalColones() {
        return totalColones;
    }
}
