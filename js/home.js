// Individual feature functions
function typewriterEffect(element, text, speed) {
    let index = 0;
    element.setAttribute("placeholder", "");

    function type() {
        if (index < text.length) {
            element.setAttribute("placeholder", text.substring(0, index + 1));
            index++;
            setTimeout(type, speed);
        }
    }
    type();
}

function setupExampleButtons() {
    const buttons = document.querySelectorAll('.create-repl-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Example button click handling
            console.log('Example button clicked:', button.textContent);
        });
    });
}

function setupRecentRepls() {
    const replButtons = document.querySelectorAll('.recent-repls-button');
    replButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Recent repls button click handling
            console.log('Repl button clicked:', button.textContent);
        });
    });
}

// Main initialize function that orchestrates all other functions
function initialize() {
    // Initialize typewriter
    const textarea = document.getElementById('custom-textarea');
    if (textarea) {
        typewriterEffect(textarea, "Describe an app or site you want to build...", 100);
    }

    // Initialize other features
    setupExampleButtons();
    setupRecentRepls();
}

// Export initialize as default and other functions if needed elsewhere
export { 
    initialize,
    typewriterEffect,    // Export if needed elsewhere
    setupExampleButtons, // Export if needed elsewhere
    setupRecentRepls    // Export if needed elsewhere
};