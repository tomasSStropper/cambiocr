package sifac.comun.entidades;

// Fijese: no hay ningun import de sifac.servidor ni de sifac.cliente.
// Esa ausencia ES la declaracion de que la entidad no depende de ninguna otra capa.
import java.util.Locale;

/**
 * Tipo de cambio de un dia: fecha, compra y venta.
 *
 * No sabe de donde vino (memoria, archivo o BCCR) ni para que se va a usar.
 * Es inmutable: los atributos son final y no hay setters. Un tipo de cambio
 * publicado no se "edita"; si cambia, es otro tipo de cambio.
 */
public class TipoCambio {

    private final String fecha;   // formato AAAA-MM-DD
    private final double compra;  // colones que el banco PAGA por cada dolar
    private final double venta;   // colones que el banco COBRA por cada dolar

    public TipoCambio(String fecha, double compra, double venta) {
        this.fecha = fecha;
        this.compra = compra;
        this.venta = venta;
    }

    public String getFecha() {
        return fecha;
    }

    public double getCompra() {
        return compra;
    }

    public double getVenta() {
        return venta;
    }

    /** Lo que gana el banco por cada dolar: venta menos compra. */
    public double diferencial() {
        return venta - compra;
    }

    @Override
    public String toString() {
        // Locale.US para que siempre salga punto decimal (506.25), sin importar
        // como este configurada la computadora donde corre.
        return String.format(Locale.US, "%s  compra %.2f  venta %.2f", fecha, compra, venta);
    }
}
