const SVG_NS = "http://www.w3.org/2000/svg";
        const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');
        
        const NUM_SUB_TASKS = 5; 

        let tasksReadFraction = []; 
        let tasksDrawFraction = []; 


        function applyTheme(themeClass) {
            bodyEl.className = '';
            bodyEl.classList.add(themeClass);
            themeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
            
            tasksReadFraction.forEach(task => {
                if(task.svgElement && task.svgElement.parentElement) {
                    const newSvg = drawFractionSVG(task.numerator, task.denominator, task.id, false);
                    task.svgElement.parentElement.replaceChild(newSvg, task.svgElement);
                    task.svgElement = newSvg;
                }
            });
            tasksDrawFraction.forEach(task => {
                if(task.svgElement && task.svgElement.parentElement) {
                    const newSvg = drawFractionSVG(task.numerator, task.denominator, task.id, true);
                    task.svgElement.parentElement.replaceChild(newSvg, task.svgElement);
                    task.svgElement = newSvg;
                    task.slices = Array.from(newSvg.querySelectorAll('.clickable-slice'));
                    task.selectedIndices = new Set(); // Kijelölések törlése téma váltáskor
                    attachClickListenersToSlices(task); 
                }
            });
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });

        function generateRandomFraction() {
            const possibleDenominators = [2, 3, 4, 5, 6, 8, 10, 12];
            const D = possibleDenominators[Math.floor(Math.random() * possibleDenominators.length)];
            const N = Math.floor(Math.random() * (D - 1)) + 1; 
            return { numerator: N, denominator: D, stringValue: `${N}/${D}` };
        }
        
        function getArcPath(cx, cy, radius, startAngleRad, endAngleRad, isSlice = false) {
            const startX = cx + radius * Math.cos(startAngleRad);
            const startY = cy + radius * Math.sin(startAngleRad);
            const endX = cx + radius * Math.cos(endAngleRad);
            const endY = cy + radius * Math.sin(endAngleRad);
            
            let angleDiff = endAngleRad - startAngleRad;
            while (angleDiff < 0) angleDiff += 2 * Math.PI;
            while (angleDiff > 2 * Math.PI) angleDiff -= 2 * Math.PI;

            const largeArcFlag = angleDiff <= Math.PI ? "0" : "1";
            
            if (isSlice) { 
                return `M ${cx},${cy} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
            } else { 
                 return `M ${cx},${cy} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
            }
        }


        function drawFractionSVG(numerator, denominator, idPrefix, isInteractive = false, svgSize = 120) {
            const svg = document.createElementNS(SVG_NS, "svg");
            svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);
            svg.setAttribute("width", svgSize);
            svg.setAttribute("height", svgSize);
            svg.dataset.parentId = idPrefix; 

            const cx = svgSize / 2;
            const cy = svgSize / 2;
            const radius = svgSize / 2 - 5; 

            const baseCircle = document.createElementNS(SVG_NS, "circle");
            baseCircle.setAttribute("cx", cx);
            baseCircle.setAttribute("cy", cy);
            baseCircle.setAttribute("r", radius);
            baseCircle.setAttribute("class", "fraction-circle-base-fill");
            svg.appendChild(baseCircle);

            const sliceAngle = (2 * Math.PI) / denominator;

            for (let i = 0; i < denominator; i++) {
                const startAngle = i * sliceAngle - (Math.PI / 2);
                const endAngle = (i + 1) * sliceAngle - (Math.PI / 2);
                
                const slicePath = document.createElementNS(SVG_NS, "path");
                slicePath.setAttribute("d", getArcPath(cx, cy, radius, startAngle, endAngle, true));
                
                if (isInteractive) {
                    slicePath.classList.add("clickable-slice");
                    slicePath.dataset.sliceIndex = i;
                    slicePath.style.fill = getComputedStyle(bodyEl).getPropertyValue('--fraction-default-slice-fill-color').trim() || 'transparent';
                } else { 
                    if (i < numerator) {
                        slicePath.classList.add("fraction-circle-fill"); 
                        slicePath.style.fill = getComputedStyle(bodyEl).getPropertyValue('--fraction-selected-slice-fill-color').trim();

                    } else {
                        slicePath.style.fill = getComputedStyle(bodyEl).getPropertyValue('--fraction-default-slice-fill-color').trim() || 'transparent';
                    }
                }
                svg.appendChild(slicePath);
            }
            
            if (denominator > 1) {
                for (let i = 0; i < denominator; i++) {
                    const lineAngle = i * sliceAngle - (Math.PI / 2);
                    const x2_line = cx + radius * Math.cos(lineAngle);
                    const y2_line = cy + radius * Math.sin(lineAngle);

                    const divisionLine = document.createElementNS(SVG_NS, "line");
                    divisionLine.setAttribute("x1", cx);
                    divisionLine.setAttribute("y1", cy);
                    divisionLine.setAttribute("x2", x2_line);
                    divisionLine.setAttribute("y2", y2_line);
                    divisionLine.setAttribute("class", "fraction-division-line");
                    svg.appendChild(divisionLine);
                }
            }

            const outlineCircle = document.createElementNS(SVG_NS, "circle");
            outlineCircle.setAttribute("cx", cx);
            outlineCircle.setAttribute("cy", cy);
            outlineCircle.setAttribute("r", radius);
            outlineCircle.setAttribute("class", "fraction-circle-outline");
            svg.appendChild(outlineCircle);

            return svg;
        }

        function attachClickListenersToSlices(task) {
            task.slices.forEach(slicePath => {
                slicePath.addEventListener('click', () => handleIndividualSliceClick(task, slicePath));
            });
        }
        
        function handleIndividualSliceClick(task, clickedSlicePath) {
            const sliceIndex = parseInt(clickedSlicePath.dataset.sliceIndex);
            const defaultFill = getComputedStyle(bodyEl).getPropertyValue('--fraction-default-slice-fill-color').trim() || 'transparent';
            const selectedFill = getComputedStyle(bodyEl).getPropertyValue('--fraction-selected-slice-fill-color').trim();

            if (task.selectedIndices.has(sliceIndex)) {
                task.selectedIndices.delete(sliceIndex);
                clickedSlicePath.classList.remove('selected-slice');
                clickedSlicePath.style.fill = defaultFill;
            } else {
                task.selectedIndices.add(sliceIndex);
                clickedSlicePath.classList.add('selected-slice');
                clickedSlicePath.style.fill = selectedFill;
            }
        }


        // --- Feladat 1: Tört leolvasása ---
        function generateReadFractionTasks() {
            const problemArea = document.getElementById('problemAreaRead');
            problemArea.innerHTML = '';
            tasksReadFraction = [];
            const feedbackEl = document.getElementById('feedbackRead');
            if(feedbackEl) {
                 feedbackEl.textContent = '';
                 feedbackEl.className = 'feedback';
            }


            for (let i = 0; i < NUM_SUB_TASKS; i++) {
                const fractionData = generateRandomFraction();
                const taskId = `read_${i}`;
                
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('problem-item');
                
                const svgElement = drawFractionSVG(fractionData.numerator, fractionData.denominator, taskId, false);
                itemDiv.appendChild(svgElement);
                
                const inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.id = `input_${taskId}`;
                // inputElement.placeholder = "n/d"; // Placeholder eltávolítva
                itemDiv.appendChild(inputElement);
                
                problemArea.appendChild(itemDiv);
                tasksReadFraction.push({ ...fractionData, id: taskId, svgElement, inputElement });
            }
        }

        function checkReadFractionTasks() {
            const feedbackEl = document.getElementById('feedbackRead');
            let allCorrect = true;
            let correctCount = 0;

            tasksReadFraction.forEach(task => {
                const userAnswer = task.inputElement.value.trim().replace(/\s+/g, '');
                if (userAnswer === task.stringValue) {
                    task.inputElement.style.borderColor = 'green';
                    correctCount++;
                } else {
                    task.inputElement.style.borderColor = 'red';
                    allCorrect = false;
                }
            });

            if (tasksReadFraction.length === 0) {
                 feedbackEl.textContent = "Nincsenek feladatok.";
                 feedbackEl.className = 'feedback incorrect';
                 return;
            }

            if (allCorrect) {
                feedbackEl.textContent = 'Minden válasz helyes! Ügyes vagy! 🎉';
                feedbackEl.className = 'feedback correct';
            } else {
                feedbackEl.textContent = `Összesen ${correctCount} helyes válasz az ${tasksReadFraction.length}-ből. Javítsd a pirosakat!`;
                feedbackEl.className = 'feedback incorrect';
            }
        }

        // --- Feladat 2: Tört ábrázolása ---
        function generateDrawFractionTasks() {
            const problemArea = document.getElementById('problemAreaDraw');
            problemArea.innerHTML = '';
            tasksDrawFraction = [];
            const feedbackEl = document.getElementById('feedbackDraw');
            if (feedbackEl) {
                feedbackEl.textContent = '';
                feedbackEl.className = 'feedback';
            }


            for (let i = 0; i < NUM_SUB_TASKS; i++) {
                const fractionData = generateRandomFraction();
                const taskId = `draw_${i}`;

                const itemDiv = document.createElement('div');
                itemDiv.classList.add('problem-item');

                const fractionTextEl = document.createElement('div');
                fractionTextEl.classList.add('fraction-text-display');
                fractionTextEl.innerHTML = `<sup>${fractionData.numerator}</sup>&frasl;<sub>${fractionData.denominator}</sub>`;
                itemDiv.appendChild(fractionTextEl);

                const svgElement = drawFractionSVG(fractionData.numerator, fractionData.denominator, taskId, true);
                itemDiv.appendChild(svgElement);
                
                problemArea.appendChild(itemDiv);
                const taskObject = { 
                    ...fractionData, 
                    id: taskId, 
                    svgElement, 
                    slices: Array.from(svgElement.querySelectorAll('.clickable-slice')), 
                    selectedIndices: new Set() // Kijelölt szeletek indexeit tárolja
                };
                tasksDrawFraction.push(taskObject);
                attachClickListenersToSlices(taskObject);
            }
        }

        function checkDrawFractionTasks() {
            const feedbackEl = document.getElementById('feedbackDraw');
            let allCorrectOverall = true;
            let correctTasksCount = 0;
            
            if (tasksDrawFraction.length === 0) {
                 feedbackEl.textContent = "Nincsenek feladatok.";
                 feedbackEl.className = 'feedback incorrect';
                 return;
            }

            tasksDrawFraction.forEach(task => {
                let isThisTaskCorrect = false;
                
                if (task.selectedIndices.size === task.numerator) {
                    isThisTaskCorrect = true; // Az egyenkénti klikkelés miatt az összefüggőséget itt nem kell szigorúan ellenőrizni, csak a darabszámot
                } else {
                    isThisTaskCorrect = false;
                }

                const svgOutline = task.svgElement.querySelector('.fraction-circle-outline');
                if (svgOutline) {
                    svgOutline.style.stroke = isThisTaskCorrect ? 'green' : 'red';
                    svgOutline.style.strokeWidth = isThisTaskCorrect ? '2px' : '2.5px';
                }

                if (isThisTaskCorrect) {
                    correctTasksCount++;
                } else {
                    allCorrectOverall = false;
                }
            });

            if (allCorrectOverall) {
                feedbackEl.textContent = 'Minden ábrázolás helyes! Fantasztikus! 🎨';
                feedbackEl.className = 'feedback correct';
            } else {
                feedbackEl.textContent = `Összesen ${correctTasksCount} helyes ábrázolás az ${tasksDrawFraction.length}-ből. Nézd át a piros körvonalúakat!`;
                feedbackEl.className = 'feedback incorrect';
            }
        }


        document.addEventListener('DOMContentLoaded', () => {
            applyTheme('theme-candy');
            generateReadFractionTasks();
            generateDrawFractionTasks();
        });