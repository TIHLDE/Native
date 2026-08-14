/**
 * Bilde-URLer mot Photons `/api/assets`.
 *
 * Speiler `apps/kvark/src/lib/assets.ts` i Photon: originalene er det som ble
 * lastet opp — det migrerte arkivet inneholder JPEG-er rett fra kamera — så et
 * kort som rendres 400 px bredt skal aldri peke på en av dem. `?w=` gir samme
 * bilde skalert (og WebP-omkodet) med bevart sideforhold.
 *
 * Nettsiden bruker `srcSet` og lar nettleseren velge bredde. React Native har
 * ingen `srcSet`, så bredden velges her ut fra hvor bredt bildet faktisk
 * rendres, ganget med skjermens pikselforhold.
 */
import { Dimensions, PixelRatio } from "react-native";

/**
 * Breddene `GET /api/assets/:key?w=` godtar. Må holdes i takt med
 * `IMAGE_VARIANT_WIDTHS` i Photon-APIet — en bredde utenfor listen er en 400,
 * ikke et stille fullstort bilde.
 */
export const ASSET_IMAGE_WIDTHS = [
    160, 320, 480, 640, 960, 1280, 1920,
] as const;

export type AssetImageWidth = (typeof ASSET_IMAGE_WIDTHS)[number];

const LARGEST_WIDTH = ASSET_IMAGE_WIDTHS[ASSET_IMAGE_WIDTHS.length - 1];

/**
 * Bare asset-URLer har varianter. Innebygde bilder under `@/assets` og alt en
 * tredjepart hoster sendes videre urørt.
 */
function isAssetUrl(url: string): boolean {
    return url.includes("/api/assets/");
}

/** Samme bilde i gitt bredde. */
export function assetImageUrl(url: string, width: AssetImageWidth): string {
    if (!isAssetUrl(url)) return url;

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}w=${width}`;
}

/**
 * Minste tillatte variant som dekker `layoutWidth` i faktiske piksler. En
 * mindre variant ville blitt oppskalert og sett uskarp ut på retina-skjermer.
 */
export function assetImageWidthFor(layoutWidth: number): AssetImageWidth {
    const pixels = PixelRatio.getPixelSizeForLayoutSize(layoutWidth);
    return ASSET_IMAGE_WIDTHS.find((width) => width >= pixels) ?? LARGEST_WIDTH;
}

/**
 * Forsidebilde i full skjermbredde — kort og hero-bilder ligger kant til kant.
 */
export function coverImageUrl(url: string, layoutWidth?: number): string {
    const width = layoutWidth ?? Dimensions.get("window").width;
    return assetImageUrl(url, assetImageWidthFor(width));
}

/**
 * Profilbilder og gruppelogoer rendres aldri over ~112 px, så én liten variant
 * er nok — og det hindrer at en medlemsliste drar ned et dusin fullstore
 * profilbilder.
 */
export function avatarImageUrl(url: string): string;
export function avatarImageUrl(url: string | undefined): string | undefined;
export function avatarImageUrl(url: string | undefined): string | undefined {
    return url === undefined ? undefined : assetImageUrl(url, 160);
}
