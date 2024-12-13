import { getEnvironmentConfig } from "../config/path.js";

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

function setupCompiler() {
  const templateIcons = document.querySelectorAll(".template-icon");
  templateIcons.forEach(icon => {
    icon.src = currentRepl.template.icon;
    icon.alt = currentRepl.template.name;
  });
  
  fileName.textContent = `main${getFileExtension(currentRepl.template.name)}`;
  replTitle.textContent = currentRepl.title;
  updateLastSavedTime();

  editor = CodeMirror.fromTextArea(codeEditor, {
    mode: getCodeMirrorMode(currentRepl.template.name),
    theme: 'monokai',
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 2,
    tabSize: 2,
    lineWrapping: true,
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
      'Cmd-Space': 'autocomplete',
      'Tab': 'indentMore',
      'Shift-Tab': 'indentLess',
      'Ctrl-F': 'findPersistent',
      'Cmd-F': 'findPersistent',
      'Alt-F': 'replace',
      'Ctrl-/': 'toggleComment',
      'Cmd-/': 'toggleComment'
    },
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    styleActiveLine: true,
    autoCloseTags: true,
    foldGutter: true,
    lint: true,
    hintOptions: {
      completeSingle: false
    }
  });

  editor.setValue(currentRepl.code);

  let saveTimeout;
  editor.on('change', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCode, 1000);
  });

  editor.setOption('extraKeys', {
    'Ctrl-S': saveCode,
    'Cmd-S': saveCode,
    'Ctrl-Enter': runCode,
    'Cmd-Enter': runCode,
    ...editor.getOption('extraKeys')
  });
}

function getCodeMirrorMode(templateName) {
  const modes = {
    'JavaScript': 'javascript',
    'Python': 'python',
    'Node.js': 'javascript',
    'HTML': 'xml',
    'CSS': 'css'
  };
  return modes[templateName] || 'javascript';
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

function updateLastSavedTime() {
  const lastModified = new Date(currentRepl.lastModified);
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
  updateLastSavedTime();
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
        output.innerHTML = '<span class="warning">Running this code requires backend integration.</span>';
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
  const editorFirst = container.classList.contains("editor-left") || container.classList.contains("editor-top");

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
        minimizeBtn.textContent = panel.classList.contains("minimized") ? "+" : "−";

        if (panel.classList.contains("maximized")) {
          panel.classList.remove("maximized");
          maximizeBtn.textContent = "□";
        }

        const resizer = document.getElementById("vertical-resizer");
        if (resizer) {
          resizer.style.display = document.querySelectorAll(".panel.minimized").length === 2 ? "none" : "block";
        }
        editor.refresh();
      });
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        panel.classList.toggle("maximized");
        maximizeBtn.textContent = panel.classList.contains("maximized") ? "❐" : "□";

        if (panel.classList.contains("minimized")) {
          panel.classList.remove("minimized");
          minimizeBtn.textContent = "−";
        }

        const resizer = document.getElementById("vertical-resizer");
        if (resizer) {
          resizer.style.display = panel.classList.contains("maximized") ? "none" : "block";
        }
        editor.refresh();
      });
    }
  });
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
        "editor-bottom"
      );

      if (relativeY < edgeThreshold || relativeY > 1 - edgeThreshold) {
        container.classList.add("layout-vertical");
        if (panel === editorPanel) {
          container.classList.add(relativeY < 0.5 ? "editor-top" : "editor-bottom");
        } else {
          container.classList.add(relativeY < 0.5 ? "editor-bottom" : "editor-top");
        }
        panel.style.width = "100%";
        panel.style.flex = "0 0 auto";
        panel.style.height = "100%";
      } else if (Math.abs(relativeX - 0.5) > Math.abs(relativeY - 0.5)) {
        container.classList.add("layout-horizontal");
        if (panel === editorPanel) {
          container.classList.add(relativeX < 0.5 ? "editor-left" : "editor-right");
        } else {
          container.classList.add(relativeX < 0.5 ? "editor-right" : "editor-left");
        }
        panel.style.width = "50%";
        panel.style.height = "100%";
      } else {
        container.classList.add("layout-vertical");
        if (panel === editorPanel) {
          container.classList.add(relativeY < 0.5 ? "editor-top" : "editor-bottom");
        } else {
          container.classList.add(relativeY < 0.5 ? "editor-bottom" : "editor-top");
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
    const editorFirst = container.classList.contains("editor-left") || container.classList.contains("editor-top");

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

      if (newHeight > containerHeight * 0.2 && newHeight < containerHeight * 0.8) {
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
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCode();
    }
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
    currentRepl = savedRepls.find((repl) => repl.id === parseInt(currentReplId));

    if (!currentRepl) {
      console.error("No repl found");
      return;
    }

    setupCompiler();
    setupEventListeners();
    setupSidebar();
    setupPanels();
    setupKeyboardShortcuts();
    
    window.addEventListener('resize', () => {
      editor.refresh();
    });

  } catch (error) {
    console.error("Error initializing compiler:", error);
  }
}

export { initialize };