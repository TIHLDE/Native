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

export default function CoverImage({
    uri,
    className,
}: {
    uri?: string | null;
    className?: string;
}) {
    return (
        <View
            className={cn(
                COVER_IMAGE_FRAME,
                "overflow-hidden bg-muted dark:bg-secondary/30",
                className,
            )}
        >
            {uri ? (
                <Image
                    source={{ uri: coverImageUrl(uri) }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            ) : (
                <ImageMissing />
            )}
        </View>
    );
}
