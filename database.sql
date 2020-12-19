CREATE database helpme;

-- \c into helpme

CREATE TABLE app_user(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR NOT NULL
);

CREATE TABLE question(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR,
    description VARCHAR,
    CONSTRAINT fk_question_user 
    FOREIGN KEY(user_id) REFERENCES app_user(id)
);

CREATE TABLE response(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    title VARCHAR,
    description VARCHAR,
    CONSTRAINT fk_response_user 
    FOREIGN KEY(user_id) REFERENCES app_user(id),
    CONSTRAINT fk_response_response 
    FOREIGN KEY(question_id) REFERENCES question(id),
);

CREATE TABLE response_like(
    user_id INT NOT NULL,
    response_id INT NOT NULL,
    PRIMARY KEY(user_id, response_id),
    CONSTRAINT fk_response_like_user 
    FOREIGN KEY(user_id) REFERENCES app_user(id),
    CONSTRAINT fk_response_like_response 
    FOREIGN KEY(response_id) REFERENCES response(id),
);