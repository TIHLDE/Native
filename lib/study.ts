/**
 * Klassetrinn ut fra kullet.
 *
 * Speiler `computeClassYear`, `programmeLength` og `formatStudyLabel` i
 * `apps/kvark/src/lib/utils.ts` i Photon-monorepoet, så profilen i appen og på
 * nettsiden sier det samme om samme bruker.
 */

/**
 * Det norske studieåret starter i august, så fra og med august teller man ett
 * trinn opp. Måned er 0-indeksert, så `>= 7` er august og senere.
 */
export function computeClassYear(startYear: number, now = new Date()): number {
    return now.getFullYear() - startYear + (now.getMonth() >= 7 ? 1 : 0);
}

/**
 * Masterprogrammene ved TIHLDE. Alt annet (Dataingeniør, Digital
 * forretningsutvikling, Digital infrastruktur og cybersikkerhet, Drift,
 * Informasjonsbehandling) er treårig bachelor. Programnavnene har variert
 * mellom Lepton-importen og Feide, så vi matcher på det særegne ordet.
 */
const MASTER_PROGRAMME_MARKERS = ["samhandling", "transformasjon", "master"];

/** Antall år programmet varer — brukes til å avgjøre når noen er alumni. */
export function programmeLength(programme: string | undefined): number {
    if (!programme) return 3;
    const name = programme.toLowerCase();
    return MASTER_PROGRAMME_MARKERS.some((marker) => name.includes(marker))
        ? 5
        : 3;
}

/**
 * «3. klasse» mens man går på studiet, «kull 2022» etterpå.
 *
 * Klassetrinnet vises bare så lenge man faktisk studerer — til og med 3. klasse
 * på bachelor, 5. på master. Er man forbi det, er man alumni, og da er kullet
 * det riktige å vise framfor et trinn som ikke finnes.
 *
 * Gir `null` når vi ikke vet oppstartsåret. Photon lar det stå tomt for
 * medlemmer som aldri har koblet Feide.
 */
export function classYearLabel(
    programme: string | undefined,
    startYear: number | undefined,
    now = new Date(),
): string | null {
    if (startYear === undefined || !Number.isFinite(startYear)) return null;

    const classYear = computeClassYear(startYear, now);
    const isStudying = classYear >= 1 && classYear <= programmeLength(programme);

    return isStudying ? `${classYear}. klasse` : `kull ${startYear}`;
}

/**
 * Oppstartsåret slik `toUser` legger det: en streng, tom når Photon ikke vet.
 */
export function parseStartYear(value: string | undefined): number | undefined {
    if (!value) return undefined;
    const year = Number.parseInt(value, 10);
    return Number.isFinite(year) ? year : undefined;
}
