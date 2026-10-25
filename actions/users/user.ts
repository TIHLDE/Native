import { apiJson } from "@/lib/api/client";
import { User, UserProfile } from "@/actions/types";
import {
    PhotonUser,
    PhotonUserProfile,
    toUser,
    toUserProfile,
} from "@/actions/photon";

export async function getUser(id: string): Promise<User> {
    const user = await apiJson<PhotonUser>(`/user/${encodeURIComponent(id)}`);
    return toUser(user);
}

/** Profilen til et medlem. Photon godtar både id og brukernavn. */
export async function getUserProfile(id: string): Promise<UserProfile> {
    const profile = await apiJson<PhotonUserProfile>(`/user/${encodeURIComponent(id)}`);
    return toUserProfile(profile);
}
