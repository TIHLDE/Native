import { QueryClient } from "@tanstack/react-query";

/**
 * Én klient for hele appen.
 *
 * Den lå tidligere i `RootLayout` som `new QueryClient()` i selve render-kallet,
 * så hver render kastet cachen og alle pågående kall. Her lever den så lenge
 * appen gjør, og kan tømmes utenfra når sesjonen ryker — ellers ville
 * feilmeldingene fra den døde sesjonen ligget igjen etter neste innlogging.
 */
export const queryClient = new QueryClient();
