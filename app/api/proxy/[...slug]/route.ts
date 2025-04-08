import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_URL || "https://api.example.com";

/**
 * Proxy handler for external API calls
 * Uses [...slug] catch-all route to forward requests to external APIs
 * Doesn't require authentication tokens
 */
async function handler(
  request: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  console.log(`[EXTERNAL PROXY] Request received: ${request.method} ${request.nextUrl.pathname}`);

  // Get path segments from the slug
  const { slug } = await params;
  const targetPath = slug.join("/");

  // Get query parameters
  const searchParams = request.nextUrl.search;

  // Construct the target URL
  const targetUrl = `${EXTERNAL_API_BASE_URL}/${targetPath}${searchParams}`;
  console.log(`[EXTERNAL PROXY] Forwarding to: ${targetUrl}`);

  // Copy relevant headers from the original request
  const headers = new Headers();

  // Copy common headers
  const relevantHeaders = [
    "Content-Type",
    "Accept",
    "User-Agent",
    "X-Request-ID"
  ];

  relevantHeaders.forEach(header => {
    const value = request.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  });

  try {
    // Forward the request to the external API
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? await request.text() // Use text to preserve any content type
          : null,
      // @ts-ignore
      duplex: "half", // Required by Node.js fetch when streaming request body
    });

    console.log(`[EXTERNAL PROXY] Response status: ${apiResponse.status}`);

    // Process response headers
    const responseHeaders = new Headers(apiResponse.headers);
    // Remove problematic headers
    ["transfer-encoding", "content-encoding", "content-length"].forEach(header => {
      responseHeaders.delete(header);
    });

    // Return the proxied response
    return new NextResponse(apiResponse.body, {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[EXTERNAL PROXY] Error:`, error);

    return NextResponse.json(
      {
        message: "External proxy error: Failed to connect to external API.",
        error: (error as Error).message,
      },
      { status: 502 } // 502 Bad Gateway
    );
  }
}

// Export the handler for all HTTP methods
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as OPTIONS,
  handler as HEAD,
}; 