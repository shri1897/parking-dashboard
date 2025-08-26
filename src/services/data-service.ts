export interface OccupancyDataPoint {
  lotId: string
  ts: string
  occupied: number
  vehicleType: string
}

export interface LotData {
  lotId: string
  name: string
  capacity: number
  timezone: string
  location: {
    lat: number
    lng: number
  }
}

// Static data - in a real app this would come from an API
export const lotsData: LotData[] = [
  {
    "lotId": "L1",
    "name": "Union Garage",
    "capacity": 120,
    "timezone": "America/Los_Angeles",
    "location": {
      "lat": 37.7879,
      "lng": -122.4074
    }
  },
  {
    "lotId": "L2",
    "name": "Downtown Central",
    "capacity": 85,
    "timezone": "America/Los_Angeles",
    "location": {
      "lat": 37.7851,
      "lng": -122.409
    }
  },
  {
    "lotId": "L3",
    "name": "Riverside Lot",
    "capacity": 200,
    "timezone": "America/Los_Angeles",
    "location": {
      "lat": 37.792,
      "lng": -122.399
    }
  }
]

export const occupancyData: OccupancyDataPoint[] = [
  {
    "lotId": "L1",
    "ts": "2025-08-25T08:00:00Z",
    "occupied": 34,
    "vehicleType": "car"
  },
  {
    "lotId": "L1",
    "ts": "2025-08-25T08:15:00Z",
    "occupied": 39,
    "vehicleType": "car"
  },
  {
    "lotId": "L1",
    "ts": "2025-08-25T08:30:00Z",
    "occupied": 47,
    "vehicleType": "car"
  },
  {
    "lotId": "L1",
    "ts": "2025-08-25T09:00:00Z",
    "occupied": 61,
    "vehicleType": "car"
  },
  {
    "lotId": "L1",
    "ts": "2025-08-25T12:00:00Z",
    "occupied": 92,
    "vehicleType": "car"
  },
  {
    "lotId": "L1",
    "ts": "2025-08-25T17:00:00Z",
    "occupied": 114,
    "vehicleType": "car"
  },
  {
    "lotId": "L1",
    "ts": "2025-08-25T17:15:00Z",
    "occupied": 117,
    "vehicleType": "car"
  },
  {
    "lotId": "L1",
    "ts": "2025-08-25T17:30:00Z",
    "occupied": 121,
    "vehicleType": "car"
  },
  {
    "lotId": "L2",
    "ts": "2025-08-25T08:00:00Z",
    "occupied": 20,
    "vehicleType": "car"
  },
  {
    "lotId": "L2",
    "ts": "2025-08-25T08:15:00Z",
    "occupied": 23,
    "vehicleType": "car"
  },
  {
    "lotId": "L2",
    "ts": "2025-08-25T17:30:00Z",
    "occupied": 86,
    "vehicleType": "car"
  },
  {
    "lotId": "L3",
    "ts": "2025-08-25T08:00:00Z",
    "occupied": 50,
    "vehicleType": "car"
  },
  {
    "lotId": "L3",
    "ts": "2025-08-25T12:00:00Z",
    "occupied": 140,
    "vehicleType": "car"
  },
  {
    "lotId": "L3",
    "ts": "2025-08-25T17:30:00Z",
    "occupied": 195,
    "vehicleType": "car"
  },
  {
    "lotId": "L3",
    "ts": "2025-08-25T22:00:00Z",
    "occupied": 60,
    "vehicleType": "car"
  },
  {
    "lotId": "L1",
    "ts": "2025-08-25T17:45:00Z",
    "occupied": 145,
    "vehicleType": "car"
  },
  {
    "lotId": "L2",
    "ts": "2025-08-25T08:30:00Z",
    "occupied": 5,
    "vehicleType": "car"
  }
]
