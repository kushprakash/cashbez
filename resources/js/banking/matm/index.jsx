import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom';
import Pageheader from '../../layouts/Pageheader';
import ApiService from '../../core/services/ApiService';

import { AuthContext } from '../../core/hooks/context';
import { notify } from '../../core/messages/Toast';

import PrintAepsReceipt from './matmReceipt';
import MatmHistory from './history';

const MAtmService = () => {
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [merchantId] = useState(userData.mid);
    const [merchantPin] = useState(userData.mobile);
    const [error, setError] = useState(null);
    const [isLogin, setIsLogin] = useState(null);
    const [selectedMode, setSelectedMode] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    const [deviceMessage, setDeviceMessage] = useState(null);
    const [deviceStatus, setDeviceStatus] = useState(null);
    const [history, setHistory] = useState([]);
    // Withdrawal form state
    const [mobileNumber, setMobileNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [remarks, setRemarks] = useState('');
    const [withdrawLoading, setWithdrawLoading] = useState(false);


    const [txnType, setTxnType] = useState(2);
    // Modal state for receipt
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    const handleTxnTypeClick = async (value) => {
        setTxnType(value);


        if (value === 6) {
            setLoading(true);
            setError(null);
            try {
                const apiService = ApiService();
                const response = await apiService.vPost('api/matm-list');
                const { data } = response;
                if (data.status === 1) {
                    setHistory(data.data);
                } else {
                    notify.error(data.message || 'Failed to fetch bill payment history.');
                }
            } catch (err) {
                notify.error('An unexpected error occurred while fetching bill payment history.');
            } finally {
                setLoading(false);
            }
        }
    };


    const sendData = async (data) => {
        setLoading(true);
        try {
            const apiService = ApiService();
            await apiService.vPost(`/api/v2/matm-request`, { outletId: merchantId, mobile: mobileNumber, data: data, platform: 'Web' });

        } catch (error) {
            notify.error('MATM BE Request Log Sending failed.');
        } finally {
            setLoading(false);
        }
    };


    // Perform Login
    const handleLogin = async () => {

        try {

            const apiService = ApiService();
            const resp = await apiService.vPost(`/api/v2/matm-config`, { outletId: merchantId, type: 'login' });

            // const encryptedData = encrypt(JSON.stringify(loginRequestData));
            if (resp.data) {

                if (resp.data.status == 1) {

                    const response = await axios.post(
                        'http://localhost:8680/matmweb/Login',
                        resp.data.data,
                        {
                            headers: { 'Content-Type': 'text/plain' },
                        }
                    );

                    const result = response.data;
                    setIsLogin(result.status);
                    if (result.status) sessionStorage.setItem('matmtoken', result.token);

                } else {
                    setIsLogin(false);
                    notify.error(resp.data.message || 'Login Failed.');
                }

            } else {
                setIsLogin(false);
                notify.error('Login Session Expired.');
            }

        } catch (error) {
            console.error('Login error:', error);
            setIsLogin(false);
        }
    };

    useEffect(() => {
        handleLogin();
    }, []);

    // useEffect(() => {
    //     setReceiptData({ "terminalId": "NSD83721", "requestTransactionTime": "22\/01\/2026 17:14:16", "transactionAmount": 0, "transactionStatus": "successful", "balanceAmount": 2.67, "bankRRN": "602217769457", "transactionType": "BAL", "fpTransactionId": "MABB7482723220126171416020W", "errorCode": "00", "errorMessage": "Success", "merchantTransactionId": "MATMCB096833", "arpc": "911047E25F9B80C4000000000000000000008A02303030309F3602000B", "cardType": "RuPay", "bankName": "IDBI BANK", "cardNumber": "************3251" });
    //     setIsReceiptModalOpen(true);
    // });


    // Connect to device
    const handleConnectDevice = async () => {
        setIsLoading(true);
        setDeviceMessage(null); // reset previous message
        try {

            const response = await axios.get(
                'http://localhost:8680/matmweb/ConnectDevice',
                {
                    headers: {
                        token: sessionStorage.getItem('matmtoken'),
                        mode: selectedMode,
                    },
                }
            );

            const result = response.data;
            setDeviceMessage(result.message);
            setDeviceStatus(result.status);
            if (result.status) {
                notify.success(result.message || 'Device connected successfully.');
            } else {
                notify.error(result.message || 'Device connection failed.');
            }

        } catch (error) {
            console.error('ConnectDevice error:', error);
            setDeviceMessage('Failed to connect device.');
            setDeviceStatus(false);

            if (error.response?.data?.message) {
                notify.error(error.response.data.message);
            } else {
                notify.error('Internal server error');
            }
        } finally {
            setIsLoading(false);
        }
    };


    // Get latitude and longitude as Promise using Geolocation API
    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation is not supported by your browser');
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude.toFixed(6),
                            longitude: position.coords.longitude.toFixed(6),
                        });
                    },
                    (error) => {
                        reject(error.message || 'Unable to retrieve location');
                    }
                );
            }
        });
    };

    const handleWithdrawalSubmit = async (e) => {
        e.preventDefault();

        if (!mobileNumber) {
            notify.error('Please enter the Mobile Number.');
            return;
        }

        if (txnType === 2 || txnType === 3) {
            if (!amount || isNaN(amount) || Number(amount) <= 0) {
                notify.error('Please enter a valid amount.');
                return;
            }

        }


        setWithdrawLoading(true);

        try {
            const location = await getLocation().catch(() => ({
                latitude: '0.0',
                longitude: '0.0',
            }));

            const apiService = ApiService();
            const resp = await apiService.vPost(`/api/v2/matm-config`, {
                data: {
                    mobileNumber,
                    remarks,
                    txnType: txnType,
                    amount,
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
                outletId: merchantId,
                type: 'doTransaction'
            });

            if (resp.data) {

                if (resp.data.status == 1) {

                    const response = await axios.post(
                        'http://localhost:8680/matmweb/DoTransaction',
                        resp.data.data,
                        {
                            headers: {
                                'Content-Type': 'text/plain',
                                token: sessionStorage.getItem('matmtoken'),
                            },
                        }
                    );

                    const result = response.data;

                    if (result.status) {

                        await sendData(result.data);

                        if (result.data.errorCode === '00' && result.data.errorMessage === 'Success') {
                            notify.success(result.message || 'Withdrawal successful.');
                            setMobileNumber('');
                            setAmount('');
                            setRemarks('');
                            setReceiptData(result.data);
                            setIsReceiptModalOpen(true);
                        } else {

                            notify.error(result.message || 'Withdrawal not successful.');
                        }

                    } else {
                        notify.error(result.message || 'Withdrawal failed.');
                    }

                } else {
                    setIsLogin(false);
                    notify.error(resp.data.message || 'Login Failed.');
                }

            } else {
                setIsLogin(false);
                notify.error('Login Session Expired.');
            }



        } catch (error) {
            console.error('Withdrawal error:', error);
            notify.error('Withdrawal request failed.');
        } finally {
            setWithdrawLoading(false);
        }
    };


    return (
        <>
            <Pageheader
                mainheading="M-ATM Service"
                parentfolder="Home"
                activepage="M-ATM Service"
            />

            <div className="container py-5" >
                {isLogin === null && (
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>Authenticating...</p>
                    </div>
                )}

                {isLogin === false && (
                    <div className="text-center text-danger">
                        <h4>Login Failed</h4>
                        <p>Please check your credentials or contact support.</p>
                    </div>
                )}

                {isLogin === true && (
                    <div className="card p-4 shadow-sm">
                        {!deviceStatus && (
                            <>
                                <h4
                                    className="mb-4"
                                    style={{
                                        color: '#0d6efd',
                                        fontWeight: '700',
                                        textAlign: 'center',
                                        fontSize: '1.75rem',
                                        borderBottom: '2px solid #0d6efd',
                                        paddingBottom: '0.5rem',
                                        marginBottom: '2rem',
                                    }}
                                >
                                    Connect to Device
                                </h4>

                                <form
                                    style={{
                                        background: '#f9f9f9',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
                                        maxWidth: '600px',
                                        margin: '0 auto',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '20px',
                                            marginBottom: '24px',
                                        }}
                                    >
                                        {['0', '1'].map((mode) => {
                                            const isSelected = selectedMode === mode;
                                            const isUSB = mode === '0';
                                            const label = isUSB ? 'USB' : 'Bluetooth';

                                            return (
                                                <label
                                                    key={mode}
                                                    htmlFor={`mode-${label.toLowerCase()}`}
                                                    style={{
                                                        padding: '12px 24px',
                                                        borderRadius: '10px',
                                                        border: isSelected ? '2px solid #0d6efd' : '1px solid #ccc',
                                                        backgroundColor: isSelected ? '#e6f0ff' : '#ffffff',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '1rem',
                                                        color: isSelected ? '#0d6efd' : '#555',
                                                        boxShadow: isSelected
                                                            ? '0 4px 10px rgba(13, 110, 253, 0.2)'
                                                            : '0 2px 5px rgba(0, 0, 0, 0.05)',
                                                        transition: 'all 0.3s ease-in-out',
                                                    }}
                                                >
                                                    {label}
                                                    <input
                                                        type="radio"
                                                        id={`mode-${label.toLowerCase()}`}
                                                        name="deviceMode"
                                                        value={mode}
                                                        checked={isSelected}
                                                        onChange={(e) => setSelectedMode(e.target.value)}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleConnectDevice}
                                            disabled={isLoading}
                                            style={{
                                                padding: '12px 32px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, #0d6efd, #2563eb)',
                                                border: 'none',
                                                color: '#fff',
                                                boxShadow: '0 6px 18px rgba(13, 110, 253, 0.4)',
                                                transition: 'all 0.3s ease-in-out',
                                            }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm me-2" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    Connecting...
                                                </>
                                            ) : (
                                                'Connect Device'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>


                        )}

                        {deviceStatus && (


                            <>
                                <h4 className="mb-4 text-primary"> {selectedMode == 0 ? 'USB' : 'Bluetooth'} Device Connected</h4>



                                <div className="row mb-4 g-3">
                                    {[
                                        { label: 'Cash Withdraw', value: 2 },
                                        //  { label: 'Cash Deposit', value: 3 },
                                        { label: 'Balance Enq', value: 1 },
                                        //  { label: 'Mini Statement', value: 4 },
                                        { label: 'Transactions', value: 6 },
                                    ].map((item) => (
                                        <div className="col-6 col-md-3" key={item.value}>
                                            <button
                                                type="button"
                                                className={`btn w-100 ${txnType === item.value ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => {
                                                    if (item.value == 6) {
                                                        setTxnType(6);
                                                        setIsTxnModalOpen(true);
                                                    } else {
                                                        handleTxnTypeClick(item.value);
                                                    }
                                                }}
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                    fontWeight: txnType === item.value ? 'bold' : 'normal',
                                                    boxShadow: txnType === item.value
                                                        ? '0 4px 12px #0d6efd)'
                                                        : '0 2px 4px rgba(0,0,0,0.05)',
                                                    transition: 'all 0.2s ease-in-out',
                                                    borderRadius: '8px',
                                                    padding: '5px 5px',
                                                }}
                                            >
                                                {item.label}
                                            </button>



                                        </div>
                                    ))}
                                </div>

                                {(txnType === 6) && isTxnModalOpen && (

                                    <MatmHistory isHeader={false} />
                                )}


                                {(txnType != 6) && (
                                    <form onSubmit={handleWithdrawalSubmit}>
                                        <div className="mb-3">
                                            <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="mobileNumber"
                                                placeholder="Enter mobile number"
                                                value={mobileNumber}
                                                onChange={(e) => setMobileNumber(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {(txnType === 2 || txnType === 3) && (
                                            <>
                                                <div className="mb-3">
                                                    <label htmlFor="amount" className="form-label">Amount</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="amount"
                                                        placeholder="Enter amount"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        required
                                                        min="1"
                                                    />
                                                </div>


                                            </>
                                        )}

                                        <div className="mb-3">
                                            <label htmlFor="remarks" className="form-label">Remarks</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="remarks"
                                                placeholder="Enter remarks (optional)"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                            />
                                        </div>

                                        <div className="text-end">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleWithdrawalSubmit}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Submit Withdrawal'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                        {/* 
                        {deviceMessage && (
                            <Alert variant={deviceStatus ? 'success' : 'danger'} className="mt-4">
                                {deviceMessage}
                            </Alert>
                        )} */}
                    </div>
                )}
            </div>
            {/* Receipt Modal */}
            {isReceiptModalOpen && (
                <div className="modal" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '800px',
                        overflow: 'auto',
                    }}>
                        <div className="d-flex justify-content-end mb-2">
                            <button
                                onClick={() => setIsReceiptModalOpen(false)}
                                className="btn btn-sm btn-outline-secondary"
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        {/* Pass receiptData as state prop to PrintAepsReceipt */}
                        <PrintAepsReceipt state={receiptData} />
                    </div>
                </div>
            )}
        </>
    );
};

export default MAtmService;