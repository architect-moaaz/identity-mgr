import * as express from "express";
import * as Keycloak from "../api/keycloakApi";
import * as keycloakUser from "../api/keycloakUserApi"
import * as keycloakcreateuser from "../api/keycloakCreateUserApi"
import * as keycloakgroups from "../api/keycloakGroupApi"
import * as keycloakcreategroup from "../api/keycloakCreateGroupApi"
import * as keycloakresetpassword from "../api/keycloakResetPasswordApi"
import * as keycloakroles from "../api/keycloakRolesApi"
import * as accessAPI from "../api/accessApi"
import * as keycloakManager from "../api/keycloakManagerApi"
import * as miscApis from "../api/miscApi"

let router = express.Router();
router.use('/Login',Keycloak)
router.use('/user',keycloakUser)
router.use('/createusers',keycloakcreateuser)
router.use('/group',keycloakgroups)
router.use('/creategroups',keycloakcreategroup)
router.use('/resetpassword',keycloakresetpassword)
router.use('/roles',keycloakroles)
router.use('/access',accessAPI)
router.use('/manager',keycloakManager)
router.use('/misc',miscApis)

export = router;
