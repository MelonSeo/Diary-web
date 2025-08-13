
interface routeRequestInit {
    method: string;
    endpoint: string;
    body?: any;
    headers?: HeadersInit;
}

async function request<T> ({ method, endpoint, body, headers}: routeRequestInit): Promise<T> {
    const url = "/api/bff"
    const res = await fetch(url, {
        method,
        credentials: "include",
        headers,
        body: body || JSON.stringify({endpoint}),
    });

    if (!res.ok) {
        const text = await res.text().catch(() =>"");
        throw new Error(text || `HTTP error ${res.status}`);
    }

    //const ct = res.headers.get("content-type") || "";
    //if (ct.includes("application/json")) return res.json();
    //return res.text() as unknown as T;
    const data: T = await res.json();
    return data;
}

function jsonHeaders(options?: HeadersInit): HeadersInit {
    return {"Content-Type": "application/json", ...(options || {})};
}

export function get<T>(endpoint: string, headers?: HeadersInit) :Promise<T> {
    return request<T>({
        endpoint,
        method: "GET",
        headers: jsonHeaders(headers),
    });
}

export function del<T>(endpoint: string, headers?: HeadersInit) {
    return request<T>({
        endpoint,
        method: "DELETE",
        headers: jsonHeaders(headers),
    });
}

export function post<T>(endpoint: string, body?: any, headers?: HeadersInit) {
    const isForm = body instanceof FormData;

    return request<T>({
        endpoint,
        method: "POST",
        headers: isForm ? headers : jsonHeaders(headers),
        body: isForm ? body : JSON.stringify({ endpoint, data: body}),
    });
}

export function patch<T>(endpoint: string, body?: any, headers?: HeadersInit) {
    const isForm = body instanceof FormData;

    return request<T>({
        endpoint,
        method: "PATCH",
        headers: isForm ? headers : jsonHeaders(headers),
        body: isForm ? body : JSON.stringify({ endpoint, data: body}),
    });
}

export function put<T>(endpoint: string, body?: any, headers?: HeadersInit) {
    const isForm = body instanceof FormData;

    return request<T>({
        endpoint,
        method: "PUT",
        headers: isForm ? headers : jsonHeaders(headers),
        body: isForm ? body : JSON.stringify({ endpoint, data: body}),
    });
}