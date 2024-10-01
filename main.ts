import { ApolloServer } from "npm:@apollo/server@^4.1";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { typeDefs } from "./schema.ts";
import { resolvers } from "./resolvers.ts";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = new Application();
const router = new Router();

router.get("/api/greet", (context) => {
  context.response.body = "Hello from the REST API!";
});

app.use(router.routes());
app.use(router.allowedMethods());
await server.start();

const PORT = 5000;
console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
await app.listen({ port: PORT });
