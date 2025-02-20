import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

const EventCard = ({
  id,
  title,
  date,
  image,
  onPress,
}: {
  id: string;
  title: string | null;
  date: Date | string | null;
  image: string | null;
  onPress: () => void;
}) => {
  const formattedDate = date
    ? typeof date === "string"
      ? new Date(date).toLocaleDateString("no-NO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : date.toLocaleDateString("no-NO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
    : "Dato";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#0D1B2A] rounded-lg overflow-hidden mb-4 shadow-md border border-gray-800 w-full"
    >
      {image ? (
        <Image
          source={{ uri: image }}
          className="aspect-[16/7] rounded-t-lg"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full bg-gray-300 h-40 flex justify-center items-center">
          <Text className="text-gray-600">Bilde mangler</Text>
        </View>
      )}
      <View className="p-4">
        <Text className="text-lg font-bold text-white mb-2">
          {title || "Tittel"}
        </Text>
        <Text className="text-md font-light text-white">{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;
