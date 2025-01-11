import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";

export default function MarkdownView({ content }: { content: string }) {
    const { isDarkColorScheme } = useColorScheme();

    return (

        // Burde egentlig ikke bruke NAV_THEME, men får ikke css variabler til
        // å fungere
        <Markdown style={{
            body: { color: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text },
        }}>
            {content}
        </Markdown>
    );
}