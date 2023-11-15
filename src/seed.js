const { Pool, Client } = require("pg");

// Database connection configuration
const connectionConfig = {
  user: "postgres",
  host: "localhost",
  password: "1234",
  port: 5432, // Default PostgreSQL port
};

const pool = new Pool(connectionConfig);

// Database and table creation queries
const databaseName = "socketdb";

const createEmployeesTableQuery =
  "CREATE TABLE IF NOT EXISTS employees (id SERIAL PRIMARY KEY, department_number INT NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, phone_number VARCHAR(20), email VARCHAR(255) NOT NULL)";

// Dummy data
const employees = [
  {
    department_number: 2,
    first_name: "Liam",
    last_name: "Lupin",
    phone_number: "987654321",
    email: "lupin.liam@gmail.com",
  },
  {
    department_number: 3,
    first_name: "Roger",
    last_name: "Niyomugabo",
    phone_number: "987654321",
    email: "roger.niyo@gmail.com",
  },
  // Add more employees here
];

// Function to create the database and tables
async function createDatabaseAndTables() {
  const client = new Client(connectionConfig);
  let poolSocketDB; // Define poolSocketDB in a higher scope

  try {
    // Connect to PostgreSQL to check if the database exists
    await client.connect();

    // Check if the database already exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (result.rows.length === 0) {
      // If the database does not exist, create it
      await client.query(`CREATE DATABASE ${databaseName}`);
      console.log(`Database '${databaseName}' created successfully`);
    } else {
      console.log(`Database '${databaseName}' already exists`);
    }

    // Disconnect from the default postgres database
    await client.end();

    // Connect to the socketdb database
    poolSocketDB = new Pool({
      ...connectionConfig,
      database: databaseName,
    });

    // Create the employees table
    await poolSocketDB.query(createEmployeesTableQuery);

    // Insert dummy data into the employees table
    await poolSocketDB.query(
      `INSERT INTO employees (department_number, first_name, last_name, phone_number, email) VALUES
     ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $15), ($16, $17, $18, $19, $20)`,
      [
        1,
        "John",
        "Doe",
        "123456789",
        "john.doe@example.com",
        1,
        "Jane",
        "Smith",
        "987654321",
        "jane.smith@example.com",
        2,
        "Liam",
        "Lupin",
        "987654321",
        "lupin.liam@gmail.com",
        3,
        "Roger",
        "Niyomugabo",
        "987654321",
        "roger.niyo@gmail.com",
      ]
    );

    console.log("Tables created and data seeded successfully");
  } catch (error) {
    console.error("Error creating database, tables, and seeding data:", error);
  } finally {
    if (poolSocketDB) {
      poolSocketDB.end(); // Close the connection pool
    }
  }
}

// Run the database creation function
createDatabaseAndTables();
