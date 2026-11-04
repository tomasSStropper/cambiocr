package sifac.servidor.logica;

import java.util.ArrayList;
import java.util.List;

import sifac.comun.entidades.Factura;
import sifac.comun.entidades.LineaFactura;
import sifac.comun.entidades.LineaFacturada;
import sifac.comun.entidades.Moneda;
import sifac.comun.entidades.TipoCambio;

/**
 * Reglas de facturacion: pasar cada linea a colones, sumar y aplicar el IVA.
 *
 * Regla clave: una factura usa UN solo tipo de cambio, fijado al empezar a
 * calcularla. Asi todas sus lineas y sus totales son coherentes entre si,
 * aunque el BCCR publique un dato nuevo a mitad del proceso.
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

    /** Calcula la factura completa con un unico tipo de cambio. */
    public Factura facturar(List<LineaFactura> lineas) {
        if (lineas == null || lineas.isEmpty()) {
            throw new IllegalArgumentException("La factura necesita al menos una linea");
        }
        for (LineaFactura linea : lineas) {
            validar(linea);
        }

        // Se consulta el tipo de cambio UNA vez, y solo si hace falta.
        boolean hayDolares = lineas.stream().anyMatch(l -> l.getMoneda() == Moneda.DOLARES);
        TipoCambio tc = hayDolares ? tipoCambio.actual() : null;

        List<LineaFacturada> calculadas = new ArrayList<>();
        double subtotal = 0;
        for (LineaFactura linea : lineas) {
            double totalLinea = totalLineaEnColones(linea, tc);
            calculadas.add(new LineaFacturada(linea, totalLinea));
            subtotal += totalLinea;
        }
        subtotal = Dinero.redondear(subtotal);
        double iva = iva(subtotal);
        double total = Dinero.redondear(subtotal + iva);
        return new Factura(calculadas, subtotal, PORCENTAJE_IVA, iva, total, tc);
    }

    /**
     * Una linea en dolares es mercaderia que la ferreteria le paga al proveedor
     * en dolares: se convierte "para pagar" (tasa de VENTA).
     */
    private double totalLineaEnColones(LineaFactura linea, TipoCambio tc) {
        double monto = linea.montoEnMonedaOriginal();
        if (linea.getMoneda() == Moneda.DOLARES) {
            return tipoCambio.convertirAColonesParaPagar(monto, tc);
        }
        return Dinero.redondear(monto);
    }

    public double iva(double subtotal) {
        return Dinero.redondear(subtotal * PORCENTAJE_IVA / 100.0);
    }

    public int getPorcentajeIva() {
        return PORCENTAJE_IVA;
    }

    private static void validar(LineaFactura linea) {
        if (linea.getCantidad() <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor que cero");
        }
        if (linea.getPrecioUnitario() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }
        if (linea.getMoneda() == null) {
            throw new IllegalArgumentException("La linea necesita una moneda");
        }
    }
}
