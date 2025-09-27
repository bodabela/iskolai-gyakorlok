const SVG_NS = "http://www.w3.org/2000/svg";
        const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');
        const numberRange = { min: -20, max: 20 };
        const numOrderingItems = 5;

        let orderingTaskData = { numbers: [], solution: [] };
        let additionTaskData = { startNum: 0, changeNum: 0, result: 0 };
        let subtractionTaskData = { startNum: 0, changeNum: 0, result: 0 };

        function applyTheme(themeClass) {
            bodyEl.className = '';
            bodyEl.classList.add(themeClass);
            themeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // --- Number Line Drawing ---
        function drawNumberLine(svgId, taskData, type) {
            const svg = document.getElementById(svgId);
            if (!svg) return;
            svg.innerHTML = ''; 

            const viewBoxWidth = 700;
            const viewBoxHeight = 100;
            svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

            const padding = 40;
            const yAxis = viewBoxHeight / 2 + 10;
            const yNumbers = yAxis + 20;
            const tickHeight = 8;
            const zeroTickHeight = 12;

            const totalUnits = numberRange.max - numberRange.min;
            const spacing = totalUnits > 0 ? (viewBoxWidth - 2 * padding) / totalUnits : (viewBoxWidth - 2 * padding);

            const axisLine = document.createElementNS(SVG_NS, 'line');
            axisLine.setAttribute('x1', padding - 10);
            axisLine.setAttribute('y1', yAxis);
            axisLine.setAttribute('x2', viewBoxWidth - padding + 10);
            axisLine.setAttribute('y2', yAxis);
            axisLine.setAttribute('class', 'axis');
            svg.appendChild(axisLine);

            const arrowheadLeft = document.createElementNS(SVG_NS, 'polygon');
            arrowheadLeft.setAttribute('points', `${padding-10},${yAxis} ${padding},${yAxis-5} ${padding},${yAxis+5}`);
            arrowheadLeft.classList.add('arrow-head','axis');
            svg.appendChild(arrowheadLeft);

            const arrowheadRight = document.createElementNS(SVG_NS, 'polygon');
            arrowheadRight.setAttribute('points', `${viewBoxWidth-padding+10},${yAxis} ${viewBoxWidth-padding},${yAxis-5} ${viewBoxWidth-padding},${yAxis+5}`);
            arrowheadRight.classList.add('arrow-head','axis');
            svg.appendChild(arrowheadRight);


            for (let i = numberRange.min; i <= numberRange.max; i++) {
                const x = padding + (i - numberRange.min) * spacing;
                const tick = document.createElementNS(SVG_NS, 'line');
                tick.setAttribute('x1', x);
                tick.setAttribute('y1', yAxis - (i === 0 ? zeroTickHeight : tickHeight) / 2);
                tick.setAttribute('x2', x);
                tick.setAttribute('y2', yAxis + (i === 0 ? zeroTickHeight : tickHeight) / 2);
                tick.setAttribute('class', i === 0 ? 'zero-tick tick' : 'tick');
                svg.appendChild(tick);

                if (i % 5 === 0 || i === numberRange.min || i === numberRange.max || Math.abs(i) <=2 || totalUnits <= 25) {
                    const numText = document.createElementNS(SVG_NS, 'text');
                    numText.setAttribute('x', x);
                    numText.setAttribute('y', yNumbers);
                    numText.textContent = i;
                    numText.setAttribute('class', i === 0 ? 'number-text zero' : 'number-text');
                    svg.appendChild(numText);
                }
            }

            if (type === 'ordering' && taskData.numbers) {
                taskData.numbers.forEach(num => {
                    const x = padding + (num - numberRange.min) * spacing;
                    const rect = document.createElementNS(SVG_NS, 'rect');
                    rect.setAttribute('x', x - spacing / 3);
                    rect.setAttribute('y', yAxis - 15);
                    rect.setAttribute('width', spacing / 1.5);
                    rect.setAttribute('height', 10);
                    rect.setAttribute('class', 'value-highlight-rect');
                    rect.style.fill = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}80`; // Random color with opacity
                    svg.appendChild(rect);

                    const numText = document.createElementNS(SVG_NS, 'text');
                    numText.setAttribute('x', x);
                    numText.setAttribute('y', yAxis - 22);
                    numText.textContent = num + "°C";
                    numText.setAttribute('class', 'label-text');
                    svg.appendChild(numText);
                });
            } else if ((type === 'addition' || type === 'subtraction') && taskData) {
                const xStart = padding + (taskData.startNum - numberRange.min) * spacing;
                const xEnd = padding + (taskData.result - numberRange.min) * spacing;
                const yArrow = yAxis - 25;
                const yLabel = yArrow - 8;

                const startDot = document.createElementNS(SVG_NS, 'circle');
                startDot.setAttribute('cx', xStart);
                startDot.setAttribute('cy', yAxis);
                startDot.setAttribute('r', 4);
                startDot.setAttribute('class', 'dot-marker');
                svg.appendChild(startDot);
                
                const startLabel = document.createElementNS(SVG_NS, 'text');
                startLabel.setAttribute('x', xStart);
                startLabel.setAttribute('y', yAxis - 10);
                startLabel.textContent = taskData.startNum + "°C";
                startLabel.setAttribute('class', 'label-text');
                svg.appendChild(startLabel);

                const arrow = document.createElementNS(SVG_NS, 'line');
                arrow.setAttribute('x1', xStart);
                arrow.setAttribute('y1', yArrow);
                arrow.setAttribute('x2', xEnd);
                arrow.setAttribute('y2', yArrow);
                arrow.setAttribute('class', 'arrow-shaft');
                svg.appendChild(arrow);

                const arrowhead = document.createElementNS(SVG_NS, 'polygon');
                if (type === 'addition') { // Arrow to the right
                    arrowhead.setAttribute('points', `${xEnd},${yArrow} ${xEnd-8},${yArrow-4} ${xEnd-8},${yArrow+4}`);
                } else { // Arrow to the left (subtraction)
                     arrowhead.setAttribute('points', `${xEnd},${yArrow} ${xEnd+8},${yArrow-4} ${xEnd+8},${yArrow+4}`);
                }
                arrowhead.classList.add('arrow-head');
                svg.appendChild(arrowhead);

                const changeLabel = document.createElementNS(SVG_NS, 'text');
                changeLabel.setAttribute('x', (xStart + xEnd) / 2);
                changeLabel.setAttribute('y', yLabel);
                changeLabel.textContent = (type === 'addition' ? '+' : '-') + taskData.changeNum + "°C";
                changeLabel.setAttribute('class', 'label-text');
                svg.appendChild(changeLabel);
                
                const endLabel = document.createElementNS(SVG_NS, 'text');
                endLabel.setAttribute('x', xEnd);
                endLabel.setAttribute('y', yAxis - 10);
                endLabel.textContent = "?";
                endLabel.setAttribute('class', 'label-text');
                endLabel.style.fontSize = "14px";
                endLabel.style.fontWeight = "bold";
                svg.appendChild(endLabel);
            }
        }


        // --- Ordering Task ---
        function generateOrderingTask() {
            orderingTaskData.numbers = [];
            const usedNumbers = new Set();
            while (orderingTaskData.numbers.length < numOrderingItems) {
                const num = getRandomInt(numberRange.min, numberRange.max);
                if (!usedNumbers.has(num)) {
                    orderingTaskData.numbers.push(num);
                    usedNumbers.add(num);
                }
            }
            orderingTaskData.solution = [...orderingTaskData.numbers].sort((a, b) => a - b);

            const displayEl = document.getElementById('ordering_problem_display');
            const shuffledNumbers = [...orderingTaskData.numbers];
            shuffleArray(shuffledNumbers); // Megkeverjük a megjelenítéshez
            displayEl.innerHTML = shuffledNumbers.map(n => `<span class="number-box" style="background-color: hsla(${getRandomInt(0,360)}, 70%, 80%, 0.7);">${n}°C</span>`).join(' ');


            const answerAreaEl = document.getElementById('ordering_answer_area');
            answerAreaEl.innerHTML = 'Sorrend: ';
            for (let i = 0; i < numOrderingItems; i++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.id = `order_ans_${i}`;
                input.min = numberRange.min;
                input.max = numberRange.max;
                answerAreaEl.appendChild(input);
                if (i < numOrderingItems - 1) {
                    const span = document.createElement('span');
                    span.innerHTML = `&nbsp;&le;&nbsp;`; // Non-breaking space for better spacing
                    span.classList.add('relation-symbol');
                    answerAreaEl.appendChild(span);
                }
            }
            document.getElementById('ordering_feedback').textContent = '';
            document.getElementById('ordering_feedback').className = 'feedback';
            drawNumberLine('ordering_number_line', orderingTaskData, 'ordering');
        }

        function checkOrderingTask() {
            const feedbackEl = document.getElementById('ordering_feedback');
            let allCorrect = true;
            let allFilled = true;
            const userAnswers = [];

            for (let i = 0; i < numOrderingItems; i++) {
                const inputEl = document.getElementById(`order_ans_${i}`);
                if (inputEl.value === '') {
                    allFilled = false;
                    inputEl.style.borderColor = 'red';
                } else {
                    const val = parseInt(inputEl.value);
                    if (isNaN(val)) {
                        allFilled = false; // Hibás input is kitöltetlennek számít
                        allCorrect = false;
                        inputEl.style.borderColor = 'red';
                        continue;
                    }
                    userAnswers.push(val);
                    if (val !== orderingTaskData.solution[i]) {
                        allCorrect = false;
                        inputEl.style.borderColor = 'red';
                    } else {
                        inputEl.style.borderColor = 'green';
                    }
                }
            }

            if (!allFilled) {
                feedbackEl.textContent = 'Kérlek, tölts ki minden mezőt helyes számokkal!';
                feedbackEl.className = 'feedback incorrect';
            } else if (allCorrect) {
                feedbackEl.textContent = 'Helyes a sorrend! Ügyes vagy! 👍';
                feedbackEl.className = 'feedback correct';
            } else {
                // Ellenőrizzük, hogy a felhasználó által beírt számok egyáltalán a feladatban szerepeltek-e
                const originalNumbersSet = new Set(orderingTaskData.numbers);
                const userAnswersSet = new Set(userAnswers);
                let numbersMatch = userAnswers.length === orderingTaskData.numbers.length &&
                                   userAnswers.every(val => originalNumbersSet.has(val)) &&
                                   orderingTaskData.numbers.every(val => userAnswersSet.has(val));

                if (!numbersMatch && userAnswers.length === numOrderingItems) {
                     feedbackEl.textContent = 'Figyelem! Nem a feladott hőmérsékleteket írtad be, vagy nem mindet. A sorrend sem jó. Próbáld újra! 🤔';
                } else {
                    feedbackEl.textContent = 'A sorrend nem tökéletes. Próbáld újra! 🤔';
                }
                feedbackEl.className = 'feedback incorrect';
            }
        }

        // --- Addition Task ---
        function generateAdditionTask() {
            let start, change;
            do {
                start = getRandomInt(numberRange.min, -1);
                change = getRandomInt(1, numberRange.max - start);
                if (start + change > numberRange.max) {
                    change = numberRange.max - start;
                }
            } while (change < 1); // Biztosítsuk, hogy a változás pozitív legyen és az eredmény a tartományon belül maradjon.


            additionTaskData.startNum = start;
            additionTaskData.changeNum = change;
            additionTaskData.result = start + change;

            document.getElementById('addition_start_temp_text').innerHTML = `<span class="number-box" style="background-color: #B0E0E6;">${additionTaskData.startNum}</span>`;
            document.getElementById('addition_change_temp_text').innerHTML = `<span class="number-box" style="background-color: #FFDAB9;">${additionTaskData.changeNum}</span>`;
            document.getElementById('addition_problem_display').innerHTML =
                `<span class="number-box" style="background-color: #B0E0E6;">${additionTaskData.startNum}°C</span> + ${additionTaskData.changeNum}°C = ?`;
            document.getElementById('addition_user_answer').value = '';
            document.getElementById('addition_feedback').textContent = '';
            document.getElementById('addition_feedback').className = 'feedback';
            document.getElementById('addition_user_answer').style.borderColor = '';
            drawNumberLine('addition_number_line', additionTaskData, 'addition');
        }

        function checkAdditionTask() {
            const userAnswer = parseInt(document.getElementById('addition_user_answer').value);
            const feedbackEl = document.getElementById('addition_feedback');
            const inputEl = document.getElementById('addition_user_answer');

            if (isNaN(userAnswer)) {
                feedbackEl.textContent = 'Kérlek, adj meg egy számot!';
                feedbackEl.className = 'feedback incorrect';
                inputEl.style.borderColor = 'red';
            } else if (userAnswer === additionTaskData.result) {
                feedbackEl.textContent = `Helyes! Az új hőmérséklet ${additionTaskData.result}°C. Bravo! ☀️`;
                feedbackEl.className = 'feedback correct';
                inputEl.style.borderColor = 'green';
            } else {
                feedbackEl.textContent = `Nem pontos. A helyes válasz ${additionTaskData.result}°C lenne. Próbáld újra! 🥶`;
                feedbackEl.className = 'feedback incorrect';
                inputEl.style.borderColor = 'red';
            }
        }

        // --- Subtraction Task ---
        function generateSubtractionTask() {
            let start, change;
             do {
                start = getRandomInt(1, numberRange.max);
                // A kivonandónak nagyobbnak kell lennie, hogy az eredmény negatív legyen (vagy legalább 0, ha a start is 0 lenne)
                // és az eredménynek a tartományon belül kell maradnia
                change = getRandomInt(start + 1, start + Math.abs(numberRange.min));
                if (start - change < numberRange.min) {
                    change = start - numberRange.min;
                }
            } while (change <= start || start - change < numberRange.min); // Biztosítjuk, hogy a change > start és az eredmény a range-ben van


            subtractionTaskData.startNum = start;
            subtractionTaskData.changeNum = change;
            subtractionTaskData.result = start - change;

            document.getElementById('subtraction_start_temp_text').innerHTML = `<span class="number-box" style="background-color: #FFECB3;">${subtractionTaskData.startNum}</span>`;
            document.getElementById('subtraction_change_temp_text').innerHTML = `<span class="number-box" style="background-color: #C5E1A5;">${subtractionTaskData.changeNum}</span>`;
            document.getElementById('subtraction_problem_display').innerHTML =
                `<span class="number-box" style="background-color: #FFECB3;">${subtractionTaskData.startNum}°C</span> - ${subtractionTaskData.changeNum}°C = ?`;
            document.getElementById('subtraction_user_answer').value = '';
            document.getElementById('subtraction_feedback').textContent = '';
            document.getElementById('subtraction_feedback').className = 'feedback';
            document.getElementById('subtraction_user_answer').style.borderColor = '';
            drawNumberLine('subtraction_number_line', subtractionTaskData, 'subtraction');
        }

        function checkSubtractionTask() {
            const userAnswer = parseInt(document.getElementById('subtraction_user_answer').value);
            const feedbackEl = document.getElementById('subtraction_feedback');
            const inputEl = document.getElementById('subtraction_user_answer');

            if (isNaN(userAnswer)) {
                feedbackEl.textContent = 'Kérlek, adj meg egy számot!';
                feedbackEl.className = 'feedback incorrect';
                inputEl.style.borderColor = 'red';
            } else if (userAnswer === subtractionTaskData.result) {
                feedbackEl.textContent = `Helyes! Az új hőmérséklet ${subtractionTaskData.result}°C. Szuper! ❄️`;
                feedbackEl.className = 'feedback correct';
                inputEl.style.borderColor = 'green';
            } else {
                feedbackEl.textContent = `Nem pontos. A helyes válasz ${subtractionTaskData.result}°C lenne. Próbáld újra! 🔥`;
                feedbackEl.className = 'feedback incorrect';
                inputEl.style.borderColor = 'red';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            applyTheme('theme-candy');
            generateOrderingTask();
            generateAdditionTask();
            generateSubtractionTask();
            window.dispatchEvent(new Event('resize'));
        });
        window.addEventListener('resize', () => {
            if(orderingTaskData.numbers && orderingTaskData.numbers.length > 0) drawNumberLine('ordering_number_line', orderingTaskData, 'ordering');
            if(typeof additionTaskData.startNum !== 'undefined') drawNumberLine('addition_number_line', additionTaskData, 'addition');
            if(typeof subtractionTaskData.startNum !== 'undefined') drawNumberLine('subtraction_number_line', subtractionTaskData, 'subtraction');
        });