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

  setupScriptWorkspace();

  setupVisualWorkspace();

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

  const sourceForm =
    document.getElementById(
      "sourceForm"
    );


  sourceForm?.addEventListener(
    "submit",
    handleAddSource
  );

  document
    .getElementById("researchFindingForm")
    ?.addEventListener("submit", handleAddResearchFinding);

  document
    .getElementById("claimForm")
    ?.addEventListener("submit", handleAddClaim);

  document
    .getElementById("angleForm")
    ?.addEventListener("submit", handleAddAngle);

}

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

  populateScriptProjectSelect(researchProjectsCache);

}

function populateScriptProjectSelect(projects) {
  ["scriptProjectSelect", "visualProjectSelect", "editProjectSelect"].forEach(selectId => {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Choose a project...</option>';
    projects.forEach(project => select.add(new Option(project.title || project.projectId, project.projectId)));
  });
}

function setupScriptWorkspace() {
  const projectSelect = document.getElementById("scriptProjectSelect");
  projectSelect?.addEventListener("change", loadScriptSourceOptions);
  document.getElementById("scriptSectionForm")?.addEventListener("submit", handleAddScriptSection);
}

function setupVisualWorkspace() {
  document.getElementById("visualForm")?.addEventListener("submit", handleAddVisual);
  document.getElementById("editBlueprintForm")?.addEventListener("submit", handleAddEditBlueprint);
}

async function submitProductionForm(form, buttonLabel, task) {
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = buttonLabel;
  try { await task(); form.reset(); showToast("Saved successfully."); }
  catch (error) { console.error("Production workspace error:", error); handleApiError(error); }
  finally { submitButton.disabled = false; submitButton.textContent = originalText; }
}

async function handleAddVisual(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const projectId = String(document.getElementById("visualProjectSelect")?.value || "").trim();
  const description = String(document.getElementById("visualDescription")?.value || "").trim();
  if (!CreatorAPI.hasAdminToken()) { showToast("Connect your Admin Session first."); openAdminModal(); return; }
  if (!projectId || !description) { showToast("Choose a project and describe the visual."); return; }
  await submitProductionForm(form, "Saving Visual...", () => CreatorAPI.addVisual({
    projectId, description,
    scriptId: String(document.getElementById("visualScriptId")?.value || "").trim(),
    visualType: String(document.getElementById("visualType")?.value || "").trim(),
    estimatedDuration: String(document.getElementById("visualDuration")?.value || "").trim(),
    searchQuery: String(document.getElementById("visualSearchQuery")?.value || "").trim(),
    onScreenText: String(document.getElementById("visualOnScreenText")?.value || "").trim()
  }));
}

async function handleAddEditBlueprint(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const projectId = String(document.getElementById("editProjectSelect")?.value || "").trim();
  const editingNotes = String(document.getElementById("editNotes")?.value || "").trim();
  if (!CreatorAPI.hasAdminToken()) { showToast("Connect your Admin Session first."); openAdminModal(); return; }
  if (!projectId || !editingNotes) { showToast("Choose a project and enter editing notes."); return; }
  await submitProductionForm(form, "Saving Edit Beat...", () => CreatorAPI.addEditBlueprint({
    projectId, editingNotes,
    scriptId: String(document.getElementById("editScriptId")?.value || "").trim(),
    startTime: String(document.getElementById("editStartTime")?.value || "").trim(),
    endTime: String(document.getElementById("editEndTime")?.value || "").trim(),
    aRoll: String(document.getElementById("editARoll")?.value || "").trim(),
    bRoll: String(document.getElementById("editBRoll")?.value || "").trim(),
    graphics: String(document.getElementById("editGraphics")?.value || "").trim(),
    soundDesign: String(document.getElementById("editSoundDesign")?.value || "").trim()
  }));
}

async function loadScriptSourceOptions(event) {
  const projectId = String(event.target.value || "").trim();
  populateSourceSelect("scriptSourceIds", []);
  if (!projectId || !CreatorAPI.hasAdminToken()) return;
  try {
    const response = await CreatorAPI.getProjectResearch(projectId);
    populateSourceSelect("scriptSourceIds", response.sources || []);
  } catch (error) {
    console.error("Load script sources error:", error);
    handleApiError(error);
  }
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

    renderResearchLists(sources, research);

  }
  catch (error) {

    console.error(
      "Load project research error:",
      error
    );


    handleApiError(error);

  }

}

function renderResearchLists(sources, findings) {
  populateFindingSourceSelect(sources);
  renderSourceList(sources);
  renderFindingList(findings, sources);
}

function populateFindingSourceSelect(sources) {
  populateSourceSelect("researchSourceIds", sources);
  populateSourceSelect("claimSourceIds", sources);
}

function populateSourceSelect(selectId, sources) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const selectedIds = new Set(
    Array.from(select.selectedOptions).map(option => option.value)
  );

  select.replaceChildren();

  if (!sources.length) {
    const option = new Option("No sources available yet", "");
    option.disabled = true;
    select.add(option);
    return;
  }

  sources.forEach(source => {
    const label = source.title || source.url || source.sourceId;
    const option = new Option(label, source.sourceId);
    option.selected = selectedIds.has(source.sourceId);
    select.add(option);
  });
}

function renderSourceList(sources) {
  const list = document.getElementById("sourcesList");
  if (!list) return;
  if (!sources.length) {
    list.innerHTML = '<p class="muted-copy">No sources have been saved for this project.</p>';
    return;
  }
  list.innerHTML = sources.map(source => {
    const title = source.title || source.url || "Untitled source";
    const meta = [source.publisher, formatLabel(source.sourceType), formatLabel(source.sourceTier)]
      .filter(Boolean).map(escapeHTML).join(" · ");
    const url = safeHttpUrl(source.url);
    const linkedTitle = url
      ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(title)}</a>`
      : escapeHTML(title);
    return `<article class="research-item"><div><h4>${linkedTitle}</h4><p>${meta || "Source details not classified"}</p></div><span class="status-pill">${escapeHTML(formatLabel(source.reliabilityLabel) || "Unreviewed")}</span></article>`;
  }).join("");
}

function renderFindingList(findings, sources = []) {
  const list = document.getElementById("findingsList");
  if (!list) return;
  if (!findings.length) {
    list.innerHTML = '<p class="muted-copy">No findings have been saved for this project.</p>';
    return;
  }
  const sourceLabels = new Map(
    sources.map(source => [source.sourceId, source.title || source.url || source.sourceId])
  );
  list.innerHTML = findings.map(finding => {
    const claim = finding.finding || finding.claim || finding.text || "Untitled finding";
    const meta = [finding.section, formatLabel(finding.importance)]
      .filter(Boolean).map(escapeHTML).join(" · ");
    const state = formatLabel(finding.verificationStatus || "unverified");
    const linkedSources = (finding.sourceIds || [])
      .map(sourceId => sourceLabels.get(sourceId) || sourceId)
      .filter(Boolean)
      .map(escapeHTML)
      .join(" · ");
    const evidence = linkedSources
      ? `<p class="evidence-links">Evidence: ${linkedSources}</p>`
      : '<p class="evidence-links">Evidence: no source linked</p>';
    return `<article class="research-item finding-item"><div><p class="finding-copy">${escapeHTML(claim)}</p><p>${meta || "No section or priority set"}</p>${evidence}</div><span class="status-pill status-${escapeHTML(String(finding.verificationStatus || "unverified"))}">${escapeHTML(state)}</span></article>`;
  }).join("");
}

function safeHttpUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch (_) {
    return "";
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

async function handleAddSource(event) {

  event.preventDefault();

  const form =
    event.currentTarget;

  if (!CreatorAPI.hasAdminToken()) {

    showToast(
      "Connect your Admin Session first."
    );

    openAdminModal();

    return;

  }


  const projectSelect =
    document.getElementById(
      "researchProjectSelect"
    );


  const projectId =
    String(
      projectSelect?.value || ""
    ).trim();


  if (!projectId) {

    showToast(
      "Select a project first."
    );

    return;

  }


  const url =
    document
      .getElementById(
        "sourceUrl"
      )
      .value
      .trim();


  if (!url) {

    showToast(
      "Enter a source URL."
    );

    return;

  }


  const submitButton =
    form
      .querySelector(
        'button[type="submit"]'
      );


  const originalText =
    submitButton.textContent;


  submitButton.disabled =
    true;

  submitButton.textContent =
    "Adding Source...";


  try {

    await CreatorAPI.addSource({

      projectId,

      url,

      title:
        document
          .getElementById(
            "sourceTitle"
          )
          .value
          .trim(),

      publisher:
        document
          .getElementById(
            "sourcePublisher"
          )
          .value
          .trim(),

      author:
        document
          .getElementById(
            "sourceAuthor"
          )
          .value
          .trim(),

      sourceType:
        document
          .getElementById(
            "sourceType"
          )
          .value,

      sourceTier:
        document
          .getElementById(
            "sourceTier"
          )
          .value,

      reliabilityLabel:
        document
          .getElementById(
            "sourceReliability"
          )
          .value,

      isPrimarySource:
        document
          .getElementById(
            "sourcePrimary"
          )
          .value === "true"

    });


    form.reset();


    await loadProjectResearch(
      projectId
    );


    showToast(
      "Source added successfully."
    );

  }
  catch (error) {

    console.error(
      "Add source error:",
      error
    );


    handleApiError(error);

  }
  finally {

    submitButton.disabled =
      false;

    submitButton.textContent =
      originalText;

  }

}

async function handleAddResearchFinding(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const projectId = String(document.getElementById("researchProjectSelect")?.value || "").trim();
  if (!CreatorAPI.hasAdminToken()) {
    showToast("Connect your Admin Session first.");
    openAdminModal();
    return;
  }
  if (!projectId) {
    showToast("Select a project first.");
    return;
  }
  const finding = String(document.getElementById("researchFinding")?.value || "").trim();
  if (!finding) {
    showToast("Enter a research finding.");
    return;
  }
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Adding Finding...";
  try {
    await CreatorAPI.addResearchFinding({
      projectId,
      finding,
      section: String(document.getElementById("researchSection")?.value || "").trim(),
      importance: document.getElementById("researchImportance")?.value || "medium",
      verificationStatus: document.getElementById("researchVerificationStatus")?.value || "unverified",
      sourceIds: Array.from(
        document.getElementById("researchSourceIds")?.selectedOptions || []
      ).map(option => option.value).filter(Boolean)
    });
    form.reset();
    await loadProjectResearch(projectId);
    showToast("Finding added successfully.");
  } catch (error) {
    console.error("Add research finding error:", error);
    handleApiError(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

async function handleAddClaim(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const projectId = String(document.getElementById("researchProjectSelect")?.value || "").trim();
  const claimText = String(document.getElementById("claimText")?.value || "").trim();
  if (!CreatorAPI.hasAdminToken()) {
    showToast("Connect your Admin Session first.");
    openAdminModal();
    return;
  }
  if (!projectId || !claimText) {
    showToast("Select a project and enter a claim first.");
    return;
  }
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Saving Claim...";
  try {
    await CreatorAPI.addClaim({
      projectId,
      claimText,
      claimType: String(document.getElementById("claimType")?.value || "").trim(),
      verificationStatus: document.getElementById("claimVerificationStatus")?.value || "unverified",
      supportLevel: document.getElementById("claimSupportLevel")?.value || "none",
      supportingSourceIds: Array.from(document.getElementById("claimSourceIds")?.selectedOptions || []).map(option => option.value).filter(Boolean),
      evidenceSummary: String(document.getElementById("claimEvidenceSummary")?.value || "").trim(),
      contradictionGroupId: String(document.getElementById("contradictionGroupId")?.value || "").trim()
    });
    form.reset();
    showToast("Claim saved successfully.");
  } catch (error) {
    console.error("Add claim error:", error);
    handleApiError(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

async function handleAddAngle(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const projectId = String(document.getElementById("researchProjectSelect")?.value || "").trim();
  const angleTitle = String(document.getElementById("angleTitle")?.value || "").trim();
  if (!CreatorAPI.hasAdminToken()) {
    showToast("Connect your Admin Session first.");
    openAdminModal();
    return;
  }
  if (!projectId || !angleTitle) {
    showToast("Select a project and enter an angle title first.");
    return;
  }
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Saving Angle...";
  try {
    await CreatorAPI.addAngle({
      projectId,
      angleTitle,
      centralQuestion: String(document.getElementById("angleQuestion")?.value || "").trim(),
      audiencePromise: String(document.getElementById("anglePromise")?.value || "").trim(),
      rationale: String(document.getElementById("angleRationale")?.value || "").trim(),
      storyPotential: document.getElementById("angleStoryPotential")?.value || "medium",
      evidenceStrength: document.getElementById("angleEvidenceStrength")?.value || "moderate"
    });
    form.reset();
    showToast("Story angle saved successfully.");
  } catch (error) {
    console.error("Add angle error:", error);
    handleApiError(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

async function handleAddScriptSection(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const projectId = String(document.getElementById("scriptProjectSelect")?.value || "").trim();
  const sectionName = String(document.getElementById("scriptSectionName")?.value || "").trim();
  const narration = String(document.getElementById("scriptNarration")?.value || "").trim();
  if (!CreatorAPI.hasAdminToken()) {
    showToast("Connect your Admin Session first.");
    openAdminModal();
    return;
  }
  if (!projectId || !sectionName || !narration) {
    showToast("Choose a project and complete the section name and narration.");
    return;
  }
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Saving Section...";
  try {
    await CreatorAPI.addScriptSection({
      projectId,
      sectionOrder: Number(document.getElementById("scriptSectionOrder")?.value || 1),
      sectionName,
      startTime: String(document.getElementById("scriptStartTime")?.value || "").trim(),
      endTime: String(document.getElementById("scriptEndTime")?.value || "").trim(),
      narration,
      sourceIds: Array.from(document.getElementById("scriptSourceIds")?.selectedOptions || []).map(option => option.value).filter(Boolean),
      visualNotes: String(document.getElementById("scriptVisualNotes")?.value || "").trim(),
      editNotes: String(document.getElementById("scriptEditNotes")?.value || "").trim(),
      status: document.getElementById("scriptStatus")?.value || "draft"
    });
    form.reset();
    document.getElementById("scriptSectionOrder").value = "1";
    populateSourceSelect("scriptSourceIds", []);
    showToast("Script section saved successfully.");
  } catch (error) {
    console.error("Add script section error:", error);
    handleApiError(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
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
  form.querySelector(
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
