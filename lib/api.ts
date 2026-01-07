import Long from "long";

interface routeRequestInit {
    requestMethod: string;
    endpoint: string;
    body?: any;
    headers?: HeadersInit;
}

const getBaseUrl = () => {
    // If running on the client, return an empty string for relative paths
    if (typeof window !== 'undefined') {
        return '';
    }

    // If on the server, construct the absolute URL.
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        // Vercel-provided URL for server-side environments. Note the use of NEXT_PUBLIC_VERCEL_URL here.
        // Vercel automatically makes this available.
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }

    // Fallback for local server-side development
    return 'http://localhost:3000';
};

const jsonReviver = (key: string, value: any) => {
    if ((key === 'id' || key === 'uid') && value !== null) {
        if (typeof value === 'string' || typeof value === 'number' || (typeof value === 'object' && 'low' in value && 'high' in value)) {
            return Long.fromValue(value);
        }
    }
    return value;
};

async function request<T> ({ requestMethod, endpoint, body, headers}: routeRequestInit): Promise<T> {
    const url = `${getBaseUrl()}/api/bff`;

    let finalHeaders: HeadersInit = headers || {};

    // Check if running on the server
    if (typeof window === 'undefined') {
        const { cookies } = await import('next/headers');
        // Apply the same workaround as for `params`
        const cookieStore = await (cookies() as any);
        const cookieHeader = cookieStore.getAll().map((c: { name: string; value: string; }) => `${c.name}=${c.value}`).join('; ');
        finalHeaders = {
            ...finalHeaders,
            'Cookie': cookieHeader,
        };
        console.log("[lib/api server-side] Forwarding headers to BFF:", JSON.stringify(finalHeaders));
    }

    console.log(`${requestMethod} ${endpoint} ${body}`);
    const res = await fetch(url, {
        method: "POST",
        credentials: "include", // This is for browser-side fetch
        headers: finalHeaders,
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

    const text = await res.text();
    if (!text) {
        return null as T;
    }
    const data: T = JSON.parse(text, jsonReviver);
    console.log("[API Response Data]:", data);
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