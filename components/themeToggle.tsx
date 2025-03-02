import { Pressable, View, Animated, Easing } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { MoonStar } from '~/lib/icons/MoonStar';
import { Sun } from '~/lib/icons/Sun';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';
import { useRef } from 'react';

export function ThemeToggle({ className }: { className?: string }) {
    const { isDarkColorScheme, setColorScheme } = useColorScheme();
    const spinAnim = useRef(new Animated.Value(0)).current;

    function toggleColorScheme() {
        Animated.timing(spinAnim, {
            toValue: 1,
            duration: 400, 
            easing: Easing.ease,
            useNativeDriver: true,
        }).start(() => {
            spinAnim.setValue(0); 
        });

        const newTheme = isDarkColorScheme ? 'light' : 'dark';
        setColorScheme(newTheme);
        setAndroidNavigationBar(newTheme);
    }

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Pressable onPress={toggleColorScheme}>
            {({ pressed }) => (
                <Animated.View
                    style={{ transform: [{ rotate: spin }] }} 
                    className={cn(
                        'flex-1 aspect-square pt-0.5 justify-center web:px-5',
                        pressed && 'opacity-70'
                    )}
                >
                    {isDarkColorScheme ? (
                        <Sun className='text-foreground self-center' size={24} strokeWidth={1.25} />
                    ) : (
                        <MoonStar className='text-foreground self-center' size={23} strokeWidth={1.25} />
                    )}
                </Animated.View>
            )}
        </Pressable>
    );
}
