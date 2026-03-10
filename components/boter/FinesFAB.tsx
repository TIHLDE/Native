import React from "react";
import { View } from "react-native";
import { Gavel } from "lucide-react-native";
import { useRouter } from "expo-router";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useColorScheme } from "@/lib/useColorScheme";

export default function FinesHeaderButton() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();

    return (
        <TouchableWithoutFeedback onPressIn={() => router.push("/(modals)/boter")}>
            <View className="w-10 h-10 items-center justify-center">
                <Gavel size={22} strokeWidth={2} color={isDarkColorScheme ? "#ffffff" : "#000000"} />
            </View>
        </TouchableWithoutFeedback>
    );
}
