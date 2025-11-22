document.addEventListener('DOMContentLoaded', () => {
    if (typeof initializeFirebaseAndLogger === 'function') {
        initializeFirebaseAndLogger();
        logTaskEntry('osszeadas-30as-szamkorben');
    }

    const containers = Array.from({ length: 4 }, (_, i) => document.getElementById(`task-${i + 1}-container`));
    const feedbacks = Array.from({ length: 4 }, (_, i) => document.getElementById(`feedback-${i + 1}`));
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = (array) => { array.sort(() => Math.random() - 0.5); return array; };

    function autoFocusNext(event) {
        const target = event.target;
        if (target.value.length >= target.maxLength) {
            const taskWrapper = target.closest('.task');
            const inputs = Array.from(taskWrapper.querySelectorAll('input[type="number"]:not([disabled])'));
            const currentIndex = inputs.indexOf(target);
            if (currentIndex > -1) {
                for (let i = currentIndex + 1; i < inputs.length; i++) {
                    if (inputs[i].value.length < inputs[i].maxLength) {
                        inputs[i].focus();
                        return;
                    }
                }
                for (let i = 0; i < currentIndex; i++) {
                     if (inputs[i].value.length < inputs[i].maxLength) {
                        inputs[i].focus();
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

    const createInput = (correctAnswer, maxLength = 2) => {
        const input = document.createElement('input');
        input.type = 'number';
        input.dataset.answer = correctAnswer;
        input.maxLength = maxLength;
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
            } else if (userAnswer !== correctAnswer) { 
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
            logTaskCheck(`osszeadas-30as-szamkorben-feladat-${taskNum}`, { correct: allCorrect, solutions: userSolutions });
        }
    };

    function generateTask1() {
        clearContainerAndFeedback(1);
        const container = containers[0];
        const problems = [];
        const generatedProblems = new Set();
        
        while (problems.length < 4) {
            const a = getRandomInt(11, 19);
            const b = getRandomInt(2, 9);
            const sum = a + b;
            if (sum > 30 || generatedProblems.has(a)) continue;

            const toTen = 20 - a;
            const remainder = b - toTen;
            
            if (remainder <= 0) continue;

            problems.push({ a, b, toTen, remainder, sum });
            generatedProblems.add(a);
        }

        const col1 = document.createElement('div');
        col1.className = 'equation-column';
        const col2 = document.createElement('div');
        col2.className = 'equation-column';
        
        problems.forEach(p => {
            const box1 = document.createElement('div');
            box1.className = 'equation-box';
            box1.innerHTML = `${p.a} + ${p.toTen} + ${p.remainder} = `;
            box1.appendChild(createInput(p.sum, 2));
            col1.appendChild(box1);

            const box2 = document.createElement('div');
            box2.className = 'equation-box';
            box2.innerHTML = `${p.a} + ${p.b} = `;
            box2.appendChild(createInput(p.sum, 2));
            col2.appendChild(box2);
        });

        container.append(col1, col2);
        if (typeof logNewTask === 'function') {
            logNewTask('osszeadas-30as-szamkorben-feladat-1', { problems });
        }
    }

    function generateTask2() {
        clearContainerAndFeedback(2);
        const container = containers[1];
        const problems = [];
        const generatedStarts = new Set();
        
        while(problems.length < 4) {
            const start = getRandomInt(1, 10);
            if (generatedStarts.has(start)) continue;

            const op1 = getRandomInt(5, 10);
            const res1 = start + op1;
            if (res1 >= 30) continue;

            const op2 = getRandomInt(2, 9);
            const res2 = res1 + op2;
            if (res2 > 30) continue;

            problems.push({ start, op1, res1, op2, res2 });
            generatedStarts.add(start);
        }
        
        problems.forEach(p => {
            const row = document.createElement('div');
            row.className = 'chain-row';
            row.innerHTML = `<span>${p.start}</span><span class="arrow"><span class="operation">+${p.op1}</span>&rarr;</span>`;
            row.appendChild(createInput(p.res1, 2));
            row.innerHTML += `<span class="arrow"><span class="operation">+${p.op2}</span>&rarr;</span>`;
            row.appendChild(createInput(p.res2, 2));
            container.appendChild(row);
        });

        if (typeof logNewTask === 'function') {
            logNewTask('osszeadas-30as-szamkorben-feladat-2', { problems });
        }
    }

    function generateTask3() {
        clearContainerAndFeedback(3);
        const container = containers[2];
        const generatedProblems = new Set();
        const columnTypes = shuffle(['fixedA', 'fixedA', 'fixedC', 'fixedC']);
        const logData = { columns: [] };

        columnTypes.forEach(type => {
            const col = document.createElement('div');
            col.className = 'equation-column';
            const colProblems = [];

            if (type === 'fixedA') {
                let a;
                do {
                    a = getRandomInt(10, 24);
                } while (generatedProblems.has(`fixedA-${a}`));
                generatedProblems.add(`fixedA-${a}`);
                
                const sums = new Set();
                while (sums.size < 4) {
                    const c = getRandomInt(a + 1, 30);
                    sums.add(c);
                }

                Array.from(sums).sort((x, y) => x - y).forEach(c => {
                    const b = c - a;
                    const box = document.createElement('div');
                    box.className = 'equation-box';
                    box.innerHTML = `${a} + `;
                    box.appendChild(createInput(b, 2));
                    box.innerHTML += ` = ${c}`;
                    col.appendChild(box);
                    colProblems.push({ type: 'a+?=c', a, c, solution: b });
                });
            } else { // fixedC
                let c;
                do {
                    c = getRandomInt(20, 30);
                } while (generatedProblems.has(`fixedC-${c}`));
                generatedProblems.add(`fixedC-${c}`);
                
                const addends = new Set();
                while (addends.size < 4) {
                    const a = getRandomInt(1, c - 1);
                    addends.add(a);
                }
                
                Array.from(addends).sort((x, y) => x - y).forEach(a => {
                    const b = c - a;
                    const box = document.createElement('div');
                    box.className = 'equation-box';
                    box.innerHTML = `${c} = `;
                    box.appendChild(createInput(b, 2));
                    box.innerHTML += ` + ${a}`;
                    col.appendChild(box);
                    colProblems.push({ type: 'c=?+a', c, a, solution: b });
                });
            }
            container.appendChild(col);
            logData.columns.push(colProblems);
        });

        if (typeof logNewTask === 'function') {
            logNewTask('osszeadas-30as-szamkorben-feladat-3', logData);
        }
    }

    function generateTask4() {
        clearContainerAndFeedback(4);
        const container = containers[3];
        const targetSum = 30;
        const numCols = 8;
        const gaps = new Map();
        const givenNumbers = new Set();

        while (gaps.size < numCols) {
            const row = getRandomInt(0, 1); // 0 for blue, 1 for red
            const val = getRandomInt(1, targetSum - 1);
            
            if (givenNumbers.has(val)) continue;

            givenNumbers.add(val);
            gaps.set(gaps.size, { row, val });
        }

        const table = document.createElement('table');
        table.className = 'decomposition-table';
        const tbody = document.createElement('tbody');
        
        const rowBlue = document.createElement('tr');
        const rowRed = document.createElement('tr');

        rowBlue.innerHTML = `<td class="icon-cell"><svg viewBox="0 0 20 20" fill="#3b82f6"><rect width="20" height="20" rx="2"></rect></svg></td>`;
        rowRed.innerHTML = `<td class="icon-cell"><svg viewBox="0 0 20 20" fill="#ef4444"><rect width="20" height="20" rx="2"></rect></svg></td>`;

        for(let i = 0; i < numCols; i++) {
            const tdBlue = document.createElement('td');
            const tdRed = document.createElement('td');
            const gap = gaps.get(i);
            const complement = targetSum - gap.val;

            if (gap.row === 0) { // blue is given
                tdBlue.textContent = gap.val;
                tdRed.appendChild(createInput(complement, 2));
            } else { // red is given
                tdBlue.appendChild(createInput(complement, 2));
                tdRed.textContent = gap.val;
            }
            rowBlue.appendChild(tdBlue);
            rowRed.appendChild(tdRed);
        }

        tbody.append(rowBlue, rowRed);
        table.appendChild(tbody);
        container.appendChild(table);

        if (typeof logNewTask === 'function') {
            logNewTask('osszeadas-30as-szamkorben-feladat-4', { target: targetSum, gaps: Array.from(gaps.values()) });
        }
    }


    const taskGenerators = [generateTask1, generateTask2, generateTask3, generateTask4];

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
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`new-task-${i}-button`).addEventListener('click', taskGenerators[i - 1]);
            document.getElementById(`check-${i}-button`).addEventListener('click', () => checkTaskGeneric(i));
        }
    }

    setupControls();
    generateAllTasks();
    document.querySelector('.theme-button[data-theme="theme-candy"]').classList.add('active');
});
