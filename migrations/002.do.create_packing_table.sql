CREATE TABLE packing_list (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  item TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT now() NOT NULL
)