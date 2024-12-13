import { getEnvironmentConfig } from '../../config/path.js';
const config = getEnvironmentConfig();

async function loadHomeContent() {
    try {
        const response = await fetch(`${config.basePath}/pages/home.html`);
        if (response.ok) {
            const content = await response.text();
            const homeContent = document.getElementById('home-page');
            if (homeContent) {
                homeContent.innerHTML = content;
                await import(`${config.basePath}/js/home.js`)
                    .then(module => {
                        if (module.initialize) {
                            module.initialize();
                        }
                    });
            }
        }
    } catch (error) {
        console.error('Error loading home content:', error);
    }
}

function switchTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs[0]?.classList.add('active');
    contents[0]?.classList.remove('hidden');
    
    loadHomeContent();

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(content => content.classList.add('hidden'));
            tab.classList.add('active');
            const activeTab = tab.getAttribute('data-tab');
            document.getElementById(activeTab).classList.remove('hidden');
            if (activeTab === 'tab1') {
                loadHomeContent();
            }
        });
    });
}

function switchGithubTabs(){
    const githubTabs = document.querySelectorAll('.import-github-tab');
    const githubTabContents = document.querySelectorAll('.import-github-tab-content');

    // Set initial state - show first tab and content
    githubTabs[0]?.classList.add('active');
    githubTabContents[0]?.classList.remove('hidden');
    githubTabContents[1]?.classList.add('hidden');

    githubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            githubTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Get the target tab content id
            const tabId = tab.getAttribute('data-tab');
            
            // Hide all tab contents
            githubTabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show the selected tab content
            document.getElementById(tabId)?.classList.remove('hidden');
        });
    });
}
async function searchTemplates() {
    let data;
    try {
        const response = await fetch(`${config.basePath}/data/templates.json`);
        const jsonData = await response.json();
        data = jsonData.templates;
    } catch (error) {
        console.error('Error loading templates:', error);
        data = [];
    }

    const searchInput = document.getElementById('template-search');
    const resultsContainer = document.getElementById('template-results');
    const createReplButton = document.querySelector('.create-repl-button');
    let selectedTemplate = null;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        resultsContainer.innerHTML = '';

        if (query) {
            const filteredData = data.filter(item => 
                item.name.toLowerCase().includes(query)
            );

            filteredData.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('template-result-item');

                const img = document.createElement('img');
                img.src = item.icon;
                img.alt = item.name;

                const span = document.createElement('span');
                span.textContent = item.name;

                div.appendChild(img);
                div.appendChild(span);

                div.addEventListener('click', () => {
                    resultsContainer.innerHTML = '';
                    searchInput.value = item.name;
                    searchInput.style.paddingLeft = '30px';
                    searchInput.style.backgroundImage = `url(${item.icon})`;
                    searchInput.style.backgroundRepeat = 'no-repeat';
                    searchInput.style.backgroundPosition = '5px center';
                    searchInput.style.backgroundSize = '20px 20px';
                    
                    // Store the selected template
                    selectedTemplate = item;
                });

                resultsContainer.appendChild(div);
            });
        }
        
        if (!query) {
            searchInput.style.backgroundImage = '';
            searchInput.style.paddingLeft = '';
            selectedTemplate = null;
        }
    });

    // Add click handler for create repl button
    createReplButton.addEventListener('click', () => {
        const templateTitle = document.getElementById('template-title');
        const title = templateTitle.value.trim();

        if (!selectedTemplate) {
            alert('Please select a template');
            return;
        }

        if (!title) {
            alert('Please enter a title for your repl');
            return;
        }

        // Get existing repls or initialize empty array
        const savedRepls = JSON.parse(localStorage.getItem('repls') || '[]');

        // Create new repl object
        const newRepl = {
            id: Date.now(),
            title: title,
            template: selectedTemplate,
            code: getDefaultCode(selectedTemplate.name),
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // Add to saved repls
        savedRepls.push(newRepl);
        
        // Save to localStorage
        localStorage.setItem('repls', JSON.stringify(savedRepls));
        localStorage.setItem('currentReplId', newRepl.id);

        // Redirect to compiler
        window.location.href = `${config.basePath}/components/compiler.html`;
    });
}

function getDefaultCode(templateName) {
    const defaultCodes = {
        'JavaScript': '// Write your JavaScript code here\n\nconsole.log("Hello, World!");',
        'Python': '# Write your Python code here\n\nprint("Hello, World!")',
        'Node.js': '// Write your Node.js code here\n\nconst http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, {"Content-Type": "text/plain"});\n  res.end("Hello, World!");\n});\n\nserver.listen(3000, () => {\n  console.log("Server running on port 3000");\n});',
        // Add more templates as needed
    };
    return defaultCodes[templateName] || '// Start coding here';
}

async function initialize() {
    try {
        switchTabs();
        switchGithubTabs();
        searchTemplates();
    } catch (error) {
        console.error('Error initializing repls:', error);
    }
}

export { initialize };