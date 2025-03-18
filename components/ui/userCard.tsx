import { User } from "@/actions/types";
import { Image, View } from "react-native";
import { Text } from "./text";
import UserImageMissing from "./userImageMissing";

export default function UserCard({ user }: { user: User }) {

    return (
        <View className="flex flex-row items-center gap-4 m-1 p-3 border border-muted-foreground rounded-lg">
            {user.image
                ? <Image className="w-12 h-12 rounded-full" source={{ uri: user.image }} />
                : <UserImageMissing {...user} />
            }
            <Text className="text-lg">{user.first_name} {user.last_name}</Text>
        </View>
    )
}