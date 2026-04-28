/**
 * useLoanStore is deprecated.
 * All borrower API logic (personal details, upload-slip, apply, fetch loans)
 * has been moved to useBorrowerStore.
 *
 * This file is kept as a re-export to avoid breaking any lingering imports,
 * but you should update those imports to use useBorrowerStore directly.
 */
export { useBorrowerStore as useLoanStore } from './useBorrowerStore';
