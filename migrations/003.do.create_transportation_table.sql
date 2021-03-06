CREATE TABLE transportation (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  transport_date TEXT NOT NULL,
  transport_time TEXT NOT NULL,
  transport_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  transport_type TEXT NOT NULL,
  transport_number TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT now() NOT NULL
);