import * as dotenv from "dotenv";
import * as mongoose from "mongoose";

var path = require("path");

let envPath;
var connections = {};

const envVar = process.env.NODE_ENV as string;
console.log("envVar", envVar);
switch (envVar) {
  case "uat":
    envPath = path.join(__dirname, "/../.env.uat");
    break;
  case "colo":
    envPath = path.join(__dirname, "/../.env.colo");
    break;
  default:
    envPath = path.join(__dirname, "/../.env.dev");
    break;
}
dotenv.config({ path: envPath });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function connectdb(client: any) {
  if (connections[client]) {
    return connections[client];
  } else {
    if ( process.env.dbusername) {
      connections[client] = mongoose.createConnection(
        "mongodb://" +
        process.env.dbusername +
          ":" +
          process.env.dbpassword +
          "@" +
          process.env.dburl +
          client +
          "?authSource=admin"
      );
    } else {
      connections[client] = mongoose.createConnection(
        process.env.dburl + client,
        { useNewUrlParser: true, useFindAndModify: false }
      );
    }
    return connections[client];
  }
}

export default {
    connectdb:connectdb,
  KEYCLOAK_URL: process.env.KEYCLOAK_URL,
  PORT: process.env.PORT,
};
