import { Image, View } from "react-native";

import { coverImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import ImageMissing from "./imageMissing";

/**
 * Rammen forsidebilder vises i, i takt med `cover-wide` i Photons
 * `IMAGE_PRESETS`.
 *
 * 21/9 er ikke et vilkårlig valg: den gamle opplastingsdialogen beskar alle
 * arrangement-, nyhets- og stillingsbilder til 21:9 før lagring, så hele det
 * migrerte arkivet er fysisk 1000×429, 1500×642 og så videre. Vises de i en
 * annen ramme, kastes piksler bort for ingenting — og motivet blir beskåret.
 */
export const COVER_IMAGE_FRAME = "w-full aspect-[21/9]";

/**
 * `fit="contain"` viser hele bildet i stedet for å fylle rammen. Det er for
 * stillingsbilder: de er ofte logoer, og lastes ikke lenger opp i 21:9, så
 * `cover` skjærer av sidene på dem. Bildene kommer med ugjennomsiktig hvit
 * bakgrunn, og derfor er rammen hvit i begge temaer — en grå ramme ville gitt
 * en hvit firkant midt i.
 */
export default function CoverImage({
    uri,
    fit = "cover",
    className,
}: {
    uri?: string | null;
    fit?: "cover" | "contain";
    className?: string;
}) {
    return (
        <View
            className={cn(
                COVER_IMAGE_FRAME,
                "overflow-hidden",
                uri && fit === "contain"
                    ? "bg-white"
                    : "bg-muted dark:bg-secondary/30",
                className,
            )}
        >
            {uri ? (
                <Image
                    source={{ uri: coverImageUrl(uri) }}
                    className="w-full h-full"
                    resizeMode={fit}
                />
            ) : (
                <ImageMissing />
            )}
        </View>
    );
}
