/**
 * Juejin AI Usage Dashboard - Pricing (Pure HTML + CSS + jQuery)
 * Fetches and displays AI model pricing from https://api.juejin.cn/aiusage_api/functions/tud-pricing
 */

$(function () {
  // --- Constants & Provider Mapping ---
  const API_ENDPOINT = "https://api.juejin.cn/aiusage_api/functions/tud-pricing";
  const LOCAL_FALLBACK = "tud-pricing.json";

  const PROVIDER_DEFS = {
    ai21: { label: "AI21 Labs", icon: "ai21" },
    alibaba: { label: "Alibaba", icon: "alibaba" },
    aws: { label: "AWS", icon: "aws" },
    anthropic: { label: "Claude", icon: "claude" },
    azure: { label: "Azure", icon: "azure" },
    baidu: { label: "Baidu", icon: "baidu" },
    bytedance: { label: "ByteDance", icon: "bytedance" },
    cerebras: { label: "Cerebras", icon: "cerebras" },
    claude: { label: "Claude", icon: "claude" },
    cohere: { label: "Cohere", icon: "cohere" },
    cloudflare: { label: "Cloudflare", icon: "cloudflare" },
    codex: { label: "Codex", icon: "codex" },
    cursor: { label: "Cursor", icon: "cursor" },
    deepseek: { label: "DeepSeek", icon: "deepseek" },
    doubao: { label: "Doubao", icon: "doubao" },
    fireworks: { label: "Fireworks", icon: "fireworks" },
    gemini: { label: "Google", icon: "google" },
    google: { label: "Google", icon: "google" },
    grok: { label: "xAI", icon: "grok" },
    groq: { label: "Groq", icon: "groq" },
    huggingface: { label: "Hugging Face", icon: "huggingface" },
    hunyuan: { label: "Tencent", icon: "hunyuan" },
    kimi: { label: "Kimi", icon: "kimi" },
    meta: { label: "Meta", icon: "meta" },
    minimax: { label: "MiniMax", icon: "minimax" },
    mistral: { label: "Mistral", icon: "mistral" },
    moonshot: { label: "Moonshot", icon: "moonshot" },
    nvidia: { label: "NVIDIA", icon: "nvidia" },
    openai: { label: "OpenAI", icon: "openai" },
    perplexity: { label: "Perplexity", icon: "perplexity" },
    qwen: { label: "Alibaba", icon: "alibaba" },
    stepfun: { label: "StepFun", icon: "stepfun" },
    tencent: { label: "Tencent", icon: "hunyuan" },
    together: { label: "Together AI", icon: "together" },
    xai: { label: "xAI", icon: "grok" },
    xiaomi: { label: "Xiaomi", icon: "xiaomi" },
    yi: { label: "01.AI", icon: "yi" },
    zai: { label: "Z.ai", icon: "zai" },
    zhipu: { label: "Zhipu AI", icon: "zhipu" }
  };

  const PROVIDER_ALIASES = {
    "alibaba-cn": "alibaba",
    "amazon-bedrock": "aws",
    "azure-cognitive-services": "azure",
    "cloudflare-ai-gateway": "cloudflare",
    "fireworks-ai": "fireworks",
    "github-copilot": "openai",
    "google-vertex": "google",
    "google-vertex-anthropic": "claude",
    minimax: "minimax",
    "minimax-cn": "minimax",
    moonshotai: "moonshot",
    openrouter: "openai",
    "perplexity-agent": "perplexity",
    tencent: "tencent",
    togetherai: "together",
    xiaomi: "xiaomi",
    zai: "zai",
    zhipuai: "zhipu"
  };

  const PROVIDER_PATTERNS = [
    [/claude/, "claude"],
    [/(^|[\/_ .-])(opus|sonnet|haiku|fable)([\/_ .-]|$)/, "claude"],
    [/\bcodex\b/, "codex"],
    [/(^|[\/_-])gpt([\/_.-]|$)|chatgpt|(^|[\/_-])o[1-9]([\/_.-]|$)/, "openai"],
    [/gemini|gemma/, "google"],
    [/qwen/, "qwen"],
    [/deepseek/, "deepseek"],
    [/grok/, "grok"],
    [/mistral|mixtral/, "mistral"],
    [/kimi/, "kimi"],
    [/moonshot/, "moonshot"],
    [/(^|[\/_ .-])k(2[._-]7|3)([\/_ .-]|$)/, "moonshot"],
    [/minimax/, "minimax"],
    [/llama|meta-llama/, "meta"],
    [/command|cohere/, "cohere"],
    [/jamba/, "ai21"],
    [/ai21/, "ai21"],
    [/nova|titan/, "aws"],
    [/doubao/, "doubao"],
    [/hunyuan/, "hunyuan"],
    [/glm|chatglm|zhipu|(^|[\/_-])zai([\/_.-]|$)/, "zhipu"],
    [/ernie/, "baidu"],
    [/yi-/, "yi"],
    [/step[-_]?\w/, "stepfun"],
    [/sonar|perplexity/, "perplexity"],
    [/nvidia|nemotron/, "nvidia"],
    [/groq/, "groq"],
    [/cerebras/, "cerebras"]
  ];

  const INVERT_DARK_ICONS = new Set(["grok", "groq", "kimi", "moonshot", "openai", "zai"]);

  const SORT_LABELS = {
    "inputOutput:descending": "输入价格：从高到低",
    "inputOutput:ascending": "输入价格：从低到高",
    "model:ascending": "模型名称：A → Z",
    "model:descending": "模型名称：Z → A",
    "cache:descending": "缓存价格：从高到低",
    "cache:ascending": "缓存价格：从低到高"
  };

  // --- Helper Functions ---
  function getModelShortName(modelId) {
    if (!modelId) return "";
    const parts = modelId.split("/").filter(Boolean);
    return parts[parts.length - 1] || modelId;
  }

  function resolveProvider(modelId) {
    const raw = (modelId || "").trim().toLowerCase();
    for (const [pattern, key] of PROVIDER_PATTERNS) {
      if (pattern.test(raw)) {
        return getProviderObj(key);
      }
    }
    const prefix = raw.split("/").filter(Boolean)[0] || "";
    return getProviderObj(prefix.replace(/\s+/g, "-"));
  }

  function getProviderObj(key) {
    const canonicalKey = PROVIDER_DEFS[key] ? key : PROVIDER_ALIASES[key];
    const def = canonicalKey ? PROVIDER_DEFS[canonicalKey] : null;
    if (def) {
      return { key: canonicalKey, label: def.label, icon: def.icon };
    }
    return { key: "unknown", label: "Other", icon: "unknown" };
  }

  function getProviderIconHtml(provider, size) {
    size = size || 20;
    const iconsMap = window.PROVIDER_ICONS || {};
    const svgDataUri = iconsMap[provider.icon];
    const shouldInvert = INVERT_DARK_ICONS.has(provider.icon);

    if (svgDataUri && typeof svgDataUri === "string" && svgDataUri.startsWith("data:image/svg+xml")) {
      return `<img src="${svgDataUri}" width="${size}" height="${size}" alt="${escapeHtml(provider.label)}" class="${shouldInvert ? 'invert-dark' : ''}">`;
    }
    const initial = (provider.label || "M").charAt(0).toUpperCase();
    return `<span class="provider-fallback-char">${initial}</span>`;
  }

  function formatPrice(val) {
    if (typeof val !== "number" || !Number.isFinite(val) || val <= 0) {
      return "$0";
    }
    const formatted = new Intl.NumberFormat("en-US", {
      maximumSignificantDigits: 6
    }).format(val);
    return `$${formatted}`;
  }

  // --- State ---
  let allModels = [];
  let availableProviders = [];
  let searchQuery = "";
  let selectedProvider = "";
  let currentSort = {
    column: "inputOutput",
    direction: "descending"
  };

  // --- Core Filtering & Sorting ---
  function filterAndSortModels() {
    const query = searchQuery.trim().toLowerCase();

    let result = allModels.filter(function (item) {
      // 1. Text Search Filter
      if (query && !item.model.toLowerCase().includes(query)) {
        return false;
      }
      // 2. Provider Filter
      if (selectedProvider && selectedProvider !== "all") {
        if (item.provider.key !== selectedProvider) {
          return false;
        }
      }
      return true;
    });

    // Sort
    result.sort(function (a, b) {
      let cmp = 0;
      if (currentSort.column === "model") {
        cmp = a.shortName.localeCompare(b.shortName);
        if (cmp === 0) {
          cmp = a.model.localeCompare(b.model);
        }
      } else if (currentSort.column === "inputOutput") {
        cmp = a.input - b.input;
        if (cmp === 0) {
          cmp = a.output - b.output;
        }
      } else if (currentSort.column === "cache") {
        cmp = a.cacheRead - b.cacheRead;
        if (cmp === 0) {
          cmp = a.cacheWrite - b.cacheWrite;
        }
      }

      if (cmp !== 0) {
        return currentSort.direction === "descending" ? -cmp : cmp;
      }
      return a.model.localeCompare(b.model);
    });

    return result;
  }

  // --- Render Functions ---
  function renderAll() {
    const filteredList = filterAndSortModels();
    updateStats(filteredList.length, allModels.length);
    renderPcTable(filteredList);
    renderMobileCards(filteredList);
    updateSortUi();
  }

  function updateStats(visibleCount, totalCount) {
    if (visibleCount === totalCount) {
      $("#modelCountText").text(`共 ${totalCount} 个模型`);
    } else {
      $("#modelCountText").text(`已筛选 ${visibleCount} / ${totalCount} 个模型`);
    }
  }

  function renderPcTable(items) {
    const $tbody = $("#pcTableBody");
    $tbody.empty();

    if (items.length === 0) {
      $("#pcTableContainer").hide();
      $("#pcEmptyState").show();
      return;
    }

    $("#pcTableContainer").show();
    $("#pcEmptyState").hide();

    const rowsHtml = items.map(function (item) {
      const iconHtml = getProviderIconHtml(item.provider, 22);
      const isSubtitled = item.model.indexOf("/") !== -1;
      const subtitleHtml = isSubtitled
        ? `<div class="model-id-full" title="${escapeHtml(item.model)}">${escapeHtml(item.model)}</div>`
        : "";

      const cacheReadHtml = item.cacheRead > 0
        ? `<span class="amount">${formatPrice(item.cacheRead)}</span>`
        : `<span class="amount empty-dash">-</span>`;

      const cacheWriteHtml = item.cacheWrite > 0
        ? `<span class="amount">${formatPrice(item.cacheWrite)}</span>`
        : `<span class="amount empty-dash">-</span>`;

      return `
        <tr data-model="${escapeHtml(item.model)}">
          <td>
            <div class="model-cell">
              <div class="provider-badge" title="${escapeHtml(item.provider.label)}">
                ${iconHtml}
              </div>
              <div class="model-info">
                <div class="model-name" title="${escapeHtml(item.model)}">${escapeHtml(item.shortName)}</div>
                ${subtitleHtml}
              </div>
            </div>
          </td>
          <td>
            <div class="price-stack">
              <div class="price-item">
                <span class="tag">输入</span>
                <span class="amount">${formatPrice(item.input)}</span>
                <span class="unit">/M</span>
              </div>
              <div class="price-item">
                <span class="tag">输出</span>
                <span class="amount">${formatPrice(item.output)}</span>
                <span class="unit">/M</span>
              </div>
            </div>
          </td>
          <td>
            <div class="price-stack">
              <div class="price-item">
                <span class="tag">缓存读</span>
                ${cacheReadHtml}
                <span class="unit">/M</span>
              </div>
              <div class="price-item">
                <span class="tag">缓存写</span>
                ${cacheWriteHtml}
                <span class="unit">/M</span>
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    $tbody.html(rowsHtml);
  }

  function renderMobileCards(items) {
    const $container = $("#mobileCardsContainer");
    $container.empty();

    if (items.length === 0) {
      $container.hide();
      $("#mobileEmptyState").show();
      return;
    }

    $container.show();
    $("#mobileEmptyState").hide();

    const cardsHtml = items.map(function (item) {
      const iconHtml = getProviderIconHtml(item.provider, 18);
      const isSubtitled = item.model.indexOf("/") !== -1;
      const subtitleHtml = isSubtitled
        ? `<div class="model-id-full" title="${escapeHtml(item.model)}">${escapeHtml(item.model)}</div>`
        : "";

      const cacheReadHtml = item.cacheRead > 0
        ? `<span class="amount">${formatPrice(item.cacheRead)}</span>`
        : `<span class="amount empty-dash">-</span>`;

      const cacheWriteHtml = item.cacheWrite > 0
        ? `<span class="amount">${formatPrice(item.cacheWrite)}</span>`
        : `<span class="amount empty-dash">-</span>`;

      return `
        <div class="pricing-card" data-model="${escapeHtml(item.model)}">
          <div class="card-header">
            <div class="provider-badge" title="${escapeHtml(item.provider.label)}">
              ${iconHtml}
            </div>
            <div class="model-info">
              <div class="model-name">${escapeHtml(item.shortName)}</div>
              ${subtitleHtml}
            </div>
          </div>
          <div class="card-body-grid">
            <div class="price-item">
              <span class="tag">输入</span>
              <span class="amount">${formatPrice(item.input)}</span>
              <span class="unit">/M</span>
            </div>
            <div class="price-item">
              <span class="tag">输出</span>
              <span class="amount">${formatPrice(item.output)}</span>
              <span class="unit">/M</span>
            </div>
            <div class="price-item">
              <span class="tag">缓存读</span>
              ${cacheReadHtml}
              <span class="unit">/M</span>
            </div>
            <div class="price-item">
              <span class="tag">缓存写</span>
              ${cacheWriteHtml}
              <span class="unit">/M</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    $container.html(cardsHtml);
  }

  function updateSortUi() {
    const currentSortKey = `${currentSort.column}:${currentSort.direction}`;

    // Update PC column arrows
    $(".pricing-table th.sortable").each(function () {
      const col = $(this).data("column");
      const $up = $(this).find(".arrow-up");
      const $down = $(this).find(".arrow-down");

      $up.removeClass("arrow-active");
      $down.removeClass("arrow-active");

      if (currentSort.column === col) {
        if (currentSort.direction === "ascending") {
          $up.addClass("arrow-active");
        } else {
          $down.addClass("arrow-active");
        }
      }
    });

    // Update Sort Dropdown (on PC & Mobile)
    const label = SORT_LABELS[currentSortKey] || "排序";
    $("#sortTriggerLabel").text(label);

    $("#sortDropdownMenu .dropdown-item").each(function () {
      const val = $(this).data("value");
      if (val === currentSortKey) {
        $(this).addClass("active");
        $(this).find(".dropdown-item-check").text("✓");
      } else {
        $(this).removeClass("active");
        $(this).find(".dropdown-item-check").html("&nbsp;");
      }
    });
  }

  function populateProviderDropdown(providers) {
    const $menu = $("#providerDropdownMenu");
    $menu.empty();

    // Default "All" option
    const isAllActive = !selectedProvider;
    let html = `
      <div class="dropdown-item ${isAllActive ? 'active' : ''}" data-key="">
        <span class="dropdown-item-check">${isAllActive ? '✓' : '&nbsp;'}</span>
        <span class="dropdown-item-icon">🌐</span>
        <span>全部供应商</span>
        <span class="dropdown-item-count">${allModels.length}</span>
      </div>
    `;

    providers.forEach(function (p) {
      const iconHtml = getProviderIconHtml(p, 16);
      const isActive = selectedProvider === p.key;
      html += `
        <div class="dropdown-item ${isActive ? 'active' : ''}" data-key="${escapeHtml(p.key)}">
          <span class="dropdown-item-check">${isActive ? '✓' : '&nbsp;'}</span>
          <span class="dropdown-item-icon">${iconHtml}</span>
          <span>${escapeHtml(p.label)}</span>
          <span class="dropdown-item-count">${p.count}</span>
        </div>
      `;
    });

    $menu.html(html);
  }

  function updateProviderTriggerUi() {
    if (!selectedProvider) {
      $("#providerTriggerLabel").html(`全部供应商`);
    } else {
      const found = availableProviders.find(p => p.key === selectedProvider);
      if (found) {
        const iconHtml = getProviderIconHtml(found, 14);
        $("#providerTriggerLabel").html(`${iconHtml} <span>${escapeHtml(found.label)}</span>`);
      } else {
        $("#providerTriggerLabel").html(`全部供应商`);
      }
    }
  }

  // --- Data Loading via jQuery Ajax with instant fallback ---
  function loadPricingData() {
    // If we have bundled PRICING_DATA, render immediately with zero delay
    if (window.PRICING_DATA && window.PRICING_DATA.exact) {
      processPricingResponse(window.PRICING_DATA);
    } else {
      $("#loadingSkeleton").show();
      $("#errorState").hide();
      $("#pcTableContainer").hide();
      $("#mobileCardsContainer").hide();
    }

    // Now fetch fresh data from remote API
    $.ajax({
      url: API_ENDPOINT,
      method: "GET",
      dataType: "json",
      timeout: 5000
    })
    .done(function (data) {
      if (data && data.exact) {
        processPricingResponse(data);
      }
    })
    .fail(function (xhr, status, error) {
      // If we don't have allModels yet, attempt local json
      if (allModels.length === 0) {
        $.ajax({
          url: LOCAL_FALLBACK,
          method: "GET",
          dataType: "json"
        })
        .done(function (localData) {
          processPricingResponse(localData);
        })
        .fail(function (xhr2, status2, error2) {
          console.error("All data loading attempts failed:", error2);
          $("#loadingSkeleton").hide();
          $("#errorMessage").text(`数据获取失败: ${error || error2 || '网络异常'}`);
          $("#errorState").show();
        });
      }
    });
  }

  function processPricingResponse(data) {
    if (!data || !data.exact || typeof data.exact !== "object") {
      return;
    }

    // Process exact dictionary
    allModels = Object.entries(data.exact).map(function ([modelId, pricing]) {
      return {
        model: modelId,
        shortName: getModelShortName(modelId),
        provider: resolveProvider(modelId),
        input: pricing.input || 0,
        output: pricing.output || 0,
        cacheRead: pricing.cache_read || 0,
        cacheWrite: pricing.cache_write || 0
      };
    });

    // Extract providers with counts
    const providerMap = new Map();
    allModels.forEach(function (m) {
      const p = m.provider;
      if (!providerMap.has(p.key)) {
        providerMap.set(p.key, {
          key: p.key,
          label: p.label,
          icon: p.icon,
          count: 0
        });
      }
      providerMap.get(p.key).count++;
    });

    availableProviders = Array.from(providerMap.values()).sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });

    populateProviderDropdown(availableProviders);
    $("#loadingSkeleton").hide();
    $("#errorState").hide();
    renderAll();
  }

  // --- UI Event Listeners ---

  // Search Input with Debounce
  let searchTimeout = null;
  $("#searchInput").on("input", function () {
    const val = $(this).val();
    $("#searchClearBtn").toggle(val.length > 0);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      searchQuery = val;
      renderAll();
    }, 150);
  });

  // Clear Search
  $("#searchClearBtn").on("click", function () {
    $("#searchInput").val("").trigger("input").focus();
  });

  // Provider Dropdown toggle & select
  $("#providerDropdownTrigger").on("click", function (e) {
    e.stopPropagation();
    $("#sortDropdown").removeClass("open");
    $("#providerDropdown").toggleClass("open");
  });

  $("#providerDropdownMenu").on("click", ".dropdown-item", function () {
    const key = $(this).data("key");
    selectedProvider = key;
    populateProviderDropdown(availableProviders);
    updateProviderTriggerUi();
    $("#providerDropdown").removeClass("open");
    renderAll();
  });

  // Sort Dropdown toggle & select (Works on BOTH PC and Mobile)
  $("#sortDropdownTrigger").on("click", function (e) {
    e.stopPropagation();
    $("#providerDropdown").removeClass("open");
    $("#sortDropdown").toggleClass("open");
  });

  $("#sortDropdownMenu").on("click", ".dropdown-item", function () {
    const val = $(this).data("value");
    if (val) {
      const [column, direction] = val.split(":");
      currentSort.column = column;
      currentSort.direction = direction;
      $("#sortDropdown").removeClass("open");
      renderAll();
    }
  });

  // Click outside to close any open dropdown
  $(document).on("click", function (e) {
    if (!$(e.target).closest("#providerDropdown").length) {
      $("#providerDropdown").removeClass("open");
    }
    if (!$(e.target).closest("#sortDropdown").length) {
      $("#sortDropdown").removeClass("open");
    }
  });

  // PC Table Header Sort Click (Also syncs sort dropdown!)
  $(".pricing-table th.sortable").on("click", function () {
    const column = $(this).data("column");
    if (currentSort.column === column) {
      currentSort.direction = currentSort.direction === "ascending" ? "descending" : "ascending";
    } else {
      currentSort.column = column;
      currentSort.direction = column === "model" ? "ascending" : "descending";
    }
    renderAll();
  });

  // Dark Mode Toggle
  $("#themeToggleBtn").on("click", function () {
    const isDark = $("html").attr("data-theme") === "dark";
    if (isDark) {
      $("html").removeAttr("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      $("html").attr("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  });

  // Load saved theme
  if (localStorage.getItem("theme") === "dark" || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches && !localStorage.getItem("theme"))) {
    $("html").attr("data-theme", "dark");
  }

  // Retry Button
  $("#retryBtn").on("click", function () {
    loadPricingData();
  });

  // Back to Top Button Behavior (Global Scroll Detection)
  const $backToTop = $("#backToTopBtn");

  function getScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function handleScroll() {
    if (getScrollTop() > 80) {
      $backToTop.addClass("visible");
    } else {
      $backToTop.removeClass("visible");
    }
  }

  // Bind to window, document, and capture phase
  window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
  $(window).on("scroll resize", handleScroll);
  $(document).on("scroll", handleScroll);
  $("body").on("scroll", handleScroll);
  handleScroll();

  $backToTop.on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    $("html, body").animate({ scrollTop: 0 }, 250);
  });

  // Initial Load
  loadPricingData();

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
