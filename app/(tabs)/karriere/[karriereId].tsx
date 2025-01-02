
import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function Karriereside() {
    const params = useLocalSearchParams();
    const id = params.karriereId;

    return (
        <>
            <Stack.Screen options={{ title: "Id " + id /* Sette dette til navn på annonsen? */ }} />
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-2xl">Karriereside</Text>
            </View>
        </>
    );
}
