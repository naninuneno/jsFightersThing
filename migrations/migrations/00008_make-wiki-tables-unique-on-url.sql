ALTER TABLE wiki_fighter DROP COLUMN id;
ALTER TABLE wiki_fighter ADD UNIQUE (wiki_url);
ALTER TABLE wiki_fight DROP COLUMN id;
ALTER TABLE wiki_fight ADD UNIQUE (wiki_url);
