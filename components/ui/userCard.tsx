import { User } from "@/actions/types";
import { Image, View } from "react-native";
import { Text } from "./text";

export default function UserCard({ user }: { user: User }) {
    const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`;

    return (
        <View className="flex-row items-center px-4 py-3">
            {user.image ? (
                <Image className="w-10 h-10 rounded-full" source={{ uri: user.image }} />
            ) : (
                <View className="w-10 h-10 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                    <Text className="text-sm font-bold text-primary dark:text-accent">
                        {initials}
                    </Text>
                </View>
            )}
            <View className="ml-3 flex-1">
                <Text className="text-base text-foreground" numberOfLines={1}>
                    {user.first_name} {user.last_name}
                </Text>
            </View>
        </View>
    );
}