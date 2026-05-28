// Portfolio Lightbox
document.addEventListener('DOMContentLoaded', () => {
  // Dark Mode Toggle
  const themeToggle = document.querySelector('.theme-toggle');
  const htmlElement = document.documentElement;
  
  // Check for saved preference, otherwise use system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark === false ? 'light' : 'dark');
  htmlElement.setAttribute('data-theme', currentTheme);
  
  // Update toggle button icon
  const updateToggleIcon = (theme) => {
    if (themeToggle) {
      const svg = themeToggle.querySelector('.theme-icon');
      if (svg) {
        if (theme === 'dark') {
          // Sun icon for light mode
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'white');
          svg.setAttribute('stroke-width', '2');
          svg.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        } else {
          // Moon icon for dark mode
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'white');
          svg.setAttribute('stroke-width', '2');
          svg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        }
      }
      themeToggle.setAttribute('data-tooltip', theme === 'dark' ? 'Light Mode' : 'Dark Mode');
    }
  };
  
  updateToggleIcon(currentTheme);
  
  // Toggle theme
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = htmlElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateToggleIcon(newTheme);
    });
  }
  
  // Detect Firefox and hide poster frame to avoid dual play buttons
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  if (isFirefox) {
    const videos = document.querySelectorAll('video[poster]');
    videos.forEach(video => {
      video.removeAttribute('poster');
    });
  }
  
  // Create lightbox elements
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.className = 'lightbox';
  
  // Add navigation buttons
  const prevButton = document.createElement('button');
  prevButton.className = 'lightbox-nav prev';
  prevButton.innerHTML = '&#10094;';
  
  const nextButton = document.createElement('button');
  nextButton.className = 'lightbox-nav next';
  nextButton.innerHTML = '&#10095;';
  
  lightbox.appendChild(prevButton);
  lightbox.appendChild(nextButton);
  document.body.appendChild(lightbox);

  let currentImageIndex = 0;
  let currentGalleryImages = [];

  // Get all timeline items
  const timelineItems = document.querySelectorAll('.timeline_item');
  
  // Function to show image
  const showImage = (index) => {
    currentImageIndex = index;
    const currentItem = currentGalleryImages[index];
    
    // Clear existing content
    while (lightbox.firstChild) {
      // Stop any playing videos before clearing
      const existingVideo = lightbox.querySelector('video');
      if (existingVideo) {
        existingVideo.pause();
      }
      lightbox.removeChild(lightbox.firstChild);
    }
    
    // Create media element based on type
    let mediaElement;
    if (currentItem.tagName.toLowerCase() === 'video') {
      mediaElement = document.createElement('video');
      mediaElement.src = currentItem.src;
      // Copy poster attribute if it exists
      if (currentItem.poster) {
        mediaElement.poster = currentItem.poster;
      }
      mediaElement.controls = true;
      mediaElement.style.maxWidth = '90%';
      mediaElement.style.maxHeight = '90vh';
      
      // Prevent video clicks from closing lightbox
      mediaElement.onclick = (e) => {
        e.stopPropagation();
      };
    } else {
      mediaElement = document.createElement('img');
      mediaElement.src = currentItem.src;
      // Copy class attribute for styling (e.g., invert-dark)
      if (currentItem.className) {
        mediaElement.className = currentItem.className;
      }
    }
    
    // Create caption
    const caption = document.createElement('div');
    caption.className = 'lightbox-caption';
    caption.innerHTML = currentItem.dataset.caption;
    
    // Add elements to lightbox
    lightbox.appendChild(prevButton);
    lightbox.appendChild(mediaElement);
    lightbox.appendChild(caption);
    lightbox.appendChild(nextButton);
    
    // Update button visibility
    prevButton.style.display = index === 0 ? 'none' : 'block';
    nextButton.style.display = index === currentGalleryImages.length - 1 ? 'none' : 'block';
  };

  // Handle image clicks for each timeline item
  timelineItems.forEach(item => {
    const imageWrappers = item.querySelectorAll('.timeline_image-wrapper');
    
    imageWrappers.forEach(wrapper => {
      const mainImage = wrapper.querySelector('img:not([style*="display: none"])');
      const galleryItems = wrapper.querySelectorAll('img[style*="display: none"], video[style*="display: none"]');
      
      if (mainImage && galleryItems.length > 0) {
        // Main image click opens gallery starting with first hidden image
        mainImage.addEventListener('click', () => {
          currentGalleryImages = Array.from(galleryItems);
          lightbox.classList.add('active');
          showImage(0);
        });

        // Add click handlers to gallery images (for debugging/direct access)
        galleryItems.forEach((image, index) => {
          image.addEventListener('click', () => {
            currentGalleryImages = Array.from(galleryItems);
            lightbox.classList.add('active');
            showImage(index);
          });
        });
      }
    });
  });

  // Navigation button handlers
  prevButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      showImage(currentImageIndex - 1);
    }
  });

  nextButton.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentImageIndex < currentGalleryImages.length - 1) {
      showImage(currentImageIndex + 1);
    }
  });

  // Close lightbox when clicking outside the image
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) {
      // Stop all videos when closing lightbox
      const videos = lightbox.querySelectorAll('video');
      videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
      });
      lightbox.classList.remove('active');
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'ArrowLeft') {
      if (currentImageIndex > 0) {
        showImage(currentImageIndex - 1);
      } else {
        // Close lightbox if we're at the first image and left arrow is pressed
        const videos = lightbox.querySelectorAll('video');
        videos.forEach(video => {
          video.pause();
          video.currentTime = 0;
        });
        lightbox.classList.remove('active');
      }
    }
    else if (e.key === 'ArrowRight') {
      if (currentImageIndex < currentGalleryImages.length - 1) {
        showImage(currentImageIndex + 1);
      } else {
        // Close lightbox if we're at the last image and right arrow is pressed
        const videos = lightbox.querySelectorAll('video');
        videos.forEach(video => {
          video.pause();
          video.currentTime = 0;
        });
        lightbox.classList.remove('active');
      }
    }
    else if (e.key === 'Escape') {
      // Stop all videos when closing lightbox
      const videos = lightbox.querySelectorAll('video');
      videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
      });
      lightbox.classList.remove('active');
    }
  });

  // Handle collapsible boxes
  const collapsibles = document.querySelectorAll('.wrap-collabsible');
  
  // Close collapsible box when clicking outside
  document.addEventListener('click', (e) => {
    collapsibles.forEach(collapsible => {
      const toggle = collapsible.querySelector('.toggle');
      const content = collapsible.querySelector('.collapsible-content');
      const label = collapsible.querySelector('.lbl-toggle');
      
      // If click is outside this collapsible and it's open
      if (!collapsible.contains(e.target) && toggle.checked) {
        toggle.checked = false;
      }
    });
  });

  // Prevent collapsible from closing when clicking inside
  collapsibles.forEach(collapsible => {
    collapsible.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // Add touch handling variables
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50; // Minimum distance for a swipe

  // Add touch event listeners to lightbox
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  // Handle swipe logic
  const handleSwipe = () => {
    const swipeDistance = touchEndX - touchStartX;
    
    // Ignore small movements
    if (Math.abs(swipeDistance) < minSwipeDistance) return;
    
    if (swipeDistance > 0) {
      // Swiped right - show previous
      if (currentImageIndex > 0) {
        showImage(currentImageIndex - 1);
      } else {
        // Close if at first image
        const videos = lightbox.querySelectorAll('video');
        videos.forEach(video => {
          video.pause();
          video.currentTime = 0;
        });
        lightbox.classList.remove('active');
      }
    } else {
      // Swiped left - show next
      if (currentImageIndex < currentGalleryImages.length - 1) {
        showImage(currentImageIndex + 1);
      } else {
        // Close if at last image
        const videos = lightbox.querySelectorAll('video');
        videos.forEach(video => {
          video.pause();
          video.currentTime = 0;
        });
        lightbox.classList.remove('active');
      }
    }
  };

  // Dot label fade based on distance from viewport center
  const dots = document.querySelectorAll('.timeline_circle[class*="dot-"]');
  const updateDotOpacity = () => {
    const viewportCenter = window.innerHeight / 2;
    dots.forEach(dot => {
      const rect = dot.getBoundingClientRect();
      const dotCenter = rect.top + rect.height / 2;
      const distance = Math.abs(dotCenter - viewportCenter);
      const maxDistance = window.innerHeight / 2;
      const opacity = Math.max(0, 1 - distance / maxDistance);
      dot.style.setProperty('--dot-opacity', opacity);
    });
  };
  window.addEventListener('scroll', updateDotOpacity, { passive: true });
  updateDotOpacity();

  // Arrow key navigation between snap points
  const snapTargets = document.querySelectorAll('.first-image-wrapper');
  const getClosestSnapIndex = () => {
    const viewportCenter = window.innerHeight / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    snapTargets.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });
    return closestIndex;
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const lightbox = document.querySelector('.lightbox.active');
      if (lightbox) return;

      e.preventDefault();
      const current = getClosestSnapIndex();
      const next = e.key === 'ArrowDown'
        ? Math.min(current + 1, snapTargets.length - 1)
        : Math.max(current - 1, 0);
      snapTargets[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}); 