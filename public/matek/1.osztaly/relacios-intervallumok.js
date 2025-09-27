let currentNumberRangeMax = 20;
        const SVG_NS = "http://www.w3.org/2000/svg";
        const problemColors = ["#FFD700", "#87CEEB", "#90EE90", "#FFA07A", "#3DE836", "#fFE03B"];

        // --- Színkezelő segédfüggvények ---
        function isColorLight(hex) {
            if (!hex || hex.length < 7) return true;
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);
            const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
            return hsp > 127.5;
        }

        function darkenColor(hex, percent) {
            if (!hex || hex.length < 7) return "#000000";
            let r = parseInt(hex.substring(1, 3), 16);
            let g = parseInt(hex.substring(3, 5), 16);
            let b = parseInt(hex.substring(5, 7), 16);
            r = Math.floor(r * (100 - percent) / 100);
            g = Math.floor(g * (100 - percent) / 100);
            b = Math.floor(b * (100 - percent) / 100);
            r = (r < 0) ? 0 : r;
            g = (g < 0) ? 0 : g;
            b = (b < 0) ? 0 : b;
            const toHex = (c) => ("0" + c.toString(16)).slice(-2);
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }


        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            if (min > max) {
                return min;
            }
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        // --- Feladatok adatstruktúrái ---
        let simpleTaskData = {
            taskIndex: 0,
            variableName: 'A',
            relation: '<',
            expr: { num1: 0, operator: '+', num2: 0, color1: '', color2: '', resultColor: '', trueResult: 0 },
            correctSolutions: []
        };

        const tasks = [
            null,
            { variableName: 'X', relation1: '<', relation2: '<', expr1: {}, expr2: {} },
            { variableName: 'Y', relation1: '>', relation2: '>', expr1: {}, expr2: {} },
            { variableName: 'Z', relation1: '<', relation2: '>', expr1: {}, expr2: {} },
            { variableName: 'W', relation1: '>', relation2: '<', expr1: {}, expr2: {} }
        ];

        // --- Kezelőfelület vezérlése ---
        const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');
        const rangeButtons = document.querySelectorAll('.range-button');

        function updateRangeInfo() {
            for (let i = 0; i <= 4; i++) {
                const rangeInfoEl = document.getElementById(`task_${i}_range_info`);
                if (rangeInfoEl) {
                    rangeInfoEl.textContent = `0-${currentNumberRangeMax}`;
                }
            }
        }

        function applyTheme(themeClass) {
            bodyEl.className = '';
            bodyEl.classList.add(themeClass);
            themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === themeClass));
            rangeButtons.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.range) === currentNumberRangeMax));
            
            // Újrarajzolás a témaváltás után
            if (simpleTaskData && simpleTaskData.expr && typeof simpleTaskData.expr.trueResult !== 'undefined') {
                 drawSimpleRelationNumberLine(0, simpleTaskData.expr.trueResult, simpleTaskData.relation, simpleTaskData.variableName, simpleTaskData.correctSolutions, [{value: simpleTaskData.expr.trueResult, color: simpleTaskData.expr.resultColor}]);
            }
            for (let i = 1; i < tasks.length; i++) {
                 if (tasks[i] && tasks[i].expr1 && typeof tasks[i].expr1.trueResult !== 'undefined' && tasks[i].expr2 && typeof tasks[i].expr2.trueResult !== 'undefined') {
                    const highlightedNumbers = [
                        { value: tasks[i].expr1.trueResult, color: tasks[i].expr1.resultColor },
                        { value: tasks[i].expr2.trueResult, color: tasks[i].expr2.resultColor }
                    ];
                    drawRelationNumberLine(i, tasks[i].expr1.trueResult, tasks[i].expr2.trueResult, tasks[i].relation1, tasks[i].relation2, highlightedNumbers);
                }
            }
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });

        rangeButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentNumberRangeMax = parseInt(button.dataset.range);
                rangeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateRangeInfo();
                generateAllTasks();
            });
        });
        
        // --- Feladatgenerálás ---

        function evaluateExpression(num1, operator, num2) {
            if (operator === '+') return num1 + num2;
            if (operator === '-') return num1 - num2;
            return NaN;
        }

        function generateExpression(exprObj, color1, color2, resultColor) {
            const operators = ['+', '-'];
            exprObj.operator = operators[Math.floor(Math.random() * operators.length)];
            
            let num1, num2;
            if (exprObj.operator === '+') {
                num1 = getRandomInt(0, Math.max(0, currentNumberRangeMax - 1)); 
                num2 = getRandomInt(0, Math.max(0, currentNumberRangeMax - num1));
            } else { // '-'
                num1 = getRandomInt(0, currentNumberRangeMax);
                num2 = getRandomInt(0, num1);
            }
            exprObj.num1 = num1;
            exprObj.num2 = num2;
            exprObj.color1 = color1;
            exprObj.color2 = color2;
            exprObj.resultColor = resultColor;
            exprObj.trueResult = evaluateExpression(exprObj.num1, exprObj.operator, exprObj.num2);
            if(exprObj.trueResult < 0 || exprObj.trueResult > currentNumberRangeMax) {
                return generateExpression(exprObj, color1, color2, resultColor);
            }
        }

        function generateNewSimpleTask() {
            const taskIndex = 0;
            simpleTaskData.variableName = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
            simpleTaskData.relation = ['<', '>'][Math.floor(Math.random() * 2)];

            do {
                generateExpression(simpleTaskData.expr, problemColors[0], problemColors[1], problemColors[4]);
                simpleTaskData.correctSolutions = [];
                if (simpleTaskData.relation === '<') {
                    for (let i = simpleTaskData.expr.trueResult + 1; i <= currentNumberRangeMax; i++) simpleTaskData.correctSolutions.push(i);
                } else {
                    for (let i = 0; i < simpleTaskData.expr.trueResult; i++) simpleTaskData.correctSolutions.push(i);
                }
            } while (simpleTaskData.correctSolutions.length === 0);

            const exprTextEl = document.getElementById(`task_${taskIndex}_expr_text`);
            const textColor1 = isColorLight(simpleTaskData.expr.color1) ? '#000' : '#fff';
            const spanStyle1 = `background-color:${simpleTaskData.expr.color1}; color:${textColor1}; border:1.5px solid ${darkenColor(simpleTaskData.expr.color1, 20)}; padding: 1px 6px; border-radius: 5px; display: inline-block;`;
            const textColor2 = isColorLight(simpleTaskData.expr.color2) ? '#000' : '#fff';
            const spanStyle2 = `background-color:${simpleTaskData.expr.color2}; color:${textColor2}; border:1.5px solid ${darkenColor(simpleTaskData.expr.color2, 20)}; padding: 1px 6px; border-radius: 5px; display: inline-block;`;
            exprTextEl.innerHTML = `<span style="${spanStyle1}">${simpleTaskData.expr.num1}</span> ${simpleTaskData.expr.operator} <span style="${spanStyle2}">${simpleTaskData.expr.num2}</span>`;
            
            const userResInput = document.getElementById(`task_${taskIndex}_user_res`);
            userResInput.value = '';
            userResInput.style.backgroundColor = simpleTaskData.expr.resultColor;
            userResInput.style.color = isColorLight(simpleTaskData.expr.resultColor) ? '#000' : '#fff';

            document.getElementById(`task_${taskIndex}_rel`).textContent = simpleTaskData.relation;
            document.querySelectorAll(`#task_${taskIndex}_container .task_var_name_placeholder`).forEach(el => el.textContent = simpleTaskData.variableName);
            document.getElementById(`task_${taskIndex}_var_name_display`).textContent = simpleTaskData.variableName;
            document.getElementById(`task_${taskIndex}_var_input_label`).textContent = `${simpleTaskData.variableName}:`;
            
            const varInputsContainer = document.getElementById(`task_${taskIndex}_var_inputs_container`);
            varInputsContainer.innerHTML = `<input type="number" class="variable-value-input" oninput="handleVariableInput(event, ${taskIndex})">`;
            
            document.getElementById(`task_${taskIndex}_feedback`).innerHTML = '';
            document.getElementById(`task_${taskIndex}_feedback`).className = 'feedback';
            varInputsContainer.querySelectorAll('.variable-value-input').forEach(input => input.style.borderColor = '');

            drawSimpleRelationNumberLine(taskIndex, simpleTaskData.expr.trueResult, simpleTaskData.relation, simpleTaskData.variableName, simpleTaskData.correctSolutions, [{ value: simpleTaskData.expr.trueResult, color: simpleTaskData.expr.resultColor }]);
            setTimeout(() => userResInput.focus(), 0);
        }

        function generateSingleTask(taskIndex) {
            const currentTask = tasks[taskIndex];
            if (!currentTask) return;

            let solvable = false;
            while (!solvable) {
                generateExpression(currentTask.expr1, problemColors[0], problemColors[1], problemColors[4]);
                generateExpression(currentTask.expr2, problemColors[2], problemColors[3], problemColors[5]);
                
                const res1 = currentTask.expr1.trueResult, res2 = currentTask.expr2.trueResult;
                let tempSolutions = [];
                if (taskIndex === 1) { for (let i = res1 + 1; i < res2; i++) tempSolutions.push(i); } 
                else if (taskIndex === 2) { for (let i = res2 + 1; i < res1; i++) tempSolutions.push(i); } 
                else if (taskIndex === 3) { for (let i = Math.max(res1, res2) + 1; i <= currentNumberRangeMax; i++) { if (i > res1 && i > res2) tempSolutions.push(i); } }
                else if (taskIndex === 4) { for (let i = 0; i < Math.min(res1, res2); i++) { if (i < res1 && i < res2) tempSolutions.push(i); } }
                solvable = tempSolutions.length > 0;
            }
            
            const expr1El = document.getElementById(`task_${taskIndex}_expr1_text`);
            const textColor1_1 = isColorLight(currentTask.expr1.color1) ? '#000' : '#fff';
            const spanStyle1_1 = `background-color:${currentTask.expr1.color1}; color:${textColor1_1}; border:1.5px solid ${darkenColor(currentTask.expr1.color1, 20)}; padding: 1px 6px; border-radius: 5px; display: inline-block;`;
            const textColor1_2 = isColorLight(currentTask.expr1.color2) ? '#000' : '#fff';
            const spanStyle1_2 = `background-color:${currentTask.expr1.color2}; color:${textColor1_2}; border:1.5px solid ${darkenColor(currentTask.expr1.color2, 20)}; padding: 1px 6px; border-radius: 5px; display: inline-block;`;
            expr1El.innerHTML = `<span style="${spanStyle1_1}">${currentTask.expr1.num1}</span> ${currentTask.expr1.operator} <span style="${spanStyle1_2}">${currentTask.expr1.num2}</span>`;
            
            const expr2El = document.getElementById(`task_${taskIndex}_expr2_text`);
            const textColor2_1 = isColorLight(currentTask.expr2.color1) ? '#000' : '#fff';
            const spanStyle2_1 = `background-color:${currentTask.expr2.color1}; color:${textColor2_1}; border:1.5px solid ${darkenColor(currentTask.expr2.color1, 20)}; padding: 1px 6px; border-radius: 5px; display: inline-block;`;
            const textColor2_2 = isColorLight(currentTask.expr2.color2) ? '#000' : '#fff';
            const spanStyle2_2 = `background-color:${currentTask.expr2.color2}; color:${textColor2_2}; border:1.5px solid ${darkenColor(currentTask.expr2.color2, 20)}; padding: 1px 6px; border-radius: 5px; display: inline-block;`;
            expr2El.innerHTML = `<span style="${spanStyle2_1}">${currentTask.expr2.num1}</span> ${currentTask.expr2.operator} <span style="${spanStyle2_2}">${currentTask.expr2.num2}</span>`;

            const userRes1Input = document.getElementById(`task_${taskIndex}_user_res1`);
            userRes1Input.value = '';
            userRes1Input.style.backgroundColor = currentTask.expr1.resultColor;
            userRes1Input.style.color = isColorLight(currentTask.expr1.resultColor) ? '#000' : '#fff';

            const userRes2Input = document.getElementById(`task_${taskIndex}_user_res2`);
            userRes2Input.value = '';
            userRes2Input.style.backgroundColor = currentTask.expr2.resultColor;
            userRes2Input.style.color = isColorLight(currentTask.expr2.resultColor) ? '#000' : '#fff';

            document.getElementById(`task_${taskIndex}_rel1`).innerHTML = currentTask.relation1.replace('<=', '&le;').replace('>=', '&ge;');
            document.getElementById(`task_${taskIndex}_rel2`).innerHTML = currentTask.relation2.replace('<=', '&le;').replace('>=', '&ge;');

            const varInputsContainer = document.getElementById(`task_${taskIndex}_var_inputs_container`);
            varInputsContainer.innerHTML = `<input type="number" class="variable-value-input" oninput="handleVariableInput(event, ${taskIndex})">`;
            
            document.getElementById(`task_${taskIndex}_feedback`).innerHTML = '';
            document.getElementById(`task_${taskIndex}_feedback`).className = 'feedback';
            varInputsContainer.querySelectorAll('.variable-value-input').forEach(input => input.style.borderColor = '');
            
            const highlightedNumbers = [
                { value: currentTask.expr1.trueResult, color: currentTask.expr1.resultColor },
                { value: currentTask.expr2.trueResult, color: currentTask.expr2.resultColor }
            ];
            drawRelationNumberLine(taskIndex, currentTask.expr1.trueResult, currentTask.expr2.trueResult, currentTask.relation1, currentTask.relation2, highlightedNumbers);
            setTimeout(() => userRes1Input.focus(), 0);
        }

        function generateAllTasks() {
            generateNewSimpleTask();
            for (let i = 1; i < tasks.length; i++) {
                if (tasks[i]) generateSingleTask(i);
            }
            const initialFocusElement = document.getElementById('task_0_user_res');
            if (initialFocusElement) {
                setTimeout(() => initialFocusElement.focus(), 0);
            }
        }
        
        // --- Input kezelés és ellenőrzés (NINCS VÁLTOZÁS) ---
        function handleVariableInput(event, taskIndex) {
            const currentInput = event.target;
            const parentDiv = currentInput.parentElement;
            const inputsSnapshot = Array.from(parentDiv.querySelectorAll('input.variable-value-input'));
            const currentIndex = inputsSnapshot.indexOf(currentInput);

            if (currentInput.value.trim() !== '' && currentIndex === inputsSnapshot.length - 1) {
                const newInput = document.createElement('input');
                newInput.type = 'number';
                newInput.classList.add('variable-value-input');
                newInput.oninput = (e) => handleVariableInput(e, taskIndex);
                parentDiv.appendChild(newInput);
            }

            if (currentInput.value.length >= String(currentNumberRangeMax).length) {
                const nextInput = inputsSnapshot[currentIndex + 1];
                if (nextInput) {
                    setTimeout(() => nextInput.focus(), 0);
                }
            }
        }

        function checkNewSimpleTask(taskIndex) { /* ... A kód ezen része nem változott ... */ }
        function checkTask(taskIndex) { /* ... A kód ezen része nem változott ... */ }
        function setupFocusHandlers() { /* ... A kód ezen része nem változott ... */ }

        // --- Számegyenes rajzolás ---
        function drawSimpleRelationNumberLine(taskIndex, boundaryValue, relation, varName, validSolutions, highlightedNumbers) {
             const svgId = `numberLine_task_${taskIndex}`; 
            const svg = document.getElementById(svgId);
            if (!svg || typeof boundaryValue === 'undefined') return;
            svg.innerHTML = '';

            const viewBoxWidth = 500;
            const viewBoxHeight = 100;
            svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

            const padding = 35;
            const yAxis = viewBoxHeight / 2 + 10;
            const yNumbers = yAxis + 23;
            const yInterval = yAxis - 15; 
            const tickHeight = 6;
            const endpointRadius = 5;
            const intervalArrowHeadSize = 4;

            const defs = document.createElementNS(SVG_NS, 'defs');
            const marker = document.createElementNS(SVG_NS, 'marker');
            const markerId = `simple_interval_arrow_${taskIndex}`;
            marker.setAttribute('id', markerId);
            marker.setAttribute('viewBox', `0 0 ${intervalArrowHeadSize*2} ${intervalArrowHeadSize*2}`);
            marker.setAttribute('refX', intervalArrowHeadSize*2);
            marker.setAttribute('refY', intervalArrowHeadSize);
            marker.setAttribute('markerWidth', intervalArrowHeadSize);
            marker.setAttribute('markerHeight', intervalArrowHeadSize);
            marker.setAttribute('orient', "auto-start-reverse");
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', `M 0 0 L ${intervalArrowHeadSize*2} ${intervalArrowHeadSize} L 0 ${intervalArrowHeadSize*2} z`);
            path.classList.add('arrow-head', 'primary'); 
            marker.appendChild(path);
            defs.appendChild(marker);
            svg.appendChild(defs);

            const usableWidth = viewBoxWidth - 2 * padding;
            const displayMax = Math.max(currentNumberRangeMax, boundaryValue);
            const spacing = displayMax > 0 ? usableWidth / displayMax : usableWidth;

            const axisLine = document.createElementNS(SVG_NS, 'line');
            axisLine.setAttribute('x1', padding); axisLine.setAttribute('y1', yAxis);
            axisLine.setAttribute('x2', viewBoxWidth - padding); axisLine.setAttribute('y2', yAxis);
            axisLine.setAttribute('class', 'axis');
            svg.appendChild(axisLine);

            const g = document.createElementNS(SVG_NS, 'g');
            for (let i = 0; i <= displayMax; i++) {
                const x = padding + i * spacing;
                 if (x > viewBoxWidth - padding + 5) continue;
                const tick = document.createElementNS(SVG_NS, "line");
                tick.setAttribute("class", "tick");
                tick.setAttribute("x1", x); tick.setAttribute("y1", yAxis - tickHeight / 2);
                tick.setAttribute("x2", x); tick.setAttribute("y2", yAxis + tickHeight / 2);
                g.appendChild(tick);

                const isHighlighted = highlightedNumbers.some(h => h.value === i);
                if (i % (displayMax <= 10 ? 1 : (displayMax <= 20 ? 1 : 2)) === 0 || i === 0 || i === displayMax || isHighlighted) {
                    const highlight = highlightedNumbers.find(h => h.value === i);
                    const numText = document.createElementNS(SVG_NS, 'text');
                    numText.setAttribute('x', x);
                    numText.setAttribute('y', yNumbers);
                    numText.textContent = i;
                    numText.setAttribute('class', 'number-text');

                    if (highlight) {
                        const textWidth = String(i).length * 7 + 8;
                        const rect = document.createElementNS(SVG_NS, "rect");
                        rect.setAttribute("x", x - textWidth / 2);
                        rect.setAttribute("y", yNumbers - 5);
                        rect.setAttribute("width", textWidth);
                        rect.setAttribute("height", 18);
                        rect.setAttribute("fill", highlight.color);
                        rect.setAttribute("stroke", darkenColor(highlight.color, 25));
                        rect.setAttribute("stroke-width", "1.5");
                        rect.setAttribute("rx", 4);
                        g.appendChild(rect);
                        
                        numText.setAttribute('fill', isColorLight(highlight.color) ? '#000000' : '#FFFFFF');
                    } else {
                         numText.setAttribute('fill', 'var(--numberline-text-color, #333)');
                    }
                    g.appendChild(numText);
                }
            }
            svg.appendChild(g);
            
            const boundaryX = padding + boundaryValue * spacing;
             if (boundaryX < padding || boundaryX > viewBoxWidth - padding) {}

            const endpointCircle = document.createElementNS(SVG_NS, 'circle');
            endpointCircle.setAttribute('cx', boundaryX);
            endpointCircle.setAttribute('cy', yInterval);
            endpointCircle.setAttribute('r', endpointRadius);
            endpointCircle.classList.add('interval-endpoint', 'primary', 'open');
            svg.appendChild(endpointCircle);

            const boundaryLabel = document.createElementNS(SVG_NS, 'text');
            boundaryLabel.setAttribute('x', boundaryX);
            boundaryLabel.setAttribute('y', yInterval - endpointRadius - 5);
            boundaryLabel.textContent = boundaryValue;
            boundaryLabel.setAttribute('class', 'value-label');
            svg.appendChild(boundaryLabel);

            const intervalLine = document.createElementNS(SVG_NS, 'line');
            intervalLine.setAttribute('y1', yInterval);
            intervalLine.setAttribute('y2', yInterval);
            intervalLine.classList.add('interval-line', 'primary');

            if (relation === '<') { 
                if (boundaryValue < currentNumberRangeMax && validSolutions && validSolutions.length > 0) { 
                    let lineStartX = boundaryX;
                    let lineEndX = padding + currentNumberRangeMax * spacing; 
                    lineEndX = Math.min(lineEndX, viewBoxWidth - padding);
                    intervalLine.setAttribute('x1', lineStartX);
                    intervalLine.setAttribute('x2', lineEndX);
                    if (lineEndX > lineStartX + endpointRadius) {
                         intervalLine.setAttribute('marker-end', `url(#${markerId})`);
                    }
                }
            } else { 
                if (boundaryValue > 0 && validSolutions && validSolutions.length > 0) { 
                    let lineStartX = padding;
                    let lineEndX = boundaryX;
                    intervalLine.setAttribute('x1', lineStartX);
                    intervalLine.setAttribute('x2', lineEndX);
                     if (lineEndX > lineStartX + endpointRadius) {
                        intervalLine.setAttribute('marker-start', `url(#${markerId})`);
                    }
                }
            }
            if (validSolutions && validSolutions.length > 0 && intervalLine.hasAttribute('x1') && intervalLine.hasAttribute('x2')) { 
                 svg.appendChild(intervalLine);
            }
        }

        function drawRelationNumberLine(taskIndex, val1, val2, rel1, rel2, highlightedNumbers = []) {
            const svgId = `numberLine_task_${taskIndex}`;
            const svg = document.getElementById(svgId);
            if (!svg || typeof val1 === 'undefined' || typeof val2 === 'undefined') return;
            svg.innerHTML = ''; 

            const verticalElementSpacing = 20; 
            let viewBoxHeight = 100; 
            let yAxis = viewBoxHeight / 2 + 10; 
            let yIntervalSingle = yAxis - 15; 
            let yIntervalBottom, yIntervalTop; 

            if (taskIndex === 3 || taskIndex === 4) { 
                viewBoxHeight = 120; 
                yAxis = viewBoxHeight / 2; 
                yIntervalBottom = yAxis - verticalElementSpacing;
                yIntervalTop = yIntervalBottom - verticalElementSpacing; 
            }
            svg.setAttribute('viewBox', `0 0 500 ${viewBoxHeight}`);

            const viewBoxWidth = 500;
            const padding = 35; 
            const yNumbers = yAxis + 23; 
            const tickHeight = 6; 
            const endpointRadius = 5; 
            const intervalArrowHeadSize = 3; 

            const defs = document.createElementNS(SVG_NS, 'defs');
            
            function createIntervalMarker(idSuffix, typeClass) {
                const marker = document.createElementNS(SVG_NS, 'marker');
                marker.setAttribute('id', `interval_arrow_${taskIndex}_${idSuffix}`);
                marker.setAttribute('viewBox', `0 0 ${intervalArrowHeadSize*2} ${intervalArrowHeadSize*2}`); 
                marker.setAttribute('refX', intervalArrowHeadSize*2); 
                marker.setAttribute('refY', intervalArrowHeadSize);   
                marker.setAttribute('markerWidth', intervalArrowHeadSize); 
                marker.setAttribute('markerHeight', intervalArrowHeadSize); 
                marker.setAttribute('orient', "auto-start-reverse");
                const path = document.createElementNS(SVG_NS, 'path');
                path.setAttribute('d', `M 0 0 L ${intervalArrowHeadSize*2} ${intervalArrowHeadSize} L 0 ${intervalArrowHeadSize*2} z`); 
                path.classList.add('arrow-head', typeClass); 
                marker.appendChild(path);
                defs.appendChild(marker);
            }
            createIntervalMarker('primary', 'primary');
            if (taskIndex === 3 || taskIndex === 4) {
                 createIntervalMarker('secondary', 'secondary');
            }
            svg.appendChild(defs);
            
            const usableWidth = viewBoxWidth - 2 * padding;
            const displayMax = Math.max(currentNumberRangeMax, val1, val2);
            const spacing = displayMax > 0 ? usableWidth / displayMax : usableWidth;

            const axisLine = document.createElementNS(SVG_NS, 'line');
            axisLine.setAttribute('x1', padding); 
            axisLine.setAttribute('y1', yAxis);
            axisLine.setAttribute('x2', viewBoxWidth - padding); 
            axisLine.setAttribute('y2', yAxis);
            axisLine.setAttribute('class', 'axis');
            svg.appendChild(axisLine);

            const g = document.createElementNS(SVG_NS, 'g');
            for (let i = 0; i <= displayMax; i++) {
                const x = padding + i * spacing;
                 if (x > viewBoxWidth - padding + 5) continue; 
                const tick = document.createElementNS(SVG_NS, 'line');
                tick.setAttribute('x1', x);
                tick.setAttribute('y1', yAxis - tickHeight / 2);
                tick.setAttribute('x2', x);
                tick.setAttribute('y2', yAxis + tickHeight / 2);
                tick.setAttribute('class', 'tick');
                g.appendChild(tick);

                const isHighlighted = highlightedNumbers.some(h => h.value === i);
                if (i % (displayMax <= 10 ? 1 : (displayMax <= 20 ? 1 : 2)) === 0 || i === 0 || i === displayMax || isHighlighted) {
                     const highlight = highlightedNumbers.find(h => h.value === i);
                    const numText = document.createElementNS(SVG_NS, 'text');
                    numText.setAttribute('x', x);
                    numText.setAttribute('y', yNumbers); 
                    numText.textContent = i;
                    numText.setAttribute('class', 'number-text');
                    
                    if (highlight) {
                        const textWidth = String(i).length * 7 + 8;
                        const rect = document.createElementNS(SVG_NS, "rect");
                        rect.setAttribute("x", x - textWidth / 2);
                        rect.setAttribute("y", yNumbers - 5);
                        rect.setAttribute("width", textWidth);
                        rect.setAttribute("height", 18);
                        rect.setAttribute("fill", highlight.color);
                        rect.setAttribute("stroke", darkenColor(highlight.color, 25));
                        rect.setAttribute("stroke-width", "1.5");
                        rect.setAttribute("rx", 4);
                        g.appendChild(rect);

                        numText.setAttribute('fill', isColorLight(highlight.color) ? '#000000' : '#FFFFFF');
                    } else {
                        numText.setAttribute('fill', 'var(--numberline-text-color, #333)');
                    }
                    g.appendChild(numText);
                }
            }
            svg.appendChild(g);
            
            function createEndpoint(cx, yPos, isOpen, typeClass) {
                const circle = document.createElementNS(SVG_NS, 'circle');
                circle.setAttribute('cx', cx);
                circle.setAttribute('cy', yPos);
                circle.setAttribute('r', endpointRadius);
                circle.classList.add('interval-endpoint', typeClass);
                circle.classList.add(isOpen ? 'open' : 'closed');
                return circle;
            }

            function createValueLabel(x, yPos, value) {
                const label = document.createElementNS(SVG_NS, 'text');
                label.setAttribute('x', x);
                label.setAttribute('y', yPos - endpointRadius - 5); 
                label.textContent = value;
                label.setAttribute('class', 'value-label');
                return label;
            }

            function drawSingleIntervalRay(yPos, boundaryValue, relationIsLess, isPrimaryInterval) {
                let lineX1, lineX2, endpointX;
                const typeClass = isPrimaryInterval ? 'primary' : 'secondary';
                const markerId = `interval_arrow_${taskIndex}_${typeClass}`;

                endpointX = padding + boundaryValue * spacing;
                const endpointIsOpen = true; 


                const intervalLine = document.createElementNS(SVG_NS, 'line');
                intervalLine.setAttribute('y1', yPos);
                intervalLine.setAttribute('y2', yPos);
                intervalLine.classList.add('interval-line', typeClass);

                if (relationIsLess) { 
                    if (boundaryValue <= 0) return; 
                    lineX1 = padding; 
                    lineX2 = endpointX; 
                    intervalLine.setAttribute('x1', lineX1);
                    intervalLine.setAttribute('x2', lineX2);
                    if (endpointX > padding + endpointRadius) { 
                        intervalLine.setAttribute('marker-start', `url(#${markerId})`);
                    }
                } else { 
                    if (boundaryValue >= currentNumberRangeMax) return; 
                    lineX1 = endpointX; 
                    lineX2 = padding + currentNumberRangeMax * spacing;
                    lineX2 = Math.min(lineX2, viewBoxWidth - padding); 
                    intervalLine.setAttribute('x1', lineX1);
                    intervalLine.setAttribute('x2', lineX2);
                     if (lineX2 > lineX1 + endpointRadius) { 
                        intervalLine.setAttribute('marker-end', `url(#${markerId})`);
                    }
                }
                if (intervalLine.hasAttribute('x1') && intervalLine.hasAttribute('x2')) {
                    svg.appendChild(intervalLine);
                    svg.appendChild(createEndpoint(endpointX, yPos, endpointIsOpen, typeClass));
                    svg.appendChild(createValueLabel(endpointX, yPos, boundaryValue));
                }
            }


            if (taskIndex === 1 || taskIndex === 2) { 
                let lowerBound, upperBound;
                
                if (taskIndex === 1) { 
                    lowerBound = val1; upperBound = val2;
                } else { 
                    lowerBound = val2; upperBound = val1;
                }
                
                if (lowerBound >= upperBound -1 ) return; 

                let intervalLineX1 = padding + lowerBound * spacing;
                let intervalLineX2 = padding + upperBound * spacing;

                const intervalLine = document.createElementNS(SVG_NS, 'line');
                intervalLine.setAttribute('x1', intervalLineX1);
                intervalLine.setAttribute('y1', yIntervalSingle);
                intervalLine.setAttribute('x2', intervalLineX2);
                intervalLine.setAttribute('y2', yIntervalSingle);
                intervalLine.classList.add('interval-line', 'primary');
                svg.appendChild(intervalLine);

                svg.appendChild(createEndpoint(intervalLineX1, yIntervalSingle, true, 'primary'));
                svg.appendChild(createValueLabel(intervalLineX1, yIntervalSingle, lowerBound));
                
                svg.appendChild(createEndpoint(intervalLineX2, yIntervalSingle, true, 'primary'));
                svg.appendChild(createValueLabel(intervalLineX2, yIntervalSingle, upperBound));

            } else if (taskIndex === 3) { 
                drawSingleIntervalRay(yIntervalTop, val1, false, true); 
                drawSingleIntervalRay(yIntervalBottom, val2, false, false);

            } else if (taskIndex === 4) { 
                drawSingleIntervalRay(yIntervalTop, val1, true, true); 
                drawSingleIntervalRay(yIntervalBottom, val2, true, false);
            }
        }
        
        // --- Indítás ---
        document.addEventListener('DOMContentLoaded', () => {
            // A check és focus handler függvények itt következnek, mivel nem változtak.
            // A rövidség kedvéért a teljes, de változatlan check/focus kódot a HTML-be ágyazva képzeljük el.
            
            // --- checkNewSimpleTask (VÁLTOZATLAN) ---
            window.checkNewSimpleTask = function(taskIndex) {
                 const currentTaskData = simpleTaskData;
                const feedbackEl = document.getElementById(`task_${taskIndex}_feedback`);
                feedbackEl.innerHTML = ''; 
                feedbackEl.className = 'feedback'; 

                const userResEl = document.getElementById(`task_${taskIndex}_user_res`);
                const userExprRes = parseInt(userResEl.value);

                let feedbackMessages = [];
                let calculationCorrect = false;

                if (isNaN(userExprRes)) {
                    feedbackMessages.push(`<li>A kifejezéshez nem adtál meg eredményt.</li>`);
                    userResEl.style.borderColor = 'red';
                } else if (userExprRes !== currentTaskData.expr.trueResult) {
                    feedbackMessages.push(`<li>A kifejezés (${currentTaskData.expr.num1} ${currentTaskData.expr.operator} ${currentTaskData.expr.num2}) eredménye helytelen. A te eredményed: ${userExprRes}, a helyes: ${currentTaskData.expr.trueResult}.</li>`);
                    userResEl.style.borderColor = 'red';
                } else {
                    feedbackMessages.push(`<li>A kifejezés eredménye helyes: ${userExprRes}.</li>`);
                    userResEl.style.borderColor = 'green';
                    calculationCorrect = true;
                }
                
                const varInputsContainer = document.getElementById(`task_${taskIndex}_var_inputs_container`);
                const varValueInputs = varInputsContainer.querySelectorAll('.variable-value-input');
                let userEnteredSolutions = [];
                varValueInputs.forEach(inputEl => {
                    if (inputEl.value.trim() !== '') {
                        const val = parseInt(inputEl.value);
                        if (!isNaN(val)) userEnteredSolutions.push(val);
                    }
                });
                userEnteredSolutions = [...new Set(userEnteredSolutions)].sort((a, b) => a - b);

                let allVarValuesCorrect = true;
                let hasVarValues = userEnteredSolutions.length > 0;
                let varFeedbackMessages = [];
                const correctSolutions = currentTaskData.correctSolutions.sort((a,b) => a - b);

                if (!hasVarValues && correctSolutions.length > 0) {
                    allVarValuesCorrect = false;
                    varFeedbackMessages.push(`<li>Nem adtál meg ${currentTaskData.variableName} értéket.</li>`);
                } else if (hasVarValues || correctSolutions.length === 0) {
                    if (userEnteredSolutions.length !== correctSolutions.length) {
                        allVarValuesCorrect = false;
                    } else {
                        for (let i = 0; i < userEnteredSolutions.length; i++) {
                            if (userEnteredSolutions[i] !== correctSolutions[i]) {
                                allVarValuesCorrect = false; break;
                            }
                        }
                    }
                }
                
                const displayVarValues = userEnteredSolutions.join(', ') || (correctSolutions.length === 0 ? 'nincs ilyen érték' : 'nem adtál meg');
                if (allVarValuesCorrect && (hasVarValues || correctSolutions.length === 0)) {
                     varFeedbackMessages.push(`<li>A megadott ${currentTaskData.variableName} értékek (${displayVarValues}) helyesek.</li>`);
                     varValueInputs.forEach(inputEl => { if(inputEl.value.trim() !== '') inputEl.style.borderColor = 'green';});
                } else if (hasVarValues) {
                    varFeedbackMessages.push(`<li>A megadott ${currentTaskData.variableName} értékek (${displayVarValues}) nem tökéletesek.</li>`);
                    if (calculationCorrect) varFeedbackMessages.push(`<li>A helyes ${currentTaskData.variableName} értékek (${currentTaskData.expr.trueResult} ${currentTaskData.relation} ${currentTaskData.variableName}): ${correctSolutions.length > 0 ? correctSolutions.join(', ') : 'nincs megoldás az adott számkörben'}.</li>`);
                     varValueInputs.forEach(inputEl => { if (inputEl.value.trim() !== '') inputEl.style.borderColor = 'red'; });
                } else if (!hasVarValues && correctSolutions.length > 0 && calculationCorrect) {
                     varFeedbackMessages.push(`<li>A helyes ${currentTaskData.variableName} értékek (${currentTaskData.expr.trueResult} ${currentTaskData.relation} ${currentTaskData.variableName}): ${correctSolutions.join(', ')}.</li>`);
                }

                if (varFeedbackMessages.length > 0) {
                    feedbackMessages.push(`<li>A ${currentTaskData.variableName} értékek ellenőrzése:</li>`);
                    feedbackMessages.push(`<ul>${varFeedbackMessages.join('')}</ul>`);
                }

                if (calculationCorrect && allVarValuesCorrect && (hasVarValues || correctSolutions.length === 0)) {
                    feedbackEl.classList.add('correct');
                    feedbackMessages.unshift('<li>Minden helyes! Ügyes vagy! 🎉</li>');
                } else {
                    feedbackEl.classList.add('incorrect');
                }
                feedbackEl.innerHTML = `<ul>${feedbackMessages.join('')}</ul>`;
            }

            // --- checkTask (VÁLTOZATLAN) ---
            window.checkTask = function(taskIndex) {
                const currentTask = tasks[taskIndex];
                const feedbackEl = document.getElementById(`task_${taskIndex}_feedback`);
                feedbackEl.innerHTML = ''; 
                feedbackEl.className = 'feedback'; 

                const userRes1El = document.getElementById(`task_${taskIndex}_user_res1`);
                const userRes2El = document.getElementById(`task_${taskIndex}_user_res2`);
                const userRes1 = parseInt(userRes1El.value);
                const userRes2 = parseInt(userRes2El.value);

                let feedbackMessages = [];
                let allCalculationsCorrect = true;

                if (isNaN(userRes1)) {
                    feedbackMessages.push(`<li>Az első kifejezéshez nem adtál meg eredményt.</li>`);
                    userRes1El.style.borderColor = 'red';
                    allCalculationsCorrect = false;
                } else if (userRes1 !== currentTask.expr1.trueResult) {
                    feedbackMessages.push(`<li>Az első kifejezés (${currentTask.expr1.num1} ${currentTask.expr1.operator} ${currentTask.expr1.num2}) eredménye helytelen. A te eredményed: ${userRes1}, a helyes eredmény: ${currentTask.expr1.trueResult}.</li>`);
                    userRes1El.style.borderColor = 'red';
                    allCalculationsCorrect = false;
                } else {
                    feedbackMessages.push(`<li>Az első kifejezés eredménye helyes: ${userRes1}.</li>`);
                    userRes1El.style.borderColor = 'green';
                }

                if (isNaN(userRes2)) {
                    feedbackMessages.push(`<li>A második kifejezéshez nem adtál meg eredményt.</li>`);
                    userRes2El.style.borderColor = 'red';
                    allCalculationsCorrect = false;
                } else if (userRes2 !== currentTask.expr2.trueResult) {
                    feedbackMessages.push(`<li>A második kifejezés (${currentTask.expr2.num1} ${currentTask.expr2.operator} ${currentTask.expr2.num2}) eredménye helytelen. A te eredményed: ${userRes2}, a helyes eredmény: ${currentTask.expr2.trueResult}.</li>`);
                    userRes2El.style.borderColor = 'red';
                    allCalculationsCorrect = false;
                } else {
                    feedbackMessages.push(`<li>A második kifejezés eredménye helyes: ${userRes2}.</li>`);
                    userRes2El.style.borderColor = 'green';
                }
                
                if (isNaN(userRes1) || isNaN(userRes2)) {
                     feedbackEl.innerHTML = `<ul>${feedbackMessages.join('')}</ul>`;
                     feedbackEl.classList.add('incorrect');
                     return;
                }

                const varInputsContainer = document.getElementById(`task_${taskIndex}_var_inputs_container`);
                const varValueInputs = varInputsContainer.querySelectorAll('.variable-value-input');
                let userEnteredSolutions = [];
                varValueInputs.forEach(inputEl => {
                    if (inputEl.value.trim() !== '') {
                        const val = parseInt(inputEl.value);
                        if (!isNaN(val)) userEnteredSolutions.push(val);
                    }
                });
                userEnteredSolutions = [...new Set(userEnteredSolutions)].sort((a, b) => a - b);

                let allVarValuesCorrect = true; 
                let hasVarValues = userEnteredSolutions.length > 0;
                let varFeedbackMessages = [];
                
                let correctSolutionsSet = [];
                const trueRes1 = currentTask.expr1.trueResult;
                const trueRes2 = currentTask.expr2.trueResult;

                if (taskIndex === 1) { for (let i = trueRes1 + 1; i < trueRes2; i++) correctSolutionsSet.push(i); }
                else if (taskIndex === 2) { for (let i = trueRes2 + 1; i < trueRes1; i++) correctSolutionsSet.push(i); }
                else if (taskIndex === 3) { const lowerLimit = Math.max(trueRes1, trueRes2); for (let i = lowerLimit + 1; i <= currentNumberRangeMax; i++) {if (i > trueRes1 && i > trueRes2) correctSolutionsSet.push(i);} }
                else if (taskIndex === 4) { const upperLimit = Math.min(trueRes1, trueRes2); for (let i = 0; i < upperLimit; i++) {if (i < trueRes1 && i < trueRes2) correctSolutionsSet.push(i);} }
                correctSolutionsSet.sort((a,b) => a-b);


                if (!hasVarValues && correctSolutionsSet.length > 0) {
                    allVarValuesCorrect = false;
                    varFeedbackMessages.push(`<li>Nem adtál meg ${currentTask.variableName} értéket.</li>`);
                } else if (hasVarValues || correctSolutionsSet.length === 0) { 
                    if (userEnteredSolutions.length !== correctSolutionsSet.length) {
                        allVarValuesCorrect = false;
                    } else {
                        for (let i = 0; i < userEnteredSolutions.length; i++) {
                            if (userEnteredSolutions[i] !== correctSolutionsSet[i]) {
                                allVarValuesCorrect = false; break;
                            }
                        }
                    }
                }
                
                const displayUserVarValues = userEnteredSolutions.join(', ') || (correctSolutionsSet.length === 0 ? 'nincs ilyen érték' : 'nem adtál meg');
                if (allVarValuesCorrect && (hasVarValues || correctSolutionsSet.length === 0) ) { 
                     varFeedbackMessages.push(`<li>A megadott ${currentTask.variableName} értékek (${displayUserVarValues}) mind helyesek.</li>`);
                     varValueInputs.forEach(inputEl => { if(inputEl.value.trim() !== '') inputEl.style.borderColor = 'green';});
                } else if (hasVarValues) { 
                    varFeedbackMessages.push(`<li>A megadott ${currentTask.variableName} értékek (${displayUserVarValues}) nem tökéletesek.</li>`);
                    if (allCalculationsCorrect) varFeedbackMessages.push(`<li>A helyes ${currentTask.variableName} értékek (a(z) ${trueRes1} és ${trueRes2} alapján): ${correctSolutionsSet.length > 0 ? correctSolutionsSet.join(', ') : 'nincs megoldás az adott számkörben'}.</li>`);
                     varValueInputs.forEach(inputEl => { if (inputEl.value.trim() !== '') inputEl.style.borderColor = 'red'; });
                } else if (!hasVarValues && correctSolutionsSet.length > 0 && allCalculationsCorrect) { 
                     varFeedbackMessages.push(`<li>A helyes ${currentTask.variableName} értékek (a(z) ${trueRes1} és ${trueRes2} alapján): ${correctSolutionsSet.join(', ')}.</li>`);
                }

                if (varFeedbackMessages.length > 0) {
                     feedbackMessages.push(`<li>A ${currentTask.variableName} értékek ellenőrzése:</li>`);
                     feedbackMessages.push(`<ul>${varFeedbackMessages.join('')}</ul>`);
                }
                
                if (allCalculationsCorrect && allVarValuesCorrect && (hasVarValues || correctSolutionsSet.length === 0) ) {
                    feedbackEl.classList.add('correct');
                    feedbackMessages.unshift('<li>Minden helyes! Ügyes vagy!</li>');
                }
                else {
                    feedbackEl.classList.add('incorrect');
                }
                feedbackEl.innerHTML = `<ul>${feedbackMessages.join('')}</ul>`;
            }

            // --- setupFocusHandlers (VÁLTOZATLAN) ---
            window.setupFocusHandlers = function() {
                const task0ResInput = document.getElementById('task_0_user_res');
                if (task0ResInput) {
                    task0ResInput.addEventListener('input', function() {
                        const expectedLength = String(simpleTaskData.expr.trueResult).length;
                        if (this.value.length >= expectedLength) { 
                            const nextElementContainer = document.getElementById('task_0_var_inputs_container');
                            if (nextElementContainer) {
                                const firstVarInput = nextElementContainer.querySelector('.variable-value-input');
                                if (firstVarInput) setTimeout(() => firstVarInput.focus(), 0);
                            }
                        }
                    });
                }

                for (let i = 1; i <= 4; i++) {
                    const taskRes1Input = document.getElementById(`task_${i}_user_res1`);
                    const taskRes2Input = document.getElementById(`task_${i}_user_res2`);
                    const taskVarContainer = document.getElementById(`task_${i}_var_inputs_container`);

                    if (taskRes1Input && taskRes2Input) {
                        taskRes1Input.addEventListener('input', function() {
                            const expectedLength = String(tasks[i].expr1.trueResult).length;
                            if (this.value.length >= expectedLength) {
                                setTimeout(() => taskRes2Input.focus(), 0);
                            }
                        });
                    }

                    if (taskRes2Input && taskVarContainer) {
                        taskRes2Input.addEventListener('input', function() {
                            const expectedLength = String(tasks[i].expr2.trueResult).length;
                            if (this.value.length >= expectedLength) {
                                const firstVarInput = taskVarContainer.querySelector('.variable-value-input');
                                if (firstVarInput) setTimeout(() => firstVarInput.focus(), 0);
                            }
                        });
                    }
                }
            }


            updateRangeInfo();
            applyTheme('theme-candy');
            generateAllTasks();
            setupFocusHandlers();
        });