CREATE TABLE events
(
  id SERIAL PRIMARY KEY,
  date date
);

CREATE TABLE wiki_event
(
  wiki_url VARCHAR(100) UNIQUE,
  event INTEGER references events(id)
);


ALTER TABLE wiki_fight DROP COLUMN wiki_url;
ALTER TABLE fights DROP COLUMN date, ADD COLUMN event INTEGER REFERENCES events(id);
