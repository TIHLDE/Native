import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import Icon from "@/lib/icons/Icon";
import { QrCode } from '@/lib/icons/QrCode';
import { Text } from '@/components/ui/text';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/lib/useColorScheme';

const screenWidth = Dimensions.get('window').width;

export default function TabsLayout() {
    const pathname = usePathname();
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();

    return (
        <Tabs>
            <TabSlot />
            <TabList style={styles.tabBar}>
                <BlurView
                    intensity={80}
                    tint={isDarkColorScheme ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.topBorder} className="bg-border/50" />

                <TabTrigger name="karriere" href="/karriere" reset="never" style={styles.tabButton}>
                    <Icon
                        icon="BriefcaseBusiness"
                        className={`self-center stroke-2
                            ${pathname.includes("/karriere") ? "color-primary  dark:color-accent" : "color-gray-500 dark:color-gray-300"}`}
                    />
                    <Text className={`text-xs
                        ${pathname.includes("/karriere") ? "color-primary  dark:color-accent" : "color-gray-500 dark:color-gray-300"
                        }`}>
                        Karriere
                    </Text>
                </TabTrigger>

                <View style={[styles.middleButtonContainer, { left: screenWidth / 2 - 35 }]}>
                    <TouchableWithoutFeedback onPress={() => router.push('/(modals)/qrmodal')}>
                        <View className="mb-1 bg-primary dark:bg-accent w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
                            <QrCode className="color-white dark:color-background" size={32} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                <TabTrigger name="arrangementer" href="/arrangementer" reset="never" style={styles.tabButton}>
                    <Icon
                        icon="Calendar"
                        className={`self-center stroke-2
                            ${pathname.includes("/arrangementer") ? "color-primary dark:color-accent" : "color-gray-500 dark:color-gray-300"}`}
                    />
                    <Text className={`text-xs
                        ${pathname.includes("/arrangementer") ? "color-primary  dark:color-accent" : "color-gray-500 dark:color-gray-300"
                        }`}>
                        Arrangementer
                    </Text>
                </TabTrigger>
            </TabList>
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
        paddingTop: 5,
        height: 80,
        paddingHorizontal: 40,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
    },
    middleButtonContainer: {
        position: 'absolute',
        bottom: 30,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButton: {
        width: 80,
        height: 80,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
