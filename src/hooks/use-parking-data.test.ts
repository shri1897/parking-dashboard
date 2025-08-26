import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useParkingData } from './use-parking-data'

// Mock the data service
vi.mock('../services/data-service', () => ({
  lotsData: [
    { lotId: 'L1', name: 'Union Garage', capacity: 500, location: 'Downtown' },
    { lotId: 'L2', name: 'Downtown Central', capacity: 300, location: 'Central' },
    { lotId: 'L3', name: 'Riverside Lot', capacity: 200, location: 'Riverside' }
  ],
  occupancyData: [
    { lotId: 'L1', ts: '2024-01-01T10:00:00Z', occupied: 100, vehicleType: 'car' },
    { lotId: 'L2', ts: '2024-01-01T10:00:00Z', occupied: 150, vehicleType: 'car' },
    { lotId: 'L3', ts: '2024-01-01T10:00:00Z', occupied: 80, vehicleType: 'car' }
  ]
}))

describe('useParkingData', () => {
  const defaultFilters = {
    lotId: 'all',
    vehicleType: 'all',
    dateRange: { from: undefined, to: undefined }
  }

  it('returns parking data with correct structure', () => {
    const { result } = renderHook(() => useParkingData(defaultFilters))
    
    expect(result.current).toHaveProperty('metrics')
    expect(result.current).toHaveProperty('lots')
    expect(result.current).toHaveProperty('occupancy')
    expect(result.current).toHaveProperty('lotStatus')
    expect(result.current).toHaveProperty('exportData')
    
    expect(result.current.metrics).toHaveProperty('totalCapacity')
    expect(result.current.metrics).toHaveProperty('currentOccupancy')
    expect(result.current.metrics).toHaveProperty('occupancyRate')
  })

  it('calculates total capacity correctly', () => {
    const { result } = renderHook(() => useParkingData(defaultFilters))
    
    // Expected total capacity: 500 + 300 + 200 = 1000
    expect(result.current.metrics.totalCapacity).toBe(1000)
  })

  it('calculates current occupancy correctly', () => {
    const { result } = renderHook(() => useParkingData(defaultFilters))
    
    // Expected current occupancy: 100 + 150 + 80 = 330
    expect(result.current.metrics.currentOccupancy).toBe(330)
  })

  it('calculates occupancy rate correctly', () => {
    const { result } = renderHook(() => useParkingData(defaultFilters))
    
    // Expected rate: (330 / 1000) * 100 = 33%
    expect(result.current.metrics.occupancyRate).toBe(33)
  })

  it('returns occupancy data array', () => {
    const { result } = renderHook(() => useParkingData(defaultFilters))
    
    expect(Array.isArray(result.current.occupancy)).toBe(true)
  })

  it('returns lot status array', () => {
    const { result } = renderHook(() => useParkingData(defaultFilters))
    
    expect(Array.isArray(result.current.lotStatus)).toBe(true)
    expect(result.current.lotStatus).toHaveLength(3)
  })

  it('provides export function', () => {
    const { result } = renderHook(() => useParkingData(defaultFilters))
    
    expect(typeof result.current.exportData).toBe('function')
  })
})
