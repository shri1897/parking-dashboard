import { useMemo } from 'react'
import { parseISO } from 'date-fns'
import { type FilterValues } from '../components/dashboard-filters'
import { lotsData, occupancyData, type OccupancyDataPoint } from '../services/data-service'
import { exportToCSV, prepareExportData } from '../utils/export'

export function useParkingData(filters: FilterValues) {
  const data = useMemo(() => {
    const lots = lotsData
    const occupancy = occupancyData
    
    // Filter occupancy data based on filters
    const filteredOccupancy = occupancy.filter((item) => {
      // Filter by lot
      if (filters.lotId && filters.lotId !== 'all' && item.lotId !== filters.lotId) {
        return false
      }
      
      // Filter by vehicle type
      if (filters.vehicleType && filters.vehicleType !== 'all' && item.vehicleType !== filters.vehicleType) {
        return false
      }
      
      // Filter by date range
      if (filters.dateRange.from || filters.dateRange.to) {
        const itemDate = parseISO(item.ts)
        if (filters.dateRange.from && itemDate < filters.dateRange.from) {
          return false
        }
        if (filters.dateRange.to && itemDate > filters.dateRange.to) {
          return false
        }
      }
      
      return true
    })
    
    // Calculate metrics
    const totalCapacity = filters.lotId === 'all' 
      ? lots.reduce((sum, lot) => sum + lot.capacity, 0)
      : lots.find(lot => lot.lotId === filters.lotId)?.capacity || 0
    
    const latestOccupancy = filteredOccupancy.reduce((acc, item) => {
      const existing = acc.find(x => x.lotId === item.lotId)
      if (!existing || parseISO(item.ts) > parseISO(existing.ts)) {
        const index = acc.findIndex(x => x.lotId === item.lotId)
        if (index >= 0) {
          acc[index] = item
        } else {
          acc.push(item)
        }
      }
      return acc
    }, [] as OccupancyDataPoint[])
    
    const currentOccupancy = latestOccupancy.reduce((sum, item) => sum + item.occupied, 0)
    const occupancyRate = totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0
    
    // Lot status data - filter by selected lot
    const filteredLots = filters.lotId === 'all' ? lots : lots.filter(lot => lot.lotId === filters.lotId)
    
    const lotStatus = filteredLots.map(lot => {
      const lotOccupancy = latestOccupancy.find(item => item.lotId === lot.lotId)
      const occupied = lotOccupancy?.occupied || 0
      const rate = (occupied / lot.capacity) * 100
      
      return {
        ...lot,
        occupied,
        occupancyRate: rate,
        status: rate > 90 ? 'critical' : rate > 70 ? 'warning' : 'good'
      }
    })
    
    return {
      lots,
      occupancy: filteredOccupancy,
      metrics: {
        totalCapacity,
        currentOccupancy,
        occupancyRate
      },
      lotStatus
    }
  }, [filters])

  const exportData = () => {
    const exportableData = prepareExportData(data.occupancy, data.lots, filters)
    
    if (exportableData.length === 0) {
      alert('No data available to export with the current filters. Please adjust your filter criteria.')
      return
    }
    
    const filterDescription = filters.lotId === 'all' ? 'all-lots' : filters.lotId
    const vehicleFilter = filters.vehicleType !== 'all' ? `-${filters.vehicleType}` : ''
    const filename = `parking-data-${filterDescription}${vehicleFilter}`
    
    exportToCSV(exportableData, filename)

  }
  
  return {
    ...data,
    exportData
  }
}
