// All your page-specific functions
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
    const buttons = document.querySelectorAll('.example-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Your button logic
        });
    });
}

function setupRecentRepls() {
    const replButtons = document.querySelectorAll('.recent-repls-button');
    replButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Your repl button logic
        });
    });
}

// Main initialization function that calls all other functions
function initialize() {
    const textarea = document.getElementById('custom-textarea');
    if (textarea) {
        typewriterEffect(textarea, "What do you want to build today?", 100);
    }
    setupExampleButtons();
    setupRecentRepls();
}

// Export only the initialize function
// Export additional functions if they need to be accessed elsewhere
export { initialize, typewriterEffect, setupExampleButtons };