CREATE TABLE wiki_fighter
(
  ID        SERIAL PRIMARY KEY,
  fighter INTEGER REFERENCES fighters(ID),
  wiki_url VARCHAR(100)
);
