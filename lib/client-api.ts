import {del, get, patch, post, put} from "@/lib/api";
import {UpdateUserProfile, UserProfile} from "@/types/diary";

export function getUserProfile() :Promise<UserProfile> {
    return get("/users/me");
}

export function deleteUser() :Promise<void> {
    return del("/users/me");
}
export function updateUserProfile(data: {username?: string, profileImageUrl?: string}) :Promise<UpdateUserProfile> {
    return patch("users/me/profile", data);
}

export function logout():Promise<void> {
    return post("/auth/logout");
}
