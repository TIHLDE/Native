import { Redirect } from "expo-router";

// siden mvp ikke har en hjem side, må vi manuelt redirecte til arrangementer
// senere endrer vi dette til den faktiske hjem siden

export default function Arrangementer() {
    return (
        <Redirect href={"/arrangementer"} />
    )
}