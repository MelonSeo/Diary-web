import {del, get, patch, post, put} from "@/lib/api";
import {CreateDiaryResponse, DiaryEntry, PaginatedResponse, UpdateUserProfile, UserProfile} from "@/types/diary";

export function getUserProfile() :Promise<UserProfile> {
    console.log("[client-api]getUserProfile");
    return get("/users/me");
}

export function deleteUser() :Promise<void> {
    console.log("[client-api]deleteUser");
    return del("/users/me");
}

export function updateUserProfile(data: {username?: string, profileImageUrl?: string}) :Promise<UpdateUserProfile> {
    console.log("[client-api]updateUserProfile");
    return patch("/users/me/profile", data);
}

export function logout():Promise<void> {
    return post("/auth/logout");
}

export function getClientDiaries(page = 1, limit = 12): Promise<PaginatedResponse<DiaryEntry>> {
    return get(`/diaries?page=${page}&limit=${limit}`)
}

export function getDiary(id: string): Promise<DiaryEntry> {
    console.log("[client-api]getDiary");
    return get(`/diaries/${id}`)
}

export function createDiary(data: { title: string; content: string;}): Promise<CreateDiaryResponse> {
    return post("/diaries", data)
}

export function updateDiary(id: string, data: { title?: string; content?: string; },): Promise<CreateDiaryResponse> {
    return put(`/diaries/${id}`, data)
}

export function deleteDiary(id: string): Promise<void> {
    return del(`/diaries/${id}`)
}