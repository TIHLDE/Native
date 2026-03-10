import { BASE_URL } from "@/actions/constant";
import { getToken } from "@/lib/storage/tokenStore";
import { LeptonError } from "@/actions/types";

export async function uploadImage(uri: string): Promise<string> {
    const token = await getToken();

    const formData = new FormData();
    const filename = uri.split("/").pop() ?? "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", {
        uri,
        name: filename,
        type,
    } as any);

    const response = await fetch(`${BASE_URL}/upload/`, {
        method: "POST",
        headers: {
            "X-Csrf-Token": token ?? "",
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = (await response.json()) as LeptonError;
        throw new Error(errorData.detail);
    }

    const data = await response.json();
    return data.url;
}
