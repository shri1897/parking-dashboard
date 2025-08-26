import { format, parseISO } from 'date-fns'

export interface ExportData {
  lotId: string
  lotName: string
  timestamp: string
  date: string
  time: string
  occupied: number
  vehicleType: string
  capacity?: number
  occupancyRate?: number
}

export function exportToCSV(data: ExportData[], filename: string = 'parking-data') {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Define CSV headers
  const headers = [
    'Lot ID',
    'Lot Name', 
    'Date',
    'Time',
    'Occupied Vehicles',
    'Vehicle Type',
    'Capacity',
    'Occupancy Rate (%)',
    'Full Timestamp'
  ]

  // Convert data to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => [
      row.lotId,
      `"${row.lotName}"`, // Quoted to handle spaces
      row.date,
      row.time,
      row.occupied,
      row.vehicleType,
      row.capacity || '',
      row.occupancyRate ? `${row.occupancyRate.toFixed(2)}%` : '',
      `"${row.timestamp}"` // Quoted to handle special characters
    ].join(','))
  ]

  // Create CSV content
  const csvContent = csvRows.join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function prepareExportData(
  occupancyData: any[], 
  lotsData: any[], 
  _filters?: any
): ExportData[] {
  return occupancyData.map(item => {
    const lot = lotsData.find(l => l.lotId === item.lotId)
    const lotName = lot ? lot.name : item.lotId
    const capacity = lot ? lot.capacity : undefined
    const occupancyRate = capacity ? (item.occupied / capacity) * 100 : undefined
    
    const parsedDate = parseISO(item.ts)
    
    return {
      lotId: item.lotId,
      lotName,
      timestamp: item.ts,
      date: format(parsedDate, 'yyyy-MM-dd'),
      time: format(parsedDate, 'HH:mm:ss'),
      occupied: item.occupied,
      vehicleType: item.vehicleType,
      capacity,
      occupancyRate
    }
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export function getExportSummary(data: ExportData[], filters: any) {
  const totalRecords = data.length
  const lotNames = [...new Set(data.map(d => d.lotName))].join(', ')
  const dateRange = data.length > 0 ? {
    from: data[0].date,
    to: data[data.length - 1].date
  } : null
  const vehicleTypes = [...new Set(data.map(d => d.vehicleType))].join(', ')
  
  return {
    totalRecords,
    lotNames,
    dateRange,
    vehicleTypes,
    filters: {
      lot: filters.lotId === 'all' ? 'All Lots' : filters.lotId,
      vehicleType: filters.vehicleType === 'all' ? 'All Vehicle Types' : filters.vehicleType,
      dateRange: filters.dateRange.from && filters.dateRange.to 
        ? `${format(filters.dateRange.from, 'yyyy-MM-dd')} to ${format(filters.dateRange.to, 'yyyy-MM-dd')}`
        : 'All Dates'
    }
  }
}
