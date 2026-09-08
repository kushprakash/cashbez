/**
 * Complaint System - Shared Components Index
 * 
 * Centralized export file for all reusable complaint system components
 * Import like: import { StatusBadge, Modal, Timeline } from '@/components/complaints';
 */

// Badge Components
export { 
    StatusBadge, 
    PriorityBadge, 
    CategoryBadge, 
    WorkloadBadge 
} from './Badges';

// File Upload Component
export { default as FileUploadZone } from './FileUploadZone';

// Timeline Component
export { default as Timeline } from './Timeline';

// Modal Components
export { 
    default as Modal,
    ConfirmModal,
    FormModal,
    AlertModal
} from './Modal';

/**
 * USAGE EXAMPLES:
 * 
 * // Import specific components
 * import { StatusBadge, PriorityBadge } from '@/components/complaints';
 * 
 * // Use in JSX
 * <StatusBadge status="NEW" />
 * <PriorityBadge priority="HIGH" />
 * 
 * // File Upload
 * import { FileUploadZone } from '@/components/complaints';
 * <FileUploadZone 
 *     files={files} 
 *     onChange={setFiles} 
 *     onRemove={(index) => removeFile(index)}
 *     maxSize={10485760}
 *     maxFiles={5}
 * />
 * 
 * // Timeline
 * import { Timeline } from '@/components/complaints';
 * <Timeline items={complaint.actions} />
 * 
 * // Modal
 * import { Modal, ConfirmModal, FormModal } from '@/components/complaints';
 * <Modal show={showModal} onClose={() => setShowModal(false)} title="My Modal">
 *     Modal content here
 * </Modal>
 * 
 * <ConfirmModal 
 *     show={showConfirm}
 *     onClose={() => setShowConfirm(false)}
 *     onConfirm={handleDelete}
 *     message="Are you sure you want to delete this?"
 * />
 */
