/**
 * Studieetiketten på profilene: «Digital forretningsutvikling · 2. klasse».
 *
 * Klassetrinnet regnes ikke ut her. Photon serverer det som `classYear`, fordi
 * regelen trenger mer enn klienten ser: første år på master er 4. klasse, og
 * det holder bare hvis man vet at året hører til masteren og ikke bachelorgraden
 * før den. Appen regnet det ut fra kullet før, og ga både feil trinn for
 * masterstudenter og feil program for dem som hadde byttet studie.
 *
 * Formatet er det samme som `formatStudyLabel` i `apps/kvark/src/lib/utils.ts`,
 * så profilen sier det samme i appen og på nettsiden.
 */

/**
 * Programmet og klassetrinnet, med prikk imellom. Mangler den ene, står den
 * andre alene; mangler begge, gir den `null`.
 *
 * Photon gir `null` for alumni, så de får bare programmet — ikke et trinn som
 * ikke finnes.
 */
export function formatStudyLabel(
    programme: string | null | undefined,
    classYear: number | null | undefined,
): string | null {
    const detail = classYear ? `${classYear}. klasse` : null;
    return [programme, detail].filter(Boolean).join(" · ") || null;
}
