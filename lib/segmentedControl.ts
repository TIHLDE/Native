/** `p-1` på hver side av bryteren. */
export const CONTROL_PADDING = 8;

/**
 * Bredden hvert valg får i en bryter som kan rulle sidelengs, eller
 * `undefined` når den ikke er målt ennå (eller ikke skal rulle).
 *
 * En lik andel av bredden — slik `flex-1` gir — men aldri smalere enn den
 * lengste teksten. Får alle plass, er det nøyaktig det gamle oppsettet; ellers
 * blir raden bredere enn skjermen og ruller.
 *
 * Mål utover dagens antall valg tas ikke med: går bryteren fra fire faner til
 * to, ligger de to siste målene igjen til de er målt på nytt.
 */
export function segmentWidth({
    scrollable,
    containerWidth,
    labelWidths,
    optionCount,
}: {
    scrollable: boolean;
    containerWidth: number;
    labelWidths: number[];
    optionCount: number;
}): number | undefined {
    if (!scrollable || containerWidth <= 0 || optionCount <= 0) return undefined;
    const widestLabel = Math.max(0, ...labelWidths.slice(0, optionCount));
    return Math.max(
        (containerWidth - CONTROL_PADDING) / optionCount,
        widestLabel
    );
}
