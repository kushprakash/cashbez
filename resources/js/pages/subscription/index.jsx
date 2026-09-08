import React, { useEffect, useState } from 'react';
import ApiService from '../../core/services/ApiService';
import './Subscription.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../layouts/Loader';
import Pageheader from '../../layouts/Pageheader';

// Modal component for Subscription Payment & MPIN Verification
function ConfirmModal({ show, onClose, onConfirm, plan, moduleName, userAccounts, submitting, onMpinSetSuccess }) {
	const [mpin, setMpin] = useState('');
	const [showMpin, setShowMpin] = useState(false);

	// State for inline MPIN creation if not set
	const [newMpin, setNewMpin] = useState('');
	const [confirmMpin, setConfirmMpin] = useState('');
	const [showNewMpin, setShowNewMpin] = useState(false);
	const [settingMpin, setSettingMpin] = useState(false);
	const [mpinSetLocally, setMpinSetLocally] = useState(false);

	// Always select Utility Wallet (primary_status === 0 / false)
	const utilityAccount = (userAccounts && userAccounts.length > 0)
		? (userAccounts.find(a => Number(a.primary_status) === 0 || a.primary_status === false) || userAccounts[0])
		: null;

	useEffect(() => {
		if (show) {
			setMpin('');
			setNewMpin('');
			setConfirmMpin('');
			setMpinSetLocally(false);
		}
	}, [show]);

	if (!show || !plan) return null;

	const hasMpin = Boolean(utilityAccount?.has_mpin || mpinSetLocally);

	const handleSetMpin = (e) => {
		e.preventDefault();
		if (!newMpin || newMpin.length !== 4) {
			toast.error('Please enter a valid 4-digit MPIN');
			return;
		}
		if (newMpin !== confirmMpin) {
			toast.error('New MPIN and Confirm MPIN do not match');
			return;
		}
		if (!utilityAccount) {
			toast.error('Utility wallet account not found');
			return;
		}

		setSettingMpin(true);
		const apiService = ApiService();
		apiService.vPost('/api/subscription/set-mpin', {
			account_id: utilityAccount.id,
			newMpin: newMpin,
			confirmMpin: confirmMpin,
		})
		.then(res => {
			setSettingMpin(false);
			if (res.data && res.data.status === 1) {
				toast.success('MPIN set successfully! Enter your MPIN to complete payment.');
				setMpinSetLocally(true);
				setMpin(newMpin);
				if (onMpinSetSuccess) onMpinSetSuccess();
			} else {
				toast.error(res.data?.message || 'Failed to set MPIN');
			}
		})
		.catch(err => {
			setSettingMpin(false);
			toast.error(err?.response?.data?.message || 'Failed to set MPIN');
		});
	};

	const handleSubmitPayment = (e) => {
		e.preventDefault();
		if (!utilityAccount) {
			toast.error('No Utility Wallet account found for payment.');
			return;
		}
		if (!mpin || mpin.length !== 4) {
			toast.error('Please enter a valid 4-digit MPIN');
			return;
		}
		onConfirm({ accountId: utilityAccount.id, mpin });
	};

	return (
		<div className="modal-backdrop-custom">
			<div className="modal-center-custom" style={{ maxWidth: '480px', width: '90%' }}>
				<div className="modal-content-custom p-4">
					<div className="text-center mb-3">
						<div className="badge bg-primary-subtle text-primary fs-6 px-3 py-1 rounded-pill mb-2">
							{moduleName} Service
						</div>
						<h4 className="fw-bold mb-1">Confirm Subscription Payment</h4>
						<p className="text-muted small">Complete payment using your Utility Wallet</p>
					</div>

					{/* Plan Details Card */}
					<div className="bg-light p-3 rounded-3 mb-3 border text-center">
						<div className="fw-bold fs-5 text-dark mb-1">{plan.title}</div>
						<div className="fw-bold fs-3 text-primary mb-2">{plan.priceText}</div>
						{plan.features && plan.features.length > 0 && (
							<ul className="text-start small text-muted mb-0 ps-3">
								{plan.features.map((f, i) => (
									<li key={i} className="mb-1">{f}</li>
								))}
							</ul>
						)}
					</div>

					{/* Single Utility Wallet Info Box (No Dropdown) */}
					<div className="mb-3 text-start">
						<label className="form-label small fw-bold text-dark mb-1">
							Payment Wallet (Utility Wallet)
						</label>
						{utilityAccount ? (
							<div className="border rounded-3 p-3 bg-light d-flex justify-content-between align-items-center">
								<div>
									<div className="fw-bold text-dark">{utilityAccount.name || 'Utility Wallet'}</div>
									<div className="text-muted small">Acc: {utilityAccount.number || 'N/A'}</div>
								</div>
								<div className="text-end">
									<div className="small text-muted">Available Balance</div>
									<div className="fw-bold text-success fs-6">
										₹{Number(utilityAccount.available_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
									</div>
								</div>
							</div>
						) : (
							<div className="alert alert-warning py-2 small mb-0">No Utility Wallet found for payment.</div>
						)}
					</div>

					{/* Inline MPIN Setup Form if MPIN is not set */}
					{!hasMpin ? (
						<form onSubmit={handleSetMpin}>
							<div className="alert alert-warning p-2 small mb-3">
								<i className="ri-error-warning-line me-1"></i> MPIN is not set for your wallet. Please set a 4-digit MPIN to proceed.
							</div>
							<div className="mb-3 text-start">
								<label className="form-label small fw-bold text-dark mb-1">Set New 4-Digit MPIN</label>
								<input
									type={showNewMpin ? "text" : "password"}
									className="form-control text-center fs-5 fw-bold"
									placeholder="••••"
									maxLength={4}
									value={newMpin}
									onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, ''))}
									required
									autoFocus
								/>
							</div>
							<div className="mb-3 text-start">
								<label className="form-label small fw-bold text-dark mb-1">Confirm 4-Digit MPIN</label>
								<input
									type={showNewMpin ? "text" : "password"}
									className="form-control text-center fs-5 fw-bold"
									placeholder="••••"
									maxLength={4}
									value={confirmMpin}
									onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, ''))}
									required
								/>
							</div>
							<div className="form-check text-start mb-3">
								<input
									type="checkbox"
									className="form-check-input"
									id="showMpinChk"
									checked={showNewMpin}
									onChange={(e) => setShowNewMpin(e.target.checked)}
								/>
								<label className="form-check-label small" htmlFor="showMpinChk">Show MPIN</label>
							</div>

							<div className="d-flex justify-content-end gap-2">
								<button type="button" className="btn btn-secondary px-4 py-2" onClick={onClose} disabled={settingMpin}>
									Cancel
								</button>
								<button type="submit" className="btn btn-warning px-4 py-2 fw-bold" disabled={settingMpin || newMpin.length !== 4 || confirmMpin.length !== 4}>
									{settingMpin ? 'Setting MPIN...' : 'Set MPIN & Proceed'}
								</button>
							</div>
						</form>
					) : (
						<form onSubmit={handleSubmitPayment}>
							{/* MPIN Entry */}
							<div className="mb-4 text-start">
								<label className="form-label small fw-bold text-dark mb-1">Enter 4-Digit MPIN</label>
								<div className="input-group">
									<input
										type={showMpin ? "text" : "password"}
										className="form-control text-center fs-4 fw-bold"
										placeholder="••••"
										maxLength={4}
										value={mpin}
										onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
										required
										autoFocus
									/>
									<button
										type="button"
										className="btn btn-outline-secondary"
										onClick={() => setShowMpin(!showMpin)}
									>
										{showMpin ? 'Hide' : 'Show'}
									</button>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="d-flex justify-content-end gap-2">
								<button type="button" className="btn btn-secondary px-4 py-2" onClick={onClose} disabled={submitting}>
									Cancel
								</button>
								<button type="submit" className="btn btn-primary px-4 py-2 fw-bold" disabled={submitting || !mpin || mpin.length !== 4}>
									{submitting ? 'Processing Payment...' : `Confirm & Pay ${plan.priceText}`}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}

const Subscription = () => {
	const [modules, setModules] = useState([]);
	const [activeModule, setActiveModule] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeSubscriptions, setActiveSubscriptions] = useState([]);
	const [userAccounts, setUserAccounts] = useState([]);
	const [activeTab, setActiveTab] = useState('plans'); // 'plans', 'history', 'faq'
	const [submitting, setSubmitting] = useState(false);
	const [modal, setModal] = useState({ show: false, plan: null, moduleId: null, planId: null, mainModuleId: 1 });

	const fetchSubscriptionData = () => {
		const apiService = ApiService();
		apiService.vGet('/api/subscriptions?main_module_id=1').then(res => {
			if (res.data && res.data.status === 1) {
				let modulesList = [];
				if (res.data.mainModules && res.data.mainModules.length > 0) {
					const mainModule = res.data.mainModules.find(mm => mm.id === 1);
					if (mainModule && mainModule.modules) {
						modulesList = mainModule.modules.map(module => ({
							...module,
							mainModuleId: 1,
							mainModuleName: mainModule.name
						}));
					}
				}
				setModules(modulesList);
				setActiveSubscriptions(res.data.activeSubscriptions || []);
				setUserAccounts(res.data.userAccounts || []);
				if (modulesList.length > 0 && !activeModule) {
					setActiveModule(modulesList[0].id);
				}
			}
			setLoading(false);
		});
	};

	useEffect(() => {
		fetchSubscriptionData();
	}, []);

	const currentModule = modules.find(m => m.id === activeModule);
	const currentPlans = currentModule?.plans || [];

	const isPlanActive = (plan, moduleId) => {
		const sub = activeSubscriptions.find(
			s => String(s.main_module_id) === "1" && 
				 String(s.module_id) === String(moduleId) && 
				 String(plan.id) === String(s.plan_id)
		);
		if (!sub) return false;
		const now = new Date();
		const endAt = new Date(sub.end_at);
		return endAt > now;
	};

	const isPlanExpired = (plan, moduleId) => {
		const sub = activeSubscriptions.find(
			s => String(s.main_module_id) === "1" && 
				 String(s.module_id) === String(moduleId) && 
				 String(plan.id) === String(s.plan_id)
		);
		if (!sub) return false;
		const now = new Date();
		const endAt = new Date(sub.end_at);
		return endAt <= now;
	};

	const getActiveExpiryDate = (plan, moduleId) => {
		const sub = activeSubscriptions.find(
			s => String(s.main_module_id) === "1" && 
				 String(s.module_id) === String(moduleId) && 
				 String(plan.id) === String(s.plan_id)
		);
		if (!sub) return null;
		return sub.end_at;
	};

	function getCountdownParts(expiryDate) {
		if (!expiryDate) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
		const now = new Date();
		let diff = new Date(expiryDate) - now;
		if (diff < 0) diff = 0;
		const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
		const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
		const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);
		return { years, months, days, hours, minutes, seconds };
	}

	function useCountdown(expiryDate) {
		const [countdown, setCountdown] = useState(getCountdownParts(expiryDate));
		useEffect(() => {
			setCountdown(getCountdownParts(expiryDate));
			if (!expiryDate) return;
			const interval = setInterval(() => {
				setCountdown(getCountdownParts(expiryDate));
			}, 1000);
			return () => clearInterval(interval);
		}, [expiryDate]);
		return countdown;
	}

	const activePlanStyle = {
		marginTop: '-8px',
		boxShadow: '0 8px 32px rgba(40,167,69,0.10), 0 2px 8px #28a74533',
		border: '2.5px solid #28a745',
		background: '#fff',
		color: 'inherit',
		fontWeight: 'normal',
		transition: 'all 0.2s',
	};

	const activeExpiryStyle = {
		marginTop: '1.5rem !important',
		fontWeight: 400,
		fontSize: '1rem',
		color: '#218838',
		background: 'none',
		borderRadius: '1.2rem',
		padding: '0.5rem 1.1rem',
		border: '2px solid #28a745',
		boxShadow: '0 2px 8px #28a74522',
	};

	const expiredExpiryStyle = {
		marginTop: '1.5rem',
		fontWeight: 400,
		fontSize: '1rem',
		color: '#dc3545',
		background: 'none',
		borderRadius: '1.2rem',
		padding: '0.5rem 1.1rem',
	};

	function PlanCard({ plan, isActive, isExpired, expiryDate, activePlanStyle, expiredExpiryStyle, activeExpiryStyle, moduleId, onShowModal }) {
		const countdownParts = useCountdown(expiryDate);
		return (
			<div
				className={`plan-card w-100 h-100 p-4 text-center border rounded-4 shadow-sm d-flex flex-column justify-content-between position-relative${isActive ? ' active-plan-border' : ''}${isExpired ? ' expired-plan' : ''}`}
				style={isActive ? activePlanStyle : {transition: 'all 0.2s'}}
			>
				<div>
					<h3 className="fw-bold mb-3">{plan.title}</h3>
					<ul className="list-unstyled mb-3">
						{plan.features.map(f => (
							<li key={f} className="mb-2 text-start">
								<span className="text-success me-2">✓</span>
								{f}
							</li>
						))}
					</ul>
					<div className="fw-bold fs-3 mb-2" style={{ color: '#ff3b5c' }}>{plan.priceText}</div>
				</div>
				{isActive && expiryDate && (
					<div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'0.5rem'}}>
						<span className="blinking-clock" style={{fontSize:'1.5rem',marginBottom:'0.2rem'}} role="img" aria-label="clock">⏰</span>
						<div className="dot-clock-row">
							<div className="dot-clock-circle"><span>{countdownParts.days}</span><div className="dot-clock-label">D</div></div>
							<div className="dot-clock-circle"><span>{countdownParts.months}</span><div className="dot-clock-label">M</div></div>
							<div className="dot-clock-circle"><span>{countdownParts.years}</span><div className="dot-clock-label">Y</div></div>
							<div className="dot-clock-circle"><span>{String(countdownParts.hours).padStart(2,'0')}</span><div className="dot-clock-label">H</div></div>
							<div className="dot-clock-circle"><span>{String(countdownParts.minutes).padStart(2,'0')}</span><div className="dot-clock-label">M</div></div>
							<div className="dot-clock-circle"><span>{String(countdownParts.seconds).padStart(2,'0')}</span><div className="dot-clock-label">S</div></div>
						</div>
					</div>
				)}
				{isActive && expiryDate ? (
					<div style={activeExpiryStyle}>
						Expiry: {expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB') : ''}
					</div>
				) : isExpired && expiryDate ? (
					<div style={expiredExpiryStyle}>
						Expired: {expiryDate ? new Date(expiryDate).toLocaleDateString('en-GB') : ''}
						<button className="btn btn-primary w-100 mt-3 bg-danger" onClick={() => onShowModal(plan, moduleId, plan.id)}>Renew Now</button>
					</div>
				) : !isActive && !isExpired ? (
					<button
						className="btn btn-primary w-100 mt-3"
						onClick={() => onShowModal(plan, moduleId, plan.id)}
					>
						Buy Now
					</button>
				) : null}
			</div>
		);
	}

	const handleShowModal = (plan, moduleId, planId) => {
		setModal({ show: true, plan, moduleId, planId, mainModuleId: 1 });
	};

	const handleModalClose = () => {
		if (submitting) return;
		setModal({ show: false, plan: null, moduleId: null, planId: null, mainModuleId: 1 });
	};

	const handleModalConfirm = ({ accountId, mpin }) => {
		setSubmitting(true);
		const apiService = ApiService();
		apiService.vPost('/api/user-subscribe', { 
			main_module_id: 1,
			module_id: modal.moduleId, 
			plan_id: modal.planId,
			account_id: accountId,
			mpin: mpin
		})
			.then(res => {
				setSubmitting(false);
				if (res.data && res.data.status === 1) {
					handleModalClose();
					fetchSubscriptionData();
					toast.success(res.data.message || 'Subscription purchased successfully!');
				} else {
					toast.error(res.data?.message || 'Subscription payment failed.');
				}
			})
			.catch(err => {
				setSubmitting(false);
				toast.error(err?.response?.data?.message || 'Transaction failed. Check MPIN and wallet balance.');
			});
	};

	return (
		<>
			<Pageheader mainheading="Subscription Plans" parentfolder="Subscriptions" activepage="Plans" />
			<div className="page-content-box">
				<div className="page-content-box-inner">
					<div className="subscription-page" style={{ marginTop: '-30px' }}>
						
						{/* Module Tabs */}
						<div className="main-module-tabs d-flex flex-wrap justify-content-center mb-3">
							{modules.map(module => (
								<button
									key={module.id}
									className={`tab-btn${activeTab === 'plans' && activeModule === module.id ? ' active' : ''}`}
									onClick={() => { 
										setActiveTab('plans'); 
										setActiveModule(module.id); 
									}}
								>
									{module.name}
								</button>
							))}
							<button className={`tab-btn${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>
								Payment History
							</button>
							<button className={`tab-btn${activeTab === 'faq' ? ' active' : ''}`} onClick={() => setActiveTab('faq')}>
								FAQ
							</button>
						</div>

						<h2 className="text-center fw-bold mb-4">
							{activeTab === 'plans' ? 'Plans & Pricing' : activeTab === 'history' ? 'Payment History' : 'FAQ'}
						</h2>
						{loading ? (
							<div className="text-center py-5"><Loader/></div>
						) : (
							<>
								{activeTab === 'plans' && (
									<div className="row justify-content-center g-2">
										{currentPlans.map((plan, idx) => {
											const isActive = isPlanActive(plan, activeModule);
											const isExpired = isPlanExpired(plan, activeModule);
											const expiryDate = getActiveExpiryDate(plan, activeModule);
											return (
												<div
													className={`col-12 col-md-6 col-lg-3 d-flex align-items-stretch${isActive || isExpired ? ' selected-plan-col' : ''}`}
													key={plan.title + idx}
													style={(isActive || isExpired) ? {zIndex:2, position:'relative'} : {}}
												>
													<PlanCard
														plan={plan}
														isActive={isActive}
														isExpired={isExpired}
														expiryDate={expiryDate}
														activePlanStyle={activePlanStyle}
														expiredExpiryStyle={expiredExpiryStyle}
														activeExpiryStyle={activeExpiryStyle}
														moduleId={activeModule}
														onShowModal={handleShowModal}
													/>
												</div>
											);
										})}
									</div>
								)}
								{activeTab === 'history' && (
									<div className="payment-history-card card p-4 mb-4">
										<h4 className="mb-3">Your Payment History</h4>
										<div className="text-muted">(Demo) No payment records found.</div>
									</div>
								)}
								{activeTab === 'faq' && (
									<div className="faq-card card p-4 mb-4">
										<h4 className="mb-3">Frequently Asked Questions</h4>
										<ul className="faq-list">
											<li><b>How do I renew my plan?</b> Click the "Renew Now" button on your expired plan card.</li>
											<li><b>Can I upgrade my plan?</b> Yes, simply purchase a higher plan from the list.</li>
											<li><b>What happens when my plan expires?</b> You will lose access to premium features until you renew.</li>
										</ul>
									</div>
								)}
							</>
						)}
					</div>
				</div>
				<ConfirmModal
					show={modal.show}
					onClose={handleModalClose}
					onConfirm={handleModalConfirm}
					plan={modal.plan}
					moduleName={currentModule?.name || ''}
					userAccounts={userAccounts}
					submitting={submitting}
					onMpinSetSuccess={fetchSubscriptionData}
				/>
				<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
			</div>
		</>
	);
};

export default Subscription;
