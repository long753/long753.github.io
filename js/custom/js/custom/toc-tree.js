(() => {
  // <stdin>
  (() => {
    "use strict";
    function enhanceTree(nav, treeIndex) {
      const branches = [];
      const byItem = /* @__PURE__ */ new Map();
      const manuallyOpened = /* @__PURE__ */ new Set();
      const manuallyClosed = /* @__PURE__ */ new Set();
      let activeLink;
      nav.querySelectorAll("li").forEach((item) => {
        const link = Array.from(item.children).find((child) => child.tagName === "A");
        const list = Array.from(item.children).find(
          (child) => child.tagName === "UL" || child.tagName === "OL"
        );
        if (!link || !list) return;
        const row = document.createElement("div");
        row.className = "toc-tree-row";
        link.before(row);
        row.append(link);
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "toc-tree-toggle";
        toggle.setAttribute("aria-label", link.textContent.trim());
        list.id = list.id || `toc-tree-${treeIndex}-branch-${branches.length}`;
        list.dataset.tocBranchList = "";
        toggle.setAttribute("aria-controls", list.id);
        row.append(toggle);
        const branch = { item, list, toggle };
        branches.push(branch);
        byItem.set(item, branch);
        toggle.addEventListener("click", (event) => {
          event.stopPropagation();
          if (list.hidden) {
            manuallyOpened.add(branch);
            manuallyClosed.delete(branch);
          } else {
            manuallyOpened.delete(branch);
            manuallyClosed.add(branch);
          }
          render();
        });
      });
      if (!branches.length) return;
      function pathFor(link) {
        const path = /* @__PURE__ */ new Set();
        let item = link ? link.closest("li") : null;
        while (item && nav.contains(item)) {
          const branch = byItem.get(item);
          if (branch) path.add(branch);
          item = item.parentElement.closest("li");
        }
        return path;
      }
      function render() {
        const currentPath = pathFor(activeLink);
        branches.forEach((branch) => {
          const expanded = manuallyOpened.has(branch) || currentPath.has(branch) && !manuallyClosed.has(branch);
          branch.list.hidden = !expanded;
          branch.toggle.setAttribute("aria-expanded", String(expanded));
        });
      }
      function syncActive() {
        const next = nav.querySelector("a.active");
        if (next === activeLink) return;
        activeLink = next;
        manuallyClosed.clear();
        render();
      }
      nav.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!link || !nav.contains(link)) return;
        pathFor(link).forEach((branch) => {
          manuallyOpened.add(branch);
          manuallyClosed.delete(branch);
        });
        render();
      });
      syncActive();
      if (!activeLink && window.location.hash) {
        const target = Array.from(nav.querySelectorAll("a")).find(
          (link) => link.hash === window.location.hash
        );
        pathFor(target).forEach((branch) => manuallyOpened.add(branch));
        render();
      }
      const observer = new MutationObserver(syncActive);
      observer.observe(nav, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      });
    }
    function initialize() {
      document.querySelectorAll("#toc-container nav#TableOfContents").forEach(enhanceTree);
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
      initialize();
    }
  })();
})();
