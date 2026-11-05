/* CMOC L2 PBI报表开发平台 · 报表页 / 语义模型 / 指标映射工作台 */
(function () {
  "use strict";

  var D = window.L2_DATA;
  var app = document.getElementById("app");
  var sbNav = document.getElementById("sbNav");
  var crumb = document.getElementById("crumb");
  var searchBox = document.getElementById("searchBox");
  var searchInput = document.getElementById("searchInput");
  var searchResults = document.getElementById("searchResults");
  var drawer = document.getElementById("detailDrawer");
  var drawerBackdrop = document.getElementById("drawerBackdrop");
  var mobileBackdrop = document.getElementById("mobileBackdrop");
  var menuBtn = document.getElementById("menuBtn");
  var body = document.body;

  var pages = D.pages.filter(function (p) { return p.code; });
  var pageByCode = {};
  pages.forEach(function (p) { pageByCode[p.code] = p; });
  var factTables = D.tables.filter(function (t) { return t.kind === "fact"; });
  var dimTables = D.tables.filter(function (t) { return t.kind === "dim"; });
  var otherTables = D.tables.filter(function (t) { return t.kind === "measure" || t.kind === "security"; });
  var tableByName = {};
  D.tables.forEach(function (t) { tableByName[t.name] = t; });
  var measures = D.measures;
  var mappings = D.mappings;
  var service = D.service || {};
  // 有在线报表的页面只提供在线报表（可视化 / 表样切换）；无在线报表的页面显示截图。
  var viewMode = "service";

  var VISUAL_LABEL = {
    pivotTable: "矩阵",
    slicer: "切片器",
    card: "卡片",
    textbox: "文本框",
    shape: "形状",
    image: "图片",
    actionButton: "按钮",
    tableEx: "表",
    lineChart: "折线图",
    clusteredColumnChart: "柱形图"
  };
  var KIND_LABEL = { fact: "事实表", dim: "维度", measure: "度量值表", security: "安全" };

  /* ---------- 工具 ---------- */
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function url(path) {
    if (!path) return "";
    return path.split("/").map(encodeURIComponent).join("/");
  }

  function shortName(name, code) {
    if (!code) return name;
    var out = name.replace(code, "").replace(/^[\s\-_]+/, "").trim();
    return out || name;
  }

  function sourceLabel(p) {
    return p.sources && p.sources.length ? p.sources.join(" + ") : "—";
  }

  function vlabel(type) {
    return VISUAL_LABEL[type] ? VISUAL_LABEL[type] : type;
  }

  function pageService(page) {
    if (!page || !service.reports) return null;
    var r = service.reports[page.code];
    if (!r || !r.reportId) return null;
    return r;
  }

  /* kind: "visual"（默认，可视化页）| "table"（表样页） */
  function pageView(page, kind) {
    var r = pageService(page);
    if (!r) return null;
    if (kind !== "table") return r;
    if (!r.tablePageName && !r.tableReportId) return null;
    return {
      reportId: r.tableReportId || r.reportId,
      workspaceId: r.tableWorkspaceId || r.workspaceId,
      tenantId: r.tenantId,
      pageName: r.tablePageName || "",
      url: r.tableUrl || ""
    };
  }

  function hasTablePage(page) {
    return !!pageView(page, "table");
  }

  function embedUrl(page, kind) {
    var r = pageView(page, kind);
    if (!r) return "";
    var ws = r.workspaceId || service.workspaceId;
    var tid = r.tenantId || service.tenantId;
    var base = (service.host || "https://app.powerbi.com") +
      "/reportEmbed?reportId=" + encodeURIComponent(r.reportId) + "&autoAuth=true";
    if (ws) base += "&groupId=" + encodeURIComponent(ws);
    if (tid) base += "&ctid=" + encodeURIComponent(tid);
    if (r.pageName) base += "&pageName=" + encodeURIComponent(r.pageName);
    return base;
  }

  function serviceUrl(page, kind) {
    var r = pageView(page, kind);
    if (!r) return "";
    if (r.url) return r.url;
    var ws = r.workspaceId || service.workspaceId;
    var host = service.host || "https://app.powerbi.com";
    if (ws) return host + "/groups/" + encodeURIComponent(ws) + "/reports/" + encodeURIComponent(r.reportId);
    return host + "/reports/" + encodeURIComponent(r.reportId);
  }

  /* ---------- 在线 Excel ----------
     Office 网页版读取的是「已发布站点」上的 xlsx 副本（默认 GitHub Pages），
     所以 file:// 打开、内网 IIS 部署时同样能在线查看；离线时回落到「下载」。
     部署地址可用 service_reports.json 的 excelBase 覆盖。 */
  var EXCEL_PUBLIC_BASE = "https://jevonzhu2008-star.github.io/L2-data-platform/";
  var EXCEL_VIEWER_BASE = "https://view.officeapps.live.com/op/";

  function excelPublicUrl(file) {
    var base = (service && service.excelBase) || EXCEL_PUBLIC_BASE;
    if (base.slice(-1) !== "/") base += "/";
    return base + String(file || "").split("/").map(encodeURIComponent).join("/");
  }

  function excelViewerUrl(file, embedded) {
    return EXCEL_VIEWER_BASE + (embedded ? "embed.aspx" : "view.aspx") +
      "?src=" + encodeURIComponent(excelPublicUrl(file));
  }

  /* 在线报表入口卡：没有截图时使用。 */
  function onlineTile(compact) {
    return '<div class="rc-online">' +
      '<span class="rc-online-icon">◉</span>' +
      "<b>" + (compact ? "在线报表" : "Power BI 在线报表") + "</b>" +
      "<small>Service 实时嵌入</small>" +
      "</div>";
  }

  function routeInfo() {
    var raw = location.hash.replace(/^#\/?/, "");
    var parts = raw.split("/").filter(Boolean);
    return {
      section: parts[0] || "home",
      arg: parts[1] ? decodeURIComponent(parts.slice(1).join("/")) : null
    };
  }

  function setCrumb(html) { crumb.innerHTML = html; }

  function notFound(key) {
    app.className = "";
    app.innerHTML = '<div class="empty-state"><p>没有找到「' + esc(key) + '」。</p><p style="margin-top:10px;"><a href="#/">返回工作台</a></p></div>';
    setCrumb('<a href="#/">工作台</a><span class="crumb-sep">/</span><b>未找到</b>');
    document.title = "未找到 · CMOC L2 PBI报表开发平台";
  }

  /* ---------- 侧边栏 ---------- */
  function sbItem(href, label, count, route) {
    return '<a class="sb-item" data-route="' + route + '" href="' + href + '">' +
      '<span class="sb-name">' + esc(label) + "</span>" +
      (count !== "" && count != null ? '<span class="sb-count" style="margin-left:auto">' + count + "</span>" : "") +
      "</a>";
  }

  function sbGroup(id, title, count, overviewHtml, subHtml) {
    return '<div class="sb-group" data-group="' + id + '">' +
      '<div class="sb-group-row">' +
        '<button class="sb-group-head" type="button" data-toggle="' + id + '" aria-expanded="false">' +
          '<span class="sb-name">' + esc(title) + "</span>" +
          '<span class="sb-count">' + count + "</span>" +
        "</button>" +
        '<button class="sb-chev" type="button" data-toggle="' + id + '" aria-label="展开 ' + esc(title) + '">›</button>' +
      "</div>" +
      '<div class="sb-sub">' + (overviewHtml || "") + subHtml + "</div>" +
    "</div>";
  }

  function sbSub(href, label, key, status) {
    return '<a class="sb-sub-item" data-key="' + esc(key) + '" href="' + href + '" title="' + esc(label) + '">' +
      '<span class="sb-sub-name">' + esc(label) + "</span>" +
      (status ? '<span class="sb-dot ' + status + '"></span>' : "") +
      "</a>";
  }

  function pageKey(code) { return "page:" + code; }
  function tableKey(name) { return "table:" + name; }

  function buildSidebar() {
    var html = sbItem("#/", "工作台", "", "home");
    html += '<div class="sb-label">报表页</div>';
    D.pageGroups.forEach(function (g) {
      var ps = g.codes.map(function (c) { return pageByCode[c]; }).filter(Boolean);
      if (!ps.length) return;
      var subs = ps.map(function (p) {
        return sbSub("#/page/" + p.code, shortName(p.name, p.code), pageKey(p.code), pageService(p) ? "online" : "shot");
      }).join("");
      var overview = '<a class="sb-sub-item sb-overview" href="#/theme/' + g.id + '">主题总览 →</a>';
      html += sbGroup("pg-" + g.id, g.name, ps.length, overview, subs);
    });
    html += '<div class="sb-divider"></div>';
    var modelSubs = factTables.map(function (t) {
      return sbSub("#/model/" + encodeURIComponent(t.name), shortName(t.name, t.code), tableKey(t.name));
    }).join("");
    var modelOverview = '<a class="sb-sub-item sb-overview" href="#/model">语义模型总览 →</a>';
    html += sbGroup("model", "语义模型", factTables.length, modelOverview, modelSubs);
    html += sbItem("#/ui", "UI规范", "v2.8", "ui");
    html += sbItem("#/mappings", "指标映射", D.stats.mappings, "mappings");
    html += sbItem("#/deliverables", "交付成果", "", "deliverables");
    sbNav.innerHTML = html;
  }

  function updateSidebar(section, arg) {
    Array.prototype.forEach.call(sbNav.querySelectorAll(".active"), function (el) { el.classList.remove("active"); });
    Array.prototype.forEach.call(sbNav.querySelectorAll(".sb-group.open"), function (el) {
      el.classList.remove("open");
      var head = el.querySelector(".sb-group-head");
      if (head) head.setAttribute("aria-expanded", "false");
    });

    function activateItem(route) {
      var el = sbNav.querySelector('.sb-item[data-route="' + route + '"]');
      if (el) el.classList.add("active");
    }
    function openGroup(id) {
      var g = sbNav.querySelector('.sb-group[data-group="' + id + '"]');
      if (g) {
        g.classList.add("open");
        var head = g.querySelector(".sb-group-head");
        if (head) {
          head.classList.add("active");
          head.setAttribute("aria-expanded", "true");
        }
        return g;
      }
      return null;
    }
    function activateSub(key) {
      Array.prototype.forEach.call(sbNav.querySelectorAll(".sb-sub-item"), function (el) {
        if (el.getAttribute("data-key") === key) el.classList.add("active");
      });
    }

    if (section === "home") {
      activateItem("home");
    } else if (section === "deliverables") {
      activateItem("deliverables");
    } else if (section === "measures") {
      // 度量值已并入语义模型：激活语义模型总览
      var sg = openGroup("model");
      if (sg) {
        var sov = sg.querySelector(".sb-overview");
        if (sov) sov.classList.add("active");
      }
    } else if (section === "mappings") {
      activateItem("mappings");
    } else if (section === "ui") {
      activateItem("ui");
    } else if (section === "page") {
      var p = pageByCode[arg];
      if (!p) return;
      var groupId = null;
      D.pageGroups.forEach(function (g) {
        if (g.codes.indexOf(p.code) >= 0) groupId = "pg-" + g.id;
      });
      if (groupId) openGroup(groupId);
      activateSub(pageKey(p.code));
    } else if (section === "theme") {
      var tg = openGroup("pg-" + arg);
      if (tg) {
        var ov = tg.querySelector(".sb-overview");
        if (ov) ov.classList.add("active");
      }
    } else if (section === "model") {
      var mg = openGroup("model");
      if (arg) activateSub(tableKey(arg));
      else if (mg) {
        var mov = mg.querySelector(".sb-overview");
        if (mov) mov.classList.add("active");
      }
    }
  }

  /* ---------- 首页 ---------- */
  function reportCard(p) {
    var online = !!pageService(p);
    var media = p.thumb
      ? '<img src="' + url(p.thumb) + '" alt="" loading="lazy">'
      : (online ? onlineTile(false) : "");
    return '<a class="report-card' + (online ? " is-online" : "") + '" href="#/page/' + p.code + '">' +
      '<div class="rc-thumb' + (p.thumb ? "" : (online ? " is-online" : "")) + '">' +
        media +
        '<span class="rc-badge">' + p.visualCount + " 视觉</span>" +
        (online ? '<span class="rc-badge svc">Report · 在线</span>' : '<span class="rc-badge pbip">PBIP 页面 · 截图</span>') +
      "</div>" +
      '<div class="rc-body">' +
        '<span class="code">' + esc(p.code) + "</span>" +
        "<h3>" + esc(shortName(p.name, p.code)) + "</h3>" +
        '<div class="rc-meta">' + esc(sourceLabel(p)) + " · " + p.measures.length + " 度量值</div>" +
      "</div></a>";
  }

  function miniRow(href, code, name, extra) {
    return '<a class="mini-row" href="' + href + '">' +
      (code ? '<span class="code">' + esc(code) + "</span>" : "") +
      '<span class="mini-name">' + esc(name) + "</span>" +
      (extra ? '<span class="muted" style="font-size:10px;color:var(--muted)">' + esc(extra) + "</span>" : "") +
      '<span class="mini-arrow">→</span></a>';
  }

  function renderHome() {
    app.className = "";
    var onlineCount = pages.filter(function (p) { return pageService(p); }).length;
    var shotCount = pages.length - onlineCount;
    var groupsHtml = D.pageGroups.map(function (g) {
      var ps = g.codes.map(function (c) { return pageByCode[c]; }).filter(Boolean);
      if (!ps.length) return "";
      return '<div class="group-block"><h3>' + esc(g.name) + "<span>" + esc(g.desc) + "</span></h3>" +
        '<div class="report-grid">' + ps.map(reportCard).join("") + "</div></div>";
    }).join("");

    var modelRows = factTables.slice(0, 6).map(function (t) {
      return miniRow("#/model/" + encodeURIComponent(t.name), t.code, shortName(t.name, t.code), (t.measureNames || []).length + " 度量值");
    }).join("");

    var mappingRows = mappings.slice(0, 5).map(function (m) {
      return miniRow("#/mappings" + (m.code ? "/" + encodeURIComponent(m.code) : ""), m.code || "其他", m.name, m.sheets.length + " 表");
    }).join("");

    app.innerHTML =
      '<div class="page">' +
        '<div class="hero-report">' +
          '<img class="hero-bg" src="assets/brand/cmoc-hero.jpg" alt="">' +
          '<div class="hero-overlay"></div>' +
          '<div class="hero-inner">' +
            '<img class="hero-logo" src="assets/brand/cmoc-logo-white.png" alt="CMOC 洛阳钼业">' +
            '<div class="hero-rule"></div>' +
            '<span class="page-kicker">CMOC GROUP · L2 MANAGEMENT REPORTING</span>' +
            "<h1>L2 PBI报表开发平台</h1>" +
            "<p>集团管理报表的报表页与语义模型。" + D.stats.contentPages + " 个报表页、" + D.stats.factTables + " 张事实表、" + D.stats.measures + " 个度量值，数据来自 02.PBIP 与 03.项目映射文件。</p>" +
            '<div class="hero-actions">' +
              '<a class="btn primary" href="#/page/L2-01-02">浏览报表页</a>' +
              '<a class="btn" href="#/model">查看语义模型</a>' +
            "</div>" +
          "</div>" +
          '<div class="hero-meta">洛阳钼业 · 财经数据中心<br>数据更新 ' + esc(D.meta.updated) + "</div>" +
        "</div>" +

        '<div class="kpi-strip">' +
          '<div class="kpi-card"><b>' + D.stats.contentPages + '</b><span>报表页</span><small>PBIP</small></div>' +
          '<div class="kpi-card"><b>' + D.stats.measures + '</b><span>度量值</span><small>DAX</small></div>' +
          '<div class="kpi-card"><b>' + D.stats.factTables + '</b><span>事实表</span><small>' + D.stats.relationships + ' 关系</small></div>' +
        "</div>" +

        '<section class="section">' +
          '<div class="section-head"><div><h2>报表页</h2><p>' + D.stats.contentPages + ' 个内容页 · ' + onlineCount + ' 个 Report · 在线 · ' + shotCount + ' 个 PBIP 页面 · 截图</p></div><a class="section-link" href="#/model">语义模型 →</a></div>' +
          '<div class="report-legend"><span><i class="dot online"></i>Report · 在线 <b>' + onlineCount + '</b></span><span><i class="dot shot"></i>PBIP 页面 · 截图 <b>' + shotCount + '</b></span></div>' +
          groupsHtml +
        "</section>" +

        '<div class="two-col">' +
          '<div class="panel"><h3>语义模型 · 事实表</h3><div class="mini-list">' + modelRows + "</div>" +
            '<div style="margin-top:10px"><a class="section-link" href="#/model">全部 ' + factTables.length + ' 张事实表 →</a></div></div>' +
          '<div class="panel"><h3>指标映射 · 排序与维度字典</h3><div class="mini-list">' + mappingRows + "</div>" +
            '<div style="margin-top:10px"><a class="section-link" href="#/mappings">全部 ' + D.stats.mappings + ' 个 →</a></div></div>' +
        "</div>" +
      "</div>";

    setCrumb("<b>工作台</b>");
    document.title = "工作台 · CMOC L2 PBI报表开发平台";
  }

  /* ---------- 报表页详情 ---------- */
  function renderPageDrawer(p) {
    var svc = pageService(p);
    var tableSvc = pageView(p, "table");
    var visualRows = p.visuals.map(function (v) {
      return '<div class="deliver-row">' +
        '<span class="badge html">' + esc(vlabel(v.type)) + "</span>" +
        '<span class="dr-name" title="' + esc(v.refs.join(" · ")) + '">' + esc(v.refs.join(" · ") || "—") + "</span></div>";
    }).join("");

    var tableChips = p.tables.map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("");
    var measureChips = p.measures.map(function (m) { return '<span class="chip src">' + esc(m) + "</span>"; }).join("");

    var deliver = [];
    if (svc) deliver.push('<div class="deliver-row"><span class="badge pbip">Service</span><span class="dr-name">Power BI Service · 可视化页</span><a href="' + serviceUrl(p, "visual") + '" target="_blank" rel="noopener">打开</a></div>');
    if (tableSvc) deliver.push('<div class="deliver-row"><span class="badge pbip">Service</span><span class="dr-name">Power BI Service · 表样页</span><a href="' + serviceUrl(p, "table") + '" target="_blank" rel="noopener">打开</a></div>');
    if (p.screenshot && !svc) deliver.push('<div class="deliver-row"><span class="badge html">截图</span><span class="dr-name">' + esc(p.code) + '.png · ' + (p.screenshotSource === "service" ? "Service 实时" : "PBIP") + '</span><a href="' + url(p.screenshot) + '" target="_blank" rel="noopener">打开</a></div>');
    if (p.mapping) deliver.push('<div class="deliver-row"><span class="badge muted">映射</span><span class="dr-name" title="' + esc(p.mapping.name) + '">' + esc(p.mapping.name) + '</span><a href="#/mappings/' + encodeURIComponent(p.mapping.code || p.mapping.name) + '">在线查看</a></div>');

    drawer.innerHTML =
      '<div class="drawer-head"><h2>报表页详情 <span class="code">' + esc(p.code) + "</span></h2>" +
        '<button class="icon-btn" type="button" id="drawerClose" aria-label="关闭详情">✕</button></div>' +
      '<div class="drawer-body">' +
        '<section><dl class="drawer-meta">' +
          "<dt>页面 ID</dt><dd class=\"mono\" style=\"font-family:var(--mono);font-size:10.5px\">" + esc(p.id) + "</dd>" +
          "<dt>画布</dt><dd>" + p.width + " × " + p.height + "</dd>" +
          "<dt>显示方式</dt><dd>" + esc(p.displayOption || "—") + "</dd>" +
          "<dt>可见性</dt><dd>" + (p.hidden ? "HiddenInViewMode" : "可见") + "</dd>" +
          "<dt>视觉对象</dt><dd>" + p.visualCount + " 个</dd>" +
          "<dt>数据来源</dt><dd>" + esc(sourceLabel(p)) + "</dd>" +
          (svc ? "<dt>Service 报表</dt><dd style=\"font-family:var(--mono);font-size:10.5px\">" + esc(svc.reportId) + "</dd>" : "") +
        "</dl></section>" +
        (svc ? "<section><h3>在线报表</h3><p>该页已在 Power BI Service 发布，需要浏览器已登录 Power BI。" +
          (tableSvc ? " 可在顶部切换「可视化 / 表样」。" : "") + "</p></section>" : "") +
        "<section><h3>视觉构成</h3>" + visualRows + "</section>" +
        "<section><h3>数据表</h3><div class=\"chips\">" + (tableChips || "—") + "</div></section>" +
        "<section><h3>度量值</h3><div class=\"chips\">" + (measureChips || "—") + "</div></section>" +
        "<section><h3>交付文件</h3>" + (deliver.join("") || "—") + "</section>" +
      "</div>";

    var close = document.getElementById("drawerClose");
    if (close) close.addEventListener("click", closeDrawer);
  }

  function renderPage(code) {
    var p = pageByCode[code];
    if (!p) return notFound(code);
    var svc = pageService(p);
    var hasService = !!svc;
    // 有在线报表的页面只保留在线报表，不再提供截图视图
    var hasShot = !hasService && !!p.screenshot;
    var tableAvailable = hasTablePage(p);
    var pageKind = "visual";
    var mode = hasService ? "service" : "shot";
    viewMode = mode;
    var idx = pages.indexOf(p);
    var prev = idx > 0 ? pages[idx - 1] : null;
    var next = idx < pages.length - 1 ? pages[idx + 1] : null;
    var prevBtn = prev ? '<a class="btn small" href="#/page/' + prev.code + '" title="上一页 (←)">←</a>' : '<span class="btn small" style="opacity:.35;pointer-events:none">←</span>';
    var nextBtn = next ? '<a class="btn small" href="#/page/' + next.code + '" title="下一页 (→)">→</a>' : '<span class="btn small" style="opacity:.35;pointer-events:none">→</span>';
    var kindSeg = tableAvailable
      ? '<div class="seg" id="kindSeg" title="切换表样页 / 可视化页">' +
          '<button type="button" data-kind="visual" class="on">可视化</button>' +
          '<button type="button" data-kind="table">表样</button>' +
        "</div>"
      : "";

    app.className = "detail-mode";
    app.innerHTML =
      '<div class="detail-bar">' +
        '<a class="db-back" href="#/" title="返回工作台">←</a>' +
        '<div class="db-title">' +
          '<span class="code">' + esc(p.code) + "</span>" +
          "<h1>" + esc(shortName(p.name, p.code)) + "</h1>" +
          '<span class="db-status ' + (hasService ? "online" : "shot") + '">' + (hasService ? "Report · 在线" : "PBIP 页面 · 截图") + "</span>" +
          '<div class="db-meta"><span>' + p.width + " × " + p.height + '</span><span class="sep">·</span><span>' + p.visualCount + ' 个视觉</span><span class="sep">·</span><span>' + esc(sourceLabel(p)) + "</span>" +
            (hasShot && p.screenshotTime ? '<span class="sep">·</span><span>截图 ' + esc(p.screenshotTime) + "</span>" : "") + "</div>" +
        "</div>" +
        '<div class="db-actions">' +
          prevBtn + nextBtn + kindSeg +
          '<button class="btn" type="button" id="drawerBtn">详情</button>' +
          (hasService ? '<a class="btn" id="svcLink" href="' + serviceUrl(p, "visual") + '" target="_blank" rel="noopener" title="在 Power BI Service 打开">Service ↗</a>' : "") +
          (hasShot ? '<a class="btn" id="shotLink" href="' + url(p.screenshot) + '" target="_blank" rel="noopener" title="新标签打开截图">原图 ↗</a>' : "") +
        "</div>" +
      "</div>" +
      '<div class="report-view' + (mode === "service" ? " service-mode" : "") + '" id="reportView">' +
        (hasService
          ? '<div class="report-loading" id="reportLoading"' + (mode === "service" ? "" : " hidden") + '>' +
              '<span class="spinner" aria-hidden="true"></span>' +
              "<b>正在加载在线报表…</b>" +
              "<span>首次加载可能需要登录 Power BI</span>" +
            "</div>" +
            '<div class="report-timeout" id="reportTimeout" hidden>' +
              "<b>在线报表加载较慢</b>" +
              "<span>可能未登录 Power BI，可点 Service ↗ 打开。</span>" +
            "</div>" +
            '<iframe class="service-frame" id="serviceFrame" src="' + (mode === "service" ? embedUrl(p, "visual") : "") + '" data-src="' + embedUrl(p, "visual") + '" title="' + esc(p.name) + ' Power BI Service 报表" allowfullscreen></iframe>'
          : "") +
        (hasShot
          ? '<img class="report-shot" id="reportShot" src="' + url(p.screenshot) + '" alt="' + esc(p.name) + ' 报表截图">'
          : (hasService ? "" : '<div class="report-note">暂无报表截图</div>')) +
      "</div>";

    renderPageDrawer(p);
    closeDrawer();
    var drawerBtn = document.getElementById("drawerBtn");
    if (drawerBtn) drawerBtn.addEventListener("click", toggleDrawer);
    var frame = document.getElementById("serviceFrame");
    var loading = document.getElementById("reportLoading");
    var timeoutBox = document.getElementById("reportTimeout");
    var loadTimer = null;
    var frameLoaded = false;

    function clearLoadTimer() {
      if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
    }
    function startLoadTimer() {
      clearLoadTimer();
      if (!hasService || viewMode !== "service" || frameLoaded) return;
      loadTimer = setTimeout(function () {
        if (loading) loading.hidden = true;
        if (timeoutBox) timeoutBox.hidden = false;
      }, 12000);
    }
    // 切换「可视化 / 表样」：同步 iframe 页面与 Service 链接
    function setKind(kind) {
      if (kind === pageKind) return;
      pageKind = kind;
      Array.prototype.forEach.call(app.querySelectorAll("#kindSeg button"), function (b) {
        b.classList.toggle("on", b.getAttribute("data-kind") === kind);
      });
      var svcLink = document.getElementById("svcLink");
      if (svcLink) svcLink.setAttribute("href", serviceUrl(p, kind));
      if (timeoutBox) timeoutBox.hidden = true;
      if (frame) {
        frameLoaded = false;
        frame.setAttribute("data-src", embedUrl(p, kind));
        if (loading) loading.hidden = false;
        frame.setAttribute("src", embedUrl(p, kind));
        startLoadTimer();
      }
    }
    if (frame) {
      frame.addEventListener("load", function () {
        if (!frame.getAttribute("src")) return;
        frameLoaded = true;
        if (loading) loading.hidden = true;
        clearLoadTimer();
      });
    }
    if (tableAvailable) {
      Array.prototype.forEach.call(app.querySelectorAll("#kindSeg button"), function (btn) {
        btn.addEventListener("click", function () { setKind(btn.getAttribute("data-kind")); });
      });
    }
    if (viewMode === "service") startLoadTimer();

    setCrumb('<a href="#/">工作台</a><span class="crumb-sep">/</span><b>' + esc(shortName(p.name, p.code)) + "</b>");
    document.title = shortName(p.name, p.code) + " · CMOC L2 PBI报表开发平台";
    syncDetailBarHeight();
  }

  function syncDetailBarHeight() {
    var bar = app.querySelector(".detail-bar");
    var top = bar ? Math.round(bar.getBoundingClientRect().bottom) : 54;
    document.documentElement.style.setProperty("--drawer-top", top + "px");
    var h = bar ? Math.round(bar.getBoundingClientRect().height) : 52;
    document.documentElement.style.setProperty("--detail-bar-h", h + "px");
  }
  window.addEventListener("resize", syncDetailBarHeight);

  /* ---------- 主题总览 ---------- */
  function renderThemeOverview(id) {
    var group = D.pageGroups.filter(function (g) { return g.id === id; })[0];
    if (!group) return notFound(id);
    var ps = group.codes.map(function (c) { return pageByCode[c]; }).filter(Boolean);
    var online = ps.filter(function (p) { return pageService(p); }).length;
    var shots = ps.length - online;

    app.className = "";
    app.innerHTML =
      '<div class="page">' +
        '<div class="page-head">' +
          "<div>" +
            '<span class="page-kicker">THEME · ' + esc(group.name) + "</span>" +
            "<h1>" + esc(group.name) + "</h1>" +
            "<p>" + esc(group.desc) + "</p>" +
          "</div>" +
          '<div class="head-actions"><a class="btn" href="#/">返回工作台</a><a class="btn" href="#/model">语义模型</a></div>' +
        "</div>" +
        '<div class="status-strip" style="margin-top:14px">' +
          '<span class="status-pill"><b>' + ps.length + "</b> 报表页</span>" +
          '<span class="status-pill"><span class="dot green"></span><b>' + online + "</b> Report · 在线</span>" +
          '<span class="status-pill"><span class="dot"></span><b>' + shots + "</b> PBIP 页面 · 截图</span>" +
        "</div>" +
        '<section class="section">' +
          '<div class="section-head"><div><h2>报表页</h2><p>按状态标注：Report · 在线 / PBIP 页面 · 截图</p></div></div>' +
          (ps.length ? '<div class="report-grid">' + ps.map(reportCard).join("") + "</div>" : '<div class="empty-state">该主题暂无报表页</div>') +
        "</section>" +
      "</div>";

    setCrumb('<a href="#/">工作台</a><span class="crumb-sep">/</span><b>' + esc(group.name) + "</b>");
    document.title = group.name + " · CMOC L2 PBI报表开发平台";
  }

  /* ---------- 语义模型 ---------- */
  function modelRow(t) {
    return '<a class="model-row" href="#/model/' + encodeURIComponent(t.name) + '">' +
      '<span class="mr-code">' + esc(t.code) + "</span>" +
      '<span class="mr-name" title="' + esc(t.name) + '">' + esc(shortName(t.name, t.code)) + "</span>" +
      '<span class="mr-num">' + t.columns.length + "</span>" +
      '<span class="mr-num">' + (t.measureNames || []).length + "</span>" +
      '<span class="mr-src">' + esc(t.source.join(" + ")) + "</span>" +
      '<span class="mr-pages">' + t.pages.length + " 页</span>" +
      '<span class="mr-arrow">→</span></a>';
  }

  function renderModelOverview(measureTarget) {
    app.className = "";
    var measureGroups = {};
    var measureOrder = [];
    measures.forEach(function (m, i) {
      m.__idx = i;
      var f = m.folder || "未分组";
      if (!measureGroups[f]) { measureGroups[f] = []; measureOrder.push(f); }
      measureGroups[f].push(m);
    });
    var measureHtml = measureOrder.map(function (folder) {
      var items = measureGroups[folder].map(function (m) {
        return '<details class="measure-item" id="m-' + m.__idx + '"><summary><b>' + esc(m.name) + "</b>" +
          '<span class="fmt">' + esc(m.format || "默认") + '</span><span class="chev">›</span></summary>' +
          '<div class="measure-body">' + (m.description ? '<p class="measure-desc">' + esc(m.description) + "</p>" : "") +
          '<pre class="expr">' + esc(m.expression) + "</pre></div></details>";
      }).join("");
      return '<div class="measure-group"><h3>' + esc(folder) + "<span>" + measureGroups[folder].length + " 个</span></h3>" + items + "</div>";
    }).join("");
    var relHtml = D.relationships.map(function (r) {
      return '<div class="rel-row"><span class="rel-from">' + esc(r.fromTable) + "." + esc(r.fromColumn) + "</span>" +
        '<span class="rel-arrow">→</span>' +
        '<span class="rel-to">' + esc(r.toTable) + "." + esc(r.toColumn) + "</span></div>";
    }).join("");
    var paramHtml = D.parameters.map(function (p) {
      return '<div class="param-card"><b>' + esc(p.name) + "</b><code>" + esc(p.value) + "</code><span>" + esc(p.group || "") + (p.description ? " · " + esc(p.description) : "") + "</span></div>";
    }).join("");
    var roleHtml = D.roles.map(function (r) {
      return '<div class="panel" style="margin-top:10px"><h3>' + esc(r.name) + " · " + esc(r.permission) + "</h3>" +
        "<p style=\"font-size:11.5px;color:var(--muted)\">表权限：" + esc(r.table) + "</p>" +
        '<pre class="expr" style="margin-top:8px">' + esc(r.expression) + "</pre></div>";
    }).join("");

    app.innerHTML =
      '<div class="page">' +
        '<div class="page-head"><div><span class="page-kicker">SEMANTIC MODEL</span><h1>语义模型</h1>' +
          "<p>" + D.stats.factTables + " 张事实表、" + D.stats.measures + " 个度量值、" + D.stats.relationships + " 条关系、" + D.stats.parameters + " 个取数参数。来源：02.PBIP/L2报表.SemanticModel。</p></div>" +
          '<div class="head-actions"><a class="btn" href="#/model" data-jump="model-measures">度量值目录</a><a class="btn" href="#/ui">UI规范</a><a class="btn" href="#/deliverables">交付成果</a></div></div>' +

        '<div class="model-summary">' +
          '<div class="ms-card"><b>' + D.stats.factTables + '</b><span>事实表</span></div>' +
          '<div class="ms-card"><b>' + D.stats.measures + '</b><span>度量值</span></div>' +
          '<div class="ms-card"><b>' + D.stats.relationships + '</b><span>关系</span></div>' +
          '<div class="ms-card"><b>' + D.stats.parameters + '</b><span>参数</span></div>' +
        "</div>" +

        '<section class="section"><div class="section-head"><div><h2>事实表</h2><p>每张表对应一个 L2 报表页</p></div><a class="section-link" href="#/model" data-jump="model-measures">查看度量值 →</a></div>' +
          '<div class="list-card">' +
            '<div class="list-head"><span>编号</span><span>事实表</span><span>列</span><span>度量值</span><span>来源</span><span>页</span><span></span></div>' +
            factTables.map(modelRow).join("") +
          "</div>" +
        "</section>" +

        '<section class="section" id="model-measures">' +
          '<div class="section-head"><div><h2>度量值</h2><p>' + D.stats.measures + " 个 DAX 度量值，按 displayFolder 分组；金额用 FormatAmount，比率用 FormatRatio</p></div></div>" +
          (measureHtml || '<div class="empty-state">暂无度量值</div>') +
        "</section>" +

        '<div class="two-col">' +
          '<div class="panel"><h3>维度与辅助表</h3><div class="mini-list">' +
            dimTables.concat(otherTables).map(function (t) {
              return '<div class="mini-row"><span class="code">' + esc(t.code || KIND_LABEL[t.kind] || t.kind) + '</span><span class="mini-name">' + esc(t.name) + '</span><span style="font-size:10px;color:var(--muted)">' + t.columns.length + " 列 · " + t.measures.length + " 度量值</span></div>";
            }).join("") +
          "</div></div>" +
          '<div class="panel"><h3>关系明细 · ' + D.relationships.length + ' 条</h3><div style="max-height:260px;overflow:auto">' + relHtml + "</div></div>" +
        "</div>" +

        '<section class="section"><div class="section-head"><div><h2>PBIP 取数参数</h2><p>SAP BW / SharePoint / 月份循环 · 部分为快照值，Service 实时报表以线上为准</p></div></div>' +
          '<div class="param-grid">' + paramHtml + "</div>" +
        "</section>" +

        '<section class="section"><div class="section-head"><div><h2>安全角色</h2><p>行级权限按矿体控制</p></div></div>' + roleHtml + "</section>" +
      "</div>";

    Array.prototype.forEach.call(app.querySelectorAll("[data-jump]"), function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        var target = document.getElementById(el.getAttribute("data-jump"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    if (measureTarget) {
      var hit = measures.filter(function (m) { return m.name === measureTarget; })[0];
      if (hit) {
        var mEl = document.getElementById("m-" + hit.__idx);
        if (mEl) {
          mEl.open = true;
          setTimeout(function () { mEl.scrollIntoView({ behavior: "smooth", block: "center" }); }, 60);
        }
      }
    }

    setCrumb('<a href="#/">工作台</a><span class="crumb-sep">/</span><b>语义模型</b>');
    document.title = "语义模型 · CMOC L2 PBI报表开发平台";
  }

  function renderProcess(t) {
    var pr = t.process;
    if (!pr || !pr.mcode) return "";
    var meta = pr.meta || {};
    var order = ["查询名称", "对应报表", "BW对象", "Query", "查询组"];
    var keys = order.filter(function (k) { return meta[k]; });
    Object.keys(meta).forEach(function (k) { if (keys.indexOf(k) < 0 && k !== "说明") keys.push(k); });
    var metaRows = keys.map(function (k) {
      return "<dt>" + esc(k) + "</dt><dd>" + esc(meta[k]) + "</dd>";
    }).join("");
    var notes = (pr.notes || []).map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("");
    var steps = (pr.steps || []).map(function (s) {
      return "<li><b>" + esc(s.name) + "</b>" + (s.comment ? "<span>" + esc(s.comment) + "</span>" : "") + "</li>";
    }).join("");
    var params = (pr.parameters || []).map(function (p) { return '<span class="chip src">' + esc(p) + "</span>"; }).join("");
    return '<section class="section"><div class="section-head"><div><h2>加工过程</h2>' +
        "<p>数据源 → 关键步骤 → 加载 · " + esc(pr.mode || "import") + "</p></div></div>" +
      '<div class="process-grid">' +
        '<div class="process-card"><h3>取数说明</h3>' +
          (metaRows ? '<dl class="process-meta">' + metaRows + "</dl>" : "") +
          (notes ? '<ol class="process-notes">' + notes + "</ol>" : "") +
          (params ? '<h3 class="process-sub">使用参数</h3><div class="chips">' + params + "</div>" : "") +
        "</div>" +
        '<div class="process-card"><h3>关键步骤</h3>' +
          (steps ? '<ol class="process-steps">' + steps + "</ol>" : '<p class="muted" style="font-size:12px">M 代码未包含步骤注释</p>') +
        "</div>" +
      "</div>" +
      '<details class="mcode-block"><summary><span>查看 M 代码</span>' +
        '<span class="mcode-meta">' + pr.lines + ' 行 · ' + esc(pr.mode || "import") + '</span><span class="chev">›</span></summary>' +
        '<div class="mcode-actions"><button class="btn small" type="button" id="copyMcode">复制 M 代码</button></div>' +
        '<pre class="mcode"><code>' + esc(pr.mcode) + "</code></pre></details>" +
    "</section>";
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    ta.remove();
    return Promise.resolve();
  }

  function renderTableDetail(name) {
    var t = tableByName[name];
    if (!t) return notFound(name);

    var cols = t.columns.map(function (c) {
      return "<tr><td class=\"mono\">" + esc(c.name) + "</td><td class=\"muted\">" + esc(c.dataType || "") + "</td>" +
        "<td class=\"muted\">" + (c.hidden ? "是" : "") + "</td><td class=\"muted mono\">" + esc(c.formatString || "") + "</td>" +
        "<td class=\"muted\">" + esc(c.summarizeBy || "") + "</td><td class=\"muted\">" + esc(c.sortByColumn || "") + "</td></tr>";
    }).join("");

    var tableMeasures = measures.filter(function (m) { return m.folder === t.name; });
    var measureHtml = tableMeasures.map(function (m) {
      var idx = measures.indexOf(m);
      return '<details class="measure-item" id="m-' + idx + '"><summary><b>' + esc(m.name) + "</b>" +
        '<span class="fmt">' + esc(m.format || "默认") + '</span><span class="chev">›</span></summary>' +
        '<div class="measure-body">' + (m.description ? '<p class="measure-desc">' + esc(m.description) + "</p>" : "") +
        '<pre class="expr">' + esc(m.expression) + "</pre></div></details>";
    }).join("");

    var relHtml = t.relationships.map(function (r) {
      var from = r.fromTable === t.name;
      return '<div class="rel-row"><span class="rel-from">' + esc(r.fromTable) + "." + esc(r.fromColumn) + "</span>" +
        '<span class="rel-arrow">→</span><span class="rel-to">' + esc(r.toTable) + "." + esc(r.toColumn) + "</span>" +
        '<span class="badge muted">' + (from ? "主表" : "被引用") + "</span></div>";
    }).join("");

    var pageLinks = t.pages.map(function (code) {
      var p = pageByCode[code];
      return p ? '<a class="chip src" href="#/page/' + code + '">' + esc(code) + " " + esc(shortName(p.name, p.code)) + "</a>" : "";
    }).join("");
    var mapping = mappings.filter(function (m) { return m.code === t.code; })[0];
    var processHtml = renderProcess(t);

    app.className = "";
    app.innerHTML =
      '<div class="page">' +
        '<div class="page-head"><div><span class="page-kicker">' + esc(KIND_LABEL[t.kind] || t.kind.toUpperCase()) + "</span>" +
          "<h1>" + esc(shortName(t.name, t.code) || t.name) + "</h1>" +
          "<p>" + esc(t.name) + " · " + esc(t.source.join(" + ")) + "</p></div>" +
          '<div class="head-actions"><a class="btn" href="#/model">返回语义模型</a>' +
          (mapping ? '<a class="btn" href="#/mappings/' + encodeURIComponent(mapping.code || mapping.name) + '">指标映射 · 在线</a>' : "") +
          "</div></div>" +

        '<div class="model-summary">' +
          '<div class="ms-card"><b>' + t.columns.length + '</b><span>列</span></div>' +
          '<div class="ms-card"><b>' + tableMeasures.length + '</b><span>度量值</span></div>' +
          '<div class="ms-card"><b>' + t.relationships.length + '</b><span>关系</span></div>' +
          '<div class="ms-card"><b>' + t.pages.length + '</b><span>引用报表页</span></div>' +
        "</div>" +

        '<section class="section"><div class="section-head"><div><h2>列</h2><p>来自 TMDL 定义</p></div></div>' +
          '<div class="table-wrap"><table class="data-table"><thead><tr><th>列名</th><th>数据类型</th><th>隐藏</th><th>格式</th><th>汇总</th><th>排序</th></tr></thead><tbody>' + (cols || '<tr><td colspan="6" class="muted">无列定义</td></tr>') + "</tbody></table></div>" +
        "</section>" +

        processHtml +

        (tableMeasures.length ? '<section class="section"><div class="section-head"><div><h2>度量值</h2><p>' + tableMeasures.length + " 个</p></div><a class=\"section-link\" href=\"#/model\">全部度量值 →</a></div>" + measureHtml + "</section>" : "") +

        '<div class="two-col">' +
          '<div class="panel"><h3>关系</h3>' + (relHtml || '<p style="font-size:12px;color:var(--muted)">无关系</p>') + "</div>" +
          '<div class="panel"><h3>引用报表页</h3><div class="chips">' + (pageLinks || "—") + "</div></div>" +
        "</div>" +
      "</div>";

    var copyMcode = document.getElementById("copyMcode");
    if (copyMcode && t.process) {
      copyMcode.addEventListener("click", function () {
        copyText(t.process.mcode).then(function () {
          copyMcode.textContent = "已复制";
          setTimeout(function () { copyMcode.textContent = "复制 M 代码"; }, 1600);
        });
      });
    }

    setCrumb('<a href="#/">工作台</a><span class="crumb-sep">/</span><a href="#/model">语义模型</a><span class="crumb-sep">/</span><b>' + esc(shortName(t.name, t.code) || t.name) + "</b>");
    document.title = (shortName(t.name, t.code) || t.name) + " · 语义模型";
  }

  /* ---------- 指标映射 ---------- */
  function renderMappings(target) {
    app.className = "";
    var html = mappings.map(function (m, i) {
      var open = target && (m.code === target || m.name === target);
      var sheets = m.sheets.map(function (s) {
        var sample = "";
        if (s.samples && s.samples.length) {
          var head = s.samples[0].slice(0, 5);
          var rows = s.samples.slice(1, 4).map(function (r) {
            return "<tr>" + r.slice(0, 5).map(function (v) { return "<td>" + esc(v) + "</td>"; }).join("") + "</tr>";
          }).join("");
          sample = '<table class="sample-table"><thead><tr>' + head.map(function (v) { return "<th>" + esc(v) + "</th>"; }).join("") + "</tr></thead><tbody>" + rows + "</tbody></table>";
        }
        return '<div class="sheet-card"><h4>' + esc(s.name) + "</h4>" +
          '<div class="sheet-meta">' + s.rows + " 行 × " + s.cols + " 列</div>" + sample + "</div>";
      }).join("");
      var fileName = String(m.file || "").split("/").pop();
      return '<details class="mapping-item" id="map-' + i + '"' + (open ? " open" : "") + ">" +
        '<summary><span class="code">' + esc(m.code || "其他") + "</span><span>" + esc(m.name) + "</span>" +
        '<span class="mm-count">' + m.sheets.length + " 个工作表</span></summary>" +
        '<div class="mapping-body">' +
          '<div class="mapping-toolbar">' +
            '<button class="btn small primary" type="button" data-excel="' + i + '" aria-expanded="false" aria-controls="excel-' + i + '">在线 Excel</button>' +
            '<a class="btn small" href="' + esc(excelViewerUrl(m.file, false)) + '" target="_blank" rel="noopener">新窗口 ↗</a>' +
            '<a class="btn small" href="' + url(m.file) + '" download>下载 xlsx</a>' +
            '<span class="excel-file" title="' + esc(fileName) + '">' + esc(fileName) + "</span>" +
          "</div>" +
          '<div class="excel-panel" id="excel-' + i + '" hidden>' +
            '<div class="excel-loading" id="excel-loading-' + i + '">' +
              '<span class="spinner" aria-hidden="true"></span>' +
              "<b>正在加载在线 Excel…</b>" +
              "<span>Office 网页版 · 需联网；离线请用「下载 xlsx」</span>" +
            "</div>" +
            '<iframe class="excel-frame" data-src="' + esc(excelViewerUrl(m.file, true)) + '" title="' + esc(m.name) + ' 在线 Excel"></iframe>' +
          "</div>" +
          sheets +
        "</div></details>";
    }).join("");

    app.innerHTML =
      '<div class="page">' +
        '<div class="page-head"><div><span class="page-kicker">MAPPINGS</span><h1>指标映射</h1>' +
          "<p>来自 03.项目映射文件，共 " + D.stats.mappings + " 个 Excel；每个文件包含排序表、维度字典与取数说明。</p></div>" +
          '<div class="head-actions"><a class="btn" href="#/model">语义模型</a><a class="btn" href="#/ui">UI规范</a></div></div>' +
        '<div class="hint">点「在线 Excel」会在页面内用 Office 网页版打开完整工作簿（工作表、公式、筛选都能操作），读取的是已发布站点上的副本；离线或尚未发布时请用「下载 xlsx」。下方表格只展示每个工作表的前 3 行样例。</div>' +
        (html || '<div class="empty-state">暂无映射文件</div>') +
      "</div>";

    /* 在线 Excel：首次展开时才加载 iframe，避免一次拉十几个工作簿 */
    Array.prototype.forEach.call(app.querySelectorAll("[data-excel]"), function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".mapping-item");
        var panel = item ? item.querySelector(".excel-panel") : null;
        if (!panel) return;
        var show = panel.hidden;
        // 同一时间只展开一个工作簿，避免多个 Office 网页版实例同时占内存
        if (show) {
          Array.prototype.forEach.call(app.querySelectorAll(".excel-panel:not([hidden])"), function (p) {
            if (p === panel) return;
            p.hidden = true;
            var other = p.closest(".mapping-item");
            var otherBtn = other ? other.querySelector("[data-excel]") : null;
            if (otherBtn) {
              otherBtn.textContent = "在线 Excel";
              otherBtn.setAttribute("aria-expanded", "false");
            }
          });
        }
        panel.hidden = !show;
        btn.textContent = show ? "收起 Excel" : "在线 Excel";
        btn.setAttribute("aria-expanded", show ? "true" : "false");
        var frame = panel.querySelector(".excel-frame");
        var loading = panel.querySelector(".excel-loading");
        if (show && frame) {
          if (!frame.getAttribute("src")) {
            var done = false;
            frame.addEventListener("load", function () {
              done = true;
              if (loading) loading.hidden = true;
            });
            frame.setAttribute("src", frame.getAttribute("data-src"));
            // 跨域 iframe 无法感知失败，超时后只收起转圈并提示用新窗口
            setTimeout(function () {
              if (!done && loading) {
                loading.innerHTML = "<b>在线 Excel 加载较慢</b><span>可点「新窗口 ↗」在 Office 网页版打开；离线请用「下载 xlsx」。</span>";
              }
            }, 15000);
          }
          setTimeout(function () { panel.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
        }
      });
    });

    if (target) {
      var hitIdx = mappings.findIndex(function (m) { return m.code === target || m.name === target; });
      if (hitIdx >= 0) {
        var el = document.getElementById("map-" + hitIdx);
        if (el) setTimeout(function () { el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 60);
      }
    }

    setCrumb('<a href="#/">工作台</a><span class="crumb-sep">/</span><b>指标映射</b>');
    document.title = "指标映射 · CMOC L2 PBI报表开发平台";
  }

  /* ---------- UI 规范 ---------- */
  function uiLayoutFigure(page) {
    var blocks = page.blocks.map(function (b) {
      var style = "left:" + (b[0] / 1920 * 100).toFixed(3) + "%;top:" + (b[1] / 1080 * 100).toFixed(3) +
        "%;width:" + (b[2] / 1920 * 100).toFixed(3) + "%;height:" + (b[3] / 1080 * 100).toFixed(3) + "%";
      var note = b[5] + " · (" + b[0] + ", " + b[1] + ") " + b[2] + "×" + b[3];
      return '<span class="lb lb-' + b[4] + '" style="' + style + '" title="' + esc(note) + '"><i>' + esc(b[5]) + "</i></span>";
    }).join("");
    return '<figure class="layout-fig">' +
      '<div class="layout-canvas">' + blocks + "</div>" +
      '<figcaption><b>' + esc(page.name) + "</b><span>" + esc(page.meta) + "</span></figcaption></figure>";
  }

  function uiSwatch(c) {
    return '<button class="swatch" type="button" data-hex="' + esc(c.hex) + '" title="点击复制 ' + esc(c.hex) + '">' +
      '<span class="swatch-chip" style="background:' + esc(c.hex) + '"></span>' +
      '<span class="swatch-body"><b>' + esc(c.name) + '</b><code>' + esc(c.hex) + '</code>' +
      "<small>" + esc(c.use) + "</small></span></button>";
  }

  var UI_NAV = [
    ["ui-principles", "设计目标"],
    ["ui-rules", "命名规则"],
    ["ui-canvas", "画布栅格"],
    ["ui-colors", "色彩"],
    ["ui-type", "字体"],
    ["ui-components", "组件"],
    ["ui-layouts", "页面布局"],
    ["ui-interaction", "交互"],
    ["ui-theme", "主题"],
    ["ui-checklist", "检查清单"],
    ["ui-issues", "已知问题"],
    ["ui-changelog", "变更记录"]
  ];

  function renderUiGuide() {
    var S = window.L2_UI_SPEC;
    if (!S) return notFound("UI规范");
    app.className = "";

    var navHtml = UI_NAV.map(function (n) {
      return '<a class="ui-nav-item" href="#/ui" data-anchor="' + n[0] + '">' + esc(n[1]) + "</a>";
    }).join("");

    var scopeHtml = S.scope.list.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    var principlesHtml = S.principles.map(function (p) {
      return '<div class="principle"><b>' + esc(p.title) + "</b><p>" + esc(p.desc) + "</p></div>";
    }).join("");
    var rulesHtml = S.rules.map(function (r) {
      return '<div class="rule-card"><span class="rule-n">' + esc(r.n) + "</span>" +
        "<b>" + esc(r.name) + "</b><p>" + esc(r.desc) + "</p></div>";
    }).join("");
    var canvasRows = S.canvas.map(function (r) {
      return "<tr><th>" + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td></tr>";
    }).join("");
    var bandRows = S.bands.map(function (r) {
      return "<tr><td>" + esc(r[0]) + '</td><td class="mono">' + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td><td>" + esc(r[3]) + "</td></tr>";
    }).join("");
    var tabRows = S.tabOrder.map(function (r) {
      return "<tr><td>" + esc(r[0]) + '</td><td class="mono">' + esc(r[1]) + "</td></tr>";
    }).join("");

    var gridFigure = uiLayoutFigure({
      name: "栅格示意 · 1920 × 1080",
      meta: "外边距 24 · 栏间距 24 · 内容区 x 24→1896 / y 28→1056",
      blocks: [
        [24, 28, 1872, 56, "title", "标题区 28–84"],
        [24, 104, 1872, 84, "filter", "筛选区 104–188"],
        [24, 212, 924, 844, "matrix", "左栏 x=24 · 宽 924"],
        [972, 212, 924, 844, "chart", "右栏 x=972 · 宽 924"]
      ]
    });

    var mainSwatches = S.colors.main.map(uiSwatch).join("");
    var statusSwatches = S.colors.status.map(uiSwatch).join("");
    var statusRulesHtml = S.colors.statusRules.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    var chartRulesHtml = S.colors.chart.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    var matrixRows = S.colors.matrix.map(function (r) {
      return "<tr><th>" + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td></tr>";
    }).join("");

    var typeRows = S.type.map(function (t) {
      var color = t.color.charAt(0) === "#" ? t.color : "#5B6678";
      return '<div class="type-row">' +
        '<div class="type-sample" style="font-size:' + t.sample + "px;color:" + color + '">Aa 集团合并利润</div>' +
        '<div class="type-meta"><b>' + esc(t.pos) + "</b><span>" + esc(t.size) + " · " + esc(t.weight) + "</span></div>" +
        '<span class="type-color"><i style="background:' + color + '"></i>' + esc(t.color) + "</span>" +
        '<span class="type-align">' + esc(t.align) + "</span></div>";
    }).join("");

    var componentHtml = S.components.map(function (c) {
      return '<div class="spec-card"><div class="spec-card-head"><h3>' + esc(c.name) + "</h3>" +
        '<span class="badge html">' + esc(c.tag) + "</span></div><ul>" +
        c.items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>";
    }).join("");

    var layoutsHtml = S.layouts.map(uiLayoutFigure).join("");

    var interactionRows = S.interaction.map(function (r) {
      return "<tr><th>" + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td></tr>";
    }).join("");

    var themeChips = S.theme.dataColors.map(function (hex, i) {
      return '<span class="theme-chip"><i style="background:' + esc(hex) + '"></i><span>' + esc(hex) + "</span><small>" + (i + 1) + "</small></span>";
    }).join("");
    var themeNotes = S.theme.notes.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");

    var pbirHtml = S.pbir.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");

    var checklistHtml = S.checklist.map(function (t, i) {
      return '<label class="check-item"><input type="checkbox" data-check="' + i + '">' +
        '<span class="check-box" aria-hidden="true"></span>' +
        '<span class="check-no">' + (i + 1) + "</span>" +
        '<span class="check-text">' + esc(t) + "</span></label>";
    }).join("");

    var issuesHtml = S.issues.map(function (r) {
      return '<tr><td class="issue-name">' + esc(r[0]) + '</td><td class="issue-impact">' + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>";
    }).join("");

    var changelogHtml = S.changelog.map(function (r) {
      return '<li class="log-row"><span class="log-v">' + esc(r[0]) + "</span>" +
        '<span class="log-date">' + esc(r[1]) + "</span><span class=\"log-text\">" + esc(r[2]) + "</span></li>";
    }).join("");

    app.innerHTML =
      '<div class="page ui-page">' +
        '<div class="page-head"><div><span class="page-kicker">UI SPECIFICATION · ' + esc(S.version) + "</span>" +
          "<h1>UI规范</h1>" +
          "<p>「" + esc(S.northStar.title) + "」——L2 表样 POC 十个报表、十五个页面的统一视觉语言。整理自 " + esc(S.source) + "（" + esc(S.version) + "，" + esc(S.date) + "）。</p></div>" +
          '<div class="head-actions"><a class="btn" href="#/model">语义模型</a><a class="btn" href="#/page/L2-01-02">看一张报表页</a></div></div>' +

        '<div class="status-strip">' +
          '<span class="status-pill"><b>' + S.scope.reports + "</b> 个报表</span>" +
          '<span class="status-pill"><b>' + S.scope.pages + "</b> 个页面</span>" +
          '<span class="status-pill"><b>' + S.scope.visuals + '</b> 个视觉对象</span>' +
          '<span class="status-pill"><span class="dot green"></span>文档版本 <b>' + esc(S.version) + "</b></span>" +
        "</div>" +

        '<div class="ui-nav">' + navHtml + "</div>" +

        '<section class="section ui-section" id="ui-principles">' +
          '<div class="section-head"><div><h2>设计目标</h2><p>Creative North Star：「' + esc(S.northStar.title) + "」</p></div></div>" +
          '<blockquote class="ui-quote">' + esc(S.northStar.desc) + "</blockquote>" +
          '<div class="principle-grid">' + principlesHtml + "</div>" +
          '<details class="ui-scope"><summary><span>适用范围 · ' + S.scope.reports + " 个报表 / " + S.scope.pages + ' 个页面</span><span class="chev">›</span></summary>' +
            '<ul class="ui-scope-list">' + scopeHtml + "</ul></details>" +
        "</section>" +

        '<section class="section ui-section" id="ui-rules">' +
          '<div class="section-head"><div><h2>命名规则</h2><p>四条不可协商的硬规则，改任何报表前先对照</p></div></div>' +
          '<div class="rule-grid">' + rulesHtml + "</div>" +
        "</section>" +

        '<section class="section ui-section" id="ui-canvas">' +
          '<div class="section-head"><div><h2>画布与栅格</h2><p>1920 × 1080 · FitToPage · 24px 网格，所有页面共用</p></div></div>' +
          '<div class="split">' +
            '<div class="spec-panel"><table class="kv-table">' + canvasRows + "</table></div>" +
            gridFigure +
          "</div>" +
          '<div class="split" style="margin-top:14px">' +
            '<div class="spec-panel"><h3>竖向分区</h3><table class="data-table"><thead><tr><th>区带</th><th>y 范围</th><th>高度</th><th>内容</th></tr></thead><tbody>' + bandRows + "</tbody></table></div>" +
            '<div class="spec-panel"><h3>阅读顺序 tabOrder</h3><table class="kv-table">' + tabRows + "</table>" +
              '<p class="spec-note">键盘与读屏顺序与视觉顺序一致：标题 → 筛选 → 指标卡 → 内容。</p></div>' +
          "</div>" +
        "</section>" +

        '<section class="section ui-section" id="ui-colors">' +
          '<div class="section-head"><div><h2>色彩</h2><p>一个主色 + 一组状态色；点色块可复制色值</p></div></div>' +
          '<h3 class="sub-h">主色板</h3><div class="swatch-grid">' + mainSwatches + "</div>" +
          '<h3 class="sub-h">状态色 · 唯一允许的红绿入口</h3><div class="swatch-grid two">' + statusSwatches + "</div>" +
          '<ul class="ui-list">' + statusRulesHtml + "</ul>" +
          '<h3 class="sub-h">图表配色</h3><ul class="ui-list">' + chartRulesHtml + "</ul>" +
          '<div class="split" style="margin-top:14px">' +
            '<div class="spec-panel"><h3>表页矩阵配色（沿用主题）</h3><table class="kv-table">' + matrixRows + "</table></div>" +
            '<div class="spec-panel"><h3>色值速查</h3><pre class="expr ui-code">主色            #1A2538\n次级文字        #5B6678\n数据标签        #334155\n网格线          #E8EEF6\n正向状态        #059669\n负向状态        #B91C1C\n树状图渐变      #D6E0EC → #1A2538\n画布            #FFFFFF</pre></div>' +
          "</div>" +
        "</section>" +

        '<section class="section ui-section" id="ui-type">' +
          '<div class="section-head"><div><h2>字体与字号</h2><p>统一微软雅黑；字号按角色固定，不随容器缩放</p></div></div>' +
          '<div class="type-table">' + typeRows + "</div>" +
          '<p class="spec-note">' + esc(S.typeNote) + "</p>" +
        "</section>" +

        '<section class="section ui-section" id="ui-components">' +
          '<div class="section-head"><div><h2>组件规范</h2><p>容器、图表、切片器、指标卡、矩阵、文本框</p></div></div>' +
          '<div class="spec-grid">' + componentHtml + "</div>" +
        "</section>" +

        '<section class="section ui-section" id="ui-layouts">' +
          '<div class="section-head"><div><h2>页面布局</h2><p>按 DESIGN.md 记录的真实坐标绘制（1920 × 1080 等比缩放，悬停看坐标）</p></div></div>' +
          '<div class="layout-grid">' + layoutsHtml + "</div>" +
          '<div class="legend-row"><span><i class="lg-title"></i>文本框</span><span><i class="lg-filter"></i>切片器</span><span><i class="lg-card"></i>指标卡</span><span><i class="lg-matrix"></i>矩阵</span><span><i class="lg-chart"></i>图表</span></div>' +
        "</section>" +

        '<section class="section ui-section" id="ui-interaction">' +
          '<div class="section-head"><div><h2>交互与可见性</h2><p>起始页、隐藏页、页面筛选与 NoFilter 例外</p></div></div>' +
          '<div class="spec-panel"><table class="kv-table wide">' + interactionRows + "</table></div>" +
        "</section>" +

        '<section class="section ui-section" id="ui-theme">' +
          '<div class="section-head"><div><h2>主题与内置 Visual</h2><p>颜色与字体由报表主题统一控制；逐 visual 覆盖必须取自上面色板</p></div></div>' +
          '<div class="spec-panel"><h3>主题 ' + esc(S.theme.base) + '</h3><p class="spec-note">' + esc(S.theme.files) + "</p>" +
            '<div class="theme-chips">' + themeChips + "</div>" +
            '<ul class="ui-list">' + themeNotes + "</ul></div>" +
          '<div class="spec-panel" style="margin-top:14px"><h3>PBIR 实现要点</h3><ul class="ui-list">' + pbirHtml + "</ul></div>" +
        "</section>" +

        '<section class="section ui-section" id="ui-checklist">' +
          '<div class="section-head"><div><h2>统一检查清单</h2><p>改任一报表前逐项自检 · 已确认 <b id="checkCount">0</b> / ' + S.checklist.length + "</p></div>" +
            '<button class="btn small" type="button" id="checkReset">重置</button></div>' +
          '<div class="check-list">' + checklistHtml + "</div>" +
        "</section>" +

        '<section class="section ui-section" id="ui-issues">' +
          '<div class="section-head"><div><h2>已知问题</h2><p>不影响当前渲染，记录待处理项与建议</p></div></div>' +
          '<div class="table-wrap"><table class="data-table issue-table"><thead><tr><th>问题</th><th>影响</th><th>建议</th></tr></thead><tbody>' + issuesHtml + "</tbody></table></div>" +
        "</section>" +

        '<section class="section ui-section" id="ui-changelog">' +
          '<div class="section-head"><div><h2>变更记录</h2><p>' + S.changelog.length + " 次迭代 · 当前 " + esc(S.version) + "</p></div></div>" +
          '<ol class="log-list">' + changelogHtml + "</ol>" +
        "</section>" +
      "</div>";

    /* 页内导航：锚点滚动（hash 保持 #/ui，便于刷新与分享） */
    Array.prototype.forEach.call(app.querySelectorAll(".ui-nav-item"), function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        var target = document.getElementById(el.getAttribute("data-anchor"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    /* 色块复制 */
    Array.prototype.forEach.call(app.querySelectorAll(".swatch"), function (el) {
      el.addEventListener("click", function () {
        copyText(el.getAttribute("data-hex")).then(function () {
          el.classList.add("copied");
          setTimeout(function () { el.classList.remove("copied"); }, 1200);
        });
      });
    });

    /* 检查清单：本地记住勾选状态 */
    var boxes = app.querySelectorAll("[data-check]");
    var countEl = document.getElementById("checkCount");
    function updateCount() {
      var n = 0;
      Array.prototype.forEach.call(boxes, function (b) { if (b.checked) n += 1; });
      if (countEl) countEl.textContent = n;
    }
    var saved = [];
    try {
      saved = JSON.parse(localStorage.getItem("l2-ui-checklist") || "[]");
    } catch (e) { saved = []; }
    if (saved && saved.length) {
      Array.prototype.forEach.call(boxes, function (b) {
        b.checked = saved.indexOf(Number(b.getAttribute("data-check"))) >= 0;
      });
    }
    updateCount();
    Array.prototype.forEach.call(boxes, function (b) {
      b.addEventListener("change", function () {
        var picked = [];
        Array.prototype.forEach.call(boxes, function (x) {
          if (x.checked) picked.push(Number(x.getAttribute("data-check")));
        });
        try { localStorage.setItem("l2-ui-checklist", JSON.stringify(picked)); } catch (e) { /* 忽略 */ }
        updateCount();
      });
    });
    var resetBtn = document.getElementById("checkReset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        Array.prototype.forEach.call(boxes, function (b) { b.checked = false; });
        try { localStorage.removeItem("l2-ui-checklist"); } catch (e) { /* 忽略 */ }
        updateCount();
      });
    }

    setCrumb('<a href="#/">工作台</a><span class="crumb-sep">/</span><b>UI规范</b>');
    document.title = "UI规范 · CMOC L2 PBI报表开发平台";
  }

  /* ---------- 交付成果 ---------- */
  function renderDeliverables() {
    app.className = "";
    var onlineCount = pages.filter(function (p) { return pageService(p); }).length;
    var shotCount = pages.length - onlineCount;
    var sampleCodes = Object.keys(service.reports || {});
    var configured = sampleCodes.filter(function (code) {
      var r = service.reports[code];
      return r && r.reportId;
    }).length;
    var pageList = pages.map(function (p) { return "<span>" + esc(p.code + " " + shortName(p.name, p.code)) + "</span>"; }).join("");
    var serviceList = sampleCodes.map(function (code) {
      var p = pageByCode[code];
      var r = service.reports[code];
      if (r && r.reportId) {
        return '<a class="chip src" href="' + serviceUrl(p) + '" target="_blank" rel="noopener">' + esc(code) + " · 已接入</a>";
      }
      return '<span class="chip">' + esc(code) + " · 未配置</span>";
    }).join("");

    app.innerHTML =
      '<div class="page">' +
        '<div class="page-head"><div><span class="page-kicker">DELIVERABLES</span><h1>交付成果</h1>' +
          "<p>PBIP 报表工程与 " + D.stats.contentPages + " 页报表。" + onlineCount + " 个已在 Service 发布在线报表的页面默认在线嵌入；其余 " + shotCount + " 页使用 Power BI Desktop 导出的截图。</p></div>" +
          '<div class="head-actions"><a class="btn" href="#/model">语义模型</a></div></div>' +

        '<section class="section"><div class="pbip-panel">' +
          '<span class="page-kicker">PBIP PROJECT</span><h2>' + esc(D.reportMeta.name) + "</h2>" +
          '<div class="pbip-stats">' +
            '<div class="pbip-stat"><b>' + D.stats.pages + "</b><span>报表页面</span></div>" +
            '<div class="pbip-stat"><b>' + D.stats.measures + "</b><span>度量值</span></div>" +
            '<div class="pbip-stat"><b>' + D.stats.factTables + "</b><span>事实表</span></div>" +
            '<div class="pbip-stat"><b>' + D.stats.relationships + "</b><span>关系</span></div>" +
          "</div>" +
          '<dl class="kv-block">' +
            "<dt>工程路径</dt><dd><span class=\"path\">" + esc(D.reportMeta.path) + "</span></dd>" +
            "<dt>PBIP 报表</dt><dd>" + (service.pbipReportId ? '<a class="path" href="https://app.powerbi.com/reports/' + encodeURIComponent(service.pbipReportId) + '" target="_blank" rel="noopener">' + esc(service.pbipReportId) + "</a>" : "未绑定") + "</dd>" +
            "<dt>表样 Service</dt><dd>" + configured + " / " + sampleCodes.length + " 已配置</dd>" +
            "<dt>默认工作区</dt><dd>" + (service.workspaceId ? esc(service.workspaceId) : "未配置（按各报表地址解析）") + "</dd>" +
            "<dt>报表目录</dt><dd><span class=\"path\">" + esc(D.reportMeta.reportPath) + "</span></dd>" +
            "<dt>模型目录</dt><dd><span class=\"path\">" + esc(D.reportMeta.modelPath) + "</span></dd>" +
            "<dt>兼容级别</dt><dd>" + esc(D.reportMeta.compatibilityLevel) + " · " + esc(D.reportMeta.culture) + "</dd>" +
            "<dt>主题</dt><dd>" + esc(D.reportMeta.theme) + "</dd>" +
            "<dt>画布</dt><dd>" + esc(D.reportMeta.pageSize) + "</dd>" +
          "</dl>" +
          '<h3 style="margin-top:18px;font-size:12px;color:var(--muted)">表样 Service 报表</h3>' +
          '<div class="pbip-list">' + serviceList + "</div>" +
          '<h3 style="margin-top:18px;font-size:12px;color:var(--muted)">报表页</h3>' +
          '<div class="pbip-list">' + pageList + "</div>" +
        "</div></section>" +
      "</div>";

    setCrumb('<a href="#/">工作台</a><span class="crumb-sep">/</span><b>交付成果</b>');
    document.title = "交付成果 · CMOC L2 PBI报表开发平台";
  }

  /* ---------- 抽屉 ---------- */
  function openDrawer() {
    if (routeInfo().section !== "page") return;
    body.classList.add("drawer-open");
    drawer.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    body.classList.remove("drawer-open");
    drawer.setAttribute("aria-hidden", "true");
  }
  function toggleDrawer() {
    if (body.classList.contains("drawer-open")) closeDrawer();
    else openDrawer();
  }

  function closeMobileNav() { body.classList.remove("nav-open"); }

  /* ---------- 键盘 ---------- */
  function goRelative(delta) {
    var info = routeInfo();
    if (info.section !== "page") return;
    var p = pageByCode[info.arg];
    if (!p) return;
    var i = pages.indexOf(p);
    var target = pages[i + delta];
    if (target) location.hash = "#/page/" + target.code;
  }

  document.addEventListener("keydown", function (e) {
    var tag = document.activeElement ? document.activeElement.tagName : "";
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);

    if (e.key === "Escape") {
      if (typing) { searchInput.blur(); closeSearch(); return; }
      if (body.classList.contains("drawer-open")) { closeDrawer(); return; }
      if (body.classList.contains("nav-open")) { closeMobileNav(); return; }
      return;
    }
    if (typing) return;
    if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); searchInput.focus(); return; }
    if (e.key === "ArrowLeft" && !e.ctrlKey && !e.metaKey) { if (routeInfo().section === "page") { e.preventDefault(); goRelative(-1); } return; }
    if (e.key === "ArrowRight" && !e.ctrlKey && !e.metaKey) { if (routeInfo().section === "page") { e.preventDefault(); goRelative(1); } return; }
    if ((e.key === "d" || e.key === "D") && !e.ctrlKey && !e.metaKey && !e.altKey && routeInfo().section === "page") toggleDrawer();
  });

  /* ---------- 搜索 ---------- */
  var searchIndex = [];
  function buildSearchIndex() {
    searchIndex = [];
    pages.forEach(function (p) {
      searchIndex.push({ kind: "报表页", code: p.code, name: shortName(p.name, p.code), route: "#/page/" + p.code, desc: p.tables.join(" ") });
    });
    D.tables.forEach(function (t) {
      searchIndex.push({ kind: t.kind === "fact" ? "事实表" : "模型表", code: t.code, name: shortName(t.name, t.code), route: "#/model/" + encodeURIComponent(t.name), desc: t.source.join(" ") });
    });
    measures.forEach(function (m) {
      searchIndex.push({ kind: "度量值", code: "", name: m.name, route: "#/measures/" + encodeURIComponent(m.name), desc: m.folder });
    });
    mappings.forEach(function (m) {
      searchIndex.push({ kind: "指标映射", code: m.code, name: m.name, route: "#/mappings" + (m.code ? "/" + encodeURIComponent(m.code) : ""), desc: "指标映射 Excel 在线查看" });
    });
    searchIndex.push({ kind: "UI规范", code: "", name: "UI规范 " + (window.L2_UI_SPEC ? window.L2_UI_SPEC.version : ""), route: "#/ui", desc: "色彩 字体 栅格 组件 页面布局 检查清单 设计规范 DESIGN" });
  }

  function searchMatches(q) {
    var needle = q.trim().toLowerCase();
    if (!needle) return [];
    return searchIndex.filter(function (item) {
      return [item.kind, item.code, item.name, item.desc].join(" ").toLowerCase().indexOf(needle) !== -1;
    }).slice(0, 8);
  }

  function closeSearch() {
    searchResults.classList.remove("open");
    searchResults.innerHTML = "";
  }

  function openResults(items) {
    if (!items.length) {
      searchResults.innerHTML = '<div class="sr-empty">没有匹配项</div>';
    } else {
      searchResults.innerHTML = items.map(function (item) {
        return '<button type="button" class="sr-item" data-route="' + esc(item.route) + '">' +
          (item.code ? '<span class="code">' + esc(item.code) + "</span>" : "") +
          '<span class="sr-name">' + esc(item.name) + "</span>" +
          '<span class="sr-kind">' + esc(item.kind) + "</span></button>";
      }).join("");
    }
    searchResults.classList.add("open");
  }

  function goRoute(route) {
    searchInput.value = "";
    closeSearch();
    location.hash = route;
  }

  searchInput.addEventListener("input", function () {
    var q = searchInput.value;
    if (!q.trim()) { closeSearch(); return; }
    openResults(searchMatches(q));
  });
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var first = searchResults.querySelector(".sr-item");
      if (first) goRoute(first.getAttribute("data-route"));
    } else if (e.key === "Escape") {
      searchInput.blur();
      closeSearch();
    }
  });
  searchResults.addEventListener("click", function (e) {
    var item = e.target.closest(".sr-item");
    if (item) goRoute(item.getAttribute("data-route"));
  });
  document.addEventListener("click", function (e) {
    if (searchBox && !searchBox.contains(e.target)) closeSearch();
  });

  /* ---------- 侧边栏事件 ---------- */
  sbNav.addEventListener("click", function (e) {
    var toggle = e.target.closest(".sb-chev, .sb-group-head");
    if (toggle) {
      e.preventDefault();
      var group = toggle.closest(".sb-group");
      if (!group) return;
      var wasOpen = group.classList.contains("open");
      Array.prototype.forEach.call(sbNav.querySelectorAll(".sb-group.open"), function (el) {
        el.classList.remove("open");
        var h = el.querySelector(".sb-group-head");
        if (h) h.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) group.classList.add("open");
      var head = group.querySelector(".sb-group-head");
      if (head) head.setAttribute("aria-expanded", group.classList.contains("open"));
      return;
    }
    if (e.target.closest("a")) closeMobileNav();
  });
  menuBtn.addEventListener("click", function () {
    if (body.classList.contains("nav-open")) closeMobileNav();
    else body.classList.add("nav-open");
  });
  mobileBackdrop.addEventListener("click", closeMobileNav);
  drawerBackdrop.addEventListener("click", closeDrawer);

  /* ---------- 路由 ---------- */
  function router() {
    var info = routeInfo();
    closeSearch();
    closeMobileNav();

    app.className = "";
    if (info.section === "home") {
      renderHome();
    } else if (info.section === "theme") {
      renderThemeOverview(info.arg);
    } else if (info.section === "page") {
      renderPage(info.arg);
    } else if (info.section === "model") {
      if (info.arg) renderTableDetail(info.arg);
      else renderModelOverview();
    } else if (info.section === "measures") {
      // 兼容旧的 #/measures 链接：渲染语义模型页并定位到度量值
      renderModelOverview(info.arg);
    } else if (info.section === "mappings") {
      renderMappings(info.arg);
    } else if (info.section === "ui") {
      renderUiGuide();
    } else if (info.section === "deliverables") {
      renderDeliverables();
    } else {
      notFound(info.arg || info.section);
    }

    updateSidebar(info.section, info.arg);
    window.scrollTo(0, 0);
    closeDrawer();
  }

  buildSidebar();
  buildSearchIndex();

  var currentUserEl = document.getElementById("currentUser");
  var userLinks = document.getElementById("userLinks");
  var adminLink = document.getElementById("adminLink");
  if (currentUserEl && window.L2Auth) {
    currentUserEl.textContent = (L2Auth.currentDisplayName ? L2Auth.currentDisplayName() : L2Auth.currentUser()) || "已登录";
  }
  if (userLinks && window.L2Auth && L2Auth.mode === "api") {
    userLinks.hidden = false;
    if (adminLink && L2Auth.isAdmin && L2Auth.isAdmin()) adminLink.hidden = false;
    // 用服务端会话校正显示名与角色；网络异常不打断浏览，只有明确的 401 才回登录页
    if (L2Auth.session) {
      L2Auth.session().then(function (info) {
        if (!info) return;
        if (currentUserEl) currentUserEl.textContent = info.displayName || info.username;
        if (adminLink) adminLink.hidden = info.role !== "admin";
      }).catch(function (err) {
        if (err && err.status === 401) location.replace("login.html");
      });
    }
  }
  var consoleLink = document.getElementById("consoleLink");
  // 旧令牌可能没有角色字段，先按账号表刷新，再判断是否显示管理入口
  if (window.L2Auth && L2Auth.mode !== "api" && L2Auth.syncRole) L2Auth.syncRole();
  if (userLinks && window.L2Auth && L2Auth.mode !== "api" && L2Auth.isAdmin && L2Auth.isAdmin()) {
    // 离线版：只有本地账号表里标了 role=admin 的账号能看到本机账号维护入口
    userLinks.hidden = false;
    var accountLink = document.getElementById("accountLink");
    if (accountLink) accountLink.hidden = true; // 离线版不支持在线改密
    if (consoleLink) {
      var consoleUrl = L2Auth.adminConsoleUrl ? L2Auth.adminConsoleUrl() : "";
      if (consoleUrl) {
        consoleLink.href = consoleUrl;
        consoleLink.title = "本机账号维护页：需先运行 tools/admin_console.cmd";
        consoleLink.hidden = false;
      }
    }
  }
  var buildStamp = document.getElementById("buildStamp");
  if (buildStamp && D.meta && D.meta.updated) buildStamp.textContent = "构建 " + D.meta.updated;
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (window.L2Auth) L2Auth.logout();
      location.replace("login.html");
    });
  }
  // 退出后通过浏览器「后退」恢复缓存页面时，再次校验登录状态
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && window.L2Auth && !L2Auth.isAuthed()) location.replace("login.html");
  });
  var protocolHint = document.getElementById("protocolHint");
  if (protocolHint) {
    var hasService = Object.keys(service.reports || {}).some(function (code) {
      return service.reports[code] && service.reports[code].reportId;
    });
    protocolHint.hidden = !(location.protocol === "file:" && hasService);
  }
  window.addEventListener("hashchange", router);
  router();
})();
