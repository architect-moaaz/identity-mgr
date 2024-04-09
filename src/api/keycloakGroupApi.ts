import * as express from "express";
import { keycloakController } from "../controllers/Keycloak/keycloakController";

const Keycloak: keycloakController = new keycloakController();
let router = express.Router();
router.get("/fetchallgroups",Keycloak.checkWorkspace,Keycloak.getgroups)
router.post("/updateGroup/:groupID",Keycloak.checkWorkspace, Keycloak.updateGroup)
router.post("/deleteGroup/:groupID",Keycloak.checkWorkspace, Keycloak.deleteGroup)
router.get("/members/:groupID",Keycloak.checkWorkspace, Keycloak.members)


export = router;