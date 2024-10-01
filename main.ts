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

  let body;
  if (c.req.method === "GET") {
    // For GET requests, we need to construct the query from URL parameters
    const params = new URL(c.req.url).searchParams;
    body = JSON.stringify({
      query: params.get("query"),
      variables: params.get("variables")
        ? JSON.parse(params.get("variables")!)
        : undefined,
      operationName: params.get("operationName"),
    });
  } else {
    // For POST requests, we can use the request body directly
    body = await c.req.text();
  }

  const response = await fetch(url, {
    method: "POST", // Always use POST for the internal request
    headers: headers,
    body: body,
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
