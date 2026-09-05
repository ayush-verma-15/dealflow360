const CUSTOMER_TIERS = ['Bronze', 'Silver', 'Gold'];
const ROLES = ['sales_rep', 'sales_manager', 'finance', 'customer', 'admin'];
const APPROVAL_STATUSES = ['draft', 'pending-manager', 'pending-finance', 'approved', 'rejected', 'negotiation'];

module.exports = {
	CUSTOMER_TIERS,
	ROLES,
	APPROVAL_STATUSES,
	DEFAULT_CURRENCY: 'INR',
	DEFAULT_PAGE_SIZE: 25
};
