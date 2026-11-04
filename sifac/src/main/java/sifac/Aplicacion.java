package sifac;

import java.time.Duration;
import java.util.Scanner;

import sifac.cliente.presentacion.MenuConsola;
import sifac.servidor.datos.RepositorioTipoCambio;
import sifac.servidor.datos.TipoCambioBCCR;
import sifac.servidor.datos.TipoCambioEnCache;
import sifac.servidor.datos.TipoCambioEnMemoria;
import sifac.servidor.logica.ServicioFacturacion;
import sifac.servidor.logica.ServicioTipoCambio;

/**
 * Punto de arranque y "ensamblador" del sistema.
 *
 * Es el UNICO lugar que conoce las clases concretas de todas las capas y las
 * conecta. Ninguna capa crea a la de abajo: se la pasan por constructor.
 */
public class Aplicacion {

    public static void main(String[] args) {
        // Lo unico que cambia en todo el sistema para usar otra fuente.
        // Por defecto: memoria (los valores de la actividad). Con --bccr: el BCCR real.
        // El token se lee de la variable de entorno BCCR_TOKEN, nunca se escribe en el codigo.
        boolean usarBccr = args.length > 0 && args[0].equals("--bccr");
        RepositorioTipoCambio repo;
        try {
            repo = usarBccr
                    ? new TipoCambioEnCache(new TipoCambioBCCR(System.getenv("BCCR_TOKEN")), Duration.ofMinutes(10))
                    : new TipoCambioEnMemoria();
        } catch (IllegalArgumentException e) {
            System.err.println("No se pudo iniciar: " + e.getMessage());
            System.exit(1);
            return;
        }

        ServicioTipoCambio servicio = new ServicioTipoCambio(repo);
        ServicioFacturacion facturacion = new ServicioFacturacion(servicio);

        new MenuConsola(servicio, facturacion, new Scanner(System.in), System.out).iniciar();
    }
}
