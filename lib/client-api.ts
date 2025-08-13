import {del, get, patch, post, put} from "@/lib/api";

export function getUserProfile() {
    return get("/users/me");
}

export function deleteUserProfile() {
    return del("/users/me");
}
export function updateUserProfile(data: {username: string, profileImageUrl: string}) {
    return patch("users/me/profile", data);
}

export function logout() {
    return post("/auth/logout");
}
