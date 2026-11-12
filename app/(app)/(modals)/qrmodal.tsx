import me from "@/actions/users/me";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { useQuery } from "@tanstack/react-query";
import { useWindowDimensions, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';

export default function QrModal() {
    const { isDarkColorScheme } = useColorScheme();
    const { width } = useWindowDimensions();

    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    })

    if (user.isPending) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <Text className="text-center">Laster...</Text>
            </PageWrapper>
        )
    }

    if (user.isError) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <Text className="text-destructive">Feil: {user.error.message}</Text>
            </PageWrapper>
        )
    }

    return (
        // Headeren er gjennomsiktig på iOS, så innholdet starter bak den.
        // PageWrapper rykker inn etter safe area, som de andre modalene.
        <PageWrapper className="flex-1 bg-background">
            <View className="flex-1 items-center justify-center p-2">
                <QRCode value={user.data.id}
                    backgroundColor="transparent"
                    color={isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text}
                    // Koden skal få plass på smale skjermer, med luft på sidene.
                    size={Math.min(width - 64, 300)}
                />
                <Text className="text-2xl mt-12">
                    {user.data.firstName} {user.data.lastName}
                </Text>
                <Text className="text-xl text-muted-foreground">
                    @{user.data.userId}
                </Text>
            </View>
        </PageWrapper>
    )
}
