import React from "react";
import { View } from "react-native";
import { Gavel } from "lucide-react-native";
import { useRouter } from "expo-router";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export default function FinesHeaderButton() {
    const router = useRouter();

    return (
        <TouchableWithoutFeedback onPressIn={() => router.push("/(modals)/boter")}>
            <View className="w-10 h-10 items-center justify-center">
                <Gavel size={22} className="stroke-2 text-foreground" />
            </View>
        </TouchableWithoutFeedback>
    );
}
