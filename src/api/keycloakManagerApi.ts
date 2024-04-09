import * as express from "express";
import { keycloakController } from "../controllers/Keycloak/keycloakController";
var multer = require("multer");
const storage = multer.memoryStorage()
const upload = multer({ dest: 'uploads/' })
// const upload = multer({
//   storage: storage,
//  })
const Keycloak: keycloakController = new keycloakController();
let router = express.Router();
router.put("/addmanager/:username",Keycloak.checkWorkspace,  Keycloak.addmanager);
router.put("/updatemanager/:username",Keycloak.checkWorkspace,Keycloak.updatemanager)
router.put("/deletemanager/:username",Keycloak.checkWorkspace,Keycloak.deletemanager)

export = router;