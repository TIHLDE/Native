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
        <View className="w-full h-fit border border-gray-300 dark:border-gray-800 shadow-sm rounded-lg bg-card dark:bg-[#020817]">
            <View className="relative">
                <View className="absolute left-0.5 top-0.5 bg-gray-900 px-3 py-1 rounded-lg z-50">
                    <Text className="text-center text-sm text-white">
                        {new Date(props.deadline).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })} {new Date(props.deadline).getFullYear()}
                    </Text>
                </View>
                <Image className="aspect-[16/7] object-cover rounded-t-lg" source={{ uri: props.image }} />
            </View>
            <View className="w-full h-[1px] bg-gray-300 dark:bg-gray-950" />
            <View className="flex flex-col gap-2 px-2 pb-4">
                <Text className="text-2xl mt-2 mb-2 font-semibold">{props.title}</Text>
                <View className="flex flex-row gap-2 ml-2 items-center">
                    <Icon icon="BriefcaseBusiness" className="self-center stroke-1 dark:text-white" />
                    <Text className="">{JOBTYPES[props.jobType]}</Text>
                </View>
                <View className="flex flex-row gap-2 ml-2 items-center">
                    <Icon icon="MapPin" className="self-center stroke-1 dark:text-white" />
                    <Text className="">{props.location}</Text>
                </View>
                <View className="flex flex-row gap-2 ml-2 items-center">
                    <Icon icon="CalendarClock" className="self-center stroke-1 dark:text-white" />
                    <Text className="">{timeformat(new Date(props.deadline))}</Text>
                </View>
            </View>
        </View>
    )
}

export function JobPostCardSkeleton() {
    return (
        <View className="w-full h-fit border border-gray-300 dark:border-gray-800 shadow-sm rounded-lg bg-card dark:bg-[#020817]">
            <View className="relative">
                <View className="absolute left-0.5 top-0.5 bg-gray-900 px-3 py-1 rounded-lg z-50">
                    <View className="m-1 h-2 w-16 bg-background rounded-md animate-pulse"></View>
                </View>
                <View className="animate-pulse bg-gray-300 aspect-[16/7] h-40 rounded-t-lg" />
            </View>
            <View className="w-full h-[1px] bg-gray-300 dark:bg-gray-950" />
            <View className="flex flex-col gap-2 px-2 pb-4">
                <View className="h-5 w-44 rounded-md bg-foreground opacity-25 mt-2 mb-2 animate-pulse"></View>
                <View className="flex flex-row gap-2 ml-2">
                    <Icon icon="BriefcaseBusiness" className="self-center stroke-1 dark:text-white" />
                    <View className="h-2 w-24 bg-foreground opacity-25 animate-pulse rounded-sm self-center"></View>
                </View>
                <View className="flex flex-row gap-2 ml-2">
                    <Icon icon="MapPin" className="self-center stroke-1 dark:text-white" />
                    <View className="h-2 w-20 bg-foreground opacity-25 animate-pulse rounded-sm self-center"></View>
                </View>
                <View className="flex flex-row gap-2 ml-2">
                    <Icon icon="CalendarClock" className="self-center stroke-1 dark:text-white" />
                    <View className="h-2 w-28 bg-foreground opacity-25 animate-pulse rounded-sm self-center"></View>
                </View>
            </View>
        </View>
    )
}