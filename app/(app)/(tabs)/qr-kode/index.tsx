import me from "@/actions/users/me";
import { Text } from "@/components/ui/text";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import PageWrapper from "@/components/ui/pagewrapper";

export default function QrKode() {
    const { isDarkColorScheme } = useColorScheme();

    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    })

    if (user.isPending) {
        return (
            <PageWrapper>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-center">Loading...</Text>
                </View>
            </PageWrapper>
        )
    }

    if (user.isError) {
        return (
            <PageWrapper>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-destructive">Error: {user.error.message}</Text>
                </View>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper className="flex-1">
            <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center', 
                paddingHorizontal: 16,
                paddingBottom: 100 
            }}>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <QRCode 
                        value={user.data.user_id || ''}
                        backgroundColor="transparent"
                        color={isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text}
                        size={300}
                    />
                </View>
                <Text className="text-2xl text-center">
                    {user.data.first_name} {user.data.last_name}
                </Text>
                <Text className="text-xl text-muted-foreground text-center mt-2">
                    @{user.data.user_id}
                </Text>
            </View>
        </PageWrapper>
    )
}
