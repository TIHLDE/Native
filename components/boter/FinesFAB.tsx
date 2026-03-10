import React from "react";
import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function FinesFAB() {
    const router = useRouter();

    return (
        <Pressable
            onPress={() => router.push("/(modals)/boter")}
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary dark:bg-[#1C5ECA] items-center justify-center active:opacity-80"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
            }}
        >
            <Plus size={24} color="white" />
        </Pressable>
    );
}
