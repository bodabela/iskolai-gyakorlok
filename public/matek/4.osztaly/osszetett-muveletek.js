document.addEventListener('DOMContentLoaded', () => {
    if (typeof initializeFirebaseAndLogger === 'function') {
        initializeFirebaseAndLogger();
        logTaskEntry('osszetett-muveletek');
    }

    const containers = [
        document.getElementById('task-1-container'),
        document.getElementById('task-2-container'),
        document.getElementById('task-3-container'),
        document.getElementById('task-4-container')
    ];
    const feedbacks = [
        document.getElementById('feedback-1'),
        document.getElementById('feedback-2'),
        document.getElementById('feedback-3'),
        document.getElementById('feedback-4')
    ];
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');
    const rangeButtons = document.querySelectorAll('.range-button');

    let allProblemsData = [[], [], [], []];
    let currentNumberRange = 100;

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomElement = (arr) => arr[getRandomInt(0, arr.length - 1)];

    function autoFocusNext(currentInput) {
        const maxLength = String(currentInput.dataset.answer).length;
        if (currentInput.value.length >= maxLength) {
            const taskWrapper = currentInput.closest('.task');
            const allInputsInTask = Array.from(taskWrapper.querySelectorAll('input[type="number"]'));
            const currentIndex = allInputsInTask.indexOf(currentInput);
            let nextIndex = currentIndex + 1;
            while (nextIndex < allInputsInTask.length) {
                const nextInput = allInputsInTask[nextIndex];
                const nextMaxLength = String(nextInput.dataset.answer).length;
                if (nextInput.value.length < nextMaxLength) {
                    nextInput.focus();
                    return;
                }
                nextIndex++;
            }
        }
    }

    const clearContainerAndFeedback = (taskNum) => {
        if (containers[taskNum - 1]) containers[taskNum - 1].innerHTML = '';
        if (feedbacks[taskNum - 1]) {
            feedbacks[taskNum - 1].textContent = '';
            feedbacks[taskNum - 1].className = 'feedback';
        }
        allProblemsData[taskNum - 1] = [];
    };

    // --- Task Generation Logic ---

    function generateAdditionSubtraction() {
        const a = getRandomInt(Math.floor(currentNumberRange * 0.5), currentNumberRange - 1);
        const b = getRandomInt(Math.floor(currentNumberRange * 0.1), a - 5);
        if (b <= 0) return generateAdditionSubtraction();
        const op1 = getRandomElement(['+', '-']);
        let partial = op1 === '+' ? a + b : a - b;
        const c = getRandomInt(Math.floor(currentNumberRange * 0.05), partial - 1);
        if (c <= 0 || partial <= c) return generateAdditionSubtraction();
        const op2 = getRandomElement(['+', '-']);
        let final = op2 === '+' ? partial + c : partial - c;
        if (final < 0) return generateAdditionSubtraction();

        return {
            display: [a, op1, b, op2, c],
            firstOpIndex: 1,
            partialResult: partial,
            finalResult: final,
            type: 'add-sub'
        };
    }

    function generateMixedNoParens() {
        if (Math.random() > 0.5) { // a +/- b *// c
            const c = getRandomInt(2, 10);
            const op2 = getRandomElement(['*', '/']);
            const b_base = getRandomInt(2, 15);
            const b = (op2 === '/') ? b_base * c : b_base;
            const a = getRandomInt(Math.floor(currentNumberRange / 2), currentNumberRange);
            const op1 = getRandomElement(['+', '-']);
            const partial = op2 === '*' ? b * c : b / c;
            if ((op1 === '-') && (a < partial)) return generateMixedNoParens();
            const final = op1 === '+' ? a + partial : a - partial;
            if (final < 0) return generateMixedNoParens();

            return {
                display: [a, op1, b, op2, c],
                firstOpIndex: 3,
                partialResult: partial,
                finalResult: final,
                type: 'mixed-no-parens-1'
            };
        } else { // a *// b +/- c
            const b = getRandomInt(2, 12);
            const op1 = getRandomElement(['*', '/']);
            const a_base = getRandomInt(2, 15);
            const a = (op1 === '/') ? a_base * b : a_base;
            const c = getRandomInt(Math.floor(currentNumberRange / 10), Math.floor(currentNumberRange / 2));
            const op2 = getRandomElement(['+', '-']);
            const partial = op1 === '*' ? a * b : a / b;
            if ((op2 === '-') && (partial < c)) return generateMixedNoParens();
            const final = op2 === '+' ? partial + c : partial - c;
            if (final < 0) return generateMixedNoParens();

            return {
                display: [a, op1, b, op2, c],
                firstOpIndex: 1,
                partialResult: partial,
                finalResult: final,
                type: 'mixed-no-parens-2'
            };
        }
    }

    function generateMixedWithParens() {
        if (Math.random() > 0.5) { // (a +/- b) *// c
            const c = getRandomInt(2, 10);
            const op1 = getRandomElement(['+', '-']);
            let a, b;
            if (op1 === '+') {
                a = getRandomInt(Math.floor(currentNumberRange * 0.05), Math.floor(currentNumberRange * 0.2));
                b = getRandomInt(Math.floor(currentNumberRange * 0.05), Math.floor(currentNumberRange * 0.2));
            } else {
                a = getRandomInt(Math.floor(currentNumberRange * 0.1), Math.floor(currentNumberRange * 0.3));
                b = getRandomInt(Math.floor(currentNumberRange * 0.02), a - 1);
            }
            if (a <= 0 || b <= 0) return generateMixedWithParens();
            const partial = op1 === '+' ? a + b : a - b;
            const op2 = getRandomElement(['*', '/']);
            if (op2 === '/' && partial % c !== 0) return generateMixedWithParens();
            const final = op2 === '*' ? partial * c : partial / c;

            return {
                display: ['(', a, op1, b, ')', op2, c],
                firstOpIndex: 2,
                partialResult: partial,
                finalResult: final,
                type: 'parens-1'
            };
        } else { // a *// (b +/- c)
            const op2 = getRandomElement(['+', '-']);
            let b, c;
            if (op2 === '+') {
                b = getRandomInt(2, 20);
                c = getRandomInt(2, 20);
            } else {
                b = getRandomInt(5, 40);
                c = getRandomInt(2, b - 1);
            }
            const partial = op2 === '+' ? b + c : b - c;
            if (partial <= 0) return generateMixedWithParens();
            const op1 = getRandomElement(['*', '/']);
            let a;
            if (op1 === '*') {
                const max_mult = Math.floor(currentNumberRange / partial);
                if (max_mult < 2) return generateMixedWithParens(); 
                a = getRandomInt(2, max_mult);
            } else { // op1 === '/'
                const mult = getRandomInt(2, Math.floor(100 / partial) + 2);
                a = mult * partial;
            }
            const final = op1 === '*' ? a * partial : a / partial;
            if (op1 === '/' && a % partial !== 0) return generateMixedWithParens();
            
            return {
                display: [a, op1, '(', b, op2, c, ')'],
                firstOpIndex: 4,
                partialResult: partial,
                finalResult: final,
                type: 'parens-2'
            };
        }
    }

    function generateTask(taskNum) {
        clearContainerAndFeedback(taskNum);
        const problemSignatures = new Set();
        const problemCounts = { 1: 4, 2: 4, 3: 4, 4: 8 };
        const numProblems = problemCounts[taskNum];

        const generators = {
            1: generateAdditionSubtraction,
            2: generateMixedNoParens,
            3: generateMixedWithParens,
            4: () => getRandomElement([generateAdditionSubtraction, generateMixedNoParens, generateMixedWithParens])()
        };

        while (allProblemsData[taskNum - 1].length < numProblems) {
            const problem = generators[taskNum]();
            const signature = problem.display.join('');
            if (!problemSignatures.has(signature) && problem.finalResult >= 0) {
                problemSignatures.add(signature);
                allProblemsData[taskNum - 1].push(problem);
            }
        }
        renderTask(taskNum);
        if (typeof logNewTask === 'function') {
            logNewTask(`osszetett-muveletek-feladat-${taskNum}`, { range: currentNumberRange, problems: allProblemsData[taskNum-1] });
        }
    }

    function renderTask(taskNum) {
        const container = containers[taskNum - 1];
        container.innerHTML = '';

        allProblemsData[taskNum - 1].forEach((problem, problemIdx) => {
            const problemRow = document.createElement('div');
            problemRow.className = 'problem-row';

            problem.display.forEach((part, index) => {
                if (index === problem.firstOpIndex) {
                    const opGroup = document.createElement('div');
                    opGroup.className = 'operator-group problem-element';

                    const partialInput = document.createElement('input');
                    partialInput.type = 'number';
                    partialInput.className = 'partial-result-input';
                    partialInput.dataset.answer = problem.partialResult;
                    partialInput.dataset.problem = problemIdx;
                    partialInput.addEventListener('input', () => autoFocusNext(partialInput));

                    const operatorSpan = document.createElement('span');
                    operatorSpan.textContent = part;

                    opGroup.appendChild(partialInput);
                    opGroup.appendChild(operatorSpan);
                    problemRow.appendChild(opGroup);
                } else {
                    const span = document.createElement('span');
                    span.className = 'problem-element';
                    span.textContent = part;
                    problemRow.appendChild(span);
                }
            });

            const equalsSpan = document.createElement('span');
            equalsSpan.className = 'equals-sign problem-element';
            equalsSpan.textContent = '=';
            problemRow.appendChild(equalsSpan);

            const finalInput = document.createElement('input');
            finalInput.type = 'number';
            finalInput.className = 'final-result-input';
            finalInput.dataset.answer = problem.finalResult;
            finalInput.dataset.problem = problemIdx;
            finalInput.addEventListener('input', () => autoFocusNext(finalInput));
            problemRow.appendChild(finalInput);

            container.appendChild(problemRow);
        });
    }

    function checkTaskGeneric(taskNum) {
        const feedbackEl = feedbacks[taskNum - 1];
        const container = containers[taskNum - 1];
        const wasAllCorrect = feedbackEl.classList.contains('correct');
        const hadContent = feedbackEl.textContent !== '';

        const inputs = Array.from(container.querySelectorAll('input[data-answer]'));
        let allCorrect = true, hasEmpty = false;
        const userSolutions = [];

        inputs.forEach(input => {
            input.classList.remove('correct', 'incorrect');
            const userAnswer = input.value.trim();
            const correctAnswer = input.dataset.answer;
            userSolutions.push({ provided: userAnswer, expected: correctAnswer });

            if (userAnswer === '') {
                hasEmpty = true;
            } else if (String(userAnswer) != String(correctAnswer)) {
                input.classList.add('incorrect');
                allCorrect = false;
            } else {
                input.classList.add('correct');
            }
        });

        if (hasEmpty) {
            allCorrect = false;
            feedbackEl.textContent = 'Kérlek, tölts ki minden mezőt!';
            feedbackEl.className = 'feedback incorrect';
        } else if (allCorrect) {
            feedbackEl.textContent = hadContent && !wasAllCorrect ? 'Javítás sikeres! Most már minden helyes!' : 'Nagyszerű! Minden helyes!';
            feedbackEl.className = 'feedback correct';
        } else {
            feedbackEl.textContent = hadContent ? 'A javítások után is maradt még hiba.' : 'Van néhány hiba. Nézd át a pirossal jelölt mezőket!';
            feedbackEl.className = 'feedback incorrect';
        }

        if (typeof logTaskCheck === 'function') {
            logTaskCheck(`osszetett-muveletek-feladat-${taskNum}`, { range: currentNumberRange, correct: allCorrect, solutions: userSolutions });
        }
    }

    function setupControls() {
        themeButtons.forEach(button => button.addEventListener('click', () => {
            bodyEl.className = '';
            bodyEl.classList.add(button.dataset.theme);
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        }));

        rangeButtons.forEach(button => button.addEventListener('click', () => {
            currentNumberRange = parseInt(button.dataset.range, 10);
            rangeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            if (typeof logEvent === 'function') {
                logEvent('CHANGE_DIFFICULTY', { task: 'osszetett-muveletek', newRange: currentNumberRange });
            }
            generateAllTasks();
        }));

        for (let i = 1; i <= 4; i++) {
            document.getElementById(`new-task-${i}-button`).addEventListener('click', () => generateTask(i));
            document.getElementById(`check-${i}-button`).addEventListener('click', () => checkTaskGeneric(i));
        }
    }

    function generateAllTasks() {
        for (let i = 1; i <= 4; i++) {
            generateTask(i);
        }
    }

    setupControls();
    generateAllTasks();
    document.querySelector('.theme-button[data-theme="theme-candy"]').classList.add('active');
    document.querySelector('.range-button[data-range="100"]').classList.add('active');
});
