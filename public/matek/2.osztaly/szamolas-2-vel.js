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

    let currentMaxResult = 20;

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
        return input;
    }

    // --- TASK 1: Összeadásból szorzás ---
    function generateTask1() {
        clearContainerAndFeedback(1);
        const numTasks = 2;
        const generatedTasks = [];
        for(let i=0; i<numTasks; i++) {
            const numGroups = getRandomInt(2, Math.floor(currentMaxResult / 2));
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
            additionEq.appendChild(createInput(sum));
            
            const multiEq = document.createElement('div');
            multiEq.className = 'equation-container';
            multiEq.innerHTML = `${numGroups} · 2 = `;
            multiEq.appendChild(createInput(sum));

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
        const generatedTasks = [];
        const dotPositions = [
            [], // 0
            [[1, 1]], // 1
            [[0, 0], [2, 2]], // 2
            [[0, 0], [1, 1], [2, 2]], // 3
            [[0, 0], [0, 2], [2, 0], [2, 2]], // 4
            [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]], // 5
            [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]] // 6
        ];
        for(let i=0; i<2; i++) {
            const n = getRandomInt(1, Math.min(6, Math.floor(currentMaxResult / 2)));
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
            const half2 = half1.cloneNode(true);
            domino.appendChild(half1);
            domino.appendChild(half2);

            const eqContainer = document.createElement('div');
            eqContainer.style.display = 'flex';
            eqContainer.style.flexDirection = 'column';
            eqContainer.style.gap = '10px';

            const addEq = document.createElement('div');
            addEq.className = 'equation-container';
            addEq.innerHTML = `${n} + ${n} = `;
            addEq.appendChild(createInput(sum));
            
            const multiEq = document.createElement('div');
            multiEq.className = 'equation-container';
            multiEq.innerHTML = `2 · ${n} = `;
            multiEq.appendChild(createInput(sum));

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
        for(let i=0; i<numTasks; i++) {
            const num1 = getRandomInt(1, Math.floor(currentMaxResult / 2));
            const result = num1 * 2;
            const type = getRandomInt(1, 4);
            const box = document.createElement('div');
            box.className = 'equation-box';
            let task = {};

            switch(type) {
                case 1: // n * 2 = ?
                    box.innerHTML = `${num1} · 2 = `;
                    box.appendChild(createInput(result));
                    task = { type: 'n*2=?', op1: num1, answer: result};
                    break;
                case 2: // ? * 2 = n
                    box.innerHTML = ``;
                    box.appendChild(createInput(num1));
                    box.innerHTML += ` · 2 = ${result}`;
                    task = { type: '?*2=n', op2: result, answer: num1};
                    break;
                case 3: // n / 2 = ?
                    box.innerHTML = `${result} : 2 = `;
                    box.appendChild(createInput(num1));
                    task = { type: 'n/2=?', op1: result, answer: num1};
                    break;
                case 4: // ? / 2 = n
                    box.innerHTML = ``;
                    box.appendChild(createInput(result));
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

        for (let i = 0; i < numTasks; i++) {
            const num = getRandomInt(1, Math.floor(currentMaxResult / 2));
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
        
        solutionContainer.appendChild(createInput(op1));
        solutionContainer.innerHTML += ` ${selectedProblem.type === '*' ? '·' : ':'} `;
        solutionContainer.appendChild(createInput(op2));
        solutionContainer.innerHTML += ' = ';
        solutionContainer.appendChild(createInput(answer));

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

        setFeedback(taskNum, allCorrect);
        logTaskCheck(`szamolas-2-vel-task${taskNum}`, { correct: allCorrect, solutions: userSolutions });
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
        generateAllTasks(); // Regenerate tasks to apply colors (e.g., for domino dots)
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

    for (let i = 1; i <= 5; i++) {
        document.getElementById(`new-task-${i}-button`).addEventListener('click', () => eval(`generateTask${i}()`));
        document.getElementById(`check-${i}-button`).addEventListener('click', () => checkTask(i));
    }

    logTaskEntry('szamolas-2-vel');
    generateAllTasks();
    applyTheme('theme-candy');
});