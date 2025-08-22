/**
 * API Documentation Interactive Script
 * Handles dynamic content loading, form generation, and user interactions
 */

// Global variables
let swaggerData = null;
let currentEndpoint = null;

/**
 * Initialize the application
 */
$(document).ready(function () {
  loadSwaggerData();
});

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
      // Load first endpoint by default
      const firstPath = Object.keys(swaggerData.paths)[0];
      const firstMethod = Object.keys(swaggerData.paths[firstPath])[0];
      if (firstPath && firstMethod) {
        loadEndpoint(firstPath, firstMethod);
      }
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

  // Group endpoints by tag or path prefix
  const groups = {};

  Object.keys(swaggerData.paths).forEach((path) => {
    Object.keys(swaggerData.paths[path]).forEach((method) => {
      const endpoint = swaggerData.paths[path][method];
      const tags = endpoint.tags || ["Default"];
      const tag = tags[0];

      if (!groups[tag]) {
        groups[tag] = [];
      }

      groups[tag].push({
        path: path,
        method: method.toUpperCase(),
        summary: endpoint.summary || endpoint.operationId || path,
        operationId: endpoint.operationId,
      });
    });
  });

  // Generate navigation HTML with accordion structure
  Object.keys(groups).forEach((groupName) => {
    const groupHtml = `
      <div>
        <ul class="space-y-2 text-sm">
          <li>
            <a class="flex items-center px-3 py-1 rounded accordion-toggle cursor-pointer sidebar-item !justify-start text-[#9e9e9e]">
              <span>${groupName}</span>
              <span class="material-icons text-sm transform transition-transform ml-5">chevron_right</span>
            </a>
            <ul class="ml-4 mt-2 space-y-2 accordion-content" style="display: none;">
              ${groups[groupName]
                .map(
                  (endpoint) => `
                <li class="group">
                  <a class="flex items-center justify-between px-3 py-1 rounded endpoint-link cursor-pointer sidebar-item" 
                     data-path="${endpoint.path}" 
                     data-method="${endpoint.method.toLowerCase()}">
                    <div class="flex items-center flex-1 min-w-0">
                      <span class="bg-${getMethodColor(
                        endpoint.method
                      )}-500 text-xs font-bold text-white rounded px-2 py-0.5 mr-2 text-center inline-block" style="width: 50px;">
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
                <td class="text-gray-400-custom pt-2 pb-4" colspan="3">
                  <p>${param.description || "No description available"}</p>
                  ${
                    param.schema?.example
                      ? `<p class="mt-2">Example: <code class="available-option">${param.schema.example}</code></p>`
                      : ""
                  }
                  ${
                    param.schema?.enum
                      ? `<div class="flex items-center gap-2 mt-2">
                          <span class="text-gray-400-custom">Available options:</span>
                          ${param.schema.enum
                            .map(
                              (val) =>
                                `<span class="available-option">${val}</span>`
                            )
                            .join("")}
                         </div>`
                      : ""
                  }
                </td>
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
          <h2 class="text-xl font-semibold text-white mb-4">Request Body</h2>
          <div class="bg-gray-800-custom rounded-lg p-4">
            <div class="flex items-center justify-between text-sm mb-2">
              <div class="flex items-center gap-2">
                <span class="font-mono text-white">application/json</span>
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
            <pre class="bg-gray-900-custom text-white p-4 rounded-lg text-sm overflow-x-auto"><code class="language-json">${
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
        </section>
      `;
    }
  }

  // Generate responses HTML
  let responsesHtml = "";
  if (endpoint.responses) {
    responsesHtml = `
      <section class="mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Responses</h2>
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
                  response.description || "No description available"
                }</p>
                ${
                  content && content.schema
                    ? `<div class="bg-[#0b0c0e] rounded-lg p-4 overflow-x-auto">
                        <h4 class="text-sm font-semibold text-white mb-3">Response Schema</h4>
                        <div class="schema-tree-view text-sm">
                          ${renderSchemaTreeView(
                            content.schema,
                            0,
                            `response_${statusCode}`
                          )}
                        </div>
                       </div>
                       <div class="mt-4">
                        <h4 class="text-sm font-semibold text-white mb-2">Example Response</h4>
                        <pre class="bg-black text-sm rounded-lg p-4 overflow-x-auto"><code class="language-json">${
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
                    ? `<pre class="bg-black text-sm rounded-lg p-4 overflow-x-auto"><code class="language-json">${
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
    <div class="flex justify-between items-center mb-4">
      <a class="text-sm text-gray-400-custom flex items-center" href="#">
        <span class="material-icons mr-1">arrow_back</span> API Documentation
      </a>
    </div>
    <header class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-3xl font-bold text-white">
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
        ${endpoint.description || "No description available"}
      </p>
    </header>
    <div class="api-endpoint">
      <div class="flex items-center flex-grow">
        <span class="api-method bg-${getMethodColor(method)}-500 text-white">
          ${getMethodDisplayName(method)}
        </span>
        <span class="api-path">${path}</span>
      </div>
      <button class="try-it-btn" id="try-it-btn">
        <span>Try it</span>
        <span class="material-icons text-lg">play_arrow</span>
      </button>
    </div>
    <section class="mb-8 bg-gray-800-custom rounded-lg p-6" id="try-it-section">
      <h2 class="text-xl font-semibold text-white mb-4">Try it out</h2>
      <div class="space-y-4" id="try-it-form">
        <!-- Dynamic form will be generated here -->
      </div>
      <div class="mt-6 hidden" id="response-container">
        <h3 class="text-lg font-semibold text-white mb-2">Response</h3>
        <pre class="bg-black text-sm rounded-lg p-4 overflow-x-auto"><code class="language-json" id="response-output"></code></pre>
      </div>
    </section>
    ${getAuthorizationHtml()}
    ${parametersHtml}
    ${requestBodyHtml}
    ${responsesHtml}
  `;

  mainContent.html(html);

  generateTryItForm();

  // Re-attach event handlers
  $("#try-it-btn")
    .off("click")
    .on("click", function () {
      $("#try-it-section").slideToggle();
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
  if (!swaggerData.components || !swaggerData.components.securitySchemes)
    return "";

  const schemes = swaggerData.components.securitySchemes;
  let authHtml = "";

  Object.keys(schemes).forEach((schemeName) => {
    const scheme = schemes[schemeName];
    if (scheme.type === "http" && scheme.scheme === "bearer") {
      authHtml += `
        <section class="mb-8">
          <h2 class="section-title">Authorization</h2>
          <table class="param-table">
            <tbody>
              <tr>
                <td>
                  <div class="param-name">Authorization</div>
                </td>
                <td>
                  <div class="param-type">string</div>
                </td>
                <td>
                  <div class="param-type">header</div>
                </td>
                <td>
                  <span class="required">required</span>
                </td>
              </tr>
              <tr>
                <td class="text-gray-400-custom pt-2 pb-4" colspan="4">
                  ${
                    scheme.description ||
                    "Bearer authentication header of the form"
                  } 
                  <code class="available-option">Bearer &lt;token&gt;</code> where 
                  <code class="available-option">&lt;token&gt;</code> is your auth token.
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      `;
    }
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

  // Add authorization field
  if (swaggerData.components && swaggerData.components.securitySchemes) {
    formHtml += `
      <div>
        <label class="block text-sm font-medium text-gray-300-custom mb-1" for="auth-token">
          Authorization <span class="text-red-400 ml-1">*</span>
        </label>
        <input class="bg-gray-700-custom border border-gray-700-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
               id="auth-token" name="auth-token" placeholder="Bearer <token>" type="text" required />
      </div>
    `;
  }

  // Add parameter fields
  if (endpoint.parameters) {
    console.log("Parameters found:", endpoint.parameters);
    endpoint.parameters.forEach((param) => {
      formHtml += `
        <div>
          <label class="block text-sm font-medium text-gray-300-custom mb-1" for="${
            param.name
          }">
            ${param.name} ${
        param.required
          ? '<span class="text-red-400 ml-1">*</span>'
          : '<span class="text-gray-500 text-xs">(optional)</span>'
      } ${
        param.in === "path"
          ? '<span class="bg-blue-600 text-xs px-2 py-0.5 rounded ml-2">path</span>'
          : ""
      }
          </label>
          ${generateInputField(param)}
          ${
            param.description
              ? `<p class="text-xs text-gray-400 mt-1">${param.description}</p>`
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
        <label class="block text-sm font-medium text-gray-300-custom mb-1" for="request-body">
          Request Body ${
            endpoint.requestBody.required
              ? '<span class="text-red-400 ml-1">*</span>'
              : '<span class="text-gray-500 text-xs">(optional)</span>'
          }
        </label>
        <div class="relative json-editor">
          <div class="relative">
            <pre class="bg-gray-700-custom border border-gray-700-custom text-white text-sm rounded-lg p-2.5 h-64 overflow-auto font-mono absolute inset-0 pointer-events-none" id="request-body-highlight"></pre>
            <textarea class="bg-transparent border border-gray-700-custom text-transparent text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-64 font-mono relative z-10 resize-none" 
                      id="request-body" name="request-body" placeholder="${placeholder.replace(
                        /"/g,
                        "&quot;"
                      )}" 
                      oninput="highlightJSON(this)"
                      onscroll="syncScroll(this)">${placeholder}</textarea>
          </div>
          <button type="button" class="absolute top-2 right-2 text-gray-400-custom hover:text-white text-xs z-20" onclick="formatJSON()">
            <span class="material-icons text-sm">code</span>
          </button>
        </div>
      </div>
    `;
  }

  formHtml += `
    <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center w-full justify-center" 
            id="run-request-btn">
      <span class="material-icons mr-2">send</span>
      Run Request
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
      <select class="bg-gray-700-custom border border-gray-700-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
              id="${param.name}" name="${param.name}" ${
      param.required ? "required" : ""
    }>
        <option value="">--</option>
        ${options}
      </select>
    `;
  }

  return `
    <input class="bg-gray-700-custom border border-gray-700-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
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
  if (swaggerData.components && swaggerData.components.securitySchemes) {
    const authToken = $("#auth-token").val();
    if (!authToken || authToken.trim() === "") {
      $("#auth-token").addClass("border-red-500");
      hasValidationError = true;
    } else {
      $("#auth-token").removeClass("border-red-500");
    }
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

  // Add authorization
  const authToken = $("#auth-token").val();
  if (authToken) {
    headers["Authorization"] = authToken.startsWith("Bearer ")
      ? authToken
      : `Bearer ${authToken}`;
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
    return refSchema ? checkForNestedProperties(refSchema) : false;
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
      return renderSchemaTreeView(refSchema, depth, propertyId);
    } else {
      return `<div class="text-red-400">Could not resolve reference: ${schema.$ref}</div>`;
    }
  }

  // Handle allOf - merge all schemas
  if (schema.allOf && Array.isArray(schema.allOf)) {
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

  // Handle anyOf - show all possible schemas
  if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    let html = `<div class="schema-row" data-level="${depth}" style="margin-left: ${
      depth * 24
    }px;">
      <div class="border-line"></div>
      <div class="schema-content">
        <div class="property-main-row">
          <div class="expand-button" onclick="toggleSchemaProperty('${propertyId}_anyof')" role="button">
            <svg class="chevron-icon" viewBox="0 0 320 512">
              <path fill="currentColor" d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"></path>
            </svg>
          </div>
          <div class="property-info">
            <div class="property-name">anyOf (${
              schema.anyOf.length
            } options)</div>
            <span class="property-type">union</span>
          </div>
        </div>
        <div class="property-description">One of the following schemas</div>
      </div>
    </div>
    <div id="${propertyId}_anyof" class="nested-properties" style="display: none;">`;

    schema.anyOf.forEach((subSchema, index) => {
      const optionId = `${propertyId}_anyof_${index}`;
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
        if (prop.type === "object" || prop.properties) {
          html += renderSchemaTreeView(prop, depth + 1, currentId);
        } else if (prop.type === "array" && prop.items) {
          // Show array items with proper tree structure
          const itemsId = `${currentId}_items`;
          const itemsHasNested = checkForNestedProperties(prop.items);

          html += `<div class="schema-row" data-level="${
            depth + 1
          }" style="margin-left: ${(depth + 1) * 24}px;">
            <div class="border-line"></div>
            <div class="schema-content">
              <div class="property-main-row">`;

          // Add expand button if items have nested properties
          if (itemsHasNested) {
            html += `<div class="expand-button" onclick="toggleSchemaProperty('${itemsId}')" role="button">
              <svg class="chevron-icon" viewBox="0 0 320 512">
                <path fill="currentColor" d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"></path>
              </svg>
            </div>`;
          } else {
            html += `<div class="expand-button-spacer"></div>`;
          }

          html += `<div class="property-info">
                  <div class="property-name">items</div>
                  <span class="property-type">${getSchemaType(
                    prop.items
                  )}</span>
                </div>
              </div>
              <div class="property-description">Array item type</div>
            </div>
          </div>`;

          // Add nested content if exists
          if (itemsHasNested) {
            html += `<div id="${itemsId}" class="nested-properties" style="display: none;">`;
            html += renderSchemaTreeView(prop.items, depth + 2, itemsId);
            html += `</div>`;
          }
        } else if (
          prop.anyOf &&
          Array.isArray(prop.anyOf) &&
          prop.anyOf.length > 0
        ) {
          // Show anyOf options
          prop.anyOf.forEach((subSchema, index) => {
            const optionId = `${currentId}_anyof_${index}`;
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
                <div class="property-description">One of the possible schemas</div>
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
 * Get schema type as string
 * @param {Object} schema - OpenAPI schema object
 * @returns {string} - Type string
 */
function getSchemaType(schema) {
  if (!schema) return "unknown";

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
  if (schema.allOf) return `allOf[${schema.allOf.length}]`;
  if (schema.$ref) return "reference";

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

  let curlCommand = `curl --request ${method} \\\n  --url '${getBaseUrl()}${path}'`;

  // Add authorization
  if (swaggerData.components && swaggerData.components.securitySchemes) {
    curlCommand += ` \\\n  --header 'Authorization: Bearer <token>'`;
  }

  // Add content type for requests with body
  if (endpoint.requestBody) {
    curlCommand += ` \\\n  --header 'Content-Type: application/json'`;
    curlCommand += ` \\\n  --data '{}'`;
  }

  const sidebarContent = `
    <div class="space-y-6">
      <div class="code-block">
        <div class="code-header">
          <span class="code-header-title">${
            endpoint.summary || endpoint.operationId
          }</span>
          <div class="code-header-icons">
            <span class="text-gray-400-custom text-sm">cURL</span>
            <span class="material-icons text-gray-400-custom cursor-pointer text-sm" onclick="copyToClipboard(\`${curlCommand.replace(
              /`/g,
              "\\`"
            )}\`)" title="Copy cURL command">content_copy</span>
          </div>
        </div>
        <pre class="code-content"><code>${curlCommand}</code></pre>
      </div>
      ${Object.keys(endpoint.responses || {})
        .map((statusCode) => {
          const response = endpoint.responses[statusCode];
          const content =
            response.content && response.content["application/json"];
          const isSuccess = statusCode.startsWith("2");
          return `
          <div class="code-block">
            <div class="code-header">
              <div class="flex items-center gap-2">
                <span class="bg-${
                  isSuccess ? "green" : "red"
                }-600 text-white text-sm font-semibold px-2 py-1 rounded">${statusCode}</span>
                <span class="code-header-title">${
                  response.description || "Response"
                }</span>
              </div>
              <div class="code-header-icons">
                <span class="material-icons text-gray-400-custom cursor-pointer text-sm" onclick="copyToClipboard(\`${
                  content
                    ? JSON.stringify(
                        generateSchemaExample(content.schema),
                        null,
                        2
                      ).replace(/`/g, "\\`")
                    : "No content"
                }\`)" title="Copy response">content_copy</span>
              </div>
            </div>
            <pre class="code-content"><code class="language-json">${
              content
                ? hljs.highlight(
                    JSON.stringify(
                      generateSchemaExample(content.schema),
                      null,
                      2
                    ),
                    { language: "json" }
                  ).value
                : "No content available"
            }</code></pre>
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
    iconElement.style.color = "#10b981";

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
 * Handle browser back/forward buttons
 */
window.addEventListener("popstate", function (event) {
  const hash = window.location.hash.substring(1);
  if (hash && swaggerData) {
    loadEndpointFromHash(hash);
  }
});
