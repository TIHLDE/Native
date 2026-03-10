import React, {useState, useRef, useEffect, type ReactNode} from 'react';
import {TextInput, View, Pressable, type TextInputProps} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    interpolateColor,
} from 'react-native-reanimated';
import {useColorScheme} from '@/lib/useColorScheme';

interface FloatingLabelInputProps extends Omit<TextInputProps, 'placeholder'> {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: ReactNode;
}

const DURATION = 200;

const FloatingLabelInput = React.forwardRef<TextInput, FloatingLabelInputProps>(
    ({label, value, onChangeText, icon, style, ...props}, ref) => {
        const {isDarkColorScheme} = useColorScheme();
        const [isFocused, setIsFocused] = useState(false);
        const inputRef = useRef<TextInput>(null);
        const progress = useSharedValue(value ? 1 : 0);

        const resolvedRef = (ref as React.RefObject<TextInput>) || inputRef;

        const hasIcon = !!icon;
        const labelLeft = hasIcon ? 48 : 16;
        const maskLeft = hasIcon ? 44 : 12;

        useEffect(() => {
            const isActive = isFocused || value.length > 0;
            progress.value = withTiming(isActive ? 1 : 0, {duration: DURATION});
        }, [isFocused, value]);

        const labelStyle = useAnimatedStyle(() => {
            const top = interpolate(progress.value, [0, 1], [17, -10]);
            const fontSize = interpolate(progress.value, [0, 1], [16, 12]);
            const color = interpolateColor(
                progress.value,
                [0, 1],
                isDarkColorScheme
                    ? ['#9ca3af', '#8ba3d4']
                    : ['#9ca3af', '#2d5dab']
            );

            return {
                top,
                fontSize,
                color,
            };
        });

        const maskStyle = useAnimatedStyle(() => {
            const opacity = interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]);
            return {opacity};
        });

        const borderStyle = useAnimatedStyle(() => {
            const borderColor = interpolateColor(
                progress.value,
                [0, 1],
                isDarkColorScheme
                    ? ['#6b7280', '#8ba3d4']
                    : ['#d1d5db', '#2d5dab']
            );

            return {borderColor};
        });

        const iconColor = isDarkColorScheme ? '#8ba3d4' : '#2d5dab';

        const bgColor = isDarkColorScheme ? '#1e1e2e' : '#ffffff';

        return (
            <Pressable onPress={() => resolvedRef.current?.focus()}>
                <Animated.View
                    style={[
                        {
                            borderWidth: 1.5,
                            borderRadius: 14,
                            paddingHorizontal: 16,
                            paddingTop: 18,
                            paddingBottom: 14,
                            flexDirection: 'row',
                            alignItems: 'center',
                        },
                        borderStyle,
                    ]}
                >
                    {/* Icon */}
                    {hasIcon && (
                        <View style={{marginRight: 12, width: 20, alignItems: 'center'}}>
                            {React.isValidElement(icon)
                                ? React.cloneElement(icon as React.ReactElement<any>, {
                                    size: 20,
                                    color: iconColor,
                                  })
                                : icon
                            }
                        </View>
                    )}

                    {/* Background mask */}
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                left: maskLeft,
                                top: -2,
                                height: 4,
                                paddingHorizontal: 4,
                                backgroundColor: bgColor,
                                zIndex: 1,
                            },
                            maskStyle,
                        ]}
                    >
                        <Animated.Text
                            style={{fontSize: 12, fontFamily: 'Inter', opacity: 0}}
                        >
                            {label}
                        </Animated.Text>
                    </Animated.View>

                    {/* Floating label */}
                    <Animated.Text
                        style={[
                            {
                                position: 'absolute',
                                left: labelLeft,
                                fontFamily: 'Inter',
                                zIndex: 2,
                            },
                            labelStyle,
                        ]}
                    >
                        {label}
                    </Animated.Text>

                    <TextInput
                        ref={resolvedRef}
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={[
                            {
                                flex: 1,
                                fontFamily: 'Inter',
                                fontSize: 16,
                                color: isDarkColorScheme ? '#ffffff' : '#111827',
                                padding: 0,
                            },
                            style,
                        ]}
                        {...props}
                    />
                </Animated.View>
            </Pressable>
        );
    }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';

export {FloatingLabelInput};
