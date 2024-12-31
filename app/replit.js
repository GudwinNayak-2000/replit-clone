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
  

async function loadCommunityData() {
  try {
    const response = await fetch('/data/community-data.json');
    const data = await response.json();
    const communityData = data["community-data"];
    const community_title = communityData?.title;
    const communityCardContainer = document.getElementById("community-card-container");
    const communityTitle = document.getElementById("community-title");

    communityTitle.innerHTML = community_title;
    if(!communityData){
      console.error('Community data not found');
      return;
    }

    communityData.community_cards.forEach(card => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("community-card");
      cardElement.innerHTML = `
        <img src="${card.imgSrc}" alt="${card.title}">
        <div class="community-card-content">
          <p class="community-card-title">${card.title}</p>
          <p class="community-card-source"><em>${card.source}</em></p>
        </div>
      `;
      communityCardContainer.appendChild(cardElement);
    });
  } catch (error) {
    console.error('Error loading community data:', error);
  }
}

loadCommunityData();
