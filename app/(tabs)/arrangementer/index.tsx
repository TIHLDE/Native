import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { View } from "react-native";

export default function Karriere() {
    return (
        <View className="ml-auto mr-auto p-10 shadow-lg rounded-lg mt-10">
            <Text className="text-2xl text-center">Arrangementer</Text>
            <Button variant="default" onPress={() => router.push("/arrangementer/1")} className="mt-20">
                <Text> Gå til arrangement 1 </Text>
            </Button>
        </View>
    );
}
