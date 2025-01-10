import { Image, View } from "react-native";
import { Text } from "../ui/text";
import { Card } from "../ui/card";
import { BriefcaseBusiness } from "lib/icons/BriefcaseBusiness";
import { CalendarClock } from "@/lib/icons/CalendarClock";
import { MapPin } from "@/lib/icons/MapPin";
import { Calendar } from "@/lib/icons/Calendar";
import useIcon from "@/lib/icons/Icon";
import Icon from "@/lib/icons/Icon";

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
        <Card className="w-full h-fit border rounded-lg p-2 ">
            <Image className="w-full h-40 rounded-md" source={{ uri: props.image }} />
            <View className="flex flex-col gap-2 text-3xl">
                <Text className="text-2xl">{props.title}</Text>
                <View className="flex flex-row gap-2">
                    <Icon icon="BriefcaseBusiness" className="self-center" />
                    <Text className="text-2xl font-light">{JOBTYPES[props.jobType]}</Text>
                </View>
                <View className="flex flex-row gap-2">
                    <Icon icon="MapPin" className="self-center" />
                    <Text className="text-2xl font-light">{props.location}</Text>
                </View>
                <View className="flex flex-row gap-2">
                    <Icon icon="CalendarClock" className="self-center" />
                    <Text className="text-2xl font-light">{new Date(props.deadline).toLocaleDateString()}</Text>
                </View>
            </View>
        </Card>
    )

}