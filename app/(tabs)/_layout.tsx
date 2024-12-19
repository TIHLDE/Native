import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="index" options={{ title: "Arrangementer" }} />
            <Tabs.Screen name="karriere" options={{ title: "Karrere" }} />
            <Tabs.Screen name="profil" options={{ title: "Profil" }} />
        </Tabs>
    )
}