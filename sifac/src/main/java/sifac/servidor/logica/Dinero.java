package sifac.servidor.logica;

/**
 * Reglas de dinero compartidas por los servicios de la logica.
 *
 * Se usa double porque el enunciado lo pide. En un sistema real se usaria
 * BigDecimal: double no representa exacto valores como 513.40, por eso
 * 100 * 7.15 da 714.9999... y hay que redondear a centimos.
 */
final class Dinero {

    private Dinero() {
        // solo metodos estaticos
    }

    /** Redondea a 2 decimales (centimos). */
    static double redondear(double monto) {
        return Math.round(monto * 100.0) / 100.0;
    }

    static void validarNoNegativo(double monto) {
        if (monto < 0) {
            throw new IllegalArgumentException("El monto no puede ser negativo: " + monto);
        }
    }
}
