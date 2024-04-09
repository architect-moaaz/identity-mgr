import * as express from "express";
import { keycloakController } from "../controllers/Keycloak/keycloakController";

const Keycloak: keycloakController = new keycloakController();
let router = express.Router();
router.get("/getThemes", Keycloak.checkWorkspace, Keycloak.fetchThemes);
router.post("/saveThemes", Keycloak.checkWorkspace, Keycloak.saveThemes);
router.get("/getTheme", Keycloak.checkWorkspace, Keycloak.fetchTheme)
router.post("/saveTheme", Keycloak.checkWorkspace, Keycloak.saveTheme)
router.post("/saveLoginPage/:type", Keycloak.checkWorkspace, Keycloak.saveLoginPage)
router.post("/saveWorkspaceTimezone", Keycloak.checkWorkspace, Keycloak.saveWorkspaceTimezone)
router.post("/saveUserPreference", Keycloak.checkWorkspace, Keycloak.saveUserPreference)
router.get("/getUserPreference", Keycloak.checkWorkspace, Keycloak.fetchUserPreference)
router.get("/getWorkspaceConfig", Keycloak.checkWorkspace, Keycloak.fetchWorkspaceConfig)



export = router;
