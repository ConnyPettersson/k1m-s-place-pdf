import dotenv from 'dotenv';
dotenv.config();

export default {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};
