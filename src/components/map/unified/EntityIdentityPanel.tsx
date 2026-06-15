type EntityIdentity = {
  displayTypeLabel: string;
  displayTitle: string;
  displaySubtitle?: string;
  displayContext?: string;
  parentEntityName?: string;
};

type EntityIdentityPanelProps = {
  identity: EntityIdentity;
};

export default function EntityIdentityPanel({ identity }: EntityIdentityPanelProps) {
  if (!identity?.displayTitle) return null;

  return (
    <section className="dp-entity-identity" aria-label={`${identity.displayTitle} identity`}>
      {identity.displayTypeLabel && <p className="dp-entity-meta">{identity.displayTypeLabel}</p>}
      <h2 className="dp-entity-title">{identity.displayTitle}</h2>
      {identity.displaySubtitle && <p className="dp-entity-subtitle">{identity.displaySubtitle}</p>}
      {identity.parentEntityName && identity.parentEntityName !== identity.displaySubtitle && (
        <p className="dp-entity-subtitle">{identity.parentEntityName}</p>
      )}
      {identity.displayContext && <p className="dp-entity-context">{identity.displayContext}</p>}
    </section>
  );
}
