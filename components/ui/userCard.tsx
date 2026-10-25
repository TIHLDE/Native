import { User } from "@/actions/types";
import { avatarImageUrl } from "@/lib/images";
import { Pressable, View } from "react-native";
import { AuthedImage } from "./authedImage";
import { Text } from "./text";

export default function UserCard({ user, onPress }: { user: User; onPress?: () => void }) {
    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

    const card = (
        <View className="flex-row items-center px-4 py-3">
            {user.image ? (
                <AuthedImage
                    className="w-10 h-10 rounded-full"
                    uri={avatarImageUrl(user.image)}
                    resizeMode="cover"
                />
            ) : (
                <View className="w-10 h-10 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                    <Text className="text-sm font-bold text-primary">
                        {initials}
                    </Text>
                </View>
            )}
            <View className="ml-3 flex-1">
                <Text className="text-base text-foreground" numberOfLines={1}>
                    {user.firstName} {user.lastName}
                </Text>
            </View>
        </View>
    );

    if (!onPress) return card;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Åpne profilen til ${user.firstName} ${user.lastName}`}
            className="active:opacity-70"
        >
            {card}
        </Pressable>
    );
}