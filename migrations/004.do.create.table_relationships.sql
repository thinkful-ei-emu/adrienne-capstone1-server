ALTER TABLE packing_list
  ADD COLUMN
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE transportation
  ADD COLUMN
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;