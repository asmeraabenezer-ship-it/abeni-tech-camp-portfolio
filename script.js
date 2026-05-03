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
    const navLinks = document.querySelector('.nav-links');

    menuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        // Add more logic for mobile menu animation if needed
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
    // Fetch Projects from Backend
    // =========================================
    const portfolioGrid = document.querySelector('.portfolio-grid');
    // Change this URL to your deployed backend URL once you have it
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api/projects'
        : 'https://your-backend-service.com/api/projects'; 

    async function fetchProjects() {
        try {
            const response = await fetch(API_URL);
            const projects = await response.json();
            
            if (projects.length > 0) {
                renderProjects(projects);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            // Fallback to static content if backend is not running
        }
    }

    function renderProjects(projects) {
        portfolioGrid.innerHTML = ''; // Clear existing
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card glass-card reveal';
            
            // Fix path if it's from images/ folder
            const imgPath = project.imagePath.startsWith('/') ? `http://localhost:5000${project.imagePath}` : project.imagePath;

            card.innerHTML = `
                <img src="${imgPath}" alt="${project.title}">
                <div class="project-overlay">
                    <h4>${project.title}</h4>
                    <p>${project.category}</p>
                    <a href="#" class="view-btn" aria-label="View Project" title="View Project"><i class="fas fa-external-link-alt"></i></a>
                </div>
            `;
            portfolioGrid.appendChild(card);
        });

        // Re-initialize ScrollReveal for new elements
        sr.reveal('.project-card', { interval: 200, scale: 0.85 });
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
