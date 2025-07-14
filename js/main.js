// js/main.js

document.addEventListener('DOMContentLoaded', () => {

    // Ensure the articles array is available (from articlesData.js)
    if (typeof articles === 'undefined') {
        console.error('Error: articles array not found. Make sure articlesData.js is loaded before main.js');
        return; // Stop execution if data isn't available
    }


    // --- Homepage Slideshow Logic ---
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    const slideshowContainer = document.querySelector('.slideshow-container');

    let currentSlide = 0;
    let slideInterval; 

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoPlay();
        });
    });

    function startAutoPlay() {
        if (slides.length > 1) {
            slideInterval = setInterval(nextSlide, 3500); // 3.5 seconds
        }
    }

    function resetAutoPlay() {
        clearInterval(slideInterval);
        startAutoPlay();
    }

    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slideshowContainer.addEventListener('mouseleave', () => startAutoPlay());
    }

    if (slides.length > 0) {
        showSlide(currentSlide);
        startAutoPlay();
    }


    // --- Smooth Scroll Animation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Section Animation (Scroll-triggered) ---
    const sections = document.querySelectorAll('.hero-section, .latest-posts-section, .newsletter-signup-section, .related-articles-section'); // Re-added related-articles-section here for animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0
    };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-ready');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    const mainHeader = document.querySelector('.main-header');
    if (mainHeader) {
        mainHeader.classList.add('animate-ready');
    }

    // --- Dynamic Post Card Generation on index.html (Main Articles List) ---
    const latestPostsGrid = document.getElementById('posts-container');

    if (latestPostsGrid) {
        latestPostsGrid.innerHTML = ''; // Clear any existing content

        // Sort articles by date (most recent first)
        const sortedArticles = [...articles].sort((a, b) => {
            // Robust date parsing (if meta format can vary, make this more complex)
            const dateA = new Date(a.meta.split('|')[1].trim()); 
            const dateB = new Date(b.meta.split('|')[1].trim());
            return dateB - dateA; // Sort descending (latest first)
        });

        sortedArticles.forEach(article => {
            const postCard = document.createElement('article');
            postCard.classList.add('post-card'); 

            postCard.innerHTML = `
                <img src="${article.thumbnail}" alt="Post Thumbnail for ${article.title}" class="post-thumbnail">
                <div class="post-card-content">
                    <h3><a href="post.html?slug=${article.slug}" class="post-title-link" data-slug="${article.slug}">${article.title}</a></h3>
                    <p class="post-meta">${article.meta}</p>
                    <p class="post-excerpt">${article.excerpt}</p>
                </div>
            `;
            latestPostsGrid.appendChild(postCard);

            // Add event listener to each article link to store its data before navigating
            const links = postCard.querySelectorAll('.post-title-link'); // Removed .button.primary as it's not in the innerHTML for latestPostsGrid
            links.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault(); 
                    const slug = event.target.dataset.slug;
                    const selectedArticle = articles.find(a => a.slug === slug);
                    if (selectedArticle) {
                        localStorage.setItem('currentArticle', JSON.stringify(selectedArticle));
                        window.location.href = `post.html?slug=${slug}`;
                    }
                });
            });
        });
        // On index.html, set default OG tags
        resetDefaultOpenGraphTags();

    } else {
        console.warn('Element with id "posts-container" (for latest posts) not found. Cannot populate all articles.');
    }

    // --- Dynamic Post Card Generation on index.html (Related Articles List) ---
    const relatedPostsGrid = document.getElementById('related-posts-container');

    if (relatedPostsGrid) {
        relatedPostsGrid.innerHTML = ''; // Clear any existing content

        const sortedArticles = [...articles].sort((a, b) => {
            const dateA = new Date(a.meta.split('|')[1].trim()); 
            const dateB = new Date(b.meta.split('|')[1].trim());
            return dateB - dateA;
        });

        // Example: Get a subset of articles for related posts (e.g., first 3, or random)
        const relatedArticles = sortedArticles.slice(0, 3); // Adjust this logic as needed for 'related'

        relatedArticles.forEach(article => {
            const postCard = document.createElement('article');
            postCard.classList.add('post-card'); 

            postCard.innerHTML = `
                <img src="${article.thumbnail}" alt="Post Thumbnail for ${article.title}" class="post-thumbnail">
                <div class="post-card-content">
                    <h3><a href="post.html?slug=${article.slug}" class="post-title-link" data-slug="${article.slug}">${article.title}</a></h3>
                    <p class="post-meta">${article.meta}</p>
                    <p class="post-excerpt">${article.excerpt}</p>
                </div>
            `;
            relatedPostsGrid.appendChild(postCard);

            // Add event listener to each article link to store its data before navigating
            const links = postCard.querySelectorAll('.post-title-link'); // Removed .button.primary
            links.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault(); 
                    const slug = event.target.dataset.slug;
                    const selectedArticle = articles.find(a => a.slug === slug);
                    if (selectedArticle) {
                        localStorage.setItem('currentArticle', JSON.stringify(selectedArticle));
                        window.location.href = `post.html?slug=${slug}`;
                    }
                });
            });
        });
    } else {
        console.warn('Element with id "related-posts-container" not found. Cannot populate related articles.');
    }

    // --- Featured Post Click Logic ---
    const featuredPostLinks = document.querySelectorAll('.hero-section .featured-post .post-title-link, .hero-section .featured-post .button.primary');
    
    featuredPostLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const featuredArticleSlug = event.target.dataset.slug;
            const selectedArticle = articles.find(article => article.slug === featuredArticleSlug);

            if (selectedArticle) {
                localStorage.setItem('currentArticle', JSON.stringify(selectedArticle));
                window.location.href = `post.html?slug=${selectedArticle.slug}`;
            } else {
                console.error('Error: Featured article not found for slug:', featuredArticleSlug);
                window.location.href = 'index.html'; // Fallback
            }
        });
    });


    // --- Newsletter Signup Functionality ---
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email-input');
    const newsletterMessage = document.getElementById('newsletter-message');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const email = emailInput.value.trim(); 

            if (email) {
                let subscriptions = JSON.parse(localStorage.getItem('newsletterEmails')) || [];

                if (subscriptions.includes(email)) {
                    newsletterMessage.textContent = 'You are already subscribed!';
                    newsletterMessage.style.color = '#ffc107'; 
                } else {
                    subscriptions.push(email);
                    localStorage.setItem('newsletterEmails', JSON.stringify(subscriptions));

                    newsletterMessage.textContent = 'Subscribed!';
                    newsletterMessage.style.color = '#28a745'; 

                    emailInput.value = '';
                }
            } else {
                newsletterMessage.textContent = 'Please enter a valid email address.';
                newsletterMessage.style.color = '#dc3545'; 
            }

            setTimeout(() => {
                newsletterMessage.textContent = '';
                newsletterMessage.style.color = ''; 
            }, 3000);
        });
    }

    // --- Article Detail Page Logic (post.html) ---
    // This section runs ONLY when post.html is loaded directly or navigated to.
    const articleDetailTitle = document.getElementById('article-detail-title');
    const articleDetailContent = document.getElementById('article-detail-content');
    const articleDetailThumbnail = document.getElementById('article-detail-thumbnail');
    const articleDetailMeta = document.getElementById('article-detail-meta'); // Assuming you have this element

    if (articleDetailTitle && articleDetailContent) {
        // Try to get article data from localStorage first
        let currentArticle = JSON.parse(localStorage.getItem('currentArticle'));

        // If not in localStorage, try to get slug from URL and find it in the global articles array
        if (!currentArticle) {
            const urlParams = new URLSearchParams(window.location.search);
            const slugFromUrl = urlParams.get('slug');
            if (slugFromUrl) {
                currentArticle = articles.find(a => a.slug === slugFromUrl);
            }
        }

        if (currentArticle) {
            articleDetailTitle.textContent = currentArticle.title;
            articleDetailContent.innerHTML = currentArticle.content; // Use innerHTML for rich content
            if (articleDetailThumbnail) {
                articleDetailThumbnail.src = currentArticle.thumbnail;
                articleDetailThumbnail.alt = `Thumbnail for ${currentArticle.title}`;
            }
            if (articleDetailMeta) {
                articleDetailMeta.textContent = currentArticle.meta;
            }

            // --- IMPORTANT: Update OG tags for the specific article ---
            setArticleOpenGraphTags(currentArticle);

        } else {
            articleDetailTitle.textContent = 'Article Not Found';
            articleDetailContent.innerHTML = '<p>The article you are looking for does not exist or could not be loaded.</p>';
            console.error('No article found to display on post.html');
            // Optionally redirect to homepage or set a generic 404 OG tag
            resetDefaultOpenGraphTags(); // Set default if article not found
        }
    } else if (!window.location.pathname.includes('post.html')) {
        // If not on post.html, it's likely index.html or another page.
        // Ensure default OG tags are set for general pages.
        resetDefaultOpenGraphTags();
    }
});