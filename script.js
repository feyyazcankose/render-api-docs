/**
 * API Documentation Interactive Script
 * Handles dynamic content loading, form generation, and user interactions
 */

// Global variables
let swaggerData = null;
let currentEndpoint = null;
let allEndpoints = []; // Array to store all endpoints for navigation
let currentEndpointIndex = -1; // Current position in the endpoints array

/**
 * Initialize the application
 */
$(document).ready(function () {
  initializeTheme();
  loadSwaggerData();
});

/**
 * Initialize theme system
 */
function initializeTheme() {
  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem("api-docs-theme") || "dark";
  setTheme(savedTheme);

  // Add event listener for theme toggle
  $("#theme-toggle").on("click", toggleTheme);
}

/**
 * Set the current theme
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    $("#theme-icon").text("light_mode");
    switchHighlightTheme("light");
  } else {
    document.documentElement.removeAttribute("data-theme");
    $("#theme-icon").text("dark_mode");
    switchHighlightTheme("dark");
  }

  // Save theme preference
  localStorage.setItem("api-docs-theme", theme);
}

/**
 * Switch highlight.js theme dynamically
 * @param {string} theme - 'light' or 'dark'
 */
function switchHighlightTheme(theme) {
  // Remove existing highlight.js theme
  const existingLink = document.querySelector('link[href*="highlight.js"]');
  if (existingLink) {
    existingLink.remove();
  }

  setTimeout(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }, 100);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
}

/**
 * Load swagger.json data and initialize the application
 */
async function loadSwaggerData() {
  try {
    const response = await fetch("./swagger.json");
    swaggerData = await response.json();
    generateNavigation();

    // Check URL hash for specific endpoint
    const hash = window.location.hash.substring(1);
    if (hash) {
      loadEndpointFromHash(hash);
    } else {
      // Show overview page by default
      navigateToOverview();
    }
  } catch (error) {
    console.error("Error loading swagger.json:", error);
  }
}

/**
 * Load endpoint from URL hash
 * @param {string} hash - URL hash containing endpoint info
 */
function loadEndpointFromHash(hash) {
  // Parse hash format: GET-api-dashboard-address-paginate-userId
  const parts = hash.split("-");
  if (parts.length < 2) return;

  const method = parts[0].toLowerCase();
  const pathParts = parts.slice(1);

  // Try to find matching endpoint
  Object.keys(swaggerData.paths).forEach((path) => {
    const pathHash = path.replace(/[^a-zA-Z0-9]/g, "-");
    const expectedHash = pathParts.join("-");

    if (pathHash === expectedHash && swaggerData.paths[path][method]) {
      loadEndpoint(path, method);

      // Set active state on the correct menu item
      $(`.endpoint-link[data-path="${path}"][data-method="${method}"]`)
        .addClass("nav-link active")
        .closest(".accordion-content")
        .show()
        .prev(".accordion-toggle")
        .find(".material-icons")
        .text("expand_more");
    }
  });
}

/**
 * Generate navigation menu from swagger paths
 */
function generateNavigation() {
  if (!swaggerData || !swaggerData.paths) return;

  const nav = $("aside nav");
  nav.empty();

  // Clear and populate allEndpoints array for navigation
  allEndpoints = [];

  // Group endpoints by tag or path prefix
  const groups = {};

  Object.keys(swaggerData.paths).forEach((path) => {
    Object.keys(swaggerData.paths[path]).forEach((method) => {
      const endpoint = swaggerData.paths[path][method];
      const tags = endpoint.tags || ["Default"];
      const tag = tags[0];

      const endpointData = {
        path: path,
        method: method.toUpperCase(),
        summary: endpoint.summary || endpoint.operationId || path,
        operationId: endpoint.operationId,
      };

      // Add to allEndpoints array for navigation
      allEndpoints.push(endpointData);

      if (!groups[tag]) {
        groups[tag] = [];
      }

      groups[tag].push(endpointData);
    });
  });

  // Generate navigation HTML with accordion structure
  Object.keys(groups).forEach((groupName) => {
    const groupHtml = `
      <div>
        <ul class="space-y-2 text-sm">
          <li>
            <a class="flex items-center px-3 py-1 rounded accordion-toggle cursor-pointer sidebar-item !justify-start text-gray-400-custom">
              <span>${groupName}</span>
              <span class="material-icons text-sm transform transition-transform ml-5">chevron_right</span>
            </a>
            <ul class="ml-4 mt-2 space-y-2 accordion-content" style="display: none;">
              ${groups[groupName]
                .map(
                  (endpoint) => `
                <li class="group">
                  <a class="flex items-center justify-between px-3 py-1 rounded endpoint-link cursor-pointer sidebar-item gap-2" 
                     data-path="${endpoint.path}" 
                     data-method="${endpoint.method.toLowerCase()}">
                    <div class="flex items-center flex-1 min-w-0 gap-2">
                      <span class="method-pill rounded-lg font-bold px-1.5 py-0.5 rounded-lg text-[0.55rem] text-sm leading-5 bg-${getMethodColor(
                        endpoint.method
                      )}-400/20 dark:bg-${getMethodColor(
                    endpoint.method
                  )}-400/20 text-${getMethodColor(
                    endpoint.method
                  )}-700 dark:text-${getMethodColor(endpoint.method)}-400">
                        ${getMethodDisplayName(endpoint.method)}
                      </span>
                      <div class="tooltip w-40">
                        <span class="truncate block">${endpoint.summary}</span>
                        <span class="tooltiptext">${endpoint.summary}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span class="material-icons text-gray-400-custom cursor-pointer copy-icon text-sm" 
                            onclick="event.stopPropagation(); copyToClipboard('${endpoint.summary.replace(
                              /'/g,
                              "\\'"
                            )}')" 
                            title="Copy endpoint name">text_fields</span>
                      <span class="material-icons text-gray-400-custom cursor-pointer copy-icon text-sm" 
                            onclick="event.stopPropagation(); copyToClipboard('${getBaseUrl()}${
                    endpoint.path
                  }')" 
                            title="Copy endpoint URL">content_copy</span>
                    </div>
                  </a>
                </li>
              `
                )
                .join("")}
            </ul>
          </li>
        </ul>
      </div>
    `;
    nav.append(groupHtml);
  });

  // Add click handlers for endpoints
  $(".endpoint-link").on("click", function (e) {
    e.preventDefault();
    $(".endpoint-link").removeClass("nav-link active");
    $(this).addClass("nav-link active");

    const path = $(this).data("path");
    const method = $(this).data("method");

    // Update URL hash with endpoint info
    const endpointHash = `${method.toUpperCase()}-${path.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    )}`;
    window.history.pushState(null, "", `#${endpointHash}`);

    loadEndpoint(path, method);
  });

  // Add accordion toggle handlers for sidebar navigation
  $("aside:first-child")
    .off("click", ".accordion-toggle")
    .on("click", ".accordion-toggle", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $this = $(this);
      var content = $this.next(".accordion-content");
      var icon = $this.find(".material-icons");

      content.slideToggle(400, function () {
        if (content.is(":visible")) {
          icon.text("expand_more");
        } else {
          icon.text("chevron_right");
        }
      });
    });
}

/**
 * Get color class for HTTP methods
 * @param {string} method - HTTP method
 * @returns {string} - Color class name
 */
function getMethodColor(method) {
  const colors = {
    GET: "green",
    POST: "blue",
    PUT: "yellow",
    DELETE: "red",
    PATCH: "purple",
  };
  return colors[method] || "gray";
}

/**
 * Get shortened method name for display
 * @param {string} method - HTTP method
 * @returns {string} - Display name
 */
function getMethodDisplayName(method) {
  const methodNames = {
    DELETE: "DEL",
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
  };
  return methodNames[method.toUpperCase()] || method.toUpperCase();
}

/**
 * Load and display endpoint details
 * @param {string} path - API endpoint path
 * @param {string} method - HTTP method
 */
function loadEndpoint(path, method) {
  if (
    !swaggerData ||
    !swaggerData.paths[path] ||
    !swaggerData.paths[path][method]
  )
    return;

  currentEndpoint = {
    path: path,
    method: method,
    data: swaggerData.paths[path][method],
  };

  // Update current endpoint index for navigation
  currentEndpointIndex = allEndpoints.findIndex(
    (endpoint) =>
      endpoint.path === path && endpoint.method === method.toUpperCase()
  );

  renderEndpointDetails();
  renderCodeExample();
}

/**
 * Render endpoint details in main content area
 */
function renderEndpointDetails() {
  const endpoint = currentEndpoint.data;
  const path = currentEndpoint.path;
  const method = currentEndpoint.method.toUpperCase();

  const mainContent = $("main");

  // Generate parameters HTML
  let parametersHtml = "";
  if (endpoint.parameters && endpoint.parameters.length > 0) {
    parametersHtml = `
      <section class="mb-8">
        <h2 class="section-title">Parameters</h2>
        <table class="param-table">
          <tbody>
            ${endpoint.parameters
              .map(
                (param) => `
              <tr>
                <td>
                  <div class="param-name">${param.name}</div>
                </td>
                <td>
                  <div class="param-type">${param.schema?.type || "string"}${
                  param.in === "query" ? "" : ` (${param.in})`
                }</div>
                </td>
                <td>
                  ${
                    param.required
                      ? '<span class="required">required</span>'
                      : ""
                  }
                </td>
              </tr>
              <tr>
                  ${
                    param.description?.length > 0
                      ? `
                      <td class="text-gray-400-custom pt-2 pb-4" colspan="4">
                        ${param.description}
                      </td>
                    `
                      : ""
                  }
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </section>
    `;
  }

  // Generate request body HTML
  let requestBodyHtml = "";
  if (endpoint.requestBody) {
    const content = endpoint.requestBody.content;
    const jsonContent = content["application/json"];
    if (jsonContent && jsonContent.schema) {
      requestBodyHtml = `
        <section class="mb-8">
          <h2 class="text-xl font-semibold section-title my-4 mt-10">Request Body</h2>
          <div class="bg-gray-800-custom rounded-lg p-4">
            <div class="flex items-center justify-between text-sm mb-2">
              <div class="flex items-center gap-2">
                <span class="font-mono text-gray-300-custom">application/json</span>
                ${
                  endpoint.requestBody.required
                    ? '<span class="text-red-400 text-xs">required</span>'
                    : ""
                }
              </div>
              <span class="material-icons text-gray-400-custom cursor-pointer copy-icon" 
                    onclick="copyToClipboard('${JSON.stringify(
                      generateSchemaExample(jsonContent.schema),
                      null,
                      2
                    )
                      .replace(/'/g, "\\'")
                      .replace(/\n/g, "\\n")}')" 
                    title="Copy request body example">content_copy</span>
            </div>
            
            <!-- Schema Tree View -->
            <div class="bg-gray-900-custom rounded-lg overflow-x-auto mb-4">
              <h4 class="text-sm font-semibold text-gray-300-custom mb-3 mt-5">Request Body Schema</h4>
              <div class="schema-tree-view text-sm ">
                ${renderSchemaTreeView(jsonContent.schema, 0, "request_body")}
              </div>
            </div>
            
            <!-- Example JSON -->
            <div class="mt-4">
              <h4 class="text-sm font-semibold text-gray-300-custom mb-2">Example Request Body</h4>
              <pre class="bg-gray-900-custom text-gray-300-custom  rounded-lg text-sm overflow-x-auto"><code class="">${
                hljs.highlight(
                  JSON.stringify(
                    generateSchemaExample(jsonContent.schema),
                    null,
                    2
                  ),
                  { language: "json" }
                ).value
              }</code></pre>
            </div>
          </div>
        </section>
      `;
    }
  }

  // Generate responses HTML
  let responsesHtml = "";
  if (endpoint.responses) {
    responsesHtml = `
      <section class="mb-8">
        <h2 class="text-xl font-semibold section-title mb-4">Responses</h2>
        ${Object.keys(endpoint.responses)
          .map((statusCode) => {
            const response = endpoint.responses[statusCode];
            const content =
              response.content && response.content["application/json"];
            return `
            <div class="border border-gray-700-custom rounded-lg mb-4">
              <div class="p-4 border-b border-gray-700-custom flex justify-between items-center cursor-pointer accordion-toggle">
                <div class="flex items-center gap-3">
                  <span class="text-${
                    statusCode.startsWith("2") ? "green" : "red"
                  }-400">${statusCode}</span>
                  <span>application/json</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-icons text-gray-400-custom cursor-pointer copy-icon" 
                        onclick="event.stopPropagation(); copyToClipboard('${
                          content
                            ? JSON.stringify(
                                generateSchemaExample(content.schema),
                                null,
                                2
                              )
                                .replace(/'/g, "\\'")
                                .replace(/\n/g, "\\n")
                            : "No content"
                        }')" 
                        title="Copy response example">content_copy</span>
                  <span class="material-icons text-sm transform transition-transform">expand_more</span>
                </div>
              </div>
              <div class="p-4 space-y-4 accordion-content" style="display: none">
                <p class="text-sm text-gray-400-custom">${
                  response.description || ""
                }</p>
                ${
                  content && content.schema
                    ? `<div class="bg-gray-900-custom rounded-lg p-4 overflow-x-auto">
                        <h4 class="text-sm font-semibold text-gray-300-custom mb-3">Response Schema</h4>
                        <div class="schema-tree-view text-sm">
                          ${renderSchemaTreeView(
                            content.schema,
                            0,
                            `response_${statusCode}`
                          )}
                        </div>
                       </div>
                       <div class="mt-4">
                        <h4 class="text-sm font-semibold text-gray-300-custom mb-2">Example Response</h4>
                        <pre class="bg-gray-900-custom text-sm rounded-lg p-4 overflow-x-auto"><code class="">${
                          hljs.highlight(
                            JSON.stringify(
                              generateSchemaExample(content.schema),
                              null,
                              2
                            ),
                            { language: "json" }
                          ).value
                        }</code></pre>
                       </div>`
                    : content
                    ? `<pre class="bg-gray-900-custom text-sm rounded-lg p-4 overflow-x-auto"><code class="">${
                        hljs.highlight(
                          JSON.stringify(
                            generateSchemaExample(content.schema || {}),
                            null,
                            2
                          ),
                          { language: "json" }
                        ).value
                      }</code></pre>`
                    : ""
                }
              </div>
            </div>
          `;
          })
          .join("")}
      </section>
    `;
  }

  const html = `
    <header class="mb-8">
      <p class="text-sm text-gray-400-custom mb-1">${endpoint.tags[0]}</p>
      <div class="flex items-center justify-between mb-2 bg-[--bg-secondary]">
        <h1 class="text-3xl font-bold text-gray-300-custom">
          ${endpoint.summary || endpoint.operationId || path}
        </h1>
        <span class="material-icons text-gray-400-custom cursor-pointer copy-icon" 
              onclick="copyToClipboard('${(
                endpoint.summary ||
                endpoint.operationId ||
                path
              ).replace(/'/g, "\\'")}')" 
              title="Copy endpoint name">content_copy</span>
      </div>
      <p class="text-gray-400-custom">
        ${endpoint.description || ""}
      </p>
    </header>
    <div class="flex w-full flex-col bg-background-light dark:bg-background-dark border-standard rounded-2xl p-1.5 mb-4">
      <div class="flex items-center space-x-1.5">
      <div class="relative flex-1 flex gap-2 min-w-0 rounded-xl items-center cursor-pointer p-1.5 border-standard">
         <div class="method-pill rounded-lg font-bold px-1.5 py-0.5 text-sm leading-5 bg-${getMethodColor(
           method
         )}-400/20 dark:bg-${getMethodColor(
    method
  )}-400/20 text-${getMethodColor(method)}-700 dark:text-${getMethodColor(
    method
  )}-400"> ${getMethodDisplayName(method)}</div>
         <div class="flex items-center space-x-2 overflow-x-auto flex-1 no-scrollbar">
            <div class="group flex items-center flex-1 gap-0.5 font-mono">
               <div class="absolute right-0 p-2 bg-background-light dark:bg-background-dark rounded-lg hidden group-hover:block">
                  <svg class="w-4 h-4 bg-gray-400 dark:bg-white/30" style="mask-image: url(&quot;https://d3gk2c5xim1je2.cloudfront.net/v6.6.0/regular/clone.svg&quot;); mask-repeat: no-repeat; mask-position: center center;"></svg>
               </div>
               ${path
                 .split("/")
                 .map((part, index) => {
                   return `<div class="text-sm font-medium text-[var(--text-primary)]  min-w-max">${part}</div>`;
                 })
                 .join("/")}
            </div>
         </div>
      </div>
      <button id="try-it-btn" class="tryit-button flex items-center justify-center px-3 h-9 text-white font-medium rounded-xl mouse-pointer disabled:opacity-70 hover:opacity-80 gap-1.5 bg-${getMethodColor(
        method
      )}-700" data-testid="try-it-button">
         <span>Try it</span>
         <svg class="w-3 h-3 bg-white" style="mask-image: url(&quot;https://d3gk2c5xim1je2.cloudfront.net/v6.6.0/solid/play.svg&quot;); mask-repeat: no-repeat; mask-position: center center;"></svg>
      </button>
      </div>
    </div>

    <section class="mb-8 minimal-form-container" id="try-it-section">
      <h2 class="text-lg font-medium text-gray-300-custom mb-6">Try it out</h2>
      <div class="space-y-6" id="try-it-form">
        <!-- Dynamic form will be generated here -->
      </div>
      <div class="mt-8 hidden" id="response-container">
        <h3 class="text-base font-medium text-gray-300-custom mb-3">Response</h3>
        <pre class="bg-gray-900-custom text-sm rounded-lg p-4 overflow-x-auto"><code class="" id="response-output"></code></pre>
      </div>
    </section>
    ${getAuthorizationHtml()}
    ${parametersHtml}
    ${requestBodyHtml}
    ${responsesHtml}
    
    <!-- Bottom Navigation -->
    <div class="flex justify-between items-center mt-12 pt-8 border-t border-gray-700-custom">
      <button 
        class="nav-button nav-button-large ${
          currentEndpointIndex <= 0 ? "opacity-50 cursor-not-allowed" : ""
        }"
        onclick="navigateToPreviousEndpoint()"
        ${currentEndpointIndex <= 0 ? "disabled" : ""}
        title="Previous endpoint"
      >
        <span class="material-icons text-sm">chevron_left</span>
        <div class="flex flex-col items-start">
          <span>Previous Endpoint</span>
          ${
            currentEndpointIndex > 0
              ? `
            <div class="nav-button-preview">${
              allEndpoints[currentEndpointIndex - 1].summary
            }</div>
          `
              : ""
          }
        </div>
      </button>
      
      <div class="nav-counter">
        ${currentEndpointIndex + 1} of ${allEndpoints.length} endpoints
      </div>
      
      <button 
        class="nav-button nav-button-large ${
          currentEndpointIndex >= allEndpoints.length - 1
            ? "opacity-50 cursor-not-allowed"
            : ""
        }"
        onclick="navigateToNextEndpoint()"
        ${currentEndpointIndex >= allEndpoints.length - 1 ? "disabled" : ""}
        title="Next endpoint"
      >
        <div class="flex flex-col items-end">
          <span>Next Endpoint</span>
          ${
            currentEndpointIndex < allEndpoints.length - 1
              ? `
            <div class="nav-button-preview">${
              allEndpoints[currentEndpointIndex + 1].summary
            }</div>
          `
              : ""
          }
        </div>
        <span class="material-icons text-sm">chevron_right</span>
      </button>
    </div>
  `;

  mainContent.html(html);

  generateTryItForm();

  // Re-attach event handlers
  $("#try-it-btn")
    .off("click")
    .on("click", function () {
      const icon = $(this).find(".material-icons");
      const section = $("#try-it-section");

      section.slideToggle(300, function () {
        if (section.is(":visible")) {
          icon.text("expand_less");
        } else {
          icon.text("expand_more");
        }
      });
    });

  // Main content accordion handlers (only for response sections)
  $("main")
    .off("click", ".accordion-toggle")
    .on("click", ".accordion-toggle", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $this = $(this);
      var content = $this.next(".accordion-content");
      var icon = $this.find(".material-icons");

      content.slideToggle(400, function () {
        if (content.is(":visible")) {
          icon.text("expand_less");
        } else {
          icon.text("expand_more");
        }
      });
    });
}

/**
 * Generate authorization HTML section
 * @returns {string} - Authorization HTML
 */
function getAuthorizationHtml() {
  if (
    !swaggerData.components ||
    !swaggerData.components.securitySchemes ||
    !currentEndpoint
  )
    return "";

  // Get the security requirements for the current endpoint
  const endpointSecurity = currentEndpoint.data.security;

  // If endpoint has no security requirements, don't show authorization section
  if (!endpointSecurity || endpointSecurity.length === 0) {
    return "";
  }

  const schemes = swaggerData.components.securitySchemes;
  let authHtml = "";

  // Only show authorization methods that this endpoint actually uses
  endpointSecurity.forEach((securityRequirement) => {
    Object.keys(securityRequirement).forEach((schemeName) => {
      const scheme = schemes[schemeName];
      if (!scheme) return;

      if (scheme.type === "http" && scheme.scheme === "bearer") {
        authHtml += `
          <section class="my-16">
            <h2 class="section-title">Authorization</h2>
            <p class="text-gray-400-custom pt-2 pb-4">
            <div class="flex items-center flex-wrap gap-2">
              <div class="absolute -top-1.5">
                  <a href="#authorization-authorization" class="-ml-10 flex items-center opacity-0 border-0 group-hover/param-head:opacity-100 py-2 [.expandable-content_&amp;]:-ml-[2.1rem]" aria-label="Navigate to header">
                    &ZeroWidthSpace;
                    <div class="w-6 h-6 rounded-md flex items-center justify-center shadow-sm text-gray-400 dark:text-white/50 dark:bg-background-dark dark:brightness-[1.35] dark:ring-1 dark:hover:brightness-150 bg-white ring-1 ring-gray-400/30 dark:ring-gray-700/25 hover:ring-gray-400/60 dark:hover:ring-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="gray" height="12px" viewBox="0 0 576 512">
                          <path d="M0 256C0 167.6 71.6 96 160 96h72c13.3 0 24 10.7 24 24s-10.7 24-24 24H160C98.1 144 48 194.1 48 256s50.1 112 112 112h72c13.3 0 24 10.7 24 24s-10.7 24-24 24H160C71.6 416 0 344.4 0 256zm576 0c0 88.4-71.6 160-160 160H344c-13.3 0-24-10.7-24-24s10.7-24 24-24h72c61.9 0 112-50.1 112-112s-50.1-112-112-112H344c-13.3 0-24-10.7-24-24s10.7-24 24-24h72c88.4 0 160 71.6 160 160zM184 232H392c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z"></path>
                        </svg>
                    </div>
                  </a>
              </div>
              <div class="font-semibold text-primary dark:text-primary-light cursor-pointer overflow-wrap-anywhere" data-component-part="field-name">Authorization</div>
              <div class="inline items-center gap-2 text-xs font-medium [&amp;_div]:inline [&amp;_div]:mr-2 [&amp;_div]:leading-5" data-component-part="field-meta">
                  <div class="flex items-center px-2 py-0.5 rounded-md bg-gray-100/50 dark:bg-white/5 text-gray-600 dark:text-gray-200 font-medium break-all" data-component-part="field-info-pill"><span>string</span></div>
                  <div class="flex items-center px-2 py-0.5 rounded-md bg-gray-100/50 dark:bg-white/5 text-gray-600 dark:text-gray-200 font-medium break-all" data-component-part="field-info-pill"><span>header</span></div>
                  <div class="px-2 py-0.5 rounded-md bg-red-100/50 dark:bg-red-400/10 text-red-600 dark:text-red-300 font-medium whitespace-nowrap" data-component-part="field-required-pill">required</div>
              </div>
            </div>
          

            <p class="whitespace-pre-line mt-5">${`Bearer authentication header of the form <code ><span>Bearer token</span></code>, where <code ><span>token</span></code> is your auth token.`}</p>
          </section>
        `;
      } else if (scheme.type === "apiKey") {
        authHtml += `
          <section class="mb-8">
            <h2 class="section-title">Authorization</h2>
            <table class="param-table">
              <tbody>
                <tr>
                  <td>
                    <div class="param-name">${scheme.name}</div>
                  </td>
                  <td>
                    <div class="param-type">string</div>
                  </td>
                  <td>
                    <div class="param-type">${scheme.in}</div>
                  </td>
                  <td>
                    <span class="required">required</span>
                  </td>
                </tr>
                ${
                  scheme.description.length > 0
                    ? `
                    <tr>
                      <td class="text-gray-400-custom pt-2 pb-4" colspan="4">
                        ${scheme.description}
                      </td>
                    </tr>
                  `
                    : ""
                }
              </tbody>
            </table>
          </section>
        `;
      }
    });
  });

  return authHtml;
}

/**
 * Generate Try It form based on endpoint parameters
 */
function generateTryItForm() {
  const endpoint = currentEndpoint.data;
  console.log("Current endpoint data:", endpoint);
  let formHtml = "";

  // Add authorization field only if endpoint requires it
  const endpointSecurity = endpoint.security;
  if (
    endpointSecurity &&
    endpointSecurity.length > 0 &&
    swaggerData.components &&
    swaggerData.components.securitySchemes
  ) {
    const schemes = swaggerData.components.securitySchemes;

    endpointSecurity.forEach((securityRequirement) => {
      Object.keys(securityRequirement).forEach((schemeName) => {
        const scheme = schemes[schemeName];
        if (!scheme) return;

        if (scheme.type === "http" && scheme.scheme === "bearer") {
          formHtml += `
            <div>
              <label class="block text-sm font-medium text-gray-400-custom mb-2" for="auth-token">
                Token <span class="text-red-400 text-xs">*</span>
                <span class="text-gray-400-custom text-xs ml-1">(${
                  scheme.description || "Bearer token"
                })</span>
              </label>
              <input class="w-full px-3 py-2 text-sm rounded-lg" 
                     id="auth-token" name="auth-token" placeholder="your-jwt-token" type="text" required />
            </div>
          `;
        } else if (scheme.type === "apiKey") {
          formHtml += `
            <div>
              <label class="block text-sm font-medium text-gray-400-custom mb-2" for="${
                scheme.name
              }">
                ${scheme.name} <span class="text-red-400 text-xs">*</span>
                <span class="text-gray-400-custom text-xs ml-1">(${
                  scheme.description || "API Key"
                })</span>
              </label>
              <input class="w-full px-3 py-2 text-sm rounded-lg" 
                     id="${scheme.name}" name="${
            scheme.name
          }" placeholder="your-api-key" type="text" required />
            </div>
          `;
        }
      });
    });
  }

  // Add parameter fields
  if (endpoint.parameters) {
    console.log("Parameters found:", endpoint.parameters);
    endpoint.parameters.forEach((param) => {
      formHtml += `
        <div>
          <label class="block text-sm font-medium text-gray-400-custom mb-2" for="${
            param.name
          }">
            ${param.name} ${
        param.required
          ? '<span class="text-red-400 text-xs">*</span>'
          : '<span class="text-gray-400-custom text-xs">(optional)</span>'
      } ${
        param.in === "path"
          ? '<span class="minimal-btn-secondary text-xs px-2 py-0.5 ml-2">path</span>'
          : ""
      }
          </label>
          ${generateInputField(param)}
          ${
            param.description
              ? `<p class="text-xs text-gray-400-custom mt-1">${param.description}</p>`
              : ""
          }
        </div>
      `;
    });
  }

  // Add request body field
  if (endpoint.requestBody) {
    const content = endpoint.requestBody.content;
    const jsonContent = content["application/json"];
    let placeholder = "Enter JSON";

    if (jsonContent && jsonContent.schema) {
      const exampleData = generateSchemaExample(jsonContent.schema);
      placeholder = JSON.stringify(exampleData, null, 2);
    }

    formHtml += `
      <div>
        <label class="block text-sm font-medium text-gray-400-custom mb-2" for="request-body">
          Request Body ${
            endpoint.requestBody.required
              ? '<span class="text-red-400 text-xs">*</span>'
              : '<span class="text-gray-400-custom text-xs">(optional)</span>'
          }
        </label>
        <div class="relative json-editor">
          <div class="relative">
            <pre class="text-gray-300-custom text-sm rounded-lg p-3 h-48 overflow-auto font-mono absolute inset-0 pointer-events-none" id="request-body-highlight"></pre>
            <textarea class="bg-transparent text-transparent text-sm rounded-lg block w-full p-3 h-48 font-mono relative z-10 resize-none" 
                      id="request-body" name="request-body" placeholder="${placeholder.replace(
                        /"/g,
                        "&quot;"
                      )}" 
                      oninput="highlightJSON(this)"
                      onscroll="syncScroll(this)">${placeholder}</textarea>
          </div>
          <button type="button" class="absolute top-2 right-2 text-gray-400-custom hover:text-gray-300-custom text-xs z-20" onclick="formatJSON()">
            <span class="material-icons text-sm">code</span>
          </button>
        </div>
      </div>
    `;
  }

  formHtml += `
    <button class="minimal-btn-primary flex items-center justify-center w-full" 
            id="run-request-btn">
      <span class="material-icons mr-2 text-sm">send</span>
      Send API Request
    </button>
  `;

  console.log("Generated form HTML:", formHtml);
  $("#try-it-form").html(formHtml);

  // Attach run request handler
  $("#run-request-btn").on("click", function () {
    executeRequest();
  });

  // Initialize JSON highlighting for request body
  const textarea = document.getElementById("request-body");
  if (textarea) {
    highlightJSON(textarea);
  }
}

/**
 * Generate input field based on parameter type
 * @param {Object} param - Parameter object from swagger
 * @returns {string} - HTML input field
 */
function generateInputField(param) {
  const schema = param.schema || {};
  const placeholder = schema.example || schema.default || "";

  if (schema.enum) {
    const options = schema.enum
      .map(
        (value) =>
          `<option value="${value}" ${
            schema.default === value ? "selected" : ""
          }>${value}</option>`
      )
      .join("");

    return `
      <select class="w-full px-3 py-2 text-sm rounded-lg" 
              id="${param.name}" name="${param.name}" ${
      param.required ? "required" : ""
    }>
        <option value="">Select option</option>
        ${options}
      </select>
    `;
  }

  return `
    <input class="w-full px-3 py-2 text-sm rounded-lg" 
           id="${param.name}" name="${param.name}" 
           placeholder="${placeholder}" 
           type="${
             schema.type === "integer" || schema.type === "number"
               ? "number"
               : "text"
           }" 
           ${param.required ? "required" : ""} />
  `;
}

/**
 * Execute API request with form data
 */
function executeRequest() {
  const endpoint = currentEndpoint.data;
  let url = currentEndpoint.path;
  const method = currentEndpoint.method.toUpperCase();
  const headers = {};
  let body = null;

  // Validate required fields
  let hasValidationError = false;

  // Check authorization if required
  const endpointSecurity = endpoint.security;
  if (
    endpointSecurity &&
    endpointSecurity.length > 0 &&
    swaggerData.components &&
    swaggerData.components.securitySchemes
  ) {
    const schemes = swaggerData.components.securitySchemes;

    endpointSecurity.forEach((securityRequirement) => {
      Object.keys(securityRequirement).forEach((schemeName) => {
        const scheme = schemes[schemeName];
        if (!scheme) return;

        if (scheme.type === "http" && scheme.scheme === "bearer") {
          const authToken = $("#auth-token").val();
          if (!authToken || authToken.trim() === "") {
            $("#auth-token").addClass("border-red-500");
            hasValidationError = true;
          } else {
            $("#auth-token").removeClass("border-red-500");
          }
        } else if (scheme.type === "apiKey") {
          const apiKeyValue = $(`#${scheme.name}`).val();
          if (!apiKeyValue || apiKeyValue.trim() === "") {
            $(`#${scheme.name}`).addClass("border-red-500");
            hasValidationError = true;
          } else {
            $(`#${scheme.name}`).removeClass("border-red-500");
          }
        }
      });
    });
  }

  if (endpoint.parameters) {
    endpoint.parameters.forEach((param) => {
      if (param.required) {
        const value = $(`#${param.name}`).val();
        if (!value || value.trim() === "") {
          $(`#${param.name}`).addClass("border-red-500");
          hasValidationError = true;
        } else {
          $(`#${param.name}`).removeClass("border-red-500");
        }
      }
    });
  }

  // Check required request body
  if (endpoint.requestBody && endpoint.requestBody.required) {
    const requestBodyValue = $("#request-body").val();
    if (!requestBodyValue || requestBodyValue.trim() === "") {
      $("#request-body").addClass("border-red-500");
      hasValidationError = true;
    } else {
      $("#request-body").removeClass("border-red-500");
    }
  }

  if (hasValidationError) {
    showToast("Please fill in required fields", "error");
    return;
  }

  // Add authorization headers
  if (
    endpointSecurity &&
    endpointSecurity.length > 0 &&
    swaggerData.components &&
    swaggerData.components.securitySchemes
  ) {
    const schemes = swaggerData.components.securitySchemes;

    endpointSecurity.forEach((securityRequirement) => {
      Object.keys(securityRequirement).forEach((schemeName) => {
        const scheme = schemes[schemeName];
        if (!scheme) return;

        if (scheme.type === "http" && scheme.scheme === "bearer") {
          const authToken = $("#auth-token").val();
          if (authToken) {
            headers["Authorization"] = authToken.startsWith("Bearer ")
              ? authToken
              : `Bearer ${authToken}`;
          }
        } else if (scheme.type === "apiKey") {
          const apiKeyValue = $(`#${scheme.name}`).val();
          if (apiKeyValue) {
            if (scheme.in === "header") {
              headers[scheme.name] = apiKeyValue;
            } else if (scheme.in === "query") {
              // Will be handled in the query params section
            }
          }
        }
      });
    });
  }

  // Process parameters
  if (endpoint.parameters) {
    const queryParams = [];

    endpoint.parameters.forEach((param) => {
      const value = $(`#${param.name}`).val();
      if (value) {
        if (param.in === "path") {
          url = url.replace(`{${param.name}}`, value);
        } else if (param.in === "query") {
          queryParams.push(`${param.name}=${encodeURIComponent(value)}`);
        } else if (param.in === "header") {
          headers[param.name] = value;
        }
      }
    });

    // Add API key query parameters from security schemes
    if (
      endpointSecurity &&
      endpointSecurity.length > 0 &&
      swaggerData.components &&
      swaggerData.components.securitySchemes
    ) {
      const schemes = swaggerData.components.securitySchemes;

      endpointSecurity.forEach((securityRequirement) => {
        Object.keys(securityRequirement).forEach((schemeName) => {
          const scheme = schemes[schemeName];
          if (scheme && scheme.type === "apiKey" && scheme.in === "query") {
            const apiKeyValue = $(`#${scheme.name}`).val();
            if (apiKeyValue) {
              queryParams.push(
                `${scheme.name}=${encodeURIComponent(apiKeyValue)}`
              );
            }
          }
        });
      });
    }

    if (queryParams.length > 0) {
      url += "?" + queryParams.join("&");
    }
  }

  // Add request body
  if (endpoint.requestBody) {
    const requestBodyValue = $("#request-body").val();
    if (requestBodyValue) {
      try {
        body = JSON.stringify(JSON.parse(requestBodyValue));
        headers["Content-Type"] = "application/json";
      } catch (e) {
        alert("Invalid JSON in request body");
        return;
      }
    }
  }

  // Show loading
  $("#response-container").show();
  $("#response-output").html("Loading...");

  // Make request (simulated for demo)
  setTimeout(() => {
    const mockResponse = {
      message: "This is a simulated response",
      endpoint: url,
      method: method,
      timestamp: new Date().toISOString(),
      data: generateSchemaExample(
        endpoint.responses["200"]?.content?.["application/json"]?.schema
      ),
    };

    const jsonString = JSON.stringify(mockResponse, null, 2);
    const highlightedCode = hljs.highlight(jsonString, {
      language: "json",
    }).value;
    $("#response-output").html(highlightedCode);
  }, 1000);
}

/**
 * Check if schema has nested properties that should be expandable
 * @param {Object} schema - OpenAPI schema object
 * @returns {boolean} - True if has nested properties
 */
function checkForNestedProperties(schema) {
  if (!schema || typeof schema !== "object") return false;

  // Handle $ref references
  if (schema.$ref) {
    const refPath = schema.$ref.replace("#/", "").split("/");
    let refSchema = swaggerData;
    for (const path of refPath) {
      refSchema = refSchema[path];
      if (!refSchema) break;
    }
    if (refSchema) {
      // For single schemas in allOf, check the actual schema
      if (refSchema.allOf && refSchema.allOf.length === 1) {
        return checkForNestedProperties(refSchema.allOf[0]);
      }
      return checkForNestedProperties(refSchema);
    }
    return false;
  }

  // Direct nested properties
  if (schema.properties && Object.keys(schema.properties).length > 0) {
    return true;
  }

  // Object type with properties
  if (schema.type === "object" && schema.properties) {
    return true;
  }

  // Array with complex items
  if (schema.type === "array" && schema.items) {
    return checkForNestedProperties(schema.items);
  }

  // Union types
  if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return schema.anyOf.some((subSchema) =>
      checkForNestedProperties(subSchema)
    );
  }

  if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return schema.oneOf.some((subSchema) =>
      checkForNestedProperties(subSchema)
    );
  }

  if (schema.allOf && Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    // If only one schema in allOf, check it directly
    if (schema.allOf.length === 1) {
      return checkForNestedProperties(schema.allOf[0]);
    }
    return schema.allOf.some((subSchema) =>
      checkForNestedProperties(subSchema)
    );
  }

  // Additional properties
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  ) {
    return checkForNestedProperties(schema.additionalProperties);
  }

  return false;
}

/**
 * Render schema properties as expandable tree view
 * @param {Object} schema - OpenAPI schema object
 * @param {number} depth - Current depth for indentation
 * @param {string} propertyId - Unique ID for the property
 * @returns {string} - HTML representation of schema
 */
function renderSchemaTreeView(schema, depth = 0, propertyId = "root") {
  if (!schema || typeof schema !== "object") {
    return "";
  }

  let html = "";

  // Handle $ref references
  if (schema.$ref) {
    const refPath = schema.$ref.replace("#/", "").split("/");
    let refSchema = swaggerData;
    for (const path of refPath) {
      refSchema = refSchema[path];
      if (!refSchema) break;
    }
    if (refSchema) {
      // For single schemas in allOf, render directly
      if (refSchema.allOf && refSchema.allOf.length === 1) {
        return renderSchemaTreeView(refSchema.allOf[0], depth, propertyId);
      }
      return renderSchemaTreeView(refSchema, depth, propertyId);
    } else {
      return `<div class="text-red-400">Could not resolve reference: ${schema.$ref}</div>`;
    }
  }

  // Handle allOf - merge all schemas or show single schema directly
  if (schema.allOf && Array.isArray(schema.allOf)) {
    // If only one schema in allOf, render it directly
    if (schema.allOf.length === 1) {
      return renderSchemaTreeView(schema.allOf[0], depth, propertyId);
    }

    // Otherwise merge all schemas
    const merged = { properties: {}, required: [] };

    schema.allOf.forEach((subSchema) => {
      if (subSchema.$ref) {
        // Resolve reference
        const refPath = subSchema.$ref.replace("#/", "").split("/");
        let refSchema = swaggerData;
        for (const path of refPath) {
          refSchema = refSchema[path];
          if (!refSchema) break;
        }
        if (refSchema) {
          if (refSchema.properties) {
            Object.assign(merged.properties, refSchema.properties);
          }
          if (refSchema.required) {
            merged.required.push(...refSchema.required);
          }
        }
      } else if (subSchema.properties) {
        Object.assign(merged.properties, subSchema.properties);
        if (subSchema.required) {
          merged.required.push(...subSchema.required);
        }
      }
    });

    if (Object.keys(merged.properties).length > 0) {
      return renderSchemaTreeView(merged, depth, propertyId);
    }
  }

  // Handle anyOf - show with select box
  if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    let html = `<div class="schema-row" data-level="${depth}" style="margin-left: ${
      depth * 24
    }px;">
      <div class="border-line"></div>
      <div class="schema-content">
        <div class="property-main-row">
          <div class="expand-button-spacer"></div>
          <div class="property-info">
            <div class="property-name">anyOf (${
              schema.anyOf.length
            } options)</div>
            <span class="property-type">union</span>
          </div>
        </div>
        <div class="property-description">
          Select one of the following schemas:
          <select class="anyof-select" onchange="switchAnyOfOption('${propertyId}', this.value)">`;

    // Generate select options
    schema.anyOf.forEach((subSchema, index) => {
      html += `<option value="${index}" ${index === 0 ? "selected" : ""}>
        Option ${index + 1} (${getSchemaType(subSchema)})
      </option>`;
    });

    html += `</select>
        </div>
      </div>
    </div>`;

    // Generate content for each option (only first one visible by default)
    schema.anyOf.forEach((subSchema, index) => {
      const optionId = `${propertyId}_anyof_${index}`;
      const isVisible = index === 0 ? "block" : "none";

      html += `<div id="${optionId}" class="anyof-content" style="display: ${isVisible};">`;
      html += renderSchemaTreeView(subSchema, depth + 1, optionId);
      html += `</div>`;
    });

    return html;
  }

  // Handle oneOf - show all possible schemas
  if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    let html = `<div class="schema-row" data-level="${depth}" style="margin-left: ${
      depth * 24
    }px;">
      <div class="border-line"></div>
      <div class="schema-content">
        <div class="property-main-row">
          <div class="expand-button" onclick="toggleSchemaProperty('${propertyId}_oneof')" role="button">
            <svg class="chevron-icon" viewBox="0 0 320 512">
              <path fill="currentColor" d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"></path>
            </svg>
          </div>
          <div class="property-info">
            <div class="property-name">oneOf (${
              schema.oneOf.length
            } options)</div>
            <span class="property-type">union</span>
          </div>
        </div>
        <div class="property-description">Exactly one of the following schemas</div>
      </div>
    </div>
    <div id="${propertyId}_oneof" class="nested-properties" style="display: none;">`;

    schema.oneOf.forEach((subSchema, index) => {
      const optionId = `${propertyId}_oneof_${index}`;
      const optionHasNested = checkForNestedProperties(subSchema);

      html += `<div class="schema-row" data-level="${
        depth + 1
      }" style="margin-left: ${(depth + 1) * 24}px;">
        <div class="border-line"></div>
        <div class="schema-content">
          <div class="property-main-row">`;

      // Add expand button if option has nested properties
      if (optionHasNested) {
        html += `<div class="expand-button" onclick="toggleSchemaProperty('${optionId}')" role="button">
          <svg class="chevron-icon" viewBox="0 0 320 512">
            <path fill="currentColor" d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"></path>
          </svg>
        </div>`;
      } else {
        html += `<div class="expand-button-spacer"></div>`;
      }

      html += `<div class="property-info">
              <div class="property-name">Option ${index + 1}</div>
              <span class="property-type">${getSchemaType(subSchema)}</span>
            </div>
          </div>
        </div>
      </div>`;

      // Add nested content if exists
      if (optionHasNested) {
        html += `<div id="${optionId}" class="nested-properties" style="display: none;">`;
        html += renderSchemaTreeView(subSchema, depth + 2, optionId);
        html += `</div>`;
      }
    });

    html += `</div>`;
    return html;
  }

  // Handle object schema (with or without explicit type)
  if (
    (schema.type === "object" && schema.properties) ||
    (schema.properties && !schema.type)
  ) {
    const requiredFields = schema.required || [];
    const properties = schema.properties;

    Object.keys(properties).forEach((key, index) => {
      const prop = properties[key];
      const isRequired = requiredFields.includes(key);
      const currentId = `${propertyId}_${key}`;
      const hasNestedProperties = checkForNestedProperties(prop);

      html += `<div class="schema-row" data-level="${depth}" style="margin-left: ${
        depth * 24
      }px;">`;

      // Border line
      html += `<div class="border-line"></div>`;

      // Content container
      html += `<div class="schema-content">`;

      // Main property row
      html += `<div class="property-main-row">`;

      // Expand/collapse button for nested objects
      if (hasNestedProperties) {
        html += `<div class="expand-button" onclick="toggleSchemaProperty('${currentId}')" role="button">
                   <svg class="chevron-icon" viewBox="0 0 320 512">
                     <path fill="currentColor" d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"></path>
                   </svg>
                 </div>`;
      } else {
        html += `<div class="expand-button-spacer"></div>`;
      }

      // Property name and type
      html += `<div class="property-info">
                 <div class="property-name">${key}</div>
                 <span class="property-type">${getSchemaType(prop)}</span>
               </div>`;

      // Required indicator
      html += `<div class="property-indicators">
                 <span class="property-required ${
                   isRequired ? "required" : "optional"
                 }">
                   ${isRequired ? "required" : ""}
                 </span>
               </div>`;

      html += `</div>`; // End property-main-row

      // Description
      if (prop.description) {
        html += `<div class="property-description">${prop.description}</div>`;
      }

      // Example
      if (!hasNestedProperties) {
        const exampleValue = generateSchemaExample(prop);
        html += `<div class="property-example">
                   <span>Example:</span>
                   <span class="example-value">${JSON.stringify(
                     exampleValue
                   )}</span>
                 </div>`;
      }

      html += `</div>`; // End schema-content
      html += `</div>`; // End schema-row

      // Nested properties (initially hidden)
      if (hasNestedProperties) {
        html += `<div id="${currentId}" class="nested-properties" style="display: none;">`;
        if (prop.type === "object" || prop.properties || prop.$ref) {
          html += renderSchemaTreeView(prop, depth + 1, currentId);
        } else if (prop.type === "array" && prop.items) {
          // Show array items directly without extra "items" wrapper
          html += renderSchemaTreeView(
            prop.items,
            depth + 1,
            `${currentId}_items`
          );
        } else if (
          prop.anyOf &&
          Array.isArray(prop.anyOf) &&
          prop.anyOf.length > 0
        ) {
          // Show anyOf with select box
          html += `<div class="property-description">
            Select one of the following schemas:
            <select class="anyof-select" onchange="switchAnyOfOption('${currentId}', this.value)">`;

          // Generate select options
          prop.anyOf.forEach((subSchema, index) => {
            html += `<option value="${index}" ${index === 0 ? "selected" : ""}>
              Option ${index + 1} (${getSchemaType(subSchema)})
            </option>`;
          });

          html += `</select>
          </div>`;

          // Generate content for each option (only first one visible by default)
          prop.anyOf.forEach((subSchema, index) => {
            const optionId = `${currentId}_anyof_${index}`;
            const isVisible = index === 0 ? "block" : "none";

            html += `<div id="${optionId}" class="anyof-content" style="display: ${isVisible};">`;
            html += renderSchemaTreeView(subSchema, depth + 1, optionId);
            html += `</div>`;
          });
        } else if (
          prop.oneOf &&
          Array.isArray(prop.oneOf) &&
          prop.oneOf.length > 0
        ) {
          // Show oneOf options
          prop.oneOf.forEach((subSchema, index) => {
            const optionId = `${currentId}_oneof_${index}`;
            const optionHasNested = checkForNestedProperties(subSchema);

            html += `<div class="schema-row" data-level="${
              depth + 1
            }" style="margin-left: ${(depth + 1) * 24}px;">
              <div class="border-line"></div>
              <div class="schema-content">
                <div class="property-main-row">`;

            // Add expand button if option has nested properties
            if (optionHasNested) {
              html += `<div class="expand-button" onclick="toggleSchemaProperty('${optionId}')" role="button">
                <svg class="chevron-icon" viewBox="0 0 320 512">
                  <path fill="currentColor" d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"></path>
                </svg>
              </div>`;
            } else {
              html += `<div class="expand-button-spacer"></div>`;
            }

            html += `<div class="property-info">
                    <div class="property-name">Option ${index + 1}</div>
                    <span class="property-type">${getSchemaType(
                      subSchema
                    )}</span>
                  </div>
                </div>
                <div class="property-description">Exactly one of the possible schemas</div>
              </div>
            </div>`;

            // Add nested content if exists
            if (optionHasNested) {
              html += `<div id="${optionId}" class="nested-properties" style="display: none;">`;
              html += renderSchemaTreeView(subSchema, depth + 2, optionId);
              html += `</div>`;
            }
          });
        } else if (
          prop.allOf &&
          Array.isArray(prop.allOf) &&
          prop.allOf.length > 0
        ) {
          // Show allOf schemas
          prop.allOf.forEach((subSchema, index) => {
            const optionId = `${currentId}_allof_${index}`;
            const optionHasNested = checkForNestedProperties(subSchema);

            html += `<div class="schema-row" data-level="${
              depth + 1
            }" style="margin-left: ${(depth + 1) * 24}px;">
              <div class="border-line"></div>
              <div class="schema-content">
                <div class="property-main-row">`;

            // Add expand button if option has nested properties
            if (optionHasNested) {
              html += `<div class="expand-button" onclick="toggleSchemaProperty('${optionId}')" role="button">
                <svg class="chevron-icon" viewBox="0 0 320 512">
                  <path fill="currentColor" d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"></path>
                </svg>
              </div>`;
            } else {
              html += `<div class="expand-button-spacer"></div>`;
            }

            html += `<div class="property-info">
                    <div class="property-name">Schema ${index + 1}</div>
                    <span class="property-type">${getSchemaType(
                      subSchema
                    )}</span>
                  </div>
                </div>
                <div class="property-description">All of the schemas must match</div>
              </div>
            </div>`;

            // Add nested content if exists
            if (optionHasNested) {
              html += `<div id="${optionId}" class="nested-properties" style="display: none;">`;
              html += renderSchemaTreeView(subSchema, depth + 2, optionId);
              html += `</div>`;
            }
          });
        }
        html += `</div>`;
      }
    });
  } else if (schema.type === "array" && schema.items) {
    html += renderSchemaTreeView(schema.items, depth, propertyId + "_items");
  }

  return html;
}

/**
 * Toggle schema property visibility
 * @param {string} propertyId - Property ID to toggle
 */
function toggleSchemaProperty(propertyId) {
  const element = document.getElementById(propertyId);
  const button = document.querySelector(`[onclick*="${propertyId}"]`);

  if (element && button) {
    const isHidden = element.style.display === "none";
    element.style.display = isHidden ? "block" : "none";

    // Rotate chevron
    const chevron = button.querySelector(".chevron-icon");
    if (chevron) {
      chevron.style.transform = isHidden ? "rotate(90deg)" : "rotate(0deg)";
    }
  }
}

/**
 * Switch anyOf option visibility
 * @param {string} propertyId - Base property ID
 * @param {string} selectedIndex - Selected option index
 */
function switchAnyOfOption(propertyId, selectedIndex) {
  // Hide all anyOf options
  let index = 0;
  while (true) {
    const optionElement = document.getElementById(
      `${propertyId}_anyof_${index}`
    );
    if (!optionElement) break;
    optionElement.style.display = "none";
    index++;
  }

  // Show selected option
  const selectedElement = document.getElementById(
    `${propertyId}_anyof_${selectedIndex}`
  );
  if (selectedElement) {
    selectedElement.style.display = "block";
  }
}

/**
 * Get schema type as string
 * @param {Object} schema - OpenAPI schema object
 * @returns {string} - Type string
 */
function getSchemaType(schema) {
  if (!schema) return "unknown";

  // Handle $ref by resolving it first
  if (schema.$ref) {
    const refPath = schema.$ref.replace("#/", "").split("/");
    let refSchema = swaggerData;
    for (const path of refPath) {
      refSchema = refSchema[path];
      if (!refSchema) break;
    }
    if (refSchema) {
      // For single schemas in allOf, get the actual type
      if (refSchema.allOf && refSchema.allOf.length === 1) {
        return getSchemaType(refSchema.allOf[0]);
      }
      return getSchemaType(refSchema);
    }
    return "object"; // Default for unresolved refs
  }

  if (schema.type) {
    if (schema.type === "array" && schema.items) {
      return `array[${getSchemaType(schema.items)}]`;
    }
    return schema.type;
  }

  if (schema.properties) return "object";
  if (schema.items) return "array";
  if (schema.anyOf) return `anyOf[${schema.anyOf.length}]`;
  if (schema.oneOf) return `oneOf[${schema.oneOf.length}]`;
  if (schema.allOf) {
    // For single schema in allOf, return the actual type
    if (schema.allOf.length === 1) {
      return getSchemaType(schema.allOf[0]);
    }
    return `allOf[${schema.allOf.length}]`;
  }

  return "unknown";
}

/**
 * Generate example from OpenAPI schema
 * @param {Object} schema - OpenAPI schema object
 * @param {Set} visited - Set to track circular references
 * @returns {*} - Generated example data
 */
function generateSchemaExample(schema, visited = new Set()) {
  if (!schema) return {};

  // Prevent circular references
  const schemaKey = JSON.stringify(schema);
  if (visited.has(schemaKey)) {
    return "..."; // Circular reference indicator
  }
  visited.add(schemaKey);

  // Handle $ref references
  if (schema.$ref) {
    const refPath = schema.$ref.replace("#/", "").split("/");
    let refSchema = swaggerData;
    for (const path of refPath) {
      refSchema = refSchema[path];
      if (!refSchema) break;
    }
    return refSchema
      ? generateSchemaExample(refSchema, visited)
      : "ref not found";
  }

  // Handle existing example
  if (schema.example !== undefined) return schema.example;

  // Handle anyOf - take first schema
  if (schema.anyOf && schema.anyOf.length > 0) {
    return generateSchemaExample(schema.anyOf[0], visited);
  }

  // Handle oneOf - take first schema
  if (schema.oneOf && schema.oneOf.length > 0) {
    return generateSchemaExample(schema.oneOf[0], visited);
  }

  // Handle allOf - merge all schemas
  if (schema.allOf && schema.allOf.length > 0) {
    const merged = {};
    schema.allOf.forEach((subSchema) => {
      const subExample = generateSchemaExample(subSchema, visited);
      if (typeof subExample === "object" && subExample !== null) {
        Object.assign(merged, subExample);
      }
    });
    return merged;
  }

  // Handle enum
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  // Handle object type
  if (schema.type === "object" && schema.properties) {
    const example = {};
    Object.keys(schema.properties).forEach((key) => {
      const isRequired = schema.required && schema.required.includes(key);
      const propertyIndex = Object.keys(schema.properties).indexOf(key);
      if (isRequired || propertyIndex < 3) {
        example[key] = generateSchemaExample(schema.properties[key], visited);
      }
    });

    if (schema.additionalProperties === true) {
      example["additionalProperty"] = "any value";
    } else if (typeof schema.additionalProperties === "object") {
      example["additionalProperty"] = generateSchemaExample(
        schema.additionalProperties,
        visited
      );
    }

    return example;
  }

  // Handle array type
  if (schema.type === "array" && schema.items) {
    const itemExample = generateSchemaExample(schema.items, visited);
    const minItems = schema.minItems || 1;
    const maxItems = Math.min(schema.maxItems || 3, 3);
    const arrayLength = Math.max(minItems, Math.min(maxItems, 2));

    return Array(arrayLength)
      .fill(null)
      .map(() => itemExample);
  }

  // Handle primitive types with constraints
  switch (schema.type) {
    case "string":
      if (schema.format === "date") return "2023-12-01";
      if (schema.format === "date-time") return "2023-12-01T12:00:00Z";
      if (schema.format === "email") return "example@email.com";
      if (schema.format === "uri") return "https://example.com";
      if (schema.format === "uuid")
        return "123e4567-e89b-12d3-a456-426614174000";
      if (schema.pattern) return "string matching pattern";
      if (schema.minLength || schema.maxLength) {
        const length = schema.minLength || Math.min(schema.maxLength || 10, 10);
        return "x".repeat(length);
      }
      return schema.default || "string";

    case "number":
      if (schema.minimum !== undefined) return schema.minimum;
      if (schema.maximum !== undefined) return Math.min(schema.maximum, 100);
      return schema.default || 123.45;

    case "integer":
      if (schema.minimum !== undefined) return schema.minimum;
      if (schema.maximum !== undefined) return Math.min(schema.maximum, 100);
      return schema.default || 123;

    case "boolean":
      return schema.default !== undefined ? schema.default : true;

    case "null":
      return null;

    default:
      if (!schema.type) {
        if (schema.properties)
          return generateSchemaExample({ ...schema, type: "object" }, visited);
        if (schema.items)
          return generateSchemaExample({ ...schema, type: "array" }, visited);
        return "any";
      }
      return schema.default || "unknown type";
  }
}

/**
 * Render code example in sidebar
 */
function renderCodeExample() {
  const path = currentEndpoint.path;
  const method = currentEndpoint.method.toUpperCase();
  const endpoint = currentEndpoint.data;
  const curlCommand = `curl --request ${method} --url ${path} --header 'Authorization: Bearer <token>' --header 'Content-Type: application/json' '${path}'`;

  const sidebarContent = `
    <div class="w-full xl:w-[28rem] gap-6 grid grid-rows-[repeat(auto-fit,minmax(0,min-content))] grid-rows relative max-h-[calc(100%-32px)] min-h-[18rem]">
      <!-- Request Code Block -->
      <div dir="ltr" data-orientation="horizontal" class="code-group p-0.5 flex flex-col not-prose relative overflow-hidden rounded-2xl border border-gray-700-custom my-0 bg-gray-800-custom text-gray-300-custom">
        <div class="flex items-center justify-between gap-2 relative px-2.5 py-2 bg-gray-800-custom " data-component-part="code-group-tab-bar">
          <div class="flex items-center gap-1.5 text-xs font-medium min-w-0">
            <span class="truncate text-gray-300-custom">${
              endpoint.summary || endpoint.operationId || path
            }</span>
          </div>
          <div class="flex items-center justify-end shrink-0 gap-1.5">
            <button type="button" id="radix-_r_q_" aria-haspopup="menu" aria-expanded="false" data-state="closed" class="group disabled:pointer-events-none [&>span]:line-clamp-1 rounded-lg overflow-hidden group outline-none flex items-center py-0.5 gap-1 text-gray-950/50 dark:text-white/50 group-hover:text-gray-950/70 dark:group-hover:text-white/70 select-none bg-transparent dark:bg-transparent pb-1 text-xs font-medium cursor-default">
              <div class="flex gap-1 items-center pl-2.5 pr-1.5 py-[5px] rounded-[10px] border text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/70 hover:text-primary dark:hover:text-primary-light border-transparent">
                <svg class="w-3.5 h-3.5 shrink-0" style="mask-image: url('https://d3gk2c5xim1je2.cloudfront.net/devicon/bash.svg'); mask-repeat: no-repeat; mask-position: center center; mask-size: 100%; background-color: currentcolor;"></svg>
                <p class="truncate font-medium">cURL</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevrons-up-down w-3.5 h-3.5 shrink-0">
                  <path d="m7 15 5 5 5-5"></path>
                  <path d="m7 9 5-5 5 5"></path>
                </svg>
              </div>
            </button>
            <div class="z-10 relative">
              <button class="h-[26px] w-[26px] flex items-center justify-center rounded-md backdrop-blur peer group/copy-button" data-testid="copy-code-button" aria-label="Copy the contents from the code block" onclick="copyToClipboard(\`${curlCommand.replace(
                /`/g,
                "\\`"
              )}\`)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 group-hover/copy-button:text-gray-500 dark:text-white/40 dark:group-hover/copy-button:text-white/60">
                  <path d="M14.25 5.25H7.25C6.14543 5.25 5.25 6.14543 5.25 7.25V14.25C5.25 15.3546 6.14543 16.25 7.25 16.25H14.25C15.3546 16.25 16.25 15.3546 16.25 14.25V7.25C16.25 6.14543 15.3546 5.25 14.25 5.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path d="M2.80103 11.998L1.77203 5.07397C1.61003 3.98097 2.36403 2.96397 3.45603 2.80197L10.38 1.77297C11.313 1.63397 12.19 2.16297 12.528 3.00097" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <div aria-hidden="true" class="absolute top-11 left-1/2 transform whitespace-nowrap -translate-x-1/2 -translate-y-1/2 peer-hover:opacity-100 opacity-0 text-white rounded-lg px-1.5 py-0.5 text-xs bg-primary-dark">Copy</div>
            </div>
            <div class="z-10 relative">
              
              <div aria-hidden="true" class="absolute top-11 left-1/2 transform whitespace-nowrap -translate-x-1/2 -translate-y-1/2 peer-hover:opacity-100 opacity-0 text-white rounded-lg px-1.5 py-0.5 text-xs bg-primary-dark">Ask AI</div>
            </div>
          </div>
        </div>
        <div class="flex flex-1 overflow-hidden">
          <div data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-_r_p_-trigger-0" id="radix-_r_p_-content-0" tabindex="0" class="w-full min-w-full max-w-full h-full max-h-full" style="animation-duration: 0s;">
            <div class="w-0 min-w-full max-w-full !p-0 h-full bg-gray-900-custom relative text-sm leading-6 children:!my-0 children:!shadow-none children:!bg-transparent transition-[height] duration-300 ease-in-out [&_*]:ring-0 [&_*]:outline-none [&_*]:focus:ring-0 [&_*]:focus:outline-none [&_pre>code]:pr-[3rem] [&_pre>code>span.line-highlight]:min-w-[calc(100%+3rem)] [&_pre>code>span.line-diff]:min-w-[calc(100%+3rem)] rounded-[14px] overflow-auto overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-black/15 hover:scrollbar-thumb-black/20 active:scrollbar-thumb-black/20 dark:scrollbar-thumb-white/20 dark:hover:scrollbar-thumb-white/25 dark:active:scrollbar-thumb-white/25 text-[12px]" data-component-part="code-block-root" style="font-variant-ligatures: none; height: 100%;">
            <pre class="p-4"><span class="line"><span class="keyword">curl</span> <span class="option">--request</span> <span class="method">${method}</span> <span class="separator"> \</span></span>
<span class="line">  <span class="option">--url</span> <span class="string">${getBaseUrl()}${path}</span> <span class="separator"> \</span></span>
<span class="line">  <span class="option">--header</span> <span class="string">'Authorization: Bearer &lt;token&gt;'</span> <span class="separator"> \</span></span>
<span class="line">  <span class="option">--header</span> <span class="string">'Content-Type: application/json'</span> <span class="separator"> \</span></span>
<span class="line">  <span class="string">'{}'</span></span></pre>  
            </div>
          </div>
        </div>
      </div>

      ${Object.keys(endpoint.responses || {})
        .map((statusCode) => {
          const response = endpoint.responses[statusCode];
          const content =
            response.content && response.content["application/json"];
          const isSuccess = statusCode.startsWith("2");
          const jsonContent = content
            ? JSON.stringify(generateSchemaExample(content.schema), null, 2)
            : "No content available";

          return `
          <!-- Response Code Block -->
          <div dir="ltr" data-orientation="horizontal" class="code-group p-0.5 flex flex-col not-prose relative overflow-hidden rounded-2xl border border-gray-700-custom my-0 bg-gray-800-custom text-gray-300-custom">
            <div class="flex items-center justify-between gap-2 relative px-2.5 py-2 bg-gray-800-custom " data-component-part="code-group-tab-bar">
              <div role="tablist" aria-orientation="horizontal" class="flex-1 min-w-0 text-xs leading-6 rounded-tl-xl gap-1 flex overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-black/15 hover:scrollbar-thumb-black/20 active:scrollbar-thumb-black/20 dark:scrollbar-thumb-white/20 dark:hover:scrollbar-thumb-white/25 dark:active:scrollbar-thumb-white/25" tabindex="0" data-orientation="horizontal" style="outline: none;">
                <button type="button" role="tab" aria-selected="true" aria-controls="radix-_r_s_-content-0" data-state="active" id="radix-_r_s_-trigger-0" class="group flex items-center relative gap-1.5 py-1 pb-1.5 outline-none whitespace-nowrap font-medium text-gray-300-custom" tabindex="-1" data-orientation="horizontal" data-radix-collection-item="">
                  <div class="flex items-center gap-1.5 px-1.5 rounded-lg z-10 group-hover:bg-gray-700-custom group-hover:text-gray-200">${statusCode}</div>
                  <div class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary dark:bg-primary-light"></div>
                </button>
              </div>
              <div class="flex items-center justify-end shrink-0 gap-1.5">
                <div class="z-10 relative">
                  <button class="h-[26px] w-[26px] flex items-center justify-center rounded-md backdrop-blur peer group/copy-button" data-testid="copy-code-button" aria-label="Copy the contents from the code block" onclick="copyToClipboard(\`${jsonContent
                    .replace(/`/g, "\\`")
                    .replace(/\n/g, "\\n")}\`)">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 group-hover/copy-button:text-gray-500 dark:text-white/40 dark:group-hover/copy-button:text-white/60">
                      <path d="M14.25 5.25H7.25C6.14543 5.25 5.25 6.14543 5.25 7.25V14.25C5.25 15.3546 6.14543 16.25 7.25 16.25H14.25C15.3546 16.25 16.25 15.3546 16.25 14.25V7.25C16.25 6.14543 15.3546 5.25 14.25 5.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                      <path d="M2.80103 11.998L1.77203 5.07397C1.61003 3.98097 2.36403 2.96397 3.45603 2.80197L10.38 1.77297C11.313 1.63397 12.19 2.16297 12.528 3.00097" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                  </button>
                  <div aria-hidden="true" class="absolute top-11 left-1/2 transform whitespace-nowrap -translate-x-1/2 -translate-y-1/2 peer-hover:opacity-100 opacity-0 text-white rounded-lg px-1.5 py-0.5 text-xs bg-primary-dark">Copy</div>
                </div>
                <div class="z-10 relative">
                  <div aria-hidden="true" class="absolute top-11 left-1/2 transform whitespace-nowrap -translate-x-1/2 -translate-y-1/2 peer-hover:opacity-100 opacity-0 text-white rounded-lg px-1.5 py-0.5 text-xs bg-primary-dark">Ask AI</div>
                </div>
              </div>
            </div>
            <div class="flex flex-1 overflow-hidden">
              <div data-state="active" data-orientation="horizontal" role="tabpanel" aria-labelledby="radix-_r_s_-trigger-0" id="radix-_r_s_-content-0" tabindex="0" class="w-full min-w-full max-w-full h-full max-h-full" style="animation-duration: 0s;">
                <div class="w-0 min-w-full max-w-full !p-0 h-full bg-gray-900-custom relative text-sm leading-6 children:!my-0 children:!shadow-none children:!bg-transparent transition-[height] duration-300 ease-in-out [&_*]:ring-0 [&_*]:outline-none [&_*]:focus:ring-0 [&_*]:focus:outline-none [&_pre>code]:pr-[3rem] [&_pre>code>span.line-highlight]:min-w-[calc(100%+3rem)] [&_pre>code>span.line-diff]:min-w-[calc(100%+3rem)] rounded-[14px] overflow-auto overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-black/15 hover:scrollbar-thumb-black/20 active:scrollbar-thumb-black/20 dark:scrollbar-thumb-white/20 dark:hover:scrollbar-thumb-white/25 dark:active:scrollbar-thumb-white/25" data-component-part="code-block-root" style="font-variant-ligatures: none; height: 100%;">
                  <div class="font-mono  flex-none h-full text-xs leading-[1.35rem]" data-component-part="code-group-tab-content">
                    <pre class="shiki shiki-themes github-light-default dark-plus p-2 text-[var(--text-primary)]" style="background-color:transparent;--shiki-dark-bg:transparent;color:#1f2328;--shiki-dark:#f3f7f6">${
                      content
                        ? hljs.highlight(jsonContent, { language: "json" })
                            .value
                        : "No content available"
                    }</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;

  $("aside:last-child").html(sidebarContent);
}

/**
 * Get base URL from swagger configuration
 * @returns {string} - Base URL
 */
function getBaseUrl() {
  if (swaggerData.servers && swaggerData.servers.length > 0) {
    return swaggerData.servers[0].url;
  }
  return "https://api.example.com";
}

/**
 * Format JSON in textarea
 */
function formatJSON() {
  const textarea = document.getElementById("request-body");
  if (textarea) {
    try {
      const parsed = JSON.parse(textarea.value);
      textarea.value = JSON.stringify(parsed, null, 2);
      highlightJSON(textarea);
    } catch (e) {
      console.log("Invalid JSON, cannot format");
    }
  }
}

/**
 * Highlight JSON syntax in textarea
 * @param {HTMLElement} textarea - Textarea element
 */
function highlightJSON(textarea) {
  const highlightDiv = document.getElementById("request-body-highlight");
  if (!highlightDiv) return;

  let content = textarea.value;

  try {
    JSON.parse(content);
    const highlighted = hljs.highlight(content, { language: "json" }).value;
    highlightDiv.innerHTML = highlighted;
  } catch (e) {
    const highlighted = hljs.highlight(content, { language: "json" }).value;
    highlightDiv.innerHTML = highlighted;
  }
}

/**
 * Sync scroll between textarea and highlight div
 * @param {HTMLElement} textarea - Textarea element
 */
function syncScroll(textarea) {
  const highlightDiv = document.getElementById("request-body-highlight");
  if (highlightDiv) {
    highlightDiv.scrollTop = textarea.scrollTop;
    highlightDiv.scrollLeft = textarea.scrollLeft;
  }
}

/**
 * Copy text to clipboard with user feedback
 * @param {string} text - Text to copy
 * @param {HTMLElement} element - Element that triggered copy
 */
function copyToClipboard(text, element = null) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      if (element) {
        showCopySuccess(element);
      } else {
        const clickedElement = event?.target;
        if (clickedElement) {
          showCopySuccess(clickedElement);
        }
      }
      showToast("Copied to clipboard!", "success");
    })
    .catch((err) => {
      console.error("Copy failed:", err);
      showToast("Copy failed!", "error");
    });
}

/**
 * Show copy success animation
 * @param {HTMLElement} element - Element to animate
 */
function showCopySuccess(element) {
  const iconElement = element.classList.contains("material-icons")
    ? element
    : element.querySelector(".material-icons");

  if (iconElement) {
    const originalIcon = iconElement.textContent;
    iconElement.textContent = "check";
    iconElement.style.color = "var(--accent-primary)";

    setTimeout(() => {
      iconElement.textContent = originalIcon;
      iconElement.style.color = "";
    }, 1500);
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, info)
 */
function showToast(message, type = "info") {
  const existingToast = document.querySelector(".copy-toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `copy-toast fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm font-medium z-50 transform transition-all duration-300 translate-x-full opacity-0`;

  if (type === "success") {
    toast.classList.add("bg-green-600");
  } else if (type === "error") {
    toast.classList.add("bg-red-600");
  } else {
    toast.classList.add("bg-blue-600");
  }

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-x-full", "opacity-0");
  }, 10);

  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Navigate to previous endpoint
 */
function navigateToPreviousEndpoint() {
  if (currentEndpointIndex > 0) {
    const prevEndpoint = allEndpoints[currentEndpointIndex - 1];
    loadEndpoint(prevEndpoint.path, prevEndpoint.method.toLowerCase());

    // Update URL hash
    const endpointHash = `${prevEndpoint.method}-${prevEndpoint.path.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    )}`;
    window.history.pushState(null, "", `#${endpointHash}`);

    // Update active sidebar item
    updateActiveSidebarItem(
      prevEndpoint.path,
      prevEndpoint.method.toLowerCase()
    );
  }
}

/**
 * Navigate to next endpoint
 */
function navigateToNextEndpoint() {
  if (currentEndpointIndex < allEndpoints.length - 1) {
    const nextEndpoint = allEndpoints[currentEndpointIndex + 1];
    loadEndpoint(nextEndpoint.path, nextEndpoint.method.toLowerCase());

    // Update URL hash
    const endpointHash = `${nextEndpoint.method}-${nextEndpoint.path.replace(
      /[^a-zA-Z0-9]/g,
      "-"
    )}`;
    window.history.pushState(null, "", `#${endpointHash}`);

    // Update active sidebar item
    updateActiveSidebarItem(
      nextEndpoint.path,
      nextEndpoint.method.toLowerCase()
    );
  }
}

/**
 * Update active sidebar item
 * @param {string} path - API endpoint path
 * @param {string} method - HTTP method
 */
function updateActiveSidebarItem(path, method) {
  $(".endpoint-link").removeClass("nav-link active");
  $(`.endpoint-link[data-path="${path}"][data-method="${method}"]`)
    .addClass("nav-link active")
    .closest(".accordion-content")
    .show()
    .prev(".accordion-toggle")
    .find(".material-icons")
    .text("expand_more");
}

/**
 * Navigate back to API overview
 */
function navigateToOverview() {
  // Clear current endpoint
  currentEndpoint = null;
  currentEndpointIndex = -1;

  // Clear URL hash
  window.history.pushState(null, "", window.location.pathname);

  // Clear active sidebar items
  $(".endpoint-link").removeClass("nav-link active");

  // Show overview content
  showApiOverview();
}

/**
 * Show API overview page
 */
function showApiOverview() {
  const mainContent = $("main");
  const overviewHtml = `
    <div class="text-center py-16">
      <h1 class="text-4xl font-bold text-gray-300-custom mb-6">API Documentation</h1>
      <p class="text-gray-400-custom text-lg mb-8">
        Welcome to the API documentation. Select an endpoint from the sidebar to get started.
      </p>
      <div class="overview-grid">
        ${Object.keys(getEndpointsByTag())
          .map(
            (tag) => `
          <div class="overview-card">
            <h3>${tag}</h3>
            <p>
              ${getEndpointsByTag()[tag].length} endpoint${
              getEndpointsByTag()[tag].length !== 1 ? "s" : ""
            }
            </p>
            <div class="flex flex-wrap gap-2">
              ${getEndpointsByTag()
                [tag].slice(0, 3)
                .map(
                  (endpoint) => `
                <span class="method-badge bg-${getMethodColor(
                  endpoint.method
                )}-500 text-white">
                  ${getMethodDisplayName(endpoint.method)}
                </span>
              `
                )
                .join("")}
              ${
                getEndpointsByTag()[tag].length > 3
                  ? `
                <span class="text-gray-400-custom text-xs">+${
                  getEndpointsByTag()[tag].length - 3
                } more</span>
              `
                  : ""
              }
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  mainContent.html(overviewHtml);

  // Clear code examples sidebar
  $("aside:last-child").html(`
    <div class="text-center py-16">
      <div class="text-gray-400-custom">
        <span class="material-icons text-4xl mb-4">code</span>
        <p>Select an endpoint to see code examples</p>
      </div>
    </div>
  `);
}

/**
 * Get endpoints grouped by tag
 * @returns {Object} - Endpoints grouped by tag
 */
function getEndpointsByTag() {
  const groups = {};
  allEndpoints.forEach((endpoint) => {
    const tag = "Default"; // You can enhance this to get actual tags from swagger data
    if (!groups[tag]) {
      groups[tag] = [];
    }
    groups[tag].push(endpoint);
  });
  return groups;
}

/**
 * Handle browser back/forward buttons
 */
window.addEventListener("popstate", function (event) {
  const hash = window.location.hash.substring(1);
  if (hash && swaggerData) {
    loadEndpointFromHash(hash);
  } else if (swaggerData) {
    navigateToOverview();
  }
});
