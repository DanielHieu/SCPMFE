// components/features/parking-lots/[lotId]/MapDisplay.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
// Import necessary components from the library
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary,
  MapCameraChangedEvent
} from "@vis.gl/react-google-maps";
import { AlertTriangle, MapPin } from "lucide-react";

interface MapDisplayProps {
  lat: number;
  long: number;
  address: string; // For marker title/info
}

export function MapDisplay({ lat, long, address }: MapDisplayProps) {
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Use valid coordinates or default to a fallback location (e.g., HCMC center)
  const defaultPosition = {
    lat: 10.7769, // Ho Chi Minh City approx latitude
    lng: 106.7009, // Ho Chi Minh City approx longitude
  };
  const position = lat && long ? { lat: lat, lng: long } : defaultPosition;
  const zoom = lat && long ? 15 : 10; // Zoom in more if coords are valid

  const apiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  // Simulate checking if map has loaded correctly
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!apiKey) {
      setMapError("Google Maps API Key is missing. Check .env.local file (NEXT_PUBLIC_Maps_API_KEY).");
      setIsLoading(false);
      return;
    }
    
    // Set a timeout to detect loading issues
    timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [apiKey, isLoading]);

  // Handle map loading state and errors
  const handleMapCameraChanged = (event: MapCameraChangedEvent) => {
    if (isLoading) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add error handling for the script loading
    const handleMapError = () => {
      console.error("Google Maps failed to load");
      setMapError("Không thể tải bản đồ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.");
      setIsLoading(false);
    };

    // Detect if Google Maps API failed to load
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        if (event.target && (event.target as HTMLElement).tagName === 'SCRIPT') {
          const src = (event.target as HTMLScriptElement).src || '';
          if (src.includes('maps.googleapis.com')) {
            handleMapError();
          }
        }
      }, { capture: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', () => {});
      }
    };
  }, []);

  // If API key is missing, show error
  if (!apiKey) {
    return (
      <div className="h-full w-full bg-red-50 flex flex-col items-center justify-center p-6 border border-red-300 rounded-lg">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-2" />
        <div className="text-center">
          <h3 className="text-red-700 font-medium mb-1">Lỗi cấu hình bản đồ</h3>
          <p className="text-red-600 text-sm">Thiếu API Key của Google Maps. Vui lòng kiểm tra tệp cấu hình .env.local</p>
        </div>
      </div>
    );
  }

  // If there's a map error, show error message
  if (mapError) {
    return (
      <div className="h-full w-full bg-yellow-50 flex flex-col items-center justify-center p-6 border border-yellow-300 rounded-lg">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
        <div className="text-center">
          <h3 className="text-yellow-700 font-medium mb-1">Không thể tải bản đồ</h3>
          <p className="text-yellow-600 text-sm">{mapError}</p>
          <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200 w-full max-w-md">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium mb-1">Địa chỉ</p>
                <p className="text-gray-600 text-sm">{address || "Chưa có thông tin địa chỉ"}</p>
                {lat && long && (
                  <p className="text-gray-500 text-xs mt-1">
                    Vị trí: {lat.toFixed(6)}, {long.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
          <p className="mt-4 text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Catch any render errors with an error boundary */}
      <ErrorBoundary fallback={
        <div className="h-full w-full bg-red-50 flex items-center justify-center p-4 text-red-600 border border-red-300 rounded-lg">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Lỗi hiển thị bản đồ
        </div>
      }>
        <APIProvider apiKey={apiKey}>
          <div style={{ height: "100%", width: "100%" }}>
            <Map
              defaultCenter={position}
              defaultZoom={zoom}
              mapId="parkingLotMap"
              gestureHandling={"greedy"}
              disableDefaultUI={true}
              onCameraChanged={handleMapCameraChanged}
            >
              {lat && long && (
                <AdvancedMarker
                  position={position}
                  title={address || "Vị trí bãi đỗ xe"}
                >
                  <Pin
                    background={"#1E90FF"}
                    glyphColor={"#FFFFFF"}
                    borderColor={"#1E90FF"}
                  />
                </AdvancedMarker>
              )}
            </Map>
          </div>
        </APIProvider>
      </ErrorBoundary>
    </div>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error("Map error caught by ErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
