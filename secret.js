require("dotenv").config();

const serverPort = process.env.PORT || 8001;

const dataBaseUrl = process.env.DB_URL;

const jwtSecretKey = process.env.JWT_SECRET_KEY || "";

const accessToken = process.env.ACCESS_TOKEN_SECRET || "";

const refreshNewToken = process.env.REFRESH_TOKEN_SECRET || "";

module.exports = {
  serverPort,
  dataBaseUrl,
  jwtSecretKey,
  accessToken,
  refreshNewToken

};
