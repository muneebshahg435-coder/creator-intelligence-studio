"use strict";


/*
=========================================================
CREATOR INTELLIGENCE STUDIO
FRONTEND APPLICATION
=========================================================
*/


document.addEventListener("DOMContentLoaded", () => {

  initializeApplication();

});


/* =====================================================
   APPLICATION INITIALIZATION
===================================================== */

function initializeApplication() {

  setApplicationVersion();

  setupNavigation();

  setupMobileSidebar();

  setupProjectForm();

  setupCharacterCounter();

  setupTopNewProjectButton();

  setupClearProjectsButton();

  renderProjects();

}


/* =====================================================
   VERSION
===================================================== */

function setApplicationVersion() {

  const versionElement =
    document.getElementById("appVersion");

  if (!versionElement) {
    return;
  }

  versionElement.textContent =
    APP_CONFIG.version;

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

  const navigationItems =
    document.querySelectorAll(".nav-item[data-section]");

  navigationItems.forEach((item) => {

    item.addEventListener("click", () => {

      const section =
        item.dataset.section;

      showSection(section);

      navigationItems.forEach((navItem) => {
        navItem.classList.remove("active");
      });

      item.classList.add("active");

      closeMobileSidebar();

    });

  });

}


function showSection(sectionName) {

  const sections =
    document.querySelectorAll(".page-section");

  sections.forEach((section) => {
    section.classList.remove("active-section");
  });


  const targetSection =
    document.getElementById(
      `${sectionName}Section`
    );


  if (!targetSection) {

    showToast(
      "This section is not available yet."
    );

    return;
  }


  targetSection.classList.add(
    "active-section"
  );


  updatePageHeader(sectionName);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function updatePageHeader(sectionName) {

  const pageTitle =
    document.getElementById("pageTitle");

  const pageSubtitle =
    document.getElementById("pageSubtitle");


  const pageData = {

    dashboard: {
      title: "Dashboard",
      subtitle:
        "Research, script, plan and produce your videos."
    },

    projects: {
      title: "Projects",
      subtitle:
        "Manage your video production projects."
    },

    research: {
      title: "Research",
      subtitle:
        "Investigate topics and organize evidence."
    },

    sources: {
      title: "Sources",
      subtitle:
        "Manage references and verified information."
    },

    scripts: {
      title: "Scripts",
      subtitle:
        "Build structured, evidence-linked video scripts."
    },

    visuals: {
      title: "Visual Plans",
      subtitle:
        "Plan B-roll, graphics, maps and editing."
    },

    publishing: {
      title: "Publishing",
      subtitle:
        "Prepare your final content package."
    },

    settings: {
      title: "Settings",
      subtitle:
        "Configure your Creator Intelligence workspace."
    }

  };


  const currentPage =
    pageData[sectionName];


  if (!currentPage) {
    return;
  }


  pageTitle.textContent =
    currentPage.title;

  pageSubtitle.textContent =
    currentPage.subtitle;

}


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

function setupMobileSidebar() {

  const menuButton =
    document.getElementById("menuButton");

  const closeButton =
    document.getElementById("sidebarClose");

  const overlay =
    document.getElementById("sidebarOverlay");


  if (menuButton) {

    menuButton.addEventListener(
      "click",
      openMobileSidebar
    );

  }


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeMobileSidebar
    );

  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      closeMobileSidebar
    );

  }


  window.addEventListener(
    "resize",
    handleWindowResize
  );

}


function openMobileSidebar() {

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById(
      "sidebarOverlay"
    );


  sidebar?.classList.add("open");

  overlay?.classList.add("show");

}


function closeMobileSidebar() {

  const sidebar =
    document.getElementById("sidebar");

  const overlay =
    document.getElementById(
      "sidebarOverlay"
    );


  sidebar?.classList.remove("open");

  overlay?.classList.remove("show");

}


function handleWindowResize() {

  if (window.innerWidth > 850) {

    closeMobileSidebar();

  }

}


/* =====================================================
   CHARACTER COUNTER
===================================================== */

function setupCharacterCounter() {

  const input =
    document.getElementById(
      "projectInput"
    );

  if (!input) {
    return;
  }


  input.addEventListener(
    "input",
    updateCharacterCounter
  );


  updateCharacterCounter();

}


function updateCharacterCounter() {

  const input =
    document.getElementById(
      "projectInput"
    );

  const counter =
    document.getElementById(
      "characterCounter"
    );


  if (!input || !counter) {
    return;
  }


  const length =
    input.value.length;

  const max =
    APP_CONFIG.limits
      .projectInputMaxLength;


  counter.textContent =
    `${length} / ${max}`;

}


/* =====================================================
   PROJECT FORM
===================================================== */

function setupProjectForm() {

  const projectForm =
    document.getElementById(
      "projectForm"
    );


  if (!projectForm) {
    return;
  }


  projectForm.addEventListener(
    "submit",
    handleProjectCreation
  );

}


function handleProjectCreation(event) {

  event.preventDefault();


  const input =
    document
      .getElementById("projectInput")
      .value
      .trim();


  const language =
    document
      .getElementById("projectLanguage")
      .value;


  const videoType =
    document
      .getElementById("videoType")
      .value;


  const videoLength =
    document
      .getElementById("videoLength")
      .value;


  const researchDepth =
    document
      .getElementById("researchDepth")
      .value;


  if (!input) {

    showToast(
      "Please enter a topic, article, URL or notes."
    );

    return;

  }


  if (
    input.length >
    APP_CONFIG.limits
      .projectInputMaxLength
  ) {

    showToast(
      "Your project input is too long."
    );

    return;

  }


  const project = {

    id: generateProjectId(),

    title: createProjectTitle(input),

    originalInput: input,

    language,

    videoType,

    videoLength,

    researchDepth,

    status: "Idea",

    createdAt:
      new Date().toISOString()

  };


  const projects =
    getStoredProjects();


  projects.unshift(project);


  saveProjects(projects);


  renderProjects();


  resetProjectForm();


  showToast(
    "Project created successfully."
  );


  scrollToProjects();

}


/* =====================================================
   PROJECT HELPERS
===================================================== */

function generateProjectId() {

  return (
    "project_" +
    Date.now().toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );

}


function createProjectTitle(input) {

  const cleanInput =
    input
      .replace(/\s+/g, " ")
      .trim();


  const maxTitleLength = 75;


  if (
    cleanInput.length <=
    maxTitleLength
  ) {

    return cleanInput;

  }


  return (
    cleanInput
      .slice(0, maxTitleLength)
      .trim() +
    "..."
  );

}


function resetProjectForm() {

  const projectForm =
    document.getElementById(
      "projectForm"
    );


  if (!projectForm) {
    return;
  }


  projectForm.reset();


  document
    .getElementById("videoLength")
    .value = "10";


  document
    .getElementById("researchDepth")
    .value = "standard";


  updateCharacterCounter();

}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function getStoredProjects() {

  try {

    const storedData =
      localStorage.getItem(
        APP_CONFIG.storageKeys.projects
      );


    if (!storedData) {
      return [];
    }


    const parsedData =
      JSON.parse(storedData);


    if (!Array.isArray(parsedData)) {
      return [];
    }


    return parsedData;

  }
  catch (error) {

    console.error(
      "Could not load projects:",
      error
    );

    return [];

  }

}


function saveProjects(projects) {

  try {

    localStorage.setItem(
      APP_CONFIG.storageKeys.projects,
      JSON.stringify(projects)
    );

  }
  catch (error) {

    console.error(
      "Could not save projects:",
      error
    );


    showToast(
      "Project could not be saved in this browser."
    );

  }

}


/* =====================================================
   PROJECT RENDERING
===================================================== */

function renderProjects() {

  const projectsGrid =
    document.getElementById(
      "projectsGrid"
    );

  const emptyState =
    document.getElementById(
      "emptyState"
    );


  if (!projectsGrid || !emptyState) {
    return;
  }


  const projects =
    getStoredProjects();


  projectsGrid.innerHTML = "";


  if (projects.length === 0) {

    projectsGrid.style.display =
      "none";

    emptyState.style.display =
      "block";

    return;

  }


  projectsGrid.style.display =
    "grid";

  emptyState.style.display =
    "none";


  projects.forEach((project) => {

    const projectCard =
      createProjectCard(project);

    projectsGrid.appendChild(
      projectCard
    );

  });

}


function createProjectCard(project) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "project-card";


  const safeTitle =
    escapeHTML(
      project.title ||
      "Untitled Project"
    );


  const safeType =
    escapeHTML(
      formatLabel(
        project.videoType
      )
    );


  const safeLanguage =
    escapeHTML(
      formatLabel(
        project.language
      )
    );


  const safeStatus =
    escapeHTML(
      project.status ||
      "Idea"
    );


  const createdDate =
    formatProjectDate(
      project.createdAt
    );


  card.innerHTML = `

    <div class="project-meta">

      <span>
        ${safeType}
      </span>

      <span>
        ${createdDate}
      </span>

    </div>


    <h4>
      ${safeTitle}
    </h4>


    <p>
      ${safeLanguage}
      ·
      ${formatLength(
        project.videoLength
      )}
      ·
      ${formatLabel(
        project.researchDepth
      )}
    </p>


    <div class="project-footer">

      <span class="project-status">
        ${safeStatus}
      </span>

      <button
        class="project-delete"
        data-project-id="${escapeHTML(
          project.id
        )}"
        type="button"
      >
        Delete
      </button>

    </div>

  `;


  const deleteButton =
    card.querySelector(
      ".project-delete"
    );


  deleteButton.addEventListener(
    "click",
    () => {

      deleteProject(
        project.id
      );

    }
  );


  return card;

}


/* =====================================================
   DELETE PROJECT
===================================================== */

function deleteProject(projectId) {

  const projects =
    getStoredProjects();


  const updatedProjects =
    projects.filter(
      (project) =>
        project.id !== projectId
    );


  saveProjects(updatedProjects);

  renderProjects();


  showToast(
    "Project deleted."
  );

}


/* =====================================================
   CLEAR PROJECTS
===================================================== */

function setupClearProjectsButton() {

  const button =
    document.getElementById(
      "clearProjectsButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      const projects =
        getStoredProjects();


      if (projects.length === 0) {

        showToast(
          "There are no projects to clear."
        );

        return;

      }


      const confirmed =
        window.confirm(
          "Delete all locally saved projects?"
        );


      if (!confirmed) {
        return;
      }


      localStorage.removeItem(
        APP_CONFIG.storageKeys.projects
      );


      renderProjects();


      showToast(
        "All local projects were removed."
      );

    }
  );

}


/* =====================================================
   NEW PROJECT BUTTON
===================================================== */

function setupTopNewProjectButton() {

  const button =
    document.getElementById(
      "topNewProjectButton"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      showSection("dashboard");


      setActiveNavigation(
        "dashboard"
      );


      const createPanel =
        document.getElementById(
          "createProjectPanel"
        );


      createPanel?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });


      setTimeout(() => {

        document
          .getElementById(
            "projectInput"
          )
          ?.focus();

      }, 400);

    }
  );

}


function setActiveNavigation(
  sectionName
) {

  const navigationItems =
    document.querySelectorAll(
      ".nav-item[data-section]"
    );


  navigationItems.forEach(
    (item) => {

      item.classList.toggle(
        "active",
        item.dataset.section ===
          sectionName
      );

    }
  );

}


/* =====================================================
   SCROLLING
===================================================== */

function scrollToProjects() {

  const projectsGrid =
    document.getElementById(
      "projectsGrid"
    );


  projectsGrid?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =====================================================
   FORMATTERS
===================================================== */

function formatLabel(value) {

  if (!value) {
    return "";
  }


  return value

    .replace(/-/g, " ")

    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );

}


function formatLength(value) {

  if (value === "short") {
    return "YouTube Short";
  }


  if (value === "20") {
    return "20+ min";
  }


  return `${value} min`;

}


function formatProjectDate(
  dateString
) {

  const date =
    new Date(dateString);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "Unknown date";

  }


  return new Intl.DateTimeFormat(
    "en",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(date);

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(value) {

  const element =
    document.createElement("div");


  element.textContent =
    String(value ?? "");


  return element.innerHTML;

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  const messageElement =
    document.getElementById(
      "toastMessage"
    );


  if (!toast || !messageElement) {
    return;
  }


  messageElement.textContent =
    message;


  toast.classList.add("show");


  clearTimeout(toastTimer);


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3000);

}
