import React from "react";
import { Pressable, View } from "react-native";
import { Gavel } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/lib/useColorScheme";

export default function FinesHeaderButton() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();

    return (
        <Pressable
            onPressIn={() => router.push("/(modals)/boter")}
            style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
        >
            {({ pressed }) => (
                <View style={{ opacity: pressed ? 0.7 : 1 }}>
                    <Gavel size={22} strokeWidth={2} color={isDarkColorScheme ? "#ffffff" : "#000000"} />
                </View>
            )}
        </Pressable>
    );
}
