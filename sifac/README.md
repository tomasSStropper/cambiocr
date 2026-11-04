# SIFAC · Módulo de tipo de cambio

Factura líneas cotizadas en dólares y las cobra en colones con el tipo de cambio correcto del día.
Proyecto Java 17 + Maven, organizado en cuatro capas.

## Cómo correrlo

```bash
cd sifac
mvn test          # corre las verificaciones 2, 3, la factura de prueba y la fase 5
mvn package       # genera target/sifac-tipo-cambio-1.0.0.jar
java -jar target/sifac-tipo-cambio-1.0.0.jar          # datos en memoria (los de la actividad)
java -jar target/sifac-tipo-cambio-1.0.0.jar --bccr   # BCCR real, lee la variable BCCR_TOKEN
```

También se abre directo en NetBeans / IntelliJ / VS Code como proyecto Maven. La clase principal es `sifac.Aplicacion`.

## Mapa de capas

```
sifac.cliente.presentacion   MenuConsola              pide datos, muestra resultados (valida la entrada)
          │ conoce solo ↓
sifac.servidor.logica        ServicioTipoCambio       regla compra/venta, valida fechas
                             ServicioFacturacion      arma la Factura con UN solo tipo de cambio + IVA
                             Dinero                   redondeo a centimos (un solo lugar)
          │ conoce solo la INTERFAZ ↓
sifac.servidor.datos         RepositorioTipoCambio    (interfaz / contrato)
                             TipoCambioEnMemoria      implementacion simulada (la de la actividad)
                             TipoCambioBCCR           API SDDE real del BCCR (Gson solo vive aqui)
                             TipoCambioEnCache        decorador: recuerda lo que responde otro repositorio

sifac.comun.entidades        TipoCambio, LineaFactura, Moneda, Factura, LineaFacturada  <- no importan nada de SIFAC

sifac.Aplicacion             ensambla todo: el UNICO lugar que hace new de una clase de datos
```

Compruebe la regla usted mismo:

```bash
grep -rniE "memoria|bccr|simulado|System\.out" src/main/java/sifac/servidor/logica/
```

No debe imprimir nada.

## Commits por fase

Cada fase es un commit. Revíselos con `git log --oneline -- sifac` y `git show <commit>`. Así ve qué entró en cada puesto de control.

| Fase | Archivos | Prueba |
|------|----------|--------|
| 1 | `TipoCambio`, `RepositorioTipoCambio` | `TipoCambioTest` |
| 2 | `TipoCambioEnMemoria` | `TipoCambioEnMemoriaTest` (Verificación 2) |
| 3 | `ServicioTipoCambio` | `ServicioTipoCambioTest` (Verificación 3) |
| 4 | `LineaFactura`, `Moneda`, `ServicioFacturacion`, `MenuConsola`, `Aplicacion` | `FacturaMixtaTest` |
| 5 | `TipoCambioBCCR` + JSON de prueba en `src/test/resources/bccr` | `TipoCambioBCCRTest` |
| Auditoria | `Factura`, `LineaFacturada`, `Dinero`, `TipoCambioEnCache` | `ServicioFacturacionTest`, `TipoCambioEnCacheTest` |

> `TipoCambioBCCR` usa la API SDDE del BCCR (sitio nuevo): `Authorization: Bearer <token>`, indicadores 317/318. Los JSON de `src/test/resources/bccr` imitan esa respuesta; cuando tenga una real, guárdela ahí y úsela en la prueba.
