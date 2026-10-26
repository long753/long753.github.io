(() => {
  // ns-hugo-imp:/home/long753/projects/personal/my-site/themes/hugo-narrow/assets/js/clipboard.js
  async function copyText(text) {
    if (!navigator.clipboard?.writeText || !window.isSecureContext) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      return false;
    }
  }

  // ns-hugo-imp:/home/long753/projects/personal/my-site/themes/hugo-narrow/assets/js/codeblock.js
  var COPY_FEEDBACK_MS = 2e3;
  var copyTimers = /* @__PURE__ */ new WeakMap();
  function getCodeBlocks(root = document) {
    return [...root.querySelectorAll("[data-code-block]")];
  }
  function countSourceLines(block) {
    const sourceNode = block.querySelector("[data-code-source]");
    const sourceText = sourceNode?.textContent ?? "";
    if (!sourceText) return 0;
    return sourceText.split("\n").length;
  }
  function shouldAutoCollapse(block) {
    const autoCollapseLines = Number.parseInt(block.dataset.autoCollapseLines || "30", 10);
    const autoCollapseHeight = Number.parseInt(block.dataset.autoCollapseHeight || "400", 10);
    const renderedCode = block.querySelector(
      ".code-block-content pre.chroma, .code-block-content pre"
    );
    const renderedHeight = renderedCode?.offsetHeight || 0;
    const sourceLines = countSourceLines(block);
    return sourceLines > autoCollapseLines || renderedHeight > autoCollapseHeight;
  }
  function updateCollapseButton(block, collapsed) {
    const button = block.querySelector(".collapse-code-btn");
    if (!button) return;
    const label = collapsed ? button.dataset.labelExpand : button.dataset.labelCollapse;
    const text = button.querySelector(".collapse-text");
    const chevron = button.querySelector(".collapse-chevron");
    if (text) text.textContent = label || "";
    if (chevron) chevron.classList.toggle("rotate-180", !collapsed);
    button.title = label || "";
    button.setAttribute("aria-label", label || "");
    button.setAttribute("aria-expanded", String(!collapsed));
  }
  function updateCollapseOverlay(block, collapsed) {
    const overlay = block.querySelector(".collapse-overlay");
    if (!overlay) return;
    overlay.hidden = !collapsed;
    overlay.classList.toggle("pointer-events-none", !collapsed);
    overlay.classList.toggle("opacity-0", !collapsed);
    overlay.classList.toggle("pointer-events-auto", collapsed);
    overlay.classList.toggle("opacity-100", collapsed);
  }
  function setCollapsed(block, collapsed, { animate = true } = {}) {
    const content = block.querySelector(".code-block-content");
    if (!content) return;
    const collapsedHeight = Number.parseInt(block.dataset.collapsedHeight || "120", 10);
    block.dataset.collapsed = String(collapsed);
    content.style.transition = animate ? "max-height 0.3s ease-out" : "";
    content.style.maxHeight = collapsed ? `${collapsedHeight}px` : "";
    content.style.overflow = collapsed ? "hidden" : "";
    updateCollapseButton(block, collapsed);
    updateCollapseOverlay(block, collapsed);
    if (animate) {
      window.setTimeout(() => {
        content.style.transition = "";
      }, 300);
    }
  }
  function initCollapsibleBlocks(root = document) {
    getCodeBlocks(root).forEach((block) => {
      if (block.dataset.collapsible !== "true") return;
      const defaultState = block.dataset.defaultState || "expanded";
      const collapsedAttr = block.dataset.collapsed === "true";
      const startCollapsed = collapsedAttr || defaultState === "collapsed" || shouldAutoCollapse(block);
      setCollapsed(block, startCollapsed, { animate: false });
    });
  }
  function getCodeSource(block) {
    const sourceNode = block.querySelector("[data-code-source]");
    return sourceNode?.textContent ?? "";
  }
  function setCopyFeedback(button, copied) {
    const text = button.querySelector(".copy-text");
    const label = copied ? button.dataset.labelCopied : button.dataset.labelCopy;
    if (text) text.textContent = label || "";
    button.classList.toggle("text-green-600", copied);
    button.title = label || "";
    button.setAttribute("aria-label", label || "");
  }
  async function handleCopy(button) {
    const block = button.closest("[data-code-block]");
    if (!block) return;
    const copied = await copyText(getCodeSource(block));
    if (!copied) return;
    setCopyFeedback(button, true);
    const previousTimer = copyTimers.get(button);
    if (previousTimer) {
      window.clearTimeout(previousTimer);
    }
    const timer = window.setTimeout(() => {
      setCopyFeedback(button, false);
      copyTimers.delete(button);
    }, COPY_FEEDBACK_MS);
    copyTimers.set(button, timer);
  }
  function handleCodeBlockClick(event) {
    const copyButton = event.target.closest(".copy-code-btn[data-code-action='copy']");
    if (copyButton) {
      event.preventDefault();
      handleCopy(copyButton);
      return;
    }
    const collapseButton = event.target.closest(
      ".collapse-code-btn[data-code-action='toggle-collapse']"
    );
    if (collapseButton) {
      event.preventDefault();
      const block = collapseButton.closest("[data-code-block]");
      if (!block) return;
      const isCollapsed = block.dataset.collapsed === "true";
      setCollapsed(block, !isCollapsed);
      return;
    }
    const expandButton = event.target.closest(".collapse-overlay-btn[data-code-action='expand']");
    if (expandButton) {
      event.preventDefault();
      const block = expandButton.closest("[data-code-block]");
      if (!block) return;
      setCollapsed(block, false);
    }
  }
  var initialized = false;
  function initCodeBlocks(root = document) {
    if (initialized) return;
    initialized = true;
    initCollapsibleBlocks(root);
    document.addEventListener("click", handleCodeBlockClick);
  }

  // ns-hugo-imp:/home/long753/projects/personal/my-site/themes/hugo-narrow/assets/js/tabs.js
  var NAV_SHELL_CLASS = "tabs-nav-shell overflow-x-auto px-2 pt-2 pb-1 sm:px-3 sm:pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  var NAV_CLASS = "tabs-nav inline-flex min-w-max items-center gap-1 rounded-xl border border-border bg-background/70 p-1 shadow-sm text-muted-foreground";
  var TRIGGER_BASE_CLASS = "tabs-trigger inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-[color,background-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";
  var TRIGGER_ACTIVE_CLASS = "bg-primary/10 text-primary shadow-xs";
  var TRIGGER_INACTIVE_CLASS = "text-muted-foreground hover:bg-primary/10 hover:text-primary";
  function getTabWrappers(root = document) {
    return [...root.querySelectorAll("[data-tabs]")];
  }
  function getTabButtons(wrapper) {
    return [...wrapper.querySelectorAll(".tabs-trigger[role='tab']")];
  }
  function getTabPanels(wrapper) {
    return [...wrapper.querySelectorAll(".tabs-panel[data-tabs-panel][role='tabpanel']")];
  }
  function getPanelsContainer(wrapper) {
    return wrapper.querySelector(".tabs-panels");
  }
  function buildTabNav(wrapper) {
    const panels = getTabPanels(wrapper);
    if (panels.length === 0) return [];
    wrapper.querySelector(".tabs-nav-shell")?.remove();
    const navShell = document.createElement("div");
    navShell.className = NAV_SHELL_CLASS;
    const nav = document.createElement("div");
    nav.className = NAV_CLASS;
    nav.setAttribute("role", "tablist");
    const wrapperId = wrapper.id || `tabs-${Math.random().toString(36).slice(2, 8)}`;
    wrapper.id = wrapperId;
    panels.forEach((panel, index) => {
      const panelId = panel.id || `${wrapperId}-panel-${index}`;
      const buttonId = `${wrapperId}-tab-${index}`;
      const label = panel.dataset.tabLabel || `Tab ${index + 1}`;
      panel.id = panelId;
      panel.setAttribute("aria-labelledby", buttonId);
      const button = document.createElement("button");
      button.id = buttonId;
      button.className = `${TRIGGER_BASE_CLASS} ${TRIGGER_INACTIVE_CLASS}`;
      button.type = "button";
      button.setAttribute("role", "tab");
      button.dataset.tabTarget = panelId;
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-selected", "false");
      button.tabIndex = -1;
      button.textContent = label;
      nav.append(button);
    });
    navShell.append(nav);
    const panelsContainer = getPanelsContainer(wrapper);
    if (panelsContainer) {
      panelsContainer.before(navShell);
    } else {
      wrapper.prepend(navShell);
    }
    return getTabButtons(wrapper);
  }
  function updateTriggerState(button, isActive) {
    button.classList.toggle("active", isActive);
    TRIGGER_ACTIVE_CLASS.split(" ").forEach((className) => {
      button.classList.toggle(className, isActive);
    });
    TRIGGER_INACTIVE_CLASS.split(" ").forEach((className) => {
      button.classList.toggle(className, !isActive);
    });
  }
  function activateTab(button) {
    const wrapper = button.closest("[data-tabs]");
    if (!wrapper) return;
    const targetId = button.dataset.tabTarget;
    const targetPanel = wrapper.querySelector(`#${CSS.escape(targetId)}`);
    if (!targetPanel) return;
    getTabButtons(wrapper).forEach((tabButton) => {
      const isActive = tabButton === button;
      updateTriggerState(tabButton, isActive);
      tabButton.setAttribute("aria-selected", String(isActive));
      tabButton.tabIndex = isActive ? 0 : -1;
    });
    getTabPanels(wrapper).forEach((panel) => {
      const isActive = panel === targetPanel;
      panel.hidden = !isActive;
    });
  }
  function focusAdjacentTab(currentButton, direction) {
    const wrapper = currentButton.closest("[data-tabs]");
    if (!wrapper) return;
    const buttons = getTabButtons(wrapper);
    const currentIndex = buttons.indexOf(currentButton);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
    const nextButton = buttons[nextIndex];
    if (!nextButton) return;
    nextButton.focus();
    activateTab(nextButton);
  }
  function handleClick(event) {
    const tabButton = event.target.closest(".tabs-trigger[role='tab']");
    if (!tabButton) return;
    event.preventDefault();
    activateTab(tabButton);
  }
  function handleKeydown(event) {
    const button = event.target.closest(".tabs-trigger[role='tab']");
    if (!button) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAdjacentTab(button, 1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAdjacentTab(button, -1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      const wrapper = button.closest("[data-tabs]");
      const firstButton = wrapper ? getTabButtons(wrapper)[0] : null;
      if (!firstButton) return;
      firstButton.focus();
      activateTab(firstButton);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const wrapper = button.closest("[data-tabs]");
      const buttons = wrapper ? getTabButtons(wrapper) : [];
      const lastButton = buttons[buttons.length - 1];
      if (!lastButton) return;
      lastButton.focus();
      activateTab(lastButton);
    }
  }
  var initialized2 = false;
  function initTabs(root = document) {
    getTabWrappers(root).forEach((wrapper) => {
      const buttons = buildTabNav(wrapper);
      const panels = getTabPanels(wrapper);
      if (buttons.length === 0 || panels.length === 0) return;
      const activeButton = buttons.find((button) => button.getAttribute("aria-selected") === "true") || buttons[0];
      activateTab(activeButton);
    });
    if (initialized2) return;
    initialized2 = true;
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
  }

  // ns-hugo-imp:/home/long753/projects/personal/my-site/themes/hugo-narrow/assets/js/ui.js
  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }
  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
    }
  }
  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (_) {
    }
  }
  function emitThemeChanged(colorScheme, theme) {
    document.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { colorScheme, theme },
        bubbles: true
      })
    );
  }
  function initAppearance() {
    const root = document.documentElement;
    const schemeInputs = [...document.querySelectorAll('input[name="color-scheme"]')];
    const modeInputs = [...document.querySelectorAll('input[name="theme-mode"]')];
    if (schemeInputs.length === 0 && modeInputs.length === 0) {
      return;
    }
    const modes = ["light", "dark", "system"];
    const currentScheme = () => readStorage("colorScheme") || root.getAttribute("data-theme") || "default";
    const currentMode = () => {
      const stored = readStorage("theme");
      return modes.includes(stored) ? stored : "system";
    };
    let colorScheme = currentScheme();
    let theme = currentMode();
    const hasScheme = (value) => schemeInputs.some((input) => input.value === value);
    if (schemeInputs.length > 0 && !hasScheme(colorScheme)) {
      colorScheme = root.getAttribute("data-theme") || "default";
    }
    const setChecked = (inputs, value) => {
      inputs.forEach((input) => {
        input.checked = input.value === value;
      });
    };
    setChecked(schemeInputs, colorScheme);
    setChecked(modeInputs, theme);
    const applyTheme = (mode, notify = true) => {
      theme = modes.includes(mode) ? mode : "system";
      const isDark = theme === "dark" || theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
      if (notify) emitThemeChanged(colorScheme, theme);
    };
    applyTheme(theme, false);
    schemeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked) return;
        colorScheme = input.value;
        writeStorage("colorScheme", colorScheme);
        root.setAttribute("data-theme", colorScheme);
        emitThemeChanged(colorScheme, theme);
      });
    });
    modeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked) return;
        writeStorage("theme", input.value);
        applyTheme(input.value);
      });
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (theme === "system") applyTheme("system");
    });
    window.addEventListener("storage", (event) => {
      if (event.key === "colorScheme") {
        colorScheme = currentScheme();
        if (schemeInputs.length > 0 && !hasScheme(colorScheme)) {
          colorScheme = root.getAttribute("data-theme") || "default";
        }
        setChecked(schemeInputs, colorScheme);
        root.setAttribute("data-theme", colorScheme);
        emitThemeChanged(colorScheme, theme);
      }
      if (event.key === "theme") {
        theme = currentMode();
        setChecked(modeInputs, theme);
        applyTheme(theme);
      }
    });
  }
  function initContentWidth() {
    const container = document.getElementById("page-container");
    const range = document.getElementById("content-width-range");
    const output = document.getElementById("content-width-value");
    const reset = document.getElementById("content-width-reset");
    if (!container || !range || !output || !reset) return;
    const min = Number(range.min);
    const max = Number(range.max);
    const clamp = (value) => Math.min(max, Math.max(min, Math.round(value)));
    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const defaultWidth = Number.parseFloat(getComputedStyle(container).maxWidth) / rootFontSize;
    const storedWidth = Number.parseInt(readStorage("contentWidth"), 10);
    const hasStoredWidth = Number.isInteger(storedWidth) && storedWidth >= min && storedWidth <= max;
    const initialWidth = hasStoredWidth ? storedWidth : defaultWidth;
    const updateControl = (value) => {
      const width = clamp(value);
      range.value = String(width);
      output.value = `${width}rem`;
      output.textContent = `${width}rem`;
      return width;
    };
    updateControl(initialWidth);
    range.addEventListener("input", () => {
      updateControl(Number(range.value));
    });
    range.addEventListener("change", () => {
      const width = updateControl(Number(range.value));
      document.documentElement.style.setProperty("--content-width", `${width}rem`);
      writeStorage("contentWidth", String(width));
    });
    reset.addEventListener("click", () => {
      removeStorage("contentWidth");
      document.documentElement.style.removeProperty("--content-width");
      const configuredWidth = Number.parseFloat(getComputedStyle(container).maxWidth) / rootFontSize;
      updateControl(configuredWidth);
    });
  }
  function initPopoverState() {
    document.querySelectorAll("[popovertarget]").forEach((button) => {
      const panel = document.getElementById(button.getAttribute("popovertarget"));
      if (!panel) return;
      const sync = () => {
        const open = panel.matches(":popover-open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
      };
      panel.addEventListener("toggle", sync);
      sync();
    });
  }
  function initNavDetails() {
    const details = [...document.querySelectorAll("details.nav-details")];
    if (details.length === 0) return;
    details.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        const group = item.getAttribute("name");
        if (!group) return;
        details.forEach((other) => {
          if (other !== item && other.open && other.getAttribute("name") === group) {
            other.open = false;
          }
        });
      });
    });
    document.addEventListener("click", (event) => {
      details.forEach((item) => {
        if (item.open && !item.contains(event.target)) {
          item.open = false;
        }
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || document.querySelector("dialog[open]")) return;
      const open = details.find((item) => item.open);
      if (!open) return;
      event.preventDefault();
      open.open = false;
      open.querySelector("summary")?.focus();
    });
  }
  function initMobileNav() {
    const dialog = document.getElementById("mobile-nav");
    const open = document.getElementById("mobile-nav-open");
    const close = document.getElementById("mobile-nav-close");
    const main = dialog?.querySelector("[data-mobile-main]");
    const panels = [...dialog?.querySelectorAll("[data-mobile-panel]") || []];
    const triggers = [...dialog?.querySelectorAll("[data-mobile-target]") || []];
    if (!dialog || !open || !main) return;
    let currentPanel = null;
    let lastTrigger = null;
    const showMain = ({ restoreFocus = false } = {}) => {
      main.hidden = false;
      panels.forEach((panel) => {
        panel.hidden = true;
      });
      triggers.forEach((trigger) => {
        trigger.setAttribute("aria-expanded", "false");
      });
      currentPanel = null;
      if (restoreFocus && lastTrigger) {
        lastTrigger.focus();
      }
    };
    const showPanel = (key, trigger) => {
      const panel = panels.find((item) => item.dataset.mobilePanel === key);
      if (!panel) return;
      main.hidden = true;
      panels.forEach((item) => {
        item.hidden = item !== panel;
      });
      triggers.forEach((item) => {
        item.setAttribute("aria-expanded", item === trigger ? "true" : "false");
      });
      currentPanel = panel;
      lastTrigger = trigger;
      dialog.querySelector("[data-mobile-menu]")?.scrollTo({ top: 0 });
      panel.querySelector("[data-mobile-back]")?.focus();
    };
    open.addEventListener("click", () => {
      if (dialog.open) return;
      showMain();
      dialog.showModal();
    });
    close?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
        return;
      }
      const target = event.target.closest("[data-mobile-target]");
      if (target) {
        showPanel(target.dataset.mobileTarget, target);
        return;
      }
      if (event.target.closest("[data-mobile-back]")) {
        showMain({ restoreFocus: true });
        return;
      }
      if (event.target.closest("a[href]")) {
        dialog.close();
      }
    });
    dialog.addEventListener("cancel", (event) => {
      if (!currentPanel) return;
      event.preventDefault();
      showMain({ restoreFocus: true });
    });
    dialog.addEventListener("close", () => {
      showMain();
      lastTrigger = null;
    });
    window.matchMedia("(min-width: 768px)").addEventListener("change", (event) => {
      if (event.matches && dialog.open) dialog.close();
    });
  }
  var initialized3 = false;
  function initUI() {
    if (initialized3) return;
    initialized3 = true;
    initAppearance();
    initContentWidth();
    initPopoverState();
    initNavDetails();
    initMobileNav();
  }

  // <stdin>
  function boot() {
    initUI();
    initTabs();
    initCodeBlocks();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
