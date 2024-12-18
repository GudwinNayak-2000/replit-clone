import { getEnvironmentConfig } from "../../config/path.js";

let templateIcon,
  fileName,
  replTitle,
  codeEditor,
  runButton,
  output,
  clearOutputButton,
  editor;

let currentRepl, savedRepls;

const config = getEnvironmentConfig();

function setupSyntaxHighlighting() {
  const themeSelector = document.createElement("select");
  themeSelector.className = "theme-selector";

  const themes = [
    "monokai",
    "dracula",
    "material",
    "solarized",
    "eclipse",
    "night",
    "cobalt",
    "neat",
  ];

  themes.forEach((theme) => {
    const option = document.createElement("option");
    option.value = theme;
    option.text = theme.charAt(0).toUpperCase() + theme.slice(1);
    themeSelector.appendChild(option);
  });

  // Add event listener for theme change
  themeSelector.addEventListener("change", (e) => {
    changeEditorTheme(e.target.value);
  });

  // Add to your editor panel header
  const debugToolbar = document.querySelector(".debug-toolbar");
  if (debugToolbar) {
    const themeContainer = document.createElement("div");
    themeContainer.className = "theme-container";
    themeContainer.appendChild(themeSelector);
    debugToolbar.appendChild(themeContainer);
  }
}

function changeEditorTheme(theme) {
  loadThemeCSS(theme);

  editor.setOption("theme", theme);

  localStorage.setItem("preferred-theme", theme);
}

function loadThemeCSS(theme) {
  const linkId = "code-mirror-theme";
  let link = document.getElementById(linkId);

  if (!link) {
    link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  link.href = `https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/${theme}.min.css`;
}

export class CodeDebugger {
  constructor(editor) {
    this.editor = editor;
    this.breakpoints = new Set();
    this.isDebugging = false;
    this.currentLine = null;

    if (!document.getElementById("debug-output")) {
      const debugOutput = document.createElement("div");
      debugOutput.id = "debug-output";
      const outputPanel = document.getElementById("output-panel");
      if (outputPanel) {
        outputPanel.appendChild(debugOutput);
      }
    }

    this.setupDebugUI();
    this.setupBreakpointGutter();
    this.initializeDebugButtons();
  }
  setupDebugUI() {
    const debugToolbar = document.createElement("div");
    debugToolbar.className = "debug-toolbar";
    debugToolbar.innerHTML = `
         <div class="debug-buttons">
            <button class="debug-btn start-debug" title="Start Debugging">
                <i class="fas fa-bug"></i>
            </button>
            <button class="debug-btn step-over" title="Step Over" disabled>
                <i class="fas fa-step-forward"></i>
            </button>
            <button class="debug-btn step-into" title="Step Into" disabled>
                <i class="fas fa-level-down-alt"></i>
            </button>
            <button class="debug-btn stop-debug" title="Stop Debugging" disabled>
                <i class="fas fa-stop"></i>
            </button>
        </div>
      `;

    const editorPanel = document.getElementById("editor-panel");
    if (editorPanel) {
      editorPanel.insertBefore(debugToolbar, editorPanel.firstChild);
    }
  }

  setupBreakpointGutter() {
    const currentGutters = this.editor.getOption("gutters") || [];
    this.editor.setOption("gutters", [...currentGutters, "breakpoints"]);

    this.editor.on("gutterClick", (cm, line, gutter) => {
      if (gutter === "breakpoints") {
        this.toggleBreakpoint(line);
      }
    });
  }

  toggleBreakpoint(line) {
    const info = this.editor.lineInfo(line);
    if (info.gutterMarkers && info.gutterMarkers.breakpoints) {
      this.editor.setGutterMarker(line, "breakpoints", null);
      this.breakpoints.delete(line);
    } else {
      const marker = document.createElement("div");
      marker.className = "breakpoint";
      marker.innerHTML = "●";
      this.editor.setGutterMarker(line, "breakpoints", marker);
      this.breakpoints.add(line);
    }
    this.log(
      `Breakpoint ${this.breakpoints.has(line) ? "set" : "removed"} at line ${line + 1}`,
    );
  }

  initializeDebugButtons() {
    const buttons = document.querySelectorAll(".debug-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const action = e.currentTarget.classList[1];
        this.handleDebugAction(action);
      });
    });
  }

  handleDebugAction(action) {
    switch (action) {
      case "start-debug":
        this.startDebugging();
        break;
      case "step-over":
        this.stepOver();
        break;
      case "step-into":
        this.stepInto();
        break;
      case "stop-debug":
        this.stopDebugging();
        break;
    }
  }

  startDebugging() {
    try {
      this.isDebugging = true;
      this.updateButtonStates();
      this.log("Starting debug session...");

      const code = this.editor.getValue();
      const lines = code.split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (this.breakpoints.has(i)) {
          this.currentLine = i;
          this.highlightLine(i);
          this.log(`Stopped at breakpoint: Line ${i + 1}`);
          break;
        }
      }

      const originalConsoleLog = console.log;

      console.log = (...args) => {
        this.log("Output:", ...args);
        originalConsoleLog.apply(console, args);
      };

      try {
        eval(code);
      } finally {
        console.log = originalConsoleLog;
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  stepOver() {
    if (this.isDebugging && this.currentLine !== null) {
      this.currentLine++;
      this.highlightLine(this.currentLine);
      this.log(`Stepped to line ${this.currentLine + 1}`);
    }
  }

  stepInto() {
    if (this.isDebugging && this.currentLine !== null) {
      this.currentLine++;
      this.highlightLine(this.currentLine);
      this.log(`Stepped into line ${this.currentLine + 1}`);
    }
  }

  stopDebugging() {
    this.isDebugging = false;
    this.currentLine = null;
    this.updateButtonStates();
    this.clearHighlight();
    this.log("Debugging stopped");
  }

  highlightLine(line) {
    this.clearHighlight();
    this.editor.addLineClass(line, "background", "debug-current-line");
  }

  clearHighlight() {
    if (this.currentLine !== null) {
      this.editor.removeLineClass(
        this.currentLine,
        "background",
        "debug-current-line",
      );
    }
  }

  updateButtonStates() {
    const buttons = document.querySelectorAll(".debug-btn");
    buttons.forEach((button) => {
      if (button.classList.contains("start-debug")) {
        button.disabled = this.isDebugging;
      } else {
        button.disabled = !this.isDebugging;
      }
    });
  }

  log(message, ...args) {
    const debugOutput = document.getElementById("debug-output");
    if (debugOutput) {
      const timestamp = new Date().toLocaleTimeString();
      const formattedMessage =
        args.length > 0 ? `${message} ${args.join(" ")}` : message;
      debugOutput.innerHTML += `
            <div class="debug-message">
                <span class="debug-time">[${timestamp}]</span> ${formattedMessage}
            </div>
        `;
      debugOutput.scrollTop = debugOutput.scrollHeight;
    }
  }

  handleError(error) {
    this.log("Error:", error.message);
    console.error(error);
    this.stopDebugging();
  }
}

const styles = `
  .debug-toolbar {
      display: flex;
      justify-content:space-between;
      gap: 8px;
      padding: 8px;
      border-bottom: 1px solid #444;
  }
 .debug-buttons {
        display: flex;
        gap: 8px;
    }
  .debug-btn {
      height: 12px;
      width: 16px;
      border: 1px solid #555;
      border-radius: 4px;
      cursor: pointer;
  }

  .debug-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
  }

  .breakpoint {
      color: #ff4444;
      font-size: 12px;
      cursor: pointer;
  }

  .debug-current-line {
      background: rgba(65, 105, 225, 0.2);
  }

  /* Output panel layout */
  #output-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
  }

  #console-output {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
  }

  #debug-output {
      border-top: 1px solid #333;
      padding: 8px;
      max-height: 150px;
      overflow-y: auto;
  }

  .debug-message {
      padding: 4px 8px;
      min-height: 20px;
      width: auto;
      border-left: 3px solid #66d9ef;
      margin: 4px 0;
      font-size: 12px;
      line-height: 1.4;
      word-wrap: break-word;
      box-sizing: border-box;
  }

  .debug-time {
      margin-right: 8px;
      font-size: 11px;
  }
`;
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

function setupCompiler() {
  const templateIcons = document.querySelectorAll(".template-icon");

  templateIcons.forEach((icon) => {
    icon.src = currentRepl.template.icon;
    icon.alt = currentRepl.template.name;
  });

  fileName.textContent = `main${getFileExtension(currentRepl.template.name)}`;
  replTitle.textContent = currentRepl.title;

  editor = CodeMirror.fromTextArea(codeEditor, {
    mode: getCodeMirrorMode(currentRepl.template.name),
    theme: "monokai",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    extraKeys: {
      "Ctrl-Space": "autocomplete",
      "Cmd-Space": "autocomplete",
      Tab: "indentMore",
      "Shift-Tab": "indentLess",
      "Ctrl-F": "findPersistent",
      "Cmd-F": "findPersistent",
      "Alt-F": "replace",
      "Ctrl-/": "toggleComment",
      "Cmd-/": "toggleComment",
    },
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    styleActiveLine: true,
    autoCloseTags: true,
    foldGutter: true,
    lint: true,
    hintOptions: {
      completeSingle: false,
      alignWithWord: true,
      closeOnUnfocus: true,
      closeCharacters: /[\s()\[\]{};:>,]/,
      hint: getHintFunction,
    },
  });

  const codDebugger = new CodeDebugger(editor);

  editor.setOption("extraKeys", {
    ...editor.getOption("extraKeys"),
    F5: () => codDebugger.startDebugging(),
    F10: () => codDebugger.stepOver(),
    F11: () => codDebugger.stepInto(),
    "Shift-F11": () => codDebugger.stepOut(),
    "Shift-F5": () => codDebugger.stopDebugging(),
  });

  setupSyntaxHighlighting();

  editor.setValue(currentRepl.code);

  let saveTimeout;
  editor.on("change", () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCode, 1000);
  });

  editor.on("inputRead", function (cm, change) {
    if (change.origin !== "+input") return;
    const cur = cm.getCursor();
    const token = cm.getTokenAt(cur);

    if (token.type && !cm.state.completionActive) {
      CodeMirror.commands.autocomplete(cm);
    }
  });
  function getHintFunction(cm, options) {
    const mode = cm.getMode().name;

    switch (mode) {
      case "javascript":
        return CodeMirror.hint.javascript(cm, {
          ...options,
          keywords: true,
          globalScope: getJavaScriptGlobalScope(),
        });

      case "xml":
        return CodeMirror.hint.html(cm, options);

      case "css":
        return CodeMirror.hint.css(cm, options);

      case "python":
        return CodeMirror.hint.anyword(cm, options);

      default:
        return CodeMirror.hint.anyword(cm, options);
    }
  }
  function getJavaScriptGlobalScope() {
    return {
      console: ["log", "error", "warn", "info", "debug", "clear"],
      Math: ["abs", "ceil", "floor", "max", "min", "random", "round"],
      Array: ["from", "isArray", "of"],
      Object: ["assign", "create", "keys", "values", "entries"],
      String: ["fromCharCode", "raw"],
      Number: ["isInteger", "isFinite", "parseFloat", "parseInt"],
      JSON: ["parse", "stringify"],
    };
  }
  editor.setOption("extraKeys", {
    "Ctrl-S": saveCode,
    "Cmd-S": saveCode,
    "Ctrl-Enter": runCode,
    "Cmd-Enter": runCode,
    ...editor.getOption("extraKeys"),
  });
}

function getCodeMirrorMode(templateName) {
  const modes = {
    JavaScript: "javascript",
    Python: "python",
    "Node.js": "javascript",
    HTML: "xml",
    CSS: "css",
  };
  return modes[templateName] || "javascript";
}

function getFileExtension(templateName) {
  const extensions = {
    JavaScript: ".js",
    Python: ".py",
    "Node.js": ".js",
    HTML: ".html",
    CSS: ".css",
  };
  return extensions[templateName] || ".txt";
}

function saveCode() {
  const updatedRepls = savedRepls.map((repl) => {
    if (repl.id === currentRepl.id) {
      return {
        ...repl,
        code: editor.getValue(),
        lastModified: new Date().toISOString(),
      };
    }
    return repl;
  });

  localStorage.setItem("repls", JSON.stringify(updatedRepls));
  savedRepls = updatedRepls;
}

function setupEventListeners() {
  runButton.addEventListener("click", runCode);
  clearOutputButton.addEventListener("click", () => {
    output.innerHTML = "";
  });
}

function runCode() {
  const code = editor.getValue();
  output.innerHTML = "";

  try {
    switch (currentRepl.template.name) {
      case "JavaScript":
        const oldLog = console.log;
        const oldError = console.error;
        const oldWarn = console.warn;
        let logs = [];

        console.log = (...args) => {
          logs.push(`<span class="log">${args.join(" ")}</span>`);
          oldLog.apply(console, args);
        };
        console.error = (...args) => {
          logs.push(`<span class="error">${args.join(" ")}</span>`);
          oldError.apply(console, args);
        };
        console.warn = (...args) => {
          logs.push(`<span class="warning">${args.join(" ")}</span>`);
          oldWarn.apply(console, args);
        };

        eval(code);

        console.log = oldLog;
        console.error = oldError;
        console.warn = oldWarn;

        output.innerHTML = logs.join("\n");
        break;

      case "Python":
      case "Node.js":
        output.innerHTML =
          '<span class="warning">Running this code requires backend integration.</span>';
        break;

      default:
        output.innerHTML = '<span class="error">Unsupported language</span>';
    }
  } catch (error) {
    output.innerHTML = `<span class="error">Error: ${error.message}</span>`;
  }
}

function updateResizerPosition() {
  const container = document.querySelector(".editor-output-container");
  const editorPanel = document.getElementById("editor-panel");
  const outputPanel = document.getElementById("output-panel");
  const vResizer = document.getElementById("vertical-resizer");

  if (!container || !editorPanel || !outputPanel || !vResizer) return;

  const isHorizontal = container.classList.contains("layout-horizontal");
  const editorFirst =
    container.classList.contains("editor-left") ||
    container.classList.contains("editor-top");

  if (isHorizontal) {
    vResizer.style.width = "4px";
    vResizer.style.height = "100%";
    vResizer.style.cursor = "col-resize";
  } else {
    vResizer.style.width = "100%";
    vResizer.style.height = "4px";
    vResizer.style.cursor = "row-resize";
  }

  if (editorFirst) {
    editorPanel.style.order = "0";
    vResizer.style.order = "1";
    outputPanel.style.order = "2";
  } else {
    outputPanel.style.order = "0";
    vResizer.style.order = "1";
    editorPanel.style.order = "2";
  }

  editor.refresh();
}

function setupPanelControls() {
  const panels = document.querySelectorAll(".panel");

  panels.forEach((panel) => {
    const minimizeBtn = panel.querySelector(".minimize-btn");
    const maximizeBtn = panel.querySelector(".maximize-btn");
    const panelContent = panel.querySelector(".code-editor, .output");
    const panelHeader = panel.querySelector(".panel-header");

    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.toggle("minimized");
        minimizeBtn.textContent = panel.classList.contains("minimized")
          ? "+"
          : "−";

        if (panel.classList.contains("maximized")) {
          panel.classList.remove("maximized");
          maximizeBtn.textContent = "□";
        }

        const resizer = document.getElementById("vertical-resizer");
        if (resizer) {
          resizer.style.display =
            document.querySelectorAll(".panel.minimized").length === 2
              ? "none"
              : "block";
        }
        editor.refresh();
      });
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.toggle("maximized");
        maximizeBtn.textContent = panel.classList.contains("maximized")
          ? "❐"
          : "□";

        if (panel.classList.contains("minimized")) {
          panel.classList.remove("minimized");
          minimizeBtn.textContent = "−";
        }

        const resizer = document.getElementById("vertical-resizer");
        if (resizer) {
          resizer.style.display = panel.classList.contains("maximized")
            ? "none"
            : "block";
        }
        editor.refresh();
      });
    }
  });
}
// Add this JavaScript to handle the menu
function setupFileMenu() {
  const fileItems = document.querySelectorAll(".file-item");

  fileItems.forEach((item) => {
    const menuBtn = item.querySelector(".file-menu-btn");
    const menu = item.querySelector(".file-menu");

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Close all other menus
      document.querySelectorAll(".file-menu.active").forEach((m) => {
        if (m !== menu) m.classList.remove("active");
      });
      menu.classList.toggle("active");
    });

    // Handle menu items
    const menuItems = item.querySelectorAll(".menu-item");
    menuItems.forEach((menuItem) => {
      menuItem.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = menuItem.textContent.trim().toLowerCase();
        const fileName = item.querySelector(".file-name").textContent;

        handleFileAction(action, fileName);
        menu.classList.remove("active");
      });
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".file-menu.active").forEach((menu) => {
      menu.classList.remove("active");
    });
  });
}

function handleFileAction(action, fileName) {
  switch (action) {
    case "rename":
      // Handle rename
      const newName = prompt("Enter new name:", fileName);
      if (newName && newName !== fileName) {
        // Implement rename logic
        console.log(`Renaming ${fileName} to ${newName}`);
      }
      break;

    case "duplicate":
      // Handle duplicate
      console.log(`Duplicating ${fileName}`);
      break;

    case "download":
      // Handle download
      console.log(`Downloading ${fileName}`);
      break;

    case "delete":
      // Handle delete
      if (confirm(`Are you sure you want to delete ${fileName}?`)) {
        console.log(`Deleting ${fileName}`);
      }
      break;
  }
}

function setupPanels() {
  const editorPanel = document.getElementById("editor-panel");
  const outputPanel = document.getElementById("output-panel");
  const container = document.querySelector(".editor-output-container");
  const vResizer = document.getElementById("vertical-resizer");

  setupPanelControls();

  if (!editorPanel || !outputPanel || !container || !vResizer) {
    console.error("Panel elements not found");
    return;
  }

  container.classList.add("layout-horizontal", "editor-left");

  [editorPanel, outputPanel].forEach((panel) => {
    const header = panel.querySelector(".panel-header");
    let isDragging = false;
    let startX, startY;

    header.addEventListener("mousedown", (e) => {
      if (e.target === header) {
        isDragging = true;
        panel.classList.add("dragging");
        startX = e.clientX - panel.offsetLeft;
        startY = e.clientY - panel.offsetTop;
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const containerRect = container.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;
      const relativeX = x / containerRect.width;
      const relativeY = y / containerRect.height;
      const edgeThreshold = 0.2;

      container.classList.remove(
        "layout-horizontal",
        "layout-vertical",
        "editor-left",
        "editor-right",
        "editor-top",
        "editor-bottom",
      );

      if (relativeY < edgeThreshold || relativeY > 1 - edgeThreshold) {
        container.classList.add("layout-vertical");
        if (panel === editorPanel) {
          container.classList.add(
            relativeY < 0.5 ? "editor-top" : "editor-bottom",
          );
        } else {
          container.classList.add(
            relativeY < 0.5 ? "editor-bottom" : "editor-top",
          );
        }
        panel.style.width = "100%";
        panel.style.flex = "0 0 auto";
        panel.style.height = "100%";
      } else if (Math.abs(relativeX - 0.5) > Math.abs(relativeY - 0.5)) {
        container.classList.add("layout-horizontal");
        if (panel === editorPanel) {
          container.classList.add(
            relativeX < 0.5 ? "editor-left" : "editor-right",
          );
        } else {
          container.classList.add(
            relativeX < 0.5 ? "editor-right" : "editor-left",
          );
        }
        panel.style.width = "100%";
        panel.style.height = "100%";
      } else {
        container.classList.add("layout-vertical");
        if (panel === editorPanel) {
          container.classList.add(
            relativeY < 0.5 ? "editor-top" : "editor-bottom",
          );
        } else {
          container.classList.add(
            relativeY < 0.5 ? "editor-bottom" : "editor-top",
          );
        }
        panel.style.width = "100%";
        panel.style.height = "50%";
      }

      updateResizerPosition();
      editor.refresh();
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      panel.classList.remove("dragging");
      editor.refresh();
    });
  });

  let isResizing = false;
  let startX, startY;
  let startWidth, startHeight;

  vResizer.addEventListener("mousedown", (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = editorPanel.offsetWidth;
    startHeight = editorPanel.offsetHeight;
    document.body.classList.add("resizing");
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    const isHorizontal = container.classList.contains("layout-horizontal");
    const editorFirst =
      container.classList.contains("editor-left") ||
      container.classList.contains("editor-top");

    if (isHorizontal) {
      const delta = e.clientX - startX;
      const newWidth = editorFirst ? startWidth + delta : startWidth - delta;
      const containerWidth = container.offsetWidth;

      if (newWidth > containerWidth * 0.2 && newWidth < containerWidth * 0.8) {
        editorPanel.style.width = `${newWidth}px`;
        editorPanel.style.flex = "0 0 auto";
        outputPanel.style.flex = "1";
      }
    } else {
      const delta = e.clientY - startY;
      const newHeight = editorFirst ? startHeight + delta : startHeight - delta;
      const containerHeight = container.offsetHeight;

      if (
        newHeight > containerHeight * 0.2 &&
        newHeight < containerHeight * 0.8
      ) {
        editorPanel.style.height = `${newHeight}px`;
        editorPanel.style.flex = "0 0 auto";
        outputPanel.style.flex = "1";
      }
    }
    editor.refresh();
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
    document.body.classList.remove("resizing");
    editor.refresh();
  });
}

function setupSidebar() {
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const fileDirectory = document.getElementById("file-directory");
  const mainContent = document.querySelector(".main-content");

  if (!sidebarToggle || !fileDirectory || !mainContent) {
    console.error("Sidebar elements not found");
    return;
  }

  sidebarToggle.addEventListener("click", () => {
    fileDirectory.classList.toggle("collapsed");
    mainContent.classList.toggle("sidebar-collapsed");
    window.dispatchEvent(new Event("resize"));
    editor.refresh();
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runCode();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveCode();
    }
  });
}
function initializeMobileMenu() {
  const mobileToggleBtn = document.querySelector(".mobile-toggle-btn");
  const fileDirectory = document.querySelector(".file-directory");
  const mainContent = document.querySelector(".main-content");
  const runBtn = document.querySelector(".run-btn");

  const overlay = document.createElement("div");
  overlay.className = "directory-overlay";
  document.body.appendChild(overlay);

  mobileToggleBtn.addEventListener("click", () => {
    fileDirectory.classList.toggle("show");
    overlay.classList.toggle("show");
    document.body.classList.toggle("directory-open");
  });

  overlay.addEventListener("click", () => {
    fileDirectory.classList.remove("show");
    overlay.classList.remove("show");
    document.body.classList.remove("directory-open");
  });

  runBtn.addEventListener("click", () => {
    document.getElementById("run-code").click();
  });

  const tabsBtn = document.querySelector(".tabs-btn");
  tabsBtn.addEventListener("click", () => {
  });
}

async function initialize() {
  try {
    templateIcon = document.getElementById("template-icon");
    fileName = document.getElementById("file-name");
    replTitle = document.getElementById("repl-title");
    codeEditor = document.getElementById("code-editor");
    runButton = document.getElementById("run-code");
    output = document.getElementById("output");
    clearOutputButton = document.getElementById("clear-output");

    const currentReplId = localStorage.getItem("currentReplId");
    savedRepls = JSON.parse(localStorage.getItem("repls") || "[]");
    currentRepl = savedRepls.find(
      (repl) => repl.id === parseInt(currentReplId),
    );

    if (!currentRepl) {
      console.error("No repl found");
      return;
    }

    setupCompiler();
    setupEventListeners();
    setupSidebar();
    setupPanels();
    setupKeyboardShortcuts();
    setupFileMenu();

    initializeMobileMenu();

    window.addEventListener("resize", () => {
      const fileDirectory = document.querySelector(".file-directory");
      const overlay = document.querySelector(".directory-overlay");

      if (window.innerWidth > 768) {
        fileDirectory.classList.remove("show");
        overlay.classList.remove("show");
      }
    });
    window.addEventListener("resize", () => {
      editor.refresh();
    });
  } catch (error) {
    console.error("Error initializing compiler:", error);
  }
}

export { initialize };
