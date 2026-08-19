import { NativeTabs, Icon, Label, VectorIcon } from "expo-router/unstable-native-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

/**
 * Apples egen tab bar (Liquid Glass fra iOS 26). Systemet står for utseendet,
 * så her definerer vi bare rekkefølgen, ikonene og etikettene.
 *
 * «Bot» ligger i midten fordi det er hovedhandlingen i appen.
 */
export default function TabsLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="grupper">
        <Icon
          sf={{ default: "person.3", selected: "person.3.fill" }}
          androidSrc={{
            default: <VectorIcon family={MaterialCommunityIcons} name="account-group-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="account-group" />,
          }}
        />
        <Label>Grupper</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="karriere">
        <Icon
          sf={{ default: "briefcase", selected: "briefcase.fill" }}
          androidSrc={{
            default: <VectorIcon family={MaterialCommunityIcons} name="briefcase-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="briefcase" />,
          }}
        />
        <Label>Karriere</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bot">
        <Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
          androidSrc={{
            default: <VectorIcon family={MaterialCommunityIcons} name="plus-circle-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="plus-circle" />,
          }}
        />
        <Label>Bot</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="arrangementer">
        <Icon
          sf={{ default: "calendar", selected: "calendar" }}
          androidSrc={{
            default: <VectorIcon family={MaterialCommunityIcons} name="calendar-blank-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="calendar" />,
          }}
        />
        <Label>Events</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profil">
        <Icon
          sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
          androidSrc={{
            default: <VectorIcon family={MaterialCommunityIcons} name="account-circle-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="account-circle" />,
          }}
        />
        <Label>Profil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
