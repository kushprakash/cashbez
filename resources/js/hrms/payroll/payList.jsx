import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import { toast, ToastContainer } from 'react-toastify';
import Pageheader from '../../layouts/Pageheader';
import DataTable from '../../pages/components/DataTable';
import TableShimmerLoader from '../../pages/components/TableShimmerLoader';

const PayList = () => {
  const [loading, setLoading] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    employee: ''
  });

  const apiService = ApiService();

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, []);

  // Fetch payslips when filters change
  useEffect(() => {
    fetchPayslips();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      const res = await apiService.vGet('/api/employees', true, true);
      if (res.data) {
        // Handle different response formats
        if (Array.isArray(res.data)) {
          setEmployees(res.data);
        } else if (res.data.data && Array.isArray(res.data.data)) {
          setEmployees(res.data.data);
        } else if (res.data.status === 1 && Array.isArray(res.data.data)) {
          setEmployees(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      // Build query parameters for filtering
      const params = new URLSearchParams();
      
      if (filters.month) {
        params.append('month', filters.month);
      }
      
      if (filters.year) {
        params.append('year', filters.year);
      }
      
      if (filters.employee) {
        params.append('employee', filters.employee);
      }

      const url = `/api/payslip/list${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await apiService.vGet(url, true, true);
      
      if (res.data && res.data.status === 1) {
        // Add computed period field for CSV export
        const processedData = res.data.data.map(payslip => ({
          ...payslip,
          period: `${getMonthName(payslip.month)} ${payslip.year}`
        }));
        setPayslips(processedData);
      } else {
        const errorMessage = res.data?.message || 'Failed to fetch payslips';
        toast.error(errorMessage);
        console.error('Payslips fetch error:', res.data);
        setPayslips([]);
      }
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Failed to fetch payslips');
      setPayslips([]);
    }
    setLoading(false);
  };

  // Remove the applyFilters function as filtering now happens in backend

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      month: '',
      year: '',
      employee: ''
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  };

  // Get unique years from payslips for year filter - now get from all data
  const getUniqueYears = () => {
    // Generate a range of years for the dropdown instead of relying on current data
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5; // 5 years back
    const endYear = currentYear + 1; // 1 year forward
    
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
  };

  // Define columns for DataTable
  const columns = [
    {
      Header: 'ID',
      accessor: 'id',
      Cell: ({ value }) => (
        <span className="badge bg-secondary">#{value}</span>
      ),
    },
    {
      Header: 'Employee',
      accessor: 'employee_name',
      Cell: ({ value }) => (
        <strong>{value || 'Unknown'}</strong>
      ),
    },
    {
      Header: 'Period',
      accessor: 'period',
      Cell: ({ row }) => {
        const period = `${getMonthName(row.original.month)} ${row.original.year}`;
        return <span className="text-muted">{period}</span>;
      },
    },
    {
      Header: 'Net Salary',
      accessor: 'net_salary',
      Cell: ({ value }) => (
        <span className="text-success fw-bold">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      Header: 'Created Date',
      accessor: 'created_at',
      Cell: ({ value }) => (
        <small className="text-muted">
          {formatDate(value)}
        </small>
      ),
    },
    {
      Header: 'Actions',
      accessor: 'action',
      disableSortBy: true,
      Cell: ({ row }) => (
        <div className="btn-group" role="group">
          <Link 
            to={`/hrms/payroll/payslip/${row.original.id}`}
            className="btn btn-info btn-sm"
            title="View Payslip"
          >
            <i className="fa fa-eye"></i> View
          </Link>
         
        </div>
      ),
    },
  ];

  return (
    <>
      <ToastContainer />
      <Pageheader mainheading="Payroll Management" parentfolder="Payroll" activepage="Payslip List" />
      <div className="page-content-box">
        <div className="page-content-box-inner">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Payslip List</h5>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={fetchPayslips}
                    disabled={loading}
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {/* Filters Section */}
                <div className="card-body border-bottom">
                  <div className="row">
                    <div className="col-md-3">
                      <label className="form-label">Month</label>
                      <select
                        name="month"
                        value={filters.month}
                        onChange={handleFilterChange}
                        className="form-control"
                      >
                        <option value="">All Months</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                          <option key={month} value={month}>
                            {getMonthName(month)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Year</label>
                      <select
                        name="year"
                        value={filters.year}
                        onChange={handleFilterChange}
                        className="form-control"
                      >
                        <option value="">All Years</option>
                        {getUniqueYears().map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Employee</label>
                      <input
                        type="text"
                        name="employee"
                        value={filters.employee}
                        onChange={handleFilterChange}
                        placeholder="Search by employee name..."
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button 
                        className="btn btn-outline-secondary w-100"
                        onClick={clearFilters}
                      >
                        <i className="fa fa-refresh me-1"></i>Clear
                      </button>
                    </div>
                  </div>
                  
                  {/* Filter Summary */}
                  {(filters.month || filters.year || filters.employee) && (
                    <div className="mt-3">
                      <div className="alert alert-info py-2">
                        <small>
                          <strong>Active Filters:</strong>
                          {filters.month && ` Month: ${getMonthName(parseInt(filters.month))}`}
                          {filters.year && ` Year: ${filters.year}`}
                          {filters.employee && ` Employee: "${filters.employee}"`}
                          <span className="ms-2">({payslips.length} records found)</span>
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-body">
                  {loading ? (
                    <TableShimmerLoader columns={6} rows={8} />
                  ) : (
                    <DataTable
                      columns={columns}
                      data={payslips}
                      title="Payslips"
                      noDataText="No payslips found matching the current filters."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {payslips.length > 0 && (
            <div className="row mt-4">
              <div className="col-md-4">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Total Payslips</h6>
                        <h3 className="mb-0">{payslips.length}</h3>
                      </div>
                      <div>
                        <i className="fa fa-file-text fa-2x opacity-75"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Total Amount</h6>
                        <h3 className="mb-0">
                          {formatCurrency(
                            payslips.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0)
                          )}
                        </h3>
                      </div>
                      <div>
                        <i className="fa fa-money fa-2x opacity-75"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title">Unique Employees</h6>
                        <h3 className="mb-0">
                          {new Set(payslips.map(p => p.employee_name)).size}
                        </h3>
                      </div>
                      <div>
                        <i className="fa fa-users fa-2x opacity-75"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PayList;
