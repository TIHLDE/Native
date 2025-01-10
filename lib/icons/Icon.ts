import React from "react";
import { useColorScheme } from "../useColorScheme";
import { BriefcaseBusiness } from "@/lib/icons/BriefcaseBusiness";
import { Calendar } from "@/lib/icons/Calendar";
import { CalendarClock } from "@/lib/icons/CalendarClock";
import { MapPin } from "@/lib/icons/MapPin";
import { MoonStar } from "@/lib/icons/MoonStar";
import { Sun } from "@/lib/icons/Sun";
import { UserRound } from "@/lib/icons/UserRound";


const icons = {
    BriefcaseBusiness: BriefcaseBusiness,
    Calendar: Calendar,
    CalendarClock: CalendarClock,
    MapPin: MapPin,
    MoonStar: MoonStar,
    Sun: Sun,
    UserRound: UserRound
}

/**
 * Gets an icon and returns it with the correct stroke according to the theme
 * @param icon 
 */
export default function Icon({ icon, className }: { icon: keyof typeof icons, className?: string }): React.ReactNode {
    const { isDarkColorScheme } = useColorScheme();
    const Icon = icons[icon];
    return React.createElement(Icon, { stroke: isDarkColorScheme ? "white" : "black", className: className });
}