/**
 * Navigation Sidebar Helper
 * Dynamically generates a foldable table of contents from h1, h2, h3 elements
 */

function initNavSidebar() {
    // Check if already initialized
    if (document.getElementById('nav-sidebar')) return;

    // Create mobile toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'nav-toggle';
    toggleBtn.textContent = '☰ Contents';
    document.body.insertBefore(toggleBtn, document.body.firstChild);

    // Create sidebar collapse/expand button (side button)
    const collapseBtn = document.createElement('button');
    collapseBtn.id = 'nav-collapse-btn';
    collapseBtn.innerHTML = '◀';
    collapseBtn.title = 'Collapse Sidebar';
    document.body.appendChild(collapseBtn);

    // Create sidebar navigation
    const sidebar = document.createElement('nav');
    sidebar.id = 'nav-sidebar';
    
    const title = document.createElement('h4');
    title.textContent = 'Table of Contents';
    sidebar.appendChild(title);

    const tocList = document.createElement('ul');
    tocList.id = 'toc-list';
    sidebar.appendChild(tocList);

    // Insert sidebar at beginning of body
    document.body.insertBefore(sidebar, document.body.firstChild);

    // Generate TOC from headings
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach((heading, index) => {
        // Ensure ID exists
        if (!heading.id) {
            heading.id = 'heading-' + index;
        }

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;
        
        // Add classes for styling hierarchy
        if (heading.tagName === 'H2') {
            a.classList.add('nav-h2');
        } else if (heading.tagName === 'H3') {
            a.classList.add('nav-h3');
        }

        // Click event for smooth scroll and closing mobile menu
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById(heading.id).scrollIntoView({
                behavior: 'smooth'
            });
            // Close sidebar on mobile after click
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });

        li.appendChild(a);
        tocList.appendChild(li);
    });

    // Mobile toggle logic
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Sidebar collapse/expand logic (desktop)
    let isCollapsed = false;
    collapseBtn.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            collapseBtn.innerHTML = '▶';
            collapseBtn.title = 'Expand Sidebar';
        } else {
            sidebar.classList.remove('collapsed');
            collapseBtn.innerHTML = '◀';
            collapseBtn.title = 'Collapse Sidebar';
        }
    });

    // Highlight active section on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        headings.forEach(heading => {
            const sectionTop = heading.offsetTop;
            const sectionHeight = heading.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) { // Offset for header height
                current = heading.getAttribute('id');
            }
        });

        document.querySelectorAll('#nav-sidebar a').forEach(a => {
            a.classList.remove('active');
            // Use exact match instead of includes to prevent partial matching
            if (a.getAttribute('href') === '#' + current) {
                a.classList.add('active');
            }
        });
    });
}

// Run automatically when DOM is ready
document.addEventListener("DOMContentLoaded", initNavSidebar);
