
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const cameraBtn = document.querySelector('.profile-option-camera-btn');
    const coverPhoto = document.querySelector('.profile-option-cover-photo');
    const editBtn = document.querySelector('.profile-option-edit-btn');
    const searchInput = document.querySelector('.search-input');
    const replsList = document.querySelector('.repls-list');
    const profileDetails = document.querySelector('.profile-option-details');
  
    // Create hidden file input for cover photo
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
  
    // Handle camera button click
    cameraBtn.addEventListener('click', () => {
        fileInput.click();
    });
  
    // Handle file selection
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
  
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('Image size should be less than 5MB');
                return;
            }
  
            // Create URL for the selected image
            const imageUrl = URL.createObjectURL(file);
  
            // Add loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            coverPhoto.appendChild(loadingIndicator);
  
            try {
                // Update cover photo background
                coverPhoto.style.backgroundImage = `url(${imageUrl})`;
                coverPhoto.style.backgroundSize = 'cover';
                coverPhoto.style.backgroundPosition = 'center';
  
                // Simulate upload delay (replace with actual upload in production)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Here you would typically upload the image to your server
                // const uploadedUrl = await uploadImage(file);
                // coverPhoto.style.backgroundImage = `url(${uploadedUrl})`;
            } catch (error) {
                console.error('Error handling image:', error);
                alert('Failed to update cover photo. Please try again.');
            } finally {
                loadingIndicator.remove();
            }
        }
    });
  
    // Handle edit button click
    let isEditing = false;
    editBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        
        if (isEditing) {
            // Convert text content to input fields
            const name = profileDetails.querySelector('h1').textContent;
            const username = profileDetails.querySelector('.username').textContent;
            
            profileDetails.querySelector('h1').innerHTML = `
                <input type="text" class="edit-name" value="${name}" 
                    style="background: transparent; border: 1px solid var(--border-dark); 
                    color: var(--text-dark); padding: 4px; border-radius: 4px; width: 100%;">
            `;
            
            profileDetails.querySelector('.username').innerHTML = `
                <input type="text" class="edit-username" value="${username}"
                    style="background: transparent; border: 1px solid var(--border-dark);
                    color: var(--text-dark); padding: 4px; border-radius: 4px;">
            `;
            
            editBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                </svg>
                Save
            `;
        } else {
            // Save changes
            const newName = profileDetails.querySelector('.edit-name').value;
            const newUsername = profileDetails.querySelector('.edit-username').value;
            
            profileDetails.querySelector('h1').textContent = newName;
            profileDetails.querySelector('.username').textContent = newUsername;
            
            editBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 00-.064.108l-.558 1.953 1.953-.558a.253.253 0 00.108-.064l6.286-6.286zm1.476-3.209a.25.25 0 00-.354 0L10.811 4.5l1.439 1.44 1.5-1.5a.25.25 0 000-.354l-1.085-1.086z"/>
                </svg>
                Edit
            `;
        }
    });
  
    // Handle search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const replItems = replsList.querySelectorAll('.profile-option-repl-item');
        
        replItems.forEach(item => {
            const replName = item.querySelector('h3').textContent.toLowerCase();
            if (replName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
  
    // Add loading indicator styles
    const style = document.createElement('style');
    style.textContent = `
        .loading-indicator {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s linear infinite;
        }
  
        @keyframes spin {
            to {
                transform: translate(-50%, -50%) rotate(360deg);
            }
        }
  
        .profile-option-cover-photo {
            position: relative;
            transition: all 0.3s ease;
        }
  
        .edit-name, .edit-username {
            font-family: var(--font-family);
            margin: 2px 0;
        }
  
        .edit-name:focus, .edit-username:focus {
            outline: none;
            border-color: #4776E6 !important;
        }
    `;
    document.head.appendChild(style);
  
    // Optional: Image upload function (implement according to your backend)
    async function uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);
  
            const response = await fetch('/api/upload-cover-photo', {
                method: 'POST',
                body: formData
            });
  
            if (!response.ok) {
                throw new Error('Upload failed');
            }
  
            const data = await response.json();
            return data.imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
        }
    }
  });