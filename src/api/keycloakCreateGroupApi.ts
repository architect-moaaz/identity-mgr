import * as express from "express";
import { keycloakController } from "../controllers/Keycloak/keycloakController";

const Keycloak: keycloakController = new keycloakController();
let router = express.Router();
router.post("/generategroups",Keycloak.checkWorkspace, Keycloak.creategroups)
export = router;