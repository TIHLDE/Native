import React from "react";
import { View } from "react-native";
import { Text } from "./text";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    className?: string;
}

const SectionHeader = React.forwardRef<View, SectionHeaderProps>(
    ({ title, className }, ref) => {
        return (
            <View ref={ref} className={cn("flex-row items-center mb-3", className)}>
                <View className="w-1 h-5 rounded-full bg-primary dark:bg-accent mr-2.5" />
                <Text className="text-lg font-semibold text-foreground">
                    {title}
                </Text>
            </View>
        );
    }
);

SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
