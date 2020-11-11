DROP DATABASE IF EXISTS jobly_test;
DROP DATABASE IF EXISTS jobly;
CREATE DATABASE jobly_test;
CREATE DATABASE jobly;

DROP TABLE IF EXISTS companies;
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
    company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted timestamp with time zone DEFAULT NOW()  
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

INSERT INTO companies 
 (handle, name, num_employees, description, logo_url)
 VALUES 
    ('NF', 'NetFlix', 888, 'Movie streaming service', 'www.nf_url.com');

INSERT INTO jobs 
 (title, salary, equity, company_handle, date_posted)
 VALUES
    ('Software Eng', 100000, .3, 'NF', current_timestamp);

INSERT INTO jobs 
 (title, salary, equity, company_handle, date_posted)
 VALUES
    ('Website Designer', 60000, .3, 'NF', current_timestamp);

INSERT INTO jobs 
 (title, salary, equity, company_handle, date_posted)
 VALUES
    ('Web Developer, Backend', 100000, .3, 'NF', current_timestamp);

INSERT INTO jobs 
 (title, salary, equity, company_handle, date_posted)
 VALUES
    ('Web Developer, FrontEnd', 90000, .3, 'NF', current_timestamp);


