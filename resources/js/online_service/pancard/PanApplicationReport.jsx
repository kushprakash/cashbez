import React, { useState, useCallback, useRef, useEffect, useContext, useMemo } from 'react';
import ApiService from '../../core/services/ApiService';
import Pageheader from '../../layouts/Pageheader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthContext } from '../../core/hooks/context';

const PanApplicationReport = () => {
    const { userData } = useContext(AuthContext);
    const userRole = parseInt(userData?.role || 0);

    const [records, setRecords]             = useState([]);
    const [loading, setLoading]             = useState(false);
    const [importing, setImporting]         = useState(false);
    const [hasFetched, setHasFetched]       = useState(false);
    const [importSummary, setImportSummary] = useState(null);

    const PAGE_SIZE = 50;
    const [currentPage, setCurrentPage] = useState(1);

    // ── Filters ──────────────────────────────────────────────────────────────
    const [fromDate, setFromDate]     = useState('');
    const [toDate, setToDate]         = useState('');
    const [keyword, setKeyword]       = useState('');
    const [selectedId, setSelectedId] = useState(''); // admin_id or user_id depending on role

    // ── Dropdown list (admins for role=1, users for role=2) ──────────────────
    const [filterList, setFilterList]   = useState([]);
    const [filterType, setFilterType]   = useState('none'); // 'admin_list' | 'user_list' | 'none'

    const apiServiceRef = useRef(ApiService());
    const fileInputRef  = useRef(null);

    // ── Load filter dropdown lists on mount ───────────────────────────────────
    useEffect(() => {
        const loadFilterLists = async () => {
            try {
                const res = await apiServiceRef.current.vGet('/api/pan-card/application-report-filter-lists');
                if (res?.data?.status === 1) {
                    setFilterList(res.data.list || []);
                    setFilterType(res.data.type || 'none');
                }
            } catch (err) {
                console.error('Filter list error:', err);
            }
        };
        loadFilterLists();
    }, []);

    // ── Fetch records ─────────────────────────────────────────────────────────
    const fetchRecords = useCallback(async (autoLoad = false) => {
        if (!autoLoad && (fromDate || toDate) && (!fromDate || !toDate)) {
            toast.warning('Please select both From Date and To Date');
            return;
        }
        setLoading(true);
        setHasFetched(true);
        try {
            const params = new URLSearchParams({ limit: 500 });
            if (fromDate)   params.append('from_date', fromDate);
            if (toDate)     params.append('to_date', toDate);
            if (selectedId) {
                if (filterType === 'admin_list') params.append('filter_admin_id', selectedId);
                if (filterType === 'user_list')  params.append('filter_user_id', selectedId);
            }

            const res = await apiServiceRef.current.vGet(`/api/pan-card/application-reports?${params}`);
            if (res?.data?.status === 1) {
                setRecords(res.data.data || []);
            } else {
                toast.error(res?.data?.message || 'Failed to fetch records');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch PAN application records');
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, selectedId, filterType]);

    // ── Auto-load on mount ────────────────────────────────────────────────────
    useEffect(() => { fetchRecords(true); }, []);

    // ── Keyword filter (client-side) ──────────────────────────────────────────
    const filtered = useMemo(() => {
        if (!keyword.trim()) return records;
        const q = keyword.toLowerCase();
        return records.filter(r =>
            (r.application_no  || '').toLowerCase().includes(q) ||
            (r.pan_name        || '').toLowerCase().includes(q) ||
            (r.vle_id          || '').toLowerCase().includes(q) ||
            (r.lot_no          || '').toLowerCase().includes(q) ||
            (r.application_status || '').toLowerCase().includes(q) ||
            (r.user?.mid       || '').toLowerCase().includes(q) ||
            (r.user?.name      || '').toLowerCase().includes(q)
        );
    }, [records, keyword]);

    // ── Pagination ────────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, currentPage]);

    // Reset to page 1 when keyword or fetched data changes
    useEffect(() => { setCurrentPage(1); }, [keyword, records]);

    // ── Handle Excel import ───────────────────────────────────────────────────
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xls', 'xlsx'].includes(ext)) {
            toast.error('Only .xls or .xlsx files are supported');
            e.target.value = ''; return;
        }
        setImporting(true);
        setImportSummary(null);
        try {
            const data     = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const ws       = workbook.Sheets[workbook.SheetNames[0]];
            const rows     = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'yyyy-mm-dd', defval: '' });
            if (!rows.length) { toast.warning('Excel file is empty'); setImporting(false); e.target.value = ''; return; }

            const res = await apiServiceRef.current.vPost('/api/pan-card/import-application-report', { rows });
            if (res?.data?.status === 1) {
                const summary = res.data.summary || {};
                setImportSummary(summary);
                toast.success(`Import done! Inserted: ${summary.inserted ?? 0}, Skipped: ${summary.skipped ?? 0}`);
                fetchRecords(true);
            } else {
                toast.error(res?.data?.message || 'Import failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to parse or import the Excel file');
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    // ── Export Excel ──────────────────────────────────────────────────────────
    const exportExcel = () => {
        if (!filtered.length) { toast.warning('No data to export'); return; }
        const rows = filtered.map((r, i) => ({
            '#':             i + 1,
            'Agent MID':     r.user?.mid || '',
            'Agent Name':    r.user?.name || '',
            'PSA ID':        r.vle_id || '',
            'Application No':r.application_no || '',
            'PAN Name':      r.pan_name || '',
            'Form Type':     r.form_type || '',
            'Lot No':        r.lot_no || '',
            'Lot Date':      r.lot_date ? new Date(r.lot_date).toLocaleDateString('en-IN') : '',
            'DOA':           r.doa ? new Date(r.doa).toLocaleDateString('en-IN') : '',
            'Dispatch':      r.dispatch_address || '',
            'Status':        r.application_status || '',
            'Objection':     [r.objection_code, r.objection_code1, r.objection_code2].filter(Boolean).join(', '),
        }));
        const ws  = XLSX.utils.json_to_sheet(rows);
        const wb  = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'PAN Report');
        XLSX.writeFile(wb, `PAN_Application_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success('Excel exported successfully!');
    };

    // ── Export PDF ────────────────────────────────────────────────────────────
    const exportPdf = () => {
        if (!filtered.length) { toast.warning('No data to export'); return; }
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        doc.setFontSize(14);
        doc.text('PAN Application Report', 40, 40);
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}  |  Records: ${filtered.length}`, 40, 58);

        autoTable(doc, {
            startY: 70,
            styles: { fontSize: 7, cellPadding: 3 },
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            head: [['#', 'MID', 'Name', 'PSA ID', 'App No', 'PAN Name', 'Type', 'Lot No', 'Lot Date', 'Status', 'Objection']],
            body: filtered.map((r, i) => [
                i + 1,
                r.user?.mid || '',
                r.user?.name || '',
                r.vle_id || '',
                r.application_no || '',
                r.pan_name || '',
                r.form_type || '',
                r.lot_no || '',
                r.lot_date ? new Date(r.lot_date).toLocaleDateString('en-IN') : '',
                r.application_status || '',
                [r.objection_code, r.objection_code1, r.objection_code2].filter(Boolean).join(', '),
            ]),
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        doc.save(`PAN_Application_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        toast.success('PDF exported successfully!');
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const fmtDate = (d) => {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return d; }
    };

    const StatusBadge = ({ status }) => {
        if (!status) return <span className="badge bg-secondary">—</span>;
        const s = status.toUpperCase();
        if (s.includes('PROCESSED')) return <span className="badge fw-semibold" style={{ background: '#10b981', fontSize: '10px' }}>✓ Processed</span>;
        if (s.includes('REJECT') || s.includes('OBJECTION')) return <span className="badge fw-semibold" style={{ background: '#ef4444', fontSize: '10px' }}>✗ Objection</span>;
        if (s.includes('PENDING')) return <span className="badge fw-semibold" style={{ background: '#f59e0b', fontSize: '10px' }}>⏳ Pending</span>;
        return <span className="badge bg-secondary" style={{ fontSize: '10px' }}>{status}</span>;
    };

    const filterLabel = filterType === 'admin_list' ? 'Filter by Admin' : filterType === 'user_list' ? 'Filter by User' : null;

    return (
        <>
            <Pageheader mainheading="PAN Card Service" parentfolder="Reports" activepage="PAN Application Report" />
            <ToastContainer position="top-right" autoClose={3500} />

            <div className="page-content-box" style={{ padding: '16px 20px', minHeight: '100vh', background: '#f4f6fb' }}>

                {/* ── TOP CARD ─────────────────────────────────────────────── */}
                <div className="card border-0 shadow-sm mb-3"
                    style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa fa-id-card text-white fs-5"></i>
                            </div>
                            <div>
                                <h5 className="mb-0 text-white fw-bold">PAN Application Report</h5>
                                <small className="text-white-50">Import 49A Excel & filter records</small>
                            </div>
                        </div>

                        {/* Row 1: Import + Dates + Filter button */}
                        <div className="row g-2 align-items-end mb-2">
                            {/* Excel Import */}
                            <div className="col-md-3">
                                <label className="form-label text-white-50 small fw-semibold mb-1">
                                    <i className="fa fa-upload me-1"></i> Import Excel (.xls / .xlsx)
                                </label>
                                <div className="input-group">
                                    <input ref={fileInputRef} type="file" id="excel-import-input"
                                        className="form-control" accept=".xls,.xlsx"
                                        onChange={handleFileChange} disabled={importing}
                                        style={{ borderRadius: '8px 0 0 8px', fontSize: '13px' }} />
                                    <button className="btn btn-warning fw-bold px-3"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={importing}
                                        style={{ borderRadius: '0 8px 8px 0' }}>
                                        {importing ? <><span className="spinner-border spinner-border-sm me-1"></span>Importing...</> : <><i className="fa fa-file-excel me-1"></i>Import</>}
                                    </button>
                                </div>
                            </div>

                            {/* From Date */}
                            <div className="col-md-2">
                                <label className="form-label text-white-50 small fw-semibold mb-1">
                                    <i className="fa fa-calendar me-1"></i> From Date
                                </label>
                                <input type="date" className="form-control"
                                    value={fromDate} onChange={e => setFromDate(e.target.value)}
                                    style={{ borderRadius: '8px', fontSize: '14px' }} />
                            </div>

                            {/* To Date */}
                            <div className="col-md-2">
                                <label className="form-label text-white-50 small fw-semibold mb-1">
                                    <i className="fa fa-calendar-check me-1"></i> To Date
                                </label>
                                <input type="date" className="form-control"
                                    value={toDate} onChange={e => setToDate(e.target.value)}
                                    style={{ borderRadius: '8px', fontSize: '14px' }} />
                            </div>

                            {/* Admin/User filter — only for role 1 or 2 */}
                            {filterLabel && filterList.length > 0 && (
                                <div className="col-md-2">
                                    <label className="form-label text-white-50 small fw-semibold mb-1">
                                        <i className="fa fa-users me-1"></i> {filterLabel}
                                    </label>
                                    <select className="form-select" value={selectedId}
                                        onChange={e => setSelectedId(e.target.value)}
                                        style={{ borderRadius: '8px', fontSize: '13px' }}>
                                        <option value="">All</option>
                                        {filterList.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} ({item.mid})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Filter Button */}
                            <div className="col-md-1">
                                <button className="btn w-100 fw-bold" onClick={() => fetchRecords(false)}
                                    disabled={loading}
                                    style={{ background: '#f0fdf4', color: '#15803d', border: '2px solid #bbf7d0', borderRadius: '8px', padding: '9px' }}>
                                    {loading
                                        ? <span className="spinner-border spinner-border-sm"></span>
                                        : <><i className="fa fa-search"></i></>
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Import Summary */}
                        {importSummary && (
                            <div className="mt-2 p-2 rounded-3 d-flex gap-4 flex-wrap" style={{ background: 'rgba(255,255,255,0.12)' }}>
                                <span className="text-white small"><i className="fa fa-check-circle text-success me-1"></i><strong>{importSummary.inserted ?? 0}</strong> Inserted</span>
                                <span className="text-white small"><i className="fa fa-ban text-warning me-1"></i><strong>{importSummary.skipped ?? 0}</strong> Skipped</span>
                                <span className="text-white small"><i className="fa fa-table me-1"></i><strong>{importSummary.total ?? 0}</strong> Total</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── DATA TABLE CARD ──────────────────────────────────────── */}
                <div className="card border-0 shadow-sm" style={{ borderRadius: '14px' }}>
                    {/* Card Header: search + export buttons */}
                    <div className="card-header bg-white border-bottom px-4 py-3" style={{ borderRadius: '14px 14px 0 0' }}>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                            {/* Left: title + count */}
                            <div>
                                <h6 className="mb-0 fw-bold text-dark">
                                    <i className="fa fa-list me-2 text-primary"></i>PAN Application List
                                </h6>
                                {hasFetched && !loading && (
                                    <small className="text-muted">
                                        {filtered.length !== records.length
                                            ? `Showing ${filtered.length} of ${records.length} records`
                                            : `${records.length} records loaded`}
                                        {fromDate && toDate ? ` (${fromDate} → ${toDate})` : ''}
                                    </small>
                                )}
                            </div>

                            {/* Right: keyword search + export */}
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                {/* Keyword search */}
                                <div className="input-group" style={{ width: 220 }}>
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="fa fa-search text-muted" style={{ fontSize: '12px' }}></i>
                                    </span>
                                    <input type="text" className="form-control border-start-0 ps-0"
                                        placeholder="Search records..."
                                        value={keyword} onChange={e => setKeyword(e.target.value)}
                                        style={{ fontSize: '13px' }} />
                                    {keyword && (
                                        <button className="btn btn-outline-secondary border-start-0 px-2"
                                            onClick={() => setKeyword('')}>
                                            <i className="fa fa-times" style={{ fontSize: '11px' }}></i>
                                        </button>
                                    )}
                                </div>

                                {/* Export Excel */}
                                <button className="btn btn-success btn-sm fw-semibold px-3"
                                    onClick={exportExcel} disabled={!filtered.length}
                                    style={{ borderRadius: '8px', fontSize: '12px' }}>
                                    <i className="fa fa-file-excel me-1"></i> Excel
                                </button>

                                {/* Export PDF */}
                                <button className="btn btn-danger btn-sm fw-semibold px-3"
                                    onClick={exportPdf} disabled={!filtered.length}
                                    style={{ borderRadius: '8px', fontSize: '12px' }}>
                                    <i className="fa fa-file-pdf me-1"></i> PDF
                                </button>

                                {/* Record count badge */}
                                {hasFetched && (
                                    <span className="badge bg-primary-subtle text-primary px-3 py-2" style={{ fontSize: '13px' }}>
                                        {filtered.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table body */}
                    <div className="card-body p-0">
                        {!hasFetched ? (
                            <div className="text-center py-5 text-muted">
                                <div className="spinner-border text-primary" style={{ width: 40, height: 40 }}></div>
                                <p className="mt-3">Loading latest records...</p>
                            </div>
                        ) : loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" style={{ width: 40, height: 40 }}></div>
                                <p className="mt-3 text-muted">Fetching records...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="fa fa-inbox fs-2 mb-3 d-block"></i>
                                <p className="fw-semibold mb-1">No records found</p>
                                <small>Try adjusting filters or importing an Excel file</small>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0 table-hover" style={{ fontSize: '12px' }}>
                                    <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                                        <tr>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>#</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>Agent</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>PSA ID</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>Application No</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>PAN Name</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>Form Type</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>Lot No</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>Lot Date</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>DOA</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>Dispatch</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>Status</th>
                                            <th className="px-3 py-3 text-muted fw-semibold" style={{ whiteSpace: 'nowrap' }}>Objection</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((row, idx) => (
                                            <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td className="px-3 text-muted fw-semibold">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>

                                                <td className="px-3">
                                                    <span className="badge bg-primary-subtle text-primary fw-bold font-monospace px-2"
                                                        style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                                        {row.user?.mid || '—'}
                                                    </span>
                                                    <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
                                                        {row.user?.name || '—'}
                                                    </div>
                                                </td>

                                                <td className="px-3 font-monospace" style={{ fontSize: '11px', color: '#64748b' }}>
                                                    {row.vle_id || '—'}
                                                </td>

                                                <td className="px-3">
                                                    <span className="font-monospace fw-bold text-dark" style={{ fontSize: '12px' }}>
                                                        {row.application_no}
                                                    </span>
                                                </td>

                                                <td className="px-3 fw-semibold text-dark text-uppercase">
                                                    {row.pan_name || '—'}
                                                </td>

                                                <td className="px-3">
                                                    <span className="badge bg-secondary-subtle text-secondary fw-semibold" style={{ fontSize: '11px' }}>
                                                        {row.form_type || '—'}
                                                    </span>
                                                </td>

                                                <td className="px-3 font-monospace" style={{ color: '#475569' }}>
                                                    {row.lot_no || '—'}
                                                </td>

                                                <td className="px-3" style={{ color: '#475569', whiteSpace: 'nowrap' }}>
                                                    {fmtDate(row.lot_date)}
                                                </td>

                                                <td className="px-3" style={{ color: '#475569', whiteSpace: 'nowrap' }}>
                                                    {fmtDate(row.doa)}
                                                </td>

                                                <td className="px-3" style={{ color: '#475569', maxWidth: '120px' }}>
                                                    <span title={row.dispatch_address}
                                                        style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                                                        {row.dispatch_address || '—'}
                                                    </span>
                                                </td>

                                                <td className="px-3">
                                                    <StatusBadge status={row.application_status} />
                                                </td>

                                                <td className="px-3" style={{ maxWidth: '130px' }}>
                                                    {[row.objection_code, row.objection_code1, row.objection_code2]
                                                        .filter(Boolean)
                                                        .map((code, i) => (
                                                            <span key={i} className="badge bg-danger-subtle text-danger fw-semibold me-1 mb-1" style={{ fontSize: '10px' }}>
                                                                {code}
                                                            </span>
                                                        ))
                                                    }
                                                    {![row.objection_code, row.objection_code1, row.objection_code2].some(Boolean) && (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer + Pagination */}
                    {hasFetched && !loading && filtered.length > 0 && (
                        <div className="card-footer bg-white border-top py-2 px-4"
                            style={{ borderRadius: '0 0 14px 14px' }}>
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                {/* Info text */}
                                <small className="text-muted">
                                    <i className="fa fa-info-circle me-1"></i>
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} records
                                    {keyword ? ` · keyword "${keyword}"` : ''}
                                </small>

                                {/* Pagination controls */}
                                {totalPages > 1 && (
                                    <nav>
                                        <ul className="pagination pagination-sm mb-0 gap-1">
                                            {/* Prev */}
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button className="page-link rounded-2" style={{ fontSize: '12px' }}
                                                    onClick={() => setCurrentPage(p => p - 1)}>
                                                    <i className="fa fa-chevron-left"></i>
                                                </button>
                                            </li>

                                            {/* Page numbers — smart windowing */}
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                                                .reduce((acc, p, i, arr) => {
                                                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((item, i) =>
                                                    item === '...' ? (
                                                        <li key={`ellipsis-${i}`} className="page-item disabled">
                                                            <span className="page-link" style={{ fontSize: '12px' }}>…</span>
                                                        </li>
                                                    ) : (
                                                        <li key={item} className={`page-item ${currentPage === item ? 'active' : ''}`}>
                                                            <button className="page-link rounded-2" style={{ fontSize: '12px', minWidth: 34 }}
                                                                onClick={() => setCurrentPage(item)}>
                                                                {item}
                                                            </button>
                                                        </li>
                                                    )
                                                )
                                            }

                                            {/* Next */}
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button className="page-link rounded-2" style={{ fontSize: '12px' }}
                                                    onClick={() => setCurrentPage(p => p + 1)}>
                                                    <i className="fa fa-chevron-right"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
};

export default PanApplicationReport;
