
DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR (255),
  formatted_query VARCHAR (255),
  latitude Decimal(8,6),
  longitude Decimal(9,6)
)
-- INSERT INTO cities(search_query,formatted_query,latitude,longitude) 
-- VALUES ('select', 'ffff', '555', '777');
-- SELECT * FROM cities;















