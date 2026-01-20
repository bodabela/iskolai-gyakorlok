document.addEventListener('DOMContentLoaded', () => {
    if (typeof initializeFirebaseAndLogger === 'function') {
        initializeFirebaseAndLogger();
        logTaskEntry('ketjegyu-muveletek-bontassal');
    }

    let currentLimit = 50;
    let operandMagnitude = 10; // 10 or 20
    const taskCount = 2;
    const containers = Array.from({ length: taskCount }, (_, i) => document.getElementById(`task-${i + 1}-container`));
    const feedbacks = Array.from({ length: taskCount }, (_, i) => document.getElementById(`feedback-${i + 1}`));
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');
    const rangeSelect = document.getElementById('range-select');
    const operandRangeSelect = document.getElementById('operand-range-select');

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    function updateLimit(newLimit) {
        currentLimit = parseInt(newLimit);
        generateAllTasks();
    }

    function updateOperandRange(newRange) {
        operandMagnitude = parseInt(newRange);
        generateAllTasks();
    }

    if (rangeSelect) {
        rangeSelect.addEventListener('change', (e) => updateLimit(e.target.value));
    }

    if (operandRangeSelect) {
        operandRangeSelect.addEventListener('change', (e) => updateOperandRange(e.target.value));
    }

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
            logTaskCheck(`ketjegyu-muveletek-bontassal-feladat-${taskNum}`, { correct: allCorrect, solutions: userSolutions, limit: currentLimit });
        }
    };

    function drawVisualNumberLine(svg, start, jumps, isAddition = true) {
        // Calculate Range
        let minVal = start;
        let maxVal = start;
        let current = start;
        jumps.forEach(j => {
            current += j;
            if (current < minVal) minVal = current;
            if (current > maxVal) maxVal = current;
        });

        const rangeStart = Math.floor((minVal - 2) / 10) * 10;
        let rangeEnd = Math.ceil((maxVal + 2) / 10) * 10;
        if (rangeEnd === rangeStart) rangeEnd += 10;

        const totalRange = rangeEnd - rangeStart;
        const width = 800;
        const padding = 40;
        const usefulWidth = width - 2 * padding;
        const step = usefulWidth / totalRange;

        svg.setAttribute("viewBox", `0 0 ${width} 120`);
        svg.setAttribute("class", "number-line-svg");
        svg.innerHTML = `<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto-start-reverse"><polygon points="0 0, 8 3, 0 6" /></marker></defs>`;

        const svgNS = "http://www.w3.org/2000/svg";
        const lineY = 80;

        // Draw Axis
        let line = document.createElementNS(svgNS, "line");
        Object.entries({ x1: padding, y1: lineY, x2: width - padding, y2: lineY, class: "axis" }).forEach(([k, v]) => line.setAttribute(k, v));
        svg.appendChild(line);

        // Draw Ticks
        for (let i = rangeStart; i <= rangeEnd; i++) {
            const x = padding + (i - rangeStart) * step;
            let tick = document.createElementNS(svgNS, "line");
            Object.entries({ x1: x, y1: lineY - 5, x2: x, y2: lineY + 5, class: "tick" }).forEach(([k, v]) => tick.setAttribute(k, v));
            svg.appendChild(tick);

            if (totalRange <= 40 || i % 5 === 0) {
                let text = document.createElementNS(svgNS, "text");
                Object.entries({ x: x, y: lineY + 20, class: "number-text" }).forEach(([k, v]) => text.setAttribute(k, v));
                text.textContent = i;
                svg.appendChild(text);
            }
        }

        // Draw Jumps
        const createArc = (from, to, y, color) => {
            const path = document.createElementNS(svgNS, "path");
            const x1 = padding + (from - rangeStart) * step;
            const x2 = padding + (to - rangeStart) * step;
            const height = Math.abs(x2 - x1) * 0.4 + 20;
            const clampedHeight = Math.min(height, 60);
            path.setAttribute("d", `M ${x1} ${y} C ${x1} ${y - clampedHeight}, ${x2} ${y - clampedHeight}, ${x2} ${y}`);
            path.setAttribute("class", "arrow");
            path.setAttribute("stroke", color);
            return path;
        };

        const createArcLabel = (from, to, y, labelText) => {
            const text = document.createElementNS(svgNS, "text");
            const x1 = padding + (from - rangeStart) * step;
            const x2 = padding + (to - rangeStart) * step;
            const height = Math.abs(x2 - x1) * 0.4 + 20;
            const clampedHeight = Math.min(height, 60);
            text.setAttribute('x', (x1 + x2) / 2);
            text.setAttribute('y', y - clampedHeight - 5);
            text.setAttribute('class', 'arrow-label');
            text.textContent = labelText;
            return text;
        };

        let currentPos = start;
        jumps.forEach(jump => {
            const nextPos = currentPos + jump;
            const color = (Math.abs(jump) >= 10) ? 'blue' : 'red';
            const label = jump > 0 ? `+${jump}` : `${jump}`;
            svg.appendChild(createArc(currentPos, nextPos, lineY, color));
            svg.appendChild(createArcLabel(currentPos, nextPos, lineY, label));
            currentPos = nextPos;
        });
    }

    function generateTask1() {
        clearContainerAndFeedback(1);
        const container = containers[0];
        const problems = [];
        const operandMin = operandMagnitude;
        const operandMax = operandMagnitude + 9;

        // Try to generate 3 valid problems
        let attempts = 0;
        while (problems.length < 3 && attempts < 100) {
            attempts++;
            const b = getRandomInt(operandMin, operandMax);
            if (currentLimit <= b) continue; // Impossible if result exceeds limit
            const a = getRandomInt(11, currentLimit - b); // Ensure a is at least 2 digits for meaningful exercise

            // Logic: a + b. Breakdown b into Tens and Ones.
            const bTens = Math.floor(b / 10) * 10;
            const bOnes = b % 10;
            
            // Jump logic
            const jumps = [];
            jumps.push(bTens); // First jump: tens
            
            let bOnesPart1 = 0;
            let bOnesPart2 = 0;

            const afterTens = a + bTens;
            const distToDecade = 10 - (afterTens % 10);

            if (bOnes > 0) {
                if (afterTens % 10 !== 0 && bOnes > distToDecade) {
                    // Crossing decade
                    bOnesPart1 = distToDecade;
                    bOnesPart2 = bOnes - distToDecade;
                    jumps.push(bOnesPart1);
                    jumps.push(bOnesPart2);
                } else {
                    // No crossing or exact decade
                    bOnesPart1 = bOnes;
                    jumps.push(bOnesPart1);
                }
            }
            
            const problemId = `${a}-${b}`;
            if (!problems.some(p => p.id === problemId)) {
                problems.push({
                    id: problemId,
                    a, b, result: a + b, bTens, bOnes, bOnesPart1, bOnesPart2, jumps
                });
            }
        }

        if (problems.length === 0) {
            const msg = document.createElement('p');
            msg.textContent = "A kiválasztott beállításokkal (Számkör vs Második szám) nem generálható feladat. Kérlek, növeld a számkört!";
            container.appendChild(msg);
            return;
        }

        problems.forEach(p => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'decomposition-task';
            
            // SVG
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            drawVisualNumberLine(svg, p.a, p.jumps, true);
            taskDiv.appendChild(svg);

            // Equation Line 1: 32 + 19 = [51]
            const eqLine1 = document.createElement('div');
            eqLine1.className = 'equation-box';
            eqLine1.innerHTML = `${p.a} + ${p.b} = `;
            eqLine1.appendChild(createInput(String(p.result), 2));
            taskDiv.appendChild(eqLine1);

            // Equation Line 2: 32 + [10] + [8] + [1] = [51]
            const eqLine2 = document.createElement('div');
            eqLine2.className = 'equation-box';
            eqLine2.innerHTML = `${p.a} + `;
            
            // Tens input
            eqLine2.appendChild(createInput(String(p.bTens), 2));
            
            // Ones inputs
            if (p.bOnesPart1 > 0) {
                 eqLine2.innerHTML += ` + `;
                 eqLine2.appendChild(createInput(String(p.bOnesPart1), 1));
            }
            if (p.bOnesPart2 > 0) {
                 eqLine2.innerHTML += ` + `;
                 eqLine2.appendChild(createInput(String(p.bOnesPart2), 1));
            }

            eqLine2.innerHTML += ` = `;
            eqLine2.appendChild(createInput(String(p.result), 2));
            
            taskDiv.appendChild(eqLine2);
            container.appendChild(taskDiv);
        });

        if (typeof logNewTask === 'function') { logNewTask('ketjegyu-muveletek-bontassal-1', { problems, limit: currentLimit }); }
    }

    function generateTask2() {
        clearContainerAndFeedback(2);
        const container = containers[1];
        const problems = [];
        const operandMin = operandMagnitude;
        const operandMax = operandMagnitude + 9;

        let attempts = 0;
        while (problems.length < 3 && attempts < 100) {
            attempts++;
            const b = getRandomInt(operandMin, operandMax);
            const a = getRandomInt(b + 1, currentLimit);

            const bTens = Math.floor(b / 10) * 10;
            const bOnes = b % 10;
            const jumps = [];

            // Step 1: Subtract tens
            jumps.push(-bTens);

            let bOnesPart1 = 0;
            let bOnesPart2 = 0;
            const afterTens = a - bTens;
            const distToDecade = afterTens % 10;

            if (bOnes > 0) {
                if (distToDecade > 0 && bOnes > distToDecade) {
                    // Crossing decade
                    bOnesPart1 = distToDecade;
                    bOnesPart2 = bOnes - distToDecade;
                    jumps.push(-bOnesPart1);
                    jumps.push(-bOnesPart2);
                } else {
                    bOnesPart1 = bOnes;
                    jumps.push(-bOnesPart1);
                }
            }

            const problemId = `${a}-${b}`;
            if (!problems.some(p => p.id === problemId)) {
                problems.push({
                    id: problemId,
                    a, b, result: a - b, bTens, bOnes, bOnesPart1, bOnesPart2, jumps
                });
            }
        }

        if (problems.length === 0) {
            const msg = document.createElement('p');
            msg.textContent = "A kiválasztott beállításokkal nem generálható feladat. Kérlek, növeld a számkört!";
            container.appendChild(msg);
            return;
        }

        problems.forEach(p => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'decomposition-task';
            
            // SVG
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            drawVisualNumberLine(svg, p.a, p.jumps, false);
            taskDiv.appendChild(svg);

            // Equation Line 1
            const eqLine1 = document.createElement('div');
            eqLine1.className = 'equation-box';
            eqLine1.innerHTML = `${p.a} - ${p.b} = `;
            eqLine1.appendChild(createInput(String(p.result), 2));
            taskDiv.appendChild(eqLine1);

            // Equation Line 2: 32 - [10] - [2] - [1] = [19]
            const eqLine2 = document.createElement('div');
            eqLine2.className = 'equation-box';
            eqLine2.innerHTML = `${p.a} - `;
            
            eqLine2.appendChild(createInput(String(p.bTens), 2));

            if (p.bOnesPart1 > 0) {
                 eqLine2.innerHTML += ` - `;
                 eqLine2.appendChild(createInput(String(p.bOnesPart1), 1));
            }
            if (p.bOnesPart2 > 0) {
                 eqLine2.innerHTML += ` - `;
                 eqLine2.appendChild(createInput(String(p.bOnesPart2), 1));
            }

            eqLine2.innerHTML += ` = `;
            eqLine2.appendChild(createInput(String(p.result), 2));
            
            taskDiv.appendChild(eqLine2);
            container.appendChild(taskDiv);
        });

        if (typeof logNewTask === 'function') { logNewTask('ketjegyu-muveletek-bontassal-2', { problems, limit: currentLimit }); }
    }

    function generateAllTasks() {
        generateTask1();
        generateTask2();
    }

    function setupControls() {
        themeButtons.forEach(button => button.addEventListener('click', () => {
            bodyEl.className = '';
            bodyEl.classList.add(button.dataset.theme);
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        }));
        
        document.getElementById('new-task-1-button').addEventListener('click', generateTask1);
        document.getElementById('check-1-button').addEventListener('click', () => checkTaskGeneric(1));
        document.getElementById('new-task-2-button').addEventListener('click', generateTask2);
        document.getElementById('check-2-button').addEventListener('click', () => checkTaskGeneric(2));
    }

    setupControls();
    generateAllTasks();
    document.querySelector('.theme-button[data-theme="theme-candy"]').classList.add('active');
});
