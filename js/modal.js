export default function modal(modalContainerId) {
  const modalContainer = document.getElementById(modalContainerId);

  if (!modalContainer) {
    console.error(`Modal container with ID "${modalContainerId}" not found.`);
    return;
  }

  const slides = modalContainer.querySelectorAll(".carousel-slide");
  const indicators = modalContainer.querySelectorAll(".indicator");
  const continueBtn = modalContainer.querySelector("#continueBtn");
  const backBtn = modalContainer.querySelector("#backBtn");

  let currentSlide = 0;

  // Show slide function
  function showSlide(index) {
    const slidesContainer = modalContainer.querySelector(".carousel-slides");
    slidesContainer.style.transform = `translateX(-${index * 100}%)`;

    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === index);
    });

    backBtn.style.display = index === 0 ? "none" : "flex";
  }

  // Handle "Continue" button click
  continueBtn?.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  });

  // Handle "Back" button click
  backBtn?.addEventListener("click", () => {
    if (currentSlide > 0) {
      currentSlide--;
      showSlide(currentSlide);
    }
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });

  let originalUsername = "";

  function editUsername() {
    const usernameLabel = document.getElementById("username-label");

    // Safeguard against null
    if (!usernameLabel) return;

    originalUsername = usernameLabel.innerText; // Save the current username
    const usernameContainer = document.querySelector(".username-container");

    usernameContainer.innerHTML = `
      <input type="text" id="username-input" value="${originalUsername}">
      <div class="edit-buttons">
        <button class="cancel-button">Cancel</button>
        <button class="save-button">Save</button>
      </div>
    `;

    const cancelButton = usernameContainer.querySelector(".cancel-button");
    const saveButton = usernameContainer.querySelector(".save-button");

    cancelButton.addEventListener("click", cancelEdit);
    saveButton.addEventListener("click", saveUsername);
  }

  function saveUsername() {
    const usernameInput = document.getElementById("username-input");
    if (!usernameInput) return;

    const newUsername = usernameInput.value;
    const usernameContainer = document.querySelector(".username-container");

    usernameContainer.innerHTML = `
      <label id="username-label">${newUsername}</label>
      <button class="edit-username" aria-label="edit-username">Edit</button>
    `;

    // Reattach edit button listener
    addEditButtonListener();
  }

  function cancelEdit() {
    const usernameContainer = document.querySelector(".username-container");

    usernameContainer.innerHTML = `
      <label id="username-label">${originalUsername}</label>
      <button class="edit-username" aria-label="edit-username">Edit</button>
    `;

    // Reattach edit button listener
    addEditButtonListener();
  }

  function addEditButtonListener() {
    const editButton = modalContainer.querySelector(".edit-username");
    editButton?.addEventListener("click", editUsername);
  }


  function labelSelect(){
    const labels = modalContainer.querySelectorAll('.inline-label');
    labels.forEach(label => {
      label.addEventListener('click', function () {
        // Remove 'selected' class from all labels
        labels.forEach(l => l.classList.remove('selected'));

        // Add 'selected' class to the clicked label
        this.classList.add('selected');

      });
    });
  }
  addEditButtonListener();
  labelSelect();
}
