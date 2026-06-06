function summarizePageContext(pageContext = {}) {
  return {
    url: pageContext.url ?? "",
    title: pageContext.title ?? "",
    currentStep: pageContext.currentStep ?? "",
    headings: Array.isArray(pageContext.headings) ? pageContext.headings.slice(0, 8) : [],
    breadcrumbs: Array.isArray(pageContext.breadcrumbs)
      ? pageContext.breadcrumbs.slice(0, 6)
      : [],
    sections: Array.isArray(pageContext.sections) ? pageContext.sections.slice(0, 8) : [],
    fields: Array.isArray(pageContext.fields)
      ? pageContext.fields.slice(0, 12).map((field) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          helperText: field.helperText
        }))
      : [],
    buttons: Array.isArray(pageContext.buttons) ? pageContext.buttons.slice(0, 8) : [],
    errors: Array.isArray(pageContext.errors) ? pageContext.errors.slice(0, 8) : [],
    helperText: Array.isArray(pageContext.helperText)
      ? pageContext.helperText.slice(0, 10)
      : []
  };
}

export function buildPrompt({ question, language, pageContext, guide }) {
  const languageName =
    language === "hi" ? "Hindi" : language === "bn" ? "Bengali" : "English";

  const instructions = [
    "You are a privacy-first website guidance assistant.",
    "Only provide read-only guidance.",
    "Do not tell the user that you filled, submitted, or edited anything.",
    "Do not ask the user to share secrets, passwords, OTPs, bank data, or full identity numbers.",
    "Use the visible page context as the primary source of truth.",
    "If a curated site guide exists, use it as a trust anchor.",
    "If the page context is incomplete, say you are unsure and ask the user to verify against the official site before final submission.",
    `Reply in ${languageName}.`,
    "Keep the answer short, practical, and step-by-step.",
    "When useful, explain unfamiliar official terms in plain language.",
    "Format the answer in clean markdown.",
    "Use a short bold title when helpful, followed by numbered steps or bullet points.",
    "Do not use markdown tables unless the user explicitly asks for a table.",
    "If web information is available, cite official sources using markdown links."
  ];

  const guideContext = guide
    ? {
        name: guide.name,
        summary: guide.summary,
        tips: guide.tips ?? [],
        sources: guide.sources ?? []
      }
    : null;

  return [
    instructions.join("\n"),
    `User question:\n${question}`,
    `Page context:\n${JSON.stringify(summarizePageContext(pageContext), null, 2)}`,
    `Curated guide:\n${JSON.stringify(guideContext, null, 2)}`
  ].join("\n\n");
}

export function buildFallbackAnswer({ question, language, pageContext, guide }) {
  const introByLanguage = {
    en: "Here is a read-only guide based on the page I can see:",
    hi: "दिख रहे पेज के आधार पर यह केवल मार्गदर्शन है:",
    bn: "দেখা যাচ্ছে এমন পেজের ভিত্তিতে এটি শুধু নির্দেশনা:"
  };

  const verifyByLanguage = {
    en: "Please verify the final details on the official site before submitting anything.",
    hi: "अंतिम सबमिट करने से पहले कृपया आधिकारिक साइट पर विवरण एक बार जांच लें।",
    bn: "কিছু সাবমিট করার আগে অনুগ্রহ করে অফিসিয়াল সাইটে শেষ তথ্য মিলিয়ে নিন।"
  };

  const lines = [`**${introByLanguage[language] ?? introByLanguage.en}**`];

  if (pageContext.title) {
    lines.push(`Page: ${pageContext.title}`);
  }

  if (pageContext.currentStep) {
    lines.push(`Current step: ${pageContext.currentStep}`);
  } else if (pageContext.sections?.length) {
    lines.push(`Visible section: ${pageContext.sections[0]}`);
  }

  if (/document|upload|proof|certificate|attachment/i.test(question)) {
    if (pageContext.fields?.some((field) => /upload|file|document/i.test(field.label))) {
      lines.push("1. Look closely at the upload area for file format, size, and mandatory document notes.");
    } else {
      lines.push("1. I cannot confirm document requirements from the visible page alone, so check the portal's help text or official instructions.");
    }
  }

  if (/next|what should i do|step|proceed|continue/i.test(question)) {
    if (pageContext.errors?.length) {
      lines.push(`1. Resolve the visible validation message first: ${pageContext.errors[0]}`);
    } else if (pageContext.fields?.length) {
      const requiredFields = pageContext.fields.filter((field) => field.required);
      if (requiredFields.length) {
        lines.push(
          `1. Complete the required fields in this section first, such as: ${requiredFields
            .slice(0, 3)
            .map((field) => field.label)
            .join(", ")}.`
        );
      } else {
        lines.push("1. Read the current section labels carefully and then use the primary action button shown on the page.");
      }
    }
  }

  if (/what is|explain|meaning|field/i.test(question) && pageContext.fields?.length) {
    const matchingField = pageContext.fields.find((field) =>
      question.toLowerCase().includes(field.label.toLowerCase())
    );

    if (matchingField) {
      lines.push(
        `1. ${matchingField.label} appears to be a ${matchingField.required ? "required " : ""}${matchingField.type} field${matchingField.helperText ? ` with helper text: ${matchingField.helperText}` : "."}`
      );
    }
  }

  if (guide?.tips?.length) {
    lines.push(`**Quick tip:** ${guide.tips[0]}`);
  }

  lines.push(verifyByLanguage[language] ?? verifyByLanguage.en);
  return lines.join("\n");
}
