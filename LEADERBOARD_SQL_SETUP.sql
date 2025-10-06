CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_activity_type TEXT,
  p_points INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO activity_points (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  CASE p_activity_type
    WHEN 'add_experience' THEN
      UPDATE activity_points
      SET experiences_added = experiences_added + 1,
          total_points      = total_points + COALESCE(p_points, 0),
          updated_at        = NOW()
      WHERE user_id = p_user_id;

    WHEN 'fix_experience' THEN
      UPDATE activity_points
      SET experiences_fixed = experiences_fixed + 1,
          total_points      = total_points + COALESCE(p_points, 0),
          updated_at        = NOW()
      WHERE user_id = p_user_id;

    WHEN 'verify_experience' THEN
      UPDATE activity_points
      SET experiences_verified = experiences_verified + 1,
          total_points         = total_points + COALESCE(p_points, 0),
          updated_at           = NOW()
      WHERE user_id = p_user_id;

    WHEN 'sponsor_experience' THEN
      UPDATE activity_points
      SET experiences_sponsored = experiences_sponsored + 1,
          total_points           = total_points + COALESCE(p_points, 0),
          updated_at             = NOW()
      WHERE user_id = p_user_id;

    ELSE
      RAISE EXCEPTION 'Unsupported activity type: %', p_activity_type;
  END CASE;
END;
$$ LANGUAGE plpgsql;