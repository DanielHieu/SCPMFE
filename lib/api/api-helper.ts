const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";

const PROXY_API_PATH = "/api/proxy";

export async function fetchApi(
  relativePath: string,
  options: RequestInit = {},
) {
  // WARN: Get session on the client-side
  // For server components, use getServerSession
  const absoluteProxyUrl = `${APP_BASE_URL}${PROXY_API_PATH}${relativePath}`;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const config: RequestInit = {
    ...options,
    headers,
    cache: options.cache || "default",
  };

  const requestMethod = options.method || "GET";
  const requestBody = options.body ? JSON.parse(options.body as string) : null;

  console.log(`API Request: ${requestMethod} ${absoluteProxyUrl}`);
  if (requestBody) {
    console.log(`Request Payload:`, requestBody);
  }

  const startTime = performance.now();
  let response: Response;
  try {
    console.log(`Fetching ${absoluteProxyUrl} with config:`, config);
    response = await fetch(absoluteProxyUrl, config);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.log(`API Response Time: ${duration}ms for ${requestMethod} ${relativePath}`);
  } catch (networkError) {
    // Handle network errors (e.g., proxy down, DNS issues)
    console.error(`Network error fetching ${absoluteProxyUrl}:`, networkError);
    throw new Error(`Network error: Failed to connect to API proxy.`);
  }

  // --- Improved Response Handling ---

  // Handle successful DELETE with No Content
  if (response.status === 204 && response.ok) {
    console.log(`API Response: ${response.status} No Content`);
    return null; // Or return { success: true } if preferred
  }

  // --- ADD CHECK HERE for 200 OK on DELETE ---
  if (response.ok && options.method === "DELETE" && response.status === 200) {
    console.log(
      `API Response: ${response.status} OK on DELETE (assuming no body)`,
    );
    // Attempt to read text just in case, but don't fail if empty
    try {
      await response.text();
    } catch (e) { }
    return null; // Treat as success with no relevant body
  }

  // Check if the response indicates success (2xx status code)
  if (response.ok) {
    // For other successful responses (e.g., GET, PUT, POST returning data)
    try {
      // Check Content-Type before parsing if possible
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const responseData = await response.json();
        console.log(`API Response OK (${response.status}) for ${requestMethod} ${relativePath}:`, responseData);
        return responseData; // Adjust based on API structure
      } else {
        // Handle successful response but non-JSON content if necessary
        const responseText = await response.text();
        console.log(
          `API Response OK (${response.status}) but not JSON for ${requestMethod} ${relativePath}:`,
          responseText,
        );
        return responseText; // Or handle as needed
      }
    } catch (jsonError) {
      console.error(
        `JSON parsing error on successful response (${response.status}) for ${requestMethod} ${relativePath}:`,
        jsonError,
      );
      // This case might happen if content-type IS json but body is malformed/empty
      // Consider returning null or a specific error object
      // throw new Error('Received successful response but failed to parse JSON body.');
      console.warn(
        `Returning null due to JSON parse error on successful response for ${requestMethod} ${relativePath}.`,
      );
      return null; // Be lenient on success if body is unexpectedly empty/bad
    }
  } else {
    // Handle error responses (4xx, 5xx)
    let errorBodyText = await response.text();
    console.error(`API Error Response Body for ${requestMethod} ${relativePath}: ${errorBodyText}`);
    let errorMessage = `API Error (${response.status})`;
    console.error(`API Error Response Status: ${response.status} ${response.statusText} for ${requestMethod} ${relativePath}`);

    try {
      const errorJson = JSON.parse(errorBodyText);
      errorMessage =
        errorJson?.message || errorJson?.error || errorBodyText || errorMessage;
      console.error(`Parsed Error Details for ${requestMethod} ${relativePath}:`, errorJson);
    } catch (e) {
      errorMessage = errorBodyText || errorMessage;
    }
    throw new Error(errorMessage);
  }
}
