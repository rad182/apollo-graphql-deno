import { ApolloServer } from "npm:@apollo/server@^4.1";
import { startStandaloneServer } from "npm:@apollo/server@^4.1/standalone";
import { Hono } from "hono";
import { typeDefs } from "./schema.ts";
import { resolvers } from "./resolvers.ts";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = new Hono();

app.get("/", (c) => c.text("Hello Deno!"));

// Update the GraphQL route
app.all("/graphql", async (c) => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 0 },
  });

  // Create a new headers object with the required headers
  const headers = new Headers(c.req.headers);
  headers.set("Content-Type", "application/json");
  headers.set("apollo-require-preflight", "true");

  const response = await fetch(url, {
    method: c.req.method,
    headers: headers,
    body: c.req.body,
  });

  // Set the response status and headers
  c.status(response.status);
  c.header(
    "Content-Type",
    response.headers.get("Content-Type") || "application/json"
  );

  // Return the response body
  return c.body(response.body);
});

const PORT = 5000;
console.log(`🚀 Server ready at http://localhost:${PORT}`);
console.log(
  `🚀 GraphQL endpoint available at http://localhost:${PORT}/graphql`
);
Deno.serve({ port: PORT }, app.fetch);
