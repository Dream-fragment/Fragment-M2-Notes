/**
 * Initializes all Multiple Choice Questions on the page.
 */
function initMCQs() {
    const mcqs = document.querySelectorAll('.multiple-choice');

    mcqs.forEach(mcq => {
        if (mcq.dataset.initialized === "true") return;
        mcq.dataset.initialized = "true";

        const options = mcq.querySelectorAll('.mc-option-box');
        const feedback = mcq.querySelector('.mc-feedback');
        const container = mcq.querySelector('.mc-options-container');
        
        // Create Retry Button dynamically
        const retryBtn = document.createElement('button');
        retryBtn.textContent = "🔄 Retry";
        retryBtn.className = "retry-btn";
        retryBtn.style.display = "none"; 
        
        if (feedback) {
            feedback.after(retryBtn);
        } else {
            mcq.appendChild(retryBtn);
        }

        // Helper to reset visual state for retry
        function resetState() {
            options.forEach(opt => {
                opt.classList.remove('wrong-answer', 'correct-answer');
            });
            if (container) container.classList.remove('locked');
            if (feedback) {
                feedback.textContent = "";
                feedback.style.minHeight = "0";
            }
            retryBtn.style.display = "none";
        }

        // Helper to render LaTeX in feedback
        function renderFeedback(text, color) {
            if (!feedback) return;
            feedback.style.color = color;
            feedback.textContent = text; // Set the text (including LaTeX code like $...$)
            
            // Tell MathJax to find and render any new math in this element
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([feedback]).catch((err) => console.log(err));
            }
        }

        // Retry Button Logic
        retryBtn.addEventListener('click', () => {
            resetState();
        });

        // Option Click Logic
        options.forEach(option => {
            option.addEventListener('click', () => {
                // If already locked (correct answer found), ignore
                if (container && container.classList.contains('locked')) return;

                const isCorrect = option.getAttribute('data-correct') === 'true';

                if (isCorrect) {
                    // Correct Answer Logic
                    option.classList.add('correct-answer');
                    if (container) container.classList.add('locked'); // Lock all options
                    
                    const msg = option.getAttribute('data-feedback') || "✅ Correct!";
                    renderFeedback(msg, '#0c7c57');
                    
                    retryBtn.style.display = "none";
                } else {
                    // Wrong Answer Logic
                    option.classList.add('wrong-answer');
                    
                    const msg = option.getAttribute('data-wrong-feedback') || "❌ Incorrect. Try again!";
                    renderFeedback(msg, '#ef4444');
                    
                    // Show Retry Button
                    retryBtn.style.display = "inline-block";
                }
            });
        });
    });
}

// Run automatically when DOM is ready
document.addEventListener("DOMContentLoaded", initMCQs);