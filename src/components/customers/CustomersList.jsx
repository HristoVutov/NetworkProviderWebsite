import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Stack,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  TextField,
  PrimaryButton,
  DefaultButton,
  Dropdown,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  SearchBox,
  Text,
  IconButton,
  mergeStyleSets,
  getTheme,
  Checkbox,
  CommandButton,
  Dialog,
  DialogType,
  DialogFooter
} from '@fluentui/react';
import Header from "../common/Header";
import EditMarkerModal from "../provider/EditMarkerModal";
import { loadGoogleMapsApi, mapInitRegistry } from "../provider/mapUtils";

const theme = getTheme();

// Styles for the component
const styles = mergeStyleSets({
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '15px',
  },
  controlsContainer: {
    padding: '15px',
    backgroundColor: theme.palette.neutralLighter,
    borderRadius: '2px',
    marginBottom: '15px',
  },
  tableContainer: {
    boxShadow: theme.effects.elevation4,
    backgroundColor: 'white',
    borderRadius: '2px',
    marginBottom: '15px',
  },
  searchBox: {
    width: '300px',
    marginBottom: '10px',
  },
  pagination: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
  }
});

// Status options for filtering
const statusOptions = [
  { key: '', text: 'All' },
  { key: 'Running', text: 'Running' },
  { key: 'Stopped', text: 'Stopped' },
  { key: 'Unknown', text: 'Unknown' },
];

const CustomersList = () => {
  // State for data, loading, and error
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    searchText: '',
    status: '',
    firstPoint: false,
    lastPoint: false,
  });
  
  // Sorting state
  const [sortBy, setSortBy] = useState('Name:asc');
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customers data from API
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query params for API request
      const params = new URLSearchParams();
      params.append('page', pagination.currentPage);
      params.append('limit', pagination.pageSize);
      
      // Add sort parameters
      if (sortBy) {
        params.append('sort', sortBy);
      }
      
      // Add filters
      if (filters.searchText) {
        params.append('searchText', filters.searchText);
      }
      
      if (filters.status) {
        params.append('Status', filters.status);
      }
      
      if (filters.firstPoint) {
        params.append('FirstPoint', 'true');
      }
      
      if (filters.lastPoint) {
        params.append('LastPoint', 'true');
      }
      
      // Make the API request
      const response = await axios.get(`http://localhost:3001/api/point/list?${params.toString()}`);
      
      // Update state with response data
      if (response.data.success) {
        setCustomers(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'An error occurred while fetching customers');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, sortBy, filters]);

  // Handle closing the edit modal
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  }, []);

  // Handle provider update from the modal
  const handleProviderUpdate = useCallback((updatedProvider) => {
    // Show success message
    setSuccessMessage('Customer updated successfully');
    
    // Hide the success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    
    // Refresh the data
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle edit customer
  const handleEdit = useCallback((customer) => {
    if (!isMapLoaded) {
      setError("Please wait for the map to load");
      return;
    }

    // Format the customer data to match what EditMarkerModal expects
    const formattedCustomer = {
      id: customer._id,
      name: customer.Name,
      address: customer.Address,
      zone: customer.Zone,
      phone1: customer.Phone1,
      phone2: customer.Phone2,
      ip: customer.IP,
      status: customer.Status,
      lat: parseFloat(customer.Lat),
      lng: parseFloat(customer.Lng),
      providerId: customer.Provider,
      previousPoint: customer.PreviousPoint
    };
    
    // Set the selected customer and open the modal
    setSelectedCustomer(formattedCustomer);
    setIsEditModalOpen(true);
  }, [isMapLoaded]);

  // Initialize Google Maps
  useEffect(() => {
    // Load Google Maps API
    loadGoogleMapsApi((error) => {
      if (error) {
        setError("Failed to load Google Maps: " + error.message);
      } else {
        setIsMapLoaded(true);
      }
    });

    // Cleanup
    return () => {
      // Clean up global initialization function
      window.initGoogleMaps = null;
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle search text change
  const handleSearchChange = (event, newValue) => {
    setFilters(prev => ({ ...prev, searchText: newValue }));
  };

  // Handle status filter change
  const handleStatusChange = (event, option) => {
    setFilters(prev => ({ ...prev, status: option.key }));
  };

  // Handle checkbox filter changes
  const handleCheckboxChange = (name) => (ev, checked) => {
    setFilters(prev => ({ ...prev, [name]: checked }));
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    // Reset to first page when applying filters
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchCustomers();
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setFilters({
      searchText: '',
      status: '',
      firstPoint: false,
      lastPoint: false,
    });
    
    // Reset to first page
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Fetch data without filters
    fetchCustomers();
  };

  // Handle sorting columns
  const handleSort = (column) => {
    // Toggle sort direction or set to ascending by default
    const newSortBy = sortBy === `${column}:asc` 
      ? `${column}:desc` 
      : `${column}:asc`;
    
    setSortBy(newSortBy);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Handle view on map
  const handleViewOnMap = (customer) => {
    // Navigate to map view centered on this customer
    if (customer.Lat && customer.Lng) {
      window.location.href = `/provider-map?lat=${customer.Lat}&lng=${customer.Lng}`;
    }
  };

  // Columns for the DetailsList
  const columns = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'Name',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      onRender: (item) => <span>{item.Name}</span>,
      isSorted: sortBy.startsWith('Name'),
      isSortedDescending: sortBy === 'Name:desc',
      onColumnClick: () => handleSort('Name'),
    },
    {
      key: 'address',
      name: 'Address',
      fieldName: 'Address',
      minWidth: 150,
      maxWidth: 300,
      isResizable: true,
      onRender: (item) => <span>{item.Address || 'N/A'}</span>,
      isSorted: sortBy.startsWith('Address'),
      isSortedDescending: sortBy === 'Address:desc',
      onColumnClick: () => handleSort('Address'),
    },
    {
      key: 'zone',
      name: 'Zone',
      fieldName: 'Zone',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      onRender: (item) => <span>{item.Zone || 'N/A'}</span>,
      isSorted: sortBy.startsWith('Zone'),
      isSortedDescending: sortBy === 'Zone:desc',
      onColumnClick: () => handleSort('Zone'),
    },
    {
      key: 'phone1',
      name: 'Phone 1',
      fieldName: 'Phone1',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      onRender: (item) => <span>{item.Phone1 || 'N/A'}</span>,
    },
    {
      key: 'phone2',
      name: 'Phone 2',
      fieldName: 'Phone2',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      onRender: (item) => <span>{item.Phone2 || 'N/A'}</span>,
    },
    {
      key: 'ip',
      name: 'IP Address',
      fieldName: 'IP',
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item) => <span>{item.IP || 'N/A'}</span>,
      isSorted: sortBy.startsWith('IP'),
      isSortedDescending: sortBy === 'IP:desc',
      onColumnClick: () => handleSort('IP'),
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'Status',
      minWidth: 100,
      maxWidth: 100,
      isResizable: true,
      onRender: (item) => (
        <span style={{ 
          color: item.Status === 'Running' ? 'green' : 
                 item.Status === 'Stopped' ? 'red' : 'gray'
        }}>
          {item.Status || 'Unknown'}
        </span>
      ),
      isSorted: sortBy.startsWith('Status'),
      isSortedDescending: sortBy === 'Status:desc',
      onColumnClick: () => handleSort('Status'),
    },
    {
      key: 'location',
      name: 'Location',
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item) => (
        <span>
          {item.Lat && item.Lng 
            ? `${parseFloat(item.Lat).toFixed(4)}, ${parseFloat(item.Lng).toFixed(4)}` 
            : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      name: 'Actions',
      minWidth: 100,
      maxWidth: 100,
      onRender: (item) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <IconButton
            iconProps={{ iconName: 'Edit' }}
            title="Edit"
            ariaLabel="Edit"
            onClick={() => handleEdit(item)}
          />
          <IconButton
            iconProps={{ iconName: 'MapPin' }}
            title="View on Map"
            ariaLabel="View on Map"
            onClick={() => handleViewOnMap(item)}
          />
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div className={styles.container}>
        <Stack className={styles.header}>
          <Text variant="xxLarge">Customers</Text>
          <Text variant="medium">Manage your customer list</Text>
          {!isMapLoaded && (
            <MessageBar messageBarType={MessageBarType.info}>
              Loading map components... Some features will be available once loaded.
            </MessageBar>
          )}
        </Stack>
        
        {/* Filter controls */}
        <Stack className={styles.controlsContainer}>
          <Stack horizontal wrap tokens={{ childrenGap: 16 }}>
            <Stack.Item grow={3}>
              <SearchBox
                placeholder="Search by name, address, zone, phone, IP..."
                className={styles.searchBox}
                value={filters.searchText}
                onChange={handleSearchChange}
                onSearch={() => handleApplyFilters()}
              />
            </Stack.Item>
            
            <Stack.Item grow={1}>
              <Dropdown
                label="Status"
                selectedKey={filters.status}
                options={statusOptions}
                onChange={handleStatusChange}
              />
            </Stack.Item>
            
            <Stack.Item align="end">
              <Stack tokens={{ childrenGap: 8 }}>
                <Checkbox 
                  label="First Point" 
                  checked={filters.firstPoint} 
                  onChange={handleCheckboxChange('firstPoint')} 
                />
                <Checkbox 
                  label="Last Point" 
                  checked={filters.lastPoint} 
                  onChange={handleCheckboxChange('lastPoint')} 
                />
              </Stack>
            </Stack.Item>
          </Stack>
          
          <Stack horizontal tokens={{ childrenGap: 10 }} style={{ marginTop: '16px' }}>
            <PrimaryButton text="Apply Filters" onClick={handleApplyFilters} />
            <DefaultButton text="Clear Filters" onClick={handleClearFilters} />
          </Stack>
        </Stack>
        
        {/* Error message */}
        {error && (
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            onDismiss={() => setError(null)}
            dismissButtonAriaLabel="Close"
            style={{ marginBottom: '15px' }}
          >
            {error}
          </MessageBar>
        )}
        
        {/* Success message */}
        {successMessage && (
          <MessageBar
            messageBarType={MessageBarType.success}
            isMultiline={false}
            onDismiss={() => setSuccessMessage(null)}
            dismissButtonAriaLabel="Close"
            style={{ marginBottom: '15px' }}
          >
            {successMessage}
          </MessageBar>
        )}
        
        {/* Table of customers */}
        <div className={styles.tableContainer}>
          {isLoading ? (
            <Stack horizontalAlign="center" style={{ padding: '40px' }}>
              <Spinner size={SpinnerSize.large} label="Loading customers..." />
            </Stack>
          ) : customers.length === 0 ? (
            <Stack horizontalAlign="center" style={{ padding: '40px' }}>
              <Text>No customers found. Try adjusting your filters.</Text>
            </Stack>
          ) : (
            <DetailsList
              items={customers}
              columns={columns}
              selectionMode={SelectionMode.none}
              layoutMode={DetailsListLayoutMode.justified}
              isHeaderVisible={true}
            />
          )}
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <Stack horizontal tokens={{ childrenGap: 8 }} horizontalAlign="center">
              <CommandButton
                iconProps={{ iconName: 'DoubleChevronLeft' }}
                text="First"
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrev}
                ariaLabel="First page"
              />
              <CommandButton
                iconProps={{ iconName: 'ChevronLeft' }}
                text="Previous"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                ariaLabel="Previous page"
              />
              
              {/* Page number indicators */}
              <Stack horizontal tokens={{ childrenGap: 4 }} verticalAlign="center">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, index) => {
                  // Create a simple pager with 5 buttons max
                  const pageOffset = pagination.currentPage > 3 ? pagination.currentPage - 3 : 0;
                  const visiblePageNum = index + 1 + pageOffset;
                  
                  // Don't show page numbers beyond the total
                  if (visiblePageNum > pagination.totalPages) return null;
                  
                  return (
                    <DefaultButton
                      key={visiblePageNum}
                      text={visiblePageNum.toString()}
                      primary={visiblePageNum === pagination.currentPage}
                      onClick={() => handlePageChange(visiblePageNum)}
                      styles={{
                        root: {
                          minWidth: '32px',
                          padding: '0px',
                          margin: '0 2px'
                        }
                      }}
                    />
                  );
                })}
                
                {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                  <Text style={{ margin: '0 4px' }}>...</Text>
                )}
                
                {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 1 && (
                  <DefaultButton
                    text={pagination.totalPages.toString()}
                    onClick={() => handlePageChange(pagination.totalPages)}
                    styles={{
                      root: {
                        minWidth: '32px',
                        padding: '0px',
                        margin: '0 2px'
                      }
                    }}
                  />
                )}
              </Stack>

              <CommandButton
                iconProps={{ iconName: 'ChevronRight' }}
                text="Next"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                ariaLabel="Next page"
              />
              <CommandButton
                iconProps={{ iconName: 'DoubleChevronRight' }}
                text="Last"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNext}
                ariaLabel="Last page"
              />
            </Stack>
          </div>
        )}
        
        {/* Summary */}
        <Stack horizontal horizontalAlign="space-between">
          <Text>
            Showing {customers.length} of {pagination.totalItems} customers
          </Text>
          <Text>
            Page {pagination.currentPage} of {pagination.totalPages}
          </Text>
        </Stack>
      </div>
      
      {/* Edit Modal */}
      {isEditModalOpen && selectedCustomer && (
        <EditMarkerModal
          isOpen={isEditModalOpen}
          onDismiss={handleCloseEditModal}
          provider={selectedCustomer}
          onUpdate={handleProviderUpdate}
        />
      )}
    </>
  );
};

export default CustomersList;