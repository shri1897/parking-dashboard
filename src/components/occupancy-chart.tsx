import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { type FilterValues } from './dashboard-filters'
import { lotsData, occupancyData } from '../services/data-service'

interface OccupancyChartProps {
  filters: FilterValues
}

interface AlertPoint {
  time: string
  value: number
  lotName?: string
  changePercent: number
  alertType: 'increase' | 'decrease'
}

// Function to detect occupancy alerts (>20% change in 15 minutes)
function detectOccupancyAlerts(data: any[]): AlertPoint[] {
  const alerts: AlertPoint[] = []
  
  if (!data || data.length < 2) return alerts
  
  // Sort data by timestamp, filtering out invalid entries first
  const sortedData = [...data]
    .filter(item => item && item.ts && typeof item.occupied === 'number')
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
  
  if (sortedData.length < 2) return alerts
  
  for (let i = 1; i < sortedData.length; i++) {
    const current = sortedData[i]
    const previous = sortedData[i - 1]
    
    const currentTime = new Date(current.ts)
    const previousTime = new Date(previous.ts)
    
    // Check if within 15 minutes (900,000 milliseconds)
    const timeDiff = currentTime.getTime() - previousTime.getTime()
    if (timeDiff <= 900000 && timeDiff > 0) { // Within 15 minutes but not same time
      const currentOccupancy = current.occupied
      const previousOccupancy = previous.occupied
      
      // Only calculate if previous occupancy is greater than 0 to avoid division by zero
      // and if there's an actual difference
      if (previousOccupancy > 0 && currentOccupancy !== previousOccupancy) {
        const changePercent = ((currentOccupancy - previousOccupancy) / previousOccupancy) * 100
        
        if (Math.abs(changePercent) >= 20) {
          alerts.push({
            time: format(parseISO(current.ts), 'p'),
            value: currentOccupancy,
            lotName: current.lotName || current.lotId || 'Unknown',
            changePercent: Math.round(changePercent),
            alertType: changePercent > 0 ? 'increase' : 'decrease'
          })
        }
      }
    }
  }
  
  return alerts
}

export function OccupancyChart({ filters }: OccupancyChartProps) {
  const { chartData, alerts } = useMemo(() => {
    const lots = lotsData
    const occupancy = occupancyData
    
    // Validate input data
    if (!lots || !occupancy || !Array.isArray(occupancy)) {
      return { chartData: [], alerts: [] }
    }
    
    // Filter data based on current filters
    let filteredData = occupancy.filter((item) => {
      // Validate item structure
      if (!item || !item.lotId || !item.ts || typeof item.occupied !== 'number') {
        return false
      }
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
    
    // Group data by timestamp for multi-lot view
    if (filters.lotId === 'all') {
      const groupedByTime = filteredData.reduce((acc, item) => {
        const timeKey = item.ts
        if (!acc[timeKey]) {
          acc[timeKey] = {
            time: format(parseISO(item.ts), 'p'),
            fullTime: item.ts,
            UnionGarage: 0,
            DowntownCentral: 0,
            RiversideLot: 0,
          }
        }
        
        // Find lot info
        const lot = lots.find(l => l.lotId === item.lotId)
        const lotName = lot ? lot.name.replace(/\s+/g, '') : item.lotId
        
        // Map lotId to standard names
        const nameMap: Record<string, string> = {
          'L1': 'UnionGarage',
          'L2': 'DowntownCentral', 
          'L3': 'RiversideLot'
        }
        
        const standardName = nameMap[item.lotId] || lotName
        acc[timeKey][standardName] = item.occupied || 0
        return acc
      }, {} as Record<string, any>)
      
      const processedData = Object.values(groupedByTime)
        .filter((item: any) => item && item.fullTime)
        .sort((a: any, b: any) => 
          new Date(a.fullTime).getTime() - new Date(b.fullTime).getTime()
        )
      
      // Detect alerts for multi-lot view - process each lot separately
      const alertsData: AlertPoint[] = []
      const lotIds = ['L1', 'L2', 'L3']
      
      lotIds.forEach(lotId => {
        // Filter data for this specific lot with all applied filters
        const lotData = filteredData.filter(item => item.lotId === lotId)
        if (lotData.length > 1) {
          const lotAlerts = detectOccupancyAlerts(lotData)
          alertsData.push(...lotAlerts)
        }
      })
      
      return { chartData: processedData, alerts: alertsData }
    } else {
      // Single lot view
      const processedData = filteredData
        .filter(item => item && item.ts && typeof item.occupied === 'number')
        .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
        .map(item => ({
          time: format(parseISO(item.ts), 'p'),
          occupied: item.occupied || 0,
          fullTime: item.ts,
        }))
      
      // Detect alerts for single lot view - use original filtered data, not processed data
      const alertsData = detectOccupancyAlerts(filteredData)
      
      return { chartData: processedData, alerts: alertsData }
    }
  }, [filters])

  const getColors = () => {
    if (filters.lotId === 'all') {
      return {
        UnionGarage: '#8884d8',
        DowntownCentral: '#82ca9d', 
        RiversideLot: '#ffc658',
      }
    }
    return { occupied: '#8884d8' }
  }

  const colors = getColors()
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Check if there's an alert at this time
      const alertAtTime = alerts.find(alert => alert.time === label)
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'occupied' ? 'Occupied' : entry.dataKey}: ${entry.value}`}
            </p>
          ))}
          {alertAtTime && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Alert: {alertAtTime.changePercent > 0 ? '+' : ''}{alertAtTime.changePercent}% change
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300">
                Significant occupancy {alertAtTime.alertType} detected
              </p>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  console.log('Alerts detected:', alerts)
  console.log('Chart data:', chartData)
  console.log('Current filters:', filters)

  // Custom Alert Dot Component
  const AlertDot = ({ cx, cy, payload }: any) => {
    const alertAtTime = alerts.find(alert => alert.time === payload.time)
    if (!alertAtTime) return null
    
    const color = alertAtTime.alertType === 'increase' ? '#ef4444' : '#f59e0b' // red for increase, amber for decrease
    
    return (
      <g>
        {/* Outer glow circle */}
        <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.2} />
        {/* Main alert circle */}
        <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
        {/* Alert symbol */}
        <text x={cx} y={cy + 1} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">
          !
        </text>
      </g>
    )
  }

  // Safety check for chart data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">No data available for the selected filters</p>
          <p className="text-xs mt-1">Try adjusting your filter criteria</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10 }}
            tickLine={{ stroke: '#ccc' }}
            height={80}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#ccc' }}
            label={{ value: 'Vehicles', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {filters.lotId === 'all' ? (
            <>
              <Legend />
              <Area
                type="monotone"
                dataKey="UnionGarage"
                stackId="1"
                stroke={colors.UnionGarage}
                fill={colors.UnionGarage}
                fillOpacity={0.6}
                name="Union Garage"
                dot={<AlertDot />}
              />
              <Area
                type="monotone"
                dataKey="DowntownCentral"
                stackId="1"
                stroke={colors.DowntownCentral}
                fill={colors.DowntownCentral}
                fillOpacity={0.6}
                name="Downtown Central"
                dot={<AlertDot />}
              />
              <Area
                type="monotone"
                dataKey="RiversideLot"
                stackId="1"
                stroke={colors.RiversideLot}
                fill={colors.RiversideLot}
                fillOpacity={0.6}
                name="Riverside Lot"
                dot={<AlertDot />}
              />
            </>
          ) : (
            <Area
              type="monotone"
              dataKey="occupied"
              stroke={colors.occupied}
              fill={colors.occupied}
              fillOpacity={0.6}
              dot={<AlertDot />}
            />
          )}
          
          {/* Render alert dots as ReferenceDots */}
          {alerts.map((alert, index) => (
            <ReferenceDot
              key={`alert-${index}`}
              x={alert.time}
              y={alert.value}
              r={6}
              fill={alert.alertType === 'increase' ? '#ef4444' : '#f59e0b'}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
