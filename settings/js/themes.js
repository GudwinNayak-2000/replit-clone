// settings/js/themes.js
export function initialize() {
    console.log("Themes initialize called");
    
    // Set initial theme state
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    updateThemeUI(savedTheme);

    // Add click listeners to theme cards
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        
        card.addEventListener('click', (e) => {
            if (e.target !== radio) {
                const theme = card.dataset.theme;
                switchTheme(theme);
            }
        });

        radio.addEventListener('change', () => {
            if (radio.checked) {
                const theme = card.dataset.theme;
                switchTheme(theme);
            }
        });
    });
}

function switchTheme(baseTheme) {
    const themeClass = `${baseTheme}-theme`;
    document.body.classList.remove('light-theme', 'dark-theme', 'spooky-theme');
    document.body.classList.add(themeClass);
    localStorage.setItem('theme', themeClass);
    updateThemeUI(themeClass);
}

function updateThemeUI(currentTheme) {
    const baseTheme = currentTheme.replace('-theme', '');
    const radios = document.querySelectorAll('input[type="radio"][name="theme"]');
    radios.forEach(radio => {
        radio.checked = radio.value === baseTheme;
    });
}