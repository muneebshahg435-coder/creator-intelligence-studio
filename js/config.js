"use strict";

/*
=========================================================
CREATOR INTELLIGENCE STUDIO
PUBLIC FRONTEND CONFIGURATION
=========================================================

IMPORTANT:
Never place private API keys, passwords,
tokens or secret credentials in this file.

Anything stored here can eventually be visible
to website visitors.
*/


const APP_CONFIG = Object.freeze({

  appName: "Creator Intelligence Studio",

  version: "v0.1.0",

  environment: "development",

  backendEnabled: false,

  apiBaseUrl: "",

  storageKeys: Object.freeze({
    projects: "cis_projects_v1"
  }),

  limits: Object.freeze({
    projectInputMaxLength: 5000
  })

});
