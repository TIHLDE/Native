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
        warning: "bg-alert-warning",
        error: "bg-alert-error",
        success: "bg-alert-success",
        info: "bg-alert-info",
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