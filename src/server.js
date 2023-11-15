const net = require("net");
const { Pool } = require("pg");

// Configure your PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "socketdb",
  password: "1234",
  port: 5432, // Default PostgreSQL port
});

const server = net.createServer();

server.on("connection", (socket) => {
  console.log("Client connected: " + socket.remoteAddress);

  // Handle data from clients
  socket.on("data", (data) => {
    const request = JSON.parse(data);
    handleRequest(socket, request);
  });

  // Handle client disconnection
  socket.on("end", () => {
    console.log("Client disconnected: " + socket.remoteAddress);
  });
});

async function handleRequest(socket, request) {
  // Implement logic to handle different types of requests
  switch (request.type) {
    case "email":
      await handleEmailRequest(socket, request);
      break;
    case "phone":
      await handlePhoneRequest(socket, request);
      break;
    case "list":
      await handleListRequest(socket, request);
      break;
    default:
      sendError(socket, "Invalid request type");
  }
}

async function handleEmailRequest(socket, request) {
  try {
    const employee = await findEmployee(request);
    if (employee) {
      socket.write(JSON.stringify({ type: "email", data: employee.email }));
    } else {
      sendError(socket, "Employee not found");
    }
  } catch (error) {
    sendError(socket, "Error retrieving data from the database");
  }
}

async function handlePhoneRequest(socket, request) {
  try {
    const employee = await findEmployee(request);
    if (employee) {
      socket.write(
        JSON.stringify({ type: "phone", data: employee.phoneNumber })
      );
    } else {
      sendError(socket, "Employee not found");
    }
  } catch (error) {
    sendError(socket, "Error retrieving data from the database");
  }
}

async function handleListRequest(socket, request) {
  try {
    const departmentEmployees = await getDepartmentEmployees(
      request.department
    );
    if (departmentEmployees.length > 0) {
      socket.write(JSON.stringify({ type: "list", data: departmentEmployees }));
    } else {
      sendError(socket, "No employees found in the department");
    }
  } catch (error) {
    sendError(socket, "Error retrieving data from the database");
  }
}

async function findEmployee(request) {
  const { rows } = await pool.query(
    "SELECT * FROM employees WHERE " +
      "((first_name = $1 AND last_name = $2) OR (last_name = $3 AND department_number = $4)) LIMIT 1",
    [request.firstName, request.lastName, request.lastName, request.department]
  );

  return rows[0];
}

async function getDepartmentEmployees(department) {
  const { rows } = await pool.query(
    "SELECT * FROM employees WHERE department_number = $1",
    [department]
  );
  return rows;
}

function sendError(socket, message) {
  socket.write(JSON.stringify({ error: message }));
}

// Start the server on the specified port or default to 3000
const PORT = process.argv[2] || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
