(() => {
  "use strict";

  const clock = document.getElementById("clock");
  const date = document.getElementById("date");
  const servicesRoot = document.getElementById("services");
  const projectsRoot = document.getElementById("projects");
  const summary = document.getElementById("service-summary");

  const updateClock = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour12: false });
    date.textContent = now.toLocaleDateString([], {
      weekday: "short", year: "numeric", month: "short", day: "numeric"
    });
  };

  const safeHttpUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const parsed = new URL(value, window.location.href);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
    } catch {
      return null;
    }
  };

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };

  const renderService = (service) => {
    const href = safeHttpUrl(service.url);
    const card = element(href ? "a" : "article", `card${href ? "" : " is-disabled"}`);
    if (href) {
      card.href = href;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.setAttribute("aria-label", `${service.name} (opens in a new tab)`);
    }

    const top = element("div", "card-top");
    top.append(element("span", "service-icon", service.icon || "◇"));
    const accessLabel = service.access === "public" ? "Public" : "Private";
    const tag = element("span", `tag ${service.access === "public" ? "public" : "private"}`, accessLabel);
    top.append(tag);
    card.append(top);

    card.append(element("h4", "", service.name || "Unnamed service"));
    card.append(element("p", "", service.description || ""));

    const meta = element("div", "card-meta");
    const endpoint = href
      ? "Open service"
      : (service.url ? "Invalid URL" : (service.access === "public" ? "Public URL not set" : "Link not configured"));
    meta.append(element("span", "", endpoint));
    if (service.port !== null && service.port !== undefined) {
      meta.append(element("span", "", `· Port ${service.port}`));
    }
    card.append(meta);

    if (service.note) {
      const note = element("p", "");
      note.style.marginTop = "8px";
      note.textContent = service.note;
      card.append(note);
    }
    return card;
  };

  const renderServices = (machines) => {
    servicesRoot.replaceChildren();
    let total = 0;
    let linked = 0;

    machines.forEach((machine) => {
      const enabledServices = (machine.services || []).filter((service) => service.enabled !== false);
      if (!enabledServices.length) return;
      total += enabledServices.length;
      linked += enabledServices.filter((service) => safeHttpUrl(service.url)).length;

      const section = element("section", "machine-section");
      section.setAttribute("aria-label", `${machine.name} services`);
      const heading = element("div", "machine-heading");
      heading.append(element("h4", "", machine.name));
      const hostText = machine.host ? machine.host : (machine.description || "Host not configured");
      heading.append(element("span", "", hostText));
      section.append(heading);

      const grid = element("div", "grid");
      enabledServices.forEach((service) => grid.append(renderService(service)));
      section.append(grid);
      servicesRoot.append(section);
    });

    summary.textContent = `${total} services · ${linked} links configured`;
    if (!total) servicesRoot.append(element("p", "empty-state", "No enabled services are configured."));
  };

  const renderProjects = (projects) => {
    projectsRoot.replaceChildren();
    (projects || []).filter((project) => project.enabled !== false).forEach((project) => {
      const href = safeHttpUrl(project.url);
      const item = element(href ? "a" : "div", `project-link${href ? "" : " is-disabled"}`);
      if (href) {
        item.href = href;
        item.target = "_blank";
        item.rel = "noopener noreferrer";
      }
      const copy = element("span", "");
      copy.append(element("strong", "", project.name || "Unnamed project"));
      copy.append(element("small", "", project.description || (href ? "Open project" : "URL not configured")));
      item.append(copy);
      item.append(element("span", "arrow", href ? "↗" : "—"));
      projectsRoot.append(item);
    });
  };

  const showLoadError = () => {
    servicesRoot.replaceChildren(element("p", "empty-state error-state",
      "Could not load the service configuration. Check that config/services.json is deployed alongside this page."));
    projectsRoot.replaceChildren();
    summary.textContent = "Directory unavailable";
  };

  updateClock();
  window.setInterval(updateClock, 1000);

  fetch("./config/services.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Configuration request failed: ${response.status}`);
      return response.json();
    })
    .then((config) => {
      if (!config || !Array.isArray(config.machines)) throw new Error("Invalid service configuration");
      renderServices(config.machines);
      renderProjects(config.projects || []);
    })
    .catch((error) => {
      console.error(error);
      showLoadError();
    });
})();
