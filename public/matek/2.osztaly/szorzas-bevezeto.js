document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();

    const taskRowsContainer = document.getElementById('task-rows-container');
    const checkButton = document.getElementById('check-button');
    const newTaskButton = document.getElementById('new-task-button');
    const feedbackEl = document.getElementById('feedback');
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');
    const rangeButtons = document.querySelectorAll('.range-button');

    let currentNumberRange = 20;
    let taskData = [];

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateTask() {
        taskData = [];
        taskRowsContainer.innerHTML = '';
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
        
        const generatedTasksForLogging = [];

        for (let i = 0; i < 4; i++) {
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

        logNewTask('szorzas-bevezeto', { range: currentNumberRange, tasks: generatedTasksForLogging });
    }

    function checkTask() {
        let allCorrect = true;
        const userSolutions = [];

        taskData.forEach((data, index) => {
            const row = taskRowsContainer.querySelector(`.task-row[data-row-index="${index}"]`);
            const inputs = row.querySelectorAll('input[type="number"]');
            let rowCorrect = true;
            
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
                    rowCorrect = false;
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
        
        logTaskCheck('szorzas-bevezeto', { correct: allCorrect, solutions: userSolutions });
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

            generateTask();
        });
    });
    
    newTaskButton.addEventListener('click', generateTask);
    checkButton.addEventListener('click', checkTask);

    logTaskEntry('szorzas-bevezeto');
    generateTask();
    applyTheme('theme-candy');
});