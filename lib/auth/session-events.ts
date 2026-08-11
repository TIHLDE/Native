/**
 * Beskjed om at sesjonen er borte.
 *
 * Tokenene ligger i `expo-secure-store`, ikke i React, så når en fornyelse
 * feiler og de slettes er det ingenting som forteller skjermene om det. Uten
 * denne beskjeden blir brukeren stående inne i appen med en feilmelding på
 * hver eneste side — også på profilen, der «Logg ut» ligger — og kommer seg
 * ikke ut uten å slette appen.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export function onSessionLost(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function emitSessionLost(): void {
    // Kopi, siden en lytter kan melde seg av mens vi går gjennom settet.
    for (const listener of [...listeners]) listener();
}
