import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Download,
  Car,
  MapPin,
} from "lucide-react"
import { DashboardFilters, type FilterValues } from "./dashboard-filters"
import { OccupancyChart } from "./occupancy-chart"
import { useParkingData } from "../hooks/use-parking-data"

export function DashboardContent() {
  const [filters, setFilters] = React.useState<FilterValues>({
    lotId: "all",
    dateRange: { from: undefined, to: undefined },
    vehicleType: "all",
  })

  const { metrics, lotStatus, exportData } = useParkingData(filters)

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
    console.log("Filters updated:", newFilters)
  }
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Parking Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <DashboardFilters filters={filters} onFiltersChange={handleFiltersChange} />
      
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Capacity
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalCapacity}</div>
                <p className="text-xs text-muted-foreground">
                  Across {filters.lotId === 'all' ? '3' : '1'} parking lot{filters.lotId === 'all' ? 's' : ''}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Occupancy
                </CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.currentOccupancy}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.occupancyRate.toFixed(1)}% occupancy rate
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Occupancy Trends</CardTitle>
              <CardDescription>
                Real-time parking occupancy across all lots
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <OccupancyChart filters={filters} />
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Lot Status</CardTitle>
                <CardDescription>
                  Current status of all parking lots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {lotStatus.map((lot) => {
                    const statusColors = {
                      good: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-400', badge: 'text-green-600' },
                      warning: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600 dark:text-yellow-400', badge: 'text-yellow-600' },
                      critical: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-400', badge: 'text-red-600' }
                    }
                    const colors = statusColors[lot.status as keyof typeof statusColors]
                    
                    return (
                      <div key={lot.lotId} className="flex items-center">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${colors.bg}`}>
                          <MapPin className={`h-4 w-4 ${colors.text}`} />
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {lot.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lot.occupied}/{lot.capacity} occupied
                          </p>
                        </div>
                        <div className="ml-auto">
                          <Badge variant="outline" className={colors.badge}>
                            {lot.occupancyRate.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
    </div>
  )
}
