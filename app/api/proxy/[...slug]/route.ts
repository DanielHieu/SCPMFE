import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_URL || "https://api.example.com";

/**
 * Proxy handler for external API calls
 * Uses [...slug] catch-all route to forward requests to external APIs
 * Doesn't require authentication tokens
 */
type Params = Promise<{ slug: string[] }>

export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { slug } = await params;
  return handleRequest(request, { slug });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { slug } = await params;
  return handleRequest(request, { slug });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { slug } = await params;
  return handleRequest(request, { slug });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { slug } = await params;
  return handleRequest(request, { slug });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { slug } = await params;
  return handleRequest(request, { slug });
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { slug } = await params;
  return handleRequest(request, { slug });
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Params },
) {
  const { slug } = await params;
  return handleRequest(request, { slug });
}

/**
 * Common handler function for all HTTP methods
 */
async function handleRequest(
  request: NextRequest,
  { slug }: { slug: string[] },
) {
  console.log(`[EXTERNAL PROXY] Request received: ${request.method} ${request.nextUrl.pathname}`);

  // Get path segments from the slug
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

  // Add cache control headers to disable caching
  headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");

  try {
    // Forward the request to the external API
    const apiResponse = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? await request.text() // Use text to preserve any content type
          : undefined,
      cache: "no-store", // Disable caching
    });

    console.log(`[EXTERNAL PROXY] Response status: ${apiResponse.status}`);

    // Process response headers
    const responseHeaders = new Headers(apiResponse.headers);
    // Remove problematic headers
    ["transfer-encoding", "content-encoding", "content-length"].forEach(header => {
      responseHeaders.delete(header);
    });

    // Add cache control headers to response
    responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");

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
        message: "Lỗi kết nối đến API bên ngoài",
        error: (error as Error).message,
      },
      { 
        status: 502, // 502 Bad Gateway
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }
    );
  }
}