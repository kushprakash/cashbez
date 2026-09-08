import React from 'react';
import { useNavigate } from 'react-router-dom';

const BbpsTopNav = ({ activeTab = 'home', setActiveTab, onHomeClick }) => {
    const navigate = useNavigate();

    const handleTabSelect = (tabKey, path, options = {}) => {
        if (tabKey === 'home' && onHomeClick) {
            onHomeClick();
        }
        if (setActiveTab) {
            setActiveTab(tabKey);
        }
        if (path) {
            navigate(path, options);
        }
    };

    return (
        <div className="bg-white border shadow-sm mb-3 px-3 py-2 rounded-3" style={{ minHeight: '52px' }}>
            <div className="d-flex align-items-center justify-content-start gap-4 overflow-auto text-nowrap">
                <button
                    type="button"
                    className={`btn border-0 fw-semibold d-inline-flex align-items-center gap-2 pb-2 pt-2 ${
                        activeTab === 'home' ? 'text-primary border-bottom border-primary border-3 rounded-0' : 'text-secondary'
                    }`}
                    onClick={() => handleTabSelect('home', '/banking/bill/payment')}
                >
                    <iconify-icon icon="material-symbols:home-outline" width="20" height="20"></iconify-icon>
                    Home
                </button>

                <button
                    type="button"
                    className={`btn border-0 fw-semibold d-inline-flex align-items-center gap-2 pb-2 pt-2 ${
                        activeTab === 'recharge' ? 'text-primary border-bottom border-primary border-3 rounded-0' : 'text-secondary'
                    }`}
                    onClick={() => handleTabSelect('recharge', '/banking/mobile/recharge')}
                >
                    <iconify-icon icon="material-symbols:smartphone-outline" width="20" height="20"></iconify-icon>
                    Mobile Recharge
                </button>

                <button
                    type="button"
                    className={`btn border-0 fw-semibold d-inline-flex align-items-center gap-2 pb-2 pt-2 ${
                        activeTab === 'dth' ? 'text-primary border-bottom border-primary border-3 rounded-0' : 'text-secondary'
                    }`}
                    onClick={() => handleTabSelect('dth', '/banking/dth/recharge')}
                >
                    <iconify-icon icon="material-symbols:satellite-alt-outline" width="20" height="20"></iconify-icon>
                    DTH Recharge
                </button>

                <button
                    type="button"
                    className={`btn border-0 fw-semibold d-inline-flex align-items-center gap-2 pb-2 pt-2 ${
                        activeTab === 'history' ? 'text-primary border-bottom border-primary border-3 rounded-0' : 'text-secondary'
                    }`}
                    onClick={() => handleTabSelect('history', '/banking/bill/payment-report')}
                >
                    <iconify-icon icon="material-symbols:receipt-long-outline" width="20" height="20"></iconify-icon>
                    Transaction History
                </button>

                <button
                    type="button"
                    className={`btn border-0 fw-semibold d-inline-flex align-items-center gap-2 pb-2 pt-2 ${
                        activeTab === 'search' ? 'text-primary border-bottom border-primary border-3 rounded-0' : 'text-secondary'
                    }`}
                    onClick={() => handleTabSelect('search', '/banking/bill/search-transaction')}
                >
                    <iconify-icon icon="material-symbols:manage-search-outline" width="20" height="20"></iconify-icon>
                    Search Transaction
                </button>

                <button
                    type="button"
                    className={`btn border-0 fw-semibold d-inline-flex align-items-center gap-2 pb-2 pt-2 ${
                        activeTab === 'complaint' ? 'text-primary border-bottom border-primary border-3 rounded-0' : 'text-secondary'
                    }`}
                    onClick={() => handleTabSelect('complaint', '/banking/bill/payment', { state: { tab: 'complaint' } })}
                >
                    <iconify-icon icon="material-symbols:description-outline" width="20" height="20"></iconify-icon>
                    Complaint
                </button>
            </div>
        </div>
    );
};

export default BbpsTopNav;
