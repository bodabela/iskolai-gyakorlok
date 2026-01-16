document.addEventListener('DOMContentLoaded', () => {
    if (typeof initializeFirebaseAndLogger === 'function') {
        initializeFirebaseAndLogger();
        logTaskEntry('kivonas-szamkorokben');
    }

    let currentLimit = 30;
    const taskCount = 7;
    const containers = Array.from({ length: taskCount }, (_, i) => document.getElementById(`task-${i + 1}-container`));
    const feedbacks = Array.from({ length: taskCount }, (_, i) => document.getElementById(`feedback-${i + 1}`));
    const bodyEl = document.body;
    const themeButtons = document.querySelectorAll('.theme-button');
    const rangeSelect = document.getElementById('range-select');

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = (array) => { array.sort(() => Math.random() - 0.5); return array; };
    const getSuffix = (num) => (num === 20 || num === 30 || num === 60 || num === 80 || num === 100) ? 'as' : 'es';

    function updateLimit(newLimit) {
        currentLimit = parseInt(newLimit);
        const header = document.querySelector('h1');
        const subHeader = document.querySelector('h2');
        if(header) header.textContent = `Kivonás ${currentLimit}-${getSuffix(currentLimit)} számkörben`;
        if(subHeader) subHeader.textContent = `Téma: Gyakoroljuk a kivonást ${currentLimit}-ig!`;
        generateAllTasks();
    }

    if (rangeSelect) {
        rangeSelect.addEventListener('change', (e) => {
            updateLimit(e.target.value);
        });
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
        const visualContainer = document.getElementById(`visual-task-${taskNum}`);
        if (visualContainer) visualContainer.innerHTML = '';
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
            logTaskCheck(`kivonas-szamkorokben-feladat-${taskNum}`, { correct: allCorrect, solutions: userSolutions, limit: currentLimit });
        }
    };

    // --- VISUALIZATION HELPERS ---

    function calculateSmartJumps(start, totalSub) {
        const jumps = [];
        let current = start;
        let remaining = totalSub;
        
        while (remaining > 0) {
            const lowerDecade = Math.floor((current - 0.1) / 10) * 10;
            const distToDecade = current - lowerDecade;

            if (distToDecade > 0 && remaining > distToDecade) {
                jumps.push(-distToDecade);
                remaining -= distToDecade;
                current -= distToDecade;
            } else {
                jumps.push(-remaining);
                current -= remaining;
                remaining = 0;
            }
        }
        return jumps;
    }

    function drawVisualNumberLine(containerId, start, jumps) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        // Calculate dynamic range based on the operation
        const totalSub = jumps.reduce((a, b) => a + b, 0);
        const minVal = Math.min(start, start + totalSub);
        const maxVal = Math.max(start, start + totalSub);
        
        const rangeStart = Math.floor(minVal / 10) * 10;
        let rangeEnd = Math.ceil(maxVal / 10) * 10;
        if (rangeEnd === rangeStart) rangeEnd += 10;

        const totalRange = rangeEnd - rangeStart;
        const width = 800;
        const padding = 40;
        const usefulWidth = width - 2 * padding;
        const step = usefulWidth / totalRange;

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${width} 120`); 
        svg.setAttribute("class", "number-line-svg");
        svg.innerHTML = `<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto-start-reverse"><polygon points="0 0, 8 3, 0 6" /></marker></defs>`;

        const lineY = 80;
        let line = document.createElementNS(svgNS, "line");
        Object.entries({x1: padding, y1: lineY, x2: width - padding, y2: lineY, class:"axis"}).forEach(([k,v])=>line.setAttribute(k,v));
        svg.appendChild(line);

        for (let i = rangeStart; i <= rangeEnd; i++) {
            const x = padding + (i - rangeStart) * step;
            let tick = document.createElementNS(svgNS, "line"); 
            Object.entries({x1:x, y1: lineY - 5, x2:x, y2: lineY + 5, class:"tick"}).forEach(([k,v])=>tick.setAttribute(k,v)); 
            svg.appendChild(tick);
            
            // Show fewer labels if crowded
            if (totalRange <= 40 || i % 5 === 0) {
                let text = document.createElementNS(svgNS, "text"); 
                Object.entries({x:x, y: lineY + 20, class:"number-text"}).forEach(([k,v])=>text.setAttribute(k,v)); 
                text.textContent = i;
                svg.appendChild(text);
            }
        }

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

        let current = start;
        jumps.forEach(jump => {
            const next = current + jump;
            
            let color = 'blue';
            // Heuristic coloring
            if ((current + next) / 2 <= currentLimit / 3) color = 'green';
            else if ((current + next) / 2 <= (currentLimit * 2) / 3) color = 'red';
            
            svg.appendChild(createArc(current, next, lineY, color));
            svg.appendChild(createArcLabel(current, next, lineY, jump > 0 ? `+${jump}` : `${jump}`));
            current = next;
        });

        container.appendChild(svg);
    }

    document.addEventListener('focusin', (e) => {
        const target = e.target;
        if (target.tagName !== 'INPUT') return;
        
        const taskWrapper = target.closest('.task');
        if (!taskWrapper) return;
        
        const wrapperId = taskWrapper.id;
        const taskNum = parseInt(wrapperId.replace('task-', '').replace('-wrapper', ''));
        
        if (taskNum === 1 || taskNum === 5) return;

        const box = target.closest('.equation-box');
        if (box) {
            let start = parseInt(box.dataset.a);
            let jumps = [];

            if (box.dataset.jumps) {
                jumps = JSON.parse(box.dataset.jumps);
            } else if (box.dataset.b) {
                const sub = parseInt(box.dataset.b);
                if (!isNaN(start) && !isNaN(sub)) {
                    jumps = calculateSmartJumps(start, sub);
                }
            }

            if (!isNaN(start) && jumps.length > 0) {
                drawVisualNumberLine(`visual-task-${taskNum}`, start, jumps);
            }
        }
    });

    // --- TASK GENERATORS ---

    function generateTask1() {
        clearContainerAndFeedback(1);
        const container = containers[0];
        const problems = [];
        const usedStarts = new Set();
        
        while (problems.length < 2) {
            // Generate start in the highest decade of the current limit
            const start = getRandomInt(currentLimit - 9, currentLimit - 1);
            if (usedStarts.has(start)) continue;
            const decadeBoundary = Math.floor(start / 10) * 10;
            const firstJump = start - decadeBoundary;
            const maxSecond = Math.min(10, 15 - firstJump); 
            if (maxSecond < 2 || firstJump === 0) continue; // Ensure there's a decade crossing
            const secondJump = getRandomInt(2, maxSecond);
            const end = start - firstJump - secondJump;
            usedStarts.add(start);
            problems.push({ start, firstJump, secondJump, end, totalSub: firstJump + secondJump });
        }

        problems.forEach(p => {
            const taskEl = document.createElement('div');
            taskEl.className = 'decomposition-task';
            
            // Visual range for SVG: based on problem values
            const vStart = Math.floor(p.end / 10) * 10;
            const vEnd = Math.ceil(p.start / 10) * 10;
            const vRange = vEnd - vStart;
            const step = 780 / vRange;

            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("viewBox", "0 0 800 100"); 
            svg.setAttribute("class", "number-line-svg");
            svg.innerHTML = `<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto-start-reverse"><polygon points="0 0, 8 3, 0 6" /></marker></defs>`;
            let line = document.createElementNS(svgNS, "line");
            Object.entries({x1:"10", y1:"70", x2:"790", y2:"70", class:"axis"}).forEach(([k,v])=>line.setAttribute(k,v));
            svg.appendChild(line);
            
            for (let i = vStart; i <= vEnd; i++) {
                const x = 10 + (i - vStart) * step;
                let tick = document.createElementNS(svgNS, "line"); Object.entries({x1:x, y1:"65", x2:x, y2:"75", class:"tick"}).forEach(([k,v])=>tick.setAttribute(k,v)); svg.appendChild(tick);
                let text = document.createElementNS(svgNS, "text"); Object.entries({x:x, y:"90", class:"number-text"}).forEach(([k,v])=>text.setAttribute(k,v)); text.textContent = i; svg.appendChild(text);
            }
            const createArc = (from, to, y, color) => {
                const path = document.createElementNS(svgNS, "path");
                const x1 = 10 + (from - vStart) * step, x2 = 10 + (to - vStart) * step;
                path.setAttribute("d", `M ${x1} ${y} C ${x1} ${y-20}, ${x2} ${y-20}, ${x2} ${y}`);
                path.setAttribute("class", "arrow");
                path.setAttribute("stroke", color);
                return path;
            };
            const createArcLabel = (from, to, y, labelText) => {
                const text = document.createElementNS(svgNS, "text");
                const x1 = 10 + (from - vStart) * step, x2 = 10 + (to - vStart) * step;
                text.setAttribute('x', (x1 + x2) / 2); text.setAttribute('y', y - 30); text.setAttribute('class', 'arrow-label'); text.textContent = labelText;
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

        if (typeof logNewTask === 'function') { logNewTask('kivonas-szamkorokben-feladat-1', { problems, limit: currentLimit }); }
    }

    function generateTask2() {
        clearContainerAndFeedback(2);
        const container = containers[1];
        // Generate minuends near the current limit
        const minuends = [];
        while(minuends.length < 4) {
            const m = getRandomInt(currentLimit - 10, currentLimit - 1);
            if(!minuends.includes(m)) minuends.push(m);
        }
        shuffle(minuends);
        
        const columnsData = [];

        for (let i = 0; i < 4; i++) {
            const a = minuends[i];
            const columnProblems = [];
            let b_start = getRandomInt(4, 9);
            let attempts = 0;
            while(columnProblems.length < 4 && attempts < 20) {
                columnProblems.length = 0;
                b_start = getRandomInt(4, 9);
                for (let j = 0; j < 4; j++) {
                    const b = b_start - j;
                    if (b > 0 && a - b >= 0) {
                        let type = (i === 3) ? getRandomInt(1, 3) : i + 1;
                        columnProblems.push({ a, b, c: a - b, type });
                    } else { break; }
                }
                attempts++;
            }
            if (columnProblems.length >= 4) columnsData.push(columnProblems.slice(0, 4));
        }

        columnsData.forEach(columnProblems => {
            const colDiv = document.createElement('div');
            colDiv.className = 'equation-column';
            columnProblems.forEach(p => {
                const box = document.createElement('div');
                box.className = 'equation-box';
                box.dataset.a = p.a;
                box.dataset.b = p.b;
                
                if (p.type === 1) { 
                    box.append(`${p.a} - ${p.b} = `, createInput(String(p.c), 2));
                } else if (p.type === 2) {
                    box.append(createInput(String(p.a), 2), ` - ${p.b} = ${p.c}`);
                } else if (p.type === 3) {
                    box.append(`${p.a} - `, createInput(String(p.b), 1), ` = ${p.c}`);
                }
                colDiv.appendChild(box);
            });
            container.appendChild(colDiv);
        });

        if (typeof logNewTask === 'function') { logNewTask('kivonas-szamkorokben-feladat-2', { problems: columnsData.flat(), limit: currentLimit }); }
    }

    function generateTask3() {
        clearContainerAndFeedback(3);
        const container = containers[2];
        const problems = new Set();
        const columnsData = [[], [], []];

        for (let i = 0; i < 4; i++) {
            let p1;
            do {
                const a = getRandomInt(currentLimit - 9, currentLimit - 1);
                const maxB = a % 10;
                const b = getRandomInt(1, maxB);
                p1 = { type: 1, a, b, result: a - b };
            } while (problems.has(`col1-${p1.a}-${p1.b}`));
            problems.add(`col1-${p1.a}-${p1.b}`);
            columnsData[0].push(p1);

            let p2, p3;
             do {
                const a = getRandomInt(currentLimit - 9, currentLimit - 2);
                const b = a % 10;
                const c = getRandomInt(1, 9 - b);
                const d = b+c;
                p2 = { type: 3, a, b, c, result: a - b - c };
                p3 = { type: 4, a: a, b: d, result: a - d };
            } while (problems.has(`col23-${p2.a}-${p2.b}-${p2.c}`) || problems.has(`col23-${p3.a}-${p3.b}`));
            problems.add(`col23-${p2.a}-${p2.b}-${p2.c}`);
            problems.add(`col23-${p3.a}-${p3.b}`);
            columnsData[1].push(p2);
            columnsData[2].push(p3);
        }

        columnsData.forEach(columnProblems => {
            const colDiv = document.createElement('div');
            colDiv.className = 'equation-column';
            columnProblems.forEach(p => {
                const box = document.createElement('div');
                box.className = 'equation-box';
                
                box.dataset.a = p.a;
                if (p.type === 1) {
                    box.dataset.b = p.b;
                    box.append(`${p.a} - ${p.b} = `, createInput(String(p.result)));
                }
                if (p.type === 3) {
                    box.dataset.jumps = JSON.stringify([-p.b, -p.c]);
                    box.append(createInput(String(p.result)), ` = ${p.a} - ${p.b} - ${p.c}`);
                }
                if (p.type === 4) {
                    box.dataset.b = p.b;
                    box.append(createInput(String(p.result)), ` = ${p.a} - ${p.b}`);
                }
                colDiv.appendChild(box);
            });
            container.appendChild(colDiv);
        });
        
        if (typeof logNewTask === 'function') { logNewTask('kivonas-szamkorokben-feladat-3', { problems: [...problems], limit: currentLimit }); }
    }
    
    function generateTask4() {
        clearContainerAndFeedback(4);
        const container = containers[3];
        const allColumnGenerators = [
            () => {
                const col = [];
                const b = getRandomInt(1, 8);
                const aStart = getRandomInt(1, 9);
                for (let i = 0; i < 3; i++) {
                    const a = aStart + i * 10;
                    if (a <= currentLimit && a > b) col.push({ a, b });
                }
                return col.length >= 2 ? col : null;
            },
            () => {
                const col = [];
                const a = getRandomInt(currentLimit - 9, currentLimit);
                const bStart = getRandomInt(1, 8);
                for (let i = 0; i < 3; i++) {
                    const b = bStart + i * 10;
                    if (a > b) col.push({ a, b });
                }
                return col.length >= 2 ? col : null;
            },
            () => {
                const col = [];
                const b = getRandomInt(1, 15);
                const aStart = getRandomInt(b + 1, currentLimit - 5);
                for (let i = 0; i < 3; i++) {
                    const a = aStart + i;
                    if (a <= currentLimit && a > b) col.push({ a, b });
                }
                return col.length >= 2 ? col : null;
            },
            () => {
                const col = [];
                const a = getRandomInt(Math.max(20, currentLimit - 10), currentLimit);
                const bStart = getRandomInt(1, a > 5 ? a - 5 : 1);
                for (let i = 0; i < 3; i++) {
                    const b = bStart + i;
                    if (a > b) col.push({ a, b });
                }
                return col.length >= 2 ? col : null;
            }
        ];
        
        const generatedColumns = [];
        const problems = new Set();
        
        shuffle(allColumnGenerators);
        allColumnGenerators.forEach(generator => {
            if (generatedColumns.length >= 4) return;
            let attempts = 0;
            while(attempts < 10) {
                const newCol = generator();
                if (newCol) {
                    const uniqueNewCol = newCol.filter(p => !problems.has(`${p.a}-${p.b}`));
                    if (uniqueNewCol.length >= 3) {
                         const finalCol = uniqueNewCol.slice(0, 3);
                         finalCol.forEach(p => problems.add(`${p.a}-${p.b}`));
                         generatedColumns.push(finalCol);
                         break;
                    }
                }
                attempts++;
            }
        });

        generatedColumns.forEach((col) => {
            const colDiv = document.createElement('div');
            colDiv.className = 'equation-column';
            const type = getRandomInt(1, 2);
            col.forEach(p => {
                const box = document.createElement('div');
                box.className = 'equation-box';
                
                box.dataset.a = p.a;
                box.dataset.b = p.b;

                const c = p.a - p.b;
                if (type === 1) {
                    box.append(`${p.a} - ${p.b} = `, createInput(String(c)));
                } else {
                    box.append(createInput(String(c)), ` = ${p.a} - ${p.b}`);
                }
                colDiv.appendChild(box);
            });
            container.appendChild(colDiv);
        });

        if (typeof logNewTask === 'function') { logNewTask('kivonas-szamkorokben-feladat-4', { problems: [...problems], limit: currentLimit }); }
    }

    function generateTask5() {
        clearContainerAndFeedback(5);
        const container = containers[4];
        const problems = [];
        const a2 = getRandomInt(currentLimit - 9, currentLimit - 2);
        const a1 = a2 - 10;
        const b1 = getRandomInt((a1 % 10) + 1, 9);
        const b2 = getRandomInt((a2 % 10) + 1, 9);
        const p1 = { a: a1, b: b1, toTen: a1 % 10, rem: b1 - (a1 % 10), result: a1 - b1 };
        const p2 = { a: a2, b: b2, toTen: a2 % 10, rem: b2 - (a2 % 10), result: a2 - b2 };
        problems.push(p1, p2);

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
                    if (ballCounter === 1) ball.textContent = p.a;
                    if (ballCounter >= (p.a - p.b + 1)) {
                        ball.classList.add('crossed-out');
                        if (ballCounter === (p.a - p.b + 1) && p.rem > 0) ball.textContent = p.rem;
                        if (ballCounter === (p.a - p.toTen + 1) && p.toTen > 0) ball.textContent = p.toTen;
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
        if (typeof logNewTask === 'function') { logNewTask('kivonas-szamkorokben-feladat-5', { problems, limit: currentLimit }); }
    }

    function generateTask6() {
        clearContainerAndFeedback(6);
        const container = containers[5];
        const problems = new Set();
        const columnsData = [[],[],[],[]];

        let attempts = 0;
        while(columnsData[0].length < 3 && attempts < 50) {
            attempts++;
            const a = getRandomInt(currentLimit - 9, currentLimit - 1);
            const b_ones = getRandomInt(2, (a % 10) > 1 ? a % 10 - 1 : 2);
            const b_tens = getRandomInt(1, Math.floor((a - b_ones)/10)) * 10;
            const c = b_tens + b_ones;

            if (problems.has(a) || a-c < 0) continue;
            problems.add(a);

            columnsData[0].push({ a, b: b_ones, result: a - b_ones, type: 1 });
            columnsData[1].push({ a, b: b_ones, b_tens, result: a - b_ones - b_tens, type: 2 });
            columnsData[2].push({ a, b_tens, b: b_ones, result: a - b_tens - b_ones, type: 3 });
            columnsData[3].push({ a, c, result: a - c, type: 4 });
        }
        
        for(let r=0; r < columnsData[0].length; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'equation-row';
            for(let c=0; c<4; c++) {
                 const p = columnsData[c][r];
                 const box = document.createElement('div');
                 box.className = 'equation-box';
                 
                 box.dataset.a = p.a;

                 if (p.type === 1) {
                     box.dataset.b = p.b;
                     box.append(`${p.a} - ${p.b} = `, createInput(String(p.result)));
                 }
                 if (p.type === 2) {
                     box.dataset.jumps = JSON.stringify([-p.b, -p.b_tens]);
                     box.append(`${p.a} - ${p.b} - ${p.b_tens} = `, createInput(String(p.result)));
                 }
                 if (p.type === 3) {
                     box.dataset.jumps = JSON.stringify([-p.b_tens, -p.b]);
                     box.append(`${p.a} - ${p.b_tens} - ${p.b} = `, createInput(String(p.result)));
                 }
                 if (p.type === 4) {
                     box.dataset.b = p.c;
                     box.append(`${p.a} - ${p.c} = `, createInput(String(p.result)));
                 }
                 rowDiv.appendChild(box);
            }
            container.appendChild(rowDiv);
        }

        if (typeof logNewTask === 'function') { logNewTask('kivonas-szamkorokben-feladat-6', { problems: [...problems], limit: currentLimit }); }
    }

    function generateTask7() {
        clearContainerAndFeedback(7);
        const container = containers[6];
        const columnsData = [[], [], [], []];

        // Pattern 1: Analogies (e.g., 8-6, 18-6, 28-6)
        const p1_b = getRandomInt(2, 6);
        const p1_start = getRandomInt(p1_b + 2, 9);
        for(let val = p1_start; val <= currentLimit; val+=10) {
            if (columnsData[0].length < 3) columnsData[0].push({a: val, b: p1_b});
        }

        // Pattern 2: Analogies (e.g., 9-2, 19-2...)
        const p2_b = getRandomInt(2, 6);
        let p2_start = getRandomInt(p2_b + 2, 9);
        if (p2_start === p1_start) p2_start = (p2_start + 1) % 10 || 9;
        for(let val = p2_start; val <= currentLimit; val+=10) {
            if (columnsData[1].length < 3) columnsData[1].push({a: val, b: p2_b});
        }

        // Pattern 3 & 4: Practice in high range
        const highStart = Math.max(20, currentLimit - 10);
        const highEnd = currentLimit;
        for(let i=0; i<3; i++) {
             const a3 = getRandomInt(highStart, highEnd);
             const b3 = getRandomInt(1, 9);
             if (a3 - b3 >= 0) columnsData[2].push({a: a3, b: b3});
             else columnsData[2].push({a: a3, b: a3 % 10}); // fallback

             const a4 = getRandomInt(highStart, highEnd);
             const b4 = getRandomInt(1, 9);
             if (a4 - b4 >= 0) columnsData[3].push({a: a4, b: b4});
             else columnsData[3].push({a: a4, b: 0});
        }

        columnsData.forEach((col, colIndex) => {
             // Calculate result for each
             col.forEach(p => p.result = p.a - p.b);
        });

        columnsData.forEach((columnProblems, colIndex) => {
            const colDiv = document.createElement('div');
            colDiv.className = 'equation-column';
            columnProblems.forEach(p => {
                const box = document.createElement('div');
                box.className = 'equation-box';
                
                box.dataset.a = p.a;
                box.dataset.b = p.b;

                if (colIndex >= 2) {
                    box.append(`${p.result} = `, createInput(String(p.a)), ` - ${p.b}`);
                } else {
                    box.append(`${p.a} - ${p.b} = `, createInput(String(p.result)));
                }
                colDiv.appendChild(box);
            });
            container.appendChild(colDiv);
        });

        if (typeof logNewTask === 'function') { logNewTask('kivonas-szamkorokben-feladat-7', { limit: currentLimit }); }
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
    updateLimit(30); // Initialize with default limit
    document.querySelector('.theme-button[data-theme="theme-candy"]').classList.add('active');
});
