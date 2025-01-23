import React from "react";
import { useColorScheme } from "../useColorScheme";
import { BriefcaseBusiness } from "@/lib/icons/BriefcaseBusiness";
import { Calendar } from "@/lib/icons/Calendar";
import { CalendarClock } from "@/lib/icons/CalendarClock";
import { MapPin } from "@/lib/icons/MapPin";
import { MoonStar } from "@/lib/icons/MoonStar";
import { Sun } from "@/lib/icons/Sun";
import { UserRound } from "@/lib/icons/UserRound";
import { QrCode } from "@/lib/icons/QrCode";
import { Settings } from "@/lib/icons/Settings";
import { CircleCheck } from "@/lib/icons/CircleCheck";
import { TriangleAlert } from "@/lib/icons/TriangleAlert";
import { OctagonX } from "@/lib/icons/OctagonX";
import { Info } from "@/lib/icons/Info";
import { cn } from "../utils";


const icons = {
    BriefcaseBusiness: BriefcaseBusiness,
    Calendar: Calendar,
    CalendarClock: CalendarClock,
    MapPin: MapPin,
    MoonStar: MoonStar,
    Sun: Sun,
    UserRound: UserRound,
    QrCode: QrCode,
    Settings: Settings,
    CircleCheck: CircleCheck,
    TriangleAlert: TriangleAlert,
    OctagonX: OctagonX,
    Info: Info,
}

/**
 * Gets an icon and returns it with the correct stroke according to the theme
 * @param icon 
 */
export default function Icon({ icon, className }: { icon: keyof typeof icons, className?: string }): React.ReactNode {
    const Icon = icons[icon];

    // av en eller annen grunn fungerer ikke cn på color-*, så derfor gjør jeg dette
    const hasColorClass = className?.split(' ').some(cls => cls.startsWith('color-'));
    return React.createElement(Icon, { className: cn({ "color-foreground": !hasColorClass }, className) });
}   