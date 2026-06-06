function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, limit = 180) {
  const text = cleanText(value);
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit - 1)}…`;
}

function isVisible(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity) === 0
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function findLabelForField(field) {
  if (field.id) {
    const linkedLabel = document.querySelector(`label[for="${CSS.escape(field.id)}"]`);
    if (linkedLabel) {
      return truncate(linkedLabel.textContent);
    }
  }

  const wrappingLabel = field.closest("label");
  if (wrappingLabel) {
    return truncate(wrappingLabel.textContent);
  }

  const ariaLabel = field.getAttribute("aria-label");
  if (ariaLabel) {
    return truncate(ariaLabel);
  }

  const labelledBy = field.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelNode = document.getElementById(labelledBy);
    if (labelNode) {
      return truncate(labelNode.textContent);
    }
  }

  if (field.placeholder) {
    return truncate(field.placeholder);
  }

  return truncate(field.name || field.id || field.tagName.toLowerCase());
}

function findHelperText(field) {
  const describedBy = field.getAttribute("aria-describedby");
  if (describedBy) {
    const helperNode = document.getElementById(describedBy);
    if (helperNode) {
      return truncate(helperNode.textContent, 220);
    }
  }

  const nearbyText = field
    .closest("div, section, li, td, fieldset")
    ?.querySelector("small, .hint, .help, .helper-text, .description");

  if (nearbyText) {
    return truncate(nearbyText.textContent, 220);
  }

  return "";
}

function extractFields() {
  const fields = [...document.querySelectorAll("input, select, textarea")]
    .filter((field) => isVisible(field))
    .filter((field) => !["hidden", "password", "submit", "reset", "button"].includes(field.type))
    .slice(0, 20)
    .map((field) => ({
      label: findLabelForField(field),
      type: field.tagName.toLowerCase() === "input" ? field.type || "text" : field.tagName.toLowerCase(),
      required:
        field.required ||
        field.getAttribute("aria-required") === "true" ||
        /\*/.test(findLabelForField(field)),
      helperText: findHelperText(field)
    }))
    .filter((field) => field.label);

  return fields;
}

function extractList(selector, limit = 8) {
  return [...document.querySelectorAll(selector)]
    .filter((node) => isVisible(node))
    .map((node) => truncate(node.textContent))
    .filter(Boolean)
    .slice(0, limit);
}

function extractButtons() {
  return [...document.querySelectorAll("button, input[type='submit'], input[type='button']")]
    .filter((button) => isVisible(button))
    .map((button) => truncate(button.textContent || button.value))
    .filter(Boolean)
    .slice(0, 8);
}

function extractErrors() {
  const candidates = [
    ...document.querySelectorAll(
      "[role='alert'], [aria-invalid='true'], .error, .errors, .invalid, .validation-message"
    )
  ];

  return candidates
    .filter((node) => isVisible(node))
    .map((node) => truncate(node.textContent, 240))
    .filter(Boolean)
    .slice(0, 8);
}

function extractCurrentStep() {
  const explicitStep = document.querySelector(
    "[aria-current='step'], .step.active, .steps .active, .progress .active"
  );

  if (explicitStep && isVisible(explicitStep)) {
    return truncate(explicitStep.textContent);
  }

  const heading = document.querySelector("main h1, h1, main h2, h2");
  if (heading && isVisible(heading)) {
    return truncate(heading.textContent);
  }

  return "";
}

function buildPageContext() {
  const headings = extractList("h1, h2, h3", 10);
  const helperText = extractList("small, .hint, .help, .helper-text, .description", 10);

  return {
    url: window.location.href,
    title: truncate(document.title, 220),
    currentStep: extractCurrentStep(),
    headings,
    sections: headings.slice(0, 6),
    breadcrumbs: extractList("nav[aria-label='breadcrumb'] a, .breadcrumb li, .breadcrumbs li", 6),
    fields: extractFields(),
    buttons: extractButtons(),
    errors: extractErrors(),
    helperText,
    capturedAt: new Date().toISOString()
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "PING") {
    sendResponse({ ok: true });
    return;
  }

  if (message?.type === "GET_PAGE_CONTEXT") {
    sendResponse({
      ok: true,
      pageContext: buildPageContext()
    });
  }
});

