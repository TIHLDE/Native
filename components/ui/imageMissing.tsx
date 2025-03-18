import { Image, View } from "react-native";

export default function ImageMissing() {
    return (
        <View className="w-full h-full flex justify-center items-center">
            <Image className="w-full h-full" source={require("@/assets/images/tihlde-default.png")} />
        </View>
    )
}