(() => {
  // <stdin>
  (() => {
    "use strict";
    const COMMANDS = /* @__PURE__ */ new Set([
      "help",
      "news",
      "projects",
      "publications",
      "posts",
      "contact",
      "clear"
    ]);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function scrollToLatest(scroll, smooth = false) {
      scroll.scrollTo({
        top: scroll.scrollHeight,
        behavior: smooth && !reducedMotion.matches ? "smooth" : "instant"
      });
    }
    function appendCommand(log, promptText, command) {
      const entry = document.createElement("div");
      entry.className = command ? "terminal__entry terminal__entry--new" : "terminal__entry terminal__entry--blank";
      const commandLine = document.createElement("div");
      commandLine.className = "terminal__command-line";
      const prompt = document.createElement("span");
      prompt.className = "terminal__prompt";
      prompt.textContent = promptText;
      commandLine.append(prompt, document.createTextNode(" $ "));
      if (command) {
        const submittedCommand = document.createElement("span");
        submittedCommand.className = "terminal__command";
        submittedCommand.textContent = command;
        commandLine.append(submittedCommand);
      }
      entry.append(commandLine);
      let result = null;
      if (command) {
        result = document.createElement("div");
        result.className = "terminal__result";
        entry.append(result);
      }
      log.append(entry);
      return result;
    }
    function initializeTerminal(root) {
      const scroll = root.querySelector("[data-terminal-scroll]");
      const log = root.querySelector("[data-terminal-log]");
      const form = root.querySelector("[data-terminal-form]");
      const input = root.querySelector("[data-terminal-input]");
      const prompt = root.querySelector("[data-terminal-prompt]");
      if (!scroll || !log || !form || !input || !prompt) {
        return;
      }
      const promptText = prompt.textContent.trim();
      const unknownMessage = root.getAttribute("data-terminal-unknown") || "";
      const templates = /* @__PURE__ */ new Map();
      COMMANDS.forEach((command) => {
        if (command === "clear") {
          return;
        }
        const template = root.querySelector(
          `template[data-terminal-command="${command}"]`
        );
        if (template) {
          templates.set(command, template);
        }
      });
      scrollToLatest(scroll);
      function focusInput() {
        input.focus({ preventScroll: true });
      }
      root.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0) {
          return;
        }
        const target = event.target;
        if (!(target instanceof Element) || target.closest("a, button, input, textarea, select, label")) {
          return;
        }
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          return;
        }
        focusInput();
        scrollToLatest(scroll);
      });
      function runCommand(value) {
        const command = value.trim();
        input.value = "";
        if (!command) {
          appendCommand(log, promptText, "");
          scrollToLatest(scroll, true);
          return;
        }
        const normalizedCommand = command.toLowerCase();
        if (normalizedCommand === "clear") {
          log.replaceChildren();
          scrollToLatest(scroll);
          return;
        }
        const result = appendCommand(log, promptText, command);
        const template = COMMANDS.has(normalizedCommand) ? templates.get(normalizedCommand) : null;
        if (template) {
          result.append(template.content.cloneNode(true));
        } else {
          const unknown = document.createElement("p");
          unknown.className = "terminal__hint";
          unknown.textContent = unknownMessage;
          result.append(unknown);
        }
        scrollToLatest(scroll, true);
      }
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        runCommand(input.value);
        focusInput();
      });
      root.querySelectorAll("button[data-terminal-run]").forEach((button) => {
        button.addEventListener("click", () => {
          runCommand(button.getAttribute("data-terminal-run") || "");
          focusInput();
        });
      });
    }
    function initialize() {
      document.querySelectorAll("[data-home-terminal]").forEach(initializeTerminal);
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
      initialize();
    }
  })();
})();
