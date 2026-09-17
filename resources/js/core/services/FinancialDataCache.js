/**
 * FinancialDataCache
 * High-performance in-memory cache for agent financial members, plans, and accounts.
 * Eliminates repeated network round-trips and guarantees instant modal opens.
 */

let membersCache = null;
let membershipPlansCache = null;
let plansCache = {}; // Keyed by serviceType (e.g., 'SAVING', 'DD', 'RD', 'FD', 'MIS')
let savingAccountsCache = null;

export const FinancialDataCache = {
    // ── Members ──────────────────────────────────────────────────────────
    getMembers: async (api, force = false) => {
        if (membersCache && membersCache.length > 0 && !force) return membersCache;
        try {
            const res = await api.vGet('/api/agent/financial/members?per_page=100');
            if (res.data?.status === 1) {
                membersCache = res.data.data?.data || res.data.data || [];
                return membersCache;
            }
        } catch (e) {
            console.error('Failed to fetch members for cache', e);
        }
        return membersCache || [];
    },

    getCachedMembers: () => membersCache || [],

    // ── Membership Plans (for Member Registration) ───────────────────────
    getMembershipPlans: async (api, force = false) => {
        if (membershipPlansCache && membershipPlansCache.length > 0 && !force) return membershipPlansCache;
        try {
            const res = await api.vGet('/api/financial/membership-plans?status=ACTIVE');
            if (res.data?.status === 1) {
                membershipPlansCache = res.data.data || [];
                return membershipPlansCache;
            }
        } catch (e) {
            console.error('Failed to fetch membership plans for cache', e);
        }
        return membershipPlansCache || [];
    },

    getCachedMembershipPlans: () => membershipPlansCache || [],

    // ── Service Plans (SAVING, DD, RD, FD, MIS) ──────────────────────────
    getPlans: async (api, serviceType, force = false) => {
        if (plansCache[serviceType] && plansCache[serviceType].length > 0 && !force) return plansCache[serviceType];
        try {
            const res = await api.vGet(`/api/financial/plans?service_type=${serviceType}&status=ACTIVE`);
            if (res.data?.status === 1) {
                plansCache[serviceType] = res.data.data || [];
                return plansCache[serviceType];
            }
        } catch (e) {
            console.error(`Failed to fetch plans for ${serviceType}`, e);
        }
        return plansCache[serviceType] || [];
    },

    getCachedPlans: (serviceType) => plansCache[serviceType] || [],

    // ── Saving Accounts ──────────────────────────────────────────────────
    getSavingAccounts: async (api, force = false) => {
        if (savingAccountsCache && savingAccountsCache.length > 0 && !force) return savingAccountsCache;
        try {
            const res = await api.vGet('/api/agent/financial/saving/accounts?per_page=100');
            if (res.data?.status === 1) {
                savingAccountsCache = res.data.data?.data || res.data.data || [];
                return savingAccountsCache;
            }
        } catch (e) {
            console.error('Failed to fetch saving accounts for cache', e);
        }
        return savingAccountsCache || [];
    },

    getCachedSavingAccounts: () => savingAccountsCache || [],

    // ── Cache Invalidation ───────────────────────────────────────────────
    invalidateMembers: () => { membersCache = null; },
    invalidateSavingAccounts: () => { savingAccountsCache = null; },
    invalidatePlans: (serviceType) => {
        if (serviceType) delete plansCache[serviceType];
        else { plansCache = {}; membershipPlansCache = null; }
    },
    invalidateAll: () => {
        membersCache = null;
        membershipPlansCache = null;
        plansCache = {};
        savingAccountsCache = null;
    }
};

export default FinancialDataCache;
