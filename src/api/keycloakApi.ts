import * as express from "express";
import { keycloakController } from "../controllers/Keycloak/keycloakController";

const Keycloak: keycloakController = new keycloakController();
let router = express.Router();
router.post("/", Keycloak.checkWorkspace, Keycloak.authenticate);
router.get("/:workspace", Keycloak.checkworkspaceName);
router.get("/customLogin/:workspace/:type", Keycloak.customLoginPage);
router.post("/refresh",Keycloak.checkWorkspace,  Keycloak.refresh);
router.get("/users",Keycloak.checkWorkspace,  Keycloak.getusers);
router.get("/forgot-password", Keycloak.checkWorkspace, Keycloak.forgotPassword);
router.post("/createuser", Keycloak.checkWorkspace, Keycloak.createusers);
router.get("/groups", Keycloak.checkWorkspace, Keycloak.getgroups);
router.post("/creategroup",Keycloak.checkWorkspace,  Keycloak.creategroups);
router.put("/resetpassword",Keycloak.checkWorkspace,  Keycloak.resetpassword);
router.get("/roles",Keycloak.checkWorkspace, Keycloak.roles)
router.put("/addmanagers",Keycloak.checkWorkspace,Keycloak.addmanager)
router.put("/updatemanagers",Keycloak.checkWorkspace,Keycloak.updatemanager)
export = router;
