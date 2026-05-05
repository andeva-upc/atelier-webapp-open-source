/**
 * Base class for API communication.
 * Centralizes fetch configuration and error handling.
 * 
 * @public
 */
export class BaseApi {
    constructor() {
        /** @type {string} */
        this.baseUrl = 'http://localhost:3000';
    }

    /**
     * Performs a generic HTTP request using fetch.
     * 
     * @param path - Relative path to the resource.
     * @param options - Fetch request options (headers, method, body, etc.).
     * @returns A promise that resolves to the JSON response or null for 204 No Content.
     * @throws Error if the response is not OK or if the network request fails.
     */
    async request(path, options = {}) {
        const url = `${this.baseUrl}${path}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...defaultHeaders, ...options.headers },
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.message || `Error HTTP: ${response.status}`);
            }

            return response.status === 204 ? null : response.json();
        } catch (error) {
            console.error(`[BaseApi Error] at ${url}:`, error);
            throw error;
        }
    }
}
