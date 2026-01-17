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
        
        // Create columnar structure
        const columnsWrapper = document.createElement('div');
        columnsWrapper.className = 'task-columns';
        container.appendChild(columnsWrapper);

        const problems = [];
        const NUM_SETS = 3; // Number of columns (sets of numbers)
        const MAX_VAL = 30;

        // Helper to render problem parts
        const renderProblem = (colContainer, prefix, activeText, suffix, interVal, finalVal) => {
            const mainEq = document.createElement('div');
            mainEq.className = 'main-equation';

            const finalInput = createInput(finalVal);

            const interWrapper = document.createElement('div');
            interWrapper.className = 'operation-wrapper';
            
            const interInput = createInput(interVal);
            interInput.classList.add('intermediate-result-input');
            
            const activeSpan = document.createElement('span');
            activeSpan.textContent = activeText;

            interWrapper.appendChild(interInput);
            interWrapper.appendChild(activeSpan);

            if (prefix) mainEq.appendChild(document.createTextNode(prefix));
            mainEq.appendChild(interWrapper);
            if (suffix) mainEq.appendChild(document.createTextNode(suffix));
            mainEq.appendChild(document.createTextNode(' = '));
            mainEq.appendChild(finalInput);
            
            colContainer.appendChild(mainEq);
        };

        for (let i = 0; i < NUM_SETS; i++) {
            const col = document.createElement('div');
            col.className = 'task-column';
            columnsWrapper.appendChild(col);

            let tuple = null;
            while(!tuple) {
                // 1: Add+Mul, 2: Sub+Mul, 3: Add+Div, 4: Sub+Div
                const opType = getRandomInt(1, 4);
                
                if (opType === 1 || opType === 2) { // Multiplication
                    // Format: A +/- B * C  vs (A +/- B) * C
                    const c = getRandomInt(2, 6); 
                    const b = getRandomInt(2, 10);
                    const a = getRandomInt(1, 20); 

                    // Check Standard: A +/- (B*C)
                    const prod = b * c;
                    if (prod > MAX_VAL) continue;
                    
                    let resStandard;
                    if (opType === 1) resStandard = a + prod;
                    else resStandard = a - prod;
                    
                    if (resStandard < 0 || resStandard > MAX_VAL) continue;
                    
                    // Check Changed: (A +/- B) * C
                    let inner;
                    if (opType === 1) inner = a + b;
                    else inner = a - b;
                    
                    if (inner < 0) continue;
                    if (inner > 10) continue; // Factor limit for 10x10 table
                    
                    const resChanged = inner * c;
                    if (resChanged > MAX_VAL) continue;
                    
                    tuple = { opType, a, b, c, operator: '·', resStandard, resChanged, interStd: prod, interChg: inner };

                } else { // Division
                    // Format: A +/- B : C vs (A +/- B) : C
                    const c = getRandomInt(2, 5);
                    
                    // To have integers in both forms, A and B must be multiples of C
                    const ma = getRandomInt(1, 10); // A = ma * c
                    const mb = getRandomInt(1, 10); // B = mb * c
                    
                    const a = ma * c;
                    const b = mb * c;
                    
                    if (a > MAX_VAL || b > MAX_VAL) continue;
                    
                    // Standard: A +/- (B:C)
                    const quot = b / c;
                    if (quot > 10) continue; 
                    
                    let resStandard;
                    if (opType === 3) resStandard = a + quot;
                    else resStandard = a - quot;
                    
                    if (resStandard < 0 || resStandard > MAX_VAL) continue;
                    
                    // Changed: (A +/- B) : C
                    let inner;
                    if (opType === 3) inner = a + b;
                    else inner = a - b;
                    
                    if (inner < 0) continue;
                    
                    const resChanged = inner / c;
                    if (resChanged > 10) continue;
                    if (resChanged > MAX_VAL) continue;
                    
                    tuple = { opType, a, b, c, operator: ':', resStandard, resChanged, interStd: quot, interChg: inner };
                }
            }
            problems.push(tuple);

            // Render to this Column: all 3 variations for the same tuple
            
            // 1. Standard: X +/- Y * Z
            {
                const { a, b, c, operator, resStandard, interStd, opType } = tuple;
                const prefix = (opType === 1 || opType === 3) ? `${a} + ` : `${a} - `;
                const active = `${b} ${operator} ${c}`;
                renderProblem(col, prefix, active, '', interStd, resStandard);
            }
            // 2. Standard with Parens: X +/- (Y * Z)
            {
                const { a, b, c, operator, resStandard, interStd, opType } = tuple;
                const prefix = (opType === 1 || opType === 3) ? `${a} + ` : `${a} - `;
                const active = `(${b} ${operator} ${c})`;
                renderProblem(col, prefix, active, '', interStd, resStandard);
            }
            // 3. Changed Precedence: (X +/- Y) * Z
            {
                const { a, b, c, operator, resChanged, interChg, opType } = tuple;
                const innerOp = (opType === 1 || opType === 3) ? '+' : '-';
                const active = `(${a} ${innerOp} ${b})`;
                const suffix = ` ${operator} ${c}`;
                renderProblem(col, '', active, suffix, interChg, resChanged);
            }
        }

        if (typeof logNewTask === 'function') {
            logNewTask('osszetett-muveletek-30as-szamkorben-feladat-1', { problems });
        }
    }

    function generateSingleExpression() {
        const type = getRandomInt(1, 2);
        if (type === 1) { // (a-b) * c
            const c = getRandomInt(1, 3);
            const inter = getRandomInt(3, Math.floor(30 / c));
            const b = getRandomInt(1, 8);
            const a = inter + b;
            return { text: `(${a} - ${b}) · ${c}`, result: inter * c, inter: inter };
        } else { // (a+b) * c
            const c = getRandomInt(1, 3);
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
