package sifac.servidor.logica;

import java.util.List;

import sifac.comun.entidades.LineaFactura;
import sifac.comun.entidades.Moneda;

/**
 * Reglas de facturacion: pasar cada linea a colones, sumar y aplicar el IVA.
 *
 * Usa ServicioTipoCambio para las lineas en dolares. No sabe de donde sale
 * el tipo de cambio: eso ya quedo escondido detras del otro servicio.
 */
public class ServicioFacturacion {

    /** Si el IVA cambia, se cambia SOLO aqui. */
    public static final int PORCENTAJE_IVA = 13;

    private final ServicioTipoCambio tipoCambio;

    public ServicioFacturacion(ServicioTipoCambio tipoCambio) {
        if (tipoCambio == null) {
            throw new IllegalArgumentException("La facturacion necesita el servicio de tipo de cambio");
        }
        this.tipoCambio = tipoCambio;
    }

    /**
     * Total de la linea en colones. Una linea en dolares es mercaderia que la
     * ferreteria le paga al proveedor en dolares: se convierte "para pagar"
     * (tasa de VENTA).
     */
    public double totalLineaEnColones(LineaFactura linea) {
        if (linea.getCantidad() <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor que cero");
        }
        if (linea.getPrecioUnitario() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }
        double monto = linea.montoEnMonedaOriginal();
        if (linea.getMoneda() == Moneda.DOLARES) {
            return tipoCambio.convertirAColonesParaPagar(monto);
        }
        return redondear(monto);
    }

    public double subtotal(List<LineaFactura> lineas) {
        double suma = 0;
        for (LineaFactura linea : lineas) {
            suma += totalLineaEnColones(linea);
        }
        return redondear(suma);
    }

    public double iva(double subtotal) {
        return redondear(subtotal * PORCENTAJE_IVA / 100.0);
    }

    public double total(List<LineaFactura> lineas) {
        double subtotal = subtotal(lineas);
        return redondear(subtotal + iva(subtotal));
    }

    public int getPorcentajeIva() {
        return PORCENTAJE_IVA;
    }

    private static double redondear(double monto) {
        return Math.round(monto * 100.0) / 100.0;
    }
}
