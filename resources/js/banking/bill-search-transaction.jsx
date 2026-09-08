import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BbpsTopNav from './BbpsTopNav';

const BillSearchTransaction = ({ hideNav = false }) => {
    const [txRefId, setTxRefId] = useState('MockntCK1U1sw2');
    const [mobileNumber, setMobileNumber] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [searchResult, setSearchResult] = useState({
        customerNumber: '9954490941',
        amount: '50',
        approvalRefNo: 'MockntCK1U1sw2',
        transactionDate: '2024-04-24 19:18:29',
        txnRefId: 'MockoxS9liY3Ls',
        status: 'SUCCESS'
    });

    const handleSearch = () => {
        toast.info('Searching transaction...');
        setSearchResult({
            customerNumber: mobileNumber || '9954490941',
            amount: '50',
            approvalRefNo: txRefId || 'MockntCK1U1sw2',
            transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            txnRefId: 'MockoxS9liY3Ls',
            status: 'SUCCESS'
        });
    };

    return (
        <>
            {!hideNav && <ToastContainer position="top-right" autoClose={3000} />}

            <div className={`page-content-box bg-transparent border-0 p-0 shadow-none ${hideNav ? 'mt-0 pt-0' : 'mt-3'}`}>
                {!hideNav && <BbpsTopNav activeTab="search" />}

                {/* Header row with Section title on left and Logo on right matching user screenshot */}
                <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                    <h6 className="text-secondary fw-bold mb-0 text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.95rem' }}>
                        SEARCH TRANSACTION
                    </h6>
                    <img
                        src="/assets/bharat-connect.PNG"
                        alt="Bharat Connect"
                        style={{ maxHeight: '44px', width: 'auto', objectFit: 'contain' }}
                    />
                </div>

                {/* Cards Grid */}
                <div className="row g-4">
                    {/* Left Card: Search Form */}
                    <div className="col-lg-6 col-md-6 col-12">
                        <div className="card border border-light-subtle shadow-sm rounded-3 overflow-hidden bg-white h-100">
                            <div className="p-3 px-4 bg-white border-bottom">
                                <h6 className="fw-bold text-dark mb-0 fs-6">Search</h6>
                            </div>

                            <div className="card-body p-4">
                                {/* Radio button option */}
                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="searchType"
                                        id="radioTransaction"
                                        checked
                                        readOnly
                                    />
                                    <label className="form-check-label text-dark fw-bold" htmlFor="radioTransaction" style={{ fontSize: '0.9rem' }}>
                                        Transaction
                                    </label>
                                </div>

                                {/* Transaction Reference Id */}
                                <div className="mb-3">
                                    <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: '0.85rem' }}>Transaction Reference Id</label>
                                    <input
                                        type="text"
                                        className="form-control text-secondary bg-white"
                                        placeholder="Transaction Reference Id"
                                        value={txRefId}
                                        onChange={(e) => setTxRefId(e.target.value)}
                                        style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '7px 12px', fontSize: '0.875rem' }}
                                    />
                                </div>

                                {/* Divider OR */}
                                <div className="text-center my-3 text-dark fw-bold" style={{ fontSize: '0.85rem' }}>
                                    OR
                                </div>

                                {/* Mobile Number */}
                                <div className="mb-3">
                                    <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: '0.85rem' }}>Mobile Number</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0" style={{ borderRadius: '6px 0 0 6px', fontSize: '0.875rem', border: '1px solid #ced4da', padding: '7px 12px' }}>
                                            +91
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 text-secondary bg-white"
                                            placeholder="Mobile Number"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value)}
                                            style={{ borderRadius: '0 6px 6px 0', border: '1px solid #ced4da', padding: '7px 12px', fontSize: '0.875rem' }}
                                        />
                                    </div>
                                </div>

                                {/* From Date & To Date */}
                                <div className="row g-3 mb-2">
                                    <div className="col-6">
                                        <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: '0.85rem' }}>From Date</label>
                                        <input
                                            type="text"
                                            className="form-control text-secondary bg-white"
                                            placeholder="DD/MM/YYYY"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            onFocus={(e) => (e.target.type = 'date')}
                                            onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                                            style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '7px 12px', fontSize: '0.875rem' }}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-dark fw-bold mb-1" style={{ fontSize: '0.85rem' }}>To Date</label>
                                        <input
                                            type="text"
                                            className="form-control text-secondary bg-white"
                                            placeholder="DD/MM/YYYY"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            onFocus={(e) => (e.target.type = 'date')}
                                            onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                                            style={{ borderRadius: '6px', border: '1px solid #ced4da', padding: '7px 12px', fontSize: '0.875rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Search Button */}
                            <div className="p-3 px-4 bg-white border-top d-flex justify-content-end align-items-center">
                                <button
                                    type="button"
                                    className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                                    onClick={handleSearch}
                                    style={{ borderRadius: '6px', fontSize: '0.875rem', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                                >
                                    <iconify-icon icon="lucide:search" width="18" height="18"></iconify-icon>
                                    SEARCH
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Card: Transaction Details */}
                    <div className="col-lg-6 col-md-6 col-12">
                        <div className="card border border-light-subtle shadow-sm rounded-3 overflow-hidden bg-white h-100">
                            <div className="p-3 px-4 bg-white border-bottom">
                                <h6 className="fw-bold text-dark mb-0 fs-6">Transaction Details</h6>
                            </div>

                            <div className="card-body p-4">
                                {searchResult ? (
                                    <div className="row g-4">
                                        {/* Row 1 */}
                                        <div className="col-6">
                                            <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.88rem' }}>Customer Number</label>
                                            <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.88rem' }}>{searchResult.customerNumber}</p>
                                        </div>
                                        <div className="col-6">
                                            <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.88rem' }}>Amount</label>
                                            <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.88rem' }}>{searchResult.amount}</p>
                                        </div>

                                        {/* Row 2 */}
                                        <div className="col-6">
                                            <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.88rem' }}>Approval Ref No</label>
                                            <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.88rem' }}>{searchResult.approvalRefNo}</p>
                                        </div>
                                        <div className="col-6">
                                            <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.88rem' }}>Transaction Date</label>
                                            <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.88rem' }}>{searchResult.transactionDate}</p>
                                        </div>

                                        {/* Row 3 */}
                                        <div className="col-6">
                                            <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.88rem' }}>Txn Ref ID</label>
                                            <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.88rem' }}>{searchResult.txnRefId}</p>
                                        </div>
                                        <div className="col-6">
                                            <label className="text-dark fw-bold d-block mb-1" style={{ fontSize: '0.88rem' }}>Transaction Status</label>
                                            <p className="mb-0 fw-semibold d-inline-flex align-items-center gap-1.5" style={{ color: '#16a34a', fontSize: '0.88rem' }}>
                                                <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }}></span>
                                                {searchResult.status}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        No transaction details available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BillSearchTransaction;
