import TihldeLogo from '@/lib/icons/TihldeLogo';
import { Stack, Tabs } from 'expo-router';
import { Calendar } from '~/lib/icons/Calendar';
import { BriefcaseBusiness } from '~/lib/icons/BriefcaseBusiness';
import { UserRound } from '~/lib/icons/UserRound';

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name='index' options={{ tabBarItemStyle: { display: "none" } }} />
            <Tabs.Screen name="karriere" options={{
                title: "Karriere",
                tabBarIcon: ({ color }) => <BriefcaseBusiness color={color} />

            }} />
            <Tabs.Screen name="arrangementer" options={{
                title: "Arrangementer",
                tabBarIcon: ({ color }) => <Calendar color={color} />
            }} />
            <Tabs.Screen name="profil" options={{
                title: "Profil",
                tabBarIcon: ({ color }) => <UserRound color={color} />
            }} />
        </Tabs>
    )
}