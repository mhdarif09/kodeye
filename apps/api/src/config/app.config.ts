export default () => ({
  apiPort: Number.parseInt(process.env.API_PORT ?? '3001', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  jwt: {
    expiresIn: process.env.JWT_EXPIRES_IN,
    secret: process.env.JWT_SECRET,
  },
});
