import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect, G, Mask, Path, Defs, ClipPath } from "react-native-svg";


export default function Arrangementer() {
    const { authState } = useAuth();

    const [showLoading, setShowLoading] = useState<boolean>(true);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (!authState?.isLoading) {
            // Set a timer to hide the loading screen after 2 seconds
            timer = setTimeout(() => {
                setShowLoading(false);
            }, 2000);
        }

        // Cleanup the timer on unmount or if authState.isLoading changes
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [authState?.isLoading]);

    if (true) {
        return (
            <SafeAreaProvider>
                <SafeAreaView
                    className="flex-1 justify-center items-center bg-blue-950"
                >
                    <SplashLogo />
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    if (!authState?.auhtenticated) {
        return <Redirect href={"/login"} />;
    };

    return (
        <Redirect href={"/arrangementer"} />
    )
}


function SplashLogo() {
    return (
        <Svg
            width={393}
            height={852}
            viewBox="0 0 393 852"
            fill="none">
            <Rect width={393} height={852} fill="#001329" />
            <G clipPath="url(#clip0_167_297)">
                <Mask
                    id="mask0_167_297"
                    style={{
                        maskType: "luminance",
                    }}
                    maskUnits="userSpaceOnUse"
                    x={-15}
                    y={275}
                    width={434}
                    height={227}
                >
                    <Path
                        d="M-14.1113 275.533H418.244V501.844H-14.1113V275.533Z"
                        fill="white"
                    />
                </Mask>
                <G mask="url(#mask0_167_297)">
                    <Path
                        d="M101.019 406.309C100.236 406.478 99.5061 406.786 98.8531 407.208L89.7227 398.078L78.0419 386.397L98.8531 365.586C99.5061 366.008 100.236 366.316 101.019 366.485V406.309ZM95.8928 411.434H56.0756C55.9031 410.652 55.595 409.922 55.173 409.266L75.9842 388.455L85.1238 397.594L96.7956 409.266C96.3734 409.922 96.0653 410.652 95.8928 411.434ZM53.1153 407.208C52.4591 406.786 51.7293 406.478 50.9467 406.305V366.488C51.7293 366.316 52.4591 366.008 53.1153 365.586L73.9264 386.397L53.1153 407.208ZM56.0756 361.359H95.8928C96.0653 362.142 96.3734 362.872 96.7956 363.528L75.9842 384.339L55.173 363.528C55.595 362.872 55.9031 362.142 56.0756 361.359ZM103.93 406.305V366.488C106.952 365.823 109.216 363.128 109.216 359.905C109.216 356.184 106.197 353.166 102.476 353.166C99.2537 353.166 96.5582 355.43 95.8928 358.452H56.0756C55.4101 355.43 52.7149 353.166 49.4929 353.166C45.7718 353.166 42.7529 356.184 42.7529 359.905C42.7529 363.128 45.0138 365.82 48.0358 366.485V406.309C45.0138 406.974 42.7529 409.666 42.7529 412.888C42.7529 416.609 45.7718 419.628 49.4929 419.628C52.7149 419.628 55.4101 417.364 56.0756 414.342H95.8928C96.5582 417.364 99.2537 419.628 102.476 419.628C106.197 419.628 109.216 416.609 109.216 412.888C109.216 409.666 106.952 406.971 103.93 406.305Z"
                        fill="white"
                    />
                    <Path
                        d="M124.935 383.301C124.935 383.301 117.647 393.094 103.93 396.799C102.99 397.055 102.02 397.28 101.019 397.471C98.2679 398.001 95.2891 398.275 92.0917 398.186C91.334 398.164 90.5454 398.13 89.7228 398.078C88.2814 397.985 86.7472 397.837 85.1238 397.594C80.959 396.972 76.2276 395.746 71.0957 393.343C70.3872 393.014 69.6725 392.659 68.9485 392.284C68.7483 392.179 68.5482 392.077 68.348 391.975C64.1125 389.807 59.7045 388.073 50.9468 387.614C50.0258 387.567 49.0586 387.533 48.0358 387.512C47.5244 387.503 46.9977 387.5 46.4555 387.497C41.5978 387.478 27.0337 390.106 27.0337 390.106C27.0337 390.106 34.3218 380.316 48.0358 376.607C48.9753 376.355 49.9456 376.127 50.9468 375.939C53.7008 375.406 56.6795 375.132 59.8799 375.221C60.838 375.249 61.8453 375.295 62.905 375.375C64.3712 375.486 65.9299 375.659 67.5747 375.93C71.447 376.564 75.784 377.732 80.4571 379.866C81.3011 380.255 82.1574 380.67 83.0231 381.123C83.0877 381.157 83.1523 381.191 83.2172 381.222C87.5822 383.489 91.9839 385.319 101.019 385.793C101.94 385.842 102.907 385.876 103.93 385.898C104.444 385.904 104.974 385.91 105.516 385.913C110.371 385.929 124.935 383.301 124.935 383.301Z"
                        fill="white"
                    />
                    <Path
                        d="M145.361 370.004H134.065V358.669H170.815V370.004H159.519V414.386H145.361V370.004Z"
                        fill="white"
                    />
                    <Path
                        d="M175.257 358.669H189.414V414.386H175.257V358.669Z"
                        fill="white"
                    />
                    <Path
                        d="M222.624 391.716H211.63V414.386H197.472V358.669H211.63V380.062H222.624V358.669H236.782V414.386H222.624V391.716Z"
                        fill="white"
                    />
                    <Path
                        d="M244.839 358.669H258.996V403.051H276.317V414.386H244.839V358.669Z"
                        fill="white"
                    />
                    <Path
                        d="M295.218 403.69H298.306C302.373 403.69 305.422 402.227 307.456 399.299C309.489 396.373 310.506 392.195 310.506 386.767C310.506 383.202 310.129 380.301 309.376 378.066C308.623 375.831 307.607 374.102 306.326 372.878C305.046 371.654 303.54 370.816 301.808 370.363C300.076 369.912 298.255 369.684 296.348 369.684H295.218V403.69ZM281.061 358.669H301.318C305.184 358.669 308.61 359.321 311.597 360.624C314.584 361.929 317.107 363.791 319.166 366.212C321.224 368.634 322.781 371.534 323.835 374.913C324.889 378.293 325.416 382.058 325.416 386.208C325.416 391.051 324.826 395.242 323.646 398.78C322.466 402.32 320.759 405.246 318.526 407.561C316.291 409.876 313.542 411.593 310.28 412.71C307.016 413.828 303.301 414.386 299.134 414.386H281.061V358.669Z"
                        fill="white"
                    />
                    <Path
                        d="M331.215 358.669H363.446V369.684H345.071V380.381H362.542V391.397H345.071V403.37H364.425V414.386H331.215V358.669Z"
                        fill="white"
                    />
                </G>
            </G>
            <Path
                d="M215.535 446V428.961H217.574V446H215.535ZM224.078 446.234C223.281 446.234 222.574 446.082 221.957 445.777C221.34 445.473 220.859 445.043 220.516 444.488C220.172 443.926 220 443.277 220 442.543V442.52C220 441.809 220.172 441.199 220.516 440.691C220.867 440.176 221.375 439.77 222.039 439.473C222.711 439.176 223.516 439 224.453 438.945L228.988 438.676V440.27L224.688 440.539C223.852 440.586 223.207 440.781 222.754 441.125C222.309 441.469 222.086 441.93 222.086 442.508V442.531C222.086 443.125 222.309 443.598 222.754 443.949C223.207 444.293 223.801 444.465 224.535 444.465C225.184 444.465 225.766 444.328 226.281 444.055C226.797 443.781 227.207 443.41 227.512 442.941C227.816 442.473 227.969 441.945 227.969 441.359V437.691C227.969 436.949 227.734 436.367 227.266 435.945C226.797 435.516 226.129 435.301 225.262 435.301C224.488 435.301 223.859 435.465 223.375 435.793C222.898 436.121 222.598 436.555 222.473 437.094L222.449 437.188H220.469L220.48 437.07C220.551 436.398 220.785 435.793 221.184 435.254C221.59 434.715 222.141 434.289 222.836 433.977C223.531 433.656 224.352 433.496 225.297 433.496C226.273 433.496 227.109 433.664 227.805 434C228.508 434.328 229.051 434.793 229.434 435.395C229.816 435.996 230.008 436.711 230.008 437.539V446H227.969V444.043H227.898C227.656 444.488 227.34 444.875 226.949 445.203C226.559 445.531 226.121 445.785 225.637 445.965C225.152 446.145 224.633 446.234 224.078 446.234ZM237.988 450.359C236.98 450.359 236.102 450.215 235.352 449.926C234.609 449.645 234.008 449.254 233.547 448.754C233.094 448.262 232.805 447.707 232.68 447.09L232.656 447.008H234.719L234.766 447.09C234.945 447.535 235.312 447.891 235.867 448.156C236.422 448.422 237.121 448.555 237.965 448.555C239.043 448.555 239.879 448.281 240.473 447.734C241.074 447.195 241.375 446.453 241.375 445.508V443.773H241.305C241.055 444.227 240.734 444.617 240.344 444.945C239.961 445.273 239.52 445.527 239.02 445.707C238.527 445.887 237.988 445.977 237.402 445.977C236.371 445.977 235.465 445.719 234.684 445.203C233.902 444.68 233.293 443.949 232.855 443.012C232.426 442.074 232.211 440.98 232.211 439.73V439.719C232.211 438.469 232.43 437.379 232.867 436.449C233.312 435.52 233.926 434.797 234.707 434.281C235.496 433.758 236.41 433.496 237.449 433.496C238.035 433.496 238.57 433.594 239.055 433.789C239.539 433.984 239.973 434.254 240.355 434.598C240.738 434.941 241.055 435.34 241.305 435.793H241.363V433.73H243.402V445.695C243.402 446.633 243.184 447.449 242.746 448.145C242.309 448.848 241.684 449.391 240.871 449.773C240.059 450.164 239.098 450.359 237.988 450.359ZM237.848 444.172C238.559 444.172 239.176 443.988 239.699 443.621C240.23 443.246 240.645 442.727 240.941 442.062C241.238 441.398 241.387 440.621 241.387 439.73V439.719C241.387 438.836 241.238 438.062 240.941 437.398C240.645 436.734 240.23 436.219 239.699 435.852C239.176 435.484 238.559 435.301 237.848 435.301C237.121 435.301 236.488 435.484 235.949 435.852C235.418 436.211 235.008 436.723 234.719 437.387C234.438 438.051 234.297 438.828 234.297 439.719V439.73C234.297 440.637 234.438 441.422 234.719 442.086C235.008 442.75 235.418 443.266 235.949 443.633C236.488 443.992 237.121 444.172 237.848 444.172ZM251.312 446.234C250.141 446.234 249.133 445.977 248.289 445.461C247.445 444.938 246.797 444.203 246.344 443.258C245.891 442.312 245.664 441.199 245.664 439.918V439.906C245.664 438.633 245.891 437.516 246.344 436.555C246.805 435.594 247.445 434.844 248.266 434.305C249.094 433.766 250.066 433.496 251.184 433.496C252.301 433.496 253.262 433.754 254.066 434.27C254.871 434.785 255.488 435.508 255.918 436.438C256.355 437.359 256.574 438.434 256.574 439.66V440.422H246.695V438.828H255.555L254.523 440.305V439.508C254.523 438.555 254.379 437.77 254.09 437.152C253.809 436.527 253.414 436.062 252.906 435.758C252.406 435.453 251.828 435.301 251.172 435.301C250.516 435.301 249.926 435.461 249.402 435.781C248.887 436.102 248.48 436.574 248.184 437.199C247.887 437.824 247.738 438.594 247.738 439.508V440.305C247.738 441.172 247.883 441.914 248.172 442.531C248.469 443.141 248.887 443.609 249.426 443.938C249.973 444.266 250.617 444.43 251.359 444.43C251.883 444.43 252.348 444.352 252.754 444.195C253.168 444.039 253.512 443.828 253.785 443.562C254.059 443.289 254.254 442.984 254.371 442.648L254.406 442.543H256.422L256.398 442.66C256.289 443.145 256.094 443.605 255.812 444.043C255.531 444.473 255.168 444.852 254.723 445.18C254.277 445.508 253.766 445.766 253.188 445.953C252.617 446.141 251.992 446.234 251.312 446.234ZM262.891 446.211C261.742 446.211 260.887 445.945 260.324 445.414C259.77 444.883 259.492 444.031 259.492 442.859V435.418H257.664V433.73H259.492V430.438H261.602V433.73H264.004V435.418H261.602V442.754C261.602 443.426 261.742 443.887 262.023 444.137C262.305 444.379 262.727 444.5 263.289 444.5C263.422 444.5 263.547 444.496 263.664 444.488C263.781 444.473 263.895 444.461 264.004 444.453V446.117C263.863 446.141 263.691 446.16 263.488 446.176C263.293 446.199 263.094 446.211 262.891 446.211ZM275.125 446.234C274.328 446.234 273.621 446.082 273.004 445.777C272.387 445.473 271.906 445.043 271.562 444.488C271.219 443.926 271.047 443.277 271.047 442.543V442.52C271.047 441.809 271.219 441.199 271.562 440.691C271.914 440.176 272.422 439.77 273.086 439.473C273.758 439.176 274.562 439 275.5 438.945L280.035 438.676V440.27L275.734 440.539C274.898 440.586 274.254 440.781 273.801 441.125C273.355 441.469 273.133 441.93 273.133 442.508V442.531C273.133 443.125 273.355 443.598 273.801 443.949C274.254 444.293 274.848 444.465 275.582 444.465C276.23 444.465 276.812 444.328 277.328 444.055C277.844 443.781 278.254 443.41 278.559 442.941C278.863 442.473 279.016 441.945 279.016 441.359V437.691C279.016 436.949 278.781 436.367 278.312 435.945C277.844 435.516 277.176 435.301 276.309 435.301C275.535 435.301 274.906 435.465 274.422 435.793C273.945 436.121 273.645 436.555 273.52 437.094L273.496 437.188H271.516L271.527 437.07C271.598 436.398 271.832 435.793 272.23 435.254C272.637 434.715 273.188 434.289 273.883 433.977C274.578 433.656 275.398 433.496 276.344 433.496C277.32 433.496 278.156 433.664 278.852 434C279.555 434.328 280.098 434.793 280.48 435.395C280.863 435.996 281.055 436.711 281.055 437.539V446H279.016V444.043H278.945C278.703 444.488 278.387 444.875 277.996 445.203C277.605 445.531 277.168 445.785 276.684 445.965C276.199 446.145 275.68 446.234 275.125 446.234ZM287.23 446L282.707 433.73H284.852L288.238 443.82H288.309L291.695 433.73H293.828L289.316 446H287.23ZM301.188 446V429.09H303.238L314.078 444.652L311.641 442.402H312.602V429.09H314.688V446H312.637L301.797 430.449L304.234 432.699H303.273V446H301.188ZM321.109 446.234C320.312 446.234 319.605 446.082 318.988 445.777C318.371 445.473 317.891 445.043 317.547 444.488C317.203 443.926 317.031 443.277 317.031 442.543V442.52C317.031 441.809 317.203 441.199 317.547 440.691C317.898 440.176 318.406 439.77 319.07 439.473C319.742 439.176 320.547 439 321.484 438.945L326.02 438.676V440.27L321.719 440.539C320.883 440.586 320.238 440.781 319.785 441.125C319.34 441.469 319.117 441.93 319.117 442.508V442.531C319.117 443.125 319.34 443.598 319.785 443.949C320.238 444.293 320.832 444.465 321.566 444.465C322.215 444.465 322.797 444.328 323.312 444.055C323.828 443.781 324.238 443.41 324.543 442.941C324.848 442.473 325 441.945 325 441.359V437.691C325 436.949 324.766 436.367 324.297 435.945C323.828 435.516 323.16 435.301 322.293 435.301C321.52 435.301 320.891 435.465 320.406 435.793C319.93 436.121 319.629 436.555 319.504 437.094L319.48 437.188H317.5L317.512 437.07C317.582 436.398 317.816 435.793 318.215 435.254C318.621 434.715 319.172 434.289 319.867 433.977C320.562 433.656 321.383 433.496 322.328 433.496C323.305 433.496 324.141 433.664 324.836 434C325.539 434.328 326.082 434.793 326.465 435.395C326.848 435.996 327.039 436.711 327.039 437.539V446H325V444.043H324.93C324.688 444.488 324.371 444.875 323.98 445.203C323.59 445.531 323.152 445.785 322.668 445.965C322.184 446.145 321.664 446.234 321.109 446.234ZM333.906 446.211C332.758 446.211 331.902 445.945 331.34 445.414C330.785 444.883 330.508 444.031 330.508 442.859V435.418H328.68V433.73H330.508V430.438H332.617V433.73H335.02V435.418H332.617V442.754C332.617 443.426 332.758 443.887 333.039 444.137C333.32 444.379 333.742 444.5 334.305 444.5C334.438 444.5 334.562 444.496 334.68 444.488C334.797 444.473 334.91 444.461 335.02 444.453V446.117C334.879 446.141 334.707 446.16 334.504 446.176C334.309 446.199 334.109 446.211 333.906 446.211ZM337.469 446V433.73H339.508V446H337.469ZM338.488 431.598C338.129 431.598 337.82 431.473 337.562 431.223C337.312 430.965 337.188 430.656 337.188 430.297C337.188 429.938 337.312 429.633 337.562 429.383C337.82 429.125 338.129 428.996 338.488 428.996C338.855 428.996 339.164 429.125 339.414 429.383C339.664 429.633 339.789 429.938 339.789 430.297C339.789 430.656 339.664 430.965 339.414 431.223C339.164 431.473 338.855 431.598 338.488 431.598ZM345.941 446L341.418 433.73H343.562L346.949 443.82H347.02L350.406 433.73H352.539L348.027 446H345.941ZM358.914 446.234C357.742 446.234 356.734 445.977 355.891 445.461C355.047 444.938 354.398 444.203 353.945 443.258C353.492 442.312 353.266 441.199 353.266 439.918V439.906C353.266 438.633 353.492 437.516 353.945 436.555C354.406 435.594 355.047 434.844 355.867 434.305C356.695 433.766 357.668 433.496 358.785 433.496C359.902 433.496 360.863 433.754 361.668 434.27C362.473 434.785 363.09 435.508 363.52 436.438C363.957 437.359 364.176 438.434 364.176 439.66V440.422H354.297V438.828H363.156L362.125 440.305V439.508C362.125 438.555 361.98 437.77 361.691 437.152C361.41 436.527 361.016 436.062 360.508 435.758C360.008 435.453 359.43 435.301 358.773 435.301C358.117 435.301 357.527 435.461 357.004 435.781C356.488 436.102 356.082 436.574 355.785 437.199C355.488 437.824 355.34 438.594 355.34 439.508V440.305C355.34 441.172 355.484 441.914 355.773 442.531C356.07 443.141 356.488 443.609 357.027 443.938C357.574 444.266 358.219 444.43 358.961 444.43C359.484 444.43 359.949 444.352 360.355 444.195C360.77 444.039 361.113 443.828 361.387 443.562C361.66 443.289 361.855 442.984 361.973 442.648L362.008 442.543H364.023L364 442.66C363.891 443.145 363.695 443.605 363.414 444.043C363.133 444.473 362.77 444.852 362.324 445.18C361.879 445.508 361.367 445.766 360.789 445.953C360.219 446.141 359.594 446.234 358.914 446.234Z"
                fill="white"
            />
            <Defs>
                <ClipPath id="clip0_167_297">
                    <Rect
                        width={380}
                        height={76}
                        fill="white"
                        transform="translate(7 349)"
                    />
                </ClipPath>
            </Defs>
        </Svg>
    );
}