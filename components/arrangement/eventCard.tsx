import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card } from "@/components/ui/card";

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
    organizer: string | null;
}) => {
    const formattedDate = date
        ? typeof date === "string"
            ? `${new Date(date).toLocaleDateString("no-NO", { year: "numeric", month: "long", day: "numeric" })} kl. ${new Date(date).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`
            : `${date.toLocaleDateString("no-NO", { year: "numeric", month: "long", day: "numeric" })} kl. ${date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`
        : "Dato";

    const borderColor =
        organizer === "Sosialen"
            ? "border-orange-500"
            : organizer === "Næringsliv og Kurs"
                ? "border-sky-500"
                : "border-gray-300";

    return (
        <Card className={`w-full h-fit border-2 rounded-lg mb-4 overflow-hidden ${borderColor}`}>
            <TouchableOpacity onPress={onPress}>
                {image ? (
                    <Image
                        source={{ uri: image }}
                        className="w-full h-48"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full bg-gray-300 flex justify-center items-center h-48">
                        <Text className="text-gray-600">Bilde mangler</Text>
                    </View>
                )}
                <View className="p-4">
                    <Text className="text-lg font-bold text-white mb-2">{title || "Tittel"}</Text>
                    <Text className="text-md font-light text-white">{formattedDate}</Text>
                </View>
            </TouchableOpacity>
        </Card>
    );
};

export default EventCard;
