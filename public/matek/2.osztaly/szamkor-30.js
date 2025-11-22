document.addEventListener('DOMContentLoaded', () => {
    if (typeof initializeFirebaseAndLogger === 'function') {
        initializeFirebaseAndLogger();
        logTaskEntry('szamkor-30');
    }

    const containers = Array.from({ length: 6 }, (_, i) => document.getElementById(`task-${i + 1}-container`));
    const feedbacks = Array.from({ length: 6 }, (_, i) => document.getElementById(`feedback-${i + 1}`));
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = (array) => { array.sort(() => Math.random() - 0.5); return array; };

    function autoFocusNext(event) {
        const target = event.target;
        const correctAnswer = target.dataset.answer;

        if (correctAnswer && target.value.length >= correctAnswer.length) {
            const taskWrapper = target.closest('.task');
            if (!taskWrapper) return;

            const taskId = taskWrapper.id;
            let inputs;

            // Default: get inputs in document order.
            let allInputs = Array.from(taskWrapper.querySelectorAll('input[type="number"]:not([disabled])'));

            if (taskId === 'task-2-wrapper') {
                // For task 2, order inputs by columns first, then rows.
                const columns = Array.from(taskWrapper.querySelectorAll('.equation-column'));
                const sortedInputs = [];
                columns.forEach(column => {
                    const columnInputs = Array.from(column.querySelectorAll('input[type="number"]:not([disabled])'));
                    sortedInputs.push(...columnInputs);
                });
                inputs = sortedInputs;
            } else if (taskId === 'task-5-wrapper') {
                // For task 5, order inputs by columns first, then rows in the table.
                const table = taskWrapper.querySelector('table.number-table');
                if (table) {
                    const inputPositions = allInputs.map(input => {
                        const cell = input.closest('td');
                        return {
                            input: input,
                            rowIndex: cell.parentElement.rowIndex,
                            cellIndex: cell.cellIndex
                        };
                    });
                    
                    inputPositions.sort((a, b) => {
                        if (a.cellIndex !== b.cellIndex) {
                            return a.cellIndex - b.cellIndex;
                        }
                        return a.rowIndex - b.rowIndex;
                    });
                    inputs = inputPositions.map(pos => pos.input);
                } else {
                    inputs = allInputs;
                }
            } else {
                inputs = allInputs;
            }

            const currentIndex = inputs.indexOf(target);

            if (currentIndex > -1) {
                // Find the next input that is not yet filled correctly.
                for (let i = currentIndex + 1; i < inputs.length; i++) {
                    const nextInput = inputs[i];
                    const nextAnswer = nextInput.dataset.answer;
                    if (nextAnswer && nextInput.value.length < nextAnswer.length) {
                        nextInput.focus();
                        return; // Stop after focusing the first available input.
                    }
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

    function drawTask1Markers(isChecking = false) {
        const taskContainer = containers[0];
        const svg = taskContainer.querySelector('.number-line-svg');
        if (!svg) return;

        svg.querySelectorAll('.result-marker').forEach(marker => marker.remove());
        const svgNS = "http://www.w3.org/2000/svg";

        taskContainer.querySelectorAll('.equation-card input').forEach(input => {
            const userAnswer = parseInt(input.value.trim(), 10);

            if (!isNaN(userAnswer) && userAnswer >= 10 && userAnswer <= 30) {
                let color = 'var(--text-color, black)'; // Neutral color
                if (isChecking) {
                    const correctAnswer = parseInt(input.dataset.answer, 10);
                    const isCorrect = userAnswer === correctAnswer;
                    color = isCorrect ? '#28a745' : '#dc3545';
                }
                const x = 10 + (userAnswer - 10) * 38;

                const circle = document.createElementNS(svgNS, "circle");
                circle.setAttribute('class', 'result-marker');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', '30');
                circle.setAttribute('r', '5');
                circle.setAttribute('fill', color);
                svg.appendChild(circle);
            }
        });
    }

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
            if (userAnswer === '') { hasEmpty = true; allCorrect = false; } 
            else if (userAnswer !== correctAnswer) { input.classList.add('incorrect'); allCorrect = false; }
            else { input.classList.add('correct'); }
        });

        if (hasEmpty) { 
            feedbackEl.textContent = 'Kérlek, tölts ki minden mezőt!'; 
            feedbackEl.className = 'feedback incorrect'; 
        } else if (allCorrect) { 
            feedbackEl.textContent = hadContent && !wasAllCorrect ? 'Javítás sikeres! Most már minden helyes!' : 'Nagyszerű! Minden helyes!'; 
            feedbackEl.className = 'feedback correct'; 
        } else { 
            feedbackEl.textContent = hadContent ? 'A javítások után is maradt még hiba.' : 'Van néhány hiba. Nézd át a pirossal jelölt mezőket!'; 
            feedbackEl.className = 'feedback incorrect'; 
        }
        
        if (taskNum === 1) {
            drawTask1Markers(true);
        }
        
        if (typeof logTaskCheck === 'function') {
            logTaskCheck(`szamkor-30-feladat-${taskNum}`, { correct: allCorrect, solutions: userSolutions });
        }
    };

    function generateTask1() {
        clearContainerAndFeedback(1);
        const container = containers[0];
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 800 70");
        svg.setAttribute("class", "number-line-svg");
        let line = document.createElementNS(svgNS, "line");
        Object.entries({x1:"10", y1:"40", x2:"790", y2:"40", class:"axis"}).forEach(([k,v])=>line.setAttribute(k,v));
        svg.appendChild(line);
        for (let i = 10; i <= 30; i++) {
            const x = 10 + (i - 10) * 38;
            let tick = document.createElementNS(svgNS, "line");
            Object.entries({x1:x, y1:"35", x2:x, y2:"45", class:"tick"}).forEach(([k,v])=>tick.setAttribute(k,v));
            svg.appendChild(tick);
            let text = document.createElementNS(svgNS, "text");
            Object.entries({x:x, y:"60", class:"number-text"}).forEach(([k,v])=>text.setAttribute(k,v));
            text.textContent = i;
            svg.appendChild(text);
        }
        container.appendChild(svg);
        const cardsWrapper = document.createElement('div');
        cardsWrapper.className = 'cards-wrapper';
        const problems = shuffle([1,2,3,4,5,6,7,8,9,10]).slice(0, 8);
        problems.sort((a,b) => a - b);
        problems.forEach(p => {
            const card = document.createElement('div');
            card.className = 'equation-card';
            card.innerHTML = `20 + ${p} = `;
            const input = createInput(20 + p, 2);
            input.addEventListener('blur', () => drawTask1Markers(false));
            card.appendChild(input);
            cardsWrapper.appendChild(card);
        });
        container.appendChild(cardsWrapper);
        if (typeof logNewTask === 'function') {
            logNewTask('szamkor-30-feladat-1', { problems });
        }
    }

    function generateTask2() {
        clearContainerAndFeedback(2);
        const container = containers[1];
        const bases = shuffle(Array.from({length: 9}, (_, i) => i + 1)).slice(0, 2);
        bases.forEach(base => {
            const col = document.createElement('div');
            col.className = 'equation-column';
            [0, 1, 2].forEach(m => {
                const num = m * 10 + base;
                if (num === 0 || num > 30) return;
                const box = document.createElement('div');
                box.className = 'equation-box';
                box.innerHTML = `<span>${num}</span> = `;
                box.appendChild(createInput(Math.floor(num / 10), 1));
                box.innerHTML += ' tízes ';
                box.appendChild(createInput(num % 10, 1));
                box.innerHTML += ' egyes';
                col.appendChild(box);
            });
            container.appendChild(col);
        });
        if (typeof logNewTask === 'function') {
            logNewTask('szamkor-30-feladat-2', { bases });
        }
    }

    function generateTask3() {
        clearContainerAndFeedback(3);
        const container = containers[2];
        const generatedProblems = new Set();
        const problems = [];

        while (problems.length < 2) {
            let p;
            if (problems.length === 0) { // First problem: a < 10
                const a = getRandomInt(5, 9);
                const b = getRandomInt(11 - a, 9);
                p = { a, b };
            } else { // Second problem: a > 10, crossing 20
                const a = getRandomInt(15, 19);
                const b = getRandomInt(21 - a, 9);
                p = { a, b };
            }
            
            const problemKey = `${p.a},${p.b}`;
            if (generatedProblems.has(problemKey)) continue;
            
            p.toTen = 10 - (p.a % 10);
            p.rem = p.b - p.toTen;
            p.sum = p.a + p.b;

            problems.push(p);
            generatedProblems.add(problemKey);
        }

        problems.forEach(p => {
            const taskEl = document.createElement('div');
            taskEl.className = 'decomposition-task';
            const balls = document.createElement('div');
            balls.className = 'ball-container';

            let a_rem = p.a;
            let isFirstABall = true;
            // Full rows of 10 for 'a'
            while (a_rem >= 10) {
                const row = document.createElement('div');
                row.className = 'ball-row';
                for (let i = 0; i < 10; i++) {
                    const numberInBall = isFirstABall && i === 0 ? p.a : '';
                    row.innerHTML += `<div class="ball" style="background-color: var(--ball-color-1, red);">${numberInBall}</div>`;
                }
                isFirstABall = false;
                balls.appendChild(row);
                a_rem -= 10;
            }

            // The row where we cross the ten
            if (a_rem > 0 || p.toTen > 0) {
                const crossRow = document.createElement('div');
                crossRow.className = 'ball-row';
                // Remaining balls for 'a'
                for (let i = 0; i < a_rem; i++) {
                    const numberInBall = isFirstABall && i === 0 ? p.a : '';
                    crossRow.innerHTML += `<div class="ball" style="background-color: var(--ball-color-1, red);">${numberInBall}</div>`;
                }
                // Balls from 'b' to complete the ten
                for (let i = 0; i < p.toTen; i++) {
                    const numberInBall = i === 0 ? p.toTen : '';
                    crossRow.innerHTML += `<div class="ball" style="background-color: var(--ball-color-2, blue);">${numberInBall}</div>`;
                }
                balls.appendChild(crossRow);
            }

            // Remaining balls from 'b'
            let b_rem_after_cross = p.rem;
            let isFirstRemBall = true;
            while(b_rem_after_cross > 0) {
                const remRow = document.createElement('div');
                remRow.className = 'ball-row';
                const countInRow = Math.min(b_rem_after_cross, 10);
                for (let i = 0; i < countInRow; i++) {
                    const numberInBall = isFirstRemBall && i === 0 ? p.rem : '';
                    remRow.innerHTML += `<div class="ball" style="background-color: var(--ball-color-2, blue);">${numberInBall}</div>`;
                }
                isFirstRemBall = false;
                balls.appendChild(remRow);
                b_rem_after_cross -= countInRow;
            }
            
            const steps = document.createElement('div');
            steps.className = 'decomposition-steps';
            
            const eqBox1 = document.createElement('div');
            eqBox1.className = 'equation-box';
            eqBox1.append(`${p.a} + ${p.b} = `);
            eqBox1.appendChild(createInput(p.sum, 2));

            const eqBox2 = document.createElement('div');
            eqBox2.className = 'equation-box';
            eqBox2.append(`${p.a} + `);
            eqBox2.appendChild(createInput(p.toTen, 1));
            eqBox2.append(` + `);
            eqBox2.appendChild(createInput(p.rem, 1));
            eqBox2.append(` = `);
            eqBox2.appendChild(createInput(p.sum, 2));
            
            steps.append(eqBox1, eqBox2);
            taskEl.append(balls, steps);
            container.appendChild(taskEl);
        });
        if (typeof logNewTask === 'function') {
            logNewTask('szamkor-30-feladat-3', { problems });
        }
    }

    function generateTask4() {
        clearContainerAndFeedback(4);
        const container = containers[3];
        const types = shuffle([{ type: 'egyes', count: 2 }, { type: 'tízes', count: 2 }]);
        const generatedNumbers = new Set();

        types.forEach(({ type, count }) => {
            for (let i = 0; i < count; i++) {
                let num;
                do {
                    if (type === 'egyes') {
                        num = getRandomInt(1, 29);
                    } else { // tízes
                        num = getRandomInt(10, 29);
                    }
                } while (generatedNumbers.has(num));
                generatedNumbers.add(num);

                const wrapper = document.createElement('div');
                wrapper.className = 'neighbor-grid-wrapper';
                wrapper.innerHTML = `<h4>${type.charAt(0).toUpperCase() + type.slice(1)} szomszéd</h4>`;
                const grid = document.createElement('div');
                grid.className = 'neighbor-grid';
                
                let lowerNeighbor, upperNeighbor;
                if (type === 'egyes') {
                    lowerNeighbor = num - 1;
                    upperNeighbor = num + 1;
                } else { // tízes
                    if (num % 10 === 0) {
                        lowerNeighbor = num - 10;
                        upperNeighbor = num + 10;
                    } else {
                        lowerNeighbor = Math.floor(num / 10) * 10;
                        upperNeighbor = (Math.floor(num / 10) + 1) * 10;
                    }
                }

                const cell1 = document.createElement('div');
                cell1.className = 'neighbor-grid-cell';
                cell1.appendChild(createInput(lowerNeighbor, 2));

                const cell2 = document.createElement('div');
                cell2.className = 'neighbor-grid-cell given';
                cell2.textContent = num;

                const cell3 = document.createElement('div');
                cell3.className = 'neighbor-grid-cell';
                cell3.appendChild(createInput(upperNeighbor, 2));

                grid.append(cell1, cell2, cell3);
                wrapper.appendChild(grid);
                container.appendChild(wrapper);
            }
        });
        if (typeof logNewTask === 'function') {
            logNewTask('szamkor-30-feladat-4', { numbers: [...generatedNumbers] });
        }
    }

    function generateTask5() {
        clearContainerAndFeedback(5);
        const container = containers[4];
        const table = document.createElement('table');
        table.className = 'number-table';
        const gaps = new Set(shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, 10));
        for(let r=0; r<3; r++) {
            const row = table.insertRow();
            for(let c=1; c<=10; c++) {
                const cell = row.insertCell();
                const num = r * 10 + c;
                if (gaps.has(num)) {
                    cell.appendChild(createInput(num, 2));
                } else {
                    cell.textContent = num;
                }
            }
        }
        container.appendChild(table);
        if (typeof logNewTask === 'function') {
            logNewTask('szamkor-30-feladat-5', { gaps: [...gaps] });
        }
    }

    function generateTask6() {
        clearContainerAndFeedback(6);
        const container = containers[5];
        
        let num1, num2;
        do {
            num1 = getRandomInt(11, 19);
            num2 = getRandomInt(11, 19);
        } while (num1 + num2 > 30);

        const sum = num1 + num2;
        const tens = 10;
        const ones = num2 % 10;
        
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 800 100"); svg.setAttribute("class", "number-line-svg");
        svg.innerHTML = `<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" /></marker></defs>`;
        let line = document.createElementNS(svgNS, "line");
        Object.entries({x1:"10", y1:"70", x2:"790", y2:"70", class:"axis"}).forEach(([k,v])=>line.setAttribute(k,v));
        svg.appendChild(line);
        for (let i = 10; i <= 30; i++) {
            const x = 10 + (i - 10) * 38;
            let tick = document.createElementNS(svgNS, "line"); Object.entries({x1:x, y1:"65", x2:x, y2:"75", class:"tick"}).forEach(([k,v])=>tick.setAttribute(k,v)); svg.appendChild(tick);
            let text = document.createElementNS(svgNS, "text"); Object.entries({x:x, y:"90", class:"number-text"}).forEach(([k,v])=>text.setAttribute(k,v)); text.textContent = i; svg.appendChild(text);
        }
        const createArc = (from, to, y, color) => {
            const path = document.createElementNS(svgNS, "path");
            const x1 = 10 + (from - 10) * 38, x2 = 10 + (to - 10) * 38;
            path.setAttribute("d", `M ${x1} ${y} C ${x1} ${y-20}, ${x2} ${y-20}, ${x2} ${y}`);
            path.setAttribute("class", "arrow"); path.style.stroke = color;
            return path;
        };
        const createArcLabel = (from, to, y, labelText) => {
            const text = document.createElementNS(svgNS, "text");
            const x1 = 10 + (from - 10) * 38;
            const x2 = 10 + (to - 10) * 38;
            text.setAttribute('x', (x1 + x2) / 2);
            text.setAttribute('y', y - 30);
            text.setAttribute('class', 'arrow-label');
            text.textContent = labelText;
            return text;
        }

        svg.appendChild(createArc(num1, num1 + tens, 70, 'blue'));
        svg.appendChild(createArcLabel(num1, num1 + tens, 70, `+${tens}`));

        svg.appendChild(createArc(num1 + tens, sum, 70, 'red'));
        if (ones > 0) {
            svg.appendChild(createArcLabel(num1 + tens, sum, 70, `+${ones}`));
        }

        const stepsWrapper = document.createElement('div');
        stepsWrapper.className = 'decomposition-steps';

        const eqBox1 = document.createElement('div');
        eqBox1.className = 'equation-box';
        eqBox1.append(`${num1} + ${num2} = `);
        eqBox1.appendChild(createInput(sum, 2));

        const eqBox2 = document.createElement('div');
        eqBox2.className = 'equation-box';
        eqBox2.append(`${num1} + `);
        eqBox2.appendChild(createInput(tens, 2));
        eqBox2.append(` + `);
        eqBox2.appendChild(createInput(ones, 1));
        eqBox2.append(` = `);
        eqBox2.appendChild(createInput(sum, 2));

        stepsWrapper.append(eqBox1, eqBox2);
        container.append(svg, stepsWrapper);

        if (typeof logNewTask === 'function') {
            logNewTask('szamkor-30-feladat-6', { num1, num2 });
        }
    }

    const taskGenerators = [generateTask1, generateTask2, generateTask3, generateTask4, generateTask5, generateTask6];

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
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`new-task-${i}-button`).addEventListener('click', taskGenerators[i - 1]);
            document.getElementById(`check-${i}-button`).addEventListener('click', () => checkTaskGeneric(i));
        }
    }

    setupControls();
    generateAllTasks();
    document.querySelector('.theme-button[data-theme="theme-candy"]').classList.add('active');
});
