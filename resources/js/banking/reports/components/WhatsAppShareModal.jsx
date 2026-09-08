import React, { useState, useEffect } from 'react';
import { Modal, Space, Button, Tooltip, Select, Input, Tag, Checkbox, Typography, message as antMessage } from 'antd';
import { WhatsAppOutlined, CopyOutlined, EyeOutlined as PreviewIcon, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons';
import ApiService from '../../../core/services/ApiService';

const { Text } = Typography;

const WhatsAppShareModal = ({ visible, onCancel, data = [] }) => {
    // ── Internal State ──────────────────────────────────────────────────────
    const [shareSearch, setShareSearch] = useState('');
    const [selectedShareIds, setSelectedShareIds] = useState([]);
    const [shareRemarks, setShareRemarks] = useState({});
    const [shareStatusFilter, setShareStatusFilter] = useState('all');
    const [batchRemark, setBatchRemark] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewText, setPreviewText] = useState('');

    const apiService = ApiService();

    // ── Remark Presets: API-backed with localStorage version cache ──────────
    const LS_PRESETS_KEY     = 'remark_presets_cache';   // [{id,label,tag,sort_order}]
    const LS_PRESETS_VERSION = 'remark_presets_version'; // unix timestamp int

    const loadCachedPresets = () => {
        try { return JSON.parse(localStorage.getItem(LS_PRESETS_KEY) || '[]'); } catch { return []; }
    };
    const loadCachedVersion = () => {
        try { return parseInt(localStorage.getItem(LS_PRESETS_VERSION) || '0', 10); } catch { return 0; }
    };

    const [remarkPresets, setRemarkPresets]   = useState(loadCachedPresets);
    const [presetsLoading, setPresetsLoading] = useState(false);

    // Build antd Select options with tag groups (optgroup-style)
    const buildPresetOptions = (presets) => {
        const grouped = {};
        presets.forEach(p => {
            const grp = p.tag || 'General';
            if (!grouped[grp]) grouped[grp] = [];
            grouped[grp].push({ label: p.label, value: p.label });
        });
        return Object.entries(grouped).map(([tag, opts]) => ({ label: tag, options: opts }));
    };
    const presetOptions  = buildPresetOptions(remarkPresets);
    const presetLabels   = remarkPresets.map(p => p.label); // flat list for isPreset checks

    // Version-aware fetch: hit /version first; only pull full list when stale
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const vRes = await apiService.vGet('/api/admin/remark-presets/version');
                const remoteVersion = vRes?.data?.version ?? 0;
                if (remoteVersion === loadCachedVersion() && loadCachedPresets().length > 0) return;

                setPresetsLoading(true);
                const res = await apiService.vGet('/api/admin/remark-presets');
                if (cancelled) return;
                const presets = res?.data?.presets ?? [];
                const version = res?.data?.version ?? remoteVersion;
                setRemarkPresets(presets);
                try {
                    localStorage.setItem(LS_PRESETS_KEY,     JSON.stringify(presets));
                    localStorage.setItem(LS_PRESETS_VERSION, String(version));
                } catch { }
            } catch (e) {
                console.warn('[RemarkPresets] API unavailable, using cache.', e);
            } finally {
                if (!cancelled) setPresetsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Multi-search (localStorage-persistent, toggle default off) ──────────
    const LS_KEY = 'merchant_share_multisearch';
    const LS_TOGGLE_KEY = 'merchant_share_multisearch_enabled';
    const [multiSearchEnabled, setMultiSearchEnabled] = useState(() => {
        try { return localStorage.getItem(LS_TOGGLE_KEY) === 'true'; } catch { return false; }
    });
    const [searchChips, setSearchChips] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
    });
    const [chipInput, setChipInput] = useState('');

    const saveChips = (chips) => {
        setSearchChips(chips);
        try { localStorage.setItem(LS_KEY, JSON.stringify(chips)); } catch { }
    };
    const addChip = (value) => {
        const v = value.trim();
        if (!v || searchChips.includes(v)) return;
        saveChips([...searchChips, v]);
        setChipInput('');
    };
    const removeChip = (chip) => saveChips(searchChips.filter(c => c !== chip));
    const clearChips = () => saveChips([]);
    const toggleMultiSearch = (val) => {
        setMultiSearchEnabled(val);
        try { localStorage.setItem(LS_TOGGLE_KEY, val ? 'true' : 'false'); } catch { }
    };

    // ── Logic ─────────────────────────────────────────────────────────────
    const matchesShareFilter = (r) => {
        // Status filter
        if (shareStatusFilter !== 'all' && String(r.aeps_status) !== shareStatusFilter) return false;

        // Multi-chip mode
        if (multiSearchEnabled && searchChips.length > 0) {
            return searchChips.some(chip => {
                const c = chip.toLowerCase();
                return (
                    r.name?.toLowerCase().includes(c) ||
                    r.contact?.mobile?.includes(c) ||
                    r.contact?.mid?.toLowerCase().includes(c) ||
                    r.contact?.address?.toLowerCase().includes(c)
                );
            });
        }
        if (!shareSearch) return true;
        const s = shareSearch.toLowerCase();
        return (
            r.name?.toLowerCase().includes(s) ||
            r.contact?.mobile?.includes(s) ||
            r.contact?.mid?.toLowerCase().includes(s) ||
            r.contact?.address?.toLowerCase().includes(s)
        );
    };

    const buildWaMessage = (ids) => {
        const WA_STATUS_MAP = {
            0: 'Onboarding Pending',
            1: 'EKYC Pending',
            2: 'Biometric KYC Pending',
            3: 'TwoFA Pending',
            4: 'Working',
        };
        const statusCounts = {};
        const selectedRecords = data.filter(r => ids.includes(r.id));
        selectedRecords.forEach(r => {
            const label = WA_STATUS_MAP[r.aeps_status] ?? 'Unknown';
            statusCounts[label] = (statusCounts[label] || 0) + 1;
        });
        const lines = selectedRecords.map((r, idx) => {
            const name = r.name || 'N/A';
            const shop = r.company_info ? r.company_info.split(' | ').find(p => p.startsWith('Shop:'))?.replace('Shop:', '').trim() : '';
            const mobile = r.contact?.mobile || '';
            const address = r.contact?.address || '';
            const status = WA_STATUS_MAP[r.aeps_status] ?? 'N/A';
            const remark = shareRemarks[r.id] || '';
            let block = `━━━━━━━━━━━━━━━\n*${idx + 1}. ${name}*`;
            if (shop) block += `\n🏪 ${shop}`;
            if (mobile) block += `\n📞 ${mobile}`;
            if (address) block += `\n📍 ${address}`;
            block += `\n⚠️ Status: ${status}`;
            if (remark) block += `\n  Remarks: ${remark}`;
            block += `\n━━━━━━━━━━━━━━━`;
            return block;
        });
        const summaryLines = Object.entries(statusCounts).map(([label, count]) => {
            const icon = label === 'Working' ? '✅' : label === 'TwoFA Pending' ? '⚠️' : label === 'Onboarding Pending' ? '🕒' : '🔷';
            return `* ${icon} ${label}: ${count}`;
        });
        return lines.join('\n\n') + '\n\n⚡ Summary:\n\n' + summaryLines.join('\n');
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <>
            <Modal
                title={
                    <Space>
                        <WhatsAppOutlined style={{ color: '#25D366', fontSize: 18 }} />
                        <span>Share on WhatsApp</span>
                    </Space>
                }
                open={visible}
                onCancel={() => {
                    // Reset selected on full close? Opting to retain state while modal lives.
                    onCancel();
                }}
                width={680}
                footer={[
                    <Space key="footer" style={{ width: '100%', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                            {selectedShareIds.length} of {data.filter(matchesShareFilter).length} selected
                        </span>
                        <Space wrap>
                            <Button onClick={onCancel}>Cancel</Button>
                            <Tooltip title="Copy message to clipboard">
                                <Button
                                    icon={<CopyOutlined />}
                                    disabled={selectedShareIds.length === 0}
                                    onClick={() => {
                                        const msg = buildWaMessage(selectedShareIds);
                                        navigator.clipboard.writeText(msg)
                                            .then(() => antMessage.success('Message copied to clipboard!'))
                                            .catch(() => antMessage.error('Copy failed — please try manually'));
                                    }}
                                >
                                    Copy
                                </Button>
                            </Tooltip>
                            <Tooltip title="Preview message before sending">
                                <Button
                                    icon={<PreviewIcon />}
                                    disabled={selectedShareIds.length === 0}
                                    onClick={() => {
                                        const msg = buildWaMessage(selectedShareIds);
                                        setPreviewText(msg);
                                        setPreviewVisible(true);
                                    }}
                                >
                                    Preview
                                </Button>
                            </Tooltip>
                            <Button
                                type="primary"
                                disabled={selectedShareIds.length === 0}
                                style={{ background: '#25D366', borderColor: '#25D366' }}
                                icon={<WhatsAppOutlined />}
                                onClick={() => {
                                    const message = buildWaMessage(selectedShareIds);
                                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                }}
                            >
                                Send on WhatsApp
                            </Button>
                        </Space>
                    </Space>
                ]}
            >
                {/* ── Row 1: Status filter + Search + Actions ── */}
                <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <Select
                            size="small"
                            value={shareStatusFilter}
                            onChange={v => setShareStatusFilter(v)}
                            style={{ width: 160, flexShrink: 0 }}
                            options={[
                                { label: '🔵 All Statuses', value: 'all' },
                                { label: '🔷 Onboarding Pending', value: '0' },
                                { label: '🟠 EKYC Pending', value: '1' },
                                { label: '🔵 Biometric Pending', value: '2' },
                                { label: '🟢 TwoFA Pending', value: '3' },
                                { label: '🟣 Working', value: '4' },
                            ]}
                        />
                        {multiSearchEnabled ? (
                            <Input
                                placeholder="Type & press Enter to add search pin..."
                                prefix={<i className="fa fa-search" style={{ color: '#bfbfbf' }} />}
                                suffix={
                                    chipInput.trim() ? (
                                        <Tag color="green" style={{ cursor: 'pointer', margin: 0 }} onClick={() => addChip(chipInput)}>+ Add</Tag>
                                    ) : null
                                }
                                value={chipInput}
                                onChange={e => setChipInput(e.target.value)}
                                onPressEnter={() => addChip(chipInput)}
                                style={{ flex: 1 }}
                            />
                        ) : (
                            <Input
                                placeholder="Search by name, mobile or MID..."
                                allowClear
                                prefix={<i className="fa fa-search" style={{ color: '#bfbfbf' }} />}
                                value={shareSearch}
                                onChange={e => setShareSearch(e.target.value)}
                                style={{ flex: 1 }}
                            />
                        )}
                        <Button size="small" icon={<CheckSquareOutlined />}
                            onClick={() => setSelectedShareIds(data.filter(matchesShareFilter).map(r => r.id))}
                        >All</Button>
                        <Button size="small" icon={<BorderOutlined />} onClick={() => setSelectedShareIds([])}>
                            Clear
                        </Button>
                        <Tooltip title={multiSearchEnabled ? 'Multi-search ON — click to disable' : 'Enable multi-search (pin multiple terms, persisted)'}>
                            <Button
                                size="small"
                                type={multiSearchEnabled ? 'primary' : 'default'}
                                style={multiSearchEnabled ? { background: '#1677ff', borderColor: '#1677ff' } : {}}
                                icon={<i className="fa fa-tags" style={{ fontSize: 11 }} />}
                                onClick={() => toggleMultiSearch(!multiSearchEnabled)}
                            />
                        </Tooltip>
                    </div>

                    {/* Row 2: Chips (multi-search mode) */}
                    {multiSearchEnabled && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minHeight: 28 }}>
                            {searchChips.length === 0 ? (
                                <span style={{ fontSize: 11, color: '#bfbfbf' }}>No pins yet — type above &amp; press Enter</span>
                            ) : (
                                <>
                                    {searchChips.map(chip => (
                                        <Tag key={chip} closable color="blue"
                                            onClose={() => removeChip(chip)}
                                            style={{ fontSize: 11 }}
                                        >{chip}</Tag>
                                    ))}
                                    <Tag color="default" style={{ cursor: 'pointer', fontSize: 11 }} onClick={clearChips}>Clear all</Tag>
                                </>
                            )}
                            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#8c8c8c' }}>💾 saved to browser</span>
                        </div>
                    )}

                    {/* Row 3: Batch remark apply */}
                    {selectedShareIds.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, padding: '8px 10px', background: '#fffbe6', borderRadius: 6, border: '1px solid #ffe58f' }}>
                            <i className="fa fa-edit" style={{ color: '#fa8c16', fontSize: 12, flexShrink: 0 }} />
                            <Select
                                size="small"
                                placeholder="Pick preset remark..."
                                style={{ width: 200 }}
                                allowClear
                                options={presetOptions}
                                onChange={v => setBatchRemark(v || '')}
                                value={batchRemark || undefined}
                                loading={presetsLoading}
                            />
                            <Input
                                size="small"
                                placeholder="...or type custom remark"
                                value={batchRemark}
                                onChange={e => setBatchRemark(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => {
                                    if (!batchRemark.trim()) return;
                                    const updates = {};
                                    selectedShareIds.forEach(id => { updates[id] = batchRemark.trim(); });
                                    setShareRemarks(prev => ({ ...prev, ...updates }));
                                    antMessage.success(`Remark applied to ${selectedShareIds.length} merchant(s)`);
                                }}
                            >
                                Apply to Selected
                            </Button>
                        </div>
                    )}
                </div>

                {/* Scrollable card list */}
                <div style={{ maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}>
                    {data
                        .filter(matchesShareFilter)
                        .map(record => {
                            const isChecked = selectedShareIds.includes(record.id);
                            const statusMap = { 0: { text: 'Onboarding Pending', color: '#1890ff' }, 1: { text: 'EKYC Pending', color: '#fa8c16' }, 2: { text: 'Biometric KYC Pending', color: '#13c2c2' }, 3: { text: 'TwoFA Pending', color: '#52c41a' }, 4: { text: 'Working', color: '#722ed1' } };
                            const statusInfo = statusMap[record.aeps_status] || { text: 'N/A', color: '#8c8c8c' };
                            const shop = record.company_info ? record.company_info.split(' | ').find(p => p.startsWith('Shop:'))?.replace('Shop:', '').trim() : '';

                            return (
                                <div
                                    key={record.id}
                                    onClick={() => {
                                        setSelectedShareIds(prev =>
                                            prev.includes(record.id)
                                                ? prev.filter(id => id !== record.id)
                                                : [...prev, record.id]
                                        );
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 10,
                                        padding: '10px 12px',
                                        marginBottom: 8,
                                        borderRadius: 8,
                                        border: isChecked ? '1.5px solid #25D366' : '1px solid #f0f0f0',
                                        background: isChecked ? '#f6ffed' : '#fafafa',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <Checkbox
                                        checked={isChecked}
                                        onChange={() => { }}
                                        onClick={e => e.stopPropagation()}
                                        style={{ marginTop: 3, flexShrink: 0 }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                            <Text strong style={{ fontSize: 13 }}>{record.name}</Text>
                                            <Tag color={statusInfo.color} style={{ fontSize: 10, margin: 0 }}>
                                                {statusInfo.text}
                                            </Tag>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#595959', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                            {shop && <span>🏪 {shop}</span>}
                                            {record.contact?.mobile && <span>📞 {record.contact.mobile}</span>}
                                            {record.contact?.mid && <span style={{ color: '#1890ff' }}>MID: {record.contact.mid}</span>}
                                        </div>
                                        {/* Remarks input + preset selector */}
                                        {isChecked && (
                                            <div style={{ marginTop: 8 }} onClick={e => e.stopPropagation()}>
                                                <Space.Compact style={{ width: '100%' }}>
                                                    <Select
                                                        size="small"
                                                        placeholder="Preset..."
                                                        style={{ width: 140, flexShrink: 0 }}
                                                        allowClear
                                                        loading={presetsLoading}
                                                        options={presetOptions}
                                                        value={shareRemarks[record.id] && presetLabels.includes(shareRemarks[record.id]) ? shareRemarks[record.id] : undefined}
                                                        onChange={v => setShareRemarks(prev => ({ ...prev, [record.id]: v || '' }))}
                                                    />
                                                    <Input
                                                        size="small"
                                                        placeholder="Custom remark..."
                                                        value={shareRemarks[record.id] || ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setShareRemarks(prev => ({ ...prev, [record.id]: val }));
                                                        }}
                                                        prefix={<i className="fa fa-comment" style={{ color: '#bfbfbf', fontSize: 11 }} />}
                                                        style={{ fontSize: 12 }}
                                                    />
                                                </Space.Compact>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                    {data.filter(matchesShareFilter).length === 0 && (
                        <div style={{ textAlign: 'center', padding: 32, color: '#8c8c8c' }}>
                            No merchants found matching your search.
                        </div>
                    )}
                </div>
            </Modal>

            {/* ===== Message Preview Modal ===== */}
            <Modal
                title={
                    <Space>
                        <PreviewIcon style={{ color: '#1677ff' }} />
                        <span>Message Preview</span>
                        <Tag color="blue" style={{ fontSize: 11 }}>{selectedShareIds.length} merchants</Tag>
                    </Space>
                }
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                width={600}
                footer={[
                    <Space key="pf">
                        <Button onClick={() => setPreviewVisible(false)}>Close</Button>
                        <Button
                            icon={<CopyOutlined />}
                            onClick={() => {
                                navigator.clipboard.writeText(previewText)
                                    .then(() => antMessage.success('Copied!'))
                                    .catch(() => antMessage.error('Copy failed'));
                            }}
                        >
                            Copy
                        </Button>
                        <Button
                            type="primary"
                            style={{ background: '#25D366', borderColor: '#25D366' }}
                            icon={<WhatsAppOutlined />}
                            onClick={() => {
                                window.open(`https://wa.me/?text=${encodeURIComponent(previewText)}`, '_blank');
                                setPreviewVisible(false);
                            }}
                        >
                            Send on WhatsApp
                        </Button>
                    </Space>
                ]}
            >
                <div
                    style={{
                        background: '#f6f6f6',
                        border: '1px solid #e8e8e8',
                        borderRadius: 8,
                        padding: '14px 16px',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: 460,
                        overflowY: 'auto',
                        lineHeight: '1.7',
                    }}
                >
                    {previewText}
                </div>
            </Modal>
        </>
    );
};

export default WhatsAppShareModal;
