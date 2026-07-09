CREATE DATABASE IF NOT EXISTS career_tracker;
USE career_tracker;

CREATE TABLE students (
  student_id    INT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  usn           VARCHAR(20)  UNIQUE NOT NULL,
  branch        VARCHAR(50),
  semester      INT,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  resume_url    VARCHAR(255),
  cgpa          DECIMAL(3,2),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
  skill_id    INT PRIMARY KEY AUTO_INCREMENT,
  student_id  INT NOT NULL,
  skill_name  VARCHAR(100) NOT NULL,
  proficiency ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
  source      VARCHAR(50) DEFAULT 'Manual',
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE certifications (
  cert_id         INT PRIMARY KEY AUTO_INCREMENT,
  student_id      INT NOT NULL,
  cert_name       VARCHAR(150) NOT NULL,
  platform        VARCHAR(100),
  completion_date DATE,
  expiry_date     DATE,
  proof_url       VARCHAR(255),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE projects (
  project_id  INT PRIMARY KEY AUTO_INCREMENT,
  student_id  INT NOT NULL,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  tech_stack  VARCHAR(255),
  project_url VARCHAR(255),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE companies (
  company_id   INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(150) UNIQUE NOT NULL,
  industry     VARCHAR(100),
  website      VARCHAR(255)
);

CREATE TABLE applications (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id     INT NOT NULL,
  company_id     INT NOT NULL,
  role           VARCHAR(100) NOT NULL,
  applied_date   DATE,
  platform       VARCHAR(100),
  deadline       DATE,
  status         ENUM('Applied','Assessment','Interview','Rejected','Selected') DEFAULT 'Applied',
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE RESTRICT
);

CREATE TABLE interview_rounds (
  round_id       INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  round_number   INT,
  round_type     ENUM('Online Test','Technical','HR','Group Discussion','Final'),
  interview_date DATE,
  outcome        ENUM('Passed','Failed','Pending') DEFAULT 'Pending',
  notes          TEXT,
  prep_status    ENUM('Not Started','In Progress','Ready') DEFAULT 'Not Started',
  FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
);
