// Add this JavaScript to handle scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation when entering viewport
                const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 200);
            } else {
                // Remove animation when leaving viewport
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '-50px'
    });

    // Select all logos and observe them
    const logos = document.querySelectorAll('.logos-container .logo');
    logos.forEach(logo => observer.observe(logo));
});