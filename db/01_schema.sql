CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL, -- added password to users table
    phone_number VARCHAR(20) UNIQUE,
    billing_info VARCHAR(255),
    profile_link VARCHAR(255) UNIQUE
);

CREATE TABLE EmergencyContact (
    contact_id INT AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    relation_to_user VARCHAR(100),
    PRIMARY KEY (contact_id, user_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE);

CREATE TABLE Homes (
    home_id INT PRIMARY KEY AUTO_INCREMENT,
    join_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL
);

CREATE TABLE HomeMembership (
    user_id INT PRIMARY KEY,
    home_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (home_id) REFERENCES Homes(home_id) ON DELETE CASCADE
);

CREATE TABLE Landlord (
    landlord_id INT PRIMARY KEY AUTO_INCREMENT,
    landlord_name VARCHAR(255) NOT NULL,
    landlord_contact VARCHAR(255) NOT NULL UNIQUE
);
    
CREATE TABLE Lease (
    lease_id INT AUTO_INCREMENT,
    home_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    landlord_id INT NOT NULL,
    PRIMARY KEY (lease_id, home_id),
    FOREIGN KEY (home_id) REFERENCES Homes(home_id) ON DELETE CASCADE,
    FOREIGN KEY (landlord_id) REFERENCES Landlord(landlord_id) ON DELETE RESTRICT
    -- prevents the deletion of a parent row if there are any child rows referencing it
);

CREATE TABLE Chore (
    chore_id INT PRIMARY KEY AUTO_INCREMENT,
    home_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    recurrence VARCHAR(255) NOT NULL,
    FOREIGN KEY (home_id) REFERENCES Homes(home_id) ON DELETE CASCADE
);

CREATE TABLE ChoreAssignment (
    chore_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (chore_id) REFERENCES Chore(chore_id) ON DELETE CASCADE -- I THINK THIS NEEDS TO BE A FOREIGN KEY 
);

CREATE TABLE Bill (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    home_id INT NOT NULL,
    description TEXT NOT NULL,
    bill_type VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payer_user_id INT, 
    split_rule VARCHAR(255),
    FOREIGN KEY (home_id) REFERENCES Homes(home_id) ON DELETE CASCADE,
    FOREIGN KEY (payer_user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE TABLE BillShare (
    bill_id INT,
    user_id INT,
    amount_due DECIMAL(10,2) NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    PRIMARY KEY (bill_id, user_id),
    FOREIGN KEY (bill_id) REFERENCES Bill(bill_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE `Event` (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    home_id INT NOT NULL,
    title VARCHAR(255) NOT NULL, -- TITLE SHOULD BE NOT NULL NOT DESCRIPTION
    description TEXT,
    event_start TIMESTAMP NOT NULL, -- DATETIME ALSO WORKS BUT TIMESTAMP IS BETTER FOR EVENTS
    event_end TIMESTAMP NOT NULL,
    created_by_user_id INT NOT NULL,
    FOREIGN KEY (home_id) REFERENCES Homes(home_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE EventInvite (
    event_id INT,
    user_id INT,
    rsvp_status VARCHAR(255) NOT NULL,
    PRIMARY KEY (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE);