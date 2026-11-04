package sifac.cliente.presentacion;

import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Scanner;

import sifac.comun.entidades.LineaFactura;
import sifac.comun.entidades.Moneda;
import sifac.comun.entidades.TipoCambio;
import sifac.servidor.logica.ServicioFacturacion;
import sifac.servidor.logica.ServicioTipoCambio;

/**
 * Menu de consola. Pide datos, llama a la logica y muestra resultados. Nada mas.
 *
 * No calcula nada ni sabe de donde sale el tipo de cambio: solo conoce los
 * servicios de la capa de logica (mira hacia abajo, una capa).
 * Recibe el Scanner y el PrintStream por constructor para poder probarlo
 * sin teclado ni pantalla.
 */
public class MenuConsola {

    private final ServicioTipoCambio tipoCambio;
    private final ServicioFacturacion facturacion;
    private final Scanner entrada;
    private final PrintStream salida;

    public MenuConsola(ServicioTipoCambio tipoCambio, ServicioFacturacion facturacion,
                       Scanner entrada, PrintStream salida) {
        this.tipoCambio = tipoCambio;
        this.facturacion = facturacion;
        this.entrada = entrada;
        this.salida = salida;
    }

    public void iniciar() {
        boolean seguir = true;
        while (seguir) {
            salida.println();
            salida.println("=== SIFAC - Tipo de cambio ===");
            salida.println("1. Ver el tipo de cambio del dia");
            salida.println("2. Convertir dolares a colones");
            salida.println("3. Facturar");
            salida.println("4. Salir");
            String opcion = leer("Opcion: ");
            if (opcion == null) {
                break; // se acabo la entrada (por ejemplo, Ctrl+D)
            }
            // La logica avisa los problemas con excepciones; aqui se convierten en mensajes.
            try {
                switch (opcion) {
                    case "1" -> verTipoCambio();
                    case "2" -> convertir();
                    case "3" -> facturar();
                    case "4" -> seguir = false;
                    default -> salida.println("Opcion invalida.");
                }
            } catch (IllegalArgumentException | IllegalStateException e) {
                salida.println("Error: " + e.getMessage());
            }
        }
        salida.println("Hasta luego.");
    }

    private void verTipoCambio() {
        String fecha = leer("Fecha AAAA-MM-DD (Enter = mas reciente): ");
        TipoCambio tc = (fecha == null || fecha.isEmpty())
                ? tipoCambio.actual()
                : tipoCambio.delDia(fecha);
        salida.println(tc);
        salida.println(String.format(Locale.US, "Diferencial: %.2f por dolar", tc.diferencial()));
    }

    private void convertir() {
        double usd = leerNumero("Monto en dolares: ");
        String sentido = leer("Es para (P)agar o para (R)ecibir? ");
        double colones;
        if ("P".equalsIgnoreCase(sentido)) {
            colones = tipoCambio.convertirAColonesParaPagar(usd);
        } else if ("R".equalsIgnoreCase(sentido)) {
            colones = tipoCambio.convertirAColonesParaRecibir(usd);
        } else {
            salida.println("Debe escribir P o R.");
            return;
        }
        salida.println(String.format(Locale.US, "$ %.2f -> C %.2f", usd, colones));
    }

    private void facturar() {
        List<LineaFactura> lineas = new ArrayList<>();
        salida.println("Ingrese las lineas. Deje la descripcion vacia para terminar.");
        while (true) {
            String descripcion = leer("Descripcion: ");
            if (descripcion == null || descripcion.isEmpty()) {
                break;
            }
            int cantidad = (int) leerNumero("Cantidad: ");
            String m = leer("Moneda del precio (C = colones, $ = dolares): ");
            Moneda moneda = "$".equals(m) ? Moneda.DOLARES : Moneda.COLONES;
            double precio = leerNumero("Precio unitario: ");
            lineas.add(new LineaFactura(descripcion, cantidad, precio, moneda));
        }
        if (lineas.isEmpty()) {
            salida.println("Factura vacia.");
            return;
        }
        salida.println();
        imprimirFactura(lineas);
    }

    /** Arma el texto de la factura. Los montos los calcula la logica. */
    void imprimirFactura(List<LineaFactura> lineas) {
        for (LineaFactura l : lineas) {
            salida.println(String.format(Locale.US, "%-20s%3d x %s%9.2f  ->  C%11.2f",
                    l.getDescripcion(), l.getCantidad(), simbolo(l.getMoneda()),
                    l.getPrecioUnitario(), facturacion.totalLineaEnColones(l)));
        }
        double subtotal = facturacion.subtotal(lineas);
        double iva = facturacion.iva(subtotal);
        salida.println(" ".repeat(42) + "-------------");
        salida.println(String.format(Locale.US, "%-42sC%11.2f", "SUBTOTAL", subtotal));
        salida.println(String.format(Locale.US, "%-42sC%11.2f", "IVA " + facturacion.getPorcentajeIva() + "%", iva));
        salida.println(String.format(Locale.US, "%-42sC%11.2f", "TOTAL", facturacion.total(lineas)));
    }

    private static String simbolo(Moneda moneda) {
        return moneda == Moneda.DOLARES ? "$" : "C";
    }

    private String leer(String mensaje) {
        salida.print(mensaje);
        return entrada.hasNextLine() ? entrada.nextLine().trim() : null;
    }

    /** Acepta 120.50 o 120,50; vuelve a preguntar si no es un numero. */
    private double leerNumero(String mensaje) {
        while (true) {
            String texto = leer(mensaje);
            if (texto == null) {
                throw new IllegalStateException("Se termino la entrada");
            }
            try {
                return Double.parseDouble(texto.replace(',', '.'));
            } catch (NumberFormatException e) {
                salida.println("Eso no es un numero, intente de nuevo.");
            }
        }
    }
}
