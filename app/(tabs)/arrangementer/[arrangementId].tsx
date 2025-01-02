
import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function ArrangementSide() {
    const params = useLocalSearchParams();
    const id = params.arrangementId;

    return (
        <>
            <Stack.Screen options={{ title: "Id " + id }} />
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-2xl">Arrangementside</Text>
            </View>
        </>
    );
}
