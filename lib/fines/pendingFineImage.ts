import type { PickedImage } from "@/components/boter/useFineImage";

/**
 * Overleveringen av BotBlitz-bildet fra bot-fanen til bekreft-skjermen.
 *
 * Bildet tas før gruppe, lov og brukere er valgt, og må følge med gjennom
 * flyten. Som filsti i route-params kunne en dyplenke satt den til hva som
 * helst, og bekreft-skjermen laster opp det den får. Derfor går bare en
 * tilfeldig id gjennom ruta, og bildet ligger her. En id fra en lenke treffer
 * ikke, og gir ingen bilde.
 *
 * Bare ett bilde om gangen: et nytt erstatter det gamle, og den gamle id-en
 * slutter å virke.
 */
let pending: { id: string; image: PickedImage } | null = null;

export function putPendingFineImage(image: PickedImage): string {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    pending = { id, image };
    return id;
}

export function getPendingFineImage(id?: string): PickedImage | null {
    return id && pending?.id === id ? pending.image : null;
}

export function clearPendingFineImage(): void {
    pending = null;
}
