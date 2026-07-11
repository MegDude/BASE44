type EntityIdentity = {
  displayTypeLabel: string;
  displayTitle: string;
  displaySubtitle?: string;
  displayContext?: string;
  parentEntityName?: string;
};

type EntityIdentityPanelProps = {
  identity: EntityIdentity;
  titleId?: string;
  contextId?: string;
};

export default function EntityIdentityPanel({ identity, titleId, contextId }: EntityIdentityPanelProps) {
  if (!identity?.displayTitle) return null;

  return (
    <section className="dp-entity-identity" aria-label={`${identity.displayTitle} identity`}>
      {identity.displayTypeLabel && <p className="dp-entity-meta">{identity.displayTypeLabel}</p>}
      <h2 id={titleId} className="dp-entity-title">{identity.displayTitle}</h2>
      {identity.displaySubtitle && <p className="dp-entity-subtitle">{identity.displaySubtitle}</p>}
      {identity.displayContext && <p id={contextId} className="dp-entity-context">{identity.displayContext}</p>}
    </section>
  );
}
