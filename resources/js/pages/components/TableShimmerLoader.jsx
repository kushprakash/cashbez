import React from 'react';
import './TableShimmerLoader.css';

const TableShimmerLoader = ({ rows = 8, columns = 6, className = '' }) => {
  return (
    <div className={`table-shimmer-loader ${className}`}>
      <div className="shimmer-table-wrapper">
        <table className="shimmer-table">
          <thead>
            <tr>
              {[...Array(columns)].map((_, idx) => (
                <th key={idx}>
                  <div className="shimmer shimmer-header" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rIdx) => (
              <tr key={rIdx}>
                {[...Array(columns)].map((_, cIdx) => (
                  <td key={cIdx}>
                    <div className="shimmer shimmer-cell" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableShimmerLoader;
