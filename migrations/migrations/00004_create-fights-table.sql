CREATE TABLE fights
(
  ID        SERIAL PRIMARY KEY,
  fighter_1 INTEGER REFERENCES fighters(ID),
  fighter_2 INTEGER REFERENCES fighters(ID),
  date date
);
