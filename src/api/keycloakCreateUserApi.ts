import * as express from "express";
import { keycloakController } from "../controllers/Keycloak/keycloakController";

const Keycloak: keycloakController = new keycloakController();
let router = express.Router();
router.post("/generateusers",Keycloak.checkWorkspace, Keycloak.createusers)
export = router;