export interface ParkingStatusSensor {
    parkingStatusSensorId: number;
    name: string;
    apiKey: string;
    parkingSpaceId: number;
    parkingSpaceName: string;
    status: string;
}

export interface AddParkingStatusSensorPayload {
    apiKey: string;
    parkingSpaceId: number;
}

export interface UpdateParkingStatusSensorPayload {
    parkingStatusSensorId: number;
    apiKey: string;
}
