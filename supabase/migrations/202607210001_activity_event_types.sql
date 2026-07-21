-- Commit event labels before transactional civic functions reference them.
alter type public.activity_event_type add value if not exists 'home_opened';
alter type public.activity_event_type add value if not exists 'map_opened';
alter type public.activity_event_type add value if not exists 'event_rsvp';
alter type public.activity_event_type add value if not exists 'civic_action_opened';
alter type public.activity_event_type add value if not exists 'civic_update_viewed';
alter type public.activity_event_type add value if not exists 'civic_survey_started';
alter type public.activity_event_type add value if not exists 'civic_survey_completed';
alter type public.activity_event_type add value if not exists 'civic_event_rsvp';
alter type public.activity_event_type add value if not exists 'civic_project_followed';
alter type public.activity_event_type add value if not exists 'civic_action_dismissed';
alter type public.activity_event_type add value if not exists 'ai_query_submitted';
alter type public.activity_event_type add value if not exists 'recommendation_opened';
