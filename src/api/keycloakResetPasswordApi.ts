import * as express from "express";
import { keycloakController } from "../controllers/Keycloak/keycloakController";

const Keycloak: keycloakController = new keycloakController();
let router = express.Router();
router.put("/fetchresetpassword",Keycloak.checkWorkspace, Keycloak.resetpassword)
export = router;