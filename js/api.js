"use strict";

/*
=========================================================
CREATOR INTELLIGENCE STUDIO
FRONTEND API CLIENT
=========================================================

This file handles communication between:

GitHub Pages
     ↓
Google Apps Script
     ↓
Google Sheets

Admin credentials are stored in sessionStorage only.
They are NOT committed to GitHub.
*/


const CreatorAPI = (() => {


  /* =====================================================
     CONFIGURATION CHECK
  ===================================================== */

  function isConfigured() {

    const url =
      String(
        APP_CONFIG.apiBaseUrl || ""
      ).trim();


    return (
      url.startsWith("https://") &&
      !url.includes(
        "PASTE_YOUR_APPS_SCRIPT"
      )
    );

  }


  function requireConfiguration() {

    if (!isConfigured()) {

      throw new Error(
        "Backend URL has not been configured in js/config.js."
      );

    }

  }


  /* =====================================================
     ADMIN TOKEN SESSION
  ===================================================== */

  function saveAdminToken(token) {

    const cleanToken =
      String(token || "").trim();


    if (!cleanToken) {

      throw new Error(
        "Admin token cannot be empty."
      );

    }


    sessionStorage.setItem(
      APP_CONFIG.sessionKeys.adminToken,
      cleanToken
    );

  }


  function getAdminToken() {

    return (
      sessionStorage.getItem(
        APP_CONFIG.sessionKeys.adminToken
      ) || ""
    );

  }


  function hasAdminToken() {

    return (
      getAdminToken().length > 0
    );

  }


  function clearAdminToken() {

    sessionStorage.removeItem(
      APP_CONFIG.sessionKeys.adminToken
    );

  }


  /* =====================================================
     HEALTH CHECK
  ===================================================== */

  async function healthCheck() {

    requireConfiguration();


    const url =
      new URL(
        APP_CONFIG.apiBaseUrl
      );


    url.searchParams.set(
      "action",
      "health"
    );


    const response =
      await fetch(
        url.toString(),
        {
          method: "GET",
          cache: "no-store",
          redirect: "follow"
        }
      );


    return parseResponse_(
      response
    );

  }


  /* =====================================================
     PROTECTED REQUEST
  ===================================================== */

  async function request(
    action,
    payload = {}
  ) {

    requireConfiguration();


    const adminToken =
      getAdminToken();


    if (!adminToken) {

      const error =
        new Error(
          "Admin authentication is required."
        );

      error.code =
        "AUTH_REQUIRED";

      throw error;

    }


    const requestBody = {

      action,

      adminToken,

      payload

    };


    const response =
      await fetch(
        APP_CONFIG.apiBaseUrl,
        {
          method: "POST",

          redirect: "follow",

          cache: "no-store",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(
              requestBody
            )
        }
      );


    const data =
      await parseResponse_(
        response
      );


    if (!data.success) {

      const error =
        new Error(
          data.message ||
          "The backend request failed."
        );


      error.code =
        data.error ||
        "API_ERROR";


      throw error;

    }


    return data;

  }


  /* =====================================================
     PROJECT API
  ===================================================== */

  async function createProject(
    projectData
  ) {

    return request(
      "createProject",
      projectData
    );

  }


  async function listProjects() {

    return request(
      "listProjects",
      {}
    );

  }


  async function getProject(
    projectId
  ) {

    return request(
      "getProject",
      {
        projectId
      }
    );

  }

 async function addSource(
  sourceData
) {

  return request(
    "addSource",
    sourceData
  );

}


async function addResearchFinding(
  researchData
) {

  return request(
    "addResearchFinding",
    researchData
  );

}


async function getProjectResearch(
  projectId
) {

  return request(
    "getProjectResearch",
    {
      projectId
    }
  );

} 


  /* =====================================================
     RESPONSE PARSER
  ===================================================== */

  async function parseResponse_(
    response
  ) {

    const text =
      await response.text();


    if (!response.ok) {

      throw new Error(
        `Backend returned HTTP ${response.status}.`
      );

    }


    if (!text) {

      throw new Error(
        "Backend returned an empty response."
      );

    }


    try {

      return JSON.parse(text);

    }
    catch (error) {

      console.error(
        "Unexpected backend response:",
        text
      );


      throw new Error(
        "Backend returned an invalid response."
      );

    }

  }


  /* =====================================================
     PUBLIC INTERFACE
  ===================================================== */

  return Object.freeze({

    isConfigured,

    healthCheck,

    saveAdminToken,

    getAdminToken,

    hasAdminToken,

    clearAdminToken,

    createProject,

    listProjects,

    getProject

    addSource,

addResearchFinding,

getProjectResearch,

  });


})();
