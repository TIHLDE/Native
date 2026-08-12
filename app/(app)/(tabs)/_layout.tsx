import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

/**
 * Apples egen tab bar (Liquid Glass fra iOS 26). Systemet står for utseendet,
 * så her definerer vi bare rekkefølgen, ikonene og etikettene.
 *
 * «Bot» ligger i midten fordi det er hovedhandlingen i appen.
 */
export default function TabsLayout() {
    return (
        <NativeTabs minimizeBehavior="onScrollDown">
            <NativeTabs.Trigger name="utlegg">
                <Icon sf={{ default: "receipt", selected: "receipt.fill" }} />
                <Label>Utlegg</Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="karriere">
                <Icon sf={{ default: "briefcase", selected: "briefcase.fill" }} />
                <Label>Karriere</Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="bot">
                <Icon sf={{ default: "plus.circle", selected: "plus.circle.fill" }} />
                <Label>Bot</Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="arrangementer">
                <Icon sf={{ default: "calendar", selected: "calendar" }} />
                <Label>Events</Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="profil">
                <Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} />
                <Label>Profil</Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
