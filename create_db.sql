
-- Goldsmiths University of London
-- Author....: Carlos Manuel de Oliveira Alves
-- Student...: cdeol003
-- Created...: 27/10/2022
-- Lab No....: 2 Part 1

-- Create the database
CREATE DATABASE myBookshop;

-- Use the database
USE myBookshop;

-- Create the table user
CREATE USER
    'appuser' @'localhost' IDENTIFIED
WITH
    mysql_native_password BY 'app2027';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON myBookshop.* TO 'appuser'@'localhost';

-- Create the table book
CREATE TABLE
    books (
        id INT AUTO_INCREMENT NOT NULL UNIQUE,
        name VARCHAR(50),
        price DECIMAL(5, 2) unsigned,
        PRIMARY KEY(id)
    );

-- Insert data into the table book
INSERT INTO books (name, price)
VALUES
('database book', 40.25), ('Node.js book', 25.00), ('Express book', 31.99);

-- Path: create_db.sql
CREATE TABLE 
    users (
        user_id INT NOT NULL AUTO_INCREMENT UNIQUE,
        username VARCHAR(50) NOT NULL,
        firstname VARCHAR(50) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        email VARCHAR (255) NOT NULL,
        hashedPassword CHAR(255),
        PRIMARY KEY(user_id)
    );