const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./path_to_your_middleware_file'); // update with your actual path

// Import your typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// catch-all route to send back the index.html for frontend routing
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // apply the authentication middleware to the context
    return {
      user: authMiddleware({ req }).user
    };
  }
});

// Apply the Apollo GraphQL middleware to your Express application
server.applyMiddleware({ app });

// app.use(routes);  // If you still want to use any other routes alongside GraphQL.

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`));
});