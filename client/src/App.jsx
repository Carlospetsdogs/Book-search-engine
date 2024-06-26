// Import the CSS for the app
import './App.css';
// Import the Outlet component from react-router-dom for nested routing
import { Outlet } from 'react-router-dom';
// Import necessary modules from Apollo Client
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
// Import the setContext function to set the HTTP headers
import { setContext } from '@apollo/client/link/context';

// Import the Navbar component
import Navbar from './components/Navbar';

// Create an HTTP link to the GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'graphql',
});

// Set up an authentication link to include the token in the HTTP headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      // Include the token in the Authorization header if it exists
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create an instance of ApolloClient with the authentication and HTTP links, and an in-memory cache
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Define the main App component
function App() {
  return (
    <>
    <ApolloProvider client={client}>
      {/* Render the Navbar component */}
      <Navbar />
      {/* Render the Outlet component for nested routing */}
      <Outlet />
      </ApolloProvider>

    </>
  );
}

// Export the App component as the default export
export default App;
