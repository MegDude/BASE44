import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  BarChart3,
  Bookmark,
  Building2,
  CalendarPlus,
  Download,
  MapPin,
  Megaphone,
  MessageSquare,
  Route,
  Sparkles,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function DPSurface({ children, className = "", variant = "section", as: Component = "div", ...props }) {
  return (
    <Component className={cn("dp-surface", `dp-surface-${variant}`, className)} {...props}>
      {children}
    </Component>
  );
}

export function DPDetailFramework({
  eyebrow,
  title,
  subtitle,
  status,
  description,
  meta = [],
  primaryActions = [],
  secondaryActions = [],
  onAction,
  children,
  className = "",
}) {
  return (
    <DPSurface as="aside" variant="panel" className={cn("dp-detail-framework", className)}>
      <header className="dp-detail-framework-header">
        <div className="dp-detail-heading-row">
          <div className="min-w-0">
            <p className="dp-eyebrow">{eyebrow}</p>
            <h2 className="dp-detail-title">{title}</h2>
          </div>

          {status && <span className="dp-status-chip">{status}</span>}
        </div>

        {subtitle && <p className="dp-detail-subtitle">{subtitle}</p>}
        {description && <p className="dp-detail-description">{description}</p>}

        {meta.length > 0 && (
          <dl className="dp-detail-meta-grid">
            {meta.map((item) => (
              <div key={`${item.label}-${item.value}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      {(primaryActions.length > 0 || secondaryActions.length > 0) && (
        <div className="dp-detail-actions">
          {primaryActions.map((action) => (
            <button key={action.action} className="dp-button dp-button-primary" type="button" onClick={() => onAction?.(action.action)}>
              {action.label}
            </button>
          ))}

          {secondaryActions.map((action) => (
            <button key={action.action} className="dp-button dp-button-secondary" type="button" onClick={() => onAction?.(action.action)}>
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="dp-detail-content">{children}</div>
    </DPSurface>
  );
}

const quickActionIcons = {
  Sparkles,
  CalendarPlus,
  Megaphone,
  Bookmark,
  BadgeCheck,
  Building2,
  Route,
  Download,
  MessageSquare,
  BarChart3,
  Users,
  MapPin,
};

export const quickActionsByEntityType = {
  venue: [
    { label: "Launch Offer", icon: "Sparkles", action: "launch-offer" },
    { label: "Add Event", icon: "CalendarPlus", action: "add-event" },
    { label: "View Saves", icon: "Bookmark", action: "view-saves" },
    { label: "Traffic", icon: "Route", action: "traffic" },
    { label: "Buildings", icon: "Building2", action: "nearby-buildings" },
    { label: "Export", icon: "Download", action: "export-report" },
  ],
  property: [
    { label: "Post Update", icon: "Megaphone", action: "post-update" },
    { label: "Message", icon: "MessageSquare", action: "resident-message" },
    { label: "View Perks", icon: "Sparkles", action: "view-perks" },
    { label: "Events", icon: "CalendarPlus", action: "nearby-events" },
    { label: "Residents", icon: "Users", action: "resident-report" },
    { label: "Export", icon: "Download", action: "export-report" },
  ],
  event: [
    { label: "RSVP List", icon: "Users", action: "rsvp-list" },
    { label: "Promote", icon: "Megaphone", action: "promote-event" },
    { label: "Share", icon: "Route", action: "share-event" },
    { label: "Sponsor", icon: "BadgeCheck", action: "add-sponsor" },
    { label: "Venue", icon: "MapPin", action: "view-venue" },
    { label: "Analytics", icon: "BarChart3", action: "analytics" },
  ],
  perk: [
    { label: "Edit Perk", icon: "Sparkles", action: "edit-perk" },
    { label: "Redemptions", icon: "BadgeCheck", action: "redemptions" },
    { label: "Saves", icon: "Bookmark", action: "saves" },
    { label: "Promote", icon: "Megaphone", action: "promote-perk" },
    { label: "Nearby", icon: "MapPin", action: "nearby" },
    { label: "Export", icon: "Download", action: "export-report" },
  ],
  parking: [
    { label: "Edit Inventory", icon: "Building2", action: "edit-inventory" },
    { label: "Promote", icon: "Megaphone", action: "promote-parking" },
    { label: "Reservations", icon: "BadgeCheck", action: "reservations" },
    { label: "Demand", icon: "BarChart3", action: "parking-demand" },
    { label: "Directions", icon: "Route", action: "directions" },
    { label: "Export", icon: "Download", action: "export-report" },
  ],
};

export function DPQuickActions({ title = "Quick Actions", actions = [], onAction }) {
  if (!actions.length) return null;

  return (
    <section className="dp-surface-section-block dp-quick-actions">
      <div className="dp-section-header">
        <p className="dp-eyebrow">{title}</p>
      </div>

      <div className="dp-quick-action-grid">
        {actions.map((item, index) => {
          const Icon = quickActionIcons[item.icon] || Sparkles;

          return (
            <motion.button
              key={item.action}
              className="dp-quick-action"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.025, duration: 0.18 }}
              whileHover={{ y: -2 }}
              type="button"
              onClick={() => onAction?.(item.action)}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

export function DPMetricCards({ metrics = [] }) {
  if (!metrics.length) return null;

  return (
    <section className="dp-metric-grid">
      {metrics.map((metric) => (
        <DPSurface key={metric.label} variant="tile" className="dp-metric-card">
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          {(metric.detail || metric.trend) && (
            <p>
              {metric.detail}
              {metric.trend ? ` · ${metric.trend}` : ""}
            </p>
          )}
        </DPSurface>
      ))}
    </section>
  );
}

export function DPRelatedCarousel({ title, items = [], onSelect }) {
  if (!items.length) return null;

  return (
    <section className="dp-related-carousel">
      <div className="dp-section-header">
        <p className="dp-eyebrow">{title}</p>
      </div>

      <div className="dp-related-rail">
        {items.map((item) => (
          <DPSurface
            key={`${item.title}-${item.subtitle || ""}`}
            as={onSelect ? "button" : "article"}
            type={onSelect ? "button" : undefined}
            variant="railItem"
            className="dp-related-card"
            onClick={onSelect ? () => onSelect(item) : undefined}
          >
            {item.image && (
              <div className="dp-related-image">
                <img src={item.image} alt={item.title} />
                {item.label && <span>{item.label}</span>}
              </div>
            )}

            <div className="dp-related-body">
              <h4>{item.title}</h4>
              {item.subtitle && <p>{item.subtitle}</p>}

              {item.meta?.length > 0 && (
                <div className="dp-related-meta">
                  {item.meta.map((meta) => (
                    <span key={meta}>{meta}</span>
                  ))}
                </div>
              )}

              {item.cta && <span className="dp-button dp-button-secondary">{item.cta}</span>}
            </div>
          </DPSurface>
        ))}
      </div>
    </section>
  );
}

export function DPPricingRail({ title = "Packages", items = [], onSelect }) {
  if (!items.length) return null;

  return (
    <section className="dp-pricing-rail-section">
      <div className="dp-section-header">
        <p className="dp-eyebrow">{title}</p>
      </div>

      <div className="dp-pricing-rail">
        {items.map((item) => (
          <DPSurface key={item.name} variant="railItem" className={cn("dp-pricing-card", item.recommended && "is-recommended")}>
            {item.recommended && <span className="dp-recommended-chip">Recommended</span>}
            <h4>{item.name}</h4>
            <p>{item.audience}</p>
            <strong>{item.price}</strong>
            <span>{item.description}</span>

            {item.features?.length > 0 && (
              <ul>
                {item.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            )}

            <button className="dp-button dp-button-primary" type="button" onClick={() => onSelect?.(item)}>
              Select
            </button>
          </DPSurface>
        ))}
      </div>
    </section>
  );
}

export function DPScheduleSessions({
  eyebrow = "Schedule",
  title = "Available Sessions",
  description,
  sessions = [],
  onPrimaryAction,
  onSecondaryAction,
}) {
  if (!sessions.length) return null;

  return (
    <section className="dp-schedule-sessions">
      <header className="dp-section-header-stack">
        <p className="dp-eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </header>

      <div className="dp-session-list">
        {sessions.map((session) => {
          const capacityPercent =
            session.capacity && session.booked
              ? Math.min((session.booked / session.capacity) * 100, 100)
              : 0;
          const isDisabled = session.status === "full" || session.status === "closed";

          return (
            <DPSurface key={session.id} as="article" variant="tile" className="dp-session-card">
              <div className="dp-session-main">
                <div className="min-w-0">
                  <div className="dp-session-topline">
                    <span>{session.type}</span>
                    {session.status && <em className={`dp-session-status is-${session.status}`}>{session.status}</em>}
                  </div>

                  <h4>{session.title}</h4>

                  {(session.host || session.location || session.duration) && (
                    <p>
                      {[session.host, session.location, session.duration].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>

                <div className="dp-session-time">
                  <strong>{session.time}</strong>
                  <span>{session.date}</span>
                </div>
              </div>

              {session.capacity && (
                <div className="dp-session-capacity">
                  <div className="dp-capacity-row">
                    <span>
                      {session.booked || 0}/{session.capacity} booked
                    </span>
                    <span>{Math.round(capacityPercent)}%</span>
                  </div>

                  <div className="dp-capacity-track" aria-hidden="true">
                    <div style={{ width: `${capacityPercent}%` }} />
                  </div>
                </div>
              )}

              {(session.primaryAction || session.secondaryAction) && (
                <div className="dp-session-actions">
                  {session.primaryAction && (
                    <button
                      className="dp-button dp-button-primary"
                      type="button"
                      disabled={isDisabled}
                      onClick={() => onPrimaryAction?.(session.id)}
                    >
                      {session.primaryAction}
                    </button>
                  )}

                  {session.secondaryAction && (
                    <button className="dp-button dp-button-secondary" type="button" onClick={() => onSecondaryAction?.(session.id)}>
                      {session.secondaryAction}
                    </button>
                  )}
                </div>
              )}
            </DPSurface>
          );
        })}
      </div>
    </section>
  );
}

export function DPParkingReservation({ item, mode = "resident", onReserve, onEditInventory }) {
  const [selectedSlotId, setSelectedSlotId] = useState(item?.timeSlots?.[0]?.id || "");
  const [selectedType, setSelectedType] = useState(item?.spotTypes?.[0] || "");
  const [selectedFloor, setSelectedFloor] = useState(item?.floors?.[0] || "");
  const [vehicleLabel, setVehicleLabel] = useState("");

  const selectedSlot = useMemo(
    () => item?.timeSlots?.find((slot) => slot.id === selectedSlotId),
    [item?.timeSlots, selectedSlotId]
  );

  if (!item) return null;

  const availablePercent = item.totalSpots
    ? Math.min((item.availableSpots / item.totalSpots) * 100, 100)
    : 0;

  return (
    <section className="dp-parking-reservation">
      <header className="dp-section-header-stack">
        <p className="dp-eyebrow">{mode === "resident" ? "Reserve Parking" : "Parking Inventory"}</p>
        <h3>{mode === "resident" ? "Choose a time window" : "Manage reservable spaces"}</h3>
      </header>

      <DPSurface variant="tile" className="dp-parking-availability">
        <div>
          <span>Available now</span>
          <strong>
            {item.availableSpots}/{item.totalSpots}
          </strong>
        </div>

        <div className="dp-parking-capacity-track" aria-hidden="true">
          <div style={{ width: `${availablePercent}%` }} />
        </div>
      </DPSurface>

      <div className="dp-parking-slots">
        {item.timeSlots.map((slot) => {
          const isDisabled = slot.status === "full" || slot.status === "closed";

          return (
            <button
              key={slot.id}
              type="button"
              className={cn("dp-parking-slot", selectedSlotId === slot.id && "is-selected")}
              disabled={isDisabled}
              onClick={() => setSelectedSlotId(slot.id)}
            >
              <span>{slot.label}</span>
              <strong>{slot.perkPrice || slot.price}</strong>
              <em>{slot.availableSpots} spots</em>
            </button>
          );
        })}
      </div>

      {item.spotTypes?.length > 0 && (
        <div className="dp-parking-option-group">
          <span>Spot type</span>
          <div>
            {item.spotTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={cn(selectedType === type && "is-selected")}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {item.floors?.length > 0 && (
        <div className="dp-parking-option-group">
          <span>Garage zone</span>
          <div>
            {item.floors.map((floor) => (
              <button
                key={floor}
                type="button"
                className={cn(selectedFloor === floor && "is-selected")}
                onClick={() => setSelectedFloor(floor)}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "resident" && (
        <label className="dp-vehicle-field">
          <span>Vehicle</span>
          <input
            value={vehicleLabel}
            onChange={(event) => setVehicleLabel(event.target.value)}
            placeholder="Optional: blue Honda, plate ending 123"
          />
        </label>
      )}

      <div className="dp-parking-summary">
        <span>Selected</span>
        <strong>
          {selectedSlot?.label || "Choose a time"} {selectedSlot ? `· ${selectedSlot.perkPrice || selectedSlot.price}` : ""}
        </strong>
      </div>

      <div className="dp-session-actions">
        {mode === "resident" ? (
          <button
            className="dp-button dp-button-primary"
            type="button"
            disabled={!selectedSlot}
            onClick={() =>
              selectedSlot &&
              onReserve?.({
                parkingId: item.id,
                timeSlotId: selectedSlot.id,
                spotType: selectedType,
                floor: selectedFloor,
                vehicleLabel,
              })
            }
          >
            Reserve Parking
          </button>
        ) : (
          <button className="dp-button dp-button-primary" type="button" onClick={() => onEditInventory?.(item.id)}>
            Edit Inventory
          </button>
        )}

        <button className="dp-button dp-button-secondary" type="button">
          Directions
        </button>
      </div>
    </section>
  );
}
