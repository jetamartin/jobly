DROP DATABASE IF EXISTS jobly_test;
CREATE DATABASE jobly_test;

DROP TABLE IF EXISTS companies cascade;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;


CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text UNIQUE NOT NULL,
    num_employees INT, 
    description text NOT NULL,
    logo_url text    
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary numeric(8,2) NOT NULL,
    equity numeric(2,2) NOT NULL,
    company_handle text NOT NULL REFERENCES companies
    ON DELETE CASCADE
);

CREATE TABLE users (
    username text PRIMARY KEY, 
    password text NOT NULL, 
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin boolean NOT NULL DEFAULT FALSE 
);

