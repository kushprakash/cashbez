
import React, { useEffect, useState, useCallback, useContext, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { AuthContext } from '../../core/hooks/context';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ListUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [kycFilters, setKycFilters] = useState([]);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const apiService = ApiService();
  const { userData } = useContext(AuthContext);
  const canManualKyc = userData && (userData.role == 1 || userData.id == 21);
  const debounceRef = useRef(null);

  // ── Fetch users from API ──
  const fetchUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: params.page || currentPage,
        per_page: params.per_page || perPage,
        sort_by: params.sort_by || sortBy,
        sort_dir: params.sort_dir || sortDir,
      });
      if (params.search !== undefined ? params.search : search) queryParams.set('search', params.search !== undefined ? params.search : search);
      if (params.date_from !== undefined ? params.date_from : dateFrom) queryParams.set('date_from', params.date_from !== undefined ? params.date_from : dateFrom);
      if (params.date_to !== undefined ? params.date_to : dateTo) queryParams.set('date_to', params.date_to !== undefined ? params.date_to : dateTo);
      const filters = params.kyc_filter !== undefined ? params.kyc_filter : kycFilters;
      if (filters.length > 0) queryParams.set('kyc_filter', filters.join(','));

      const res = await apiService.vGet(`/api/users-paginated?${queryParams.toString()}`);
      if (res.data.status === 1) {
        setUsers(res.data.data || []);
        setTotal(res.data.total || 0);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setPerPage(res.data.per_page || 20);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, dateFrom, dateTo, kycFilters, sortBy, sortDir]);

  useEffect(() => { fetchUsers(); }, []);

  // ── Debounced search ──
  const handleSearch = (val) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers({ search: val, page: 1 });
      setCurrentPage(1);
    }, 500);
  };

  // ── Date range ──
  const handleDateChange = (key, val) => {
    if (key === 'from') {
      setDateFrom(val);
      fetchUsers({ date_from: val, page: 1 });
    } else {
      setDateTo(val);
      fetchUsers({ date_to: val, page: 1 });
    }
    setCurrentPage(1);
  };

  // ── KYC filter pill toggle ──
  const toggleKycFilter = (filter) => {
    let next;
    if (filter === 'all') {
      next = [];
    } else {
      next = kycFilters.includes(filter)
        ? kycFilters.filter(f => f !== filter)
        : [...kycFilters, filter];
    }
    setKycFilters(next);
    setCurrentPage(1);
    fetchUsers({ kyc_filter: next, page: 1 });
  };

  // ── Sort ──
  const handleSort = (col) => {
    const newDir = sortBy === col && sortDir === 'desc' ? 'asc' : 'desc';
    setSortBy(col);
    setSortDir(newDir);
    fetchUsers({ sort_by: col, sort_dir: newDir, page: 1 });
    setCurrentPage(1);
  };

  // ── Pagination ──
  const goToPage = (p) => {
    if (p < 1 || p > lastPage) return;
    setCurrentPage(p);
    fetchUsers({ page: p });
  };

  const handlePerPage = (val) => {
    setPerPage(val);
    setCurrentPage(1);
    fetchUsers({ per_page: val, page: 1 });
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Mobile', 'Role', 'MID', 'Aadhaar', 'PAN', 'Bank', 'KYC Status', 'Created'];
    const rows = users.map(u => [
      u.id, u.name, u.email || '', u.mobile, u.role_name || u.role, u.mid || '',
      u.aadhar_verified ? 'Yes' : 'No', u.pan_verified ? 'Yes' : 'No',
      u.account_verified ? 'Yes' : 'No', u.kyc_completed ? 'Complete' : 'Incomplete',
      u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
  };

  // ── Export PDF ──
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Users List', 14, 10);
    const head = [['ID', 'Name', 'Mobile', 'Role', 'KYC']];
    const body = users.map(u => [u.id, u.name, u.mobile, u.role_name || u.role, u.kyc_completed ? 'Complete' : 'Incomplete']);
    autoTable(doc, { head, body, startY: 15 });
    doc.save('users.pdf');
  };

  // ── Print ──
  const printTable = () => {
    const el = document.getElementById('ul-table-print');
    if (!el) return;
    const win = window.open('', '', 'height=700,width=900');
    win.document.write('<html><head><title>Users</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:6px 8px;font-size:12px}th{background:#f5f5f5}</style></head><body>');
    win.document.write(el.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  // ── Pagination numbers ──
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(lastPage, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, lastPage]);

  // ── Sort icon ──
  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span className="ul-sort-icon">⇅</span>;
    return <span className="ul-sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── KYC Badge Dots ──
  const KycDots = ({ row }) => (
    <div className="ul-kyc-dots">
      <span className={`ul-dot ${row.aadhar_verified ? 'green' : 'grey'}`} title={row.aadhar_verified ? 'Aadhaar ✓' : 'Aadhaar ✗'}>●</span>
      <span className={`ul-dot ${row.pan_verified ? 'green' : 'grey'}`} title={row.pan_verified ? 'PAN ✓' : 'PAN ✗'}>●</span>
      <span className={`ul-dot ${row.account_verified ? 'green' : 'grey'}`} title={row.account_verified ? 'Bank ✓' : 'Bank ✗'}>●</span>
      <span className={`ul-kyc-label ${row.kyc_completed ? 'complete' : 'incomplete'}`}>
        {row.kyc_completed ? '✓ Complete' : 'Incomplete'}
      </span>
    </div>
  );

  // ── Filter pills config ──
  const filterPills = [
    { key: 'all', label: 'All', icon: '◉' },
    { key: 'aadhar_verified', label: 'Aadhaar ✓', icon: '●' },
    { key: 'aadhar_unverified', label: 'Aadhaar ✗', icon: '○' },
    { key: 'pan_verified', label: 'PAN ✓', icon: '●' },
    { key: 'pan_unverified', label: 'PAN ✗', icon: '○' },
    { key: 'account_verified', label: 'Bank ✓', icon: '●' },
    { key: 'account_unverified', label: 'Bank ✗', icon: '○' },
    { key: 'kyc_complete', label: 'KYC Complete', icon: '✓' },
    { key: 'kyc_incomplete', label: 'KYC Incomplete', icon: '⏳' },
  ];

  const startRow = (currentPage - 1) * perPage + 1;
  const endRow = Math.min(currentPage * perPage, total);

  return (
    <>
      <Pageheader mainheading="Users Master" parentfolder="Users" activepage="List" />
      <div className="page-content-box">
        <div className="page-content-box-inner">

          <div className="ul-card">
            {/* ── Header ── */}
            <div className="ul-header">
              <div className="ul-header-left">
                <h3 className="ul-title">Users</h3>
                <span className="ul-count-pill">{total} total</span>
              </div>
              <div className="ul-header-right">
                <button className="ul-export-btn" onClick={exportCSV} title="CSV Export"><i className="fas fa-file-csv"></i> CSV</button>
                <button className="ul-export-btn" onClick={exportPDF} title="PDF Export"><i className="fas fa-file-pdf"></i> PDF</button>
                <button className="ul-export-btn" onClick={printTable} title="Print"><i className="fas fa-print"></i> Print</button>
                <Link to="/users/add" className="ul-add-btn"><i className="fas fa-plus"></i> Create User</Link>
              </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="ul-filter-bar">
              {/* Search */}
              <div className="ul-search-box">
                <i className="fas fa-search ul-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search name, email, mobile, MID..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  className="ul-search-input"
                />
                {search && <button className="ul-search-clear" onClick={() => handleSearch('')}>×</button>}
              </div>

              {/* Date Range */}
              <div className="ul-date-range">
                <div className="ul-date-field">
                  <label className="ul-date-label">From</label>
                  <input type="date" value={dateFrom} onChange={e => handleDateChange('from', e.target.value)} className="ul-date-input" />
                </div>
                <div className="ul-date-field">
                  <label className="ul-date-label">To</label>
                  <input type="date" value={dateTo} onChange={e => handleDateChange('to', e.target.value)} className="ul-date-input" />
                </div>
                {(dateFrom || dateTo) && (
                  <button className="ul-date-clear" onClick={() => { setDateFrom(''); setDateTo(''); fetchUsers({ date_from: '', date_to: '', page: 1 }); }} title="Clear dates">×</button>
                )}
              </div>
            </div>

            {/* ── KYC Filter Pills ── */}
            <div className="ul-pills-bar">
              {filterPills.map(p => (
                <button
                  key={p.key}
                  className={`ul-pill ${p.key === 'all' ? (kycFilters.length === 0 ? 'active' : '') : (kycFilters.includes(p.key) ? 'active' : '')}`}
                  onClick={() => toggleKycFilter(p.key)}
                >
                  <span className="ul-pill-icon">{p.icon}</span> {p.label}
                </button>
              ))}
            </div>

            {/* ── Table ── */}
            <div className="ul-table-wrap">
              <div id="ul-table-print">
                <table className="ul-table">
                  <thead>
                    <tr>
                      <th className="ul-th" style={{ width: 50 }}>#</th>
                      <th className="ul-th ul-th-sortable" onClick={() => handleSort('id')} style={{ width: 60 }}>ID <SortIcon col="id" /></th>
                      <th className="ul-th ul-th-sortable" onClick={() => handleSort('name')}>Name <SortIcon col="name" /></th>
                      <th className="ul-th ul-th-sortable" onClick={() => handleSort('email')}>Email <SortIcon col="email" /></th>
                      <th className="ul-th ul-th-sortable" onClick={() => handleSort('mobile')}>Mobile <SortIcon col="mobile" /></th>
                      <th className="ul-th" style={{ width: 100 }}>Role</th>
                      <th className="ul-th" style={{ width: 120 }}>MID</th>
                      <th className="ul-th" style={{ width: 170 }}>KYC Status</th>
                      <th className="ul-th" style={{ width: 210 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(perPage > 10 ? 10 : perPage)].map((_, i) => (
                        <tr key={i} className="ul-shimmer-row">
                          {[...Array(9)].map((_, j) => <td key={j} className="ul-td"><div className="ul-shimmer"></div></td>)}
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr><td colSpan={9} className="ul-empty">No users found</td></tr>
                    ) : (
                      users.map((u, idx) => (
                        <tr key={u.id} className="ul-row">
                          <td className="ul-td ul-td-muted">{startRow + idx}</td>
                          <td className="ul-td ul-td-id">{u.id}</td>
                          <td className="ul-td ul-td-name">{u.name}</td>
                          <td className="ul-td ul-td-email">{u.email || <span className="ul-td-muted">—</span>}</td>
                          <td className="ul-td">{u.mobile}</td>
                          <td className="ul-td"><span className="ul-role-badge">{u.role_name || u.role}</span></td>
                          <td className="ul-td ul-td-mid">{u.mid || <span className="ul-td-muted">—</span>}</td>
                          <td className="ul-td"><KycDots row={u} /></td>
                          <td className="ul-td ul-td-actions">
                            <Link to={`/users/edit/${u.id}`} className="ul-action-btn edit" title="Edit"><i className="fas fa-pen"></i></Link>
                            <Link to={`/hrms/employees/kyc/${u.user_id || u.id}`} className="ul-action-btn view" title="View KYC"><i className="fas fa-eye"></i></Link>
                            {canManualKyc && !u.kyc_completed && (
                              <Link to={`/users/manual-kyc/${u.user_id || u.id}`} className="ul-action-btn manual" title="Manual KYC"><i className="fas fa-edit"></i></Link>
                            )}
                            {userData?.role == 1 && (
                              <Link to={`/setting/admin/${u.id}`} className="ul-action-btn config" title="Admin Configure Settings"><i className="fas fa-cogs"></i></Link>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Pagination ── */}
            <div className="ul-pagination">
              <div className="ul-page-info">
                Showing <strong>{total > 0 ? startRow : 0}–{endRow}</strong> of <strong>{total}</strong> users
              </div>
              <div className="ul-page-controls">
                <select className="ul-page-size" value={perPage} onChange={e => handlePerPage(Number(e.target.value))}>
                  {[10, 20, 30, 50, 100].map(s => <option key={s} value={s}>Show {s}</option>)}
                </select>
                <div className="ul-page-btns">
                  <button className="ul-page-btn" disabled={currentPage <= 1} onClick={() => goToPage(1)}>«</button>
                  <button className="ul-page-btn" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>‹</button>
                  {pageNumbers[0] > 1 && <span className="ul-page-ellipsis">…</span>}
                  {pageNumbers.map(p => (
                    <button key={p} className={`ul-page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
                  ))}
                  {pageNumbers[pageNumbers.length - 1] < lastPage && <span className="ul-page-ellipsis">…</span>}
                  <button className="ul-page-btn" disabled={currentPage >= lastPage} onClick={() => goToPage(currentPage + 1)}>›</button>
                  <button className="ul-page-btn" disabled={currentPage >= lastPage} onClick={() => goToPage(lastPage)}>»</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════
           Users List — Banking Grade Premium UI
           ═══════════════════════════════════════════════ */

        .ul-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e8ecf1;
          box-shadow: 0 1px 4px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.02);
          overflow: hidden;
        }

        /* ── Header ── */
        .ul-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eef1f5;
          background: linear-gradient(135deg, #fafbfd 0%, #f5f7fa 100%);
        }
        .ul-header-left { display: flex; align-items: center; gap: 12px; }
        .ul-title { margin: 0; font-size: 17px; font-weight: 700; color: #1a2332; letter-spacing: -.2px; }
        .ul-count-pill {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600; color: #5b6b80;
          background: #eef1f7;
        }
        .ul-header-right { display: flex; align-items: center; gap: 8px; }
        .ul-export-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 6px;
          font-size: 12px; font-weight: 500; color: #5b6b80;
          background: #fff; border: 1px solid #dde2ea;
          cursor: pointer; transition: all .15s;
        }
        .ul-export-btn:hover { background: #f0f2f5; border-color: #c4cad4; color: #333; }
        .ul-add-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 16px; border-radius: 8px;
          font-size: 12px; font-weight: 600; color: #fff;
          background: linear-gradient(135deg, #4f6ef7 0%, #3b5de7 100%);
          text-decoration: none; border: none; cursor: pointer; transition: all .15s;
        }
        .ul-add-btn:hover { background: linear-gradient(135deg, #3b5de7 0%, #2a4cd6 100%); transform: translateY(-1px); color: #fff; }

        /* ── Filter Bar ── */
        .ul-filter-bar {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px;
          border-bottom: 1px solid #eef1f5;
          background: #fafbfd;
          flex-wrap: wrap;
        }
        .ul-search-box {
          position: relative; flex: 1; min-width: 240px; max-width: 360px;
        }
        .ul-search-icon {
          position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
          color: #a0aab5; font-size: 12px;
        }
        .ul-search-input {
          width: 100%; padding: 7px 30px 7px 32px;
          border: 1px solid #dde2ea; border-radius: 8px;
          font-size: 12.5px; color: #333; background: #fff;
          outline: none; transition: border .15s;
        }
        .ul-search-input:focus { border-color: #4f6ef7; box-shadow: 0 0 0 3px rgba(79,110,247,.1); }
        .ul-search-input::placeholder { color: #b0b9c6; }
        .ul-search-clear {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          background: #e8ecf1; border: none; border-radius: 50%;
          width: 18px; height: 18px; font-size: 12px; color: #666;
          cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;
        }
        .ul-date-range {
          display: flex; align-items: center; gap: 8px;
        }
        .ul-date-field { display: flex; align-items: center; gap: 4px; }
        .ul-date-label { font-size: 11px; font-weight: 600; color: #8895a5; text-transform: uppercase; letter-spacing: .3px; }
        .ul-date-input {
          padding: 6px 8px; border: 1px solid #dde2ea; border-radius: 6px;
          font-size: 12px; color: #333; background: #fff; outline: none;
          transition: border .15s;
        }
        .ul-date-input:focus { border-color: #4f6ef7; }
        .ul-date-clear {
          background: #fee; border: none; border-radius: 50%;
          width: 22px; height: 22px; font-size: 13px; color: #d33;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }

        /* ── Filter Pills ── */
        .ul-pills-bar {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 10px 20px;
          border-bottom: 1px solid #eef1f5;
          background: #fafbfd;
        }
        .ul-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 11.5px; font-weight: 500; color: #6b7b8d;
          background: #fff; border: 1px solid #dde2ea;
          cursor: pointer; transition: all .2s; user-select: none;
        }
        .ul-pill:hover { border-color: #b0bfcf; background: #f0f3f8; }
        .ul-pill.active {
          background: linear-gradient(135deg, #4f6ef7 0%, #3b5de7 100%);
          color: #fff; border-color: transparent; font-weight: 600;
        }
        .ul-pill-icon { font-size: 9px; }

        /* ── Table ── */
        .ul-table-wrap {
          overflow-x: auto;
        }
        .ul-table {
          width: 100%; border-collapse: collapse;
          font-size: 12.5px;
        }
        .ul-th {
          padding: 10px 12px;
          font-size: 10.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .5px; color: #7b8a9e;
          background: #f7f9fc;
          border-bottom: 2px solid #e8ecf1;
          text-align: left; white-space: nowrap;
          user-select: none;
        }
        .ul-th-sortable { cursor: pointer; }
        .ul-th-sortable:hover { color: #4f6ef7; }
        .ul-sort-icon { font-size: 10px; color: #bcc5d0; margin-left: 3px; }
        .ul-sort-icon.active { color: #4f6ef7; }

        .ul-td {
          padding: 8px 12px;
          border-bottom: 1px solid #f0f2f5;
          color: #333; vertical-align: middle;
          white-space: nowrap;
        }
        .ul-row { transition: background .12s; }
        .ul-row:hover { background: #f5f8fd; }
        .ul-td-muted { color: #b0b9c6; font-size: 12px; }
        .ul-td-id { font-weight: 700; color: #4f6ef7; font-size: 12px; }
        .ul-td-name { font-weight: 600; color: #1a2332; }
        .ul-td-email { font-size: 12px; color: #5b6b80; max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
        .ul-td-mid { font-family: 'Courier New', monospace; font-size: 11.5px; color: #5b6b80; }
        .ul-role-badge {
          display: inline-block; padding: 2px 8px; border-radius: 4px;
          font-size: 11px; font-weight: 600;
          background: #eef1f7; color: #5b6b80;
        }

        /* KYC Dots */
        .ul-kyc-dots { display: flex; align-items: center; gap: 5px; }
        .ul-dot { font-size: 10px; line-height: 1; }
        .ul-dot.green { color: #22c55e; }
        .ul-dot.grey { color: #d0d5dd; }
        .ul-kyc-label {
          display: inline-flex; align-items: center;
          padding: 2px 7px; border-radius: 4px;
          font-size: 10px; font-weight: 600;
        }
        .ul-kyc-label.complete { background: #dcfce7; color: #166534; }
        .ul-kyc-label.incomplete { background: #fef3c7; color: #92400e; }

        /* Actions */
        .ul-td-actions { display: flex; gap: 5px; align-items: center; }
        .ul-action-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          font-size: 11px; text-decoration: none; transition: all .15s;
          border: 1px solid transparent;
        }
        .ul-action-btn.edit { background: #eef1f7; color: #4f6ef7; border-color: #d8dfee; }
        .ul-action-btn.edit:hover { background: #4f6ef7; color: #fff; }
        .ul-action-btn.view { background: #e0f7fa; color: #0891b2; border-color: #b2ebf2; }
        .ul-action-btn.view:hover { background: #0891b2; color: #fff; }
        .ul-action-btn.manual { background: #fef3c7; color: #d97706; border-color: #fde68a; }
        .ul-action-btn.manual:hover { background: #d97706; color: #fff; }
        .ul-action-btn.config { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
        .ul-action-btn.config:hover { background: #16a34a; color: #fff; }

        /* ── Empty ── */
        .ul-empty { text-align: center; padding: 48px 20px !important; color: #8895a5; font-size: 14px; }

        /* ── Shimmer ── */
        .ul-shimmer-row td { padding: 8px 12px !important; }
        .ul-shimmer {
          height: 14px; border-radius: 4px;
          background: linear-gradient(90deg, #f0f2f5 25%, #e8ecf1 50%, #f0f2f5 75%);
          background-size: 200% 100%;
          animation: ulShimmer 1.2s infinite;
        }
        @keyframes ulShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ── Pagination ── */
        .ul-pagination {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 20px;
          border-top: 1px solid #eef1f5;
          background: #fafbfd;
        }
        .ul-page-info { font-size: 12px; color: #6b7b8d; }
        .ul-page-controls { display: flex; align-items: center; gap: 12px; }
        .ul-page-size {
          padding: 4px 8px; border: 1px solid #dde2ea; border-radius: 6px;
          font-size: 12px; color: #333; background: #fff; outline: none;
        }
        .ul-page-btns { display: flex; gap: 2px; }
        .ul-page-btn {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 30px; height: 30px; padding: 0 6px;
          border: 1px solid #dde2ea; border-radius: 6px;
          font-size: 12px; font-weight: 500; color: #5b6b80;
          background: #fff; cursor: pointer; transition: all .15s;
        }
        .ul-page-btn:hover:not(:disabled):not(.active) { background: #f0f3f8; border-color: #b0bfcf; }
        .ul-page-btn.active { background: #4f6ef7; color: #fff; border-color: #4f6ef7; font-weight: 700; }
        .ul-page-btn:disabled { opacity: .4; cursor: default; }
        .ul-page-ellipsis { color: #b0b9c6; font-size: 12px; padding: 0 4px; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ul-header { flex-direction: column; gap: 10px; align-items: flex-start; }
          .ul-filter-bar { flex-direction: column; gap: 8px; }
          .ul-search-box { max-width: 100%; }
          .ul-pagination { flex-direction: column; gap: 8px; align-items: flex-start; }
        }
      `}</style>
    </>
  );
};

export default ListUser;
