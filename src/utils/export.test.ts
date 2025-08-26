import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, prepareExportData } from './export'

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = vi.fn()

// Mock document.createElement and related methods
const mockLink = {
  click: vi.fn(),
  href: '',
  download: 'mock-download',
  style: { visibility: '' },
  setAttribute: vi.fn()
}
global.document.createElement = vi.fn(() => mockLink)
global.document.body.appendChild = vi.fn()
global.document.body.removeChild = vi.fn()

describe('export utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportToCSV', () => {
    it('creates and triggers download of CSV file', () => {
      const exportData = [
        {
          lotId: 'L1',
          lotName: 'Test Lot',
          timestamp: '2024-01-01T10:00:00Z',
          date: '2024-01-01',
          time: '10:00',
          occupied: 100,
          vehicleType: 'car',
          capacity: 500,
          occupancyRate: 20
        }
      ]
      const filename = 'test-data'

      exportToCSV(exportData, filename)

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.any(Blob)
      )
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-blob-url')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('test-data-'))
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('uses default filename when not provided', () => {
      const exportData = [
        {
          lotId: 'L1',
          lotName: 'Test Lot',
          timestamp: '2024-01-01T10:00:00Z',
          date: '2024-01-01',
          time: '10:00',
          occupied: 100,
          vehicleType: 'car'
        }
      ]
      
      exportToCSV(exportData)
      
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('parking-data-'))
    })
  })

  describe('prepareExportData', () => {
    const mockOccupancyData = [
      {
        lotId: 'L1',
        ts: '2024-01-01T10:00:00Z',
        occupied: 100,
        vehicleType: 'car'
      },
      {
        lotId: 'L2', 
        ts: '2024-01-01T11:00:00Z',
        occupied: 150,
        vehicleType: 'truck'
      }
    ]

    const mockLotsData = [
      { lotId: 'L1', name: 'Union Garage', capacity: 500 },
      { lotId: 'L2', name: 'Downtown Central', capacity: 300 }
    ]

    it('converts occupancy data to export format', () => {
      const result = prepareExportData(mockOccupancyData, mockLotsData, {})
      
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      
      expect(result[0]).toMatchObject({
        lotId: 'L1',
        lotName: 'Union Garage',
        timestamp: '2024-01-01T10:00:00Z',
        date: '2024-01-01',
        occupied: 100,
        vehicleType: 'car',
        capacity: 500,
        occupancyRate: 20
      })
      
      expect(result[1]).toMatchObject({
        lotId: 'L2',
        lotName: 'Downtown Central',
        timestamp: '2024-01-01T11:00:00Z',
        date: '2024-01-01',
        occupied: 150,
        vehicleType: 'truck',
        capacity: 300,
        occupancyRate: 50
      })
    })

    it('handles missing lot data gracefully', () => {
      const dataWithUnknownLot = [
        {
          lotId: 'L999',
          ts: '2024-01-01T10:00:00Z', 
          occupied: 50,
          vehicleType: 'car'
        }
      ]

      const result = prepareExportData(dataWithUnknownLot, mockLotsData, {})
      
      expect(result[0]).toMatchObject({
        lotId: 'L999',
        lotName: 'L999',
        timestamp: '2024-01-01T10:00:00Z',
        date: '2024-01-01',
        occupied: 50,
        vehicleType: 'car',
        capacity: undefined,
        occupancyRate: undefined
      })
    })

    it('calculates occupancy rate correctly', () => {
      const result = prepareExportData(mockOccupancyData, mockLotsData, {})
      
      // L1: 100/500 = 20%
      expect(result[0].occupancyRate).toBe(20)
      // L2: 150/300 = 50%
      expect(result[1].occupancyRate).toBe(50)
    })

    it('handles zero capacity', () => {
      const lotsWithZeroCapacity = [
        { lotId: 'L1', name: 'Test Lot', capacity: 0 }
      ]
      
      const dataWithZeroCapacity = [
        {
          lotId: 'L1',
          ts: '2024-01-01T10:00:00Z',
          occupied: 10,
          vehicleType: 'car'
        }
      ]

      const result = prepareExportData(dataWithZeroCapacity, lotsWithZeroCapacity, {})
      
      expect(result[0].occupancyRate).toBe(undefined)
    })
  })
})
