import { cva, type VariantProps } from "class-variance-authority";
import { View } from "react-native";
import { AuthedImage } from "@/components/ui/authedImage";
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

const avatarVariants = cva("rounded-full", {
    variants: {
        size: {
            default: "w-10 h-10",
            lg: "w-20 h-20",
        },
    },
    defaultVariants: { size: "default" },
});

// Initialene følger sirkelen. Med fast `text-sm` ble de en prikk midt i
// profilbildet på profilsida.
const initialsVariants = cva("font-semibold text-muted-foreground", {
    variants: {
        size: {
            default: "text-sm",
            lg: "text-2xl",
        },
    },
    defaultVariants: { size: "default" },
});

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
    size,
    className,
}: {
    name: string;
    image: string | null;
    className?: string;
} & VariantProps<typeof avatarVariants>) {
    if (image) {
        return (
            <AuthedImage
                uri={avatarImageUrl(image)}
                className={cn(avatarVariants({ size }), className)}
                resizeMode="cover"
            />
        );
    }

    return (
        <View
            className={cn(
                avatarVariants({ size }),
                "bg-gray-200 dark:bg-secondary/50 items-center justify-center",
                className
            )}
        >
            <Text className={initialsVariants({ size })}>
                {initials(name)}
            </Text>
        </View>
    );
}
