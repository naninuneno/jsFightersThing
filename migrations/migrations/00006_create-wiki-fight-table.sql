CREATE TABLE wiki_fight
(
  ID        SERIAL PRIMARY KEY,
  fight INTEGER REFERENCES fights(ID),
  wiki_url VARCHAR(100)
);
