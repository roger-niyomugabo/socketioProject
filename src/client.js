const net = require("net");
const readline = require("readline");

const client = new net.Socket();

// Connect to the server on the specified port
const serverPort = process.argv[2] || 3000;
client.connect(serverPort, "127.0.0.1", () => {
  console.log(`Connected to server on port ${serverPort}`);
  promptUser();
});

// Handle data from the server
client.on("data", (data) => {
  const response = JSON.parse(data);
  if (response.error) {
    console.error("Error: " + response.error);
  } else {
    // Handle the response based on the request type
    handleResponse(response);
    // Continue making choices
    promptUser();
  }
});

// Handle server disconnection
client.on("end", () => {
  console.log("Disconnected from server");
});

// Set up readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptUser() {
  rl.question(
    "Choose a request type:\n1. Request Email\n2. Request Phone\n3. Request employees/students List\nEnter the choice number: ",
    (choice) => {
      handleUserChoice(choice);
    }
  );
}

function handleUserChoice(choice) {
  switch (choice) {
    case "1":
      sendRequest("email");
      break;
    case "2":
      sendRequest("phone");
      break;
    case "3":
      sendListRequest();
      break;
    default:
      console.error("Invalid choice. Please enter a number between 1 and 3.");
      // Continue making choices
      promptUser();
  }
}

function sendRequest(type) {
  const request = { type };
  rl.question("Enter the first name: ", (firstName) => {
    request.firstName = firstName;
    rl.question("Enter the last name: ", (lastName) => {
      request.lastName = lastName;
      client.write(JSON.stringify(request));
      // Note: Don't close readline here, let it be handled after receiving the response
    });
  });
}

function sendListRequest() {
  const request = { type: "list" };
  rl.question("Enter the department number: ", (department) => {
    request.department = department;
    client.write(JSON.stringify(request));
    // Note: Don't close readline here, let it be handled after receiving the response
  });
}

function handleResponse(response) {
  switch (response.type) {
    case "email":
      console.log("Email address: " + response.data);
      break;
    case "phone":
      console.log("Phone number: " + response.data);
      break;
    case "list":
      console.log("Department employees: " + JSON.stringify(response.data));
      break;
    default:
      console.error("Invalid response type");
  }
}
