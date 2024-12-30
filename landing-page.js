document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 200);
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '-50px'
    });

    const logos = document.querySelectorAll('.logos-container .logo');
    logos.forEach(logo => observer.observe(logo));
});

document.addEventListener('DOMContentLoaded', function() {
    const listItems = document.querySelectorAll('.sidebar li');
    const spanContents = document.querySelectorAll('.span-content');
    const contentItems = document.querySelectorAll('.content-item');

    function hideAllContent() {
        spanContents.forEach(span => span.classList.remove('active'));
        contentItems.forEach(item => item.classList.remove('active'));
        listItems.forEach(item => item.classList.remove('active'));
    }

    listItems.forEach(item => {
        item.addEventListener('click', function() {
            const contentId = this.getAttribute('data-content');
            
            hideAllContent();
            
            this.classList.add('active');
            document.querySelector(`span[data-content="${contentId}"]`).classList.add('active');
            document.getElementById(contentId).classList.add('active');
        });
    });
});
  