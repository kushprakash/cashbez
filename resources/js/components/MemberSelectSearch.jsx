import React, { useState, useEffect, useRef } from 'react';

const MemberSelectSearch = ({ members = [], value, onChange, placeholder = "Search member by Name, ID, Mobile..." }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Sync selected member display text when value or members change
    useEffect(() => {
        if (value) {
            const selected = members.find(m => m.id == value);
            if (selected) {
                setSearchQuery(`${selected.name} (${selected.member_id || selected.id}) - ${selected.mobile || ''}`);
            }
        } else {
            setSearchQuery('');
        }
    }, [value, members]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMembers = members.filter(m => {
        if (!searchQuery) return true;
        // If query matches current formatted selection exactly, show all
        const formatted = `${m.name} (${m.member_id || m.id}) - ${m.mobile || ''}`.toLowerCase();
        if (searchQuery.toLowerCase() === formatted) return true;

        const q = searchQuery.toLowerCase();
        const nameLower = (m.name || '').toLowerCase();
        const idLower = String(m.member_id || m.id || '').toLowerCase();
        const mobileLower = String(m.mobile || '').toLowerCase();
        return nameLower.includes(q) || idLower.includes(q) || mobileLower.includes(q);
    });

    const handleSelect = (member) => {
        onChange(member.id);
        setSearchQuery(`${member.name} (${member.member_id || member.id}) - ${member.mobile || ''}`);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setSearchQuery('');
        setIsOpen(true);
    };

    return (
        <div className="position-relative" ref={wrapperRef}>
            <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bx bx-search text-muted"></i></span>
                <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder={placeholder}
                    value={searchQuery}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                        if (value) onChange('');
                    }}
                />
                {value ? (
                    <button type="button" className="btn btn-outline-secondary border-start-0" onClick={handleClear}>
                        <i className="bx bx-x"></i>
                    </button>
                ) : null}
            </div>

            {isOpen && (
                <div
                    className="position-absolute w-100 bg-white border rounded-3 shadow-lg mt-1"
                    style={{ zIndex: 1060, maxHeight: '220px', overflowY: 'auto', left: 0, right: 0 }}
                >
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map((m) => {
                            const isSelected = value == m.id;
                            return (
                                <div
                                    key={m.id}
                                    className={`p-2.5 px-3 border-bottom text-start transition-all ${
                                        isSelected ? 'bg-primary text-white' : 'hover-bg-light text-dark'
                                    }`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSelect(m)}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="fw-bold">{m.name}</div>
                                        <span
                                            className={`badge rounded-pill ${
                                                m.kyc_status === 'APPROVED' 
                                                    ? (isSelected ? 'bg-white text-success' : 'bg-success text-white') 
                                                    : (isSelected ? 'bg-warning text-dark' : 'bg-warning-subtle text-warning-emphasis border border-warning')
                                            }`}
                                            style={{ fontSize: '10.5px', fontWeight: 600 }}
                                        >
                                            {m.kyc_status === 'APPROVED' ? '✓ KYC APPROVED' : `KYC: ${m.kyc_status || 'PENDING'}`}
                                        </span>
                                    </div>
                                    <div className={`small ${isSelected ? 'text-white-50' : 'text-muted'}`}>
                                        Member ID: <strong>{m.member_id || m.id}</strong> | Mobile: {m.mobile || 'N/A'}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-3 text-center text-muted small">No member found matching "{searchQuery}"</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MemberSelectSearch;
