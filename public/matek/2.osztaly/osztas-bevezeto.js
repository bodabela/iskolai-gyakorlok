document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();

    const taskRowsContainer = document.getElementById('task-rows-container');
    const feedbackEl = document.getElementById('feedback');
    const newTaskButton = document.getElementById('new-task-button');
    const checkButton = document.getElementById('check-button');
    let taskData = [];

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
            const taskWrapper = target.closest('.task');
            if (!taskWrapper) return;

            const inputs = Array.from(taskWrapper.querySelectorAll('input[type="number"]'));
            const currentIndex = inputs.indexOf(target);

            if (currentIndex !== -1) {
                // Find next unfilled input in the same task
                for (let i = currentIndex + 1; i < inputs.length; i++) {
                    const nextInput = inputs[i];
                    const nextMaxLength = parseInt(nextInput.getAttribute('maxlength'), 10) || 1;
                    if (nextInput.value.length < nextMaxLength) {
                        nextInput.focus();
                        return; // focus set, exit
                    }
                }
                // Optional: check from start of the task
                for (let i = 0; i < currentIndex; i++) {
                    const nextInput = inputs[i];
                    const nextMaxLength = parseInt(nextInput.getAttribute('maxlength'), 10) || 1;
                    if (nextInput.value.length < nextMaxLength) {
                        nextInput.focus();
                        return; // focus set, exit
                    }
                }
            }
        }
    }

    function generateTask() {
        taskData = [];
        taskRowsContainer.innerHTML = '';
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
        
        const generatedTasksForLogging = [];
        const NUM_ROWS = 3;

        for (let i = 0; i < NUM_ROWS; i++) {
            let divisor, quotient, dividend;
            let attempts = 0;
            do {
                divisor = getRandomInt(2, 10);
                let maxQuotient = Math.floor(currentNumberRange / divisor);
                if (maxQuotient < 2) maxQuotient = 2;
                if (maxQuotient > 10) maxQuotient = 10;
                quotient = getRandomInt(2, maxQuotient);
                dividend = divisor * quotient;
                attempts++;
            } while (dividend > currentNumberRange && attempts < 20);

            if (dividend > currentNumberRange) {
                quotient = 2;
                divisor = Math.floor(currentNumberRange / quotient);
                if (divisor < 2) divisor = 2;
                dividend = divisor * quotient;
            }

            taskData.push({ divisor, quotient, dividend });
            generatedTasksForLogging.push({ divisor, quotient, dividend });

            const row = document.createElement('div');
            row.className = 'task-row';

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'items-container';
            for (let j = 0; j < divisor; j++) {
                const ball = document.createElement('div');
                ball.className = 'ball';
                itemsContainer.appendChild(ball);
            }

            const equationPart = document.createElement('div');
            equationPart.className = 'equation-part';
            const equals1 = document.createElement('span');
            equals1.textContent = '=';
            const sumSpan = document.createElement('span');
            sumSpan.className = 'total-sum';
            sumSpan.textContent = dividend;
            equationPart.appendChild(equals1);
            equationPart.appendChild(sumSpan);

            const resultPart = document.createElement('div');
            resultPart.className = 'result-part';
            const singleBall = document.createElement('div');
            singleBall.className = 'ball';
            const equals2 = document.createElement('span');
            equals2.textContent = '=';
            const input = document.createElement('input');
            input.type = 'number';
            input.min = 0;
            input.dataset.rowIndex = i;
            input.setAttribute('maxlength', String(quotient).length);
            input.addEventListener('input', autoFocusNext);

            resultPart.appendChild(singleBall);
            resultPart.appendChild(equals2);
            resultPart.appendChild(input);

            row.appendChild(itemsContainer);
            row.appendChild(equationPart);
            row.appendChild(resultPart);
            taskRowsContainer.appendChild(row);
        }
        logNewTask('osztas-bevezeto', {
            range: currentNumberRange,
            tasks: generatedTasksForLogging
        });
    }

    function checkTask() {
        let allCorrect = true;
        const userSolutions = [];

        const inputs = taskRowsContainer.querySelectorAll('input[type="number"]');
        inputs.forEach((input) => {
            const rowIndex = parseInt(input.dataset.rowIndex, 10);
            const data = taskData[rowIndex];
            
            input.classList.remove('correct', 'incorrect');
            const userAnswer = parseInt(input.value, 10);

            userSolutions[rowIndex] = isNaN(userAnswer) ? null : userAnswer;

            if (!isNaN(userAnswer) && userAnswer === data.quotient) {
                input.classList.add('correct');
            } else {
                input.classList.add('incorrect');
                allCorrect = false;
            }
        });

        if (allCorrect) {
            feedbackEl.textContent = 'Nagyszerű! Minden sor helyes!';
            feedbackEl.className = 'feedback correct';
        } else {
            feedbackEl.textContent = 'Van néhány hiba. Nézd át a pirossal jelölt mezőket!';
            feedbackEl.className = 'feedback incorrect';
        }
        logTaskCheck('osztas-bevezeto', {
            correct: allCorrect,
            solutions: userSolutions
        });
    }

    function applyTheme(themeClass) {
        bodyEl.className = ''; 
        bodyEl.classList.add(themeClass); 

        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeClass);
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

    logTaskEntry('osztas-bevezeto');
    generateTask();
    applyTheme('theme-candy');
});