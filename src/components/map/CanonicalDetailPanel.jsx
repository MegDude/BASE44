import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bookmark, Check, ChevronRight } from "lucide-react";
import { PerkIdentityHeader } from "@/components/map/PerkIdentityHeader";
import { handlePanelMediaError } from "@/lib/map/panelMediaPresentation";

function DetailHero({ media }) {
  if (!media?.src) return null;
  return (
    <figure className="dp-native-detail-panel__hero">
      <img src={media.src} alt={media.alt || ""} loading="eager" decoding="async" onError={handlePanelMediaError} />
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  );
}

function ContextStrip({ items = [], label }) {
  const visibleItems = items.filter((item) => item?.label).slice(0, 4);
  if (!visibleItems.length) return null;
  return (
    <ul className="dp-detail-context-strip" aria-label={label}>
      {visibleItems.map(({ icon: Icon, label: itemLabel }) => (
        <li key={itemLabel}>{Icon ? <Icon aria-hidden="true" /> : null}<span>{itemLabel}</span></li>
      ))}
    </ul>
  );
}

function DetailSection({ section, onRelatedSelect, onAnalytics }) {
  if (!section) return null;
  if (section.kind === "rail") {
    if (!section.items?.length) return null;
    return (
      <section className="dp-native-detail-panel__section" aria-labelledby={`${section.id}-title`}>
        <h3 id={`${section.id}-title`}>{section.title}</h3>
        <div
          className="dp-native-rail"
          role="list"
          aria-label={section.ariaLabel || section.title}
          tabIndex={0}
          onScroll={(event) => {
            if (event.currentTarget.dataset.analyticsRecorded) return;
            event.currentTarget.dataset.analyticsRecorded = "true";
            onAnalytics?.("rail_scrolled", { sectionId: section.id });
          }}
        >
          {section.items.map((item) => {
            const content = <>
              {item.image ? <img src={item.image} alt="" loading="lazy" decoding="async" onError={handlePanelMediaError} /> : null}
              <span><strong>{item.title}</strong><small>{item.meta}</small>{item.detail ? <em>{item.detail}</em> : null}</span>
              <ChevronRight aria-hidden="true" />
            </>;
            const trackSelection = () => onAnalytics?.(section.id === "participating-places" ? "perk_location_selected" : "related_entity_opened", { selectedLocationId: item.id, sectionId: section.id });
            return item.href ? (
              <a key={item.id} role="listitem" className={`dp-native-rail__item ${item.image ? "has-media" : ""}`} href={item.href} target={item.external === false ? undefined : "_blank"} rel={item.external === false ? undefined : "noreferrer"} onClick={trackSelection}>{content}</a>
            ) : (
              <button key={item.id} type="button" role="listitem" className={`dp-native-rail__item ${item.image ? "has-media" : ""}`} onClick={() => { trackSelection(); onRelatedSelect?.(item.entity || item); }}>{content}</button>
            );
          })}
        </div>
      </section>
    );
  }
  if (section.kind === "steps") {
    if (!section.items?.length) return null;
    return (
      <section className="dp-native-detail-panel__section" aria-labelledby={`${section.id}-title`}>
        <h3 id={`${section.id}-title`}>{section.title}</h3>
        <ol className="dp-native-detail-steps">{section.items.map((item, index) => <li key={`${section.id}-${item}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
      </section>
    );
  }
  if (section.kind === "terms") {
    if (!section.items?.length) return null;
    return (
      <details className="dp-native-detail-terms" onToggle={(event) => { if (event.currentTarget.open) onAnalytics?.("terms_expanded", { sectionId: section.id }); }}>
        <summary>{section.title}<ChevronRight aria-hidden="true" /></summary>
        <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </details>
    );
  }
  if (!section.body && !section.items?.length) return null;
  return (
    <section className="dp-native-detail-panel__section" aria-labelledby={`${section.id}-title`}>
      <h3 id={`${section.id}-title`}>{section.title}</h3>
      {section.body ? <p className={section.emphasis ? "dp-native-detail-benefit" : ""}>{section.body}</p> : null}
      {section.items?.length ? <ul className="dp-native-detail-list">{section.items.map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}</ul> : null}
    </section>
  );
}

export function DrawerActionFooter({ label, className = "", children }) {
  const anchorRef = useRef(null);
  const [drawerHost, setDrawerHost] = useState(undefined);

  useEffect(() => {
    setDrawerHost(anchorRef.current?.closest?.("#dp-active-map-drawer") || null);
  }, []);

  const actions = (
    <div className={`dp-native-detail-panel__actions dp-canonical-detail-actions ${className}`.trim()} aria-label={label}>
      {children}
    </div>
  );

  return (
    <>
      <span ref={anchorRef} className="dp-drawer-action-anchor" aria-hidden="true" />
      {drawerHost === undefined
        ? null
        : drawerHost?.dataset?.hasDrawerActions === "true"
          ? null
          : drawerHost
            ? createPortal(actions, drawerHost)
            : actions}
    </>
  );
}

export function CanonicalDetailPanel({ model, saved, onSave, onPrimaryAction, onRelatedSelect, onAnalytics }) {
  if (!model) return null;
  return (
    <div className="dp-native-detail-panel" data-entity-type={model.entityType}>
      {model.perkIdentity ? (
        <>
          <PerkIdentityHeader {...model.perkIdentity} titleId={model.titleId} />
          {model.summary ? <p className="dp-perk-detail-intro">{model.summary}</p> : null}
        </>
      ) : (
        <>
          <DetailHero media={model.media} />
          <header className="dp-native-detail-panel__summary">
            <p className="dp-native-detail-panel__eyebrow">{model.eyebrow}</p>
            <h2 id={model.titleId} title={model.title}>{model.title}</h2>
            {model.summary ? <p>{model.summary}</p> : null}
          </header>
        </>
      )}
      <ContextStrip items={model.contextItems} label={`${model.title} details`} />
      <div className="dp-native-detail-panel__modules">
        {model.sections?.map((section) => <DetailSection key={section.id} section={section} onRelatedSelect={onRelatedSelect} onAnalytics={onAnalytics} />)}
      </div>
      <DrawerActionFooter label={`${model.title} actions`}>
        <button type="button" className="dp-native-detail-panel__save" aria-pressed={saved} onClick={() => { onAnalytics?.("entity_saved", { saved: !saved }); onSave?.(); }}>
          <Bookmark aria-hidden="true" />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>
        {model.primaryAction?.href ? (
          <a className="dp-native-detail-panel__primary" href={model.primaryAction.href} target={model.primaryAction.external ? "_blank" : undefined} rel={model.primaryAction.external ? "noreferrer" : undefined} onClick={(event) => { onAnalytics?.("detail_primary_action_tapped", { actionLabel: model.primaryAction.label }); onPrimaryAction?.(event); }}>{model.primaryAction.label}</a>
        ) : (
          <button type="button" className="dp-native-detail-panel__primary" disabled={model.primaryAction?.disabled} onClick={() => { onAnalytics?.("detail_primary_action_tapped", { actionLabel: model.primaryAction?.label }); onPrimaryAction?.(); }}>{model.primaryAction?.label}</button>
        )}
      </DrawerActionFooter>
    </div>
  );
}
