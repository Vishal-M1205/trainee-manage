CREATE DATABASE Training_Management

USE Training_Management

CREATE TABLE EMPLOYEE (
ID INT IDENTITY(1,1) PRIMARY KEY,
NAME VARCHAR(200) NOT NULL,
EMAIL VARCHAR(200) UNIQUE NOT NULL,
PASSWORD VARCHAR(200) NOT NULL,
DOB VARCHAR(200) NOT NULL,
GENDER VARCHAR(10) CHECK (GENDER IN ('Male','Female')),
DEPARTMENT VARCHAR(100) NOT NULL,
DESIGNATION VARCHAR(100) NOT NULL,
ROLE VARCHAR(100) DEFAULT 'Employee'
)

INSERT INTO EMPLOYEE
(
    NAME,
    EMAIL,
    PASSWORD,
    DOB,
    GENDER,
    DEPARTMENT,
    DESIGNATION,
    ROLE
)
VALUES
(
    'Vishal',
    'visowmani.123@gmail.com',
    'Vishal@1205',
    '2005-11-12',
    'Male',
    'Development',
    'Manager',
    'admin'
),
(
    'Arun',
    'arun@gmail.com',
    'Arun@123',
    '2006-09-07',
    'Male',
    'Development',
    'Software Engineer',
    'employee'
),
(
    'Harish',
    'harish@gmail.com',
    'Harish@123',
    '2007-11-07',
    'Male',
    'Development',
    'Software Engineer',
    'employee'
),
(
    'Tamil',
    'tamil@gmail.com',
    'Tamil@123',
    '2005-08-27',
    'Male',
    'Marketing',
    'Digital Marketing Specialist',
    'employee'
);

CREATE TABLE TRAINER
(
    TRAINERID INT PRIMARY KEY,
    TRAINERNAME VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(200) UNIQUE NOT NULL,
    DEPARTMENT VARCHAR(100) NOT NULL,
    EXPERIENCE INT NOT NULL,
    PHONE VARCHAR(15) NOT NULL,
    STATUS VARCHAR(20) DEFAULT 'Active'
);

INSERT INTO TRAINER
(
    TRAINERID,
    TRAINERNAME,
    EMAIL,
    DEPARTMENT,
    EXPERIENCE,
    PHONE,
    STATUS
)
VALUES
(1, 'Arun Kumar', 'arun.kumar@company.com', 'Web Development', 8, '9876543210', 'Active'),

(2, 'Priya Sharma', 'priya.sharma@company.com', 'Database', 6, '9876543211', 'Active'),

(3, 'Rahul Verma', 'rahul.verma@company.com', 'Machine Learning', 10, '9876543212', 'Active'),

(4, 'Sneha Iyer', 'sneha.iyer@company.com', 'Software Development', 7, '9876543213', 'Active'),

(5, 'Vikram Singh', 'vikram.singh@company.com', 'Cyber Security', 9, '9876543214', 'Active'),

(6, 'Meera Nair', 'meera.nair@company.com', 'Marketing', 5, '9876543215', 'Active'),

(7, 'Karthik Raj', 'karthik.raj@company.com', 'Cloud Computing', 6, '9876543216', 'Active'),

(8, 'Anjali Menon', 'anjali.menon@company.com', 'Data Analytics', 8, '9876543217', 'Active'),

(9, 'Suresh Babu', 'suresh.babu@company.com', 'Personal Development', 11, '9876543218', 'Active'),

(10, 'Divya Krishnan', 'divya.krishnan@company.com', 'Communication Skills', 7, '9876543219', 'Active');

CREATE TABLE COURSE
(
    COURSEID INT PRIMARY KEY,
    COURSENAME VARCHAR(100) NOT NULL,
    DEPARTMENT VARCHAR(100) NOT NULL
);

INSERT INTO COURSE
(
    COURSEID,
    COURSENAME,
    DEPARTMENT
)
VALUES
(1, 'HTML & CSS', 'Web Development'),

(2, 'JavaScript', 'Web Development'),

(3, 'SQL Server', 'Database'),

(4, 'Machine Learning', 'Machine Learning'),

(5, 'Cyber Security', 'Cyber Security'),

(6, 'Azure Cloud', 'Cloud Computing'),

(7, 'Power BI', 'Data Analytics'),

(8, 'Digital Marketing', 'Marketing'),

(9, 'Communication Skills', 'Communication Skills'),

(10, 'Leadership', 'Personal Development');


CREATE TABLE TRAINING
(
    TRAININGID INT IDENTITY(1,1) PRIMARY KEY,
    COURSEID INT FOREIGN KEY REFERENCES COURSE(COURSEID),
    COURSETYPE VARCHAR(50) NOT NULL,
    TRAINERID INT FOREIGN KEY REFERENCES TRAINER(TRAINERID),
    DURATION VARCHAR(50),
    STARTDATE DATE NOT NULL,
    ENDDATE DATE NOT NULL,
    ASSIGNEDEMPLOYEEID INT FOREIGN KEY REFERENCES EMPLOYEE(ID),
    STATUS VARCHAR(50) DEFAULT 'Not Started',
    ISDELETED BIT DEFAULT 0
);


INSERT INTO TRAINING
(COURSEID, COURSETYPE, TRAINERID, DURATION, STARTDATE, ENDDATE, ASSIGNEDEMPLOYEEID, STATUS, ISDELETED)
VALUES
(5, 'Offline', 7, '4 Day', '2026-06-17', '2026-06-20', 2, 'Not Started', 0),
(1, 'Online', 7, '3 Day', '2026-06-20', '2026-06-22', 2, 'Completed', 0),
(10, 'Online', 8, '3 Day', '2026-06-20', '2026-06-22', 2, 'Completed', 0),
(2, 'Online', 2, '3 Day', '2026-06-16', '2026-06-18', 2, 'Not Started', 0),
(5, 'Online', 1, '2 Day', '2026-06-17', '2026-06-18', 3, 'Not Started', 0),
(3, 'Online', 9, '3 Day', '2026-06-18', '2026-06-20', 3, 'Not Started', 0),
(8, 'Online', 2, '10 Day', '2026-06-18', '2026-06-27', 4, 'Not Started', 0),
(9, 'Online', 8, '10 Day', '2026-06-18', '2026-06-27', 4, 'Not Started', 0);


UPDATE TRAINING
SET 
    STATUS = 'Completed' 
WHERE TRAININGID = 1;

UPDATE TRAINING
SET 
    ENDDATE = '2026-06-22'
WHERE TRAININGID = 1;

GO
CREATE VIEW VW_Completed_Training AS
SELECT *
FROM TRAINING
WHERE STATUS = 'Completed'
  AND ISDELETED = 0;

GO
CREATE VIEW VW_NotStarted_Training AS
SELECT *
FROM TRAINING
WHERE STATUS = 'Not Started'
  AND ISDELETED = 0;

GO
CREATE VIEW VW_Started_Training AS
SELECT *
FROM TRAINING
WHERE STATUS = 'Started'
  AND ISDELETED = 0;

GO
CREATE NONCLUSTERED INDEX IX_TRAINING_STATUS
ON TRAINING (STATUS);

CREATE NONCLUSTERED INDEX IX_TRAINING_STARTDATE
ON TRAINING (STARTDATE);

CREATE NONCLUSTERED INDEX IX_TRAINING_ENDDATE
ON TRAINING (ENDDATE);

