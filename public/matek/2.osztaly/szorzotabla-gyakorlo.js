document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();

    const containers = {
        1: document.getElementById('task-1-container'),
        2: document.getElementById('task-2-container'),
        3: document.getElementById('task-3-container'),
        4: document.getElementById('task-4-container'),
        5: document.getElementById('task-5-container'),
    };

    const feedbacks = {
        1: document.getElementById('feedback-1'),
        2: document.getElementById('feedback-2'),
        3: document.getElementById('feedback-3'),
        4: document.getElementById('feedback-4'),
        5: document.getElementById('feedback-5'),
    };

    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');
    const rangeButtons = document.querySelectorAll('.range-button');
    const modeButtons = document.querySelectorAll('.mode-button');
    const factorSelector = document.querySelector('.factor-selector');

    let currentMaxResult = 100;
    let currentMode = 'szorzotablaval';
    let currentFactor = 2;

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
    
    function clearContainerAndFeedback(taskNum) {
        containers[taskNum].innerHTML = '';
        feedbacks[taskNum].textContent = '';
        feedbacks[taskNum].className = 'feedback';
    }

    function setFeedback(taskNum, isCorrect) {
        const feedbackEl = feedbacks[taskNum];
        if (isCorrect) {
            feedbackEl.textContent = 'Nagyszerű! Minden helyes!';
            feedbackEl.className = 'feedback correct';
        } else {
            feedbackEl.textContent = 'Van néhány hiba. Nézd át a pirossal jelölt mezőket!';
            feedbackEl.className = 'feedback incorrect';
        }
    }
    
    function createInput(correctAnswer) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.dataset.answer = correctAnswer;
        input.setAttribute('maxlength', String(correctAnswer).length);
        input.addEventListener('input', autoFocusNext);
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
        return input;
    }

    // --- TASK 1: Összeadásból szorzás ---
    function generateTask1() {
        clearContainerAndFeedback(1);
        const numTasks = 2;
        const generatedTasks = [];
        const usedNumGroups = new Set();
        const maxNumGroups = Math.min(10, Math.floor(currentMaxResult / currentFactor));
    
        if (maxNumGroups < 2) {
            containers[1].innerHTML = "<p>A választott számkörben nem lehet elég különböző feladatot generálni.</p>";
            return;
        }
    
        for(let i=0; i<numTasks; i++) {
            let numGroups;
            do {
                numGroups = getRandomInt(2, maxNumGroups);
            } while (usedNumGroups.has(numGroups));
            usedNumGroups.add(numGroups);
            
            const sum = numGroups * currentFactor;
            generatedTasks.push({ numGroups, sum });
    
            const row = document.createElement('div');
            row.className = 'task-1-row';
    
            const groupsContainer = document.createElement('div');
            groupsContainer.className = 'groups-container';
            for (let g = 0; g < numGroups; g++) {
                const group = document.createElement('div');
                group.className = 'group';
                for (let b = 0; b < currentFactor; b++) {
                    const ball = document.createElement('div');
                    ball.className = 'ball';
                    group.appendChild(ball);
                }
                groupsContainer.appendChild(group);
            }
    
            const addTerms = Array(numGroups).fill(String(currentFactor)).join(' + ');
            const additionEq = document.createElement('div');
            additionEq.className = 'equation-container';
            additionEq.innerHTML = `${addTerms} = `;
            const addInput = createInput(sum);
            addInput.dataset.operationType = 'multiplication';
            addInput.dataset.op1 = numGroups;
            addInput.dataset.op2 = currentFactor;
            additionEq.appendChild(addInput);
            
            const multiEq = document.createElement('div');
            multiEq.className = 'equation-container';
            multiEq.innerHTML = `${numGroups} · ${currentFactor} = `;
            const multiInput = createInput(sum);
            multiInput.dataset.operationType = 'multiplication';
            multiInput.dataset.op1 = numGroups;
            multiInput.dataset.op2 = currentFactor;
            multiEq.appendChild(multiInput);
    
            row.appendChild(groupsContainer);
            row.appendChild(additionEq);
            row.appendChild(multiEq);
            containers[1].appendChild(row);
        }
        logNewTask('szorzotabla-gyakorlo-osszeadasbol-szorzas', { range: currentMaxResult, factor: currentFactor, tasks: generatedTasks });
    }

    // --- TASK 2: Csoportokból szorzás ---
    function generateTask2() {
        clearContainerAndFeedback(2);
        const numTasks = 2;
        const generatedTasks = [];
        const usedNs = new Set();
        const maxN = 10; // Number of items in a group

        const possibleNs = [];
        for (let i = 1; i <= maxN; i++) {
            if (i * currentFactor <= currentMaxResult) {
                possibleNs.push(i);
            }
        }

        if (possibleNs.length < numTasks) {
            containers[2].innerHTML = "<p>A választott számkörben nem lehet elég különböző feladatot generálni.</p>";
            return;
        }

        for(let i=0; i<numTasks; i++) {
            let n; // items per group
            do {
                n = possibleNs[getRandomInt(0, possibleNs.length - 1)];
            } while (usedNs.has(n));
            usedNs.add(n);

            const sum = n * currentFactor;
            generatedTasks.push({ n, sum });

            const row = document.createElement('div');
            row.className = 'task-1-row'; // Reuse style

            const groupsContainer = document.createElement('div');
            groupsContainer.className = 'groups-container';
            for (let g = 0; g < currentFactor; g++) { // currentFactor groups
                const group = document.createElement('div');
                group.className = 'group';
                for (let b = 0; b < n; b++) { // n balls
                    const ball = document.createElement('div');
                    ball.className = 'ball';
                    group.appendChild(ball);
                }
                groupsContainer.appendChild(group);
            }
            
            const addTerms = Array(currentFactor).fill(String(n)).join(' + ');
            const additionEq = document.createElement('div');
            additionEq.className = 'equation-container';
            additionEq.innerHTML = `${addTerms} = `;
            const addInput = createInput(sum);
            addInput.dataset.operationType = 'multiplication';
            addInput.dataset.op1 = n; addInput.dataset.op2 = currentFactor;
            additionEq.appendChild(addInput);
            
            const multiEq = document.createElement('div');
            multiEq.className = 'equation-container';
            multiEq.innerHTML = `${currentFactor} · ${n} = `;
            const multiInput = createInput(sum);
            multiInput.dataset.operationType = 'multiplication';
            multiInput.dataset.op1 = currentFactor; multiInput.dataset.op2 = n;
            multiEq.appendChild(multiInput);
    
            row.appendChild(groupsContainer);
            row.appendChild(additionEq);
            row.appendChild(multiEq);
            containers[2].appendChild(row);
        }
        logNewTask('szorzotabla-gyakorlo-csoportokbol-szorzas', { range: currentMaxResult, factor: currentFactor, tasks: generatedTasks });
    }

    // --- TASK 3: Szorzás és osztás gyakorló ---
    function generateTask3() {
        clearContainerAndFeedback(3);
        const numTasks = 6;
        const generatedTasks = [];
        const usedTasks = new Set();
        const maxNum1 = Math.min(10, Math.floor(currentMaxResult / currentFactor));
        const possibleTaskCount = maxNum1 * 4;
    
        if (possibleTaskCount < numTasks) {
            console.warn(`Not enough unique variations for Task 3. Generating ${possibleTaskCount} instead of ${numTasks}.`);
        }
    
        for(let i=0; i<numTasks && usedTasks.size < possibleTaskCount; i++) {
            let num1, type, taskKey;
            do {
                num1 = getRandomInt(1, maxNum1);
                type = getRandomInt(1, 4);
                taskKey = `${type}-${num1}`;
            } while (usedTasks.has(taskKey));
            usedTasks.add(taskKey);
    
            const result = num1 * currentFactor;
            const box = document.createElement('div');
            box.className = 'equation-box';
            let task = {};
            let input;

            switch(type) {
                case 1: // n * F = ?
                    box.innerHTML = `${num1} · ${currentFactor} = `;
                    input = createInput(result);
                    input.dataset.operationType = 'multiplication';
                    input.dataset.op1 = num1;
                    input.dataset.op2 = currentFactor;
                    box.appendChild(input);
                    task = { type: 'n*F=?', op1: num1, answer: result};
                    break;
                case 2: // ? * F = n
                    input = createInput(num1);
                    input.dataset.operationType = 'find_factor';
                    input.dataset.op1 = result;
                    input.dataset.op2 = currentFactor;
                    box.appendChild(input);
                    box.appendChild(document.createTextNode(` · ${currentFactor} = ${result}`));
                    task = { type: '?*F=n', op2: result, answer: num1};
                    break;
                case 3: // n : F = ?
                    box.innerHTML = `${result} : ${currentFactor} = `;
                    input = createInput(num1);
                    input.dataset.operationType = 'division';
                    input.dataset.op1 = result;
                    input.dataset.op2 = currentFactor;
                    box.appendChild(input);
                    task = { type: 'n/F=?', op1: result, answer: num1};
                    break;
                case 4: // ? : F = n
                    input = createInput(result);
                    input.dataset.operationType = 'find_dividend';
                    input.dataset.op1 = num1;
                    input.dataset.op2 = currentFactor;
                    box.appendChild(input);
                    box.appendChild(document.createTextNode(` : ${currentFactor} = ${num1}`));
                    task = { type: '?/F=n', op2: num1, answer: result};
                    break;
            }
            generatedTasks.push(task);
            containers[3].appendChild(box);
        }
        logNewTask('szorzotabla-gyakorlo-egyenletek', { range: currentMaxResult, factor: currentFactor, tasks: generatedTasks });
    }

    // --- TASK 4: Szorzás és osztás ---
    function generateTask4() {
        clearContainerAndFeedback(4);
        const container = containers[4];
        const numTasks = 4;
        const generatedTasks = [];
        const usedNums = new Set();
        const maxNum = Math.min(10, Math.floor(currentMaxResult / currentFactor));

        if (maxNum < numTasks) {
            container.innerHTML = "<p>A választott számkörben nem lehet elég különböző feladatot generálni.</p>";
            return;
        }

        for (let i = 0; i < numTasks; i++) {
            let num;
            do {
                num = getRandomInt(1, maxNum);
            } while (usedNums.has(num));
            usedNums.add(num);

            const answer = num * currentFactor;
            
            const item = document.createElement('div');
            item.className = 'task-4-item';

            const numBox = document.createElement('div');
            numBox.className = 'flow-box';
            numBox.textContent = num;

            const arrowsContainer = document.createElement('div');
            arrowsContainer.className = 'flow-arrows-container';
            arrowsContainer.innerHTML = `
                <div class="flow-arrow forward"><span>${currentFactor}-szerese</span></div>
                <div class="flow-arrow backward"><span>${currentFactor}-od része</span></div>
            `;

            item.appendChild(numBox);
            item.appendChild(arrowsContainer);
            const input = createInput(answer);
            input.dataset.operationType = 'multiplication';
            input.dataset.op1 = num;
            input.dataset.op2 = currentFactor;
            item.appendChild(input);
            
            container.appendChild(item);
            
            generatedTasks.push({ type: 'multiply-divide', num, answer });
        }
        logNewTask('szorzotabla-gyakorlo-szorzas-osztas', { range: currentMaxResult, factor: currentFactor, tasks: generatedTasks });
    }

    // --- TASK 5: Szöveges feladatok ---
    function generateTask5() {
        clearContainerAndFeedback(5);
        const f = currentFactor;
        const problems = [
            { q: (n, r, f) => `Annának van ${n} doboza, mindegyikben ${f} golyó. Hány golyója van összesen?`, type: '*', op1: (n, r, f) => n, op2: (n, r, f) => f },
            { q: (n, r, f) => `Peti ${r} cukorkát oszt szét. Mindenki ${f}-et kap. Hányan kapnak cukorkát?`, type: '/', op1: (n, r, f) => r, op2: (n, r, f) => f },
            { q: (n, r, f) => `Egy parkolóban ${n} sorban állnak autók. Minden sorban ${f} autó van. Hány autó van a parkolóban?`, type: '*', op1: (n, r, f) => n, op2: (n, r, f) => f },
            { q: (n, r, f) => `Anya ${r} szelet süteményt tett a tálra. Minden tányérra ${f} darab kerül. Hány tányérra van szükség?`, type: '/', op1: (n, r, f) => r, op2: (n, r, f) => f },
        ];
        const selectedProblem = problems[getRandomInt(0, problems.length - 1)];
        const maxN = Math.min(10, Math.floor(currentMaxResult / f));
        if (maxN < 3) {
            containers[5].innerHTML = "<p>A választott számkörben nem lehet elég különböző feladatot generálni.</p>";
            return;
        }
        const n = getRandomInt(3, maxN);
        const r = n * f;

        const wrapper = document.createElement('div');
        wrapper.className = 'word-problem';

        const p = document.createElement('p');
        p.textContent = selectedProblem.q(n, r, f);

        const solutionContainer = document.createElement('div');
        solutionContainer.className = 'solution-container';
        solutionContainer.appendChild(document.createTextNode('Megoldás: '));

        const op1 = selectedProblem.op1(n, r, f);
        const op2 = selectedProblem.op2(n, r, f);
        const answer = selectedProblem.type === '*' ? op1 * op2 : op1 / op2;
        
        const input1 = createInput(op1);
        const input2 = createInput(op2);
        const inputAnswer = createInput(answer);

        if (selectedProblem.type === '*') {
            input1.dataset.operationType = 'find_factor'; input1.dataset.op1 = answer; input1.dataset.op2 = op2;
            input2.dataset.operationType = 'find_factor'; input2.dataset.op1 = answer; input2.dataset.op2 = op1;
            inputAnswer.dataset.operationType = 'multiplication'; inputAnswer.dataset.op1 = op1; inputAnswer.dataset.op2 = op2;
        } else { // division
            input1.dataset.operationType = 'find_dividend'; input1.dataset.op1 = answer; input1.dataset.op2 = op2;
            input2.dataset.operationType = 'find_divisor'; input2.dataset.op1 = op1; input2.dataset.op2 = answer;
            inputAnswer.dataset.operationType = 'division'; inputAnswer.dataset.op1 = op1; inputAnswer.dataset.op2 = op2;
        }

        solutionContainer.appendChild(input1);
        solutionContainer.appendChild(document.createTextNode(` ${selectedProblem.type === '*' ? '·' : ':'} `));
        solutionContainer.appendChild(input2);
        solutionContainer.appendChild(document.createTextNode(' = '));
        solutionContainer.appendChild(inputAnswer);

        wrapper.appendChild(p);
        wrapper.appendChild(solutionContainer);
        containers[5].appendChild(wrapper);

        logNewTask('szorzotabla-gyakorlo-szoveges', { range: currentMaxResult, factor: currentFactor, task: { q: p.textContent, op1, op2, answer } });
    }
    
    function checkTask(taskNum) {
        const taskContainer = containers[taskNum];
        const inputs = taskContainer.querySelectorAll('input[type="number"]');
        let allCorrect = true;
        const userSolutions = [];

        inputs.forEach(input => {
            input.classList.remove('correct', 'incorrect');
            const userAnswer = parseInt(input.value, 10);
            const correctAnswer = parseInt(input.dataset.answer, 10);
            userSolutions.push(isNaN(userAnswer) ? null : userAnswer);

            if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
                input.classList.add('incorrect');
                allCorrect = false;
            } else {
                input.classList.add('correct');
            }
        });

        setFeedback(taskNum, allCorrect);
        logTaskCheck(`szorzotabla-gyakorlo-task${taskNum}`, { correct: allCorrect, solutions: userSolutions });
    }

    // --- Multiplication Table Logic ---
    function generateMultiplicationTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const table = document.createElement('table');
        table.className = 'szorzotabla';
        
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        const th = document.createElement('th');
        th.textContent = '·';
        headerRow.appendChild(th);
        for (let i = 1; i <= 10; i++) {
            const th = document.createElement('th');
            th.textContent = i;
            th.dataset.col = i;
            headerRow.appendChild(th);
        }

        const tbody = table.createTBody();
        for (let i = 1; i <= 10; i++) {
            const row = tbody.insertRow();
            const th = document.createElement('th');
            th.textContent = i;
            th.dataset.row = i;
            row.appendChild(th);
            for (let j = 1; j <= 10; j++) {
                const cell = row.insertCell();
                cell.textContent = i * j;
                cell.dataset.row = i;
                cell.dataset.col = j;
            }
        }
        container.innerHTML = '';
        container.appendChild(table);
    }

    function clearTableHighlights(table) {
        table.querySelectorAll('.highlight-factor1, .highlight-factor2, .highlight-result').forEach(el => {
            el.classList.remove('highlight-factor1', 'highlight-factor2', 'highlight-result');
        });
    }

    function highlightInTable(table, row, col, result) {
        if (!table || isNaN(row) || isNaN(col)) return;
        clearTableHighlights(table);
        if (row > 10 || col > 10 || row < 1 || col < 1) return;
        table.querySelector(`th[data-col='${col}']`)?.classList.add('highlight-factor2');
        table.querySelector(`th[data-row='${row}']`)?.classList.add('highlight-factor1');
        table.querySelector(`td[data-row='${row}'][data-col='${col}']`)?.classList.add('highlight-result');
    }

    function handleInputFocus(event) {
        if (currentMode !== 'szorzotablaval') return;
        const input = event.target;
        const taskWrapper = input.closest('.task');
        const table = taskWrapper.querySelector('.szorzotabla');
        if (!table) return;

        const opType = input.dataset.operationType;
        if (!opType) {
            clearTableHighlights(table);
            return;
        }

        const op1 = parseInt(input.dataset.op1, 10);
        const op2 = parseInt(input.dataset.op2, 10);
        
        let factor1, factor2, product;
        switch(opType) {
            case 'multiplication': // op1 * op2 = ?. Find product.
                factor1 = op1;
                factor2 = op2;
                product = op1 * op2;
                break;
            case 'find_dividend':  // ? / op2 = op1. Find dividend. (op1=quotient, op2=divisor)
                factor1 = op1;
                factor2 = op2;
                product = op1 * op2;
                break;
            case 'division': // op1 / op2 = ?. Find quotient. (op1=dividend, op2=divisor)
                product = op1;
                factor2 = op2;
                factor1 = op1 / op2;
                break;
            case 'find_factor': // ? * op2 = op1. Find factor. (op1=product, op2=known factor)
                product = op1;
                factor2 = op2;
                factor1 = op1 / op2;
                break;
            case 'find_divisor': // op1 / ? = op2. Find divisor. (op1=dividend, op2=quotient)
                product = op1;
                factor2 = op2;       // known factor (quotient)
                factor1 = op1 / op2; // unknown factor (divisor)
                break;
            default:
                clearTableHighlights(table);
                return;
        }

        if (factor1 !== undefined && factor2 !== undefined && Number.isInteger(factor1) && Number.isInteger(factor2)) {
            let row, col;
            if (factor1 === currentFactor) {
                row = factor1;
                col = factor2;
            } else if (factor2 === currentFactor) {
                row = factor2;
                col = factor1;
            } else {
                // Fallback for cases where neither factor is the currentFactor (e.g., text problems)
                row = factor1;
                col = factor2;
            }
            highlightInTable(table, row, col, product);
        } else {
            clearTableHighlights(table);
        }
    }

    function handleInputBlur(event) {
        const input = event.target;
        const taskWrapper = input.closest('.task');
        const table = taskWrapper.querySelector('.szorzotabla');
        if (table) {
            clearTableHighlights(table);
        }
    }

    // --- Main Logic ---
    function generateAllTasks() {
        generateTask1();
        generateTask2();
        generateTask3();
        generateTask4();
        generateTask5();
    }

    function generateAllTables() {
        for (let i = 1; i <= 5; i++) {
            generateMultiplicationTable(`szorzotabla-${i}-wrapper`);
        }
    }

    function applyTheme(themeClass) {
        bodyEl.className = ''; 
        if (currentMode === 'szorzotablaval') {
            bodyEl.classList.add('szorzotabla-mode');
        }
        bodyEl.classList.add(themeClass); 
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeClass);
        });
        generateAllTasks();
    }

    function setupControls() {
        for (let i = 1; i <= 10; i++) {
            const button = document.createElement('button');
            button.className = 'factor-button';
            button.dataset.factor = i;
            button.textContent = i;
            if (i === currentFactor) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentFactor = i;
                factorSelector.querySelectorAll('.factor-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                generateAllTasks();
            });
            factorSelector.appendChild(button);
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => applyTheme(button.dataset.theme));
        });

        rangeButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentMaxResult = parseInt(button.dataset.range);
                rangeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                generateAllTasks();
            });
        });

        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentMode = button.dataset.mode;
                modeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                bodyEl.classList.toggle('szorzotabla-mode', currentMode === 'szorzotablaval');
                logEvent('MODE_CHANGE', { page: 'szorzotabla-gyakorlo', newMode: currentMode });
            });
        });

        for (let i = 1; i <= 5; i++) {
            document.getElementById(`new-task-${i}-button`).addEventListener('click', () => eval(`generateTask${i}()`));
            document.getElementById(`check-${i}-button`).addEventListener('click', () => checkTask(i));
        }
    }

    logTaskEntry('szorzotabla-gyakorlo');
    setupControls();
    generateAllTables();
    generateAllTasks();
    applyTheme('theme-candy');
});
