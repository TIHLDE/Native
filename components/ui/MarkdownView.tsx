import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";
import { StyleSheet, View } from "react-native";
import Markdown, { MarkdownIt, renderRules } from "react-native-markdown-display";
import { Text } from "./text";
import FitImage from 'react-native-fit-image';
import * as WebBrowser from 'expo-web-browser';

// Legge til ekstre regler for markdown her om det trengs.
const rules = {
    ...renderRules,
    html_inline: (node: any, children: any, parent: any, styles: any) => {
        return (
            <View style={styles.html_inline} key={node.key} className="p-2" >
                {children}
            </View>
        );
    },
    hr: (node: any, children: any, parent: any, styles: any) => {
        return (
            <View style={styles.hr} key={node.key} className="border-t border-foreground my-4" />
        );
    },
    text: (node: any, children: any, parent: any, styles: any, inheritedStyles = {}) => (
        <Text key={node.key} style={[inheritedStyles, styles.text]} className="leading-normal">
            {node.content}
        </Text>
    ),
    // Styling til blockquote burde egentlig ikke ligge her...
    blockquote: (node: any, children: any, parent: any, styles: any) => {
        return (
            <View key={node.key} className="border-l-4 color-foreground border-primary p-2 my-4">
                {children}
            </View>
        );
    },
    link: (node: any, children: any, parent: any, styles: any, onLinkPress: any) => (
        <Text
            key={node.key}
            style={styles.link}
            onPress={() => WebBrowser.openBrowserAsync(node.attributes.href)}>
            {children}
        </Text>
    ),

    // Default implementasjonen av image gjør {...props} med key,noe som react ikke liker. 
    // Alt dette er kopiert, men setter key på riktig måte.
    image: (
        node: any,
        children: any,
        parent: any,
        styles: any,
        allowedImageHandlers: any,
        defaultImageHandler: any,
    ) => {
        const { src, alt } = node.attributes;

        const show =
            allowedImageHandlers.filter((value: any) => {
                return src.toLowerCase().startsWith(value.toLowerCase());
            }).length > 0;

        if (show === false && defaultImageHandler === null) {
            return null;
        }

        const imageProps: any = {
            indicator: true,
            style: styles._VIEW_SAFE_image,
            source: {
                uri: show === true ? src : `${defaultImageHandler}${src}`,
            },
        };

        if (alt) {
            imageProps.accessible = true;
            imageProps.accessibilityLabel = alt;
        }

        return <FitImage {...imageProps} key={node.key} />;
    },
};

const markdownItInstance = new MarkdownIt({ typographer: true, html: true });

export default function MarkdownView({ content }: { content: string }) {
    const { isDarkColorScheme } = useColorScheme();

    return (

        // Burde egentlig ikke bruke NAV_THEME for å hente ut riktig farke, 
        // men får ikke css variabler til å fungere
        <Markdown rules={rules} markdownit={markdownItInstance} style={{
            paragraph: {
                marginTop: 0,
                marginBottom: 0,
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                width: '100%',
            },
            list_item: {
                color: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text,
            },
            Heading1: {
                fontSize: 32,
                fontWeight: 'bold',
            },
            heading2: {
                fontSize: 24,
                fontWeight: 'bold',
            },
            heading3: {
                fontSize: 20,
                fontWeight: "bold",
            },
            text: {
                fontSize: 18,
            },
            bullet_list_icon: {
                fontWeight: "900",
                fontSize: 22,
            }

        }}>
            {content}
        </Markdown>
    );
}