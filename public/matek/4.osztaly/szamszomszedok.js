document.addEventListener('DOMContentLoaded', function() {
    // Firebase initialization
    try {
        initializeFirebaseAndLogger();
        logTaskEntry('Számszomszédok - 4. Osztály');
    } catch (e) {
        console.error("Firebase init error", e);
    }

    const themeButtons = document.querySelectorAll('.theme-button');

    // --- Task 1: Smaller Neighbors ---
    const task1Container = document.getElementById('task-1-container');
    const check1Button = document.getElementById('check-1-button');
    const newTask1Button = document.getElementById('new-task-1-button');
    const feedback1Div = document.getElementById('feedback-1');
    let smallerTasks = [];
    let smallerInputs = [];
    let previousCorrectCountSmaller = -1;

    // --- Task 2: Larger Neighbors ---
    const task2Container = document.getElementById('task-2-container');
    const check2Button = document.getElementById('check-2-button');
    const newTask2Button = document.getElementById('new-task-2-button');
    const feedback2Div = document.getElementById('feedback-2');
    let largerTasks = [];
    let largerInputs = [];
    let previousCorrectCountLarger = -1;

    // --- Shared Helper Functions ---
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function createTaskTable(taskData, inputsArray) {
        const table = document.createElement('table');
        table.className = 'task-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Szám</th>
                    <th>egyes</th>
                    <th>tízes</th>
                    <th>százas</th>
                    <th>ezres</th>
                </tr>
            </thead>
        `;
        const tbody = document.createElement('tbody');
        const labels = ['Szám', 'egyes', 'tízes', 'százas', 'ezres'];

        taskData.forEach((task, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="${labels[0]}" class="number-cell">${task.number}</td>
                <td data-label="${labels[1]}"><input type="number" data-task-index="${index}" data-neighbor="egyes"></td>
                <td data-label="${labels[2]}"><input type="number" data-task-index="${index}" data-neighbor="tizes"></td>
                <td data-label="${labels[3]}"><input type="number" data-task-index="${index}" data-neighbor="szazas"></td>
                <td data-label="${labels[4]}"><input type="number" data-task-index="${index}" data-neighbor="ezres"></td>
            `;
            tbody.appendChild(tr);
            const newInputs = Array.from(tr.querySelectorAll('input'));
            inputsArray.push(...newInputs);
        });
        table.appendChild(tbody);
        return table;
    }

    function setupInputListeners(inputs, tasks) {
        inputs.forEach((input, index) => {
            const taskIndex = parseInt(input.dataset.taskIndex, 10);
            const neighbor = input.dataset.neighbor;
            const correctAnswer = tasks[taskIndex].solutions[neighbor];
            const expectedLength = String(correctAnswer).length;
            input.setAttribute('maxlength', expectedLength);

            input.addEventListener('input', (event) => {
                if (event.target.value.length >= expectedLength) {
                    focusNextInput(index, inputs, tasks);
                }
            });
        });
    }

    function focusNextInput(currentIndex, inputs, tasks) {
        for (let i = 1; i < inputs.length; i++) {
            const nextIndex = (currentIndex + i) % inputs.length;
            const nextInput = inputs[nextIndex];

            const taskIndex = parseInt(nextInput.dataset.taskIndex, 10);
            const neighbor = nextInput.dataset.neighbor;
            const correctAnswer = tasks[taskIndex].solutions[neighbor];
            const expectedLength = String(correctAnswer).length;

            if (nextInput.value.length < expectedLength) {
                nextInput.focus();
                return;
            }
        }
    }

    function checkAnswersGeneric(tasks, inputs, feedbackDiv, previousCorrectCount) {
        let correctCount = 0;
        let totalCount = inputs.length;
        const userAnswers = tasks.map(() => ({}));

        inputs.forEach(input => {
            input.classList.remove('correct', 'incorrect');
            const taskIndex = parseInt(input.dataset.taskIndex, 10);
            const neighbor = input.dataset.neighbor;
            const userAnswer = parseInt(input.value, 10);

            userAnswers[taskIndex][neighbor] = isNaN(userAnswer) ? null : userAnswer;

            if (isNaN(userAnswer)) {
                input.classList.add('incorrect');
                return;
            }

            const correctAnswer = tasks[taskIndex].solutions[neighbor];
            if (userAnswer === correctAnswer) {
                input.classList.add('correct');
                correctCount++;
            } else {
                input.classList.add('incorrect');
            }
        });
        
        const allCorrect = correctCount === totalCount;
        const firstCheck = previousCorrectCount === -1;
        
        if (firstCheck) {
            if (allCorrect) {
                feedbackDiv.textContent = 'Szép munka! Minden válasz helyes.';
            } else {
                feedbackDiv.textContent = `Próbáld újra! ${correctCount} helyes válasz a ${totalCount}-ból.`;
            }
        } else {
            if (correctCount > previousCorrectCount) {
                feedbackDiv.textContent = `Javult az eredmény! Már ${correctCount} helyes válaszod van a ${totalCount}-ból.`;
            } else if (correctCount < previousCorrectCount) {
                feedbackDiv.textContent = `Rontottál az eredményen. Most ${correctCount} helyes válaszod van a ${totalCount}-ból.`;
            } else {
                feedbackDiv.textContent = `Az eredmény nem változott. Továbbra is ${correctCount} helyes válaszod van a ${totalCount}-ból.`;
            }
            if (allCorrect) {
                feedbackDiv.textContent = 'Szép munka! Sikerült mindent kijavítani!';
            }
        }

        if (allCorrect) {
            feedbackDiv.className = 'feedback visible correct';
        } else {
            feedbackDiv.className = 'feedback visible incorrect';
        }

        return { userAnswers, correctCount, totalCount, allCorrect };
    }


    // --- Task 1: Smaller Neighbors Logic ---
    function generateSmallerTask() {
        task1Container.innerHTML = '';
        feedback1Div.textContent = '';
        feedback1Div.className = 'feedback';
        smallerInputs = [];
        smallerTasks = [];
        previousCorrectCountSmaller = -1;
        
        const TASK_COUNT = 3;
        const generatedNumbers = new Set();
        while (generatedNumbers.size < TASK_COUNT) {
            generatedNumbers.add(getRandomNumber(1001, 9998));
        }

        smallerTasks = Array.from(generatedNumbers).map(number => ({
            type: 'smaller',
            number: number,
            solutions: {
                egyes: number - 1,
                tizes: Math.floor((number - 1) / 10) * 10,
                szazas: Math.floor((number - 1) / 100) * 100,
                ezres: Math.floor((number - 1) / 1000) * 1000,
            }
        }));

        const table = createTaskTable(smallerTasks, smallerInputs);
        task1Container.appendChild(table);
        setupInputListeners(smallerInputs, smallerTasks);
        
        try {
            logNewTask('Kisebb számszomszédok', {
                numbers: smallerTasks.map(t => t.number)
            });
        } catch (e) { console.error("Firebase log error", e); }
    }

    function checkSmallerTask() {
        const result = checkAnswersGeneric(smallerTasks, smallerInputs, feedback1Div, previousCorrectCountSmaller);
        previousCorrectCountSmaller = result.correctCount;
        
        try {
            logTaskCheck('Kisebb számszomszédok', {
                tasks: smallerTasks.map(t => ({ number: t.number, solutions: t.solutions })),
                answers: result.userAnswers,
                correct: result.correctCount,
                total: result.totalCount,
                result: result.allCorrect ? 'success' : 'failure'
            });
        } catch (e) { console.error("Firebase log error", e); }
    }

    // --- Task 2: Larger Neighbors Logic ---
    function generateLargerTask() {
        task2Container.innerHTML = '';
        feedback2Div.textContent = '';
        feedback2Div.className = 'feedback';
        largerInputs = [];
        largerTasks = [];
        previousCorrectCountLarger = -1;

        const TASK_COUNT = 3;
        const generatedNumbers = new Set();
        while (generatedNumbers.size < TASK_COUNT) {
            generatedNumbers.add(getRandomNumber(1001, 9998));
        }

        largerTasks = Array.from(generatedNumbers).map(number => ({
            type: 'larger',
            number: number,
            solutions: {
                egyes: number + 1,
                tizes: (Math.floor(number / 10) + 1) * 10,
                szazas: (Math.floor(number / 100) + 1) * 100,
                ezres: (Math.floor(number / 1000) + 1) * 1000,
            }
        }));

        const table = createTaskTable(largerTasks, largerInputs);
        task2Container.appendChild(table);
        setupInputListeners(largerInputs, largerTasks);

        try {
            logNewTask('Nagyobb számszomszédok', {
                numbers: largerTasks.map(t => t.number)
            });
        } catch (e) { console.error("Firebase log error", e); }
    }

    function checkLargerTask() {
        const result = checkAnswersGeneric(largerTasks, largerInputs, feedback2Div, previousCorrectCountLarger);
        previousCorrectCountLarger = result.correctCount;

        try {
            logTaskCheck('Nagyobb számszomszédok', {
                tasks: largerTasks.map(t => ({ number: t.number, solutions: t.solutions })),
                answers: result.userAnswers,
                correct: result.correctCount,
                total: result.totalCount,
                result: result.allCorrect ? 'success' : 'failure'
            });
        } catch (e) { console.error("Firebase log error", e); }
    }


    // --- Theme Switcher ---
    function setTheme(theme) {
        document.body.className = 'theme-' + theme;
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        localStorage.setItem('szamszomszedokTheme', theme);
    }

    themeButtons.forEach(button => {
        button.addEventListener('click', () => setTheme(button.dataset.theme));
    });

    // --- Initialization ---
    const savedTheme = localStorage.getItem('szamszomszedokTheme') || 'candy';
    setTheme(savedTheme);

    check1Button.addEventListener('click', checkSmallerTask);
    newTask1Button.addEventListener('click', generateSmallerTask);
    check2Button.addEventListener('click', checkLargerTask);
    newTask2Button.addEventListener('click', generateLargerTask);

    generateSmallerTask();
    generateLargerTask();
});
