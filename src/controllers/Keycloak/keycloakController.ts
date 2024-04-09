import { Request, Response, NextFunction, response } from "express";
import * as mongoose from "mongoose";
import config from "../../config";
import axios from "axios";
import { strict } from "assert";

const CryptoJS = require("crypto-js");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const path = require("path");
const Schema = mongoose.Schema;
const defaultSchema = new Schema({}, { strict: false });
import parseXlsx from "excel";

var xlsxtojson = require("xlsx-to-json");
var xlstojson = require("xls-to-json");

var useridAPI = async (workspacename, username: string,req:Request,res :Response) => {
  // if(req.header.authroization)
    var getuserapi = {
      method: "get",
      url:
        config.KEYCLOAK_URL +
        `admin/realms/` + workspacename + `/users?username=` +
        username,
      headers: {
        authorization:
            req.headers.authorization,
        "Content-Type": "application/json",
        redirect: "follow",
      },
    };
    try{
    var response = await axios(getuserapi)

    const isExist = response.data.filter(
      (item) => item.username === username
    );
    if (isExist.length != 0) {
      return  response.data[0].id
    }
    else{
      return null
    }
  }
  catch( error){
    return res.status(404).send({Message:"Access Token Failed : " +error})

  }
}

export class keycloakController {
  uploadUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("body", JSON.stringify(req.body));
      console.log(req["file"]);

      parseXlsx(req["file"].path).then((data) => {
        var first = data[0].join();
        var headers = first.split(",");
        // console.log(headers);

        for (var i = 1, length = data.length; i < length; i++) {
          var myRow = data[i].join();
          var row = myRow.split(",");
          // console.log("row",row);

          var dataJson = {};
          for (var x = 0; x < row.length; x++) {
            dataJson[headers[x]] = row[x];
          }
          dataJson["enabled"] = true;
          dataJson["emailVerified"] = true;
          dataJson["attributes"] = { locale: [] };
          dataJson["groups"] = [dataJson["groups"]];

          var createuserapi = {
            method: "post",
            url:
              config.KEYCLOAK_URL +
              `admin/realms/` +
              req.headers.workspace +
              `/users`,
            headers: {
              authorization: req.headers.authorization,
              "Content-Type": "application/json",
              redirect: "follow",
            },
            data: JSON.stringify(dataJson),
          };
          // console.log(createuserapi);

          axios(createuserapi)
            .then(function (response) {})
            .catch(function (error) {});
        }
        return res
          .send({ status: 200, message: "user created successfully" })
          .status(200);
      });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  fetchWorkspaceConfig = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const db = await config.connectdb("global");
    const workspace_configDB = db.model(
      "workspace_config",
      defaultSchema,
      "workspace_config"
    );
    var regex = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );
    console.log(regex);
    
    let workspace_config = await workspace_configDB
      .find({ $or: [{ workspace_name: regex }, { workspace_url: regex }] })
      .exec();
    var status = "Success";
    if (workspace_config.length == 0) {
      status = "Failure";
    }
    workspace_config= JSON.parse(JSON.stringify(workspace_config))
    
    return res
      .status(200)
      .send({ status: status, config: workspace_config[0]?.workspace_config });
  };

  fetchUserPreference = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const db = await config.connectdb("global");
    const userPrefDB = db.model(
      "user_pref",
      defaultSchema,
      "user_pref"
    );
    var regex = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );
    console.log(regex);
    
    let user_pref = await userPrefDB
      .find({ $and: [{ workspace: regex }, { userid: req.headers.userid }] })
      .exec();

      // console.log("user",user_pref)
    var status = "Success";

    return res
      .status(200)
      .send({ status: status,user_pref  });
  };

  saveLoginPage=async(req:Request,res:Response,next:NextFunction)=>{
    const db = await config.connectdb("global");
    const custom_loginpageDB = db.model(
      "custom_loginpage",
      defaultSchema,
      "custom_loginpage"
    );

    var regexWorkspace = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );
      
    console.log("regexWorkspace",regexWorkspace);
    
    let custom_loginpage = await custom_loginpageDB
      .update({workspace: regexWorkspace,type:req.params.type},{$set:{
        formData:req.body,
        workspace:req.headers.workspace,
        type:req.params.type
      }},{upsert:true})
      .exec();
      // console.log(JSON.parse(JSON.stringify(themes))[0].themes);
      
      return res
            .status(200)
            .send({ status: "Success" });

  }
  saveTheme=async(req:Request,res:Response,next:NextFunction)=>{
    const db = await config.connectdb("global");
    const themesDB = db.model(
      "themes",
      defaultSchema,
      "themes"
    );

    var regexWorkspace = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );
      
    
    let themes = await themesDB
      .update({ type: "selectedtheme",workspace: regexWorkspace},{$set:{
        theme:req.body.theme,
        workspace: req.headers.workspace
      }},{upsert:true})
      .exec();
      // console.log(JSON.parse(JSON.stringify(themes))[0].themes);
      
      return res
            .status(200)
            .send({ status: "Success" });

  }

  saveUserPreference=async(req:Request,res:Response,next:NextFunction)=>{
    try {
      
      const db = await config.connectdb("global");
      const userPrefDB = db.model(
        "user_pref",
        defaultSchema,
        "user_pref"
      );
  
      var regexWorkspace = new RegExp(
        ["^", req.headers.workspace, "$"].join(""),
        "i"
      );
      
      let user_prefs = await userPrefDB
        .update(
          {
            $and: [
              { userid: req.headers.userid },
              { workspace: regexWorkspace }
            ]
          }
          ,{$set:{
          userid:req.headers.userid,
          workspace: req.headers.workspace,
          timezone:req.body.timezone,
          locale_identifier:req.body.locale
        }},{upsert:true})
        .exec();
        return res
              .status(200)
              .send({ status: "Success" });

    } catch (error) {
      return res
      .status(500)
      .send({ status: "failed" });
    }

  }

  saveWorkspaceTimezone=async(req:Request,res:Response,next:NextFunction)=>{
    const db = await config.connectdb("global");
    const workspace_configDB = db.model(
      "workspace_config",
      defaultSchema,
      "workspace_config"
    );

    var regex = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );

    let query = {workspace_name: regex}

    workspace_configDB.findOneAndUpdate(query, { $set: { "workspace_config.timezone": req.body.timezone, "workspace_config.locale_identifier": req.body.locale }}, {new:true}).
      then((result:Object) => {
        return res
        .status(200)
        .send({ status: "Success" });
      })
      .catch((error:Error) => {
        return res
        .status(500)
        .send({ status: "failed" });
      })

  }
  
  saveThemes=async(req:Request,res:Response,next:NextFunction)=>{
    const db = await config.connectdb("global");
    const themesDB = db.model(
      "themes",
      defaultSchema,
      "themes"
    );

    var regexWorkspace = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );
      var key=Object.keys(req.body)[0]
      var data=req.body[key];
      key ="themes."+key;
      var updatedata={
        [key]:data
      }
    console.log("updatedata",updatedata);
    
    let themes = await themesDB
      .update({ type: "themes"},updatedata)
      .exec();
      // console.log(JSON.parse(JSON.stringify(themes))[0].themes);
      
      return res
            .status(200)
            .send({ status: "Success" });

  }

  fetchTheme=async(req:Request,res:Response,next:NextFunction)=>{
    const db = await config.connectdb("global");
    const themesDB = db.model(
      "themes",
      defaultSchema,
      "themes"
    );

    var regexWorkspace = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );

    let themes = await themesDB
      .find({ type: "selectedtheme",workspace: regexWorkspace})
      .exec();
      var theme=JSON.parse(JSON.stringify(themes))[0]

      let allthemes = await themesDB
      .find({ type: "themes"})
      .exec();
      var selectedThemeData=null;
      try {
        var selectedThemeData=JSON.parse(JSON.stringify(allthemes))[0].themes[theme.theme]
      } catch (error) {
        console.log(error);
        
      }
      return res
            .status(200)
            .send({ status: "Success", themes: theme ,themeData:selectedThemeData});

  }

  fetchThemes=async(req:Request,res:Response,next:NextFunction)=>{
    const db = await config.connectdb("global");
    const themesDB = db.model(
      "themes",
      defaultSchema,
      "themes"
    );

    var regexWorkspace = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );

    let themes = await themesDB
      .find({ type: "themes"})
      .exec();
      var selectedTheme=null;
      try {
        selectedTheme=JSON.parse(JSON.stringify(themes))[0].themes
      } catch (error) {
        
      }
      
      return res
            .status(200)
            .send({ status: "Success", themes: selectedTheme });

  }
  tokengenerate = async (username: string, password: string) => {};

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var qs = require("qs");
      var data = qs.stringify({
        client_id: "admin-cli",
        refresh_token: req.body.refresh_token,
        grant_type: "refresh_token",
      });
      var loginAPI = {
        method: "post",
        url:
          config.KEYCLOAK_URL +
          "realms/" +
          req.headers.workspace +
          "/protocol/openid-connect/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      axios(loginAPI)
        .then(function (response) {
          return res
            .status(200)
            .send({ status: "Success", access_info: response.data });
        })
        .catch(function (error) {
          console.error("second Cath function", error);
          return res.status(500).send({ status: "Failure", error: error });
        });
    } catch (error) {
      console.error("inside Try catch error block");
      return res.status(500).send({ error: error });
    }
  };

  checkWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      switch ((req.headers["workspace"] as string).toLowerCase()) {
        case "intelliflow":
          req.headers["workspace"] = "master";
          req.headers["workspace_Name"] = "Intelliflow";
          break;
        case "tsao":
          req.headers["workspace"] = "TSAO";
          req.headers["workspace_Name"] = "TSAO";
          break;
        default:
          req.headers["workspace_Name"] = req.headers["workspace"];
          break;
      }

      next();
    } catch (error) {
      console.log(error);
      next();
    }
  };

  SaveMenuForRole = async (req: Request, res: Response, next: NextFunction) => {
    const db = await config.connectdb("global");
    const menu_assignedDB = db.model(
      "menu_assigned",
      defaultSchema,
      "menu_assigned"
    );
    var regexRole = new RegExp(["^", req.params.role, "$"].join(""), "i");
    var regexWorkspace = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );
    var body = {
      role: req.params.role,
      workspace: req.headers.workspace
    }
    if(req.body.menus)
    {
      body["menus_enabled"]=req.body.menus;
    }
    if(req.body.process)
    {
      body["process"]=req.body.process;
    }

    let menu_assigned = await menu_assignedDB
      .update(
        { role: regexRole, workspace: regexWorkspace },
        body,
        { upsert: true }
      )
      .exec();
    var status = "Success";
    if (menu_assigned.length == 0) {
      status = "Failure";
    }
    return res.status(200).send({ status: status, menus: menu_assigned });
  };

  fetchMenuForRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const db = await config.connectdb("global");
    const menu_assignedDB = db.model(
      "menu_assigned",
      defaultSchema,
      "menu_assigned"
    );
    var regexRole = new RegExp(["^", req.params.role, "$"].join(""), "i");
    var regexWorkspace = new RegExp(
      ["^", req.headers.workspace, "$"].join(""),
      "i"
    );

    let menu_assigned = await menu_assignedDB
      .find({ role: regexRole, workspace: regexWorkspace })
      .exec();
    var status = "Success";
    if (menu_assigned.length == 0) {
      status = "Failure";
    }
    return res.status(200).send({ status: status, menus: menu_assigned });
  };
  fetchAllMenus = async (req: Request, res: Response, next: NextFunction) => {
    const db = await config.connectdb("global");
    const menu_masterDB = db.model("menu_master", defaultSchema, "menu_master");
    let menus = await menu_masterDB.find({}).exec();
    var status = "Success";
    if (menus.length == 0) {
      status = "Failure";
    }
    return res.status(200).send({ status: status, menus: menus });
  };
  customLoginPage= async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const db = await config.connectdb("global");
    const custom_loginpageDB = db.model(
      "custom_loginpage",
      defaultSchema,
      "custom_loginpage"
    );
    var workspace=req.params.workspace;
    if(req.params.workspace=="Intelliflow")
    {
      workspace="master"
    }
    var regex = new RegExp(["^", workspace, "$"].join(""), "i");
    console.log(regex);
    
    let custom_loginpage = await custom_loginpageDB
      .find({ $or: [{ workspace: regex }, { workspace_url: regex }],type:req.params.type })
      .exec();
    var status = "Success";
    if (custom_loginpage.length == 0) {
      status = "Failure";
    }
    return res
      .status(200)
      .send({ status: status, loginpage: custom_loginpage });
  };
  checkworkspaceName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const db = await config.connectdb("global");
    const workspace_configDB = db.model(
      "workspace_config",
      defaultSchema,
      "workspace_config"
    );
    var regex = new RegExp(["^", req.params.workspace, "$"].join(""), "i");
    let workspace_config = await workspace_configDB
      .find({ $or: [{ workspace_name: regex }, { workspace_url: regex }] })
      .exec();
    var status = "Success";
    if (workspace_config.length == 0) {
      status = "Failure";
    }
    
    var wfconfig=JSON.parse(JSON.stringify(workspace_config[0]))

    delete wfconfig['workspace_config'];
    console.log(wfconfig);
    workspace_config[0]=wfconfig
    return res
      .status(200)
      .send({ status: status, access_info: workspace_config });
  };
  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    let finalData = null;
    try {
      const key = "6fa979f20126cb08aa645a8f495f6d85";
      const iv = "I8zyA4lVhMCaJ5Kg";

	console.log("***************Authenticate*********************************");
	console.log(req.headers.workspace);  
      console.log(req.body);
        console.log("************************************************************");

      const decrypted = CryptoJS.AES.decrypt(
        req.body.password,
        CryptoJS.enc.Utf8.parse(key),
        {
          iv: CryptoJS.enc.Utf8.parse(iv), // parse the IV
          padding: CryptoJS.pad.Pkcs7,
          mode: CryptoJS.mode.CBC,
        }
      ).toString(CryptoJS.enc.Utf8);


      var qs = require("qs");
      var data = qs.stringify({
        client_id: "admin-cli",
        username: req.body.username,
        password: decrypted,
        grant_type: "password",
      });

      var loginAPI = {
        method: "post",
        url:
          config.KEYCLOAK_URL +
          "realms/" +
          req.headers.workspace +
          "/protocol/openid-connect/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      axios(loginAPI)
        .then(function (response) {
          var userInfoAPI = {
            method: "GET",
            url:
              config.KEYCLOAK_URL +
              "admin/realms/" +
              req.headers.workspace +
              "/users?briefRepresentation=true&first=0&max=20&email=" +
              req.body.username, //+              req.body.username,
            headers: {
              authorization:
                "Bearer " +
                JSON.parse(JSON.stringify(response.data.access_token)),
              "Content-Type": "application/json",
              redirect: "follow",
            },
          };
          axios(userInfoAPI)
            .then(async function (resp) {
              var userdata = JSON.parse(JSON.stringify(resp.data));

              var groupAPI = {
                method: "GET",
                url:
                  config.KEYCLOAK_URL +
                  "admin/realms/" +
                  req.headers.workspace +
                  "/users/" +
                  userdata[0].id +
                  "/groups", //+              req.body.username,
                headers: {
                  authorization:
                    "Bearer " +
                    JSON.parse(JSON.stringify(response.data.access_token)),
                  "Content-Type": "application/json",
                  redirect: "follow",
                },
              };

              var groups = await axios(groupAPI);

              userdata[0].groups = groups.data;

              var roleAPI = {
                method: "GET",
                url:
                  config.KEYCLOAK_URL +
                  "admin/realms/" +
                  req.headers.workspace +
                  "/users/" +
                  userdata[0].id +
                  "/role-mappings", //+              req.body.username,
                headers: {
                  authorization:
                    "Bearer " +
                    JSON.parse(JSON.stringify(response.data.access_token)),
                  "Content-Type": "application/json",
                  redirect: "follow",
                },
              };

              var roles = await axios(roleAPI);

              userdata[0].roles = roles.data;
              //calling db data for assigned menu

              const db = await config.connectdb("global");
              const menu_assignedDB = db.model(
                "menu_assigned",
                defaultSchema,
                "menu_assigned"
              );

              var regexRole = new RegExp(["^", userdata[0].roles.realmMappings[0].name, "$"].join(""), "i");
              var regexWorkspace = new RegExp(
                ["^", req.headers.workspace, "$"].join(""),
                "i"
              );

              let menu_assigned = await menu_assignedDB
                .find({ role: regexRole, workspace: regexWorkspace })
                .exec();

              userdata[0].enabled_menu = menu_assigned;

              finalData = {
                access_info: response.data,
                UserInfo: userdata,
                workspace: req.headers.workspace_Name,
              };
              return res.json(finalData);
            })
            .catch(function (error) {
              console.log(error);
              return res.status(500).send({ error: error });
            });
        })
        .catch(function (error) {
          console.log(error);
          return res.status(500).send({ error: error });
        });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: error });
    }
  };

  getusers = async (req: Request, res: Response, next: NextFunction) => {
    console.log("WebDev :::::::::: getusers called");
    console.log(
      config.KEYCLOAK_URL + `admin/realms/` + req.headers.workspace + `/users`
    );
    console.log("access token " + req.headers.access_token);
    console.log("headers : " + JSON.stringify(req.headers));
    try {
      var userapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/users`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
      };
      console.log(userapi);

      axios(userapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.log(error);
          return res.status(500).send({ error: error });
        });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: error });
    }
  };

  createusers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var data = req.body;
      var password = data.password;
      delete data.password;
      data.credentials=[{"type":"password","value":password,"temporary":false}];
      var createuserapi = {
        method: "post",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/users`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(data),
      };
      axios(createuserapi)
        .then(function (response) {
          return res
            .send({ status: 200, message: "user created successfully" })
            .status(200);
        })
        .catch(function (error) {
          return res.status(409).send({
            error: error,
            status: 409,
            message: "user already exist",
          });
        });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: error });
    }
  };

  members = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var resetpasswordapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/groups/" +
          req.params.groupID +
          "/members",
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(resetpasswordapi)
        .then(function (response) {
          return res
            .send({
              status: "Success",
              message: response.data,
            })
            .status(200);
        })
        .catch(function (error) {
          console.log(error);
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      console.log(error);
      return res
        .status(200)
        .send({ status: "Failure", message: `Group dosen't exists` });
    }
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var resetpasswordapi = {
        method: "delete",
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/groups/" +
          req.params.groupID,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(resetpasswordapi)
        .then(function (response) {
          return res
            .send({
              status: "Success",
              message: "Group details updated successfully",
            })
            .status(200);
        })
        .catch(function (error) {
          console.log(error);
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      console.log(error);
      return res
        .status(200)
        .send({ status: "Failure", message: `Group dosen't exists` });
    }
  };
  updateGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var resetpasswordapi = {
        method: "put",
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/groups/" +
          req.params.groupID,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(resetpasswordapi)
        .then(function (response) {
          return res
            .send({
              status: "Success",
              message: "Group details updated successfully",
            })
            .status(200);
        })
        .catch(function (error) {
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      return res
        .status(200)
        .send({ status: "Failure", message: `Group dosen't exists` });
    }
  };
  getgroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var groupapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/groups`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
      };
      axios(groupapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.error(error);
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  updateRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var data = req.body;
      var rolesapi = {
        method: "put",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/roles/` +
          req.params.rolename,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(data),
      };
      axios(rolesapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.error(error);
          return res.json(error);
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  deleteRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var rolesapi = {
        method: "delete",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/roles/` +
          req.params.rolename,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
      };
      axios(rolesapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.error(error);
          return res.json(error);
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  roleUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var rolesapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/roles/` +
          req.params.rolename +
          `/users`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
      };
      axios(rolesapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.error(error);
          return res.json(error);
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  rolecomposites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var rolesapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/roles/` +
          req.params.rolename +
          `/composites`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
      };
      axios(rolesapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.error(error);
          return res.json(error);
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  roleusers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var rolesapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/roles/` +
          req.params.rolename +
          `/users`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
      };
      axios(rolesapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.error(error);
          return res.json(error);
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  rolegroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var rolesapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/roles/` +
          req.params.rolename +
          `/groups`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
      };
      axios(rolesapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.error(error);
          return res.json(error);
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  createroles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var data = req.body;
      var rolesapi = {
        method: "post",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/roles`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(data),
      };
      axios(rolesapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.error(error);
          return res.json(error);
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };
  roles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var rolesapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/roles`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
      };
      axios(rolesapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          console.error(error);
          return res.json(error);
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  creategroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var data = req.body;
      var creategroupsapi = {
        method: "post",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` +
          req.headers.workspace +
          `/groups`,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(data),
      };
      axios(creategroupsapi)
        .then(function (response) {
          return res
            .send({ status: 200, message: "group created successfully" })
            .status(200);
        })
        .catch(function (error) {
          return res.status(409).send({
            error: error.message,
            status: 409,
            message: "group already exist",
          });
        });
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  };

  resetpassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var data = {
        type: "password",
        value: req.body.password,
        temporary: false,
      };
      var resetpasswordapi = {
        method: "put",
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/users/" +
          req.body.userid +
          "/reset-password",
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(data),
      };

      axios(resetpasswordapi)
        .then(function (response) {
          return res
            .send({ status: 200, message: " password changed successfully" })
            .status(200);
        })
        .catch(function (error) {
          return res.status(409).send({
            error: error.message,
            status: 409,
            message: "reset password failed ",
          });
        });
    } catch (error) {
      console.error("error", error);

      return res.status(500).send({ error: error });
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var resetpasswordapi = {
        method: "delete",
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/users/" +
          req.params.userid,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(resetpasswordapi)
        .then(function (response) {
          return res
            .send({
              status: "Success",
              message: "user details updated successfully",
            })
            .status(200);
        })
        .catch(function (error) {
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      return res
        .status(200)
        .send({ status: "Failure", message: `The user dosen't exists` });
    }
  };

  rolemap = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var rolemapapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/users/" +
          req.params.userid +
          "/role-mappings",
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(rolemapapi)
        .then(function (response) {
          return res.json(response.data);
        })
        .catch(function (error) {
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      return res
        .status(200)
        .send({ status: "Failure", message: `The user dosen't exists` });
    }
  };


  deleteuserrole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var addusergroup = {
        method: "delete", 
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/users/" +
          req.params.userid +
          "/role-mappings/realm",
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(addusergroup)
        .then(function (response) {
          return res
            .send({
              status: "Success",
              message: "user added successfully",
            })
            .status(200);
        })
        .catch(function (error) {
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      return res
        .status(200)
        .send({ status: "Failure", message: `The user dosen't exists` });
    }
  };


  adduserrole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var addusergroup = {
        method: "post", 
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/users/" +
          req.params.userid +
          "/role-mappings/realm",
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(addusergroup)
        .then(function (response) {
          return res
            .send({
              status: "Success",
              message: "user added successfully",
            })
            .status(200);
        })
        .catch(function (error) {
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      return res
        .status(200)
        .send({ status: "Failure", message: `The user dosen't exists` });
    }
  };

  addusergroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var addusergroup = {
        method: "put", 
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/users/" +
          req.params.userid +
          "/groups/" +
          req.params.groupID,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(addusergroup)
        .then(function (response) {
          return res
            .send({
              status: "Success",
              message: "user added successfully",
            })
            .status(200);
        })
        .catch(function (error) {
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      return res
        .status(200)
        .send({ status: "Failure", message: `The user dosen't exists` });
    }
  };
  deleteusergroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var addusergroup = {
        method: "delete",
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/users/" +
          req.params.userid +
          "/groups/" +
          req.params.groupID,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(addusergroup)
        .then(function (response) {
          return res
            .send({
              status: "Success",
              message: "user left the Group",
            })
            .status(200);
        })
        .catch(function (error) {
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      return res
        .status(200)
        .send({ status: "Failure", message: `The user dosen't exists` });
    }
  };
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      var resetpasswordapi = {
        method: "put",
        url:
          config.KEYCLOAK_URL +
          "admin/realms/" +
          req.headers.workspace +
          "/users/" +
          req.params.userid,
        headers: {
          authorization: req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
        data: JSON.stringify(req.body),
      };
      axios(resetpasswordapi)
        .then(function (response) {
          return res
            .send({
              status: "Success",
              message: "user details updated successfully",
            })
            .status(200);
        })
        .catch(function (error) {
          return res.status(200).send({
            error: error.message,
            status: "Failure",
            message: "request failed ",
          });
        });
    } catch (error) {
      return res
        .status(200)
        .send({ status: "Failure", message: `The user dosen't exists` });
    }
  };
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username = req.body.username;
      var token = "";
      const key = "6fa979f20126cb08aa645a8f495f6d85";
      const iv = "I8zyA4lVhMCaJ5Kg";

      const decrypted = CryptoJS.AES.decrypt(
        "0Zgz+xCyFMWrIMd4Wdyu3w==",
        CryptoJS.enc.Utf8.parse(key),
        {
          iv: CryptoJS.enc.Utf8.parse(iv), // parse the IV
          padding: CryptoJS.pad.Pkcs7,
          mode: CryptoJS.mode.CBC,
        }
      ).toString(CryptoJS.enc.Utf8);

      var qs = require("qs");
      var data = qs.stringify({
        client_id: "admin-cli",
        username: "info@intelliflow.io",
        password: decrypted,
        grant_type: "password",
      });
      var tokenApi = {
        method: "post",
        url:
          config.KEYCLOAK_URL +
          "realms/" +
          req.headers.workspace +
          "/protocol/openid-connect/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      axios(tokenApi)
        .then(function (response) {
          token = response.data.access_token;
          var userapi = {
            method: "get",
            url:
              config.KEYCLOAK_URL +
              `admin/realms/` +
              req.headers.workspace +
              `/users?email=` +
              username,
            headers: {
              authorization: "Bearer " + response.data.access_token,
              "Content-Type": "application/json",
              redirect: "follow",
            },
          };
          axios(userapi).then(function (response) {
            const isExist = response.data.filter(
              (item) => item.username === username
            );

            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "info@intelliflow.io",
                pass: "Intelliflow123",
              },
            });

            if (isExist.length != 0) {
              var firstName = isExist[0].firstName;
              var lastName = isExist[0].lastName;
              var clientname = "req.body.Clientname";
              var Email = isExist[0].email;
              const id = CryptoJS.AES.encrypt(
                isExist[0].id + "&workspace=" + req.headers.workspace,
                CryptoJS.enc.Utf8.parse(key),
                {
                  iv: CryptoJS.enc.Utf8.parse(iv), // parse the IV
                  padding: CryptoJS.pad.Pkcs7,
                  mode: CryptoJS.mode.CBC,
                }
              ).toString();

              var link =
                "https://intelliflow.in/#/resetPassword?id=" +
                id +
                "&token=" +
                token;

              ejs.renderFile(
                path.join(__dirname, "../../../views/Email.ejs"),
                {
                  FirstName: firstName,
                  LastName: lastName,
                  ClientName: clientname,
                  Link: link,
                },
                function (err, data) {
                  if (err) {
                    console.error(err);
                    return res.status(200).send({
                      status: "Failure",
                      message: `The user dosen't exists ${username}`,
                    });
                  } else {
                    var mainOptions = {
                      from: "info@intelliflow.io",
                      to: Email,
                      subject: "Reset password",
                      html: data,
                    };
                    transporter.sendMail(mainOptions, function (err, info) {
                      if (err) {
                        return res.status(200).send({
                          status: "Failure",
                          message: `Failed to send with the reset link`,
                        });
                      } else {
                        return res.status(200).send({
                          status: "Success",
                          message: `An email has been sent to ${username} with the reset link`,
                        });
                      }
                    });
                  }
                }
              );
            } else {
              return res.status(200).send({
                status: "Failure",
                message: `The user dosen't exists ${username}`,
              });
            }
          });
        })
        .catch(function (error) {
          return res.status(200).send({
            status: "Failure",
            message: `The user dosen't exists ${username}`,
          });
        });
    } catch (error) {
      return res
        .status(200)
        .send({ status: "Failure", message: `The user dosen't exists` });
    }
  };
  getuser = async (req: Request, res: Response, next: NextFunction,) => {
    try{
      var username=req.params['username']
      var workspace=req.headers.workspace
      var userid= await useridAPI(workspace,username,req,res)
      if(userid==null){
        return res.status(404).send({Message:"User Validation Failed"})
      }
          var getuserapi = {
            method: "get",
            url:
              config.KEYCLOAK_URL +
              `admin/realms/` + workspace + `/users?username=` +
              username,
            headers: {
              authorization:
            req.headers.authorization,
              "Content-Type": "application/json",
              redirect: "follow",
            },
          };
          axios(getuserapi).then(function (response) {
            const isExist = response.data.filter(
              (item) => item.username === username
            );
            if (isExist.length != 0) { return res.json(response.data) }
            else { return res.status(404).send(`username : "${username}" Not Found`) }
          }).catch(function (error) {
            return res
              .status(error.response.status)
              .send({ status: "Failure", message: error });
          });

      
    }
    catch (error) {
      return res
        .status(error.response.status)
        .send({ status: "Failure", message: error });
    }

  };




  addmanager = async (req: Request, res: Response, next: NextFunction,) => {
    try {
      var username=req.params['username']
      var workspace=req.headers.workspace
      var userid= await useridAPI(workspace,username,req,res)
      if(userid==null){
        return res.status(404).send({Message:"User Validation Failed"})
      }

          var addmanagerapi = {
            method: "put",
            url:
              config.KEYCLOAK_URL +
              "admin/realms/" + workspace + "/users/" +userid,
            headers: {
              authorization:
            req.headers.authorization,
              "Content-Type": "application/json",
              redirect: "follow",
            },
            data: JSON.stringify(req.body),
          };
          axios(addmanagerapi)
            .then(function (response) {
              return res
                .send({ status: "Success", message: "Manager Added successfully" })
                .status(200);
            })
            .catch(function (error) {
              return res.status(error.response.status).send({
                error: error.message,
                status: "Failure",
                message: "request failed ",
              });
            });
  
}
    catch (error) {
      return res
        .status(error.response.status)
        .send({ status: "Failure", message: `The user dosen't exists` });
    }
  
  };


  updatemanager = async (req: Request, res: Response, next: NextFunction,) => {
    try {
      var username=req.params['username']
      var workspace=req.headers.workspace
      var userid= await useridAPI(workspace,username,req,res)
      if(userid==null){
        return res.status(404).send({Message:"User Validation Failed"})
      }
      var getuserapi = {
        method: "get",
        url:
          config.KEYCLOAK_URL +
          `admin/realms/` + workspace + `/users?username=` +
          username,
        headers: {
          authorization:
            req.headers.authorization,
          "Content-Type": "application/json",
          redirect: "follow",
        },
      };
      axios(getuserapi).then(function (response) {
        const isExist = response.data.filter(
          (item) => item.username === username
        );
        if (isExist.length != 0) { 
          var existmanagers = response.data[0].attributes.manager
              var req1 = req.body.attributes.manager
              for (let i = 0; i < existmanagers.length; i++)
                req1.push(existmanagers[i])

              var managers = [...new Set(req1)];
              req.body.attributes.manager = managers

              try {
                var updatemanagerapi = {
                  method: "put",
                  url:
                    config.KEYCLOAK_URL +
                    "admin/realms/" + workspace + "/users/" +
                    userid,
                  headers: {
                    authorization:
                    req.headers.authorization,
                    "Content-Type": "application/json",
                    redirect: "follow",
                  },

                  data: JSON.stringify(req.body),
                }; axios(updatemanagerapi)
                  .then(function (response) {
                    return res
                      .send({ status: "Success", message: "Manager Updated successfully" })
                      .status(200);
                  })
                  .catch(function (error) {
                    return res.status(error.response.status).send({
                      error: error.message,
                      status: "Failure",
                      message: "request failed ",
                    });
                  });
              }
              catch (error) {
                return res
                  .status(200)
                  .send({ status: "Failure", message: `The user dosen't exists` });
              }
         }
        else { return res.status(404).send(`username : "${username}" Not Found`) }}).catch(

        )
              
    } catch (error) {
      return res.status(500).send({ error: error });
    }

  };
  deletemanager = async (req: Request, res: Response, next: NextFunction,) => {
    try {
      var username=req.params['username']
      var workspace=req.headers.workspace
      var userid= await useridAPI(workspace,username,req,res)
      if(userid==null){
        return res.status(404).send({Message:"User Validation Failed"})
      }
          var managers = []
          var userapi = {
            method: "get",
            url:
              config.KEYCLOAK_URL + `admin/realms/` + workspace + `/users/` + userid,
            headers: {
              authorization:
              req.headers.authorization,
              "Content-Type": "application/json",
              redirect: "follow",
            },
          };
          axios(userapi)
            .then(function (response) {
              var existmanagers = response.data.attributes.manager
              var req1 = req.body.attributes.manager
              function findCommonElements3(arr1, arr2) {
                return arr1.some(item => arr2.includes(item))
              }
              if (findCommonElements3(existmanagers, req1)) {
                managers = existmanagers.filter((i) => !req1.includes(i))
                req.body.attributes.manager = managers
                try {
                  var deletemanagerapi = {
                    method: "put",
                    url:
                      config.KEYCLOAK_URL +
                      "admin/realms/" + req.headers.workspace + "/users/" +
                      userid,
                    headers: {
                      authorization:
                      req.headers.authorization,
                      "Content-Type": "application/json",
                      redirect: "follow",
                    },

                    data: JSON.stringify(req.body),
                  }; axios(deletemanagerapi)
                    .then(function (response) {
                      console.log(JSON.stringify(response.data));
                      return res
                        .send({ status: "Success", message: "Manager Deleted successfully" })
                        .status(200);
                    })
                    .catch(function (error) {
                      return res.status(error.response.status).send({
                        error: error.message,
                        status: "Failure",
                        message: "request failed ",
                      });
                    });
                }
                catch (error) {
                  return res
                    .status(200)
                    .send({ status: "Failure", message: `The user dosen't exists` });
                }
              }
              else {
                return res.status(200).send({ message: "No Manager Found" })
              }
            })
            .catch(function (error) {
              return res.status(500).send({ error: error });
            });
    }
    catch (error) {
      return res.status(500).send({ error: error });
    }

  };

  addbulkusers=async (req: Request, res: Response, next: NextFunction,) => {
    try {

      var nulluser=[]
      var workspace=req.headers.workspace  
      var usersdata=req.body.users
      var length=usersdata.length
      var jsondata=req.body
      var data1=[]

      for(let i=0;i<length;i++)
      {
        if(usersdata[i].username==""){
    
          nulluser.push(usersdata[i])
          usersdata.splice(i,1)
          --i
          --length
        }
        else{
          data1.push(usersdata[i])
        }

      }
      for(let i=0;i<data1.length;i++)
     { data1[i]["createdTimestamp"]= Date.now()
     var cred=[{
      "type":"password",
      "value":data1[i].firstName+"@123",
      "temporary":"false"
     }]
     data1[i]["credentials"]=cred
     console.log(data1)
    }
      req.body.users=data1
      var bulkadd = {
        method: "post",
        url:
        config.KEYCLOAK_URL +
        "admin/realms/" + workspace + "/partialImport",
      headers: {
        authorization:
        req.headers.authorization,
        "Content-Type": "application/json",
        redirect: "follow",
      },

      data: JSON.stringify(req.body),
    }
      await axios(bulkadd)
        .then(function (response) {
          if(nulluser==null)
          return res.status(200).send({message:data1.length+ " Users Added Success!"})
          else
          return res.status(200).send({message:data1.length+ " Users Added Success!, missing username of: "+nulluser.length})
    }).catch(function (error) {
      
      return res.status(error.response.status).send({message:"failed"})

    });
  }
    catch{
      return "error"
    }
  }


  // useridencrypt = async (req: Request, res: Response, next: NextFunction) =>{
  // const key = '6fa979f20126cb08aa645a8f495f6d85'
  //     const iv = 'I8zyA4lVhMCaJ5Kg'

  //     const encrypted = CryptoJS.AES.encrypt(userid, CryptoJS.enc.Utf8.parse(key), {
  //         iv: CryptoJS.enc.Utf8.parse(iv), // parse the IV
  //         padding: CryptoJS.pad.Pkcs7,
  //         mode: CryptoJS.mode.CBC
  //     }).toString();
  //   }
}
