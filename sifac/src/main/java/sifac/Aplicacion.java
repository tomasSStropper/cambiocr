package sifac;

import java.util.Scanner;

import sifac.cliente.presentacion.MenuConsola;
import sifac.servidor.datos.RepositorioTipoCambio;
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
        // Lo unico que cambia en todo el sistema para usar otra fuente:
        RepositorioTipoCambio repo = new TipoCambioEnMemoria();
        // RepositorioTipoCambio repo = new TipoCambioBCCR(correo, token);

        ServicioTipoCambio servicio = new ServicioTipoCambio(repo);
        ServicioFacturacion facturacion = new ServicioFacturacion(servicio);

        new MenuConsola(servicio, facturacion, new Scanner(System.in), System.out).iniciar();
    }
}
