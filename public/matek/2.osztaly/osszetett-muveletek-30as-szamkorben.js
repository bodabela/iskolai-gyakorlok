document.addEventListener('DOMContentLoaded', () => {
    if (typeof initializeFirebaseAndLogger === 'function') {
        initializeFirebaseAndLogger();
        logTaskEntry('osszetett-muveletek-30as-szamkorben');
    }

    const containers = [document.getElementById('task-1-container'), document.getElementById('task-2-container')];
    const feedbacks = [document.getElementById('feedback-1'), document.getElementById('feedback-2')];
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = (array) => { array.sort(() => Math.random() - 0.5); return array; };

    function autoFocusNext(event) {
        const target = event.target;
        const maxLength = target.dataset.answer ? String(target.dataset.answer).length : 2;
        if (target.value.length >= maxLength) {
            const taskWrapper = target.closest('.task');
            const inputs = Array.from(taskWrapper.querySelectorAll('input[type="number"]:not([disabled])'));
            const currentIndex = inputs.indexOf(target);

            if (currentIndex > -1) {
                for (let i = currentIndex + 1; i < inputs.length; i++) {
                    const nextInput = inputs[i];
                    const nextMaxLength = nextInput.dataset.answer ? String(nextInput.dataset.answer).length : 2;
                    if (nextInput.value.length < nextMaxLength) {
                        nextInput.focus();
                        return;
                    }
                }
                for (let i = 0; i < currentIndex; i++) {
                    const prevInput = inputs[i];
                    const prevMaxLength = prevInput.dataset.answer ? String(prevInput.dataset.answer).length : 2;
                    if (prevInput.value.length < prevMaxLength) {
                        prevInput.focus();
                        return;
                    }
                }
                const checkButton = taskWrapper.querySelector('button[id^="check-"]');
                if (checkButton) {
                    checkButton.focus();
                }
            }
        }
    }

    const createInput = (correctAnswer) => {
        const input = document.createElement('input');
        input.type = 'number';
        input.dataset.answer = correctAnswer;
        input.addEventListener('input', autoFocusNext);
        return input;
    };

    const clearContainerAndFeedback = (taskNum) => {
        containers[taskNum - 1].innerHTML = '';
        feedbacks[taskNum - 1].textContent = '';
        feedbacks[taskNum - 1].className = 'feedback';
    };

    const checkTaskGeneric = (taskNum) => {
        const taskContainer = containers[taskNum - 1];
        const feedbackEl = feedbacks[taskNum - 1];
        const wasAllCorrect = feedbackEl.classList.contains('correct');
        const hadContent = feedbackEl.textContent !== '';
        
        const inputs = taskContainer.querySelectorAll('input[type="number"]');
        let allCorrect = true, hasEmpty = false;
        const userSolutions = [];

        inputs.forEach(input => {
            input.classList.remove('correct', 'incorrect');
            const userAnswer = input.value.trim();
            const correctAnswer = input.dataset.answer;
            userSolutions.push({ provided: userAnswer, expected: correctAnswer });
            if (userAnswer === '') { 
                hasEmpty = true; 
            } else if (userAnswer != correctAnswer) {
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
            logTaskCheck(`osszetett-muveletek-30as-szamkorben-feladat-${taskNum}`, { correct: allCorrect, solutions: userSolutions });
        }
    };

    function generateTask1() {
        clearContainerAndFeedback(1);
        const container = containers[0];
        const problems = [];
        const problemSignatures = new Set();
        const NUM_PROBLEMS = 5;

        const operations = [
            () => {
                const c = getRandomInt(2, 4);
                const inter = getRandomInt(2, Math.floor(30 / c));
                const a = getRandomInt(1, inter - 1);
                const b = inter - a;
                return { text: `(${a} + ${b}) · ${c}`, inter, final: inter * c, signature: `${a}+${b}*${c}` };
            },
            () => {
                const c = getRandomInt(2, 4);
                const inter = getRandomInt(2, Math.floor(30 / c));
                const b = getRandomInt(1, 8);
                const a = inter + b;
                return { text: `(${a} - ${b}) · ${c}`, inter, final: inter * c, signature: `${a}-${b}*${c}` };
            },
            () => {
                 const c = getRandomInt(2, 4);
                const inter = getRandomInt(2, Math.floor(30 / c));
                const a = getRandomInt(1, inter - 1);
                const b = inter - a;
                return { text: `${c} · (${a} + ${b})`, inter, final: inter * c, signature: `${c}*${a}+${b}` };
            },
            () => {
                const c = getRandomInt(2, 4);
                const final = getRandomInt(2, 10);
                const inter = final * c;
                if (inter > 20) return null;
                const a = getRandomInt(1, inter - 1);
                const b = inter - a;
                return { text: `(${a} + ${b}) : ${c}`, inter, final, signature: `${a}+${b}/${c}` };
            },
        ];

        while (problems.length < NUM_PROBLEMS) {
            const opFunc = operations[getRandomInt(0, operations.length - 1)];
            const p = opFunc();
            if (p && !problemSignatures.has(p.signature)) {
                problems.push(p);
                problemSignatures.add(p.signature);
            }
        }
        
        problems.forEach(p => {
            const mainEq = document.createElement('div');
            mainEq.className = 'main-equation';

            const finalInput = createInput(p.final);
            
            const parenRegex = /(\(.*\))/;
            const parenMatch = p.text.match(parenRegex);
            const parenContent = parenMatch[1];
            const parts = p.text.split(parenContent);

            const interWrapper = document.createElement('div');
            interWrapper.className = 'operation-wrapper';
            
            const interInput = createInput(p.inter);
            interInput.classList.add('intermediate-result-input');
            
            const parenSpan = document.createElement('span');
            parenSpan.textContent = parenContent;

            interWrapper.appendChild(interInput);
            interWrapper.appendChild(parenSpan);

            mainEq.append(document.createTextNode(parts[0]));
            mainEq.appendChild(interWrapper);
            mainEq.append(document.createTextNode(parts[1] + ' = '));
            mainEq.appendChild(finalInput);
            
            container.appendChild(mainEq);
        });

        if (typeof logNewTask === 'function') {
            logNewTask('osszetett-muveletek-30as-szamkorben-feladat-1', { problems });
        }
    }

    function generateSingleExpression() {
        const type = getRandomInt(1, 2);
        if (type === 1) { // (a-b) * c
            const c = getRandomInt(2, 3);
            const inter = getRandomInt(3, Math.floor(30 / c));
            const b = getRandomInt(1, 8);
            const a = inter + b;
            return { text: `(${a} - ${b}) · ${c}`, result: inter * c, inter: inter };
        } else { // (a+b) * c
            const c = getRandomInt(2, 3);
            const inter = getRandomInt(3, Math.floor(30 / c));
            const a = getRandomInt(1, inter - 1);
            const b = inter - a;
            return { text: `(${a} + ${b}) · ${c}`, result: inter * c, inter: inter };
        }
    }

    function generateTask2() {
        clearContainerAndFeedback(2);
        const container = containers[1];
        const problems = [];
        const NUM_PROBLEMS = 2;

        while (problems.length < NUM_PROBLEMS) {
            let left = generateSingleExpression();
            let right = generateSingleExpression();
            
            if (left.text === right.text) continue;

            if (left.result < right.result) [left, right] = [right, left];

            const diff = left.result - right.result;
            if (diff > 2 && diff < 6 && left.result <= 30) {
                 const solutions = [];
                 for(let i = right.result + 1; i < left.result; i++) {
                     solutions.push(i);
                 }
                 problems.push({left, right, solutions: solutions.reverse()});
            }
        }

        problems.forEach((p, index) => {
            const variableName = index === 0 ? 'X' : 'Y';

            const wrapper = document.createElement('div');
            wrapper.className = 'inequality-wrapper';

            const expressionDiv = document.createElement('div');
            expressionDiv.className = 'inequality-expression';

            const createOperationDiv = (data) => {
                const operationDiv = document.createElement('div');
                operationDiv.className = 'operation';

                const parenRegex = /(\(.*\))/;
                const parenMatch = data.text.match(parenRegex);
                const parenContent = parenMatch[1];
                const parts = data.text.split(parenContent);

                const interWrapper = document.createElement('div');
                interWrapper.className = 'operation-wrapper';
                
                const interInput = createInput(data.inter);
                interInput.classList.add('intermediate-result-input');
                
                const parenSpan = document.createElement('span');
                parenSpan.textContent = parenContent;

                interWrapper.appendChild(interInput);
                interWrapper.appendChild(parenSpan);

                operationDiv.append(document.createTextNode(parts[0]));
                operationDiv.appendChild(interWrapper);
                operationDiv.append(document.createTextNode(parts[1]));
                return operationDiv;
            };

            const leftOpDiv = createOperationDiv(p.left);
            const rightOpDiv = createOperationDiv(p.right);
            const leftFinalInput = createInput(p.left.result);
            const rightFinalInput = createInput(p.right.result);
            
            const leftSide = document.createElement('div');
            leftSide.className = 'operation-side left';
            leftSide.appendChild(leftOpDiv);
            leftSide.appendChild(leftFinalInput);

            const rightSide = document.createElement('div');
            rightSide.className = 'operation-side right';
            rightSide.appendChild(rightFinalInput);
            rightSide.appendChild(rightOpDiv);

            expressionDiv.appendChild(leftSide);
            expressionDiv.append(` > ${variableName} > `);
            expressionDiv.appendChild(rightSide);

            wrapper.appendChild(expressionDiv);
            
            const solutionsDiv = document.createElement('div');
            solutionsDiv.className = 'inequality-solutions';
            solutionsDiv.append(`${variableName}: `);

            p.solutions.forEach(sol => {
                solutionsDiv.appendChild(createInput(sol));
            });

            wrapper.appendChild(solutionsDiv);
            container.appendChild(wrapper);
        });

        if (typeof logNewTask === 'function') {
            logNewTask('osszetett-muveletek-30as-szamkorben-feladat-2', { problems });
        }
    }

    const taskGenerators = [generateTask1, generateTask2];

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
