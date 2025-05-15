import { refreshAccessToken } from "./apiService";

export const fetchWithRefresh = async (
  input: RequestInfo,
  init?: RequestInit,
  retry = true
): Promise<Response> => {
  const response = await fetch(input, { ...init, credentials: "include" });

  if (response.status === 401 && retry) {
    try {
      const refreshResponse = await refreshAccessToken();

      if (refreshResponse) {
        return await fetchWithRefresh(input, init, false);
      }
    } catch (error) {
      console.error(`Error: ${error as Error}`);
    }
  }

  return response;
};
