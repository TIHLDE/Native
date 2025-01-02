import { ThemeToggle } from "@/components/themeToggle";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function Profil() {
    return (
        <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
            <Text className="text-2xl text-center">Profil</Text>
            <View className="flex flex-col justify-center mt-5">
                <ThemeToggle />
            </View>
        </View>
    );
}