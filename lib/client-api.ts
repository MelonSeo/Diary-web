import {del, get, patch, post, put} from "@/lib/api";
import {DiaryEntry, PaginatedResponse, UpdateUserProfile, UserProfile} from "@/types/diary";

export function getUserProfile() :Promise<UserProfile> {
    console.log("getUserProfile");
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

export function getClientDiaries(page = 1, limit = 12): Promise<PaginatedResponse<DiaryEntry>> {
    return get(`/diaries?page=${page}&limit=${limit}`)
}

export function getDiary(id: string): Promise<DiaryEntry> {
    return get(`/diaries/${id}`)
}

export function createDiary(data: { title: string; content: string;}): Promise<void> {
    return post("/diaries", data)
}

export function updateDiary(
    id: string,
    data: { title?: string; content?: string; },
): Promise<DiaryEntry> {
    return put(`/diaries/${id}`, data)
}

export function deleteDiary(id: string): Promise<void> {
    return del(`/diaries/${id}`)
}