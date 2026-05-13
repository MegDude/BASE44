/**
 * Validates a component design spec for UX simplicity.
 *
 * @param {{ user?: string, problem?: string, action?: string, steps?: any[], elements?: number }} component
 *   - user: target user role ('partner' | 'resident' | other)
 *   - problem: the user problem the component solves
 *   - action: the primary action the user can take
 *   - steps: ordered list of user steps required to complete the flow
 *   - elements: count of distinct interactive elements in the component
 * @returns {{ hasClearUser: boolean, hasClearProblem: boolean, hasClearAction: boolean, stepCount: number, passesStepLimit: boolean, passesSimplicity: boolean }}
 *   passesStepLimit: partner flows allow ≤5 steps; resident flows allow ≤4
 *   passesSimplicity: component must have ≤6 interactive elements
 */
export function validateComponent(component) {
  return {
    hasClearUser: Boolean(component.user),
    hasClearProblem: Boolean(component.problem),
    hasClearAction: Boolean(component.action),
    stepCount: component.steps?.length || 0,
    passesStepLimit: (component.steps?.length || 0) <= (component.user === 'partner' ? 5 : 4),
    passesSimplicity: (component.elements || 0) <= 6,
  };
}
