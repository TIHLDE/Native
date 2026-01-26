import { Platform } from 'react-native';

/**
 * Creates header options with iOS 26 Liquid Glass effect using Expo Router's native capabilities
 * Uses systemMaterial which automatically uses Liquid Glass on iOS 26 when compiled with iOS 26 SDK
 * Liquid Glass provides dynamic refraction, depth layering, and GPU-level blur pipeline
 * @param additionalOptions - Additional header options to merge
 * @returns Header options object with Liquid Glass styling
 */
export function getGlassMorphismHeaderOptions(
    additionalOptions: Record<string, any> = {}
) {
    return {
        // Expo Router native Liquid Glass options
        // systemMaterial automatically uses iOS 26 Liquid Glass when compiled with iOS 26 SDK
        // This provides the native SwiftUI liquid glass effect with dynamic blur and refraction
        headerTransparent: true,
        headerBlurEffect: Platform.OS === 'ios' ? ('systemMaterial' as const) : undefined,
        headerShadowVisible: false,
        ...additionalOptions,
    };
}
