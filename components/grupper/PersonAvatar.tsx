import { Image, View } from "react-native";
import { Text } from "@/components/ui/text";
import { avatarImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * Initialene av et visningsnavn — første bokstav i de to første ordene.
 *
 * Samme regel som `initials()` i Kvark (`apps/kvark/src/lib/utils.ts`), sånn at
 * en bruker uten profilbilde ser lik ut på nett og i appen.
 */
function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

/**
 * Profilbildet til en person, med Photons reserve når bildet mangler: initialene
 * i en nøytral sirkel, ikke et ikon.
 *
 * Fargeparet er ikke Photons `bg-muted`. Den er #f5f5f5 i lys modus og ville
 * forsvunnet i kortet, som er #f3f4f6 — samme grunn som statusmerket i
 * bøtelista bruker et annet par.
 */
export function PersonAvatar({
    name,
    image,
    className,
}: {
    name: string;
    image: string | null;
    className?: string;
}) {
    if (image) {
        return (
            <Image
                source={{ uri: avatarImageUrl(image) }}
                className={cn("w-10 h-10 rounded-full", className)}
                resizeMode="cover"
            />
        );
    }

    return (
        <View
            className={cn(
                "w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary/50 items-center justify-center",
                className
            )}
        >
            <Text className="text-sm font-semibold text-muted-foreground">
                {initials(name)}
            </Text>
        </View>
    );
}
