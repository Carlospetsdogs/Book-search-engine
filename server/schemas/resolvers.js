// Import the User model
const { User } = require('../models');
// Import utility functions for signing tokens and handling authentication errors
const { signToken, AuthenticationError } = require('../utils/auth');

// Define the resolvers for the GraphQL schema
const resolvers = {
  // Define the Query resolvers
  Query: {
    // Resolver for the "me" query
    me: async (parent, args, context) => {
      // Check if the user is authenticated
      if (context.user) {
        // Find the user by their ID and exclude the version and password fields
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');

        return userData;
      }

      // Throw an authentication error if the user is not authenticated
      throw AuthenticationError;
    },
  },

  // Define the Mutation resolvers
  Mutation: {
    // Resolver for adding a new user
    addUser: async (parent, args) => {
      // Create a new user with the provided arguments
      const user = await User.create(args);
      // Sign a token for the new user
      const token = signToken(user);

      // Return the token and the user data
      return { token, user };
    },
    // Resolver for logging in a user
    login: async (parent, { email, password }) => {
      // Find the user by their email
      const user = await User.findOne({ email });

      // Throw an authentication error if the user does not exist
      if (!user) {
        throw AuthenticationError;
      }

      // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);

      // Throw an authentication error if the password is incorrect
      if (!correctPw) {
        throw AuthenticationError;
      }

      // Sign a token for the authenticated user
      const token = signToken(user);
      // Return the token and the user data
      return { token, user };
    },
    // Resolver for saving a book to the user's savedBooks
    saveBook: async (parent, { bookData }, context) => {
      // Check if the user is authenticated
      if (context.user) {
        // Find the user by their ID and add the book data to their savedBooks array
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true } // Return the updated document
        );

        return updatedUser;
      }

      // Throw an authentication error if the user is not authenticated
      throw AuthenticationError;
    },
    // Resolver for removing a book from the user's savedBooks
    removeBook: async (parent, { bookId }, context) => {
      // Check if the user is authenticated
      if (context.user) {
        // Find the user by their ID and remove the book with the specified bookId from their savedBooks array
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true } // Return the updated document
        );

        return updatedUser;
      }

      // Throw an authentication error if the user is not authenticated
      throw AuthenticationError;
    },
  },
};

// Export the resolvers module
module.exports = resolvers;
