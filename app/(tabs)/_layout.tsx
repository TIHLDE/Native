import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native'; 
import Icon from "@/lib/icons/Icon"; 
import { QrCode } from '@/lib/icons/QrCode';

const screenWidth = Dimensions.get('window').width;

export default function TabsLayout() {
    const pathname = usePathname();
    const router = useRouter();
    const colorScheme = useColorScheme();


    return (
        <Tabs>
            <TabSlot />
            <TabList style={styles.tabBar}>
    
                <TabTrigger name="karriere" href="/karriere" style={styles.tabButton}>
                    <Icon
                        icon="BriefcaseBusiness"
                        className={`self-center stroke-1 text-gray-400 dark:text-gray-300 ${
                            pathname === "/karriere" ? "text-black dark:text-white" : ""
                        }`}
                    />
                    <Text className={`text-xs text-black dark:text-gray-300 ${
                        pathname === "/karriere" ? "text-black dark:text-white font-bold border-b-2 border-black dark:border-white pb-1" : ""
                    }`}>
                        Karriere
                    </Text>
                </TabTrigger>

                <View style={[styles.middleButtonContainer, { left: screenWidth / 2 - 35 }]}>
                <TouchableOpacity 
                        className="absolute mb-1 left-1/2 -translate-x-1/2 bg-primary dark:bg-secondary w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                        onPress={() => router.push('/qrmodal')}
                    >
                        <QrCode color="white" size={30} />
                    </TouchableOpacity>
                </View>


                <TabTrigger name="arrangementer" href="/arrangementer" style={styles.tabButton}>
                    <Icon
                        icon="Calendar"
                        className={`self-center stroke-1 text-black dark:text-gray-300 ${
                            pathname === "/arrangementer" ? "text-black dark:text-white" : ""
                        }`}
                    />
                    <Text className={`text-xs text-black dark:text-white ${
                        pathname === "/arrangementer" ? "text-black dark:text-white font-bold border-b-2 border-black dark:border-white pb-1" : ""
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
        paddingTop: 5,
        height: 80,
        paddingHorizontal: 40,
    },
    middleButtonContainer: {
        position: 'absolute',
        bottom: 30,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    middleButton: {
        width: 80,
        height: 80,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});
