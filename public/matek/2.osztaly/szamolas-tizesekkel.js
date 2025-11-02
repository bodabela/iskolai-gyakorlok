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

    // Helper functions
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    
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

    const createInput = (correctAnswer) => {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.dataset.answer = correctAnswer;
        input.setAttribute('maxlength', String(correctAnswer).length);
        input.addEventListener('input', autoFocusNext);
        return input;
    };

    const clearContainerAndFeedback = (taskNum) => {
        containers[taskNum].innerHTML = '';
        feedbacks[taskNum].textContent = '';
        feedbacks[taskNum].className = 'feedback';
    };

    const checkTaskGeneric = (taskNum) => {
        const taskContainer = containers[taskNum];
        const inputs = taskContainer.querySelectorAll('input[type="number"]');
        let allCorrect = true;
        const userSolutions = [];

        inputs.forEach(input => {
            input.classList.remove('correct', 'incorrect');
            const userAnswer = parseInt(input.value, 10);
            const correctAnswer = parseInt(input.dataset.answer, 10);
            userSolutions.push({ provided: isNaN(userAnswer) ? null : userAnswer, expected: correctAnswer });

            if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
                input.classList.add('incorrect');
                allCorrect = false;
            } else {
                input.classList.add('correct');
            }
        });

        const feedbackEl = feedbacks[taskNum];
        if (allCorrect) {
            feedbackEl.textContent = 'Nagyszerű! Minden helyes!';
            feedbackEl.className = 'feedback correct';
        } else {
            feedbackEl.textContent = 'Van néhány hiba. Nézd át a pirossal jelölt mezőket!';
            feedbackEl.className = 'feedback incorrect';
        }
        logTaskCheck(`szamolas-tizesekkel-${taskNum}`, { correct: allCorrect, solutions: userSolutions });
    };

    // --- Task 1: Számegyenes és szomszédok ---
    function generateTask1() {
        clearContainerAndFeedback(1);
        const container = containers[1];
        const logData = {};

        // a) Számegyenes
        const nlContainer = document.createElement('div');
        nlContainer.className = 'number-line-container';
        nlContainer.innerHTML = '<h4>a) Írd a számegyenes alá a megfelelő számokat!</h4>';
        const nl = document.createElement('div');
        nl.className = 'number-line';
        const gaps = shuffle([2, 4, 6, 8]).slice(0, 2); // 2 random gap
        for(let i=0; i<=10; i++) {
            const tick = document.createElement('div');
            tick.className = 'number-line-tick';
            const num = i * 10;
            if (gaps.includes(i) || (i > 0 && i < 10 && [0, 1, 3, 5, 7, 9, 10].includes(i) && Math.random() > 0.5)) { // more gaps
                 tick.appendChild(createInput(num));
            } else {
                 tick.innerHTML += `<span>${num}</span>`;
            }
            nl.appendChild(tick);
        }
        nlContainer.appendChild(nl);
        container.appendChild(nlContainer);

        // b) Számsor
        const countContainer = document.createElement('div');
        countContainer.className = 'counting-container';
        countContainer.innerHTML = '<h4>b) Számolj tízesével 100-tól 0-ig!</h4>';
        const countRow = document.createElement('div');
        countRow.className = 'counting-row';
        for (let i = 10; i >= 0; i--) {
            countRow.appendChild(createInput(i*10));
        }
        countContainer.appendChild(countRow);
        container.appendChild(countContainer);

        // c) Szomszédok
        const neighborsContainer = document.createElement('div');
        neighborsContainer.className = 'neighbors-container';
        neighborsContainer.innerHTML = '<h4>c) Pótold a számok tízes szomszédjait!</h4>';
        const neighborsGrid = document.createElement('div');
        neighborsGrid.className = 'neighbors-grid';
        const nums = shuffle([10, 20, 30, 40, 50, 60, 70, 80, 90]).slice(0, 4);
        logData.neighbors = nums;
        nums.forEach(n => {
            const box = document.createElement('div');
            box.className = 'equation-box';
            box.appendChild(createInput(n - 10));
            box.innerHTML += ` &lt; ${n} &lt; `;
            box.appendChild(createInput(n + 10));
            neighborsGrid.appendChild(box);
        });
        neighborsContainer.appendChild(neighborsGrid);
        container.appendChild(neighborsContainer);
        logNewTask('szamolas-tizesekkel-1', logData);
    }

    // --- Task 2: Kivonások ---
    function generateTask2() {
        clearContainerAndFeedback(2);
        const container = containers[2];
        const minuends = [50, 70, 80, 90, 60, 40];
        const usedProblems = new Set();
        const logData = { columns: [] };

        for(let i = 0; i < 3; i++) {
            const col = document.createElement('div');
            col.className = 'equation-column';
            const minuend = minuends[i];
            const subtrahends = [];
            for (let j = 1; j * 10 < minuend; j++) {
                subtrahends.push(j * 10);
            }
            const problems = [];
            shuffle(subtrahends).slice(0, 4).forEach(s => {
                const result = minuend - s;
                const key = `${minuend}-${s}`;
                if (!usedProblems.has(key)) {
                    const box = document.createElement('div');
                    box.className = 'equation-box';
                    box.innerHTML = `${minuend} - ${s} = `;
                    box.appendChild(createInput(result));
                    col.appendChild(box);
                    usedProblems.add(key);
                    problems.push({minuend, subtrahend: s, result});
                }
            });
            container.appendChild(col);
            logData.columns.push(problems);
        }
        logNewTask('szamolas-tizesekkel-2', logData);
    }

    // --- Task 3: Összeadások ---
    function generateTask3() {
        clearContainerAndFeedback(3);
        const container = containers[3];
        const numberSets = [[10, 20, 30], [20, 30, 40]];
        const logData = { sets: [] };

        numberSets.forEach(set => {
            const col = document.createElement('div');
            col.className = 'equation-column';
            const sum = set.reduce((a, b) => a + b, 0);
            const logSet = { set, sum, permutations: [] };
            for(let i=0; i<4; i++) {
                const shuffledSet = shuffle([...set]);
                const box = document.createElement('div');
                box.className = 'equation-box';
                box.innerHTML = `${shuffledSet[0]} + ${shuffledSet[1]} + ${shuffledSet[2]} = `;
                box.appendChild(createInput(sum));
                col.appendChild(box);
                logSet.permutations.push(shuffledSet);
            }
            container.appendChild(col);
            logData.sets.push(logSet);
        });
        logNewTask('szamolas-tizesekkel-3', logData);
    }

    // --- Task 4: Bontsd a 100-at! ---
    function generateTask4() {
        clearContainerAndFeedback(4);
        const container = containers[4];
        container.className = 'equation-column-container'; // Use existing styles for columns

        const numbers = shuffle([10, 20, 30, 40, 50, 60, 70, 80, 90]).slice(0, 6);
        const logData = { problems: [] };

        const columns = [document.createElement('div'), document.createElement('div')];
        columns.forEach(c => {
            c.className = 'equation-column';
            container.appendChild(c);
        });

        numbers.forEach((num, index) => {
            const box = document.createElement('div');
            box.className = 'equation-box';

            const complement = 100 - num;
            
            if (Math.random() > 0.5) {
                // num + [input] = 100
                box.innerHTML = `${num} + `;
                box.appendChild(createInput(complement));
                box.innerHTML += ` = 100`;
                logData.problems.push({ given: num, missing: complement });
            } else {
                // [input] + num = 100
                box.appendChild(createInput(num));
                box.innerHTML += ` + ${complement} = 100`;
                logData.problems.push({ given: complement, missing: num });
            }
            
            columns[index % 2].appendChild(box);
        });

        logNewTask('szamolas-tizesekkel-4', logData);
    }

    // --- Task 5: Összeadási minták ---
    function generateTask5() {
        clearContainerAndFeedback(5);
        const container = containers[5];
        const logData = { columns: [] };
        const patterns = [
            { base: 10, type: 'add' },
            { base: 20, type: 'add' },
            { base: 30, type: 'missing_addend' }
        ];
        
        patterns.forEach(pattern => {
            const col = document.createElement('div');
            col.className = 'equation-column';
            const logCol = { pattern, problems: [] };
            const addends = shuffle([10, 20, 30, 40, 50, 60, 70]).slice(0, 4);

            addends.forEach(addend => {
                if (pattern.base + addend > 100) return;
                const box = document.createElement('div');
                box.className = 'equation-box';
                const sum = pattern.base + addend;

                if (pattern.type === 'add') {
                    box.innerHTML = `${pattern.base} + ${addend} = `;
                    box.appendChild(createInput(sum));
                    logCol.problems.push({ p: `${pattern.base} + ${addend}`, a: sum });
                } else { // missing_addend
                    box.innerHTML = `${pattern.base} + `;
                    box.appendChild(createInput(addend));
                    box.innerHTML += ` = ${sum}`;
                    logCol.problems.push({ p: `${pattern.base} + ? = ${sum}`, a: addend });
                }
                col.appendChild(box);
            });
            container.appendChild(col);
            logData.columns.push(logCol);
        });
        logNewTask('szamolas-tizesekkel-5', logData);
    }

    // --- Main Logic ---
    function generateAllTasks() {
        generateTask1();
        generateTask2();
        generateTask3();
        generateTask4();
        generateTask5();
    }

    function applyTheme(themeClass) {
        bodyEl.className = '';
        bodyEl.classList.add(themeClass);
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeClass);
        });
    }

    function setupControls() {
        themeButtons.forEach(button => {
            button.addEventListener('click', () => applyTheme(button.dataset.theme));
        });

        for (let i = 1; i <= 5; i++) {
            document.getElementById(`new-task-${i}-button`).addEventListener('click', () => eval(`generateTask${i}()`));
            document.getElementById(`check-${i}-button`).addEventListener('click', () => checkTaskGeneric(i));
        }
    }

    logTaskEntry('szamolas-tizesekkel');
    setupControls();
    generateAllTasks();
    applyTheme('theme-candy');
});