/**
 * Initializes all Collapsible Containers on the page.
 */
function initCollapsibles() {
    const containers = document.querySelectorAll('.collapsible-container');

    containers.forEach(container => {
        if (container.dataset.initialized === "true") return;
        container.dataset.initialized = "true";

        const trigger = container.querySelector('.collapsible-trigger');
        
        if (trigger) {
            trigger.addEventListener('click', () => {
                container.classList.toggle('open');
            });
        }
    });
}

// Run automatically when DOM is ready
document.addEventListener("DOMContentLoaded", initCollapsibles);