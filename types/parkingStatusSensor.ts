export interface ParkingStatusSensor {
    parkingStatusSensorId: number;
    name: string;
    apiKey: string;
    parkingSpaceId: number;
    parkingSpaceName: string;
    floorName: string;
    areaName: string;
    parkingLotName: string;
    parkingLotAddress: string;
    status: string;
}

export interface AddParkingStatusSensorPayload {
    apiKey: string;
    parkingSpaceId: number;
    status?: string;
}

export interface UpdateParkingStatusSensorPayload {
    parkingStatusSensorId: number;
    apiKey: string;
    status?: string;
}
