import * as express from "express";
import { keycloakController } from "../controllers/Keycloak/keycloakController";

const Keycloak: keycloakController = new keycloakController();
let router = express.Router();
router.get("/fetchroles",Keycloak.checkWorkspace, Keycloak.roles)
router.post("/createrole",Keycloak.checkWorkspace, Keycloak.createroles)
router.get("/:rolename/users",Keycloak.checkWorkspace, Keycloak.roleUsers)
router.post("/update/:rolename",Keycloak.checkWorkspace, Keycloak.updateRoles)
router.post("/delete/:rolename",Keycloak.checkWorkspace, Keycloak.deleteRoles)
router.get("/:rolename/groups",Keycloak.checkWorkspace, Keycloak.rolegroups)
router.get("/:rolename/users",Keycloak.checkWorkspace, Keycloak.roleusers)
router.get("/:rolename/composites",Keycloak.checkWorkspace, Keycloak.rolecomposites)


export = router;