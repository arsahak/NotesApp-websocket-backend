require("dotenv").config();

const serverPort = process.env.PORT || 8001;

const dataBaseUrl = process.env.DB_URL;

const jwtSecretKey = process.env.JWT_SECRET_KEY || "";

const accessJwtSecretKey = process.env.ACCESS_TOKEN_SECRET || "";

const refreshJwtSecretKey = process.env.REFRESH_TOKEN_SECRET || "";

const nodeEnv = process.env.NODE_ENV || "";

module.exports = {
  serverPort,
  dataBaseUrl,
  jwtSecretKey,
  accessJwtSecretKey,
  refreshJwtSecretKey,
  nodeEnv

};
