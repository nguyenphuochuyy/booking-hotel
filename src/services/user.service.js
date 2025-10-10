import http from "./httpClient";
import { USER } from "../constants/apiEndpoints";


// Lấy thông tin của user
export async function getUserProfile(payload) {
    return http.get(USER.GET_PROFILE, payload)
}

// Cập nhật thông tin profile
export async function updateUserProfile(payload) {
    return http.put(USER.UPDATE_PROFILE, payload)
}

// Đổi mật khẩu
export async function changePassword(payload) {
    return http.put(USER.CHANGE_PASSWORD, payload)
}