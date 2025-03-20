import me from "@/actions/users/me";
import { Text } from "@/components/ui/text";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import QRCode from 'react-native-qrcode-svg';

export default function qrmodal() {
    const { isDarkColorScheme } = useColorScheme();

    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    })

    if (user.isPending) {
        return (
            <View>
                <Text className="text-center">Loading...</Text>
            </View>
        )
    }

    if (user.isError) {
        return (
            <View>
                <Text className="text-destructive">Error: {user.error.message}</Text>
            </View>
        )
    }

    return (
        <View className="w-full flex flex-col p-2 mt-20 justify-center items-center">
            <View className="m-auto">
                <QRCode value={user.data.user_id}
                    backgroundColor="transparent"
                    color={isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text}
                    size={300}
                />
            </View>
            <Text className="text-2xl mt-12">
                {user.data.first_name} {user.data.last_name}
            </Text>
            <Text className="text-xl text-muted-foreground">
                @{user.data.user_id}
            </Text>
        </View>
    )
}