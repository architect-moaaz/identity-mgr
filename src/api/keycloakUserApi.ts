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
router.get("/fetchallusers",Keycloak.checkWorkspace,  Keycloak.getusers);
router.get("/fetchuser/:username",Keycloak.checkWorkspace,Keycloak.getuser)
router.post("/updateUser/:userid",Keycloak.checkWorkspace,  Keycloak.updateUser);
router.post("/deleteUser/:userid",Keycloak.checkWorkspace,  Keycloak.deleteUser);
router.get("/rolemap/:userid",Keycloak.checkWorkspace,  Keycloak.rolemap);
router.post("/addrole/:userid",Keycloak.checkWorkspace,  Keycloak.adduserrole);
router.post("/removerole/:userid",Keycloak.checkWorkspace,  Keycloak.deleteuserrole);
router.post("/addgroup/:userid/:groupID",Keycloak.checkWorkspace,  Keycloak.addusergroup);
router.post("/deletegroup/:userid/:groupID",Keycloak.checkWorkspace,  Keycloak.deleteusergroup);
router.post("/forgot-password",Keycloak.checkWorkspace,  Keycloak.forgotPassword);
router.get("/fetchroles",Keycloak.checkWorkspace, Keycloak.roles)
router.post("/bulk",upload.single('File'),Keycloak.uploadUsers)
export = router;
