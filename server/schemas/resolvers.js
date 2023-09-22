const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      const { id, username } = args;
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to view this user"
        );
      }
      return User.findOne({
        $or: [{ _id: context.user ? context.user._id : id }, { username }],
      });
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },

    login: async (parent, { email, username, password }) => {
      const user = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Wrong password!");
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, args, context) => {
      const { bookData } = args;
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to save a book!"
        );
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );
      return updatedUser;
    },

    deleteBook: async (parent, args, context) => {
      const { bookId } = args;
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to delete a book!"
        );
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      return updatedUser;
    },
  },
};

module.exports = resolvers;
