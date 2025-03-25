# MySQL Setup for Notes App

This guide will walk you through setting up the MySQL database for the Notes application using phpMyAdmin.

## Prerequisites

- XAMPP, WAMP, or any other similar stack that includes MySQL and phpMyAdmin
- Make sure your MySQL server is running

## Steps to Set Up the Database

### 1. Create a New Database

1. Open your web browser and navigate to phpMyAdmin (usually http://localhost/phpmyadmin)
2. Log in if necessary (default username is often 'root' with no password for XAMPP)
3. In the left sidebar, click on "New" to create a new database
4. Enter "notes_app" as the database name
5. Select "utf8mb4_unicode_ci" as the collation
6. Click "Create"

### 2. Configure the Application

Ensure your `config/database.js` file contains the correct MySQL connection details:

```javascript
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',  // Change this if your username is different
    password: '',      // Change this if you have set a password
    database: 'notes_app',
    logging: console.log
});
```

### 3. Initialize the Database

Run the initialization script to create the required tables and sample data:

```bash
npm run init-db
```

Or directly with Node.js:

```bash
node utils/initialize-db.js
```

### 4. Verify the Setup

After running the initialization script, you should see the following tables in your phpMyAdmin:

- `Notes` - Contains all your notes with title, content, and category columns
- Additional Sequelize-managed tables like `SequelizeMeta` (if using migrations)

### 5. Troubleshooting

If you encounter any issues:

1. **Connection issues**: Make sure MySQL server is running and the credentials are correct
2. **Permission issues**: Ensure your MySQL user has permissions to create tables and modify data
3. **Port conflicts**: If you've changed the default MySQL port (3306), update the config file accordingly

## Manual Table Creation (Alternative)

If the automation doesn't work, you can manually create the table using this SQL:

```sql
CREATE TABLE IF NOT EXISTS `Notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(255) DEFAULT 'work',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Test Query

To test if everything is working, you can run this query in phpMyAdmin:

```sql
INSERT INTO `Notes` (`title`, `content`, `category`, `createdAt`, `updatedAt`) 
VALUES ('Test Note', 'This is a test note created directly in the database', 'work', NOW(), NOW());
```

Then check if it appears in your application.
