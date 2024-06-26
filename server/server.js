// Import necessary modules
const express = require('express');
const path = require('path');
// Import the ApolloServer class from the Apollo Server package
const { ApolloServer } = require('@apollo/server');
// Import middleware to integrate Apollo Server with Express
const { expressMiddleware } = require('@apollo/server/express4');
// Import custom authentication middleware
const { authMiddleware } = require('./utils/auth');

// Import the two parts of a GraphQL schema: type definitions and resolvers
const { typeDefs, resolvers } = require('./schemas');
// Import the database connection configuration
const db = require('./config/connection');

// Define the port the server will run on, defaulting to 3001 if not specified
const PORT = process.env.PORT || 3001;

// Create a new instance of ApolloServer with the GraphQL schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create an Express application
const app = express();

// Define an asynchronous function to start the Apollo server
const startApolloServer = async () => {
  // Start the Apollo Server
  await server.start();
  
  // Configure the Express app to parse URL-encoded and JSON payloads
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  // Set up the Apollo Server middleware with authentication context
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  // Serve static assets if in production environment
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Serve the main index.html file for all GET requests
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // Once the database connection is open, start the Express server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the async function to start the server
startApolloServer();
