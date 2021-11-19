ALTER TABLE fights
  ADD COLUMN weight_class VARCHAR(30),
  ADD COLUMN result VARCHAR(50),
  ADD COLUMN round smallint,
  ADD COLUMN time VARCHAR(10);
