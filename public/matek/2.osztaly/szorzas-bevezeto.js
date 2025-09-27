document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();

    // Task 1 elements
    const taskRowsContainer = document.getElementById('task-rows-container');
    const feedbackEl = document.getElementById('feedback');
    let taskData = []; // Task 1 data

    // Task 2 elements
    const task2Container = document.getElementById('task-2-container');
    const feedback2El = document.getElementById('feedback-2');
    let task2Data = {}; // Task 2 data

    // Common elements
    const checkButton = document.getElementById('check-button');
    const newTaskButton = document.getElementById('new-task-button');
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');
    const rangeButtons = document.querySelectorAll('.range-button');

    let currentNumberRange = 20;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // --- TASK 1: ADDITION ---
    function generateTask1() {
        taskData = [];
        taskRowsContainer.innerHTML = '';
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
        
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

            const equationContainer = document.createElement('div');
            equationContainer.className = 'equation-container';
            for (let j = 0; j < numGroups; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 0;
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
            equationContainer.appendChild(sumInput);

            row.appendChild(groupsContainer);
            row.appendChild(equationContainer);
            taskRowsContainer.appendChild(row);
        }
        return generatedTasksForLogging;
    }

    function checkTask1() {
        let allCorrect = true;
        const userSolutions = [];

        taskData.forEach((data, index) => {
            const row = taskRowsContainer.querySelector(`.task-row[data-row-index="${index}"]`);
            const inputs = row.querySelectorAll('input[type="number"]');
            
            const userSolutionRow = { terms: [], sum: 0 };

            inputs.forEach((input) => {
                input.classList.remove('correct', 'incorrect');
                const isSumInput = input.dataset.isSum === 'true';
                const correctAnswer = isSumInput ? data.sum : data.ballsPerGroup;
                const userAnswer = parseInt(input.value, 10);

                if (isSumInput) {
                    userSolutionRow.sum = isNaN(userAnswer) ? null : userAnswer;
                } else {
                    userSolutionRow.terms.push(isNaN(userAnswer) ? null : userAnswer);
                }

                if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
                    input.classList.add('incorrect');
                    allCorrect = false;
                } else {
                    input.classList.add('correct');
                }
            });
            userSolutions.push(userSolutionRow);
        });

        if (allCorrect) {
            feedbackEl.textContent = 'Nagyszerű! Minden sor helyes!';
            feedbackEl.className = 'feedback correct';
        } else {
            feedbackEl.textContent = 'Van néhány hiba. Nézd át a pirossal jelölt mezőket!';
            feedbackEl.className = 'feedback incorrect';
        }
        return { correct: allCorrect, solutions: userSolutions };
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
            if (i === 0) {
                highlight.addEventListener('click', () => {
                    rowHighlights.forEach(h => h.classList.remove('hidden'));
                    colHighlights.forEach(h => h.classList.add('hidden'));
                });
            }
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
            if (i === 0) {
                highlight.addEventListener('click', () => {
                    colHighlights.forEach(h => h.classList.remove('hidden'));
                    rowHighlights.forEach(h => h.classList.add('hidden'));
                });
            }
            colHighlights.push(highlight);
            highlightOverlay.appendChild(highlight);
        }
        
        gridWrapper.appendChild(gridContainer);
        gridWrapper.appendChild(highlightOverlay);

        const multiplicationContainer = document.createElement('div');
        multiplicationContainer.className = 'multiplication-container';

        const eq1 = document.createElement('div');
        eq1.className = 'multiplication-equation';
        eq1.innerHTML = `<span>${rows}</span> <span>×</span> <input type="number" data-answer="${cols}"> <span>=</span> <span class="result">${total}</span>`;
        
        const eq2 = document.createElement('div');
        eq2.className = 'multiplication-equation';
        eq2.innerHTML = `<span>${cols}</span> <span>×</span> <input type="number" data-answer="${rows}"> <span>=</span> <span class="result">${total}</span>`;
        
        multiplicationContainer.appendChild(eq1);
        multiplicationContainer.appendChild(document.createTextNode('vagy'));
        multiplicationContainer.appendChild(eq2);

        task2Container.appendChild(gridWrapper);
        task2Container.appendChild(multiplicationContainer);
        
        return { rows, cols, total };
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

        return { correct: allCorrect, solutions: userSolutions };
    }

    // --- MAIN LOGIC ---
    function generateTasks() {
        const task1LogData = generateTask1();
        const task2LogData = generateTask2();
        logNewTask('szorzas-bevezeto', { 
            range: currentNumberRange, 
            task1_addition: task1LogData,
            task2_multiplication: task2LogData
        });
    }

    function checkTasks() {
        const task1Result = checkTask1();
        const task2Result = checkTask2();
        
        const allCorrect = task1Result.correct && task2Result.correct;

        logTaskCheck('szorzas-bevezeto', {
             correct: allCorrect, 
             task1_solutions: task1Result.solutions,
             task2_solutions: task2Result.solutions 
        });
    }

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

            generateTasks();
        });
    });
    
    newTaskButton.addEventListener('click', generateTasks);
    checkButton.addEventListener('click', checkTasks);

    logTaskEntry('szorzas-bevezeto');
    generateTasks();
    applyTheme('theme-candy');
});