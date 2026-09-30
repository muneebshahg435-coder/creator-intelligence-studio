"use strict";

/*
=========================================================
CREATOR INTELLIGENCE STUDIO
PUBLIC FRONTEND CONFIGURATION
=========================================================

IMPORTANT:
Never place API keys, passwords, admin tokens,
or other private credentials in this file.

This file is PUBLIC because the GitHub repository
and website are public.
*/


const APP_CONFIG = Object.freeze({

  appName: "Creator Intelligence Studio",

  version: "v0.2.0",

  environment: "production",

  backendEnabled: true,

  /*
  =======================================================
  PASTE ONLY YOUR APPS SCRIPT /exec URL BELOW.

  SAFE TO STORE:
  Apps Script public web-app URL.

  NEVER STORE:
  Admin Token
  AI API keys
  Passwords
  =======================================================
  */

  apiBaseUrl:
    "https://creator-intelligence-cors-c03d.muneebshahg435.workers.dev/",

  sessionKeys: Object.freeze({

    adminToken:
      "cis_admin_token_v1"

  }),

  limits: Object.freeze({

    projectInputMaxLength: 5000

  })

});
