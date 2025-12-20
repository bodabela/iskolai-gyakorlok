document.addEventListener('DOMContentLoaded', () => {
    if (typeof initializeFirebaseAndLogger === 'function') {
        initializeFirebaseAndLogger();
        logTaskEntry('szamsorozatok-10000');
    }

    const containers = [document.getElementById('task-1-container'), document.getElementById('task-2-container')];
    const feedbacks = [document.getElementById('feedback-1'), document.getElementById('feedback-2')];
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');

    let allProblemsData = [[], []]; // Task 1 and Task 2 problems

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    function autoFocusNext(currentInput, allInputs) {
        const maxLength = String(currentInput.dataset.answer).length;
        if (currentInput.value.length >= maxLength) {
            const currentIndex = allInputs.indexOf(currentInput);
            if (currentIndex > -1 && currentIndex < allInputs.length - 1) {
                const nextInput = allInputs[currentIndex + 1];
                if (nextInput) {
                    nextInput.focus();
                }
            }
        }
    }

    const clearContainerAndFeedback = (taskNum) => {
        containers[taskNum - 1].innerHTML = '';
        feedbacks[taskNum - 1].textContent = '';
        feedbacks[taskNum - 1].className = 'feedback';
        allProblemsData[taskNum - 1] = [];
    };

    function generateTask(taskNum) {
        clearContainerAndFeedback(taskNum);
        const container = containers[taskNum - 1];
        const problemSignatures = new Set();
        const NUM_PROBLEMS = 3;
        const taskType = taskNum === 1 ? 'add-sub' : 'mixed';

        while (allProblemsData[taskNum - 1].length < NUM_PROBLEMS) {
            const ruleLength = getRandomInt(2, 3);
            const shownCount = ruleLength + 1;
            const missingCount = ruleLength === 2 ? 4 : 3;
            const totalCount = shownCount + missingCount;

            let rules = [];
            let sequence = [];
            let startNum;
            let valid = false;

            for (let attempt = 0; attempt < 50 && !valid; attempt++) {
                rules = [];
                sequence = [];
                // Generate Rules
                for (let i = 0; i < ruleLength; i++) {
                    let op, val;
                    if (taskType === 'add-sub') {
                        op = ['+', '-'][getRandomInt(0, 1)];
                        val = [100, 200, 500, 1000, 1500, 2000][getRandomInt(0, 5)];
                    } else {
                        op = ['+', '-', '*', ':'][getRandomInt(0, 3)];
                        if (op === '+' || op === '-') val = [100, 200, 500, 1000, 2000][getRandomInt(0, 4)];
                        else val = [2, 3, 4, 5, 10][getRandomInt(0, 4)];
                    }
                    rules.push({ op, val });
                }

                // Generate Sequence
                startNum = getRandomInt(20, 80) * 100;
                sequence.push(startNum);
                let currentNum = startNum;
                valid = true;

                for (let i = 0; i < totalCount - 1; i++) {
                    const rule = rules[i % ruleLength];
                    let nextNum = currentNum;
                    switch (rule.op) {
                        case '+': nextNum += rule.val; break;
                        case '-': nextNum -= rule.val; break;
                        case '*': nextNum *= rule.val; break;
                        case ':':
                            if (nextNum % rule.val !== 0) { valid = false; break; }
                            const result = nextNum / rule.val;
                            if (result % 100 !== 0) { valid = false; break; }
                            nextNum = result;
                            break;
                    }
                    if (!valid || nextNum < 0 || nextNum > 10000) { valid = false; break; }
                    currentNum = nextNum;
                    sequence.push(currentNum);
                }
            }

            if (valid) {
                const signature = sequence.slice(0, shownCount).join('-') + rules.map(r => r.op + r.val).join('');
                if (!problemSignatures.has(signature)) {
                    problemSignatures.add(signature);
                    allProblemsData[taskNum - 1].push({ sequence, rules, shownCount, totalCount });
                }
            }
        }

        renderTasks(taskNum);
        if (typeof logNewTask === 'function') {
            logNewTask(`szamsorozatok-10000-feladat-${taskNum}`, { problems: allProblemsData[taskNum-1] });
        }
    }

    function renderTasks(taskNum) {
        const container = containers[taskNum - 1];
        container.innerHTML = '';
        const allInputsForTask = [];

        allProblemsData[taskNum - 1].forEach((problem, problemIdx) => {
            const problemWrapper = document.createElement('div');
            problemWrapper.className = 'problem-container';

            const sequenceRow = document.createElement('div');
            sequenceRow.className = 'sequence-row';

            const numberElements = [];
            
            for (let i = 0; i < problem.totalCount; i++) {
                let el;
                if (i < problem.shownCount) {
                    el = document.createElement('span');
                    el.textContent = problem.sequence[i];
                } else {
                    el = document.createElement('input');
                    el.type = 'number';
                    el.dataset.answer = problem.sequence[i];
                    el.dataset.problem = problemIdx;
                    el.dataset.index = i;
                    el.classList.add('sequence-number-input');
                    allInputsForTask.push(el);
                }
                el.classList.add('sequence-number');
                sequenceRow.appendChild(el);
                numberElements.push(el);
            }

            problemWrapper.appendChild(sequenceRow);
            container.appendChild(problemWrapper);

            // Position rule inputs
            for (let i = 0; i < problem.shownCount - 1; i++) {
                const ruleGroup = document.createElement('div');
                ruleGroup.className = 'rule-group';

                const opSelect = document.createElement('select');
                opSelect.className = 'rule-operator-select';
                const ops = taskNum === 1 ? ['+', '-'] : ['+', '-', '*', ':'];
                ops.forEach(op => {
                    const option = document.createElement('option');
                    option.value = op;
                    option.textContent = op;
                    opSelect.appendChild(option);
                });
                opSelect.dataset.answer = problem.rules[i % problem.rules.length].op;
                allInputsForTask.push(opSelect);

                const valInput = document.createElement('input');
                valInput.type = 'number';
                valInput.className = 'rule-value-input';
                valInput.dataset.answer = problem.rules[i % problem.rules.length].val;
                allInputsForTask.push(valInput);

                ruleGroup.appendChild(opSelect);
                ruleGroup.appendChild(valInput);
                sequenceRow.appendChild(ruleGroup); // Append to row for positioning context
                
                // Position calculation
                const el1 = numberElements[i];
                const el2 = numberElements[i + 1];
                setTimeout(() => { // Wait for elements to be in DOM
                    const rect1 = el1.getBoundingClientRect();
                    const rect2 = el2.getBoundingClientRect();
                    const containerRect = sequenceRow.getBoundingClientRect();
                    const middle = (rect1.right - containerRect.left) + (rect2.left - rect1.right) / 2;
                    ruleGroup.style.left = `${middle}px`;
                }, 0);
            }
        });

        allInputsForTask.forEach(input => {
            if (input.type === 'number') {
                input.addEventListener('input', () => autoFocusNext(input, allInputsForTask));
            }
            if (input.tagName === 'SELECT') {
                input.addEventListener('change', () => autoFocusNext(input, allInputsForTask));
            }
        });
    }

    const checkTaskGeneric = (taskNum) => {
        const feedbackEl = feedbacks[taskNum - 1];
        const container = containers[taskNum - 1];
        const wasAllCorrect = feedbackEl.classList.contains('correct');
        const hadContent = feedbackEl.textContent !== '';

        const inputs = Array.from(container.querySelectorAll('input[data-answer], select[data-answer]'));
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
            logTaskCheck(`szamsorozatok-10000-feladat-${taskNum}`, { correct: allCorrect, solutions: userSolutions });
        }
    };

    const taskGenerators = [() => generateTask(1), () => generateTask(2)];

    function generateAllTasks() {
        taskGenerators.forEach(generator => generator());
    }

    function setupControls() {
        themeButtons.forEach(button => button.addEventListener('click', () => {
            bodyEl.className = '';
            bodyEl.classList.add(button.dataset.theme);
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        }));
        for (let i = 1; i <= 2; i++) {
            document.getElementById(`new-task-${i}-button`).addEventListener('click', taskGenerators[i - 1]);
            document.getElementById(`check-${i}-button`).addEventListener('click', () => checkTaskGeneric(i));
        }
    }

    setupControls();
    generateAllTasks();
    document.querySelector('.theme-button[data-theme="theme-candy"]').classList.add('active');
});
