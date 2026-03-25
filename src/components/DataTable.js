import React from 'react';
import './DataTable.css';

const DataTable = ({ columns, data, pagination, onPageChange, onSearch, searchValue, actions, title, headerActions }) => {
  return (
    <div className="data-table-wrapper">
      <div className="table-header">
        <h3>{title}</h3>
        <div className="table-actions">
          {onSearch && (
            <input type="text" placeholder="Search..." value={searchValue || ''} onChange={e => onSearch(e.target.value)} className="search-input" />
          )}
          {headerActions}
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>{columns.map((col, i) => <th key={i}>{col.header}</th>)}</tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? data.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((col, j) => (
                  <td key={j}>{col.render ? col.render(row, i) : row[col.key]}</td>
                ))}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} className="no-data">No data found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="pagination">
          <span className="page-info">
            Showing {pagination.start} to {pagination.end} of {pagination.totalRecords} entries
          </span>
          <div className="page-buttons">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button key={i + 1} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                onClick={() => onPageChange(i + 1)}>{i + 1}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
