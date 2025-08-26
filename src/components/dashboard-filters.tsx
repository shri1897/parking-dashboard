import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Filter } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export interface FilterValues {
  lotId: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  vehicleType: string
}

interface DashboardFiltersProps {
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
}

const lots = [
  { value: "all", label: "All Lots" },
  { value: "L1", label: "Union Garage" },
  { value: "L2", label: "Downtown Central" },
  { value: "L3", label: "Riverside Lot" },
]

const vehicleTypes = [
  { value: "all", label: "All Vehicle Types" },
  { value: "car", label: "Cars" },
  { value: "truck", label: "Trucks" },
  { value: "motorcycle", label: "Motorcycles" },
  { value: "bus", label: "Buses" },
]

export function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const [date, setDate] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: filters.dateRange.from,
    to: filters.dateRange.to,
  })

  const handleLotChange = (value: string) => {
    onFiltersChange({
      ...filters,
      lotId: value,
    })
  }

  const handleVehicleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      vehicleType: value,
    })
  }

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDate(range)
    onFiltersChange({
      ...filters,
      dateRange: range,
    })
  }

  return (
    <div className="flex flex-col space-y-3 p-3 border rounded-lg bg-card">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4" />
        <h3 className="text-sm font-medium">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Lot Filter */}
        <div className="space-y-1.5">
          <Label htmlFor="lot-select">Parking Lot</Label>
          <Select value={filters.lotId} onValueChange={handleLotChange}>
            <SelectTrigger id="lot-select">
              <SelectValue placeholder="Select a lot" />
            </SelectTrigger>
            <SelectContent>
              {lots.map((lot) => (
                <SelectItem key={lot.value} value={lot.value}>
                  {lot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-1.5">
          <Label>Time Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range) => {
                  if (range) {
                    handleDateRangeChange({
                      from: range.from,
                      to: range.to,
                    })
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Vehicle Type Filter */}
        <div className="space-y-1.5">
          <Label htmlFor="vehicle-select">Vehicle Type</Label>
          <Select value={filters.vehicleType} onValueChange={handleVehicleTypeChange}>
            <SelectTrigger id="vehicle-select">
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const clearedFilters = {
              lotId: "all",
              dateRange: { from: undefined, to: undefined },
              vehicleType: "all",
            }
            setDate({ from: undefined, to: undefined })
            onFiltersChange(clearedFilters)
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  )
}
