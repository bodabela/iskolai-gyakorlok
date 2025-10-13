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

    let currentMaxResult = 20;
    let currentMode = 'onallo';

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
        const maxNumGroups = Math.floor(currentMaxResult / 2);
    
        if (maxNumGroups - 2 + 1 < numTasks) {
            console.error("Not enough unique variations for Task 1 in the selected range.");
            containers[1].innerHTML = "<p>A választott számkörben nem lehet elég különböző feladatot generálni.</p>";
            return;
        }
    
        for(let i=0; i<numTasks; i++) {
            let numGroups;
            do {
                numGroups = getRandomInt(2, maxNumGroups);
            } while (usedNumGroups.has(numGroups));
            usedNumGroups.add(numGroups);
            
            const sum = numGroups * 2;
            generatedTasks.push({ numGroups, sum });
    
            const row = document.createElement('div');
            row.className = 'task-1-row';
    
            const groupsContainer = document.createElement('div');
            groupsContainer.className = 'groups-container';
            for (let g = 0; g < numGroups; g++) {
                const group = document.createElement('div');
                group.className = 'group';
                for (let b = 0; b < 2; b++) {
                    const ball = document.createElement('div');
                    ball.className = 'ball';
                    group.appendChild(ball);
                }
                groupsContainer.appendChild(group);
            }
    
            const addTerms = Array(numGroups).fill('2').join(' + ');
            const additionEq = document.createElement('div');
            additionEq.className = 'equation-container';
            additionEq.innerHTML = `${addTerms} = `;
            const addInput = createInput(sum);
            addInput.dataset.operationType = 'multiplication';
            addInput.dataset.op1 = numGroups;
            addInput.dataset.op2 = 2;
            additionEq.appendChild(addInput);
            
            const multiEq = document.createElement('div');
            multiEq.className = 'equation-container';
            multiEq.innerHTML = `${numGroups} · 2 = `;
            const multiInput = createInput(sum);
            multiInput.dataset.operationType = 'multiplication';
            multiInput.dataset.op1 = numGroups;
            multiInput.dataset.op2 = 2;
            multiEq.appendChild(multiInput);
    
            row.appendChild(groupsContainer);
            row.appendChild(additionEq);
            row.appendChild(multiEq);
            containers[1].appendChild(row);
        }
        logNewTask('szamolas-2-vel-osszeadasbol-szorzas', { range: currentMaxResult, tasks: generatedTasks });
    }

    // --- TASK 2: Dominós duplázás ---
    function generateTask2() {
        clearContainerAndFeedback(2);
        const numTasks = 2;
        const generatedTasks = [];
        const usedNs = new Set();
        const maxN = Math.min(10, Math.floor(currentMaxResult / 2));

        if (maxN < numTasks) {
            console.error("Not enough unique variations for Task 2 in the selected range.");
            containers[2].innerHTML = "<p>A választott számkörben nem lehet elég különböző feladatot generálni.</p>";
            return;
        }

        const dotPositions = [
            [], // 0
            [[1, 1]], // 1
            [[0, 0], [2, 2]], // 2
            [[0, 0], [1, 1], [2, 2]], // 3
            [[0, 0], [0, 2], [2, 0], [2, 2]], // 4
            [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]], // 5
            [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]], // 6
            [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 2]], // 7
            [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]], // 8
            [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], // 9
            [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2],[0,1.5]] // 10, not standard domino but will work
        ];
        for(let i=0; i<numTasks; i++) {
            let n;
            do {
                n = getRandomInt(1, maxN);
            } while (usedNs.has(n));
            usedNs.add(n);

            const sum = n * 2;
            generatedTasks.push({ n, sum });

            const row = document.createElement('div');
            row.className = 'task-2-row';

            const domino = document.createElement('div');
            domino.className = 'domino-container';
            
            const half1 = document.createElement('div');
            half1.className = 'domino-half';
            dotPositions[n].forEach(pos => {
                const dot = document.createElement('div');
                dot.className = 'domino-dot';
                dot.style.gridRowStart = pos[0] + 1;
                dot.style.gridColumnStart = pos[1] + 1;
                half1.appendChild(dot);
            });

            const half2 = document.createElement('div');
            half2.className = 'domino-half';
            dotPositions[n].forEach(pos => {
                const dot = document.createElement('div');
                dot.className = 'domino-dot';
                dot.style.gridRowStart = pos[0] + 1;
                dot.style.gridColumnStart = pos[1] + 1;
                half2.appendChild(dot);
            });
            
            domino.appendChild(half1);
            domino.appendChild(half2);

            const eqContainer = document.createElement('div');
            eqContainer.style.display = 'flex';
            eqContainer.style.flexDirection = 'column';
            eqContainer.style.gap = '10px';

            const addEq = document.createElement('div');
            addEq.className = 'equation-container';
            addEq.innerHTML = `${n} + ${n} = `;
            const addInput = createInput(sum);
            addInput.dataset.operationType = 'multiplication';
            addInput.dataset.op1 = 2;
            addInput.dataset.op2 = n;
            addEq.appendChild(addInput);
            
            const multiEq = document.createElement('div');
            multiEq.className = 'equation-container';
            multiEq.innerHTML = `2 · ${n} = `;
            const multiInput = createInput(sum);
            multiInput.dataset.operationType = 'multiplication';
            multiInput.dataset.op1 = 2;
            multiInput.dataset.op2 = n;
            multiEq.appendChild(multiInput);

            eqContainer.appendChild(addEq); 
            eqContainer.appendChild(multiEq);
            row.appendChild(domino);
            row.appendChild(eqContainer);
            containers[2].appendChild(row);
        }
        logNewTask('szamolas-2-vel-domino', { range: currentMaxResult, tasks: generatedTasks });
    }

    // --- TASK 3: Szorzás és osztás gyakorló ---
    function generateTask3() {
        clearContainerAndFeedback(3);
        const numTasks = 6;
        const generatedTasks = [];
        const usedTasks = new Set();
        const maxNum1 = Math.floor(currentMaxResult / 2);
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
    
            const result = num1 * 2;
            const box = document.createElement('div');
            box.className = 'equation-box';
            let task = {};
            let input;

            switch(type) {
                case 1: // n * 2 = ?
                    box.innerHTML = `${num1} · 2 = `;
                    input = createInput(result);
                    input.dataset.operationType = 'multiplication';
                    input.dataset.op1 = num1;
                    input.dataset.op2 = 2;
                    box.appendChild(input);
                    task = { type: 'n*2=?', op1: num1, answer: result};
                    break;
                case 2: // ? * 2 = n
                    input = createInput(num1);
                    input.dataset.operationType = 'division';
                    input.dataset.op1 = result;
                    input.dataset.op2 = 2;
                    box.appendChild(input);
                    box.innerHTML += ` · 2 = ${result}`;
                    task = { type: '?*2=n', op2: result, answer: num1};
                    break;
                case 3: // n : 2 = ?
                    box.innerHTML = `${result} : 2 = `;
                    input = createInput(num1);
                    input.dataset.operationType = 'division';
                    input.dataset.op1 = result;
                    input.dataset.op2 = 2;
                    box.appendChild(input);
                    task = { type: 'n/2=?', op1: result, answer: num1};
                    break;
                case 4: // ? : 2 = n
                    input = createInput(result);
                    input.dataset.operationType = 'multiplication';
                    input.dataset.op1 = num1;
                    input.dataset.op2 = 2;
                    box.appendChild(input);
                    box.innerHTML += ` : 2 = ${num1}`;
                    task = { type: '?/2=n', op2: num1, answer: result};
                    break;
            }
            generatedTasks.push(task);
            containers[3].appendChild(box);
        }
        logNewTask('szamolas-2-vel-egyenletek', { range: currentMaxResult, tasks: generatedTasks });
    }

    // --- TASK 4: Kétszerese és fele ---
    function generateTask4() {
        clearContainerAndFeedback(4);
        const container = containers[4];
        const numTasks = 4;
        const generatedTasks = [];
        const usedNums = new Set();
        const maxNum = Math.floor(currentMaxResult / 2);

        if (maxNum < numTasks) {
            console.error("Not enough unique variations for Task 4 in the selected range.");
            container.innerHTML = "<p>A választott számkörben nem lehet elég különböző feladatot generálni.</p>";
            return;
        }

        for (let i = 0; i < numTasks; i++) {
            let num;
            do {
                num = getRandomInt(1, maxNum);
            } while (usedNums.has(num));
            usedNums.add(num);

            const answer = num * 2;
            
            const item = document.createElement('div');
            item.className = 'task-4-item';

            const numBox = document.createElement('div');
            numBox.className = 'flow-box';
            numBox.textContent = num;

            const arrowsContainer = document.createElement('div');
            arrowsContainer.className = 'flow-arrows-container';
            arrowsContainer.innerHTML = `
                <div class="flow-arrow forward"><span>kétszerese</span></div>
                <div class="flow-arrow backward"><span>fele</span></div>
            `;

            const inputBox = createInput(answer);
            inputBox.dataset.operationType = 'multiplication';
            inputBox.dataset.op1 = num;
            inputBox.dataset.op2 = 2;

            item.appendChild(numBox);
            item.appendChild(arrowsContainer);
            item.appendChild(inputBox);
            
            container.appendChild(item);
            
            generatedTasks.push({ type: 'double-half', num, answer });
        }
        logNewTask('szamolas-2-vel-dupla-fele', { range: currentMaxResult, tasks: generatedTasks });
    }

    // --- TASK 5: Szöveges feladatok ---
    function generateTask5() {
        clearContainerAndFeedback(5);
        const problems = [
            { q: (n, r) => `Annának van ${n} darab 2 forintosa. Hány forintja van összesen?`, type: '*', op1: (n) => n, op2: () => 2 },
            { q: (n, r) => `Peti ${r} ceruzát oszt szét. Mindenki 2-t kap. Hányan kapnak ceruzát?`, type: '/', op1: (n, r) => r, op2: () => 2 },
            { q: (n, r) => `Egy polcon ${n} pár cipő van. Hány darab cipő van a polcon?`, type: '*', op1: (n) => n, op2: () => 2 },
            { q: (n, r) => `Anya ${r} szelet süteményt tett a tálra. A gyerekek mind 2-t ettek. Hány gyerek evett sütit?`, type: '/', op1: (n, r) => r, op2: () => 2 },
        ];
        const selectedProblem = problems[getRandomInt(0, problems.length - 1)];
        const n = getRandomInt(3, Math.floor(currentMaxResult / 2));
        const r = n * 2;

        const wrapper = document.createElement('div');
        wrapper.className = 'word-problem';

        const p = document.createElement('p');
        p.textContent = selectedProblem.q(n, r);

        const solutionContainer = document.createElement('div');
        solutionContainer.className = 'solution-container';
        solutionContainer.innerHTML = 'Megoldás: ';

        const op1 = selectedProblem.op1(n, r);
        const op2 = selectedProblem.op2(n, r);
        const answer = selectedProblem.type === '*' ? op1 * op2 : op1 / op2;
        
        const input1 = createInput(op1);
        const input2 = createInput(op2);
        const inputAnswer = createInput(answer);

        if (selectedProblem.type === '*') {
            input1.dataset.operationType = 'division'; input1.dataset.op1 = answer; input1.dataset.op2 = op2;
            input2.dataset.operationType = 'division'; input2.dataset.op1 = answer; input2.dataset.op2 = op1;
            inputAnswer.dataset.operationType = 'multiplication'; inputAnswer.dataset.op1 = op1; inputAnswer.dataset.op2 = op2;
        } else { // division
            input1.dataset.operationType = 'multiplication'; input1.dataset.op1 = answer; input1.dataset.op2 = op2;
            input2.dataset.operationType = 'division_missing_divisor'; input2.dataset.op1 = op1; input2.dataset.res = answer;
            inputAnswer.dataset.operationType = 'division'; inputAnswer.dataset.op1 = op1; inputAnswer.dataset.op2 = op2;
        }

        solutionContainer.appendChild(input1);
        solutionContainer.innerHTML += ` ${selectedProblem.type === '*' ? '·' : ':'} `;
        solutionContainer.appendChild(input2);
        solutionContainer.innerHTML += ' = ';
        solutionContainer.appendChild(inputAnswer);

        wrapper.appendChild(p);
        wrapper.appendChild(solutionContainer);
        containers[5].appendChild(wrapper);

        logNewTask('szamolas-2-vel-szoveges', { range: currentMaxResult, task: { q: p.textContent, op1, op2, answer } });
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

        if (taskNum === 2) {
            // This task no longer has interactive dominoes, but keeping the block just in case
        }

        setFeedback(taskNum, allCorrect);
        logTaskCheck(`szamolas-2-vel-task${taskNum}`, { correct: allCorrect, solutions: userSolutions });
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
        const op1 = parseInt(input.dataset.op1, 10);
        const op2 = parseInt(input.dataset.op2, 10);
        const res = parseInt(input.dataset.res, 10);
        
        switch(opType) {
            case 'multiplication': // op1 * op2 = ?
                highlightInTable(table, op1, op2, op1 * op2);
                break;
            case 'division': // op1 / op2 = ?
                const quotient = op1 / op2;
                if (Number.isInteger(quotient)) highlightInTable(table, quotient, op2, op1);
                break;
            case 'division_missing_divisor': // op1 / ? = res
                const divisor = op1 / res;
                if (Number.isInteger(divisor)) highlightInTable(table, res, divisor, op1);
                break;
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
            logEvent('MODE_CHANGE', { page: 'szamolas-2-vel', newMode: currentMode });
        });
    });

    for (let i = 1; i <= 5; i++) {
        document.getElementById(`new-task-${i}-button`).addEventListener('click', () => eval(`generateTask${i}()`));
        document.getElementById(`check-${i}-button`).addEventListener('click', () => checkTask(i));
    }

    logTaskEntry('szamolas-2-vel');
    generateAllTables();
    generateAllTasks();
    applyTheme('theme-candy');
});
