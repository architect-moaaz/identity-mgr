import * as express from "express";
import * as bodyParser from "body-parser";
import * as routes from "./routes/configuration";
import * as mongoose from "mongoose";
import * as cors from "cors";
const path = require('path')



class App {
  public app: express.Application = express();

  constructor() {
    this.config();
  }
  private config(): void {
    this.app.use(bodyParser.json({limit: '50mb'}));
    this.app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // serving static files
    this.app.use(express.static("public"));
    this.app.use(cors());
    this.app.set('views',path.join(__dirname, 'views'));

    this.app.use("/IDENTITY", routes);
    
  }
}
export default new App().app;
