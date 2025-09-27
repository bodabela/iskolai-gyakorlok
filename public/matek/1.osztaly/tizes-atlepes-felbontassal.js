const SVG_NS = "http://www.w3.org/2000/svg";

        // Aktuális téma és számkör
        let currentTheme = 'theme-candy';
        let currentNumberRange = 20; // Fix 20-as számkör

        // Feladat adatok
        let task1Data = { num1: 0, num2: 0, dec_to_make_ten: 0, dec_remaining: 0, sum: 0 };
        let task2Data = { num1: 0, num2: 0, dec_to_ten: 0, dec_remaining: 0, difference: 0 };


        // DOM elemek
        const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');
        const taskContainerAdditionEl = document.getElementById('taskContainerAddition');
        const additionNumberLineSvg = document.getElementById('additionNumberLine');
        const taskContainerSubtractionEl = document.getElementById('taskContainerSubtraction');
        const subtractionNumberLineSvg = document.getElementById('subtractionNumberLine');


        // Téma alkalmazása
        function applyTheme(themeClass) {
            bodyEl.className = ''; 
            bodyEl.classList.add(themeClass); 
            currentTheme = themeClass;

            themeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });

        function updateNumberDisplayDiv(divId, number, backgroundColorHex = "87CEEB") {
            const divElement = document.getElementById(divId);
            if (divElement) {
                divElement.textContent = number;
            }
        }

         function drawTicksAndNumbers(svgElement, groupClass, startX, spacing, maxNum, yAxis, highlightedNumbers = []) {
            const g = svgElement.querySelector(groupClass);
            if (!g) return;
            g.innerHTML = ''; 

            const textYPosition = yAxis + 15; 
            const dotRadius = 3.5; 

            for (let i = 0; i <= maxNum; i++) {
                const x = startX + i * spacing;
                const tick = document.createElementNS(SVG_NS, "line");
                tick.setAttribute("class", "tick");
                tick.setAttribute("x1", x);
                tick.setAttribute("y1", yAxis - 5); 
                tick.setAttribute("x2", x);
                tick.setAttribute("y2", yAxis + 5); 
                g.appendChild(tick);

                const currentHighlight = highlightedNumbers.find(h => h.value === i);

                if (currentHighlight) {
                    if (currentHighlight.value === 10) {
                        const dot = document.createElementNS(SVG_NS, "circle");
                        dot.setAttribute("cx", x);
                        dot.setAttribute("cy", yAxis);
                        dot.setAttribute("r", dotRadius);
                        dot.setAttribute("class", "dot-marker"); 
                        g.appendChild(dot);
                    } else {
                        const rect = document.createElementNS(SVG_NS, "rect");
                        const tempTextForWidth = document.createElementNS(SVG_NS, "text");
                        tempTextForWidth.setAttribute("class", "number-text"); 
                        tempTextForWidth.style.visibility = "hidden";
                        tempTextForWidth.textContent = i;
                        g.appendChild(tempTextForWidth);
                        const textWidth = tempTextForWidth.getComputedTextLength();
                        g.removeChild(tempTextForWidth); 

                        const rectWidth = textWidth + 8; 
                        const rectHeight = 18;
                        rect.setAttribute("x", x - rectWidth / 2);
                        rect.setAttribute("y", textYPosition - rectHeight / 2);
                        rect.setAttribute("width", rectWidth);
                        rect.setAttribute("height", rectHeight);
                        rect.setAttribute("fill", currentHighlight.color); 
                        rect.setAttribute("rx", 4); 
                        rect.setAttribute("ry", 4);
                        g.appendChild(rect);
                    }
                }

                const text = document.createElementNS(SVG_NS, "text");
                text.setAttribute("class", "number-text");
                text.setAttribute("x", x);
                text.setAttribute("y", textYPosition);
                text.setAttribute("dominant-baseline", "middle");
                text.textContent = i;
                g.appendChild(text);
            }
        }

         function calculateSpacing(svgWidth, startX, maxNum) {
            const usableWidth = svgWidth - startX - 20; 
            return maxNum > 0 ? usableWidth / maxNum : usableWidth;
        }

        function drawAdditionNumberLine() {
            const svg = additionNumberLineSvg;
            const axis = document.getElementById("additionAxis");
            const startX = 40; 
            const svgWidth = parseInt(svg.getAttribute("viewBox").split(" ")[2]); 
            const maxNumOnLine = currentNumberRange; 
            const spacing = calculateSpacing(svgWidth, startX, maxNumOnLine);

            const yAxis = 80; 
            const yArrows = yAxis - 30; 
            const yText = yArrows - 7; 
            const yQuestionMark = yAxis + 30; 

            axis.setAttribute("x1", startX);
            axis.setAttribute("y1", yAxis);
            axis.setAttribute("x2", startX + maxNumOnLine * spacing + 10); 
            axis.setAttribute("y2", yAxis);
            axis.setAttribute('marker-end', 'url(#arrowhead-axis)');
            axis.setAttribute('marker-start', 'url(#arrowhead-axis-left)');

            const highlightedNumbers = [
                { value: task1Data.num1, color: '#FFD700' }, 
                { value: 10, color: '#ADD8E6' }, 
            ];
            drawTicksAndNumbers(svg, ".addition-ticks", startX, spacing, maxNumOnLine, yAxis, highlightedNumbers);

            const arrow1 = document.getElementById("additionArrow1");
            const x1_arrow1 = startX + task1Data.num1 * spacing;
            const x2_arrow1 = startX + 10 * spacing;
            arrow1.setAttribute("x1", x1_arrow1);
            arrow1.setAttribute("y1", yArrows);
            arrow1.setAttribute("x2", x2_arrow1);
            arrow1.setAttribute("y2", yArrows);
            arrow1.setAttribute("class", "arrow-shaft operation-arrow"); 

            const label1Num = document.getElementById("additionLabel1Num");
            const label1Op = document.getElementById("additionLabel1Op");
            label1Num.setAttribute("x", (x1_arrow1 + x2_arrow1) / 2 + 6); 
            label1Num.setAttribute("y", yText);
            label1Num.textContent = task1Data.dec_to_make_ten.toString();
            label1Op.setAttribute("x", (x1_arrow1 + x2_arrow1) / 2 - 6); 
            label1Op.setAttribute("y", yText);
            label1Op.textContent = "+";

            const arrow2 = document.getElementById("additionArrow2");
            const x1_arrow2 = startX + 10 * spacing;
            const x2_arrow2 = startX + task1Data.sum * spacing;
            arrow2.setAttribute("x1", x1_arrow2);
            arrow2.setAttribute("y1", yArrows);
            arrow2.setAttribute("x2", x2_arrow2);
            arrow2.setAttribute("y2", yArrows);
            arrow2.setAttribute("class", "arrow-shaft helper-arrow-green"); 

            const label2Num = document.getElementById("additionLabel2Num");
            const label2Op = document.getElementById("additionLabel2Op");
            label2Num.setAttribute("x", (x1_arrow2 + x2_arrow2) / 2 + 6); 
            label2Num.setAttribute("y", yText);
            label2Num.textContent = task1Data.dec_remaining.toString();
            label2Op.setAttribute("x", (x1_arrow2 + x2_arrow2) / 2 - 6); 
            label2Op.setAttribute("y", yText);
            label2Op.textContent = "+";

            const resultMarker = document.getElementById("additionResultMarker");
            resultMarker.setAttribute("cx", startX + task1Data.sum * spacing);
            resultMarker.setAttribute("cy", yAxis);
            resultMarker.setAttribute("class", "result-marker"); 

            const resultQuestion = document.getElementById("additionResultQuestion");
            resultQuestion.setAttribute("x", startX + task1Data.sum * spacing);
            resultQuestion.setAttribute("y", yQuestionMark); 
            resultQuestion.setAttribute("class", "question-mark-text"); 
            resultQuestion.textContent = "?"; 
        }

         function drawDecompositionLines(svgId, taskContainerEl, num2DisplayId, decInput1Id, decInput2Id) {
            const svgEl = document.getElementById(svgId);
            if (!svgEl) {
                console.error(`SVG element with id ${svgId} not found.`);
                return;
            }
            svgEl.innerHTML = ''; // Clear previous lines

            const num2Display = document.getElementById(num2DisplayId);
            const decInput1 = document.getElementById(decInput1Id);
            const decInput2 = document.getElementById(decInput2Id);

            if (!taskContainerEl || !num2Display || !decInput1 || !decInput2) {
                console.error("One or more elements for drawing decomposition lines are missing for", svgId);
                return;
            }

            const containerRect = taskContainerEl.getBoundingClientRect();
            const num2Rect = num2Display.getBoundingClientRect();
            const input1Rect = decInput1.getBoundingClientRect();
            const input2Rect = decInput2.getBoundingClientRect();

            // Calculate coordinates relative to the task container (SVG's offset parent)
            const lineStartX = (num2Rect.left - containerRect.left) + (num2Rect.width / 2);
            const lineStartY = (num2Rect.bottom - containerRect.top) + 2; // Start slightly below num2Display

            const input1CenterX = (input1Rect.left - containerRect.left) + (input1Rect.width / 2);
            const input1TopY = (input1Rect.top - containerRect.top) - 2; // End slightly above decInput1

            const input2CenterX = (input2Rect.left - containerRect.left) + (input2Rect.width / 2);
            const input2TopY = (input2Rect.top - containerRect.top) - 2; // End slightly above decInput2

            // Define arrowhead (unique ID within this SVG)
            const defs = document.createElementNS(SVG_NS, 'defs');
            const arrowhead = document.createElementNS(SVG_NS, 'marker');
            const arrowheadId = `arrowhead-${svgId}`;
            arrowhead.setAttribute('id', arrowheadId);
            arrowhead.setAttribute('markerWidth', '10');
            arrowhead.setAttribute('markerHeight', '7');
            arrowhead.setAttribute('refX', '8'); // Adjusted for better arrow appearance
            arrowhead.setAttribute('refY', '3.5');
            arrowhead.setAttribute('orient', 'auto');
            arrowhead.setAttribute('markerUnits', 'strokeWidth');
            const polygon = document.createElementNS(SVG_NS, 'polygon');
            polygon.setAttribute('points', '0 0, 8 3.5, 0 7'); // Adjusted points
            polygon.setAttribute('fill', 'gray');
            arrowhead.appendChild(polygon);
            defs.appendChild(arrowhead);
            svgEl.appendChild(defs);

            // Line 1 (num2 -> input1)
            const line1 = document.createElementNS(SVG_NS, 'line');
            line1.setAttribute('x1', lineStartX);
            line1.setAttribute('y1', lineStartY);
            line1.setAttribute('x2', input1CenterX);
            line1.setAttribute('y2', input1TopY);
            line1.setAttribute('stroke', 'gray');
            line1.setAttribute('stroke-width', 2);
            line1.setAttribute('marker-end', `url(#${arrowheadId})`);
            svgEl.appendChild(line1);

            // Line 2 (num2 -> input2)
            const line2 = document.createElementNS(SVG_NS, 'line');
            line2.setAttribute('x1', lineStartX);
            line2.setAttribute('y1', lineStartY);
            line2.setAttribute('x2', input2CenterX);
            line2.setAttribute('y2', input2TopY);
            line2.setAttribute('stroke', 'gray');
            line2.setAttribute('stroke-width', 2);
            line2.setAttribute('marker-end', `url(#${arrowheadId})`);
            svgEl.appendChild(line2);
        }

        function drawAdditionLines() {
            drawDecompositionLines('addition-svg', taskContainerAdditionEl, 'task1_num2_display', 'task1_dec_input1', 'task1_dec_input2');
        }
        
        function drawSubtractionLines() {
            drawDecompositionLines('subtraction-svg', taskContainerSubtractionEl, 'task2_num2_display', 'task2_dec_input1', 'task2_dec_input2');
        }

        function generateAdditionTask() {
            const feedbackEl = document.getElementById('task1_feedback');
            feedbackEl.textContent = ''; 
            feedbackEl.className = 'feedback'; 

            task1Data.num1 = Math.floor(Math.random() * 4) + 6; 
            let minNum2 = 10 - task1Data.num1 + 1; 
            let maxNum2PossibleByRange = currentNumberRange - task1Data.num1; 
            let maxNum2 = Math.min(9, maxNum2PossibleByRange); 

            if (minNum2 > maxNum2 || maxNum2 < 1) {
                 generateAdditionTask();
                 return;
            }

            task1Data.num2 = Math.floor(Math.random() * (maxNum2 - minNum2 + 1)) + minNum2;
            task1Data.sum = task1Data.num1 + task1Data.num2;
            task1Data.dec_to_make_ten = 10 - task1Data.num1; 
            task1Data.dec_remaining = task1Data.num2 - task1Data.dec_to_make_ten; 

            document.getElementById('task1_description_p').textContent = `Mennyit kell adni ${task1Data.num1}-hez, hogy ${task1Data.sum} legyen? Bontsd fel a második számot!`;

            updateNumberDisplayDiv("task1_num1_display", task1Data.num1, "FFD700"); 
            updateNumberDisplayDiv("task1_num2_display", task1Data.num2, "87CEEB"); 

            const stepsEl = document.getElementById('task1_decomposition_steps');
            stepsEl.innerHTML = `
                <div class="task-number-display" id="task1_num1_recomposed_step" style="background-color: #FFD700">${task1Data.num1}</div>
                <span style="margin: 0 5px;">+</span>
                <input type="number" id="task1_dec_input1" style="width:45px; font-size: 1em;" min="0" placeholder="?">
                <span style="margin: 0 5px;">+</span>
                <input type="number" id="task1_dec_input2" style="width:45px; font-size: 1em;" min="0" placeholder="?">
                <span style="margin: 0 5px;">=</span>
                <input type="number" id="task1_final_answer_dec" style="width:60px;" min="0" max="${currentNumberRange}" placeholder="?">
            `;
            document.getElementById('task1_final_answer_dec').max = currentNumberRange;

            // ÚJ: Görgessünk a számegyeneshez tableten/mobilon
            const additionNumberLine = document.getElementById('additionNumberLine');
            addScrollListener('task1_dec_input1', additionNumberLine);
            addScrollListener('task1_dec_input2', additionNumberLine);
            addScrollListener('task1_final_answer_dec', additionNumberLine);

            setTimeout(() => {
                drawAdditionLines(); 
                drawAdditionNumberLine(); 
            }, 50);
        }

        function checkAdditionTask() {
            const decInput1Val = parseInt(document.getElementById('task1_dec_input1').value);
            const decInput2Val = parseInt(document.getElementById('task1_dec_input2').value);
            const finalAnswerDecVal = parseInt(document.getElementById('task1_final_answer_dec').value);

            const feedbackEl = document.getElementById('task1_feedback'); 

            let correctDecompositionPart1 = (decInput1Val === task1Data.dec_to_make_ten);
            let correctDecompositionSum = (decInput1Val + decInput2Val === task1Data.num2);
            let correctFinalAnswer = (finalAnswerDecVal === task1Data.sum);

            if (isNaN(decInput1Val) || isNaN(decInput2Val) || isNaN(finalAnswerDecVal)) {
                feedbackEl.textContent = 'Kérlek, tölts ki minden mezőt!';
                feedbackEl.className = 'feedback incorrect';
            } else if (correctDecompositionPart1 && correctDecompositionSum && correctFinalAnswer) {
                feedbackEl.textContent = 'Ügyes vagy! A felbontás és a végeredmény is helyes.';
                feedbackEl.className = 'feedback correct';
            } else if (!(correctDecompositionPart1 && correctDecompositionSum) && correctFinalAnswer) {
                feedbackEl.textContent = 'A végeredmény jó, de a felbontás nem tökéletes. Próbáld újra a felbontást!';
                feedbackEl.className = 'feedback incorrect';
            } else if ((correctDecompositionPart1 && correctDecompositionSum) && !correctFinalAnswer) {
                feedbackEl.textContent = 'A felbontás jó, de a végeredmény nem. Számold újra!';
                feedbackEl.className = 'feedback incorrect';
            } else {
                feedbackEl.textContent = 'Sajnos sem a felbontás, sem a végeredmény nem jó. Próbáld újra!';
                feedbackEl.className = 'feedback incorrect';
            }
            clearFeedback(feedbackEl);
        }

        function generateSubtractionTask() {
            const feedbackEl = document.getElementById('task2_feedback');
            feedbackEl.textContent = ''; 
            feedbackEl.className = 'feedback'; 

            task2Data.num1 = Math.floor(Math.random() * (currentNumberRange - 11 + 1)) + 11;
            task2Data.dec_to_ten = task2Data.num1 - 10;
            task2Data.dec_remaining = Math.floor(Math.random() * 9) + 1;
            task2Data.num2 = task2Data.dec_to_ten + task2Data.dec_remaining;

            if (task2Data.num2 >= task2Data.num1 || task2Data.num1 - task2Data.num2 < 0) { // ensure difference is not negative
                generateSubtractionTask(); 
                return;
            }

            task2Data.difference = task2Data.num1 - task2Data.num2;

            document.getElementById('task2_description_p').textContent = `Mennyit vonjunk ki ${task2Data.num1}-ből, hogy ${task2Data.difference} legyen? Bontsd fel a kivonandó számot!`;

            updateNumberDisplayDiv("task2_num1_display", task2Data.num1, "FFD700"); 
            updateNumberDisplayDiv("task2_num2_display", task2Data.num2, "87CEEB"); 

            const stepsEl = document.getElementById('task2_decomposition_steps');
            stepsEl.innerHTML = `
                <div class="task-number-display" id="task2_num1_recomposed_step" style="background-color: #FFD700">${task2Data.num1}</div>
                <span style="margin: 0 5px;">-</span>
                <input type="number" id="task2_dec_input1" style="width:45px; font-size: 1em;" min="0" placeholder="?">
                <span style="margin: 0 5px;">-</span>
                <input type="number" id="task2_dec_input2" style="width:45px; font-size: 1em;" min="0" placeholder="?">
                <span style="margin: 0 5px;">=</span>
                <input type="number" id="task2_final_answer_dec" style="width:60px;" min="0" max="${currentNumberRange}" placeholder="?">
            `;
            document.getElementById('task2_final_answer_dec').max = currentNumberRange;

            // ÚJ: Görgessünk a számegyeneshez tableten/mobilon
            const subtractionNumberLine = document.getElementById('subtractionNumberLine');
            addScrollListener('task2_dec_input1', subtractionNumberLine);
            addScrollListener('task2_dec_input2', subtractionNumberLine);
            addScrollListener('task2_final_answer_dec', subtractionNumberLine);

            setTimeout(() => {
                drawSubtractionLines(); 
                drawSubtractionNumberLine(); 
            }, 50);
        }
        
        function drawSubtractionNumberLine() {
            const svg = subtractionNumberLineSvg;
            const axis = document.getElementById("subtractionAxis");
            const startX = 40; 
            const svgWidth = parseInt(svg.getAttribute("viewBox").split(" ")[2]); 
            const maxNumOnLine = currentNumberRange; 
            const spacing = calculateSpacing(svgWidth, startX, maxNumOnLine);

            const yAxis = 80; 
            const yArrows = yAxis - 30; 
            const yText = yArrows - 7; 
            const yQuestionMark = yAxis + 30; 

            axis.setAttribute("x1", startX);
            axis.setAttribute("y1", yAxis);
            axis.setAttribute("x2", startX + maxNumOnLine * spacing + 10); 
            axis.setAttribute("y2", yAxis);
            axis.setAttribute('marker-end', 'url(#arrowhead-axis-sub)');
            axis.setAttribute('marker-start', 'url(#arrowhead-axis-left-sub)');

            const highlightedNumbers = [
                { value: task2Data.num1, color: '#FFD700' }, 
                { value: 10, color: '#ADD8E6' }, 
            ];
            drawTicksAndNumbers(svg, ".subtraction-ticks", startX, spacing, maxNumOnLine, yAxis, highlightedNumbers);

            const arrow1 = document.getElementById("subtractionArrow1");
            const x1_arrow1 = startX + task2Data.num1 * spacing;
            const x2_arrow1 = startX + 10 * spacing;
            arrow1.setAttribute("x1", x1_arrow1);
            arrow1.setAttribute("y1", yArrows);
            arrow1.setAttribute("x2", x2_arrow1);
            arrow1.setAttribute("y2", yArrows);
            arrow1.setAttribute("class", "arrow-shaft operation-arrow"); 
            arrow1.setAttribute("marker-end", "url(#op-arrowhead-sub)"); 

            const label1Num = document.getElementById("subtractionLabel1Num");
            const label1Op = document.getElementById("subtractionLabel1Op");
            label1Num.setAttribute("x", (x1_arrow1 + x2_arrow1) / 2 + 6); 
            label1Num.setAttribute("y", yText);
            label1Num.textContent = task2Data.dec_to_ten.toString();
            label1Op.setAttribute("x", (x1_arrow1 + x2_arrow1) / 2 - 6); 
            label1Op.setAttribute("y", yText);
            label1Op.textContent = "-";

            const arrow2 = document.getElementById("subtractionArrow2");
            const x1_arrow2 = startX + 10 * spacing;
            const x2_arrow2 = startX + task2Data.difference * spacing;
            arrow2.setAttribute("x1", x1_arrow2);
            arrow2.setAttribute("y1", yArrows);
            arrow2.setAttribute("x2", x2_arrow2);
            arrow2.setAttribute("y2", yArrows);
            arrow2.setAttribute("class", "arrow-shaft helper-arrow-green"); 
            arrow2.setAttribute("marker-end", "url(#op-arrowhead-sub)"); 

            const label2Num = document.getElementById("subtractionLabel2Num");
            const label2Op = document.getElementById("subtractionLabel2Op");
            label2Num.setAttribute("x", (x1_arrow2 + x2_arrow2) / 2 + 6); 
            label2Num.setAttribute("y", yText);
            label2Num.textContent = task2Data.dec_remaining.toString();
            label2Op.setAttribute("x", (x1_arrow2 + x2_arrow2) / 2 - 6); 
            label2Op.setAttribute("y", yText);
            label2Op.textContent = "-";

            const resultMarker = document.getElementById("subtractionResultMarker");
            resultMarker.setAttribute("cx", startX + task2Data.difference * spacing);
            resultMarker.setAttribute("cy", yAxis);
            resultMarker.setAttribute("class", "result-marker"); 

            const resultQuestion = document.getElementById("subtractionResultQuestion");
            resultQuestion.setAttribute("x", startX + task2Data.difference * spacing);
            resultQuestion.setAttribute("y", yQuestionMark); 
            resultQuestion.setAttribute("class", "question-mark-text"); 
            resultQuestion.textContent = "?"; 
        }

        function checkSubtractionTask() {
            const decInput1Val = parseInt(document.getElementById('task2_dec_input1').value);
            const decInput2Val = parseInt(document.getElementById('task2_dec_input2').value);
            const finalAnswerDecVal = parseInt(document.getElementById('task2_final_answer_dec').value);

            const feedbackEl = document.getElementById('task2_feedback'); 

            let correctDecompositionPart1 = (decInput1Val === task2Data.dec_to_ten);
            let correctDecompositionSum = (decInput1Val + decInput2Val === task2Data.num2);
            let correctFinalAnswer = (finalAnswerDecVal === task2Data.difference);

            if (isNaN(decInput1Val) || isNaN(decInput2Val) || isNaN(finalAnswerDecVal)) {
                feedbackEl.textContent = 'Kérlek, tölts ki minden mezőt!';
                feedbackEl.className = 'feedback incorrect';
            } else if (correctDecompositionPart1 && correctDecompositionSum && correctFinalAnswer) {
                feedbackEl.textContent = 'Ügyes vagy! A felbontás és a végeredmény is helyes.';
                feedbackEl.className = 'feedback correct';
            } else if (!(correctDecompositionPart1 && correctDecompositionSum) && correctFinalAnswer) {
                feedbackEl.textContent = 'A végeredmény jó, de a felbontás nem tökéletes. Próbáld újra a felbontást!';
                feedbackEl.className = 'feedback incorrect';
            } else if ((correctDecompositionPart1 && correctDecompositionSum) && !correctFinalAnswer) {
                feedbackEl.textContent = 'A felbontás jó, de a végeredmény nem. Számold újra!';
                feedbackEl.className = 'feedback incorrect';
            } else {
                feedbackEl.textContent = 'Sajnos sem a felbontás, sem a végeredmény nem jó. Próbáld újra!';
                feedbackEl.className = 'feedback incorrect';
            }
            clearFeedback(feedbackEl);
        }

        function clearFeedback(feedbackEl) {
            setTimeout(() => {
                feedbackEl.textContent = '';
                feedbackEl.className = 'feedback'; 
            }, 10000); 
        }

        const addScrollListener = (inputId, numberLineElement) => {
            const input = document.getElementById(inputId);
            if (input && numberLineElement) {
                input.addEventListener('focus', () => {
                    // Check for touch capability or smaller screen width to identify mobile/tablet
                    const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
                    if (isMobileDevice) {
                        // A timeout is necessary to wait for the virtual keyboard to appear and the layout to reflow
                        setTimeout(() => {
                            numberLineElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 500);
                    }
                });
            }
        };

        document.addEventListener('DOMContentLoaded', function() {
            generateAdditionTask();
            generateSubtractionTask();

            const defaultTheme = 'theme-candy';
            applyTheme(defaultTheme);

            window.addEventListener('resize', () => {
                setTimeout(() => {
                    drawAdditionLines(); 
                    drawAdditionNumberLine(); 
                    drawSubtractionLines(); 
                    drawSubtractionNumberLine(); 
                }, 100);
            });
        });