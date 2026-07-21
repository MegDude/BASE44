-- Cover civic foreign keys used by workspace, delivery, and source queries.
-- The canonical response table already owns a unique constraint for one
-- resident response per consultation, so remove the redundant reconciliation index.

drop index if exists public.governance_response_resident_unique_idx;

create index if not exists civic_action_followups_consultation_idx
  on public.civic_action_followups(consultation_id);
create index if not exists civic_action_followups_organization_idx
  on public.civic_action_followups(organization_id);
create index if not exists civic_action_followups_creator_idx
  on public.civic_action_followups(created_by_partner_user_id)
  where created_by_partner_user_id is not null;

create index if not exists civic_signals_source_record_idx
  on public.civic_signals(source_record_id)
  where source_record_id is not null;

create index if not exists governance_consultations_organization_idx
  on public.governance_consultations(organization_id);
create index if not exists governance_consultations_portfolio_idx
  on public.governance_consultations(portfolio_id)
  where portfolio_id is not null;
create index if not exists governance_consultations_listing_idx
  on public.governance_consultations(listing_id)
  where listing_id is not null;
create index if not exists governance_consultations_initiative_idx
  on public.governance_consultations(initiative_id)
  where initiative_id is not null;
create index if not exists governance_consultations_creator_idx
  on public.governance_consultations(created_by_partner_user_id)
  where created_by_partner_user_id is not null;

create index if not exists user_activity_events_partner_organization_idx
  on public.user_activity_events(partner_organization_id, occurred_at desc)
  where partner_organization_id is not null;
