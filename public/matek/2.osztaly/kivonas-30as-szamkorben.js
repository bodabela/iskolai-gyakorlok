document.addEventListener('DOMContentLoaded', () => {
    if (typeof initializeFirebaseAndLogger === 'function') {
        initializeFirebaseAndLogger();
        logTaskEntry('kivonas-30as-szamkorben');
    }

    const taskCount = 7;
    const containers = Array.from({ length: taskCount }, (_, i) => document.getElementById(`task-${i + 1}-container`));
    const feedbacks = Array.from({ length: taskCount }, (_, i) => document.getElementById(`feedback-${i + 1}`));
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

            const inputs = Array.from(taskWrapper.querySelectorAll('input[type="number"]:not([disabled])'));
            const currentIndex = inputs.indexOf(target);

            if (currentIndex > -1) {
                for (let i = currentIndex + 1; i < inputs.length; i++) {
                    const nextInput = inputs[i];
                    const nextAnswer = nextInput.dataset.answer;
                    if (nextAnswer && nextInput.value.length < nextAnswer.length) {
                        nextInput.focus();
                        return;
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
        
        if (typeof logTaskCheck === 'function') {
            logTaskCheck(`kivonas-30as-szamkorben-feladat-${taskNum}`, { correct: allCorrect, solutions: userSolutions });
        }
    };

    // --- TASK GENERATORS ---

    function generateTask1() {
        clearContainerAndFeedback(1);
        const container = containers[0];
        const minuends = shuffle([24, 23, 21, 18]);
        const columnsData = [];

        for (let i = 0; i < 4; i++) {
            const a = minuends[i];
            const type = getRandomInt(1, 2);
            const columnProblems = [];
            let b_start = getRandomInt(4, 9);

            let attempts = 0;
            while(columnProblems.length < 4 && attempts < 20) {
                columnProblems.length = 0; // reset for new attempt
                b_start = getRandomInt(4, 9);
                for (let j = 0; j < 4; j++) {
                    const b = b_start - j;
                    if (b > 0 && a - b >= 0) {
                        columnProblems.push({ a, b, c: a - b, type });
                    } else {
                        break; // Stop if b or result is invalid
                    }
                }
                attempts++;
            }

            if (columnProblems.length >= 4) {
                 columnsData.push(columnProblems.slice(0, 4));
            }
        }

        columnsData.forEach(columnProblems => {
            const colDiv = document.createElement('div');
            colDiv.className = 'equation-column';
            columnProblems.forEach(p => {
                const box = document.createElement('div');
                box.className = 'equation-box';
                if (p.type === 1) { // A - ? = C
                    box.append(`${p.a} - `, createInput(String(p.b), 1), ` = ${p.c}`);
                } else { // ? = A - B
                    box.append(createInput(String(p.c), 2), ` = ${p.a} - ${p.b}`);
                }
                colDiv.appendChild(box);
            });
            container.appendChild(colDiv);
        });

        if (typeof logNewTask === 'function') { logNewTask('kivonas-30as-szamkorben-feladat-1', { problems: columnsData.flat() }); }
    }

    function generateTask2() {
        clearContainerAndFeedback(2);
        const container = containers[1];
        const problems = [];
        const usedStarts = new Set();
        
        while (problems.length < 2) {
            const start = getRandomInt(18, 29);
            if (usedStarts.has(start)) continue;
            
            const firstJump = getRandomInt(2, 8);
            const secondJump = getRandomInt(2, 8);
            const end = start - firstJump - secondJump;
            
            if (end < 10 || (firstJump + secondJump) > 15) continue;
            
            usedStarts.add(start);
            problems.push({ start, firstJump, secondJump, end, totalSub: firstJump + secondJump });
        }

        problems.forEach(p => {
            const taskEl = document.createElement('div');
            taskEl.className = 'decomposition-task';
            
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("viewBox", "0 0 800 100"); 
            svg.setAttribute("class", "number-line-svg");
            svg.innerHTML = `<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto-start-reverse"><polygon points="0 0, 8 3, 0 6" /></marker></defs>`;
            
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
                path.setAttribute("class", "arrow");
                path.setAttribute("stroke", color);
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

            svg.appendChild(createArc(p.start, p.start - p.firstJump, 70, 'blue'));
            svg.appendChild(createArcLabel(p.start, p.start - p.firstJump, 70, `-${p.firstJump}`));
            
            svg.appendChild(createArc(p.start - p.firstJump, p.end, 70, 'red'));
            svg.appendChild(createArcLabel(p.start - p.firstJump, p.end, 70, `-${p.secondJump}`));

            const stepsWrapper = document.createElement('div');
            stepsWrapper.className = 'decomposition-steps';

            const eqBoxTotal = document.createElement('div');
            eqBoxTotal.className = 'equation-box';
            eqBoxTotal.append(`${p.start} - ${p.totalSub} = `, createInput(String(p.end), 2));

            const eqBoxDecomp = document.createElement('div');
            eqBoxDecomp.className = 'equation-box';
            eqBoxDecomp.append(`${p.start} - `, createInput(String(p.firstJump), 1), ` - `, createInput(String(p.secondJump), 1), ` = `, createInput(String(p.end), 2));

            stepsWrapper.append(eqBoxTotal, eqBoxDecomp);
            taskEl.append(svg, stepsWrapper);
            container.appendChild(taskEl);
        });

        if (typeof logNewTask === 'function') { logNewTask('kivonas-30as-szamkorben-feladat-2', { problems }); }
    }

    function generateTask3() {
        clearContainerAndFeedback(3);
        const container = containers[2];
        const problems = new Set();
        const columnsData = [[], [], [], []];

        for (let i = 0; i < 4; i++) {
            let p1, p2;
            do {
                const a = getRandomInt(21, 29);
                const b = getRandomInt(1, Math.min(8, (a % 10) - 1));
                const c = getRandomInt(1, (a % 10) - b);
                const d = getRandomInt(b + 1, 9);
                p1 = { type: 1, a, b, c, result: a - b - c };
                p2 = { type: 2, a: a, b: d, result: a - d };
            } while (p1.b + p1.c >= 10 || problems.has(`${p1.a}-${p1.b}-${p1.c}`) || problems.has(`${p2.a}-${p2.b}`));
            problems.add(`${p1.a}-${p1.b}-${p1.c}`);
            problems.add(`${p2.a}-${p2.b}`);
            columnsData[0].push(p1);
            columnsData[1].push(p2);

            let p3, p4;
             do {
                const a = getRandomInt(21, 29);
                const b = getRandomInt(1, 5);
                const c = getRandomInt(1, 4);
                const d = b+c;
                p3 = { type: 3, a, b, c, result: a - b - c };
                p4 = { type: 4, a: a, b: d, result: a - d };
            } while (problems.has(`=${p3.a}-${p3.b}-${p3.c}`) || problems.has(`=${p4.a}-${p4.b}`));
            problems.add(`=${p3.a}-${p3.b}-${p3.c}`);
            problems.add(`=${p4.a}-${p4.b}`);
            columnsData[2].push(p3);
            columnsData[3].push(p4);
        }

        columnsData.forEach(columnProblems => {
            const colDiv = document.createElement('div');
            colDiv.className = 'equation-column';
            shuffle(columnProblems).forEach(p => {
                const box = document.createElement('div');
                box.className = 'equation-box';
                if (p.type === 1) box.append(`${p.a} - ${p.b} - ${p.c} = `, createInput(String(p.result)));
                if (p.type === 2) box.append(`${p.a} - ${p.b} = `, createInput(String(p.result)));
                if (p.type === 3) box.append(createInput(String(p.result)), ` = ${p.a} - ${p.b} - ${p.c}`);
                if (p.type === 4) box.append(createInput(String(p.result)), ` = ${p.a} - ${p.b}`);
                colDiv.appendChild(box);
            });
            container.appendChild(colDiv);
        });
        
        if (typeof logNewTask === 'function') { logNewTask('kivonas-30as-szamkorben-feladat-3', { problems: [...problems] }); }
    }
    
    function generateTask4() {
        clearContainerAndFeedback(4);
        const container = containers[3];
        const columnsData = [[], [], [], []];
        const problems = new Set();

        // Col 1: a increases by 10
        let a1 = getRandomInt(2, 9);
        let b1 = getRandomInt(1, a1);
        for (let i = 0; i < 3; i++) {
            let current_a = a1 + i * 10;
            if (current_a > 30) continue;
            const key = `${current_a}-${b1}`;
            if (!problems.has(key)) {
                columnsData[0].push({ a: current_a, b: b1 });
                problems.add(key);
            }
        }
        
        // Col 2: b increases by 10
        let a2 = getRandomInt(22, 29);
        let b2 = getRandomInt(1, 8);
        for (let i = 0; i < 2; i++) {
            let current_b = b2 + i * 10;
            if (current_b > 29 || a2 - current_b < 0) continue;
            const key = `${a2}-${current_b}`;
            if (!problems.has(key)) {
                columnsData[1].push({ a: a2, b: current_b });
                problems.add(key);
            }
        }

        // Col 3: a increases by 1
        let a3 = getRandomInt(15, 25);
        let b3 = getRandomInt(2, 8);
        for (let i = 0; i < 3; i++) {
            let current_a = a3 + i;
            if (current_a > 30 || current_a - b3 < 0) continue;
            const key = `${current_a}-${b3}`;
            if (!problems.has(key)) {
                columnsData[2].push({ a: current_a, b: b3 });
                problems.add(key);
            }
        }

        // Col 4: b increases by 1
        let a4 = getRandomInt(25, 29);
        let b4 = getRandomInt(2, 8);
        for (let i = 0; i < 3; i++) {
            let current_b = b4 + i;
            if (a4 - current_b < 0) continue;
            const key = `${a4}-${current_b}`;
            if (!problems.has(key)) {
                columnsData[3].push({ a: a4, b: current_b });
                problems.add(key);
            }
        }

        columnsData.forEach((col) => {
            if (col.length === 0) return;
            const colDiv = document.createElement('div');
            colDiv.className = 'equation-column';
            shuffle(col).forEach(p => {
                const box = document.createElement('div');
                box.className = 'equation-box';
                const c = p.a - p.b;
                const type = getRandomInt(1, 2);
                if (type === 1) { // A - B = ?
                    box.append(`${p.a} - ${p.b} = `, createInput(String(c)));
                } else { // ? = A - B
                    box.append(createInput(String(c)), ` = ${p.a} - ${p.b}`);
                }
                colDiv.appendChild(box);
            });
            container.appendChild(colDiv);
        });

        if (typeof logNewTask === 'function') { logNewTask('kivonas-30as-szamkorben-feladat-4', { problems: [...problems] }); }
    }

    function generateTask5() {
        clearContainerAndFeedback(5);
        const container = containers[4];
        const generatedProblems = new Set();
        const problems = [];

        while (problems.length < 2) {
            const a = getRandomInt(11, 29);
            const b = getRandomInt(Math.max(1, (a % 10) + 1), 9);
            if (a-b < 0) continue;
            
            const problemKey = `${a},${b}`;
            if (generatedProblems.has(problemKey)) continue;
            
            const p = { a, b };
            p.toTen = p.a % 10;
            p.rem = p.b - p.toTen;
            p.result = p.a - p.b;

            problems.push(p);
            generatedProblems.add(problemKey);
        }

        problems.forEach(p => {
            const taskEl = document.createElement('div');
            taskEl.className = 'decomposition-task';
            const balls = document.createElement('div');
            balls.className = 'ball-container';

            let remainingToDraw = p.a;
            let rows = Math.ceil(p.a / 10);
            let ballCounter = 0;
            
            for (let i = 0; i < rows; i++) {
                const row = document.createElement('div');
                row.className = 'ball-row';
                const ballsInRow = Math.min(10, remainingToDraw);
                for (let j = 0; j < ballsInRow; j++) {
                    ballCounter++;
                    const ball = document.createElement('div');
                    ball.className = 'ball';

                    if (ballCounter === 1) {
                        ball.textContent = p.a;
                    }

                    if (ballCounter >= (p.a - p.b + 1)) {
                        ball.classList.add('crossed-out');
                        
                        if (ballCounter === (p.a - p.b + 1) && p.rem > 0) {
                            ball.textContent = p.rem;
                        }

                        if (ballCounter === (p.a - p.toTen + 1) && p.toTen > 0) {
                            ball.textContent = p.toTen;
                        }
                    }
                    ball.style.backgroundColor = 'var(--ball-color-1, red)';
                    row.appendChild(ball);
                }
                balls.appendChild(row);
                remainingToDraw -= 10;
            }
            
            const steps = document.createElement('div');
            steps.className = 'decomposition-steps';
            
            const eqBox1 = document.createElement('div');
            eqBox1.className = 'equation-box';
            eqBox1.append(`${p.a} - ${p.b} = `);
            eqBox1.appendChild(createInput(String(p.result), 2));

            const eqBox2 = document.createElement('div');
            eqBox2.className = 'equation-box';
            eqBox2.append(`${p.a} - `);
            eqBox2.appendChild(createInput(String(p.toTen), 1));
            eqBox2.append(` - `);
            eqBox2.appendChild(createInput(String(p.rem), 1));
            eqBox2.append(` = `);
            eqBox2.appendChild(createInput(String(p.result), 2));
            
            steps.append(eqBox1, eqBox2);
            taskEl.append(balls, steps);
            container.appendChild(taskEl);
        });
        if (typeof logNewTask === 'function') {
            logNewTask('kivonas-30as-szamkorben-feladat-5', { problems });
        }
    }

    function generateTask6() {
        clearContainerAndFeedback(6);
        const container = containers[5];
        const problems = new Set();
        const columnsData = [[],[],[],[]];

        while(columnsData[0].length < 3) {
            const a = getRandomInt(21, 29);
            const b_ones = getRandomInt(2, (a % 10) > 1 ? a % 10 - 1 : 2);
            const b_tens = 10;
            const c = b_tens + b_ones;

            if (problems.has(a) || a-c < 0) continue;
            problems.add(a);

            columnsData[0].push({ a, b: b_ones, result: a - b_ones, type: 1 });
            columnsData[1].push({ a, b: b_ones, b_tens, result: a - b_ones - b_tens, type: 2 });
            columnsData[2].push({ a, b_tens, b: b_ones, result: a - b_tens - b_ones, type: 3 });
            columnsData[3].push({ a, c, result: a - c, type: 4 });
        }
        
        for(let r=0; r<3; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'equation-row';
            for(let c=0; c<4; c++) {
                 const p = columnsData[c][r];
                 const box = document.createElement('div');
                 box.className = 'equation-box';
                 if (p.type === 1) box.append(`${p.a} - ${p.b} = `, createInput(String(p.result)));
                 if (p.type === 2) box.append(`${p.a} - ${p.b} - ${p.b_tens} = `, createInput(String(p.result)));
                 if (p.type === 3) box.append(`${p.a} - ${p.b_tens} - ${p.b} = `, createInput(String(p.result)));
                 if (p.type === 4) box.append(`${p.a} - ${p.c} = `, createInput(String(p.result)));
                 rowDiv.appendChild(box);
            }
            container.appendChild(rowDiv);
        }

        if (typeof logNewTask === 'function') { logNewTask('kivonas-30as-szamkorben-feladat-6', { problems: [...problems] }); }
    }

    function generateTask7() {
        clearContainerAndFeedback(7);
        const container = containers[6];
        const columnsData = [[], [], [], []];

        const fixedProblems = [
            [ {a:8, b:6}, {a:18, b:6}, {a:28, b:6} ],
            [ {a:9, b:2}, {a:19, b:2}, {a:29, b:2} ],
            [ {a:28, b:3}, {a:28, b:4}, {a:29, b:4} ],
            [ {a:25, b:4}, {a:26, b:4}, {a:26, b:3} ],
        ];
        
        fixedProblems.forEach((col, colIndex) => {
            shuffle(col).forEach(p => {
                columnsData[colIndex].push({ ...p, result: p.a - p.b });
            });
        });

        columnsData.forEach((columnProblems, colIndex) => {
            const colDiv = document.createElement('div');
            colDiv.className = 'equation-column';
            columnProblems.forEach(p => {
                const box = document.createElement('div');
                box.className = 'equation-box';
                if (colIndex >= 2) { // 3rd and 4th column
                    box.append(`${p.result} = `, createInput(String(p.a)), ` - ${p.b}`);
                } else { // 1st and 2nd column
                    box.append(`${p.a} - ${p.b} = `, createInput(String(p.result)));
                }
                colDiv.appendChild(box);
            });
            container.appendChild(colDiv);
        });

        if (typeof logNewTask === 'function') { logNewTask('kivonas-30as-szamkorben-feladat-7', {}); }
    }

    // --- SETUP ---

    const taskGenerators = [generateTask1, generateTask2, generateTask3, generateTask4, generateTask5, generateTask6, generateTask7];

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
        for (let i = 1; i <= taskCount; i++) {
            document.getElementById(`new-task-${i}-button`).addEventListener('click', taskGenerators[i - 1]);
            document.getElementById(`check-${i}-button`).addEventListener('click', () => checkTaskGeneric(i));
        }
    }

    setupControls();
    generateAllTasks();
    document.querySelector('.theme-button[data-theme="theme-candy"]').classList.add('active');
});
