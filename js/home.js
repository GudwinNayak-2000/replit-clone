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
            console.log('Example button clicked:', button.textContent);
        });
    });
}

function setupRecentRepls() {
    const replButtons = document.querySelectorAll('.recent-repls-button');
    replButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Repl button clicked:', button.textContent);
        });
    });
}

function initialize() {
    const textarea = document.getElementById('custom-textarea');
    if (textarea) {
        typewriterEffect(textarea, "Describe an app or site you want to build...", 100);
    }

    setupExampleButtons();
    setupRecentRepls();
}

export { 
    initialize,
    typewriterEffect,
    setupExampleButtons,
    setupRecentRepls
};