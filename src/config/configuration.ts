export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  DOCS_USERNAME: process.env.DOCS_USERNAME,
  DOCS_PASSWORD: process.env.DOCS_PASSWORD,
});
