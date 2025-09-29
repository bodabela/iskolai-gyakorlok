document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();

    // Task 1 elements
    const taskRowsContainer = document.getElementById('task-rows-container');
    const feedback1El = document.getElementById('feedback-1');
    const newTask1Button = document.getElementById('new-task-1-button');
    const check1Button = document.getElementById('check-1-button');
    let taskData = []; // Task 1 data

    // Task 2 elements
    const task2Container = document.getElementById('task-2-container');
    const feedback2El = document.getElementById('feedback-2');
    const newTask2Button = document.getElementById('new-task-2-button');
    const check2Button = document.getElementById('check-2-button');
    let task2Data = {}; // Task 2 data

    // Common elements
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');
    const rangeButtons = document.querySelectorAll('.range-button');

    let currentNumberRange = 20;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function autoFocusNext(event) {
        const target = event.target;
        const maxLength = parseInt(target.getAttribute('maxlength'), 10);
        const myLength = target.value.length;

        if (myLength >= maxLength) {
            const container = target.closest('.equation-container, .multiplication-container');
            if (container) {
                const inputs = Array.from(container.querySelectorAll('input[type="number"]'));
                const currentIndex = inputs.indexOf(target);
                if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
                    inputs[currentIndex + 1].focus();
                }
            }
        }
    }

    // --- TASK 1: ADDITION ---
    function generateTask1() {
        taskData = [];
        taskRowsContainer.innerHTML = '';
        feedback1El.textContent = '';
        feedback1El.className = 'feedback';
        
        const generatedTasksForLogging = [];

        for (let i = 0; i < 2; i++) { // Reduced to 2 rows to make space
            let numGroups, ballsPerGroup, sum;
            let attempts = 0;
            do {
                numGroups = getRandomInt(2, 5);
                let maxBalls = Math.floor(currentNumberRange / numGroups);
                if (maxBalls < 1) maxBalls = 1;
                if (maxBalls > 10) maxBalls = 10;
                ballsPerGroup = getRandomInt(1, maxBalls);
                sum = numGroups * ballsPerGroup;
                attempts++;
            } while (sum > currentNumberRange && attempts < 10);
            
            if (sum > currentNumberRange) {
                numGroups = 2;
                ballsPerGroup = 1;
                sum = 2;
            }

            taskData.push({ numGroups, ballsPerGroup, sum });
            generatedTasksForLogging.push({numGroups, ballsPerGroup, sum});

            const row = document.createElement('div');
            row.className = 'task-row';
            row.dataset.rowIndex = i;

            const groupsContainer = document.createElement('div');
            groupsContainer.className = 'groups-container';
            for (let g = 0; g < numGroups; g++) {
                const group = document.createElement('div');
                group.className = 'group';
                for (let b = 0; b < ballsPerGroup; b++) {
                    const ball = document.createElement('div');
                    ball.className = 'ball';
                    group.appendChild(ball);
                }
                groupsContainer.appendChild(group);
            }

            const multiplicationContainer = document.createElement('div');
            multiplicationContainer.className = 'multiplication-container-task1';
            
            const factor1Span = document.createElement('span');
            factor1Span.textContent = numGroups;
            factor1Span.className = 'multiplication-part';

            const multiSign = document.createElement('span');
            multiSign.textContent = '·';

            const factor2Span = document.createElement('span');
            factor2Span.textContent = ballsPerGroup;
            factor2Span.className = 'multiplication-part';

            const equalsSign = document.createElement('span');
            equalsSign.textContent = '=';

            const productSpan = document.createElement('span');
            productSpan.textContent = sum;
            productSpan.className = 'multiplication-part';

            multiplicationContainer.appendChild(factor1Span);
            multiplicationContainer.appendChild(multiSign);
            multiplicationContainer.appendChild(factor2Span);
            multiplicationContainer.appendChild(equalsSign);
            multiplicationContainer.appendChild(productSpan);

            const equationContainer = document.createElement('div');
            equationContainer.className = 'equation-container';
            for (let j = 0; j < numGroups; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 0;
                input.setAttribute('maxlength', String(ballsPerGroup).length);
                input.addEventListener('input', autoFocusNext);
                equationContainer.appendChild(input);
                if (j < numGroups - 1) {
                    const plus = document.createElement('span');
                    plus.textContent = '+';
                    equationContainer.appendChild(plus);
                }
            }
            const equals = document.createElement('span');
            equals.textContent = '=';
            equationContainer.appendChild(equals);
            const sumInput = document.createElement('input');
            sumInput.type = 'number';
            sumInput.min = 0;
            sumInput.dataset.isSum = true;
            sumInput.setAttribute('maxlength', String(sum).length);
            sumInput.addEventListener('input', autoFocusNext);
            equationContainer.appendChild(sumInput);

            row.appendChild(groupsContainer);
            row.appendChild(multiplicationContainer);
            row.appendChild(equationContainer);
            taskRowsContainer.appendChild(row);
        }
        logNewTask('szorzas-bevezeto-1-osszeadas', {
            range: currentNumberRange,
            tasks: generatedTasksForLogging
        });
    }

    function checkTask1() {
        let allCorrect = true;
        const userSolutions = [];

        taskData.forEach((data, index) => {
            const row = taskRowsContainer.querySelector(`.task-row[data-row-index="${index}"]`);
            const inputs = row.querySelectorAll('.equation-container input[type="number"]');
            
            const userSolutionRow = { terms: [], sum: null };

            inputs.forEach((input) => {
                input.classList.remove('correct', 'incorrect');
                const userAnswer = parseInt(input.value, 10);
                let correctAnswer;
                
                const isSumInput = input.dataset.isSum === 'true';
                correctAnswer = isSumInput ? data.sum : data.ballsPerGroup;
                if (isSumInput) {
                    userSolutionRow.sum = isNaN(userAnswer) ? null : userAnswer;
                } else {
                    userSolutionRow.terms.push(isNaN(userAnswer) ? null : userAnswer);
                }

                if (!isNaN(userAnswer) && userAnswer === correctAnswer) {
                    input.classList.add('correct');
                } else {
                    input.classList.add('incorrect');
                    allCorrect = false;
                }
            });
            userSolutions.push(userSolutionRow);
        });

        if (allCorrect) {
            feedback1El.textContent = 'Nagyszerű! Minden sor helyes!';
            feedback1El.className = 'feedback correct';
        } else {
            feedback1El.textContent = 'Van néhány hiba. Nézd át a pirossal jelölt mezőket!';
            feedback1El.className = 'feedback incorrect';
        }
        logTaskCheck('szorzas-bevezeto-1-osszeadas', {
            correct: allCorrect,
            solutions: userSolutions
        });
    }


    // --- TASK 2: MULTIPLICATION ---
    function generateTask2() {
        task2Container.innerHTML = '';
        feedback2El.textContent = '';
        feedback2El.className = 'feedback';

        let rows, cols, total;
        
        do {
            rows = getRandomInt(2, 5);
            cols = getRandomInt(2, 5);
            total = rows * cols;
        } while (total > currentNumberRange);

        task2Data = { rows, cols, total };

        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'grid-wrapper';
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        for(let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            const ball = document.createElement('div');
            ball.className = 'ball-in-grid';
            cell.appendChild(ball);
            gridContainer.appendChild(cell);
        }

        const highlightOverlay = document.createElement('div');
        highlightOverlay.className = 'highlight-overlay';
        
        const cellWidthWithGap = 30 + 5;
        const cellHeightWithGap = 30 + 5;
        const padding = 5; // grid-container padding

        const rowHighlights = [];
        const colHighlights = [];

        for (let i = 0; i < rows; i++) {
            const highlight = document.createElement('div');
            highlight.className = 'highlight-group highlight-row';
            if (i > 0) highlight.classList.add('faint');
            highlight.style.top = `${i * cellHeightWithGap + padding}px`;
            highlight.style.left = `${padding}px`;
            highlight.style.width = `${cols * cellWidthWithGap - 5}px`;
            highlight.style.height = `${cellHeightWithGap - 5}px`;
            rowHighlights.push(highlight);
            highlightOverlay.appendChild(highlight);
        }

        for (let i = 0; i < cols; i++) {
            const highlight = document.createElement('div');
            highlight.className = 'highlight-group highlight-col';
            if (i > 0) highlight.classList.add('faint');
            highlight.style.top = `${padding}px`;
            highlight.style.left = `${i * cellWidthWithGap + padding}px`;
            highlight.style.width = `${cellWidthWithGap - 5}px`;
            highlight.style.height = `${rows * cellHeightWithGap - 5}px`;
            colHighlights.push(highlight);
            highlightOverlay.appendChild(highlight);
        }
        
        let showingRows = true;
        // Set initial state: show rows, hide columns
        colHighlights.forEach(h => h.classList.add('hidden'));

        gridWrapper.addEventListener('click', () => {
            showingRows = !showingRows;
            if (showingRows) {
                rowHighlights.forEach(h => h.classList.remove('hidden'));
                colHighlights.forEach(h => h.classList.add('hidden'));
            } else {
                rowHighlights.forEach(h => h.classList.add('hidden'));
                colHighlights.forEach(h => h.classList.remove('hidden'));
            }
        });
        
        gridWrapper.appendChild(gridContainer);
        gridWrapper.appendChild(highlightOverlay);

        const multiplicationContainer = document.createElement('div');
        multiplicationContainer.className = 'multiplication-container';

        const eq1 = document.createElement('div');
        eq1.className = 'multiplication-equation';
        eq1.innerHTML = `<span>${rows}</span> <span>·</span> <input type="number" data-answer="${cols}"> <span>=</span> <span class="result">${total}</span>`;
        
        const eq2 = document.createElement('div');
        eq2.className = 'multiplication-equation';
        eq2.innerHTML = `<span>${cols}</span> <span>·</span> <input type="number" data-answer="${rows}"> <span>=</span> <span class="result">${total}</span>`;
        
        multiplicationContainer.appendChild(eq1);
        multiplicationContainer.appendChild(document.createTextNode('vagy'));
        multiplicationContainer.appendChild(eq2);

        multiplicationContainer.querySelectorAll('input[type="number"]').forEach(input => {
            const answer = input.dataset.answer;
            input.setAttribute('maxlength', String(answer).length);
            input.addEventListener('input', autoFocusNext);
        });

        task2Container.appendChild(gridWrapper);
        task2Container.appendChild(multiplicationContainer);
        
        logNewTask('szorzas-bevezeto-2-szorzas', {
            range: currentNumberRange,
            task: { rows, cols, total }
        });
    }
    
    function checkTask2() {
        const inputs = task2Container.querySelectorAll('input[type="number"]');
        let allCorrect = true;
        const userSolutions = [];

        inputs.forEach(input => {
            input.classList.remove('correct', 'incorrect');
            const correctAnswer = parseInt(input.dataset.answer, 10);
            const userAnswer = parseInt(input.value, 10);
            
            userSolutions.push(isNaN(userAnswer) ? null : userAnswer);

            if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
                input.classList.add('incorrect');
                allCorrect = false;
            } else {
                input.classList.add('correct');
            }
        });

        if (allCorrect) {
            feedback2El.textContent = 'Helyes! Ügyes vagy!';
            feedback2El.className = 'feedback correct';
        } else {
            feedback2El.textContent = 'Nem jó, próbáld újra!';
            feedback2El.className = 'feedback incorrect';
        }

        logTaskCheck('szorzas-bevezeto-2-szorzas', {
            correct: allCorrect,
            solutions: userSolutions
        });
    }

    // --- MAIN LOGIC ---
    function applyTheme(themeClass) {
        bodyEl.className = ''; 
        bodyEl.classList.add(themeClass); 

        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeClass);
        });
        
        rangeButtons.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.range) === currentNumberRange);
        });
    }

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTheme = button.dataset.theme;
            applyTheme(selectedTheme);
        });
    });

    rangeButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentNumberRange = parseInt(button.dataset.range);
            
            rangeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            generateTask1();
            generateTask2();
        });
    });
    
    newTask1Button.addEventListener('click', generateTask1);
    check1Button.addEventListener('click', checkTask1);
    newTask2Button.addEventListener('click', generateTask2);
    check2Button.addEventListener('click', checkTask2);

    logTaskEntry('szorzas-bevezeto');
    generateTask1();
    generateTask2();
    applyTheme('theme-candy');
});