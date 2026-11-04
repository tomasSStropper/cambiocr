package sifac.comun.entidades;

/**
 * Una linea de factura tal como se cotizo: descripcion, cantidad, precio
 * unitario y la moneda de ese precio. No sabe convertir: eso necesita el tipo
 * de cambio, que es asunto de la logica.
 */
public class LineaFactura {

    private final String descripcion;
    private final int cantidad;
    private final double precioUnitario;
    private final Moneda moneda;

    public LineaFactura(String descripcion, int cantidad, double precioUnitario, Moneda moneda) {
        this.descripcion = descripcion;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.moneda = moneda;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public int getCantidad() {
        return cantidad;
    }

    public double getPrecioUnitario() {
        return precioUnitario;
    }

    public Moneda getMoneda() {
        return moneda;
    }

    /** Cantidad por precio, en la moneda original de la linea. */
    public double montoEnMonedaOriginal() {
        return cantidad * precioUnitario;
    }
}
