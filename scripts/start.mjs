// npm start always serves the built app, including when the host has not set
// NODE_ENV. Development uses the separate npm run dev command.
process.env.NODE_ENV = 'production';
const { startServer } = await import('../server.js');
export const server = await startServer();
