const SVG_NS = "http://www.w3.org/2000/svg";
        let currentTasksData = {
            ascending: { fractions: [], solution: [] },
            descending: { fractions: [], solution: [] }
        };
        let currentSelectedFractionSubtype = 'mixedFractions'; 

        const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');
        const subtypeButtons = document.querySelectorAll('.subtype-button');


        function applyTheme(themeClass) {
            bodyEl.className = '';
            bodyEl.classList.add(themeClass);
            themeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
            subtypeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.subtype === currentSelectedFractionSubtype);
            });
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });

        subtypeButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentSelectedFractionSubtype = button.dataset.subtype;
                subtypeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                generateTask('ascending');
                generateTask('descending');
            });
        });

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function generateFractionObjects(subType) {
            let fractions = [];
            const numFractions = 5;
            const usedFractionStrings = new Set(); 

            if (subType === 'sameDenominator') {
                const MIN_NUMERATORS_NEEDED = numFractions;
                const possibleDenominators = [6, 7, 8, 9, 10, 12]; 
                let D = possibleDenominators[Math.floor(Math.random() * possibleDenominators.length)];
                
                let availableNumerators = [];
                for (let i = 1; i < D; i++) { 
                    availableNumerators.push(i);
                }
                shuffleArray(availableNumerators);

                for (let i = 0; i < numFractions; i++) {
                    const N = availableNumerators[i]; 
                    const newFraction = { numerator: N, denominator: D, stringValue: `${N}/${D}`, numericValue: N / D };
                    fractions.push(newFraction);
                }
            } else { 
                let attempts = 0;
                const maxAttempts = 200; 

                while (fractions.length < numFractions && attempts < maxAttempts) {
                    let N, D, currentFractionString;
                    if (subType === 'unitFractions') {
                        const availableDenominators = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                        D = availableDenominators[Math.floor(Math.random() * availableDenominators.length)];
                        N = 1;
                        currentFractionString = `1/${D}`;
                    } else { // mixedFractions
                        const vegyesDenominators = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
                        D = vegyesDenominators[Math.floor(Math.random() * vegyesDenominators.length)];
                        N = Math.floor(Math.random() * (D - 1)) + 1; 
                        currentFractionString = `${N}/${D}`;
                    }

                    if (!usedFractionStrings.has(currentFractionString)) {
                        usedFractionStrings.add(currentFractionString);
                        fractions.push({ numerator: N, denominator: D, stringValue: currentFractionString, numericValue: N / D });
                    }
                    attempts++;
                }
                
                while (fractions.length < numFractions) { 
                    let D_fallback = Math.floor(Math.random() * 10) + 2; 
                    let N_fallback = (subType === 'unitFractions') ? 1 : Math.floor(Math.random() * (D_fallback -1)) + 1;
                    let fallbackString = `${N_fallback}/${D_fallback}`;
                    
                    let uniqueFallbackAttempts = 0;
                    while(usedFractionStrings.has(fallbackString) && uniqueFallbackAttempts < 50) {
                        D_fallback = Math.floor(Math.random() * 10) + 3; 
                         N_fallback = (subType === 'unitFractions') ? 1 : Math.floor(Math.random() * (D_fallback -1)) + 1;
                        fallbackString = `${N_fallback}/${D_fallback}`;
                        uniqueFallbackAttempts++;
                    }
                    if(!usedFractionStrings.has(fallbackString)){
                        usedFractionStrings.add(fallbackString);
                        fractions.push({numerator: N_fallback, denominator: D_fallback, stringValue: fallbackString, numericValue: N_fallback/D_fallback });
                    } else { 
                        const veryUniqueD = 13 + fractions.length + attempts + uniqueFallbackAttempts;
                        const veryUniqueN = 1;
                        const veryUniqueString = `${veryUniqueN}/${veryUniqueD}`;
                        usedFractionStrings.add(veryUniqueString);
                        fractions.push({numerator: veryUniqueN, denominator: veryUniqueD, stringValue: veryUniqueString, numericValue: veryUniqueN / veryUniqueD});
                    }
                }
            }
            return fractions.slice(0, numFractions);
        }


        function getArcPath(cx, cy, radius, startAngleRad, endAngleRad) {
            const startX = cx + radius * Math.cos(startAngleRad);
            const startY = cy + radius * Math.sin(startAngleRad);
            const endX = cx + radius * Math.cos(endAngleRad);
            const endY = cy + radius * Math.sin(endAngleRad);
            
            let angleDiff = endAngleRad - startAngleRad;
            while (angleDiff < 0) angleDiff += 2 * Math.PI;
            while (angleDiff > 2 * Math.PI) angleDiff -= 2 * Math.PI;

            const largeArcFlag = angleDiff <= Math.PI ? "0" : "1";

            return `M ${cx},${cy} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
        }

        function drawFractionSVG(fraction, svgSize = 120) { 
            const svg = document.createElementNS(SVG_NS, "svg");
            svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);
            svg.setAttribute("width", svgSize);
            svg.setAttribute("height", svgSize);

            const cx = svgSize / 2;
            const cy = svgSize / 2;
            const radius = svgSize / 2 - 8; 

            const baseFillCircle = document.createElementNS(SVG_NS, "circle");
            baseFillCircle.setAttribute("cx", cx);
            baseFillCircle.setAttribute("cy", cy);
            baseFillCircle.setAttribute("r", radius);
            baseFillCircle.setAttribute("class", "fraction-circle-base-fill");
            svg.appendChild(baseFillCircle);

            const D_fill = fraction.denominator;
            if (fraction.numerator > 0 && D_fill > 0 && Number.isFinite(D_fill)) {
                const angle = (fraction.numerator / D_fill) * 2 * Math.PI;
                const fillElement = document.createElementNS(SVG_NS, "path");
                if (fraction.numerator >= D_fill) { 
                    fillElement.setAttribute("d", getArcPath(cx, cy, radius, -Math.PI / 2, (2*Math.PI) - (Math.PI/2) - 0.0001 ));
                } else {
                    fillElement.setAttribute("d", getArcPath(cx, cy, radius, -Math.PI / 2, angle - Math.PI / 2));
                }
                fillElement.setAttribute("class", "fraction-circle-fill");
                svg.appendChild(fillElement);
            }

            const D_lines = fraction.denominator;
            if (D_lines > 1 && Number.isFinite(D_lines)) { 
                for (let k = 0; k < D_lines; k++) { 
                    const lineAngle = (k / D_lines) * 2 * Math.PI - (Math.PI / 2);
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
            
            if (D_lines > 0 && Number.isFinite(D_lines)) {
                const sliceAngle = (2 * Math.PI) / D_lines;
                let sorszamCounter = 1;
                const textRadiusFactor = D_lines > 8 ? 0.7 : 0.65; 

                for (let k = 0; k < fraction.numerator; k++) { 
                    if (sorszamCounter > D_lines) break;
                    const midpointAngle = (k + 0.5) * sliceAngle - (Math.PI / 2);
                    const textX = cx + (radius * textRadiusFactor) * Math.cos(midpointAngle);
                    const textY = cy + (radius * textRadiusFactor) * Math.sin(midpointAngle);
                    
                    const sorszamText = document.createElementNS(SVG_NS, "text");
                    sorszamText.setAttribute("x", textX);
                    sorszamText.setAttribute("y", textY);
                    sorszamText.setAttribute("class", "slice-number-text");
                    sorszamText.textContent = sorszamCounter++;
                    svg.appendChild(sorszamText);
                }

                for (let k = fraction.numerator; k < D_lines; k++) { 
                    if (sorszamCounter > D_lines) break;
                    const midpointAngle = (k + 0.5) * sliceAngle - (Math.PI / 2);
                    const textX = cx + (radius * textRadiusFactor) * Math.cos(midpointAngle);
                    const textY = cy + (radius * textRadiusFactor) * Math.sin(midpointAngle);
                    
                    const sorszamText = document.createElementNS(SVG_NS, "text");
                    sorszamText.setAttribute("x", textX);
                    sorszamText.setAttribute("y", textY);
                    sorszamText.setAttribute("class", "slice-number-text");
                    sorszamText.textContent = sorszamCounter++;
                    svg.appendChild(sorszamText);
                }
            }
            return svg;
        }


        function renderTask(taskType) {
            const taskData = currentTasksData[taskType];
            const displayAreaId = taskType === 'ascending' ? 'fractionDisplayAscending' : 'fractionDisplayDescending';
            const displayArea = document.getElementById(displayAreaId);
            if (!displayArea) {
                console.error("Display area not found:", displayAreaId);
                return;
            }
            displayArea.innerHTML = '';

            let fractionsToDisplay = [...taskData.fractions];
            shuffleArray(fractionsToDisplay);

            fractionsToDisplay.forEach(fraction => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('fraction-item');

                const svgElement = drawFractionSVG(fraction);
                itemDiv.appendChild(svgElement);

                const label = document.createElement('span');
                label.classList.add('fraction-label');
                label.innerHTML = `<sup>${fraction.numerator}</sup>&frasl;<sub>${fraction.denominator}</sub>`;
                itemDiv.appendChild(label);

                displayArea.appendChild(itemDiv);
            });

            const prefix = taskType === 'ascending' ? 'asc' : 'desc';
            for (let i = 1; i <= 5; i++) {
                const inputEl = document.getElementById(`${prefix}_ans_${i}`);
                if (inputEl) {
                    inputEl.value = '';
                }
            }
            const feedbackEl = document.getElementById(`feedback${taskType.charAt(0).toUpperCase() + taskType.slice(1)}`);
            if(feedbackEl){
                feedbackEl.textContent = '';
                feedbackEl.className = 'feedback';
            }
        }

        function generateTask(taskType) {
            const currentTaskConfig = currentTasksData[taskType];
            
            currentTaskConfig.fractions = generateFractionObjects(currentSelectedFractionSubtype);
            
            let sortedFractions = [...currentTaskConfig.fractions].sort((a, b) => {
                const numDiff = taskType === 'ascending' ? a.numericValue - b.numericValue : b.numericValue - a.numericValue;
                if (numDiff !== 0) return numDiff;
                return a.stringValue.localeCompare(b.stringValue);
            });
            currentTaskConfig.solution = sortedFractions.map(f => f.stringValue);

            renderTask(taskType);
            const instructionsElId = taskType === 'ascending' ? 'instructionsAscending' : 'instructionsDescending';
            const instructionsEl = document.getElementById(instructionsElId);
            if(instructionsEl) {
                let subTypeInstructionText = "";
                switch(currentSelectedFractionSubtype) {
                    case 'sameDenominator':
                        subTypeInstructionText = "azonos nevezőjű törteket";
                        break;
                    case 'unitFractions':
                        subTypeInstructionText = "egységtörteket";
                        break;
                    case 'mixedFractions':
                        subTypeInstructionText = "vegyes törteket";
                        break;
                    default:
                        subTypeInstructionText = "törteket";
                }
                const orderText = taskType === 'ascending' ? "növekvő sorrendbe (a legkisebbtől a legnagyobbig)" : "csökkenő sorrendbe (a legnagyobbtól a legkisebbig)";
                const relationSymbol = taskType === 'ascending' ? '≤' : '≥';
                instructionsEl.textContent = `Figyeld meg a kördiagramokat! Írd ${subTypeInstructionText} ${orderText} a megfelelő helyre! Használd a ${relationSymbol} jelet, ha szükséges.`;
            }
        }

        function checkAnswer(taskType) {
            const userAnswersStringsRaw = [];
            const prefix = taskType === 'ascending' ? 'asc' : 'desc';
            let allInputsFound = true;

            for (let i = 1; i <= 5; i++) {
                const inputEl = document.getElementById(`${prefix}_ans_${i}`);
                if (inputEl) {
                    userAnswersStringsRaw.push(inputEl.value.trim().replace(/\s/g, ''));
                } else {
                    allInputsFound = false;
                    break;
                }
            }
            
            const feedbackEl = document.getElementById(`feedback${taskType.charAt(0).toUpperCase() + taskType.slice(1)}`);
            if (!allInputsFound) {
                if (feedbackEl) {
                    feedbackEl.textContent = 'Hiba történt az ellenőrzés során (input mező nem található).';
                    feedbackEl.className = 'feedback incorrect';
                }
                clearFeedback(feedbackEl);
                return;
            }

            const taskFractionsOriginal = currentTasksData[taskType].fractions;
            const userFractionObjectsForSort = [];
            let allUserInputsValidAndFoundInTask = true;

            for (const uStr of userAnswersStringsRaw) {
                if (uStr === "") { 
                    allUserInputsValidAndFoundInTask = false; 
                    continue; 
                }
                const foundFraction = taskFractionsOriginal.find(f => f.stringValue === uStr);
                if (foundFraction) {
                    userFractionObjectsForSort.push(foundFraction);
                } else {
                    allUserInputsValidAndFoundInTask = false;
                    break; 
                }
            }
            
            if (!allUserInputsValidAndFoundInTask && userAnswersStringsRaw.some(s => s !== "")) {
                 if (feedbackEl) {
                    feedbackEl.textContent = 'Egy vagy több beírt tört nem szerepelt a feladványban, vagy üresen hagytál mezőt!';
                    feedbackEl.className = 'feedback incorrect';
                }
                clearFeedback(feedbackEl);
                return;
            }

            let sortedUserAnswerStrings = [...userFractionObjectsForSort].sort((a, b) => {
                const numDiff = taskType === 'ascending' ? a.numericValue - b.numericValue : b.numericValue - a.numericValue;
                if (numDiff !== 0) return numDiff;
                return a.stringValue.localeCompare(b.stringValue);
            }).map(f => f.stringValue);

            const solution = currentTasksData[taskType].solution;
            let isCorrect = true;

            if (sortedUserAnswerStrings.length !== solution.length) { 
                 isCorrect = false;
            } else {
                for (let i = 0; i < solution.length; i++) {
                    if (sortedUserAnswerStrings[i] !== solution[i]) {
                        isCorrect = false;
                        break;
                    }
                }
            }
            
            if (isCorrect && sortedUserAnswerStrings.length === solution.length && solution.length > 0) { 
                feedbackEl.textContent = 'Helyes! Ügyes vagy! ✨';
                feedbackEl.className = 'feedback correct';
            } else {
                const missingInputs = userAnswersStringsRaw.some(ans => ans === "");
                if (solution.length === 0) {
                     feedbackEl.textContent = 'Hiba történt a feladat generálásakor. Kérlek, kattints az "Új feladat" gombra. 🔄';
                } else if (missingInputs && userAnswersStringsRaw.filter(s => s !== "").length > 0) { 
                    feedbackEl.textContent = 'Nem adtál meg minden értéket a sorrendhez. Kérlek, pótold a hiányzó törteket! ✏️';
                } else if (userAnswersStringsRaw.every(ans => ans === "")) { 
                     feedbackEl.textContent = 'Kérlek, add meg a törtek helyes sorrendjét! ✏️';
                }
                else {
                    feedbackEl.textContent = 'Nem jó a sorrend. Próbáld újra! 🤔';
                }
                feedbackEl.className = 'feedback incorrect';
            }
            clearFeedback(feedbackEl);
        }

        function clearFeedback(feedbackEl) {
            setTimeout(() => {
                if (feedbackEl) {
                    feedbackEl.textContent = '';
                    feedbackEl.className = 'feedback';
                }
            }, 10000);
        }


        document.addEventListener('DOMContentLoaded', function() {
            subtypeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.subtype === currentSelectedFractionSubtype);
            });
            
            applyTheme('theme-candy');
            generateTask('ascending');
            generateTask('descending');
        });