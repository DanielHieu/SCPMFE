// components/features/parking-lots/[lotId]/MapDisplay.tsx
"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, MapPin } from "lucide-react";

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface MapDisplayProps {
  lat: number;
  long: number;
  address: string; // For marker title/info
}

export function MapDisplay({ lat, long, address }: MapDisplayProps) {
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);
  const [parkingIcon, setParkingIcon] = useState<any>(null);

  // Use valid coordinates or default to a fallback location (e.g., HCMC center)
  const defaultPosition: [number, number] = [10.7769, 106.7009]; // Ho Chi Minh City
  const position: [number, number] = lat && long ? [lat, long] : defaultPosition;
  const zoom = lat && long ? 15 : 10; // Zoom in more if coords are valid

  useEffect(() => {
    // Ensure we're on client side
    setIsClient(true);
    
    // Dynamic import Leaflet and setup icons
    const setupLeaflet = async () => {
      try {
        // Import Leaflet
        const leaflet = await import('leaflet');
        
        // Fix for default markers in react-leaflet
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create custom parking icon
        const icon = new leaflet.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        setL(leaflet);
        setParkingIcon(icon);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        setMapError('Không thể tải bản đồ. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };

    setupLeaflet();
  }, []);

  // Handle map loading errors
  const handleMapError = () => {
    setMapError("Không thể tải bản đồ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.");
    setIsLoading(false);
  };

  // Don't render anything on server side
  if (!isClient) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
          <p className="mt-4 text-gray-600">Đang khởi tạo bản đồ...</p>
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
  if (isLoading || !L || !parkingIcon) {
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
      <ErrorBoundary 
        fallback={
          <div className="h-full w-full bg-red-50 flex items-center justify-center p-4 text-red-600 border border-red-300 rounded-lg">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Lỗi hiển thị bản đồ
          </div>
        }
        onError={handleMapError}
      >
        <MapContainer
          center={position}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="rounded-lg z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {lat && long && (
            <Marker position={position} icon={parkingIcon}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {address || "Bãi đỗ xe"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vị trí: {lat.toFixed(6)}, {long.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </ErrorBoundary>
    </div>
  );
}

// Enhanced error boundary component with better error handling
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: () => void;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Map error caught by ErrorBoundary:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
