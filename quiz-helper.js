// quiz-helper.js
// General-purpose Random Quiz System with GeoGebra Integration

class Quiz {
    constructor(containerId, questions, shuffle = true) {
        this.container = document.getElementById(containerId);
        this.questions = shuffle ? this.shuffleArray([...questions]) : [...questions];
        this.currentIndex = 0;
        this.score = 0;
        this.currentApplet = null; // Store current GeoGebra instance
        
        if (!this.container) {
            console.error("Quiz container not found!");
            return;
        }
        
        this.init();
    }

    init() {
        this.renderQuestion();
    }

    /**
     * Helper to generate random integer between min and max
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Helper to generate random float with specified decimal places
     */
    randomFloat(min, max, decimals = 2) {
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    }

    /*
     * Helper to select a random element from an array
     */
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    formatAnswer(value) {
        if (Array.isArray(value)) {
            return `(${value.join(', ')})`;
        }
        return value;
    }

    renderQuestion() {
        const question = this.questions[this.currentIndex];
        
        // 1. Generate Random Parameters for this instance
        const params = question.generateParams ? question.generateParams.call(this) : {};
        
        // 2. Handle MCQ options if they are generated dynamically
        let displayOptions = question.options ? [...question.options] : [];
        if (question.type === 'multiple-choice' && params.options) {
            displayOptions = [...params.options];
        }
        displayOptions = this.shuffleArray(displayOptions);

        // 3. Build HTML Content
        let html = `
            <div class="quiz-card fade-in">
                <div class="quiz-header">
                    <span class="quiz-progress">Question ${this.currentIndex + 1} of ${this.questions.length}</span>
                    <span class="quiz-score">Score: ${this.score}</span>
                </div>
                <h3 class="quiz-question-text">${this.replaceParams(question.text, params)}</h3>
                <div id="quiz-content-area" class="quiz-content-area"></div>
                <div id="quiz-feedback" class="quiz-feedback"></div>
                <div class="quiz-actions">
                    <button id="check-btn" class="quiz-btn primary">Check Answer</button>
                    <button id="next-btn" class="quiz-btn secondary" style="display:none;">Next Question</button>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // 4. Render Specific Question Type
        const contentArea = document.getElementById('quiz-content-area');
        
        if (question.type === 'short-answer') {
            this.renderShortAnswer(contentArea, question, params);
        } else if (question.type === 'multiple-choice') {
            this.renderMultipleChoice(contentArea, question, params, displayOptions);
        } else if (question.type === 'graphing') {
            this.renderGraphing(contentArea, question, params);
        }

        // 5. Bind Check Button
        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkAnswer(question, params, displayOptions);
        });

        this.renderMath();
    }

    /**
     * Replace parameter placeholders in text
     * @param {string} text - Text with {param} placeholders
     * @param {object} params - Parameter object
     * @returns {string} Text with parameters substituted
     */
    replaceParams(text, params) {
        let result = text;
        for (const [key, value] of Object.entries(params)) {
            if (key === 'options') continue; // Skip options object
            let displayValue = value;
            if (Array.isArray(value)) {
                displayValue = `(${value.join(', ')})`;
            }
            const placeholder = '\\{' + key + '\\}';
            result = result.replaceAll(placeholder, displayValue);
        }
        return result;
    }

    formatNumber(value, sigfigs) {
        if (typeof value !== 'number') return value;
        if (!sigfigs) return value;
        const formatted = Number(value).toPrecision(sigfigs);
        return formatted.replace(/\.0+$/, '').replace(/(\.[0-9]*[1-9])0+$/, '$1');
    }

    formatAnswer(value, sigfigs) {
        if (Array.isArray(value)) {
            return `(${value.map(v => this.formatNumber(v, sigfigs)).join(', ')})`;
        }
        return this.formatNumber(value, sigfigs);
    }

    wrapLatex(value) {
        return `$${value}$`;
    }

    formatAnswerAsLatex(value, sigfigs) {
        if (Array.isArray(value)) {
            const formatted = value.map(v => this.formatNumber(v, sigfigs)).join(', ');
            return this.wrapLatex(`(${formatted})`);
        }
        return this.wrapLatex(this.formatNumber(value, sigfigs));
    }

    getCorrectAnswerLatex(optionText, params) {
        const text = this.replaceParams(optionText, params);
        return text.includes('$') ? text : this.wrapLatex(text);
    }

    renderMath() {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([this.container]).catch(err => console.error(err));
        }
    }

    /**
     * Render short answer input field
     */
    renderShortAnswer(container, question, params) {
        if (question.isVector) {
            container.innerHTML = `
                <div class="input-group">
                    <input type="text" id="user-answer" placeholder="(x,y,z)" class="quiz-input">
                    <span class="input-hint">Enter each component in the form (x,y,z).</span>
                </div>
            `;
            return;
        }

        const step = params.precision ? Math.pow(10, -params.precision) : 'any';
        const hint = params.unit ? `Enter your answer in ${params.unit}` : 'Enter your answer...';
        
        container.innerHTML = `
            <div class="input-group">
                <input type="number" id="user-answer" step="${step}" placeholder="${hint}" class="quiz-input">
                ${params.precision ? `<span class="input-hint">Correct to ${params.precision} decimal places</span>` : ''}
            </div>
        `;
    }

    /**
     * Render multiple choice options
     */
    renderMultipleChoice(container, question, params, options) {
        let optionsHtml = '<div class="mc-grid">';
        options.forEach((opt, index) => {
            // Allow options to use params too
            const optText = this.replaceParams(opt.text, params);
            optionsHtml += `
                <div class="mc-option" data-index="${index}">
                    <span class="mc-letter">${String.fromCharCode(65 + index)}</span>
                    <span>${optText}</span>
                </div>
            `;
        });
        optionsHtml += '</div>';
        container.innerHTML = optionsHtml;

        // Add click listeners for selection
        const optionElements = container.querySelectorAll('.mc-option');
        optionElements.forEach(opt => {
            opt.addEventListener('click', () => {
                optionElements.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
            });
        });
    }

    /**
     * Render GeoGebra interactive graphing question
     */
    renderGraphing(container, question, params) {
        // Create a unique ID for this specific applet instance
        const ggbId = 'ggb-quiz-' + Date.now();
        container.innerHTML = `<div id="${ggbId}" class="ggb-container"></div>`;

        // Load GeoGebra using the project's loader
        if (typeof loadGeoGebra === 'function') {
            loadGeoGebra(ggbId, question.materialId).then(applet => {
                this.currentApplet = applet;
                
                // Execute any setup commands (e.g., setting coordinates)
                if (question.onLoadCommands) {
                    question.onLoadCommands.forEach(cmd => {
                        // Replace params in commands if needed
                        let finalCmd = cmd;
                        for (const [key, value] of Object.entries(params)) {
                            if (Array.isArray(value)) {
                                // Handle vector/array replacement in commands like SetValue[u, {1,2}]
                                finalCmd = finalCmd.replace(`{${key}}`, `{${value.join(',')}}`);
                            } else {
                                finalCmd = finalCmd.replace(`{${key}}`, value);
                            }
                        }
                        applet.evalCommand(finalCmd);
                    });
                }
            }).catch(error => {
                console.error('Failed to load GeoGebra:', error);
                container.innerHTML = "<p style='color:red'>Failed to load interactive graph. Please refresh and try again.</p>";
            });
        } else {
            container.innerHTML = "<p style='color:red'>GeoGebra loader not found. Please ensure geogebra-loader.js is included.</p>";
        }
    }

    /**
     * Validate and check the user's answer
     */
    checkAnswer(question, params, displayOptions) {
        const feedbackEl = document.getElementById('quiz-feedback');
        const checkBtn = document.getElementById('check-btn');
        const nextBtn = document.getElementById('next-btn');
        let isCorrect = false;

        if (question.type === 'short-answer') {
            const input = document.getElementById('user-answer');
            if (question.isVector) {
                const raw = input.value.trim();
                const components = raw.replace(/[()\[\]]/g, '').split(',').map(x => parseFloat(x.trim()));
                if (components.length !== params.correctAnswer.length || components.some(x => isNaN(x))) {
                    feedbackEl.textContent = "Please enter a valid vector.";
                    feedbackEl.className = "quiz-feedback warning";
                    return;
                }
                const tolerance = params.tolerance || 0.01;
                isCorrect = components.every((val, idx) => Math.abs(val - params.correctAnswer[idx]) <= tolerance);
            } else {
                const userVal = parseFloat(input.value);
                if (isNaN(userVal)) {
                    feedbackEl.textContent = "Please enter a valid number.";
                    feedbackEl.className = "quiz-feedback warning";
                    return;
                }

                const sigfigs = question.sigfigs || params.sigfigs;
                if (sigfigs) {
                    const expectedRounded = this.formatNumber(params.correctAnswer, sigfigs);
                    const userRounded = this.formatNumber(userVal, sigfigs);
                    isCorrect = expectedRounded === userRounded;
                } else {
                    const tolerance = params.tolerance || 0.001;
                    isCorrect = Math.abs(userVal - params.correctAnswer) <= tolerance;
                }
            }
        } 
        else if (question.type === 'multiple-choice') {
            const selected = document.querySelector('.mc-option.selected');
            if (!selected) {
                feedbackEl.textContent = "Please select an option.";
                feedbackEl.className = "quiz-feedback warning";
                return;
            }
            const index = parseInt(selected.getAttribute('data-index'));
            isCorrect = displayOptions[index].correct;
        } 
        else if (question.type === 'graphing') {
            // For graphing, we ask GeoGebra if the 'correct' boolean is true
            if (this.currentApplet) {
                try {
                    const val = this.currentApplet.getValue('correct');
                    isCorrect = (val === 1);
                    if (!isCorrect) {
                        this.currentApplet.setVisible('ans', true);
                    }

                } catch (error) {
                    feedbackEl.textContent = "Error checking answer. Please ensure your GeoGebra material has a 'correct' boolean object.";
                    feedbackEl.className = "quiz-feedback warning";
                    return;
                }
            } else {
                feedbackEl.textContent = "GeoGebra applet not ready yet. Please wait...";
                feedbackEl.className = "quiz-feedback warning";
                return;
            }
        }

        const isLastQuestion = this.currentIndex === this.questions.length - 1;
        const nextButtonLabel = isLastQuestion ? 'Finish Quiz' : 'Next Question';

        // Display Result
        if (isCorrect) {
            feedbackEl.textContent = "✅ Correct!";
            feedbackEl.className = "quiz-feedback success";
            this.score++;
            checkBtn.style.display = 'none';
            nextBtn.textContent = nextButtonLabel;
            nextBtn.style.display = 'inline-block';
            nextBtn.onclick = () => {
                if (isLastQuestion) {
                    this.showFinalScore();
                } else {
                    this.currentIndex++;
                    this.renderQuestion();
                }
            };
        } else {
            let correctAnswerText = '';
            const sigfigs = question.sigfigs || params.sigfigs;
            if (question.type === 'multiple-choice') {
                const correctOption = displayOptions.find(opt => opt.correct);
                correctAnswerText = correctOption ? this.getCorrectAnswerLatex(correctOption.text, params) : '';
            } else if (question.type === 'short-answer') {
                correctAnswerText = this.formatAnswerAsLatex(params.correctAnswer, sigfigs);
            } else if (question.type === 'graphing') {
                correctAnswerText = 'shown in the figure';
            }

            const answerMessage = correctAnswerText ? ` The correct answer is <strong>${correctAnswerText}</strong>.` : '';
            feedbackEl.innerHTML = `❌ Incorrect.${answerMessage}`;
            feedbackEl.className = "quiz-feedback error";
            checkBtn.style.display = 'none';
            nextBtn.textContent = nextButtonLabel;
            nextBtn.style.display = 'inline-block';
            nextBtn.onclick = () => {
                if (isLastQuestion) {
                    this.showFinalScore();
                } else {
                    this.currentIndex++;
                    this.renderQuestion();
                }
            };
            this.renderMath();
        }
    }

    /**
     * Display final score when quiz is complete
     */
    showFinalScore() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        this.container.innerHTML = `
            <div class="quiz-card fade-in">
                <h2>Quiz Completed! 🎉</h2>
                <div class="quiz-results">
                    <p class="score-display">${this.score} / ${this.questions.length}</p>
                    <p class="percentage-display">${percentage}%</p>
                </div>
                <button onclick="location.reload()" class="quiz-btn primary">Retry Quiz</button>
            </div>
        `;
    }
}
