// js/post.js

document.addEventListener('DOMContentLoaded', () => {
    // Ensure the articles array is available (from articlesData.js)
    if (typeof articles === 'undefined') {
        console.error('Error: articles array not found. Make sure articlesData.js is loaded before post.js');
        return;
    }

    // Get references to the HTML elements where article content will be displayed
    const postTitleElement = document.getElementById('post-title');
    const articleImageGalleryElement = document.getElementById('article-image-gallery');
    const postBodyContentElement = document.getElementById('post-body-content');
    const copyLinkButton = document.querySelector('.share-button.copy-link');
    const shareButtonsContainer = document.querySelector('.article-share-buttons ul');
    const relatedPostsContainer = document.querySelector('#related-articles .posts-grid');

    let selectedArticle = null;

    // 1. Attempt to get the article slug from the URL query parameters first.
    const urlParams = new URLSearchParams(window.location.search);
    const slugFromUrl = urlParams.get('slug');

    if (slugFromUrl) {
        selectedArticle = articles.find(article => article.slug === slugFromUrl);
    } 
    
    // 2. If no article was found via URL slug, fall back to localStorage.
    if (!selectedArticle) {
        const storedArticle = localStorage.getItem('currentArticle');
        if (storedArticle) {
            try {
                const tempArticle = JSON.parse(storedArticle);
                // Important: Re-find the article from the actual `articles` array
                // to ensure we have the most up-to-date data, not just the stored version.
                selectedArticle = articles.find(article => article.slug === tempArticle.slug);
            } catch (e) {
                console.error("Error parsing stored article from localStorage:", e);
                selectedArticle = null;
            }
        }
    }

    // --- Render Article Content ---
    if (selectedArticle) {
        if (postTitleElement) {
            postTitleElement.textContent = selectedArticle.title || 'No Title Available';
        }
        document.title = `NewsReflection - ${selectedArticle.title}`;

        if (articleImageGalleryElement) {
            articleImageGalleryElement.innerHTML = '';
            if (selectedArticle.images && selectedArticle.images.length > 0) {
                let imagesAdded = false;
                selectedArticle.images.forEach(image => {
                    if (image.src && image.src !== '#') { // Ensure image source is valid
                        const imgElement = document.createElement('img');
                        imgElement.src = image.src;
                        imgElement.alt = image.alt || selectedArticle.title || 'Article Image';
                        imgElement.classList.add('post-detail-image');
                        articleImageGalleryElement.appendChild(imgElement);
                        imagesAdded = true;
                    }
                });
                articleImageGalleryElement.style.display = imagesAdded ? 'grid' : 'none';
            } else {
                articleImageGalleryElement.style.display = 'none';
            }
        }

        if (postBodyContentElement) {
            postBodyContentElement.innerHTML = selectedArticle.content || '<p>No content available for this article.</p>';
        }

        // --- Social Share Links Population ---
        if (shareButtonsContainer) {
            const articleUrl = encodeURIComponent(window.location.href);
            const articleTitle = encodeURIComponent(selectedArticle.title);

            const fbLink = shareButtonsContainer.querySelector('.share-button.facebook');
            if (fbLink) {
                fbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`;
            }
            const liLink = shareButtonsContainer.querySelector('.share-button.linkedin');
            if (liLink) {
                liLink.href = `https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}&title=${articleTitle}`;
            }
            const waLink = shareButtonsContainer.querySelector('.share-button.whatsapp');
            if (waLink) {
                waLink.href = `https://wa.me/?text=${articleTitle}%0A${articleUrl}`;
            }
            const emailLink = shareButtonsContainer.querySelector('.share-button.email');
            if (emailLink) {
                emailLink.href = `mailto:?subject=${articleTitle}&body=Check out this article from NewsReflection: ${articleUrl}`;
            }
            // Twitter link - ensure you have a .share-button.twitter in your HTML for this
            const twLink = shareButtonsContainer.querySelector('.share-button.twitter');
            if (twLink) {
                twLink.href = `https://twitter.com/intent/tweet?text=${articleTitle}&url=${articleUrl}`;
            }
        }

        // --- Copy Link functionality ---
        if (copyLinkButton) {
            copyLinkButton.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Article link copied to clipboard!');
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy link. Your browser might not support automatic copying or permission was denied.');
                }
            });
        }

        // --- Populate Related Articles (Random, excluding current) ---
        if (relatedPostsContainer) {
            relatedPostsContainer.innerHTML = '';
            const currentArticleSlug = selectedArticle.slug;
            const relatedArticles = articles
                .filter(article => article.slug !== currentArticleSlug)
                .sort(() => 0.5 - Math.random()) // Randomize
                .slice(0, 3); // Take up to 3

            if (relatedArticles.length > 0) {
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
                    relatedPostsContainer.appendChild(postCard);

                    // Re-add event listeners for related post links to ensure they navigate correctly
                    const links = postCard.querySelectorAll('.post-title-link, .button.primary');
                    links.forEach(link => {
                        link.addEventListener('click', (event) => {
                            event.preventDefault();
                            const slug = event.target.dataset.slug;
                            const relatedSelectedArticle = articles.find(a => a.slug === slug);
                            if (relatedSelectedArticle) {
                                localStorage.setItem('currentArticle', JSON.stringify(relatedSelectedArticle));
                                window.location.href = `post.html?slug=${slug}`;
                            }
                        });
                    });
                });
            } else {
                relatedPostsContainer.innerHTML = '<p>No other related reflections available.</p>';
            }
        }

    } else {
        // --- Fallback for Article Not Found ---
        if (postTitleElement) {
            postTitleElement.textContent = 'Article Not Found';
        }
        if (postBodyContentElement) {
            postBodyContentElement.innerHTML = '<p>The article you are looking for could not be loaded. Please return to the <a href="index.html">homepage</a>.</p>';
        }
        if (articleImageGalleryElement) {
            articleImageGalleryElement.style.display = 'none';
        }
        if (shareButtonsContainer) {
            shareButtonsContainer.style.display = 'none';
        }
        const relatedArticlesSection = document.getElementById('related-articles');
        if (relatedArticlesSection) {
            relatedArticlesSection.style.display = 'none';
        }
        document.title = 'NewsReflection - Article Not Found';
    }
});