DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL CHECK (username <> ''),
    comment VARCHAR(300) NOT NULL CHECK (comment <> ''),
    image_id INT REFERENCES images(id) NOT NULL
);
