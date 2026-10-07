/**
 * The decision behind the policy-update notice, as a pure function so it can be tested
 * without a DOM. `lib/ui/policy-notice.tsx` supplies the three inputs from localStorage and
 * the cookie-consent context and carries out whichever action comes back.
 *
 * Privacy Policy §12 promises a notice on the Site when the policy materially changes. The
 * awkward case it has to get right is the first-ever visitor: they are reading the current
 * policy, so showing them "we changed it" would be a false statement about a version they
 * never saw. They get marked as having seen the current version instead, silently.
 */

export type PolicyNoticeAction =
  /** Show the notice — this visitor last saw an older version. */
  | "show"
  /** Record the current version without showing anything — first visit. */
  | "markSeen"
  /** Nothing to do — already seen this version. */
  | "none";

export function decidePolicyNotice({
  seen,
  version,
  hasPriorVisit,
}: {
  /** Version string previously recorded for this visitor, or null when none is stored. */
  seen: string | null;
  /** The policy's current `PRIVACY_LAST_UPDATED`. */
  version: string;
  /**
   * Whether this visitor has been on the site before. Derived from a stored cookie decision,
   * which is written on the first visit and outlives it — see the hook for why that proxy is
   * the right one and which way it errs.
   */
  hasPriorVisit: boolean;
}): PolicyNoticeAction {
  if (seen === version) return "none";
  // Checked before `seen`: someone carrying an older version with no prior visit cleared
  // their storage between the two writes, and telling them the policy changed would be a
  // guess. Marking seen is the honest, quiet outcome.
  if (!hasPriorVisit) return "markSeen";
  return "show";
}
