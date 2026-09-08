import React from 'react';

/**
 * Status Badge Component
 * Displays complaint status with appropriate color coding
 */
export const StatusBadge = ({ status }) => {
    const getBadgeClass = (status) => {
        const badges = {
            'NEW': 'badge bg-info',
            'ACKNOWLEDGED': 'badge bg-primary',
            'IN_PROGRESS': 'badge bg-warning text-dark',
            'RESOLVED': 'badge bg-success',
            'CLOSED': 'badge bg-secondary',
            'REOPENED': 'badge bg-danger'
        };
        return badges[status] || 'badge bg-secondary';
    };

    return (
        <span className={getBadgeClass(status)}>
            {status.replace('_', ' ')}
        </span>
    );
};

/**
 * Priority Badge Component
 * Displays complaint priority with color coding
 */
export const PriorityBadge = ({ priority }) => {
    const getBadgeClass = (priority) => {
        const badges = {
            'LOW': 'badge bg-secondary',
            'MEDIUM': 'badge bg-info',
            'HIGH': 'badge bg-warning text-dark',
            'URGENT': 'badge bg-danger'
        };
        return badges[priority] || 'badge bg-secondary';
    };

    return (
        <span className={getBadgeClass(priority)}>
            {priority}
        </span>
    );
};

/**
 * Category Badge Component
 * Displays complaint category with color coding
 */
export const CategoryBadge = ({ category }) => {
    const getBadgeClass = (category) => {
        const badges = {
            'TRANSACTION': 'badge bg-primary',
            'ACCOUNT': 'badge bg-success',
            'TECHNICAL': 'badge bg-info',
            'BILLING': 'badge bg-warning text-dark',
            'KYC': 'badge bg-danger',
            'OTHER': 'badge bg-secondary'
        };
        return badges[category] || 'badge bg-secondary';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'TRANSACTION': 'Transaction',
            'ACCOUNT': 'Account',
            'TECHNICAL': 'Technical',
            'BILLING': 'Billing',
            'KYC': 'KYC',
            'OTHER': 'Other'
        };
        return labels[category] || category;
    };

    return (
        <span className={getBadgeClass(category)}>
            {getCategoryLabel(category)}
        </span>
    );
};

/**
 * Workload Status Badge Component
 * Shows staff workload level with color coding
 */
export const WorkloadBadge = ({ count, avgWorkload }) => {
    if (count === 0) {
        return <span className="badge bg-secondary">No Load</span>;
    }

    const ratio = count / avgWorkload;
    let badgeClass, label;

    if (ratio < 0.7) {
        badgeClass = 'badge bg-success';
        label = 'Light';
    } else if (ratio < 1.0) {
        badgeClass = 'badge bg-info';
        label = 'Normal';
    } else if (ratio < 1.3) {
        badgeClass = 'badge bg-warning text-dark';
        label = 'Heavy';
    } else {
        badgeClass = 'badge bg-danger';
        label = 'Overloaded';
    }

    return <span className={badgeClass}>{label}</span>;
};

export default { StatusBadge, PriorityBadge, CategoryBadge, WorkloadBadge };
