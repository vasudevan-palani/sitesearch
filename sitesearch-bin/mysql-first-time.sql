CREATE USER 'oozie'@'localhost' IDENTIFIED BY 'oozie';
GRANT ALL PRIVILEGES ON *.* TO 'oozie'@'localhost';
CREATE DATABASE oozie;

CREATE USER 'nutch'@'localhost' IDENTIFIED BY 'nutch';
GRANT ALL PRIVILEGES ON *.* TO 'nutch'@'localhost';
CREATE DATABASE nutch;
