import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text"

const EventCard = ({
    id,
    title,
    date,
    image,
    onPress,
    organizer,
}: {
    id: string;
    title: string | null;
    date: Date | string | null;
    image: string | null;
    onPress: () => void;
    organizer: {
        name: string;
        slug: string | null
    };
}) => {
    const formattedDate = date
        ? typeof date === "string"
            ? `${new Date(date).toLocaleDateString("no-NO", { year: "numeric", month: "long", day: "numeric" })} kl. ${new Date(date).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`
            : `${date.toLocaleDateString("no-NO", { year: "numeric", month: "long", day: "numeric" })} kl. ${date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`
        : "Dato";


    const borderColor =
        organizer?.slug?.toLowerCase() === "sosialen"
            ? "border-orange-500"
            : organizer?.slug?.toLowerCase() === "nok"
                ? "border-blue-400"
                : ["jentekom", "hs", "kok"].includes(organizer?.slug?.toLowerCase() || "")
                    ? "border-orange-400"
                    : organizer?.slug?.toLowerCase() === "plask"
                        ? "border-purple-300"
                        : "border-gray-300";

    return (
        <View className={`w-full rounded-lg mb-4 overflow-hidden border-2 ${borderColor}`}>
            <Card className="w-full h-fit rounded-lg overflow-hidden">
                <TouchableOpacity onPress={onPress} className="p-0 m-0">
                    <View className="w-full aspect-[16/7] overflow-hidden">
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                className="w-full h-full m-0 p-0"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-full bg-gray-300 flex justify-center items-center">
                                <Text className="text-gray-600">Bilde mangler</Text>
                            </View>
                        )}
                    </View>
                    <View className="px-2 pb-4">
                        <Text className="text-2xl my-2 font-semibold">{title || "Tittel"}</Text>
                        <View className="flex flex-row items-center justify-between">
                            <Text className="text-md font-light">{formattedDate}</Text>
                            <View
                                className={`px-3 rounded-3xl border-2 ${borderColor}`}
                                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            >
                                <Text className="text-white">{organizer?.name}</Text>
                            </View>
                        </View>
                    </View>

                </TouchableOpacity>
            </Card>
        </View>


    );
};

const EventCardSkeleton = () => {
    return (
        <View className={`w-full rounded-lg mb-4 overflow-hidden border-2 border-gray-300`}>
            <Card className="w-full h-fit rounded-lg overflow-hidden">
                <View className="w-full aspect-[16/7] overflow-hidden">
                    <View className="w-full h-full bg-gray-300 animate-pulse flex justify-center items-center">
                    </View>
                </View>
                <View className="p-4">
                    <View className="text-lg w-40 h-2 font-bold bg-foreground opacity-25 mb-2 rounded-md animate-pulse"></View>
                    <View className="flex flex-row items-center justify-between">
                        <View className="w-28 h-2 bg-foreground opacity-25 rounded-md animate-pulse"></View>
                        <View
                            className={`px-3 rounded-3xl border-2 animate-pulse `}
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                        >
                            <View className="bg-background opacity-75 w-20 h-2 m-1 rounded-md"></View>
                        </View>
                    </View>
                </View>
            </Card>
        </View>
    );
}

export { EventCardSkeleton };
export default EventCard;
