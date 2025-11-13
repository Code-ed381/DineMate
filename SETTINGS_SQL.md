INSERT INTO restaurant_settings (restaurant_id, key, value, created_at, updated_at)
VALUES
(
  '4c9fa3ba-f1d2-4d40-899c-47076b851a51',
  'general',
  jsonb_build_object(
    'show_data_and_time_on_navbar', true,
    'allow_notifications', true,
    'show_breadcrumb', true,
    'show_light_night_toggle', true
  ),
  now(),
  now()
)
ON CONFLICT (restaurant_id, key)
DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();
