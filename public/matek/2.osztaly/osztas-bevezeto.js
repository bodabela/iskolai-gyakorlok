document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();

    // --- COMMON ELEMENTS & STATE ---
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');
    const rangeButtons = document.querySelectorAll('.range-button');
    const newTaskButton = document.getElementById('new-task-button');
    let currentNumberRange = 20;

    // --- TASK 1: "Mennyit ér egy ábra?" ---
    const task1RowsContainer = document.getElementById('task-1-rows-container');
    const feedbackEl1 = document.getElementById('feedback-1');
    const checkButton1 = document.getElementById('check-button-1');
    let task1Data = [];

    function generateTask1() {
        task1Data = [];
        task1RowsContainer.innerHTML = '';
        feedbackEl1.textContent = '';
        feedbackEl1.className = 'feedback';
        
        const generatedTasksForLogging = [];
        const NUM_ROWS = 3;
        const shapes = ['ball', 'square', 'triangle', 'pentagon'];
        const selectedShapesForRow = shapes.sort(() => 0.5 - Math.random()).slice(0, NUM_ROWS);

        for (let i = 0; i < NUM_ROWS; i++) {
            let divisor, quotient, dividend;
            let attempts = 0;
            do {
                const maxDivisor = Math.min(10, Math.floor(currentNumberRange / 2));
                divisor = getRandomInt(2, maxDivisor);
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

            task1Data.push({ divisor, quotient, dividend });
            generatedTasksForLogging.push({ divisor, quotient, dividend });

            const row = document.createElement('div');
            row.className = 'task-row';

            const selectedShape = selectedShapesForRow[i];

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'items-container';
            for (let j = 0; j < divisor; j++) {
                const shapeEl = document.createElement('div');
                shapeEl.className = selectedShape;
                itemsContainer.appendChild(shapeEl);
                if (j < divisor - 1) {
                    const plusSign = document.createElement('span');
                    plusSign.textContent = '+';
                    plusSign.className = 'plus-sign';
                    itemsContainer.appendChild(plusSign);
                }
            }

            const multiplicationPart = document.createElement('div');
            multiplicationPart.className = 'multiplication-part';
            multiplicationPart.innerHTML = `<span>=</span><span>${divisor}</span><span>·</span><div class="${selectedShape}"></div>`;

            const equationPart = document.createElement('div');
            equationPart.className = 'equation-part';
            equationPart.innerHTML = `<span>=</span><span class="total-sum">${dividend}</span>`;

            const resultPart = document.createElement('div');
            resultPart.className = 'result-part';
            const input = document.createElement('input');
            input.type = 'number';
            input.min = 0;
            input.dataset.rowIndex = i;
            input.setAttribute('maxlength', String(quotient).length);
            input.addEventListener('input', autoFocusNext);
            resultPart.innerHTML = `<div class="${selectedShape}"></div><span>=</span>`;
            resultPart.appendChild(input);

            row.appendChild(itemsContainer);
            row.appendChild(multiplicationPart);
            row.appendChild(equationPart);
            row.appendChild(resultPart);
            task1RowsContainer.appendChild(row);
        }
        logNewTask('osztas-bevezeto-abra', {
            range: currentNumberRange,
            tasks: generatedTasksForLogging
        });
    }

    function checkTask1() {
        let allCorrect = true;
        const userSolutions = [];

        const inputs = task1RowsContainer.querySelectorAll('input[type="number"]');
        inputs.forEach((input) => {
            const rowIndex = parseInt(input.dataset.rowIndex, 10);
            const data = task1Data[rowIndex];
            
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
            feedbackEl1.textContent = 'Nagyszerű! Minden sor helyes!';
            feedbackEl1.className = 'feedback correct';
        } else {
            feedbackEl1.textContent = 'Van néhány hiba. Nézd át a pirossal jelölt mezőket!';
            feedbackEl1.className = 'feedback incorrect';
        }
        logTaskCheck('osztas-bevezeto-abra', {
            correct: allCorrect,
            solutions: userSolutions
        });
    }

    // --- TASK 2: "Oszd szét a golyókat" ---
    const feedbackEl2 = document.getElementById('feedback-2');
    const checkButton2 = document.getElementById('check-button-2');
    const ballSourceContainer = document.getElementById('ball-source-container');
    const ballTargetContainer = document.getElementById('ball-target-container');
    const divisionEquationContainer = document.getElementById('division-equation-container');
    const summaryContainer = document.getElementById('summary-container');

    let task2Data = { dividend: 0, divisor: 0, quotient: 0 };
    let draggedElement = null;
    let offsetX = 0, offsetY = 0;

    function generateTask2() {
        let dividend, divisor, quotient;
        let attempts = 0;
        do {
            divisor = getRandomInt(2, 5);
            const maxQuotient = Math.floor(currentNumberRange / divisor);
            quotient = getRandomInt(2, maxQuotient < 2 ? 2 : maxQuotient);
            dividend = divisor * quotient;
            attempts++;
        } while (dividend > currentNumberRange && attempts < 20);

        if (dividend > currentNumberRange || dividend < 4) { // fallback for edge cases
             divisor = 2;
             quotient = 3;
             dividend = 6;
        }

        task2Data = { dividend, divisor, quotient };

        ballSourceContainer.innerHTML = '';
        ballTargetContainer.innerHTML = '';
        divisionEquationContainer.innerHTML = '';
        summaryContainer.innerHTML = '';
        feedbackEl2.textContent = '';
        feedbackEl2.className = 'feedback';

        // Create balls
        const ballColor = getComputedStyle(document.documentElement).getPropertyValue('--ball-color').trim();
        for (let i = 0; i < dividend; i++) {
            createBallForTask2(ballSourceContainer, ballColor);
        }

        // Create drop targets
        for (let i = 0; i < divisor; i++) {
            const target = document.createElement('div');
            target.className = 'drop-target-rect';
            ballTargetContainer.appendChild(target);
        }

        divisionEquationContainer.innerHTML = `<span>${dividend}</span><span>:</span><span>${divisor}</span><span>=</span><span>?</span>`;
        updateSummary2();

        logNewTask('osztas-bevezeto-szetosztas', {
            range: currentNumberRange,
            task: task2Data
        });
    }

    function createBallForTask2(parent, color) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.style.backgroundColor = color;
        parent.appendChild(ball);
        addDragListenersForTask2(ball);
    }

    function updateSummary2() {
        const targets = Array.from(ballTargetContainer.children);
        const counts = targets.map(t => t.children.length);

        const additionStr = counts.join(' + ');
        const total = counts.reduce((sum, count) => sum + count, 0);
        
        let multiplicationStr = '';
        if (counts.length > 0 && counts.every(c => c === counts[0])) {
             multiplicationStr = `${counts.length} · ${counts[0]} = ${total}`;
        } else {
             multiplicationStr = `...`;
        }

        summaryContainer.innerHTML = 
            `<div class="summary-row">${additionStr} = ${total}</div>
             <div class="summary-row">${multiplicationStr}</div>`;
    }

    function checkTask2() {
        const targets = Array.from(ballTargetContainer.children);
        const counts = targets.map(t => t.children.length);
        let isCorrect = false;

        if (ballSourceContainer.children.length > 0) {
            feedbackEl2.textContent = 'Még nem osztottad szét az összes golyót!';
            feedbackEl2.className = 'feedback incorrect';
        } else if (counts.every(count => count === task2Data.quotient)) {
            feedbackEl2.textContent = 'Ügyes vagy! Ez a helyes megoldás!';
            feedbackEl2.className = 'feedback correct';
            divisionEquationContainer.innerHTML = `<span>${task2Data.dividend}</span><span>:</span><span>${task2Data.divisor}</span><span>=</span><span>${task2Data.quotient}</span>`;
            isCorrect = true;
        } else {
            feedbackEl2.textContent = 'Nem egyenlően osztottad szét a golyókat. Próbáld újra!';
            feedbackEl2.className = 'feedback incorrect';
        }
        logTaskCheck('osztas-bevezeto-szetosztas', { correct: isCorrect, solution: counts });
    }

    function addDragListenersForTask2(element) {
        element.addEventListener('mousedown', e => handleDragStart2(e, element));
        element.addEventListener('touchstart', e => handleDragStart2(e, element), { passive: false });
    }

    function handleDragStart2(e, element) {
        if (draggedElement) return;
        e.preventDefault();
        draggedElement = element;

        const rect = draggedElement.getBoundingClientRect();
        const eventPos = e.type === 'touchstart' ? e.touches[0] : e;
        offsetX = eventPos.clientX - rect.left;
        offsetY = eventPos.clientY - rect.top;

        document.body.appendChild(draggedElement);
        draggedElement.classList.add('dragging');
        draggedElement.style.top = `${rect.top}px`;
        draggedElement.style.left = `${rect.left}px`;

        document.addEventListener('mousemove', handleDragMove2);
        document.addEventListener('mouseup', handleDragEnd2);
        document.addEventListener('touchmove', handleDragMove2, { passive: false });
        document.addEventListener('touchend', handleDragEnd2);
    }

    function handleDragMove2(e) {
        if (!draggedElement) return;
        e.preventDefault();
        const eventPos = e.type === 'touchmove' ? e.touches[0] : e;
        draggedElement.style.top = `${eventPos.clientY - offsetY}px`;
        draggedElement.style.left = `${eventPos.clientX - offsetX}px`;
    }

    function handleDragEnd2(e) {
        if (!draggedElement) return;
        document.removeEventListener('mousemove', handleDragMove2);
        document.removeEventListener('mouseup', handleDragEnd2);
        document.removeEventListener('touchmove', handleDragMove2);
        document.removeEventListener('touchend', handleDragEnd2);

        draggedElement.style.visibility = 'hidden';
        const eventPos = e.type === 'touchend' ? e.changedTouches[0] : e;
        const dropTarget = document.elementFromPoint(eventPos.clientX, eventPos.clientY);
        draggedElement.style.visibility = 'visible';

        let newParent = ballSourceContainer;
        if (dropTarget) {
            const bowl = dropTarget.closest('.drop-target-rect, .source-bowl');
            if (bowl) { newParent = bowl; }
        }

        draggedElement.classList.remove('dragging');
        newParent.appendChild(draggedElement);
        draggedElement.style.top = '';
        draggedElement.style.left = '';

        draggedElement = null;
        offsetX = 0; offsetY = 0;
        updateSummary2();
    }

    // --- GENERAL HELPER FUNCTIONS ---
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
                for (let i = currentIndex + 1; i < inputs.length; i++) {
                    const nextInput = inputs[i];
                    const nextMaxLength = parseInt(nextInput.getAttribute('maxlength'), 10) || 1;
                    if (nextInput.value.length < nextMaxLength) {
                        nextInput.focus();
                        return;
                    }
                }
                for (let i = 0; i < currentIndex; i++) {
                    const nextInput = inputs[i];
                    const nextMaxLength = parseInt(nextInput.getAttribute('maxlength'), 10) || 1;
                    if (nextInput.value.length < nextMaxLength) {
                        nextInput.focus();
                        return;
                    }
                }
            }
        }
    }

    // --- GLOBAL CONTROLS & INITIALIZATION ---
    function applyTheme(themeClass) {
        bodyEl.className = ''; 
        bodyEl.classList.add(themeClass); 

        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeClass);
        });
        // Regenerate task 2 on theme change to apply new ball color
        generateTask2();
    }

    function generateAllTasks() {
        generateTask1();
        generateTask2();
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
            generateAllTasks();
        });
    });
    
    newTaskButton.addEventListener('click', generateAllTasks);
    checkButton1.addEventListener('click', checkTask1);
    checkButton2.addEventListener('click', checkTask2);

    logTaskEntry('osztas-bevezeto');
    generateAllTasks();
    applyTheme('theme-candy');
});