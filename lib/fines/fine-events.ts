/**
 * Beskjed om at en bot er gitt.
 *
 * Bekreft-skjermen lukker flyten med `dismissAll`, som bare fjerner skjermer
 * og ikke kan ta med seg noe tilbake. Bot-fanen holder BotBlitz-bildet til
 * en bot er gitt, så den trenger å få vite det her i stedet. Beskjeden sier
 * ikke hvilket bilde boten fikk, så bildet forkastes uansett. Samme
 * mønster som `lib/auth/session-events.ts`.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export function onFineSubmitted(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function emitFineSubmitted(): void {
    // Kopi, siden en lytter kan melde seg av mens vi går gjennom settet.
    for (const listener of [...listeners]) listener();
}
