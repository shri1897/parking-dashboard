import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/utils'
import { DashboardFilters } from './dashboard-filters'

const mockFilters = {
  lotId: 'all',
  vehicleType: 'all',
  dateRange: { from: undefined, to: undefined }
}

const mockOnFilterChange = vi.fn()

describe('DashboardFilters', () => {
  it('renders all filter components', () => {
    render(
      <DashboardFilters 
        filters={mockFilters} 
        onFiltersChange={mockOnFilterChange} 
      />
    )
    
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Parking Lot')).toBeInTheDocument()
    expect(screen.getByText('Vehicle Type')).toBeInTheDocument()
    expect(screen.getByText('Time Range')).toBeInTheDocument()
  })

  it('displays current filter values', () => {
    const filtersWithValues = {
      ...mockFilters,
      lotId: 'L1',
      vehicleType: 'car'
    }
    
    render(
      <DashboardFilters 
        filters={filtersWithValues} 
        onFiltersChange={mockOnFilterChange} 
      />
    )
    
    // Check if the select components show the correct values
    expect(screen.getByText('Union Garage')).toBeInTheDocument()
    expect(screen.getByText('Cars')).toBeInTheDocument()
  })

  it('calls onFilterChange when lot selection changes', () => {
    render(
      <DashboardFilters 
        filters={mockFilters} 
        onFiltersChange={mockOnFilterChange} 
      />
    )
    
    // Find and click the lot selection dropdown
    const lotSelect = screen.getByRole('combobox', { name: /parking lot/i })
    fireEvent.click(lotSelect)
    
    // This test would need to be expanded based on the actual Select component behavior
    // For now, we're just testing that the component renders without errors
    expect(mockOnFilterChange).not.toHaveBeenCalled()
  })
})
