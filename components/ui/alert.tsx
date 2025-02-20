import Icon from "@/lib/icons/Icon";
import { cn } from "@/lib/utils";
import { View } from "react-native";

interface AlertProps {
    type: "warning" | "error" | "success" | "info";
    className?: string;
    children?: React.ReactNode;
    icon?: React.ReactNode;
}

export default function Alert({ type = "warning", className, children, icon }: AlertProps) {

    const alertIconName: { [key in AlertProps['type']]: "TriangleAlert" | "OctagonX" | "CircleCheck" | "Info" } = {
        warning: "TriangleAlert",
        error: "OctagonX",
        success: "CircleCheck",
        info: "Info",
    };
    const alertClass = {
        warning: "bg-yellow-200 text-yellow-800",
        error: "bg-red-200 text-red-800",
        success: "bg-green-800 text-green-800",
        info: "bg-blue-200 text-blue-800",
    };

    return (
        <View className={cn("p-4 pl-6 rounded-lg flex flex-row items-center justify-center gap-4", alertClass[type], className)}>
            {icon ?? <Icon icon={alertIconName[type]} />}
            {/* is there a way to avoit using a flex-1 here and still prevent overflowing text? */}
            <View className="flex-1">
                {children}
            </View>
        </View>
    );
}