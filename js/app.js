"use strict";

/*
=========================================================
CREATOR INTELLIGENCE STUDIO
FRONTEND APPLICATION — v0.2
=========================================================
*/


document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeApplication();
  }
);


/* =====================================================
   INITIALIZATION
===================================================== */

async function initializeApplication() {

  setApplicationVersion();

  setupNavigation();

  setupMobileSidebar();

  setupCharacterCounter();

  setupProjectForm();

  setupTopNewProjectButton();

  setupAdminAuthentication();

  setupResearchWorkspace();

  await checkBackendHealth();

  updateAuthenticationUI();


  if (CreatorAPI.hasAdminToken()) {

    await loadProjects();

  } else {

    renderProjects([]);

  }

}


/* =====================================================
   VERSION
===================================================== */

function setApplicationVersion() {

  const element =
    document.getElementById(
      "appVersion"
    );

  if (element) {

    element.textContent =
      APP_CONFIG.version;

  }

}


/* =====================================================
   BACKEND HEALTH
===================================================== */

async function checkBackendHealth() {

  setBackendStatus(
    "checking",
    "Checking Backend..."
  );


  try {

    const result =
      await CreatorAPI.healthCheck();


    if (
      result.success &&
      result.status === "online"
    ) {

      setBackendStatus(
        "online",
        "Backend Online"
      );

      return true;

    }


    throw new Error(
      "Backend health check failed."
    );

  } catch (error) {

    console.error(
      "Backend health check:",
      error
    );


    setBackendStatus(
      "offline",
      "Backend Offline"
    );


    return false;

  }

}


function setBackendStatus(
  status,
  text
) {

  const dot =
    document.getElementById(
      "backendStatusDot"
    );

  const label =
    document.getElementById(
      "backendStatusText"
    );


  if (!dot || !label) {
    return;
  }


  dot.classList.remove(
    "status-checking",
    "status-online",
    "status-offline"
  );


  if (status === "online") {

    dot.classList.add(
      "status-online"
    );

  } else if (status === "offline") {

    dot.classList.add(
      "status-offline"
    );

  } else {

    dot.classList.add(
      "status-checking"
    );

  }


  label.textContent =
    text;

}


/* =====================================================
   ADMIN AUTHENTICATION
===================================================== */

function setupAdminAuthentication() {

  const accessButton =
    document.getElementById(
      "adminAccessButton"
    );

  const modal =
    document.getElementById(
      "adminModal"
    );

  const closeButton =
    document.getElementById(
      "adminModalClose"
    );

  const form =
    document.getElementById(
      "adminAccessForm"
    );

  const disconnectButton =
    document.getElementById(
      "disconnectAdminButton"
    );

  const backendButton =
    document.getElementById(
      "backendStatusButton"
    );


  accessButton?.addEventListener(
    "click",
    openAdminModal
  );


  backendButton?.addEventListener(
    "click",
    checkBackendHealth
  );


  closeButton?.addEventListener(
    "click",
    closeAdminModal
  );


  modal?.addEventListener(
    "click",
    event => {

      if (event.target === modal) {

        closeAdminModal();

      }

    }
  );


  form?.addEventListener(
    "submit",
    handleAdminConnect
  );


  disconnectButton?.addEventListener(
    "click",
    disconnectAdmin
  );


  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {

        closeAdminModal();

      }

    }
  );

}


function openAdminModal() {

  const modal =
    document.getElementById(
      "adminModal"
    );

  const tokenInput =
    document.getElementById(
      "adminTokenInput"
    );


  modal?.classList.add(
    "show"
  );


  modal?.setAttribute(
    "aria-hidden",
    "false"
  );


  if (tokenInput) {

    tokenInput.value = "";


    setTimeout(
      () => {
        tokenInput.focus();
      },
      100
    );

  }

}


function closeAdminModal() {

  const modal =
    document.getElementById(
      "adminModal"
    );


  modal?.classList.remove(
    "show"
  );


  modal?.setAttribute(
    "aria-hidden",
    "true"
  );

}


async function handleAdminConnect(
  event
) {

  event.preventDefault();


  const tokenInput =
    document.getElementById(
      "adminTokenInput"
    );


  const token =
    String(
      tokenInput?.value || ""
    ).trim();


  if (!token) {

    showToast(
      "Enter your Admin Token."
    );

    return;

  }


  CreatorAPI.saveAdminToken(
    token
  );


  showToast(
    "Verifying admin access..."
  );


  try {

    await CreatorAPI.listProjects();


    closeAdminModal();


    updateAuthenticationUI();


    await loadProjects();


    showToast(
      "Admin session connected."
    );

  } catch (error) {

    CreatorAPI.clearAdminToken();


    updateAuthenticationUI();


    console.error(error);


    if (error.code === "AUTH_FAILED") {

      showToast(
        "Invalid Admin Token."
      );

    } else {

      showToast(
        error.message ||
        "Could not connect admin session."
      );

    }

  }

}


function disconnectAdmin() {

  CreatorAPI.clearAdminToken();


  updateAuthenticationUI();


  renderProjects([]);


  closeAdminModal();


  showToast(
    "Admin session disconnected."
  );

}


function updateAuthenticationUI() {

  const button =
    document.getElementById(
      "adminAccessButton"
    );


  if (!button) {
    return;
  }


  if (CreatorAPI.hasAdminToken()) {

    button.textContent =
      "Admin Connected";

  } else {

    button.textContent =
      "Connect Admin";

  }

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

  const items =
    document.querySelectorAll(
      ".nav-item[data-section]"
    );


  items.forEach(
    item => {

      item.addEventListener(
        "click",
        () => {

          const section =
            item.dataset.section;


          showSection(section);


          items.forEach(
            navItem => {

              navItem.classList
                .remove("active");

            }
          );


          item.classList.add(
            "active"
          );


          closeMobileSidebar();

        }
      );

    }
  );

}


function showSection(
  sectionName
) {

  const sections =
    document.querySelectorAll(
      ".page-section"
    );


  sections.forEach(
    section => {

      section.classList.remove(
        "active-section"
      );

    }
  );


  const target =
    document.getElementById(
      `${sectionName}Section`
    );


  if (!target) {

    showToast(
      "This section is not available yet."
    );

    return;

  }


  target.classList.add(
    "active-section"
  );


  updatePageHeader(
    sectionName
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function updatePageHeader(
  sectionName
) {

  const title =
    document.getElementById(
      "pageTitle"
    );

  const subtitle =
    document.getElementById(
      "pageSubtitle"
    );


  const pages = {

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


  const page =
    pages[sectionName];


  if (!page) {
    return;
  }


  title.textContent =
    page.title;

  subtitle.textContent =
    page.subtitle;

}


/* =====================================================
   MOBILE SIDEBAR
===================================================== */

function setupMobileSidebar() {

  document
    .getElementById(
      "menuButton"
    )
    ?.addEventListener(
      "click",
      openMobileSidebar
    );


  document
    .getElementById(
      "sidebarClose"
    )
    ?.addEventListener(
      "click",
      closeMobileSidebar
    );


  document
    .getElementById(
      "sidebarOverlay"
    )
    ?.addEventListener(
      "click",
      closeMobileSidebar
    );


  window.addEventListener(
    "resize",
    () => {

      if (window.innerWidth > 850) {

        closeMobileSidebar();

      }

    }
  );

}


function openMobileSidebar() {

  document
    .getElementById(
      "sidebar"
    )
    ?.classList.add(
      "open"
    );


  document
    .getElementById(
      "sidebarOverlay"
    )
    ?.classList.add(
      "show"
    );

}


function closeMobileSidebar() {

  document
    .getElementById(
      "sidebar"
    )
    ?.classList.remove(
      "open"
    );


  document
    .getElementById(
      "sidebarOverlay"
    )
    ?.classList.remove(
      "show"
    );

}


/* =====================================================
   CHARACTER COUNTER
===================================================== */

function setupCharacterCounter() {

  const input =
    document.getElementById(
      "projectInput"
    );


  input?.addEventListener(
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


  counter.textContent =
    `${input.value.length} / ` +
    APP_CONFIG.limits
      .projectInputMaxLength;

}

/* =====================================================
   RESEARCH WORKSPACE
===================================================== */

let researchProjectsCache = [];


function setupResearchWorkspace() {

  const projectSelect =
    document.getElementById(
      "researchProjectSelect"
    );


  if (!projectSelect) {
    return;
  }


  projectSelect.addEventListener(
    "change",
    handleResearchProjectSelection
  );

}

  const sourceForm =
    document.getElementById(
      "sourceForm"
    );


  sourceForm?.addEventListener(
    "submit",
    handleAddSource
  );

function populateResearchProjectSelect(
  projects
) {

  const projectSelect =
    document.getElementById(
      "researchProjectSelect"
    );


  if (!projectSelect) {
    return;
  }


  researchProjectsCache =
    Array.isArray(projects)
      ? projects
      : [];


  projectSelect.innerHTML = `
    <option value="">
      Choose a project...
    </option>
  `;


  researchProjectsCache.forEach(
    project => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        project.projectId;


      option.textContent =
        project.title ||
        project.projectId;


      projectSelect.appendChild(
        option
      );

    }
  );

}


async function handleResearchProjectSelection(
  event
) {

  const projectId =
    event.target.value;


  const workspace =
    document.getElementById(
      "researchWorkspace"
    );


  if (!projectId) {

    if (workspace) {
      workspace.hidden = true;
    }

    return;

  }


  const project =
    researchProjectsCache.find(
      item =>
        item.projectId ===
        projectId
    );


  if (project) {

    const title =
      document.getElementById(
        "researchProjectTitle"
      );

    const meta =
      document.getElementById(
        "researchProjectMeta"
      );


    if (title) {

      title.textContent =
        project.title ||
        "Project Research";

    }


    if (meta) {

      meta.textContent =
        `${formatLabel(
          project.videoType
        )} · ${formatLength(
          project.targetLength
        )} · ${formatLabel(
          project.researchDepth
        )}`;

    }

  }


  if (workspace) {

    workspace.hidden = false;

  }


  await loadProjectResearch(
    projectId
  );

}


async function loadProjectResearch(
  projectId
) {

  try {

    const response =
      await CreatorAPI
        .getProjectResearch(
          projectId
        );


    const sources =
      response.sources || [];


    const research =
      response.research || [];


    const verifiedCount =
      research.filter(
        item =>
          item.verificationStatus ===
          "verified"
      ).length;


    updateResearchSummary(
      sources.length,
      research.length,
      verifiedCount
    );

  }
  catch (error) {

    console.error(
      "Load project research error:",
      error
    );


    handleApiError(error);

  }

}


function updateResearchSummary(
  sourceCount,
  researchCount,
  verifiedCount
) {

  const sourceElement =
    document.getElementById(
      "sourceCount"
    );

  const researchElement =
    document.getElementById(
      "researchCount"
    );

  const verifiedElement =
    document.getElementById(
      "verifiedCount"
    );


  if (sourceElement) {

    sourceElement.textContent =
      `${sourceCount} ${
        sourceCount === 1
          ? "Source"
          : "Sources"
      }`;

  }


  if (researchElement) {

    researchElement.textContent =
      `${researchCount} ${
        researchCount === 1
          ? "Finding"
          : "Findings"
      }`;

  }


  if (verifiedElement) {

    verifiedElement.textContent =
      `${verifiedCount} Verified`;

  }

}

/* =====================================================
   PROJECT CREATION
===================================================== */

function setupProjectForm() {

  document
    .getElementById(
      "projectForm"
    )
    ?.addEventListener(
      "submit",
      handleProjectCreation
    );

}


async function handleProjectCreation(
  event
) {

  event.preventDefault();


  if (!CreatorAPI.hasAdminToken()) {

    showToast(
      "Connect your Admin Session first."
    );


    openAdminModal();


    return;

  }


  const input =
    document
      .getElementById(
        "projectInput"
      )
      .value
      .trim();


  if (!input) {

    showToast(
      "Enter a topic, article, URL or notes."
    );

    return;

  }


  if (
    input.length >
    APP_CONFIG.limits
      .projectInputMaxLength
  ) {

    showToast(
      "Project input is too long."
    );

    return;

  }


  const submitButton =
    event.currentTarget
      .querySelector(
        'button[type="submit"]'
      );


  const originalButtonText =
    submitButton.textContent;


  submitButton.disabled =
    true;


  submitButton.textContent =
    "Creating Project...";


  try {

    const response =
      await CreatorAPI.createProject({

        originalInput:
          input,

        inputType:
          detectInputType(
            input
          ),

        language:
          document
            .getElementById(
              "projectLanguage"
            )
            .value,

        videoType:
          document
            .getElementById(
              "videoType"
            )
            .value,

        targetLength:
          document
            .getElementById(
              "videoLength"
            )
            .value,

        researchDepth:
          document
            .getElementById(
              "researchDepth"
            )
            .value

      });


    if (!response.success) {

      throw new Error(
        response.message ||
        "Project creation failed."
      );

    }


    resetProjectForm();


    await loadProjects();


    showToast(
      "Project saved to Google Sheets."
    );


    scrollToProjects();

  } catch (error) {

    console.error(
      "Create project error:",
      error
    );


    handleApiError(error);

  } finally {

    submitButton.disabled =
      false;


    submitButton.textContent =
      originalButtonText;

  }

}


/* =====================================================
   INPUT TYPE DETECTION
===================================================== */

function detectInputType(
  input
) {

  const value =
    input.trim();


  if (
    /^https?:\/\/\S+$/i.test(
      value
    )
  ) {

    return "url";

  }


  if (
    /^https?:\/\/\S+/i.test(
      value
    )
  ) {

    return "mixed";

  }


  if (value.length > 900) {

    return "article";

  }


  return "topic";

}


/* =====================================================
   LOAD PROJECTS
===================================================== */

async function loadProjects() {

  if (!CreatorAPI.hasAdminToken()) {

    renderProjects([]);

    return;

  }


  try {

    const response =
      await CreatorAPI.listProjects();


    const projects =
  response.projects || [];


renderProjects(
  projects
);


populateResearchProjectSelect(
  projects
);

  } catch (error) {

    console.error(
      "Load projects error:",
      error
    );


    handleApiError(error);

  }

}


/* =====================================================
   PROJECT RENDERING
===================================================== */

function renderProjects(
  projects
) {

  const grid =
    document.getElementById(
      "projectsGrid"
    );

  const empty =
    document.getElementById(
      "emptyState"
    );


  if (!grid || !empty) {
    return;
  }


  grid.innerHTML = "";


  if (
    !Array.isArray(projects) ||
    projects.length === 0
  ) {

    grid.style.display =
      "none";

    empty.style.display =
      "block";

    return;

  }


  grid.style.display =
    "grid";

  empty.style.display =
    "none";


  projects.forEach(
    project => {

      grid.appendChild(
        createProjectCard(
          project
        )
      );

    }
  );

}


function createProjectCard(
  project
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "project-card";


  card.innerHTML = `

    <div class="project-meta">

      <span>
        ${escapeHTML(
          formatLabel(
            project.videoType
          )
        )}
      </span>

      <span>
        ${escapeHTML(
          formatProjectDate(
            project.createdAt
          )
        )}
      </span>

    </div>


    <h4>
      ${escapeHTML(
        project.title ||
        "Untitled Project"
      )}
    </h4>


    <p>

      ${escapeHTML(
        formatLabel(
          project.language
        )
      )}

      ·

      ${escapeHTML(
        formatLength(
          project.targetLength
        )
      )}

      ·

      ${escapeHTML(
        formatLabel(
          project.researchDepth
        )
      )}

    </p>


    <div class="project-footer">

      <span class="project-status">

        ${escapeHTML(
          project.status ||
          "Idea"
        )}

      </span>


      <span class="project-id">

        ${escapeHTML(
          project.projectId ||
          ""
        )}

      </span>

    </div>

  `;


  return card;

}


/* =====================================================
   RESET FORM
===================================================== */

function resetProjectForm() {

  const form =
    document.getElementById(
      "projectForm"
    );


  form?.reset();


  const length =
    document.getElementById(
      "videoLength"
    );


  const depth =
    document.getElementById(
      "researchDepth"
    );


  if (length) {

    length.value =
      "10";

  }


  if (depth) {

    depth.value =
      "standard";

  }


  updateCharacterCounter();

}


/* =====================================================
   NEW VIDEO BUTTON
===================================================== */

function setupTopNewProjectButton() {

  document
    .getElementById(
      "topNewProjectButton"
    )
    ?.addEventListener(
      "click",
      () => {

        showSection(
          "dashboard"
        );


        setActiveNavigation(
          "dashboard"
        );


        document
          .getElementById(
            "createProjectPanel"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });


        setTimeout(
          () => {

            document
              .getElementById(
                "projectInput"
              )
              ?.focus();

          },
          350
        );

      }
    );

}


function setActiveNavigation(
  sectionName
) {

  document
    .querySelectorAll(
      ".nav-item[data-section]"
    )
    .forEach(
      item => {

        item.classList.toggle(
          "active",
          item.dataset.section ===
            sectionName
        );

      }
    );

}


/* =====================================================
   API ERROR HANDLING
===================================================== */

function handleApiError(
  error
) {

  if (
    error.code === "AUTH_FAILED" ||
    error.code === "AUTH_REQUIRED"
  ) {

    CreatorAPI.clearAdminToken();


    updateAuthenticationUI();


    renderProjects([]);


    showToast(
      "Admin session expired or is invalid."
    );


    openAdminModal();


    return;

  }


  showToast(
    error.message ||
    "Something went wrong."
  );

}


/* =====================================================
   SCROLL
===================================================== */

function scrollToProjects() {

  document
    .getElementById(
      "projectsGrid"
    )
    ?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

}


/* =====================================================
   FORMATTERS
===================================================== */

function formatLabel(
  value
) {

  if (!value) {
    return "";
  }


  return String(value)

    .replace(
      /-/g,
      " "
    )

    .replace(
      /\b\w/g,
      character =>
        character
          .toUpperCase()
    );

}


function formatLength(
  value
) {

  if (value === "short") {

    return "YouTube Short";

  }


  if (value === "20") {

    return "20+ min";

  }


  return `${value} min`;

}


function formatProjectDate(
  value
) {

  const date =
    new Date(value);


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

function escapeHTML(
  value
) {

  const element =
    document.createElement(
      "div"
    );


  element.textContent =
    String(
      value ?? ""
    );


  return element.innerHTML;

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(
  message
) {

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


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}
