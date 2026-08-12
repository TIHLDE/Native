import { Stack } from "expo-router";

export default function ArrangementerLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    title: "Arrangementer",
                    headerTitleAlign: "center",
                }}
            />
        </Stack>
    );
}
