import * as express from "express";
import { keycloakController } from "../controllers/Keycloak/keycloakController";

const Keycloak: keycloakController = new keycloakController();
let router = express.Router();
router.get("/allMenus",Keycloak.checkWorkspace, Keycloak.fetchAllMenus)
router.get("/:role",Keycloak.checkWorkspace, Keycloak.fetchMenuForRole)
router.post("/:role",Keycloak.checkWorkspace, Keycloak.SaveMenuForRole)



export = router;