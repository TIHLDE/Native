
import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Text } from './text';


interface AnimatedPagerViewProps {
    children: React.ReactNode;
    titles: string[];
    className?: string;
    onPageChange?: (index: number) => void;
}

export default function AnimatedPagerView(props: AnimatedPagerViewProps) {
    const pagerViewRef = useRef<PagerView>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View className={props.className}>
            {/* Tab bar */}
            <View className="mx-4 mb-4 flex-row bg-gray-100 dark:bg-secondary/30 rounded-2xl p-1">
                {props.titles.map((title, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <Pressable
                            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${isActive ? 'bg-primary dark:bg-[#1C5ECA]' : ''}`}
                            key={index}
                            onPress={() => requestAnimationFrame(() => pagerViewRef.current?.setPage(index))}
                        >
                            <Text
                                className={`text-base font-semibold ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                                style={{ fontFamily: "Inter" }}
                            >
                                {title}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
            <PagerView style={{ flex: 1 }}
                orientation="horizontal"
                ref={pagerViewRef}
                overdrag={true}
                onPageSelected={(e) => {
                    setActiveIndex(e.nativeEvent.position);
                    props.onPageChange?.(e.nativeEvent.position);
                }}
            >
                {props.children}
            </PagerView>
        </View>
    );
}
