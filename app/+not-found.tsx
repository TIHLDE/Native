import { Link, Stack } from "expo-router";
import { View } from "react-native";

export default function NotFound() {
    return (
        <>
            <Stack.Screen options={{ title: "This page does not exist" }} />
            <View>
                <Link href="/">Go home</Link>
            </View>
        </>
    )
}