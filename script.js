document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // Preloader & Image Recovery
    // =========================================
    const hideLoader = () => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.visibility = 'hidden', 500);
        }
    };

    window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 5000);

    // Global Image Error Handler for Deployment
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            console.error('❌ IMAGE FAILED:', this.src);
            
            // AUTOMATIC PATH CORRECTION
            // If we are on GitHub/Vercel, we might need to try without the leading dot or slash
            const currentPath = window.location.pathname;
            const isGitHub = window.location.hostname.includes('github.io');
            
            if (isGitHub && !this.dataset.retried) {
                this.dataset.retried = "true";
                // Try to find the image in the current directory
                const fileName = this.src.split('/').pop();
                const newSrc = `images/${fileName}`;
                console.log('🔄 Retrying with detected path:', newSrc);
                this.src = newSrc;
            }
        };
    });

    // =========================================
    // Typed.js Initialization
    // =========================================
    if (document.getElementById('typed')) {
        new Typed('#typed', {
            strings: [
                'Website Developer',
                'Graphic Designer',
                'Professional Video Editor',
                'Digital Creator'
            ],
            typeSpeed: 60,
            backSpeed: 40,
            backDelay: 2000,
            loop: true
        });
    }

    // =========================================
    // ScrollReveal Animations
    // =========================================
    const sr = ScrollReveal({
        origin: 'top',
        distance: '60px',
        duration: 2000,
        delay: 200,
        reset: false // Keep animations once revealed
    });

    sr.reveal('.reveal', { interval: 100 });
    sr.reveal('.hero-content', { origin: 'left', delay: 400 });
    sr.reveal('.hero-image', { origin: 'right', delay: 600 });
    sr.reveal('.about-stats .stat-item', { interval: 200, origin: 'bottom' });
    sr.reveal('.service-card', { interval: 200, origin: 'bottom' });
    sr.reveal('.project-card', { interval: 200, scale: 0.85 });

    // =========================================
    // Navbar Scroll Effect
    // =========================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        } else {
            navbar.style.padding = '0';
            navbar.style.background = 'rgba(10, 10, 10, 0.8)';
        }
        
        // Update Active Link
        updateActiveLink();
    });

    function updateActiveLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }

    // =========================================
    // Mobile Menu Toggle
    // =========================================
    const menuBtn = document.querySelector('.menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');

    menuBtn.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        
        const icon = menuBtn.querySelector('i');
        if (navLinksContainer.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            if(icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // =========================================
    // Skill Bars Animation (Intersection Observer)
    // =========================================
    const skillSection = document.getElementById('skills');
    const progressBars = document.querySelectorAll('.progress');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                progressBars.forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width;
                });
            }
        });
    }, { threshold: 0.5 });

    if (skillSection) skillObserver.observe(skillSection);

    // =========================================
    // Counter Animation
    // =========================================
    const stats = document.querySelectorAll('.stat-number');
    let started = false;

    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                stats.forEach(stat => startCount(stat));
                started = true;
            }
        });
    }, { threshold: 0.5 });

    function startCount(el) {
        const target = +el.getAttribute('data-target');
        const increment = target / 50; // Speed of counting
        let count = 0;

        const updateCount = () => {
            if (count < target) {
                count += increment;
                el.innerText = Math.ceil(count);
                setTimeout(updateCount, 40);
            } else {
                el.innerText = target;
            }
        };
        updateCount();
    }

    const aboutSection = document.getElementById('about');
    if (aboutSection) countObserver.observe(aboutSection);

    // =========================================
    // Fetch Projects from Supabase (or fallback)
    // =========================================
    const portfolioGrid = document.querySelector('.portfolio-grid');

    async function fetchProjects() {
        if (!portfolioGrid) return;

        // Try Supabase first (cloud database on Vercel)
        if (typeof supabaseClient !== 'undefined' && supabaseClient !== null) {
            try {
                const { data: projects, error } = await supabaseClient
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && projects && projects.length > 0) {
                    renderProjects(projects);
                    return;
                }
            } catch (err) {
                console.warn('Supabase fetch notice:', err.message);
            }
        }

        // Fallback: Local backend if running
        try {
            const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5000/api/projects'
                : null;
            if (API_URL) {
                const response = await fetch(API_URL);
                if (response.ok) {
                    const projects = await response.json();
                    if (projects && projects.length > 0) {
                        renderProjects(projects);
                    }
                }
            }
        } catch (err) {
            // Silently fall back to static projects already present in index.html
        }
    }

    function renderProjects(projects) {
        portfolioGrid.innerHTML = ''; // Clear default static cards
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card glass-card reveal';
            
            // Handle both Supabase image_url and legacy backend imagePath
            const imgPath = project.image_url 
                || (project.imagePath && project.imagePath.startsWith('/') ? `http://localhost:5000${project.imagePath}` : project.imagePath)
                || 'images/hero_illustration.png';

            const link = project.project_link || project.projectLink || '#';
            const hasValidLink = link && link !== '#';
            const statusLabel = project.status || 'Fully Finished';
            const statusClass = statusLabel === 'In Progress' ? 'status-progress' : 'status-finished';

            card.innerHTML = `
                <img src="${imgPath}" alt="${project.title}" onerror="this.src='images/hero_illustration.png'">
                <div class="project-overlay">
                    <span class="project-status ${statusClass}">${statusLabel}</span>
                    <h4>${project.title}</h4>
                    <p>${project.category}</p>
                    <a href="${link}" ${hasValidLink ? 'target="_blank" rel="noopener"' : ''} class="view-btn" aria-label="View Project" title="View Project"><i class="fas fa-external-link-alt"></i></a>
                </div>
            `;
            portfolioGrid.appendChild(card);
        });

        // Re-initialize ScrollReveal for new elements
        if (typeof sr !== 'undefined') {
            sr.reveal('.project-card', { interval: 200, scale: 0.85 });
        }
    }

    fetchProjects();

    // =========================================
    // Contact Form Handling
    // =========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;
            
            btn.innerText = 'Sending...';
            btn.disabled = true;

            // Mock submission
            setTimeout(() => {
                alert('Thank you! Your message has been sent to Abeni Tech Camp.');
                contactForm.reset();
                btn.innerText = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }
});
