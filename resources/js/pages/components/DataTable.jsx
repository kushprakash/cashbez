import React, { useState, useMemo } from 'react';
import { useTable, usePagination, useGlobalFilter, useSortBy } from 'react-table';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
jsPDF.autoTable = autoTable;

// Custom global filter to search all columns
function globalTextFilter(rows, columnIds, filterValue) {
  if (!filterValue) return rows;
  if (!Array.isArray(rows)) return [];
  if (!Array.isArray(columnIds)) return rows;

  const lowerFilter = String(filterValue || '').toLowerCase();
  return rows.filter(row => {
    return columnIds.some((id) => {
      // Skip SN and Action columns (by accessor)
      if (id === 'sn' || id === 'action') return false;

      let value = row.values && row.values[id];

      // If value is not in row.values, try row.original
      if (value === undefined && row.original && row.original[id] !== undefined) {
        value = row.original[id];
      }

      return value !== undefined && value !== null && String(value || '').toLowerCase().includes(lowerFilter);
    });
  });
}

const DataTable = ({ columns, data = [], title = 'Data Table', showPagination = true }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    rows, // Destructure rows to use when pagination is disabled
    prepareRow,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: Array.isArray(data) ? data : [],
      initialState: { pageIndex: 0, pageSize: 10 },
      globalFilter: globalTextFilter,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(title, 14, 10);
    // Filter out columns like 'action' for export
    const exportColumns = columns.filter(col => col.accessor !== 'action' && col.id !== 'actions');
    // Prepare table head
    const head = [exportColumns.map(col => col.Header)];
    // Prepare table body: use all data, not just current page
    const body = data.map((rowData, rowIndex) => {
      return exportColumns.map(col => {
        let value = rowData[col.accessor];

        // Use exportFormatter if available
        if (col.exportFormatter) {
          return String(col.exportFormatter(rowData) || '');
        }

        // If custom Cell renderer exists, use its output for export
        if (typeof col.Cell === 'function' && col.Cell.name !== 'defaultRenderer') {
          try {
            // Simulate the cell rendering for export
            value = col.Cell({
              value: rowData[col.accessor],
              row: { original: rowData, index: rowIndex, values: rowData },
              column: col,
              data: rowData,
            });
            // If the value is a React element, get its string representation
            if (typeof value === 'object' && value !== null && value.props) {
              value = value.props.children || '';
              // Handle array of children
              if (Array.isArray(value)) {
                value = value.map(item => {
                  if (typeof item === 'string') return item;
                  if (item?.props?.children) return item.props.children;
                  return '';
                }).join(' ');
              }
            }
          } catch {
            value = rowData[col.accessor];
          }
        }
        // Fallback to empty string if value is still undefined/null
        return value !== undefined && value !== null ? String(value || '') : '';
      });
    });
    doc.autoTable({
      head,
      body,
    });
    doc.save(`${title}.pdf`);
  };

  // CSV Export Data Processing
  const csvData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((rowData, rowIndex) => {
      const csvRow = {};
      columns.forEach(col => {
        // Skip action columns or columns without accessor/id
        if (col.id === 'actions' || col.accessor === 'action' || (!col.accessor && !col.id)) {
          return;
        }

        const key = col.accessor || col.id;
        let value = rowData[key];

        // Use exportFormatter if available
        if (col.exportFormatter) {
          value = col.exportFormatter(rowData);
        }
        // Handle custom Cell renderers only if no formatter
        else if (typeof col.Cell === 'function' && col.Cell.name !== 'defaultRenderer') {
          try {
            // Simulate the cell rendering for export
            const cellValue = col.Cell({
              value: rowData[key],
              row: { original: rowData, index: rowIndex, values: rowData },
              column: col,
              data: rowData,
            });

            // If the value is a React element, try to extract text content
            if (typeof cellValue === 'object' && cellValue !== null && cellValue.props) {
              value = cellValue.props.children || cellValue.props.title || '';
              // Handle array of children
              if (Array.isArray(value)) {
                value = value.map(item => {
                  if (typeof item === 'string') return item;
                  if (item?.props?.children) return item.props.children;
                  return '';
                }).join(' ');
              }
            } else if (typeof cellValue === 'string' || typeof cellValue === 'number') {
              value = cellValue;
            }
          } catch {
            value = rowData[key];
          }
        }

        // Ensure value is a string and handle null/undefined
        csvRow[col.Header || key] = value !== undefined && value !== null ? String(value) : '';
      });
      return csvRow;
    });
  }, [data, columns]);

  const csvHeaders = useMemo(() => {
    return columns
      .filter(col => col.id !== 'actions' && col.accessor !== 'action' && (col.accessor || col.id))
      .map(col => ({
        label: col.Header || col.accessor || col.id,
        key: col.Header || col.accessor || col.id
      }));
  }, [columns]);

  // Print
  const printTable = () => {
    const printContentElem = document.getElementById('print-table');
    if (!printContentElem) return;
    const printContent = printContentElem.innerHTML;
    const win = window.open('', '', 'height=700,width=900');
    win.document.write('<html><head><title>Print Table</title>');
    win.document.write('</head><body >');
    win.document.write(printContent);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  const rowsToRender = showPagination ? page : rows;

  return (
    <div>
      <div className="row d-flex justify-content-between align-items-center mb-2">
        <div className='col-md-4 mt-2 align-items-center'>
          <center>
            <input
              value={globalFilter || ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="form-control"
              placeholder="Search..."
              style={{ maxWidth: 300 }}
            />
          </center>
        </div>
        <div className='col-md-4 mt-2 align-items-center'></div>
        <div className='col-md-4 mt-2 align-items-center'>
          <center>
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`${title}.csv`}
              className="btn btn-outline-primary btn-sm me-2"
            >
              CSV Export
            </CSVLink>
            <button className="btn btn-outline-danger btn-sm me-2" onClick={exportPDF}>PDF Export</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={printTable}>Print</button>
          </center>
        </div>
      </div>

      <div id="print-table">
        <table {...getTableProps()} className="table table-hover table-centered mb-0">
          <thead className="table-light">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rowsToRender.length === 0 ? (
              <tr><td colSpan={columns.length}>No data found.</td></tr>
            ) : (
              rowsToRender.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {showPagination && (
        <div className=" row d-flex justify-content-between align-items-center mt-2">

          <div className='col-md-4 mt-2 align-items-center'>
            <center>
              <select
                className="form-select form-select-sm"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                style={{ width: 120 }}
              >
                {[10, 20, 30, 40, 50].map(size => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </center>
          </div>
          <div className='col-md-4 mt-2 align-items-center'></div>
          <div className='col-md-4 mt-2 align-items-center'>
            <center>
              <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</button>
              <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'}</button>
              <span> Page <strong>{pageIndex + 1}</strong> of <strong>{pageCount}</strong> </span>
              <button className="btn btn-sm btn-outline-secondary ms-1" onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</button>
              <button className="btn btn-sm btn-outline-secondary ms-1" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</button>
            </center>
          </div>

        </div>
      )}
    </div>
  );
};

export default DataTable;
