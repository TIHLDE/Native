import { apiJson } from "@/lib/api/client";
import { User } from "@/actions/types";
import { PhotonUser, toUser } from "@/actions/photon";

export async function getUser(id: string): Promise<User> {
    const user = await apiJson<PhotonUser>(`/user/${encodeURIComponent(id)}`);
    return toUser(user);
}
