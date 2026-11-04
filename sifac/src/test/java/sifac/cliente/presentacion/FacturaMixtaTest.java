package sifac.cliente.presentacion;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Scanner;

import org.junit.jupiter.api.Test;

import sifac.comun.entidades.Factura;
import sifac.comun.entidades.LineaFactura;
import sifac.comun.entidades.Moneda;
import sifac.servidor.datos.TipoCambioEnMemoria;
import sifac.servidor.logica.ServicioFacturacion;
import sifac.servidor.logica.ServicioTipoCambio;

/** Fase 4: la factura de prueba debe salir exactamente como en el enunciado. */
class FacturaMixtaTest {

    private static final String ESPERADA = String.join(System.lineSeparator(),
            "Tubo PVC 1/2         10 x C  1000.00  ->  C   10000.00",
            "Taladro importado     1 x $   120.00  ->  C   61608.00",
            "Clavos 2 pulg         5 x C  1200.00  ->  C    6000.00",
            "                                          -------------",
            "SUBTOTAL                                  C   77608.00",
            "IVA 13%                                   C   10089.04",
            "TOTAL                                     C   87697.04") + System.lineSeparator();

    private final ServicioTipoCambio tipoCambio = new ServicioTipoCambio(new TipoCambioEnMemoria());
    private final ServicioFacturacion facturacion = new ServicioFacturacion(tipoCambio);

    @Test
    void imprimeLaFacturaDePrueba() {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        MenuConsola menu = new MenuConsola(tipoCambio, facturacion,
                new Scanner(""), new PrintStream(buffer, true, StandardCharsets.UTF_8));

        menu.imprimirFactura(facturacion.facturar(lineasDePrueba()));

        assertEquals(ESPERADA, buffer.toString(StandardCharsets.UTF_8));
    }

    @Test
    void elMenuCompletoFacturaConEntradaDelUsuario() {
        String teclado = String.join("\n",
                "3",
                "Tubo PVC 1/2", "10", "C", "1000",
                "Taladro importado", "1", "$", "120,00",
                "Clavos 2 pulg", "5", "C", "1200",
                "",
                "4") + "\n";
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        new MenuConsola(tipoCambio, facturacion, new Scanner(teclado),
                new PrintStream(buffer, true, StandardCharsets.UTF_8)).iniciar();

        String pantalla = buffer.toString(StandardCharsets.UTF_8);
        assertTrue(pantalla.contains("TOTAL                                     C   87697.04"), pantalla);
    }

    @Test
    void elMenuVuelveAPreguntarCantidadYMonedaInvalidas() {
        String teclado = String.join("\n",
                "3",
                "Taladro importado", "2,7", "0", "1", "X", "$", "120",
                "",
                "4") + "\n";
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        new MenuConsola(tipoCambio, facturacion, new Scanner(teclado),
                new PrintStream(buffer, true, StandardCharsets.UTF_8)).iniciar();

        String pantalla = buffer.toString(StandardCharsets.UTF_8);
        assertTrue(pantalla.contains("La cantidad debe ser un numero entero mayor que cero."), pantalla);
        assertTrue(pantalla.contains("Escriba C para colones o $ para dolares."), pantalla);
        assertTrue(pantalla.contains("Taladro importado     1 x $   120.00  ->  C   61608.00"), pantalla);
    }

    @Test
    void totalesDeLaLogica() {
        Factura factura = facturacion.facturar(lineasDePrueba());
        assertEquals(77608.00, factura.getSubtotal(), 0.001);
        assertEquals(10089.04, factura.getIva(), 0.001);
        assertEquals(87697.04, factura.getTotal(), 0.001);
        assertEquals("2026-11-03", factura.getTipoCambio().getFecha());
    }

    private static List<LineaFactura> lineasDePrueba() {
        return List.of(
                new LineaFactura("Tubo PVC 1/2", 10, 1000.00, Moneda.COLONES),
                new LineaFactura("Taladro importado", 1, 120.00, Moneda.DOLARES),
                new LineaFactura("Clavos 2 pulg", 5, 1200.00, Moneda.COLONES));
    }
}
