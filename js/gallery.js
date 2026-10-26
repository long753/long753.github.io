(() => {
  // ns-hugo-imp:/home/long753/projects/personal/my-site/themes/hugo-narrow/assets/js/gallery-lightbox.js
  var GalleryLightbox = class {
    constructor(config = {}) {
      this.config = {
        showCaption: config.showCaption !== false
      };
      this.galleries = /* @__PURE__ */ new Map();
      this.currentGalleryId = null;
      this.currentIndex = 0;
      this.isOpen = false;
      this.lastActiveElement = null;
      this.handleKeydown = this.handleKeydown.bind(this);
      this.elements = this.createElements();
    }
    registerGallery(galleryId, items = []) {
      if (!galleryId || !Array.isArray(items) || items.length === 0) {
        return;
      }
      this.galleries.set(galleryId, items);
    }
    open(galleryId, index = 0, options = {}) {
      const items = this.galleries.get(galleryId);
      if (!items || items.length === 0) {
        return;
      }
      this.currentGalleryId = galleryId;
      this.currentIndex = Math.max(0, Math.min(index, items.length - 1));
      this.lastActiveElement = options.triggerElement || document.activeElement;
      if (!this.elements.root.isConnected) {
        document.body.appendChild(this.elements.root);
      }
      this.render();
      this.elements.root.hidden = false;
      this.elements.root.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("gallery-lightbox-open");
      document.body.classList.add("gallery-lightbox-open");
      document.addEventListener("keydown", this.handleKeydown);
      requestAnimationFrame(() => {
        this.elements.root.classList.add("is-open");
        this.elements.close.focus({ preventScroll: true });
      });
      this.isOpen = true;
    }
    close() {
      if (!this.isOpen) {
        return;
      }
      this.isOpen = false;
      this.elements.root.classList.remove("is-open");
      this.elements.root.hidden = true;
      this.elements.root.setAttribute("aria-hidden", "true");
      this.elements.image.removeAttribute("src");
      this.elements.caption.innerHTML = "";
      document.documentElement.classList.remove("gallery-lightbox-open");
      document.body.classList.remove("gallery-lightbox-open");
      document.removeEventListener("keydown", this.handleKeydown);
      if (this.lastActiveElement && this.lastActiveElement.isConnected && typeof this.lastActiveElement.focus === "function") {
        this.lastActiveElement.focus({ preventScroll: true });
      }
      this.lastActiveElement = null;
    }
    showPrevious() {
      if (this.currentIndex === 0) {
        return;
      }
      this.currentIndex -= 1;
      this.render();
    }
    showNext() {
      const items = this.getCurrentItems();
      if (this.currentIndex >= items.length - 1) {
        return;
      }
      this.currentIndex += 1;
      this.render();
    }
    getCurrentItems() {
      return this.galleries.get(this.currentGalleryId) || [];
    }
    render() {
      const items = this.getCurrentItems();
      const item = items[this.currentIndex];
      if (!item) {
        return;
      }
      const hasCaption = this.config.showCaption && Boolean(item.captionHTML);
      const isSingleItem = items.length <= 1;
      this.elements.image.src = item.src;
      this.elements.image.alt = item.alt || "";
      this.elements.counter.textContent = String(this.currentIndex + 1) + " / " + String(items.length);
      this.elements.caption.innerHTML = hasCaption ? item.captionHTML : "";
      this.elements.overlay.dataset.hasCaption = hasCaption ? "true" : "false";
      this.elements.previous.hidden = isSingleItem;
      this.elements.next.hidden = isSingleItem;
      this.elements.previous.disabled = isSingleItem || this.currentIndex === 0;
      this.elements.next.disabled = isSingleItem || this.currentIndex === items.length - 1;
    }
    createElements() {
      const root = document.createElement("div");
      root.className = "gallery-lightbox";
      root.hidden = true;
      root.setAttribute("aria-hidden", "true");
      root.innerHTML = [
        '<div class="gallery-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Image viewer">',
        '  <button type="button" class="gallery-lightbox__close" aria-label="Close image viewer">&times;</button>',
        '  <button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--prev" aria-label="Previous image">',
        '    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
        '      <path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />',
        "    </svg>",
        "  </button>",
        '  <div class="gallery-lightbox__viewport">',
        '    <div class="gallery-lightbox__media">',
        '      <div class="gallery-lightbox__stage">',
        '        <img class="gallery-lightbox__image" alt="" />',
        "      </div>",
        '      <div class="gallery-lightbox__overlay" data-has-caption="false">',
        '        <div class="gallery-lightbox__caption-bubble">',
        '          <div class="gallery-lightbox__caption"></div>',
        "        </div>",
        '        <span class="gallery-lightbox__counter" aria-live="polite"></span>',
        "      </div>",
        "    </div>",
        "  </div>",
        '  <button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--next" aria-label="Next image">',
        '    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
        '      <path d="M9.5 5.5L16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />',
        "    </svg>",
        "  </button>",
        "</div>"
      ].join("");
      const dialog = root.querySelector(".gallery-lightbox__dialog");
      const close = root.querySelector(".gallery-lightbox__close");
      const previous = root.querySelector(".gallery-lightbox__nav--prev");
      const next = root.querySelector(".gallery-lightbox__nav--next");
      dialog.addEventListener("click", (event) => {
        if (!event.target.closest(".gallery-lightbox__media") && !event.target.closest(".gallery-lightbox__nav") && !event.target.closest(".gallery-lightbox__close")) {
          this.close();
        }
      });
      close.addEventListener("click", () => this.close());
      previous.addEventListener("click", () => this.showPrevious());
      next.addEventListener("click", () => this.showNext());
      return {
        root,
        dialog,
        close,
        previous,
        next,
        image: root.querySelector(".gallery-lightbox__image"),
        counter: root.querySelector(".gallery-lightbox__counter"),
        caption: root.querySelector(".gallery-lightbox__caption"),
        overlay: root.querySelector(".gallery-lightbox__overlay")
      };
    }
    handleKeydown(event) {
      if (!this.isOpen) {
        return;
      }
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      const activeElement = document.activeElement;
      const isTypingTarget = activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.isContentEditable || activeElement.tagName === "SELECT");
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
        return;
      }
      if (isTypingTarget) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.showPrevious();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.showNext();
      }
    }
    destroy() {
      this.close();
      this.galleries.clear();
      if (this.elements.root.isConnected) {
        this.elements.root.remove();
      }
    }
  };
  var gallery_lightbox_default = GalleryLightbox;

  // ns-hugo-imp:/home/long753/projects/personal/my-site/themes/hugo-narrow/assets/js/lib/smart-gallery.js
  function t(t2) {
    let e2 = 0;
    for (const i2 of t2) {
      const t3 = Math.round(i2.left), s2 = Math.round(i2.top), r2 = Math.round(i2.left + i2.width), n2 = Math.round(i2.top + i2.height);
      i2.left = t3, i2.top = s2, i2.width = Math.max(1, r2 - t3), i2.height = Math.max(1, n2 - s2), e2 = Math.max(e2, s2 + i2.height);
    }
    return e2;
  }
  function e(t2, { gap: e2, columnWidth: i2, columns: s2 }) {
    let r2 = s2, n2 = e2;
    if ("auto" === s2) r2 = Math.max(1, Math.floor((t2 + n2) / (i2 + n2)));
    else if (r2 > 1) {
      const e3 = Math.max(0, (t2 - r2) / (r2 - 1));
      n2 = Math.min(n2, e3);
    }
    return { gap: n2, colCount: r2, colW: (t2 - (r2 - 1) * n2) / r2 };
  }
  function i(t2, e2) {
    return t2.height === e2.height ? t2.colIndex < e2.colIndex : t2.height < e2.height;
  }
  function s(t2, e2) {
    t2.push(e2);
    let s2 = t2.length - 1;
    for (; s2 > 0; ) {
      const e3 = s2 - 1 >> 1;
      if (!i(t2[s2], t2[e3])) break;
      [t2[s2], t2[e3]] = [t2[e3], t2[s2]], s2 = e3;
    }
  }
  function r(t2) {
    if (1 === t2.length) return t2.pop();
    const e2 = t2[0];
    t2[0] = t2.pop();
    let s2 = 0;
    for (; ; ) {
      const e3 = 2 * s2 + 1, r2 = e3 + 1;
      let n2 = s2;
      if (e3 < t2.length && i(t2[e3], t2[n2]) && (n2 = e3), r2 < t2.length && i(t2[r2], t2[n2]) && (n2 = r2), n2 === s2) break;
      [t2[s2], t2[n2]] = [t2[n2], t2[s2]], s2 = n2;
    }
    return e2;
  }
  var n = Object.freeze({ layout: "justified", gap: 10, targetRowHeight: 300, lastRowBehavior: "left", columnWidth: 300, columns: "auto", className: "", itemClassName: "sg-item", virtualize: true, buffer: 500, scrollContainer: "auto", placeholderColor: "#eee", errorClassName: "sg-item-error", renderItem: null, onItemClick: null, onImageLoad: null, onImageError: null });
  var o = /* @__PURE__ */ new Set(["justified", "masonry", "grid"]);
  var l = /* @__PURE__ */ new Set(["left", "center", "right", "fill", "hide"]);
  function a(t2, e2, { min: i2 = -1 / 0, exclusiveMin: s2 = false } = {}) {
    if (!Number.isFinite(t2) || (s2 ? t2 <= i2 : t2 < i2)) {
      throw new TypeError(`SmartGallery: "${e2}" \u5FC5\u987B\u662F${s2 ? `\u5927\u4E8E ${i2}` : `\u4E0D\u5C0F\u4E8E ${i2}`}\u7684\u6709\u9650\u6570\u5B57\u3002`);
    }
  }
  function h(t2 = {}) {
    if (!t2 || "object" != typeof t2 || Array.isArray(t2)) throw new TypeError("SmartGallery: options \u5FC5\u987B\u662F\u5BF9\u8C61\u3002");
    const e2 = { ...n, ...t2 };
    if (!o.has(e2.layout)) throw new TypeError(`SmartGallery: \u4E0D\u652F\u6301\u5E03\u5C40 "${e2.layout}"\u3002`);
    if (!l.has(e2.lastRowBehavior)) throw new TypeError(`SmartGallery: \u4E0D\u652F\u6301\u6700\u540E\u4E00\u884C\u884C\u4E3A "${e2.lastRowBehavior}"\u3002`);
    if (a(e2.gap, "gap", { min: 0 }), a(e2.targetRowHeight, "targetRowHeight", { min: 0, exclusiveMin: true }), a(e2.columnWidth, "columnWidth", { min: 0, exclusiveMin: true }), a(e2.buffer, "buffer", { min: 0 }), "auto" !== e2.columns && (!Number.isInteger(e2.columns) || e2.columns <= 0)) throw new TypeError('SmartGallery: "columns" \u5FC5\u987B\u662F "auto" \u6216\u6B63\u6574\u6570\u3002');
    if ("boolean" != typeof e2.virtualize) throw new TypeError('SmartGallery: "virtualize" \u5FC5\u987B\u662F\u5E03\u5C14\u503C\u3002');
    if ("auto" !== e2.scrollContainer && e2.scrollContainer !== window && (!e2.scrollContainer || e2.scrollContainer.nodeType !== Node.ELEMENT_NODE)) throw new TypeError('SmartGallery: "scrollContainer" \u5FC5\u987B\u662F "auto"\u3001window \u6216 DOM \u5143\u7D20\u3002');
    if ("string" != typeof e2.className || /\s/.test(e2.className)) throw new TypeError('SmartGallery: "className" \u5FC5\u987B\u662F\u5355\u4E2A CSS \u7C7B\u540D\u3002');
    if ("string" != typeof e2.itemClassName || 0 === e2.itemClassName.length || /\s/.test(e2.itemClassName)) throw new TypeError('SmartGallery: "itemClassName" \u5FC5\u987B\u662F\u5355\u4E2A\u975E\u7A7A CSS \u7C7B\u540D\u3002');
    if ("string" != typeof e2.placeholderColor) throw new TypeError('SmartGallery: "placeholderColor" \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002');
    if ("string" != typeof e2.errorClassName || 0 === e2.errorClassName.length || /\s/.test(e2.errorClassName)) throw new TypeError('SmartGallery: "errorClassName" \u5FC5\u987B\u662F\u5355\u4E2A\u975E\u7A7A CSS \u7C7B\u540D\u3002');
    for (const t3 of ["renderItem", "onItemClick", "onImageLoad", "onImageError"]) {
      const i2 = e2[t3];
      if (null !== i2 && "function" != typeof i2) throw new TypeError(`SmartGallery: "${t3}" \u5FC5\u987B\u662F\u51FD\u6570\u6216 null\u3002`);
    }
    return e2;
  }
  var c = class {
    constructor(t2, e2 = {}) {
      if (this.container = "string" == typeof t2 ? document.querySelector(t2) : t2, !this.container || this.container.nodeType !== Node.ELEMENT_NODE) throw new TypeError("SmartGallery: container \u5FC5\u987B\u662F\u5B58\u5728\u7684 DOM \u5143\u7D20\u6216\u6709\u6548\u9009\u62E9\u5668\u3002");
      this._options = h(e2), this._items = [], this._nextItemId = 1, this.contentNeedsReset = true, this.geometry = [], this.renderedIndices = /* @__PURE__ */ new Set(), this.mountedItemElements = /* @__PURE__ */ new Map(), this.topSortedGeometryIndices = [], this.topSortedStarts = [], this.maxGeometryHeight = 0, this.currentVisibleStartPos = -1, this.currentVisibleEndPos = -1, this.resizeObserver = null, this.scrollHandler = null, this.scrollContainer = window, this.isResizing = false, this.isDestroyed = false, this.resizeTimer = null, this.animationFrame = null, this.lastObservedWidth = this.container.clientWidth, this.originalContainerPosition = this.container.style.position, this.originalContainerHeight = this.container.style.height, this.hadSmartGalleryClass = this.container.classList.contains("smart-gallery"), this.hadCustomClass = !!this._options.className && this.container.classList.contains(this._options.className), this._init();
    }
    _init() {
      this.container.style.position = "relative", this.container.classList.add("smart-gallery"), this._options.className && this.container.classList.add(this._options.className), this.resizeObserver = new ResizeObserver(() => {
        if (this.isDestroyed || this.isResizing) return;
        const t2 = this.container.clientWidth;
        Math.abs(t2 - this.lastObservedWidth) < 1 || (this.lastObservedWidth = t2, clearTimeout(this.resizeTimer), this.resizeTimer = setTimeout(() => {
          this.resizeTimer = null, this.render();
        }, 100));
      }), this.resizeObserver.observe(this.container), this._bindScrollListener();
    }
    _getScrollParent(t2) {
      let e2 = t2.parentElement;
      for (; e2; ) {
        const t3 = window.getComputedStyle(e2).overflowY;
        if ("auto" === t3 || "scroll" === t3 || "overlay" === t3) return e2;
        e2 = e2.parentElement;
      }
      return window;
    }
    _bindScrollListener() {
      this._options.virtualize && (this.scrollContainer = "auto" === this._options.scrollContainer ? this._getScrollParent(this.container) : this._options.scrollContainer, this.scrollHandler = this._throttle(this._handleScroll.bind(this), 50), this.scrollContainer.addEventListener("scroll", this.scrollHandler, { passive: true }));
    }
    _unbindScrollListener() {
      this.scrollHandler && this.scrollContainer && (this.scrollContainer.removeEventListener("scroll", this.scrollHandler), this.scrollHandler.cancel()), this.scrollHandler = null, this.scrollContainer = window;
    }
    _normalizeItems(t2, e2 = /* @__PURE__ */ new Set()) {
      if (!Array.isArray(t2)) throw new TypeError("SmartGallery: items \u5FC5\u987B\u662F\u6570\u7EC4\u3002");
      const i2 = new Set(e2);
      for (const [e3, s3] of t2.entries()) {
        if (!s3 || "object" != typeof s3 || Array.isArray(s3)) throw new TypeError(`SmartGallery: items[${e3}] \u5FC5\u987B\u662F\u5BF9\u8C61\u3002`);
        if (null === this._options.renderItem && ("string" != typeof s3.src || 0 === s3.src.length)) throw new TypeError(`SmartGallery: \u9ED8\u8BA4\u6E32\u67D3\u8981\u6C42 items[${e3}].src \u662F\u975E\u7A7A\u5B57\u7B26\u4E32\u3002`);
        const t3 = s3.id;
        if (null != t3) {
          if ("string" != typeof t3 && "number" != typeof t3) throw new TypeError(`SmartGallery: items[${e3}].id \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u6216\u6570\u5B57\u3002`);
          if (i2.has(t3)) throw new TypeError(`SmartGallery: \u56FE\u7247 id "${t3}" \u91CD\u590D\u3002`);
          i2.add(t3);
        }
      }
      let s2 = this._nextItemId;
      const r2 = t2.map((t3) => {
        let e3 = t3.id;
        if (null == e3) {
          do {
            e3 = "sg-" + s2++;
          } while (i2.has(e3));
          i2.add(e3);
        }
        let r3 = Number(t3.aspectRatio);
        if (!Number.isFinite(r3) || r3 <= 0) {
          const e4 = Number(t3.width), i3 = Number(t3.height);
          Number.isFinite(e4) && Number.isFinite(i3) && i3 > 0 && (r3 = e4 / i3);
        }
        return (!Number.isFinite(r3) || r3 <= 0) && (r3 = 1), { ...t3, id: e3, aspectRatio: r3 };
      });
      return this._nextItemId = s2, r2;
    }
    _assertActive() {
      if (this.isDestroyed) throw new Error("SmartGallery: \u5B9E\u4F8B\u5DF2\u9500\u6BC1\u3002");
    }
    setItems(t2) {
      return this._assertActive(), this._items = this._normalizeItems(t2), this.contentNeedsReset = true, this.render(), this;
    }
    addItems(t2) {
      this._assertActive();
      const e2 = new Set(this._items.map((t3) => t3.id));
      return this._items = [...this._items, ...this._normalizeItems(t2, e2)], this.contentNeedsReset = true, this.render(), this;
    }
    removeItem(t2) {
      this._assertActive();
      const e2 = this._items.findIndex((e3) => e3.id === t2);
      return -1 !== e2 && (this._items = [...this._items.slice(0, e2), ...this._items.slice(e2 + 1)], this.contentNeedsReset = true, this.render(), true);
    }
    clear() {
      return this._assertActive(), this._items = [], this.contentNeedsReset = true, this.render(), this;
    }
    setOptions(t2) {
      if (this._assertActive(), !t2 || "object" != typeof t2 || Array.isArray(t2)) throw new TypeError("SmartGallery: setOptions(options) \u7684 options \u5FC5\u987B\u662F\u5BF9\u8C61\u3002");
      const e2 = this._options.className, i2 = h({ ...this._options, ...t2 });
      if (null === i2.renderItem) {
        const t3 = this._items.findIndex((t4) => "string" != typeof t4.src || 0 === t4.src.length);
        if (-1 !== t3) throw new TypeError(`SmartGallery: \u9ED8\u8BA4\u6E32\u67D3\u8981\u6C42 items[${t3}].src \u662F\u975E\u7A7A\u5B57\u7B26\u4E32\u3002`);
      }
      return i2.itemClassName === this._options.itemClassName && i2.renderItem === this._options.renderItem && i2.placeholderColor === this._options.placeholderColor && i2.errorClassName === this._options.errorClassName && i2.onItemClick === this._options.onItemClick || (this.contentNeedsReset = true), e2 !== i2.className && (e2 && !this.hadCustomClass && this.container.classList.remove(e2), this.hadCustomClass = !!i2.className && this.container.classList.contains(i2.className), i2.className && this.container.classList.add(i2.className)), this._unbindScrollListener(), this._options = i2, this._bindScrollListener(), this.render(), this;
    }
    getItems() {
      return this._items.map((t2) => ({ ...t2 }));
    }
    getIndex(t2) {
      return this._items.findIndex((e2) => e2.id === t2);
    }
    getItem(t2) {
      const e2 = this._items.find((e3) => e3.id === t2);
      return e2 ? { ...e2 } : null;
    }
    getGeometry(t2) {
      const e2 = this.getIndex(t2);
      if (-1 === e2) return null;
      const i2 = this.geometry[e2];
      return i2 ? { ...i2 } : null;
    }
    render() {
      if (this.isDestroyed) throw new Error("SmartGallery: \u5B9E\u4F8B\u5DF2\u9500\u6BC1\uFF0C\u4E0D\u80FD\u7EE7\u7EED\u6E32\u67D3\u3002");
      if (0 === this._items.length) return this.contentNeedsReset ? (this._resetRenderedState(), this.contentNeedsReset = false) : this._resetGeometryState(), void (this.container.style.height = "0px");
      this.isResizing = true;
      try {
        this._options = h(this._options);
        const i2 = this.container.clientWidth;
        if (!Number.isFinite(i2) || i2 <= 0) return this._resetRenderedState(), void (this.container.style.height = "0px");
        this.lastObservedWidth = i2;
        const { layout: n2 } = this._options;
        let o2, l2 = 0;
        this.contentNeedsReset ? (this._resetRenderedState(), this.contentNeedsReset = false) : this._resetGeometryState(), "justified" === n2 ? o2 = (function(e2, i3, s2) {
          const { targetRowHeight: r2, gap: n3, lastRowBehavior: o3 } = s2, l3 = [], a2 = e2.map((t2) => t2.aspectRatio), h2 = 0.5 * r2;
          let c2 = 0, m = 0;
          const d = (t2, e3, s3) => (i3 - (e3 - t2) * n3) / s3;
          for (; m < e2.length; ) {
            let t2 = 0, s3 = -1, u = 0, p = 1 / 0;
            for (let i4 = m; i4 < e2.length; i4++) {
              t2 += a2[i4];
              const e3 = d(m, i4, t2);
              if (e3 < h2) break;
              const n4 = Math.abs(e3 - r2);
              n4 < p && (p = n4, s3 = i4, u = t2);
            }
            if (-1 === s3) {
              const t3 = Math.min(r2, i3 / a2[m]);
              l3.push({ left: 0, top: c2, width: t3 * a2[m], height: t3 }), c2 += t3 + n3, m++;
              continue;
            }
            const y = s3 === e2.length - 1, g = (s3 - m + 1 - 1) * n3;
            let f = d(m, s3, u), _ = 0;
            if (y && "hide" === o3) break;
            if (y && ["left", "center", "right"].includes(o3)) {
              f = Math.min(r2, (i3 - g) / u);
              const t3 = Math.max(0, i3 - u * f - g);
              "center" === o3 && (_ = t3 / 2), "right" === o3 && (_ = t3);
            }
            let w = _;
            for (let t3 = m; t3 <= s3; t3++) {
              const e3 = f * a2[t3];
              l3.push({ left: w, top: c2, width: e3, height: f }), w += e3 + n3;
            }
            c2 += f + n3, m = s3 + 1;
          }
          return { boxes: l3, containerHeight: t(l3) };
        })(this._items, i2, this._options) : "masonry" === n2 ? o2 = (function(i3, n3, o3) {
          const { gap: l3, colCount: a2, colW: h2 } = e(n3, o3), c2 = [], m = [];
          for (let t2 = 0; t2 < a2; t2++) s(m, { colIndex: t2, height: 0 });
          for (const t2 of i3) {
            const e2 = r(m), i4 = h2 / t2.aspectRatio;
            c2.push({ left: e2.colIndex * (h2 + l3), top: e2.height, width: h2, height: i4 }), s(m, { colIndex: e2.colIndex, height: e2.height + i4 + l3 });
          }
          return { boxes: c2, containerHeight: t(c2) };
        })(this._items, i2, this._options) : "grid" === n2 && (o2 = (function(i3, s2, r2) {
          const { gap: n3, colCount: o3, colW: l3 } = e(s2, r2), a2 = i3.map((t2, e2) => {
            const i4 = e2 % o3, s3 = Math.floor(e2 / o3);
            return { left: i4 * (l3 + n3), top: s3 * (l3 + n3), width: l3, height: l3 };
          });
          return { boxes: a2, containerHeight: t(a2) };
        })(this._items, i2, this._options)), this.geometry = o2.boxes.map((t2, e2) => ({ ...t2, itemIndex: e2 })), l2 = o2.containerHeight, this._buildVisibleIndex(), this._updateMountedGeometry(), this.container.style.height = `${l2}px`, this._updateVisibleItems();
      } finally {
        this.isResizing = false;
      }
    }
    _resetRenderedState() {
      this.renderedIndices.clear(), this.mountedItemElements.clear(), this._resetGeometryState(), this.container.replaceChildren();
    }
    _resetGeometryState() {
      this.topSortedGeometryIndices = [], this.topSortedStarts = [], this.maxGeometryHeight = 0, this.currentVisibleStartPos = -1, this.currentVisibleEndPos = -1, this.geometry = [];
    }
    _updateMountedGeometry() {
      for (const [t2, e2] of this.mountedItemElements) {
        const i2 = this.geometry[t2];
        i2 && i2.itemIndex === t2 ? this._applyBoxStyles(e2, i2) : (this._unmountItem(t2), this.renderedIndices.delete(t2));
      }
    }
    _buildVisibleIndex() {
      const t2 = this.geometry.map((t3, e3) => ({ idx: e3, top: t3.top })).sort((t3, e3) => t3.top - e3.top);
      this.topSortedGeometryIndices = new Array(t2.length), this.topSortedStarts = new Array(t2.length);
      let e2 = 0;
      for (let i2 = 0; i2 < t2.length; i2++) {
        const s2 = t2[i2];
        this.topSortedGeometryIndices[i2] = s2.idx, this.topSortedStarts[i2] = s2.top;
        const r2 = this.geometry[s2.idx].height;
        r2 > e2 && (e2 = r2);
      }
      this.maxGeometryHeight = e2;
    }
    _lowerBound(t2, e2) {
      let i2 = 0, s2 = t2.length;
      for (; i2 < s2; ) {
        const r2 = i2 + s2 >> 1;
        t2[r2] < e2 ? i2 = r2 + 1 : s2 = r2;
      }
      return i2;
    }
    _mountRangeByPos(t2, e2) {
      if (t2 < 0 || e2 < 0 || e2 < t2) return;
      const i2 = document.createDocumentFragment();
      for (let s2 = t2; s2 <= e2; s2++) {
        const t3 = this.topSortedGeometryIndices[s2], e3 = this.geometry[t3].itemIndex;
        this.renderedIndices.has(e3) || (this._mountItem(this.geometry[t3], i2), this.renderedIndices.add(e3));
      }
      this.container.appendChild(i2);
    }
    _unmountRangeByPos(t2, e2) {
      if (!(t2 < 0 || e2 < 0 || e2 < t2)) for (let i2 = t2; i2 <= e2; i2++) {
        const t3 = this.topSortedGeometryIndices[i2], e3 = this.geometry[t3].itemIndex;
        this.renderedIndices.has(e3) && (this._unmountItem(e3), this.renderedIndices.delete(e3));
      }
    }
    _updateVisibleItems() {
      if (!this._options.virtualize) {
        const t3 = document.createDocumentFragment();
        for (let e3 = 0; e3 < this.geometry.length; e3++) {
          const i3 = this.geometry[e3], s3 = i3.itemIndex;
          this.renderedIndices.has(s3) || (this._mountItem(i3, t3), this.renderedIndices.add(s3));
        }
        return void this.container.appendChild(t3);
      }
      const t2 = this._options.buffer;
      let e2 = 0, i2 = 0, s2 = 0;
      if (this.scrollContainer === window) {
        e2 = window.scrollY, i2 = window.innerHeight;
        s2 = this.container.getBoundingClientRect().top + e2;
      } else {
        e2 = this.scrollContainer.scrollTop, i2 = this.scrollContainer.clientHeight;
        const t3 = this.container.getBoundingClientRect(), r3 = this.scrollContainer.getBoundingClientRect();
        s2 = t3.top - r3.top + e2;
      }
      const r2 = Math.max(0, e2 - s2 - t2), n2 = e2 - s2 + i2 + t2;
      let o2 = -1, l2 = -1;
      if (this.topSortedGeometryIndices.length > 0) {
        const t3 = Math.max(0, r2 - this.maxGeometryHeight);
        let e3 = this._lowerBound(this.topSortedStarts, t3);
        for (; e3 < this.topSortedGeometryIndices.length; ) {
          const t4 = this.topSortedGeometryIndices[e3], i3 = this.geometry[t4];
          if (i3.top >= n2) break;
          i3.top + i3.height > r2 && (-1 === o2 && (o2 = e3), l2 = e3), e3++;
        }
      }
      const a2 = this.currentVisibleStartPos, h2 = this.currentVisibleEndPos;
      if (-1 === o2) this._unmountRangeByPos(a2, h2);
      else if (-1 === a2) {
        const t3 = /* @__PURE__ */ new Set();
        for (let e3 = o2; e3 <= l2; e3++) {
          const i3 = this.topSortedGeometryIndices[e3];
          t3.add(this.geometry[i3].itemIndex);
        }
        for (const e3 of this.renderedIndices) t3.has(e3) || (this._unmountItem(e3), this.renderedIndices.delete(e3));
        this._mountRangeByPos(o2, l2);
      } else o2 < a2 && this._mountRangeByPos(o2, Math.min(a2 - 1, l2)), l2 > h2 && this._mountRangeByPos(Math.max(h2 + 1, o2), l2), a2 < o2 && this._unmountRangeByPos(a2, Math.min(o2 - 1, h2)), h2 > l2 && this._unmountRangeByPos(Math.max(l2 + 1, a2), h2);
      this.currentVisibleStartPos = o2, this.currentVisibleEndPos = l2;
    }
    _mountItem(t2, e2 = this.container) {
      const i2 = t2.itemIndex, s2 = this._items[i2], r2 = document.createElement("div");
      if (r2.className = this._options.itemClassName, r2.dataset.sgId = String(s2.id), this._applyBoxStyles(r2, t2), this._options.renderItem) {
        const t3 = this._options.renderItem(s2, i2);
        if (!t3 || "number" != typeof t3.nodeType) throw new TypeError("SmartGallery: renderItem \u5FC5\u987B\u8FD4\u56DE DOM Node\u3002");
        r2.appendChild(t3);
      } else {
        r2.style.backgroundColor = s2.placeholderColor || this._options.placeholderColor;
        const t3 = document.createElement("img");
        t3.alt = "string" == typeof s2.alt ? s2.alt : "", "string" == typeof s2.title && (t3.title = s2.title), "string" == typeof s2.srcset && (t3.srcset = s2.srcset), "string" == typeof s2.sizes && (t3.sizes = s2.sizes), t3.style.width = "100%", t3.style.height = "100%", t3.style.objectFit = "cover", t3.style.display = "block", t3.style.opacity = "0", t3.style.transition = "opacity 0.3s", t3.loading = "lazy", t3.decoding = "async", t3.draggable = false, t3.onload = (e3) => {
          t3.style.opacity = "1", r2.classList.remove(this._options.errorClassName), this._options.onImageLoad && this._options.onImageLoad({ id: s2.id, index: i2, item: { ...s2 }, image: t3, element: r2, originalEvent: e3 });
        }, t3.onerror = (e3) => {
          r2.classList.add(this._options.errorClassName), this._options.onImageError && this._options.onImageError({ id: s2.id, index: i2, item: { ...s2 }, image: t3, element: r2, originalEvent: e3 });
        }, t3.src = s2.src, r2.appendChild(t3);
      }
      const n2 = (t3) => {
        this._options.onItemClick && this._options.onItemClick({ id: s2.id, index: i2, item: { ...s2 }, element: r2, geometry: this.getGeometry(s2.id), originalEvent: t3 });
      };
      this._options.onItemClick && (r2.tabIndex = 0, r2.setAttribute("role", "button"), r2.addEventListener("click", n2), r2.addEventListener("keydown", (t3) => {
        "Enter" !== t3.key && " " !== t3.key || (t3.preventDefault(), n2(t3));
      })), e2.appendChild(r2), this.mountedItemElements.set(i2, r2);
    }
    _applyBoxStyles(t2, e2) {
      t2.style.position = "absolute", t2.style.left = `${e2.left}px`, t2.style.top = `${e2.top}px`, t2.style.width = `${e2.width}px`, t2.style.height = `${e2.height}px`;
    }
    _unmountItem(t2) {
      const e2 = this.mountedItemElements.get(t2);
      e2 && (e2.remove(), this.mountedItemElements.delete(t2));
    }
    _handleScroll() {
      this.isDestroyed || this.isResizing || null !== this.animationFrame || (this.animationFrame = requestAnimationFrame(() => {
        this.animationFrame = null, this.isDestroyed || this._updateVisibleItems();
      }));
    }
    _throttle(t2, e2) {
      let i2 = null;
      const s2 = function() {
        const s3 = arguments, r2 = this;
        null === i2 && (t2.apply(r2, s3), i2 = setTimeout(() => {
          i2 = null;
        }, e2));
      };
      return s2.cancel = () => {
        clearTimeout(i2), i2 = null;
      }, s2;
    }
    destroy() {
      this.isDestroyed || (this.isDestroyed = true, this.resizeObserver && this.resizeObserver.disconnect(), this._unbindScrollListener(), clearTimeout(this.resizeTimer), this.resizeTimer = null, null !== this.animationFrame && (cancelAnimationFrame(this.animationFrame), this.animationFrame = null), this._resetRenderedState(), this.container.style.position = this.originalContainerPosition, this.container.style.height = this.originalContainerHeight, this.hadSmartGalleryClass || this.container.classList.remove("smart-gallery"), this._options.className && !this.hadCustomClass && this.container.classList.remove(this._options.className));
    }
  };

  // <stdin>
  var LAYOUTS = ["justified", "masonry", "grid"];
  var SWITCHER_TEMPLATE_ID = "gallery-layout-switcher";
  function readJSONConfig(id) {
    const element = document.getElementById(id);
    if (!element?.textContent) return null;
    try {
      const parsed = JSON.parse(element.textContent);
      return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
    } catch (_) {
      return null;
    }
  }
  function getPreviewSource(img) {
    const webpSrcset = img.closest("picture")?.querySelector('source[type="image/webp"]')?.srcset;
    const srcset = webpSrcset || img.getAttribute("srcset");
    if (!srcset) return img.currentSrc || img.src;
    const candidates = srcset.split(",").map((part) => {
      const [url, descriptor = ""] = part.trim().split(/\s+/);
      return { url, width: Number.parseInt(descriptor, 10) || 0 };
    }).filter((candidate) => candidate.url);
    if (candidates.length === 0) return img.currentSrc || img.src;
    candidates.sort((left, right) => left.width - right.width);
    const preferred = candidates.find((candidate) => candidate.width >= 480);
    return (preferred || candidates[candidates.length - 1]).url;
  }
  function readFigure(figure) {
    const img = figure.querySelector("img");
    if (!img) return null;
    const caption = figure.querySelector(".image-caption");
    const width = Number.parseInt(figure.dataset.imageWidth, 10) || img.naturalWidth || 800;
    const height = Number.parseInt(figure.dataset.imageHeight, 10) || img.naturalHeight || 600;
    return {
      previewSrc: getPreviewSource(img),
      fullSrc: figure.dataset.imageSrc || img.currentSrc || img.src,
      width,
      height,
      alt: img.alt || "",
      captionHTML: caption ? caption.innerHTML.trim() : ""
    };
  }
  function detectImageGroups(figures) {
    const groups = [];
    let currentGroup = [];
    figures.forEach((figure, index) => {
      currentGroup.push(figure);
      const nextFigure = figures[index + 1];
      if (nextFigure && areConsecutive(figure, nextFigure)) return;
      groups.push([...currentGroup]);
      currentGroup = [];
    });
    return groups;
  }
  function areConsecutive(figure, nextFigure) {
    let current = figure.nextElementSibling;
    while (current && current !== nextFigure) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        if (current.matches(".image-figure, .gallery-layout-switcher, .smart-gallery-container")) {
          current = current.nextElementSibling;
          continue;
        }
        const tagName = current.tagName.toLowerCase();
        const text = current.textContent.trim();
        if (tagName === "br") {
          current = current.nextElementSibling;
          continue;
        }
        if (tagName === "p" && text === "") return false;
        if (text !== "") return false;
      }
      current = current.nextElementSibling;
    }
    return current === nextFigure;
  }
  function createLayoutSwitcher(template, layout, onSwitch) {
    const switcher = template?.content?.firstElementChild?.cloneNode(true);
    if (!switcher) return null;
    const button = switcher.querySelector(".layout-btn");
    const label = button?.getAttribute("aria-label") || "Switch gallery layout";
    let current = LAYOUTS.includes(layout) ? layout : LAYOUTS[0];
    const syncLabel = () => {
      button?.setAttribute("aria-label", `${label}: ${current}`);
      button?.setAttribute("title", `${label}: ${current}`);
    };
    syncLabel();
    button?.addEventListener("click", () => {
      current = LAYOUTS[(LAYOUTS.indexOf(current) + 1) % LAYOUTS.length];
      syncLabel();
      onSwitch(current);
    });
    return switcher;
  }
  function createGalleryGroup(figures, index, settings) {
    const items = figures.map(readFigure).filter(Boolean);
    if (items.length === 0) return;
    const container = document.createElement("div");
    container.className = "smart-gallery-container";
    container.id = `gallery-${index}`;
    const stage = document.createElement("div");
    stage.className = "smart-gallery";
    stage.id = `gallery-inner-${index}`;
    stage.dataset.lightboxEnabled = String(Boolean(settings.lightbox));
    let gallery = null;
    const switcher = createLayoutSwitcher(
      settings.switcherTemplate,
      settings.defaultLayout,
      (layout) => gallery?.setOptions({ layout })
    );
    if (switcher) container.append(switcher);
    container.append(stage);
    figures[0].parentNode.insertBefore(container, figures[0]);
    figures.forEach((figure) => figure.remove());
    if (settings.lightbox) {
      settings.lightbox.registerGallery(
        container.id,
        items.map((item) => ({
          src: item.fullSrc,
          width: item.width,
          height: item.height,
          alt: item.alt,
          captionHTML: item.captionHTML
        }))
      );
    }
    gallery = new c(stage, {
      placeholderColor: "transparent",
      ...settings.galleryOptions,
      layout: settings.defaultLayout,
      onItemClick: settings.lightbox ? ({ index: itemIndex, element }) => settings.lightbox.open(container.id, itemIndex, { triggerElement: element }) : null
    });
    gallery.setItems(
      items.map((item) => ({
        src: item.previewSrc,
        width: item.width,
        height: item.height,
        aspectRatio: item.width / item.height
      }))
    );
  }
  function openSingleImage(figure, lightbox, index) {
    const item = readFigure(figure);
    if (!item) return;
    const galleryId = `single-image-${index}`;
    lightbox.registerGallery(galleryId, [
      {
        src: item.fullSrc,
        width: item.width,
        height: item.height,
        alt: item.alt,
        captionHTML: item.captionHTML
      }
    ]);
    figure.classList.add("single-image");
    const trigger = figure.querySelector(".image-container") || figure.querySelector("img");
    trigger.classList.add("lightbox-trigger");
    trigger.addEventListener("click", () => lightbox.open(galleryId, 0, { triggerElement: trigger }));
  }
  function initGallery() {
    const figures = [...document.querySelectorAll('.image-figure[data-gallery-type="auto"]')];
    if (figures.length === 0) return;
    const config = readJSONConfig("gallery-config") || {};
    const options = config.galleryOptions || {};
    const { defaultLayout, ...galleryOptions } = options;
    const initialLayout = LAYOUTS.includes(defaultLayout) ? defaultLayout : LAYOUTS[0];
    const lightbox = config.lightbox ? new gallery_lightbox_default() : null;
    const switcherTemplate = document.getElementById(SWITCHER_TEMPLATE_ID);
    let singleImageCount = 0;
    detectImageGroups(figures).forEach((group, index) => {
      if (group.length > 1 && config.gallery) {
        createGalleryGroup(group, index, {
          defaultLayout: initialLayout,
          galleryOptions,
          lightbox,
          switcherTemplate
        });
        return;
      }
      if (!lightbox) return;
      group.forEach((figure) => {
        openSingleImage(figure, lightbox, singleImageCount);
        singleImageCount += 1;
      });
    });
  }
  initGallery();
})();
