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
