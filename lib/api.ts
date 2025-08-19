interface routeRequestInit {
    requestMethod: string;
    endpoint: string;
    body?: any;
    headers?: HeadersInit;
}

async function request<T> ({ requestMethod, endpoint, body, headers}: routeRequestInit): Promise<T> {
    const url = "/api/bff"
    console.log(`${requestMethod} ${endpoint} ${body}`);
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
            endpoint,
            requestMethod,
            ...(requestMethod === "POST" ||
            requestMethod === "PUT" ||
            requestMethod === "PATCH"
                ? { data: body }
                : {}),
        }),
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
    console.log("endpoint:", endpoint);
    return request<T>({
        endpoint,
        requestMethod: "GET",
        headers: jsonHeaders(headers),
    });
}

export function del<T>(endpoint: string, headers?: HeadersInit) {
    return request<T>({
        endpoint,
        requestMethod: "DELETE",
        headers: jsonHeaders(headers),
    });
}

export function post<T>(endpoint: string, body?: any, headers?: HeadersInit) {
    return request<T>({
        endpoint,
        requestMethod: "POST",
        headers: jsonHeaders(headers),
        body,
    });
}

export function patch<T>(endpoint: string, body?: any, headers?: HeadersInit) {

    return request<T>({
        endpoint,
        requestMethod: "PATCH",
        headers: jsonHeaders(headers),
        body,
    });
}

export function put<T>(endpoint: string, body?: any, headers?: HeadersInit) {

    return request<T>({
        endpoint,
        requestMethod: "PUT",
        headers: jsonHeaders(headers),
        body,
    });
}