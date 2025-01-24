import { Image, View } from "react-native";
import { Text } from "../ui/text";
import Icon from "@/lib/icons/Icon";
import timeformat from "@/lib/timeformat";

export interface JobPostProps {
    title: string;
    location: string;
    deadline: string;
    jobType: keyof typeof JOBTYPES;
    image: string;
}

export const JOBTYPES = {
    FULL_TIME: "Heltid",
    PART_TIME: "Deltid",
    SUMMER_JOB: "Sommerjobb",
    OTHER: "Annet"
}

export default function JobPostCard(props: JobPostProps) {
    return (
        <View className="w-full h-fit border border-gray-800 shadow-lg rounded-lg bg-card">
            <View className="relative">
                <View className="absolute left-0.5 top-0.5 bg-gray-900 px-3 py-1 rounded-lg z-50">
                    <Text className="text-center text-sm">
                        {new Date(props.deadline).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })}
                    </Text>
                    <Text className="text-center text-xs">
                        {new Date(props.deadline).getFullYear()}
                    </Text>
                </View>
                <Image className="aspect-[16/7] object-cover rounded-t-lg" source={{ uri: props.image }} />
            </View>
            <View className="flex flex-col gap-2 px-2 pb-4">
                <Text className="text-2xl mt-2 mb-2 font-medium">{props.title}</Text>
                <View className="flex flex-row gap-2 ml-2">
                    <Icon icon="BriefcaseBusiness" className="self-center stroke-1" />
                    <Text className="text-lg ">{JOBTYPES[props.jobType]}</Text>
                </View>
                <View className="flex flex-row gap-2 ml-2">
                    <Icon icon="MapPin" className="self-center stroke-1" />
                    <Text className="text-lg ">{props.location}</Text>
                </View>
                <View className="flex flex-row gap-2 ml-2">
                    <Icon icon="CalendarClock" className="self-center stroke-1" />
                    <Text className="text-lg ">{timeformat(new Date(props.deadline))}</Text>
                </View>
            </View>
        </View>
    )

}