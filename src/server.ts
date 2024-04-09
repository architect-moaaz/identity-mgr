import app from './app';
import * as http from "http";
import config from './config';

http.createServer(app).listen(config.PORT, () => {
    
    console.log('Express server listening on port ' + config.PORT);
    console.log("Server running at ",config.PORT);
})