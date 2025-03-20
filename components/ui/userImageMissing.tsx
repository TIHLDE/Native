import { User } from "@/actions/types";
import { View } from "react-native";
import { Text } from "./text";

export default function UserImageMissing(user: User) {
    return (
        <View className="flex flex-row items-center justify-center w-12 h-12 rounded-full bg-muted">
            <Text>{user.first_name[0]}{user.last_name[0]}</Text>
        </View>
    )
}