import { Image, View } from "react-native";
import { Text } from "../ui/text";
import { Card } from "../ui/card";
import { BriefcaseBusiness } from "lib/icons/BriefcaseBusiness";
import { CalendarClock } from "@/lib/icons/CalendarClock";
import { MapPin } from "@/lib/icons/MapPin";
import { Calendar } from "@/lib/icons/Calendar";
import useIcon from "@/lib/icons/Icon";
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
        <Card className="w-full h-fit p-2 border-none shadow-lg">
            <Image className="w-full h-40 rounded-md" source={{ uri: props.image }} />
            <View className="flex flex-col gap-2 text-3xl">
                <Text className="text-2xl mt-2 mb-2">{props.title}</Text>
                <View className="flex flex-row gap-2 ml-2">
                    <Icon icon="BriefcaseBusiness" className="self-center stroke-1 color-muted-foreground" />
                    <Text className="text-xl text-muted-foreground">{JOBTYPES[props.jobType]}</Text>
                </View>
                <View className="flex flex-row gap-2 ml-2">
                    <Icon icon="MapPin" className="self-center stroke-1 color-muted-foreground" />
                    <Text className="text-xl text-muted-foreground">{props.location}</Text>
                </View>
                <View className="flex flex-row gap-2 ml-2">
                    <Icon icon="CalendarClock" className="self-center stroke-1 color-muted-foreground" />
                    <Text className="text-xl text-muted-foreground">{timeformat(new Date(props.deadline))}</Text>
                </View>
            </View>
        </Card>
    )

}