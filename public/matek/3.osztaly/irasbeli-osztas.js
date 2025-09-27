// Globális DOM Elemek Referenciái
        const themeSelector = document.getElementById('themeSelector');
        const dividendLengthSelector = document.getElementById('dividendLengthSelector');
        const remainderTypeSelector = document.getElementById('remainderTypeSelector');
        const helpLevelSelector = document.getElementById('helpLevelSelector');
        const newTaskButton = document.getElementById('newTaskButton');
        const checkStepButton = document.getElementById('checkStepButton');
        const taskInstructions = document.getElementById('taskInstructions');
        const mainDivisionGrid = document.getElementById('mainDivisionGrid'); 
        const finalRemainderValueEl = document.getElementById('finalRemainderValue'); 
        const bodyEl = document.body;

        // Új: Az művelettörténet oszlop szélessége (grid egységekben)
        // Megnövelve a szélességet, hogy elférjenek a szorzások (pl. 9 x 9 = 81)
        const operationColumnSpan = 8; 

        // Aktuális beállítások és feladat állapotát tároló objektumok
        let currentSettings = {
            theme: 'theme-candy', 
            dividendLength: 3,   
            remainderType: 'none', 
            helpLevel: 'step-by-step' 
        };

        let task = {
            dividend: 0,           
            divisor: 0,            
            quotientDigits: [],
            finalRemainder: 0,   
            steps: []              
        };
        
        // Az osztási folyamat állapotát követő változók
        let currentStepIndex = 0;      
        let currentSubStep = 'estimate'; 

        // Eseménykezelők a beállító gombokhoz
        themeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.theme = e.target.dataset.theme;
                applyTheme(currentSettings.theme);
            }
        });
        dividendLengthSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.dividendLength = parseInt(e.target.dataset.length);
                updateActiveButtonVisuals(dividendLengthSelector, e.target);
                generateNewTask(); 
            }
        });
        remainderTypeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.remainderType = e.target.dataset.remainder;
                updateActiveButtonVisuals(remainderTypeSelector, e.target);
                generateNewTask();
            }
        });
        helpLevelSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.helpLevel = e.target.dataset.help;
                updateActiveButtonVisuals(helpLevelSelector, e.target);
                generateNewTask(); 
            }
        });

        // Eseménykezelők a fő funkciógombokhoz
        newTaskButton.addEventListener('click', generateNewTask);
        checkStepButton.addEventListener('click', handleCheck);

        /**
         * Alkalmazza az aktuálisan kiválasztott témát és frissíti a gombok aktív állapotát.
         */
        function applyTheme(themeClass) {
            bodyEl.className = ''; 
            bodyEl.classList.add(themeClass); 
            // Update active theme button
            themeSelector.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
            // Update other active buttons (dividend length, remainder type, help level)
            updateActiveButtonVisuals(dividendLengthSelector, dividendLengthSelector.querySelector(`[data-length="${currentSettings.dividendLength}"]`));
            updateActiveButtonVisuals(remainderTypeSelector, remainderTypeSelector.querySelector(`[data-remainder="${currentSettings.remainderType}"]`));
            updateActiveButtonVisuals(helpLevelSelector, helpLevelSelector.querySelector(`[data-help="${currentSettings.helpLevel}"]`));
        }
        
        /**
         * Kiemeli az aktív gombot egy gombcsoporton belül.
         * @param {HTMLElement} container - A gombcsoportot tartalmazó elem.
         * @param {HTMLElement} activeButton - Az aktívvá váló gomb.
         */
        function updateActiveButtonVisuals(container, activeButton) {
            if (!container || !activeButton) return;
            container.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            activeButton.classList.add('active');
        }

        /**
         * Új osztási feladatot generál a jelenlegi beállítások alapján.
         */
        function generateNewTask() {
            currentStepIndex = 0;
            currentSubStep = 'estimate';
            task = { dividend: 0, divisor: 0, quotientDigits: [], finalRemainder: 0, steps: [] };
            
            mainDivisionGrid.innerHTML = ''; 
            document.getElementById('finalRemainderArea').innerHTML = 'Maradék: <span id="finalRemainderValueInputContainer">-</span>'; 
            feedbackArea.textContent = '\u00A0'; 
            feedbackArea.className = 'feedback mt-4'; 
            
            task.divisor = Math.floor(Math.random() * 8) + 2; 

            let minDividend = currentSettings.dividendLength === 2 ? task.divisor : task.divisor * 10; 
            if (currentSettings.dividendLength === 2) minDividend = Math.max(10, task.divisor); 
            else minDividend = Math.max(100, task.divisor); 

            let maxDividend = currentSettings.dividendLength === 2 ? 99 : 999;
            
            let foundSuitableDividend = false;
            let attempts = 0; 
            while(!foundSuitableDividend && attempts < 200) { 
                task.dividend = Math.floor(Math.random() * (maxDividend - minDividend + 1)) + minDividend;
                let tempRemainder = task.dividend % task.divisor;

                if (currentSettings.remainderType === 'none' && tempRemainder === 0) foundSuitableDividend = true;
                else if (currentSettings.remainderType === 'with' && tempRemainder !== 0) foundSuitableDividend = true;
                else if (currentSettings.remainderType === 'mixed') foundSuitableDividend = true;
                
                if (foundSuitableDividend) {
                    const dividendStr = String(task.dividend);
                    let firstPartToDivide = parseInt(dividendStr[0]);
                    if (firstPartToDivide < task.divisor && dividendStr.length > 1) {
                        firstPartToDivide = parseInt(dividendStr.substring(0,2));
                    }
                    if (firstPartToDivide < task.divisor) { 
                            if (dividendStr.length === currentSettings.dividendLength) foundSuitableDividend = false; 
                    }
                }
                attempts++;
            }
             if (!foundSuitableDividend) { 
                task.dividend = currentSettings.dividendLength === 2 ? task.divisor * (Math.floor(Math.random()*8)+2) : task.divisor * (Math.floor(Math.random()*80)+12);
                if (currentSettings.remainderType === 'with' && task.dividend % task.divisor === 0 && task.divisor > 1) {
                    if (task.dividend < maxDividend) task.dividend +=1; else task.dividend -= (task.divisor-1);
                }
                else if (currentSettings.remainderType === 'none') task.dividend -= (task.dividend % task.divisor);
                if (task.dividend < minDividend) task.dividend = minDividend + (task.dividend % task.divisor === 0 ? 0 : task.divisor - (task.dividend % task.divisor));
            }

            calculateCorrectSteps();    
            renderTaskDisplay();        
            prepareCurrentStepInputs(); 
            updateTaskInstructions();   
        }

    /**
     * Kiszámítja az írásbeli osztás helyes lépéseit és eredményeit.
     */
    function calculateCorrectSteps() {
        let dividendStr = String(task.dividend);
        let currentRemainderForNextStep = 0; 
        task.steps = [];
        task.quotientDigits = [];
        
        for (let i = 0; i < dividendStr.length; i++) {
            let digitBroughtDown = dividendStr[i]; 
            let currentDividendPartNum = currentRemainderForNextStep * 10 + parseInt(digitBroughtDown);
            
            if (currentDividendPartNum >= task.divisor || task.quotientDigits.length > 0 || i === dividendStr.length - 1) {
                let quotientDigit = Math.floor(currentDividendPartNum / task.divisor); 
                let multiplyResult = quotientDigit * task.divisor;                     
                let subtractResult = currentDividendPartNum - multiplyResult;           

                task.quotientDigits.push(quotientDigit); 
                task.steps.push({ 
                    currentDividendPartNumForStep: currentDividendPartNum,
                    baseDigitIndexOfOriginalPartEnd: i,
                    quotientDigit: quotientDigit,                                  
                    multiplyResult: multiplyResult,                                
                    subtractResult: subtractResult,                                
                    digitBroughtDownForThisPart: digitBroughtDown, 
                    nextDigitToBringDown: (i + 1 < dividendStr.length) ? dividendStr[i + 1] : null 
                });
                currentRemainderForNextStep = subtractResult; 
            } else {
                currentRemainderForNextStep = currentDividendPartNum;
            }
        }
        task.finalRemainder = currentRemainderForNextStep; 

        if (task.quotientDigits.length === 0 && task.dividend < task.divisor) {
             task.quotientDigits.push(0);
             task.steps.push({
                currentDividendPartNumForStep: task.dividend,
                baseDigitIndexOfOriginalPartEnd: dividendStr.length - 1,
                quotientDigit: 0,
                multiplyResult: 0,
                subtractResult: task.dividend,
                digitBroughtDownForThisPart: dividendStr[dividendStr.length-1], 
                nextDigitToBringDown: null
            });
            task.finalRemainder = task.dividend;
        }
    }

        /**
         * Megjeleníti az osztási feladatot a rácson.
         * "Önálló" módban az összes számítási lépéshez input mezőket hoz létre.
         */
        function renderTaskDisplay() {
            mainDivisionGrid.innerHTML = ''; 
            const dividendStr = String(task.dividend);
            const divisorStr = String(task.divisor);
            let quotientLength = task.quotientDigits.length;

            if (task.steps.length === 0 && quotientLength === 1 && task.quotientDigits[0] === 0) {
            } else if (quotientLength === 0) {
                 console.error("renderTaskDisplay: quotientLength is 0 unexpectedly. Dividend:", task.dividend, "Divisor:", task.divisor, "Steps:", task.steps);
                 if(task.steps.length > 0) quotientLength = task.steps.length; 
                 else if (task.dividend > 0 && task.divisor > 0) quotientLength = String(Math.floor(task.dividend / task.divisor)).length || 1; 
                 else quotientLength = 1; 
            }


            const firstRow = 1; 
            
            // Calculate the number of fixed 30px columns for the main division part
            // This includes: 1 (initial empty) + dividend length + 1 (colon) + divisor length + 1 (equals) + max(1, quotient length)
            const mainDivisionFixedCols = 1 + dividendStr.length + 1 + divisorStr.length + 1 + Math.max(1, quotientLength);

            let gridTemplateColumnsDefinition = '';
            let currentGridColumnStart = 1;

            if (currentSettings.helpLevel === 'step-by-step') {
                // Add auto-width columns for operation history
                gridTemplateColumnsDefinition += `repeat(${operationColumnSpan}, auto) `;
                currentGridColumnStart += operationColumnSpan; // Shift start column for main division

                // Add one 30px spacing column
                gridTemplateColumnsDefinition += `30px `;
                currentGridColumnStart += 1; // Shift start column for main division again
            }

            // Add the fixed 30px columns for the main division
            gridTemplateColumnsDefinition += `repeat(${mainDivisionFixedCols}, 30px)`;

            mainDivisionGrid.style.gridTemplateColumns = gridTemplateColumnsDefinition;

            let currentGridColumn = currentGridColumnStart; // This will track the actual grid column index for placing elements

            // The operation history cells are created first in renderTaskDisplay and placed at column 1.
            // Their content is filled in prepareCurrentStepInputs.
            /*if (currentSettings.helpLevel === 'step-by-step') {
                task.steps.forEach((step, stepIdx) => {
                    const currentRowForMultiply = 1 + stepIdx * 2 + 1;
                    const currentRowForSubtract = 1 + stepIdx * 2 + 2;

                    const multiplyOperationCell = createGridCell('', currentRowForMultiply, 1, ['operation-history-cell', `multiply-op-step-${stepIdx}`]);
                    multiplyOperationCell.style.gridColumn = `1 / span ${operationColumnSpan}`;
                    //mainDivisionGrid.appendChild(multiplyOperationCell);

                    const subtractOperationCell = createGridCell('', currentRowForSubtract, 1, ['operation-history-cell', `subtract-op-step-${stepIdx}`]);
                    subtractOperationCell.style.gridColumn = `1 / span ${operationColumnSpan}`;
                    //mainDivisionGrid.appendChild(subtractOperationCell);
                });
            }*/

            // Add the initial empty cell before the dividend
            mainDivisionGrid.appendChild(createGridCell(null, firstRow, currentGridColumn++)); 

            for (let i = 0; i < dividendStr.length; i++) {
                const cell = createGridCell(dividendStr[i], firstRow, currentGridColumn, ['dividend-digit']);
                cell.dataset.originalDividendIndex = i; 
                cell.dataset.gridColumnActual = currentGridColumn; 
                mainDivisionGrid.appendChild(cell);
                currentGridColumn++;
            }
            
            mainDivisionGrid.appendChild(createGridCell(':', firstRow, currentGridColumn++, ['op-symbol', 'divisor-operator-cell']));
            
            for (let i = 0; i < divisorStr.length; i++) {
                mainDivisionGrid.appendChild(createGridCell(divisorStr[i], firstRow, currentGridColumn++, ['divisor-digit-cell']));
            }

            mainDivisionGrid.appendChild(createGridCell('=', firstRow, currentGridColumn++, ['op-symbol']));

            // Hányados beviteli mezőinek létrehozása
            for (let i = 0; i < quotientLength; i++) {
                const inputId = `q-${i}`;
                const input = createStyledInput(currentSettings.helpLevel !== 'independent', inputId, 'quotient'); 
                const colorIndex = i % 3; 
                const cell = createGridCell(null, firstRow, currentGridColumn++);
                cell.classList.add(`quotient-cell-bg-${colorIndex}`); 
                cell.appendChild(input);
                mainDivisionGrid.appendChild(cell);
            }
            if (quotientLength === 0) { 
                const inputId = `q-0`;
                const input = createStyledInput(currentSettings.helpLevel !== 'independent', inputId, 'quotient');
                const cell = createGridCell(null, firstRow, currentGridColumn++);
                cell.classList.add(`quotient-cell-bg-0`); 
                cell.appendChild(input);
                mainDivisionGrid.appendChild(cell);
            }

            // "Önálló" mód: A teljes számítási terület létrehozása input mezőkkel
            if (currentSettings.helpLevel === 'independent') {
                let currentRowDynamic = 1; 
                task.steps.forEach((step, stepIdx) => {
                    const colorIndex = stepIdx % 3;
                    const alignToDividendCell = mainDivisionGrid.querySelector(`.grid-cell.dividend-digit[data-original-dividend-index="${step.baseDigitIndexOfOriginalPartEnd}"]`);
                    if (!alignToDividendCell) return;
                    const targetAlignColumn = parseInt(alignToDividendCell.dataset.gridColumnActual);

                    // Kivonás eredményének (részmaradék) input mezői
                    currentRowDynamic++;
                    const subtractResultStr = String(step.subtractResult);
                    const subtractActualStartCol = targetAlignColumn - subtractResultStr.length + 1;
                    for (let i = 0; i < subtractResultStr.length; i++) {
                        const inputId = `s-${stepIdx}-${i}`;
                        const input = createStyledInput(false, inputId, 'subtract'); 
                        const cell = createGridCell(null, currentRowDynamic, subtractActualStartCol + i);
                        cell.classList.add(`subtract-result-bg-${colorIndex}`);
                        cell.appendChild(input);
                        mainDivisionGrid.appendChild(cell);
                    }

                    // Lehozott számjegy input mezője (ha van)
                    if (step.nextDigitToBringDown !== null) {
                        const broughtDownCellCol = targetAlignColumn - subtractResultStr.length + 1 + subtractResultStr.length; 
                        const inputId = `bd-${stepIdx}`; 
                        const input = createStyledInput(false, inputId, 'brought-down'); 
                        const cell = createGridCell(null, currentRowDynamic, broughtDownCellCol, ['brought-down-digit-cell']);
                        cell.classList.add(`subtract-result-bg-${colorIndex}`); 
                        cell.appendChild(input);
                        mainDivisionGrid.appendChild(cell);
                    }
                });
                // Végső maradék input mezőjének beállítása "Önálló" módban
                const remainderInputContainer = document.getElementById('finalRemainderValueInputContainer');
                if (remainderInputContainer) {
                    const input = createStyledInput(false, 'final-remainder-input', 'remainder');
                    input.maxLength = String(task.divisor -1).length || 1; 
                    remainderInputContainer.innerHTML = ''; 
                    remainderInputContainer.appendChild(input);
                }
            } else { // Lépésenkénti vagy vezetett mód: a maradék csak egy span
                document.getElementById('finalRemainderArea').innerHTML = 'Maradék: <span id="finalRemainderValueInputContainer">-</span>';
            }
        }
        
        /**
         * Létrehoz egy rács cellát a megadott tartalommal, pozícióval és osztályokkal.
         */
        function createGridCell(content, row, col, classList = []) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell', ...classList);
            if (content !== null) cell.textContent = content;
            cell.style.gridRow = String(row); 
            cell.style.gridColumn = `${col} / span 1`; 
            return cell;
        }

        /**
         * Létrehoz egy stílusozott input mezőt.
         */
        function createStyledInput(disabled, id, type = null) { 
            const input = document.createElement('input');
            input.type = 'text'; 
            input.classList.add('styled-input');
            input.id = id; 

            if (type === 'quotient') {
                input.classList.add('quotient-digit-input');
                input.dataset.index = id.split('-')[1]; 
                 if (currentSettings.helpLevel === 'independent') { 
                    input.addEventListener('input', handleInputAndFocusNext); 
                }
            } else if (type === 'multiply' || type === 'subtract' || type === 'brought-down') { 
                input.classList.add(`${type}-digit-value`);
                input.dataset.type = type; 
                const parts = id.split('-'); 
                if (parts.length > 1 && type === 'brought-down') { 
                     input.dataset.stepIndex = parts[1];
                } else if (parts.length > 2) { 
                    input.dataset.stepIndex = parts[1]; 
                    input.dataset.digitIndex = parts[2]; 
                }
                input.addEventListener('input', handleInputAndFocusNext);
            } else if (type === 'remainder' && currentSettings.helpLevel === 'independent') {
                 input.classList.add('remainder-digit-value'); 
            }
            
            input.maxLength = (type === 'remainder' && String(task.divisor -1).length > 1) ? String(task.divisor -1).length : 1; 
            input.disabled = disabled;
            return input;
        }

        /**
         * Kezeli a bevitelt és a fókuszt a következő input mezőre többjegyű számok esetén.
         */
        function handleInputAndFocusNext(event) {
            const currentInput = event.target;
            if (currentInput.value.length >= currentInput.maxLength && currentSettings.helpLevel !== 'guided') {
                const inputId = currentInput.id;
                const parts = inputId.split('-'); 
                const type = parts[0]; 
                const stepIndex = parseInt(parts[1]); 
                const currentDigitIndex = parts[2] ? parseInt(parts[2]) : -1; 

                let targetInput = null;

                if (currentSettings.helpLevel === 'independent') {
                    // "Önálló" mód: fókuszálás logikája
                    if (type === 'q') { // Hányados
                        const nextQuotientIndex = stepIndex + 1;
                        if (nextQuotientIndex < task.quotientDigits.length) {
                            targetInput = document.getElementById(`q-${nextQuotientIndex}`);
                        } else { // Utolsó hányados számjegy után
                            targetInput = document.getElementById(`m-0-0`) || document.getElementById(`s-0-0`) || document.getElementById(`bd-0`) || document.getElementById('final-remainder-input');
                        }
                    } else if (type === 'm') { // Szorzás
                        const multiplyResultStr = String(task.steps[stepIndex].multiplyResult);
                        if (currentDigitIndex < multiplyResultStr.length - 1) {
                            targetInput = document.getElementById(`m-${stepIndex}-${currentDigitIndex + 1}`);
                        } else { // Szorzás utolsó számjegye után
                            targetInput = document.getElementById(`s-${stepIndex}-0`) || // Kivonás első számjegye
                                           (task.steps[stepIndex].nextDigitToBringDown !== null ? document.getElementById(`bd-${stepIndex}`) : null) || // Vagy lehozott számjegy
                                           (stepIndex + 1 < task.steps.length ? document.getElementById(`q-${stepIndex + 1}`) : document.getElementById('final-remainder-input')); // Vagy következő hányados, vagy végső maradék
                        }
                    } else if (type === 's') { // Kivonás
                        const subtractResultStr = String(task.steps[stepIndex].subtractResult);
                        if (currentDigitIndex < subtractResultStr.length - 1) {
                            targetInput = document.getElementById(`s-${stepIndex}-${currentDigitIndex + 1}`);
                        } else { // Kivonás utolsó számjegye után
                            if (task.steps[stepIndex].nextDigitToBringDown !== null) {
                                targetInput = document.getElementById(`bd-${stepIndex}`); // Lehozott számjegy
                            } else if (stepIndex + 1 < task.steps.length) { 
                                targetInput = document.getElementById(`q-${stepIndex + 1}`); // Következő hányados
                            } else {
                                targetInput = document.getElementById('final-remainder-input'); // Végső maradék
                            }
                        }
                    } else if (type === 'bd') { // Lehozott számjegy után
                             if (stepIndex + 1 < task.steps.length) { // Van következő lépés
                                 targetInput = document.getElementById(`q-${stepIndex + 1}`); // Következő hányados
                            } else {
                                 targetInput = document.getElementById('final-remainder-input'); // Végső maradék
                            }
                    }
                } else { // Lépésenkénti mód
                     if (type === 'm') {
                        const multiplyResultStr = String(task.steps[stepIndex].multiplyResult);
                        if (currentDigitIndex < multiplyResultStr.length - 1) {
                            targetInput = document.getElementById(`m-${stepIndex}-${currentDigitIndex + 1}`);
                        }
                    } else if (type === 's') {
                        const subtractResultStr = String(task.steps[stepIndex].subtractResult);
                        if (currentDigitIndex < subtractResultStr.length - 1) {
                            targetInput = document.getElementById(`s-${stepIndex}-${currentDigitIndex + 1}`);
                        }
                    }
                }


                if (targetInput) {
                    if(targetInput.disabled && currentSettings.helpLevel === 'independent') {
                        // "Önálló" módban az inputok már engedélyezve vannak a prepareCurrentStepInputs által
                    } else if (targetInput.disabled) {
                         targetInput.disabled = false; 
                    }
                    try { targetInput.focus(); } catch (e) {}
                }
            }
        }
        
        /**
         * Kiemeli az aktuális művelet operandusait (csak lépésenkénti és vezetett módban).
         */
        function updateOperandHighlights() {
            document.querySelectorAll('.grid-cell.operand-highlight-cell').forEach(cell => cell.classList.remove('operand-highlight-cell'));
            if (currentSettings.helpLevel === 'independent') return; 

            if (currentStepIndex >= task.steps.length && !(task.steps.length === 0 && task.quotientDigits.length > 0 && task.quotientDigits[0] === 0)) return; 
            
            let currentStepData;
            if (task.steps.length === 0 && task.quotientDigits.length > 0 && task.quotientDigits[0] === 0 && currentStepIndex === 0) {
                currentStepData = { 
                    currentDividendPartNumForStep: task.dividend,
                    baseDigitIndexOfOriginalPartEnd: String(task.dividend).length -1
                };
            } else if (currentStepIndex < task.steps.length) {
                currentStepData = task.steps[currentStepIndex];
            } else {
                return; 
            }
            
            if (!currentStepData) return;


            const divisorCells = Array.from(mainDivisionGrid.querySelectorAll('.divisor-digit-cell'));

            if (currentSubStep === 'estimate') {
                if (currentStepIndex === 0 || (task.steps.length === 0 && task.quotientDigits.length > 0 && task.quotientDigits[0] === 0) ) { 
                    const dividendStr = String(task.dividend);
                    const partStrLength = String(currentStepData.currentDividendPartNumForStep).length;
                    let highlightStartIndex = currentStepData.baseDigitIndexOfOriginalPartEnd - partStrLength + 1;
                    let highlightEndIndex = currentStepData.baseDigitIndexOfOriginalPartEnd;
                    highlightStartIndex = Math.max(0, highlightStartIndex);
                    highlightEndIndex = Math.min(dividendStr.length - 1, highlightEndIndex);

                    for (let i = highlightStartIndex; i <= highlightEndIndex; i++) {
                        const dividendCell = mainDivisionGrid.querySelector(`.grid-cell.dividend-digit[data-original-dividend-index="${i}"]`);
                        if (dividendCell) dividendCell.classList.add('operand-highlight-cell');
                    }
                } else { 
                    const prevStepData = task.steps[currentStepIndex - 1];
                    if (!prevStepData) return;
                    const subtractResultStrPrev = String(prevStepData.subtractResult);
                    
                    for (let i = 0; i < subtractResultStrPrev.length; i++) {
                        const inputId = `s-${currentStepIndex - 1}-${i}`;
                        const inputElement = document.getElementById(inputId);
                        if (inputElement && inputElement.parentElement) {
                            inputElement.parentElement.classList.add('operand-highlight-cell');
                        }
                    }
                    if (prevStepData.nextDigitToBringDown !== null) {
                        const broughtDownCell = mainDivisionGrid.querySelector(`.grid-cell.brought-down-digit-cell[data-step-context="${currentStepIndex - 1}"]`); 
                        if (broughtDownCell) broughtDownCell.classList.add('operand-highlight-cell');
                    }
                }
                divisorCells.forEach(cell => cell.classList.add('operand-highlight-cell'));

            } else if (currentSubStep === 'multiply') {
                const quotientDigitInput = document.getElementById(`q-${currentStepIndex}`);
                if (quotientDigitInput && quotientDigitInput.parentElement) {
                    quotientDigitInput.parentElement.classList.add('operand-highlight-cell');
                }
                divisorCells.forEach(cell => cell.classList.add('operand-highlight-cell'));

            } else if (currentSubStep === 'subtract') {
                 if (currentStepIndex === 0) {
                    const dividendStr = String(task.dividend);
                    const partStrLength = String(currentStepData.currentDividendPartNumForStep).length;
                    let highlightStartIndex = currentStepData.baseDigitIndexOfOriginalPartEnd - partStrLength + 1;
                    let highlightEndIndex = currentStepData.baseDigitIndexOfOriginalPartEnd;
                     highlightStartIndex = Math.max(0, highlightStartIndex);
                    highlightEndIndex = Math.min(dividendStr.length - 1, highlightEndIndex);
                    for (let i = highlightStartIndex; i <= highlightEndIndex; i++) {
                        const dividendCell = mainDivisionGrid.querySelector(`.grid-cell.dividend-digit[data-original-dividend-index="${i}"]`);
                        if (dividendCell) dividendCell.classList.add('operand-highlight-cell');
                    }
                } else { 
                    const prevStepData = task.steps[currentStepIndex - 1];
                     if (!prevStepData) return;
                    const subtractResultStrPrev = String(prevStepData.subtractResult);
                    for (let i = 0; i < subtractResultStrPrev.length; i++) {
                        const inputId = `s-${currentStepIndex - 1}-${i}`;
                        const inputElement = document.getElementById(inputId);
                        if (inputElement && inputElement.parentElement) {
                             inputElement.parentElement.classList.add('operand-highlight-cell');
                        }
                    }
                    if (prevStepData.nextDigitToBringDown !== null) {
                         const broughtDownCell = mainDivisionGrid.querySelector(`.grid-cell.brought-down-digit-cell[data-step-context="${currentStepIndex - 1}"]`);
                        if (broughtDownCell) broughtDownCell.classList.add('operand-highlight-cell');
                    }
                }

                const multiplyResultStr = String(currentStepData.multiplyResult);
                for (let i = 0; i < multiplyResultStr.length; i++) {
                    const inputId = `m-${currentStepIndex}-${i}`;
                    const inputElement = document.getElementById(inputId);
                    if (inputElement && inputElement.parentElement) {
                        inputElement.parentElement.classList.add('operand-highlight-cell');
                    }
                }
            }
        }


        /**
         * Előkészíti a beviteli mezőket az aktuális lépéshez.
         * "Önálló" módban minden releváns mezőt engedélyez.
         * Más módokban a `currentSubStep` alapján engedélyezi a mezőket.
         */
        function prepareCurrentStepInputs() {
            mainDivisionGrid.querySelectorAll('input.styled-input').forEach(inp => { 
                inp.style.borderColor = ''; 
                if (currentSettings.helpLevel !== 'independent') { 
                     inp.disabled = true; 
                }
            });
            
            // Új: Művelettörténet cellák tartalmának előkészítése
            if (currentSettings.helpLevel === 'step-by-step') {
                const stepData = task.steps[currentStepIndex];
				console.log('currentStepIndex', currentStepIndex);
				console.log('currentSubStep', currentSubStep);
				console.log('stepData', stepData);
                if (stepData) {
				
                    if (currentSubStep === 'estimate') {

						const prevSubtractOpCell = document.querySelector(`.subtract-op-step-${currentStepIndex-1}`);
						console.log('prevSubtractOpCell', prevSubtractOpCell);
						console.log('task.steps[currentStepIndex-1]', task.steps[currentStepIndex-1]);
						if (prevSubtractOpCell) prevSubtractOpCell.textContent = `${task.steps[currentStepIndex-1].currentDividendPartNumForStep} - ${task.steps[currentStepIndex-1].multiplyResult} = ${task.steps[currentStepIndex-1].subtractResult}`;
						if (prevSubtractOpCell) console.log('prevSubtractOpCell.textContent', prevSubtractOpCell.textContent);
										
                    } else if (currentSubStep === 'multiply') {					
					
						const currentRowForMultiply = 1 + currentStepIndex * 2 + 1;
						var multiplyOperationCell = document.querySelector(`.multiply-op-step-${currentStepIndex}`);
						if(!multiplyOperationCell) {
							multiplyOperationCell = createGridCell('', currentRowForMultiply, 1, ['operation-history-cell', `multiply-op-step-${currentStepIndex}`]);
							multiplyOperationCell.style.gridColumn = `1 / span ${operationColumnSpan}`;
							mainDivisionGrid.appendChild(multiplyOperationCell);						
						}
                        if (multiplyOperationCell) {
                            multiplyOperationCell.textContent = `${stepData.quotientDigit} × ${task.divisor} = ?`;
                        }
                    } else if (currentSubStep === 'subtract') {
					
						const prevMultiplyOpCell = document.querySelector(`.multiply-op-step-${currentStepIndex}`);
						console.log('prevMultiplyOpCell', prevMultiplyOpCell);
						if (prevMultiplyOpCell) prevMultiplyOpCell.textContent = `${task.steps[currentStepIndex].quotientDigit} × ${task.divisor} = ${task.steps[currentStepIndex].multiplyResult}`;

						const currentRowForSubtract = 1 + currentStepIndex * 2 + 2;
						var subtractOperationCell = document.querySelector(`.subtract-op-step-${currentStepIndex}`);
						if(!subtractOperationCell) {
							subtractOperationCell = createGridCell('', currentRowForSubtract, 1, ['operation-history-cell', `subtract-op-step-${currentStepIndex}`]);
							subtractOperationCell.style.gridColumn = `1 / span ${operationColumnSpan}`;
							mainDivisionGrid.appendChild(subtractOperationCell);						
						}
                        if (subtractOperationCell) {
                            subtractOperationCell.textContent = `${stepData.currentDividendPartNumForStep} - ${stepData.multiplyResult} = ?`;
                        }
                    }										
                }
            }


            if (currentStepIndex >= task.steps.length && !(task.steps.length === 0 && task.quotientDigits.length > 0 && task.quotientDigits[0] === 0) ) { 
                checkStepButton.textContent = "Új feladat";
                 if (currentSettings.helpLevel !== 'independent') {
                    document.getElementById('finalRemainderArea').innerHTML = `Maradék: <span id="finalRemainderValueInputContainer">${task.finalRemainder}</span>`;
                }
                updateOperandHighlights(); 
                return;
            }
            
            if (task.steps.length === 0 && task.quotientDigits.length > 0 && task.quotientDigits[0] === 0) { 
                 if (currentStepIndex === 0 && currentSubStep === 'estimate') { 
                    const quotientInputId = `q-0`;
                    const quotientDigitInput = document.getElementById(quotientInputId);
                    if (quotientDigitInput) {
                        quotientDigitInput.disabled = false;
                        if (currentSettings.helpLevel === 'guided') quotientDigitInput.value = 0;
                        else if (currentSettings.helpLevel !== 'independent') quotientDigitInput.value = ''; 

                        if (currentSettings.helpLevel !== 'guided') try { quotientDigitInput.focus(); } catch(e){}
                    }
                    updateOperandHighlights();
                    updateTaskInstructions();
                    return;
                } 
            } else if (currentStepIndex >= task.steps.length) { 
                checkStepButton.textContent = "Új feladat";
                 if (currentSettings.helpLevel !== 'independent') {
                    document.getElementById('finalRemainderArea').innerHTML = `Maradék: <span id="finalRemainderValueInputContainer">${task.finalRemainder}</span>`;
                }
                updateOperandHighlights();
                return;
            }


            if (!task.steps[currentStepIndex] && !(task.quotientDigits.length > 0 && task.quotientDigits[0] === 0 && currentStepIndex === 0)) { 
                 return;
            }
            
            if (currentSettings.helpLevel === 'independent') {
                 task.quotientDigits.forEach((_, i) => {
                    const qInput = document.getElementById(`q-${i}`);
                    if (qInput) qInput.disabled = false;
                });
                task.steps.forEach((step, stepIdx) => {
                    const multiplyResultStr = String(step.multiplyResult);
                    for (let i = 0; i < multiplyResultStr.length; i++) {
                        const mInput = document.getElementById(`m-${stepIdx}-${i}`);
                        if (mInput) mInput.disabled = false;
                    }
                    const subtractResultStr = String(step.subtractResult);
                    for (let i = 0; i < subtractResultStr.length; i++) {
                        const sInput = document.getElementById(`s-${stepIdx}-${i}`);
                        if (sInput) sInput.disabled = false;
                    }
                    if (step.nextDigitToBringDown !== null) {
                        const bdInput = document.getElementById(`bd-${stepIdx}`);
                        if (bdInput) bdInput.disabled = false;
                    }
                });
                const finalRemInput = document.getElementById('final-remainder-input');
                if (finalRemInput) finalRemInput.disabled = false;
                
                const firstQuotientInput = document.getElementById('q-0');
                if (firstQuotientInput) try {firstQuotientInput.focus(); } catch(e){}
                updateTaskInstructions();
                return; 
            }
            
            updateOperandHighlights(); 
            const currentStepData = task.steps[currentStepIndex]; 
            
            const quotientInputId = `q-${currentStepIndex}`;
            const quotientDigitInput = document.getElementById(quotientInputId); 

            const colorIndex = currentStepIndex % 3; 

            if (currentSubStep === 'estimate') { 
                if (quotientDigitInput) {
                    quotientDigitInput.disabled = false; 
                    if (currentSettings.helpLevel === 'guided' && currentStepData) { 
                        quotientDigitInput.value = currentStepData.quotientDigit;
                    } else {
                        quotientDigitInput.value = ''; 
                    }
                    if(currentSettings.helpLevel !== 'guided') {
                        try { quotientDigitInput.focus(); } catch (e) { console.warn("Focus failed for estimate input", e); }
                    }
                } else {
                    console.error("Quotient input #" + quotientInputId + " not found! (estimate sub-step)"); 
                }
            } else { 
                 if (!currentStepData) { 
                    console.error("prepareCurrentStepInputs: currentStepData is undefined for multiply/subtract. Step:", currentStepIndex);
                    return;
                }
                if (quotientDigitInput) { 
                    if (!quotientDigitInput.value && currentSettings.helpLevel === 'guided') {
                        quotientDigitInput.value = currentStepData.quotientDigit;
                    }
                    quotientDigitInput.disabled = true; 
                }
                
                const multiplyResultStr = String(currentStepData.multiplyResult);
                const subtractResultStr = String(currentStepData.subtractResult);
                
                const alignToDividendCell = mainDivisionGrid.querySelector(`.grid-cell.dividend-digit[data-original-dividend-index="${currentStepData.baseDigitIndexOfOriginalPartEnd}"]`);
                 if (!alignToDividendCell) {
                     console.error("prepareCurrentStepInputs: alignToDividendCell not found for multiply/subtract.");
                     return;
                }
                const targetAlignColumn = parseInt(alignToDividendCell.dataset.gridColumnActual); 
                const currentRowForMultiply = 1 + currentStepIndex * 2 + 1; 
                const currentRowForSubtract = 1 + currentStepIndex * 2 + 2; 


                if (currentSubStep === 'multiply') { 
                    const opCellCol = targetAlignColumn - multiplyResultStr.length; 
                    const opCellRow = currentRowForMultiply;
                    
                    let opSymbolCell = mainDivisionGrid.querySelector(`.op-symbol[style*="grid-row: ${opCellRow}"][style*="grid-column: ${opCellCol}"]`);
                    if (!opSymbolCell) {
                        opSymbolCell = createGridCell('-', opCellRow, opCellCol, ['op-symbol']);
                        mainDivisionGrid.appendChild(opSymbolCell); 
                    }
                    if (opSymbolCell) { 
                        opSymbolCell.classList.add(`multiply-result-bg-${colorIndex}`);
                    }


                    const multiplyActualStartCol = targetAlignColumn - multiplyResultStr.length + 1;
                    for (let i = 0; i < multiplyResultStr.length; i++) {
                        const inputId = `m-${currentStepIndex}-${i}`;
                        let existingInput = document.getElementById(inputId);
                        let parentCell;

                        if (!existingInput) {
                            const digitInput = createStyledInput((currentSettings.helpLevel === 'guided'), inputId, 'multiply');
                            if(currentSettings.helpLevel === 'guided') digitInput.value = multiplyResultStr[i];
                            
                            parentCell = createGridCell(null, currentRowForMultiply, multiplyActualStartCol + i);
                            parentCell.classList.add('cell-with-line-below'); 
                            parentCell.appendChild(digitInput);
                            mainDivisionGrid.appendChild(parentCell);
                            existingInput = digitInput; 
                        } else {
                             parentCell = existingInput.parentElement;
                             if(currentSettings.helpLevel === 'guided') existingInput.value = multiplyResultStr[i];
                        }
                        if(parentCell) {
                            parentCell.classList.add(`multiply-result-bg-${colorIndex}`);
                        } else {
                            console.error("Parent cell not found for multiply input:", inputId);
                        }
                        existingInput.disabled = (currentSettings.helpLevel === 'guided');
                         if (i === 0 && currentSettings.helpLevel !== 'guided' && !existingInput.disabled) {
                            try { existingInput.focus(); } catch (e) {}
                        }
                    }
                } else if (currentSubStep === 'subtract') { 
                    const subtractActualStartCol = targetAlignColumn - subtractResultStr.length + 1;
                    for (let i = 0; i < subtractResultStr.length; i++) {
                        const inputId = `s-${currentStepIndex}-${i}`;
                        let existingInput = document.getElementById(inputId);
                        let parentCell;

                        if (!existingInput) {
                            const digitInput = createStyledInput((currentSettings.helpLevel === 'guided'), inputId, 'subtract');
                            if(currentSettings.helpLevel === 'guided') digitInput.value = subtractResultStr[i];

                            parentCell = createGridCell(null, currentRowForSubtract, subtractActualStartCol + i);
                            parentCell.appendChild(digitInput);
                            mainDivisionGrid.appendChild(parentCell);
                            existingInput = digitInput;
                        } else {
                            parentCell = existingInput.parentElement;
                            if(currentSettings.helpLevel === 'guided') existingInput.value = subtractResultStr[i];
                        }
                        if(parentCell) {
                            parentCell.classList.add(`subtract-result-bg-${colorIndex}`);
                        } else {
                            console.error("Parent cell not found for subtract input:", inputId);
                        }
                        existingInput.disabled = (currentSettings.helpLevel === 'guided');
                         if (i === 0 && currentSettings.helpLevel !== 'guided' && !existingInput.disabled) {
                            try { existingInput.focus(); } catch (e) {}
                        }
                    }

                    const broughtDownCellCol = subtractActualStartCol + subtractResultStr.length; 
                    const broughtDownCellRow = currentRowForSubtract;
                    let cellForBroughtDown = mainDivisionGrid.querySelector(`.grid-cell.brought-down-digit-cell[data-step-context="${currentStepIndex}"]`);


                    if (!cellForBroughtDown) {
                        cellForBroughtDown = createGridCell(null, broughtDownCellRow, broughtDownCellCol, ['brought-down-digit-cell']); 
                        cellForBroughtDown.dataset.stepContext = currentStepIndex; 
                        mainDivisionGrid.appendChild(cellForBroughtDown);
                    } 
                     if (cellForBroughtDown) { 
                        cellForBroughtDown.classList.add(`subtract-result-bg-${colorIndex}`);
                    }
                }
            }
            updateTaskInstructions(); 
        }
        
        function handleCheck() {
            if (currentSettings.helpLevel === 'independent') {
                let allCorrect = true;
                let userQuotientStr = "";
                task.quotientDigits.forEach((digit, i) => {
                    const qInput = document.getElementById(`q-${i}`);
                    if (qInput) {
                        userQuotientStr += qInput.value;
                        if (qInput.value === "" || parseInt(qInput.value) !== digit) {
                            allCorrect = false; updateInputFieldFeedback(qInput, false);
                        } else { updateInputFieldFeedback(qInput, true); }
                    } else { allCorrect = false; }
                });

                task.steps.forEach((step, stepIdx) => {

                    const subtractResultStr = String(step.subtractResult);
                    let userSubtractResultStr = "";
                    for (let i = 0; i < subtractResultStr.length; i++) {
                        const sInput = document.getElementById(`s-${stepIdx}-${i}`);
                         if (sInput) {
                            userSubtractResultStr += sInput.value;
                            if (sInput.value === "" || parseInt(sInput.value) !== parseInt(subtractResultStr[i])) {
                                allCorrect = false; updateInputFieldFeedback(sInput, false);
                            } else { updateInputFieldFeedback(sInput, true); }
                        } else { allCorrect = false; }
                    }
                    if (userSubtractResultStr !== subtractResultStr && subtractResultStr.length > 0) allCorrect = false;
                    
                    if (step.nextDigitToBringDown !== null) {
                        const bdInput = document.getElementById(`bd-${stepIdx}`);
                        if (bdInput) {
                            if (bdInput.value === "" || bdInput.value !== step.nextDigitToBringDown) {
                                allCorrect = false; updateInputFieldFeedback(bdInput, false);
                            } else { updateInputFieldFeedback(bdInput, true); }
                        } else { allCorrect = false;}
                    }
                });

                const finalRemInput = document.getElementById('final-remainder-input');
                let userFinalRemainder = -1; 
                if (finalRemInput && finalRemInput.value.trim() !== "") {
                     userFinalRemainder = parseInt(finalRemInput.value);
                    if (isNaN(userFinalRemainder) || userFinalRemainder !== task.finalRemainder) {
                        allCorrect = false; updateInputFieldFeedback(finalRemInput, false);
                    } else { updateInputFieldFeedback(finalRemInput, true); }
                } else if (finalRemInput && finalRemInput.value.trim() === "" && task.finalRemainder !== 0){ 
                    allCorrect = false; updateInputFieldFeedback(finalRemInput, false);
                } else if (finalRemInput && finalRemInput.value.trim() === "" && task.finalRemainder === 0){
                     updateInputFieldFeedback(finalRemInput, true); 
                } else if (!finalRemInput && task.finalRemainder !== 0) { 
                    allCorrect = false;
                }
                

                if (allCorrect) {
                    feedbackArea.textContent = "Gratulálok, sikeresen elvégezted az osztást!";
                    feedbackArea.className = 'feedback correct mt-4';
                    checkStepButton.textContent = "Új feladat";
                    currentStepIndex = task.steps.length; 
                     mainDivisionGrid.querySelectorAll('input.styled-input').forEach(inp => inp.disabled = true);
                } else {
                    feedbackArea.textContent = "Nem minden számjegy vagy a maradék helyes. Kérlek, ellenőrizd!";
                    feedbackArea.className = 'feedback incorrect mt-4';
                }
                return;
            }

            if (task.steps.length === 0 && task.quotientDigits.length > 0 && task.quotientDigits[0] === 0 && currentStepIndex === 0 && currentSubStep === 'estimate') {
                const quotientInputId = `q-0`;
                const quotientDigitInput = document.getElementById(quotientInputId); 
                const currentStepDataForZeroQ = { quotientDigit: 0 }; 

                if (quotientDigitInput && (quotientDigitInput.value === "0" || (currentSettings.helpLevel === 'guided' && currentStepDataForZeroQ.quotientDigit === 0 ))) {
                    quotientDigitInput.disabled = true;
                    updateInputFieldFeedback(quotientDigitInput, true);
                    feedbackArea.textContent = "Helyes! A hányados 0.";
                    feedbackArea.className = 'feedback correct mt-4';
                    taskInstructions.textContent = `Az osztás véget ért. A végső maradék: ${task.finalRemainder}.`;
                    checkStepButton.textContent = "Új feladat";
                    currentStepIndex = task.steps.length; 
                    document.getElementById('finalRemainderArea').innerHTML = `Maradék: <span id="finalRemainderValueInputContainer">${task.finalRemainder}</span>`;
                     updateOperandHighlights(); 
                    return;
                } else if (quotientDigitInput) {
                    updateInputFieldFeedback(quotientDigitInput, false);
                    feedbackArea.textContent = "Nem pontos. A hányados 0 lesz.";
                    feedbackArea.className = 'feedback incorrect mt-4';
                    if (currentSettings.helpLevel !== 'guided') {
                        try { quotientDigitInput.focus(); } catch(e){}
                    }
                    return;
                }
            }


            if (currentStepIndex >= task.steps.length) { 
                generateNewTask();
                return;
            }

            const currentStepData = task.steps[currentStepIndex];
            if (!currentStepData) { 
                console.error(`Error in handleCheck: currentStepData is undefined for stepIndex ${currentStepIndex}.`);
                generateNewTask(); 
                return;
            }
            let isCorrect = false;
            let userInputStr = "";
            let activeInputs = []; 

            if (currentSubStep === 'estimate') { 
                const quotientInputId = `q-${currentStepIndex}`;
                const quotientDigitInput = document.getElementById(quotientInputId); 
                if (!quotientDigitInput) { 
                    console.error(`Quotient input #${quotientInputId} not found for estimate step in handleCheck.`); 
                    return;
                }
                activeInputs.push(quotientDigitInput);
                userInputStr = quotientDigitInput.value;
                if (userInputStr.trim() === "" || isNaN(parseInt(userInputStr)) || userInputStr.length !== 1) {
                    feedbackArea.textContent = "Kérlek, írj be egy számjegyet a hányadosba!";
                    feedbackArea.className = 'feedback incorrect mt-4';
                    activeInputs.forEach(inp => updateInputFieldFeedback(inp, false));
                    return;
                }
                isCorrect = parseInt(userInputStr) === currentStepData.quotientDigit;
                if (isCorrect) currentSubStep = 'multiply'; 
                
            } else { 
                activeInputs = Array.from(mainDivisionGrid.querySelectorAll(`.styled-input[data-type="${currentSubStep}"][id^="${currentSubStep.charAt(0)}-${currentStepIndex}-"]:not([disabled])`));

                if (activeInputs.length === 0 && currentSettings.helpLevel !== 'guided') { 
                    activeInputs = Array.from(mainDivisionGrid.querySelectorAll(`.styled-input[data-type="${currentSubStep}"][id^="${currentSubStep.charAt(0)}-${currentStepIndex}-"]`));
                     if (activeInputs.length === 0) {
                        if (currentSettings.helpLevel === 'guided') {
                        } else {
                             prepareCurrentStepInputs(); 
                             return; 
                        }
                    }
                }
                activeInputs.forEach(input => userInputStr += input.value); 

                const expectedLength = (currentSubStep === 'multiply' ? String(currentStepData.multiplyResult).length : String(currentStepData.subtractResult).length);
                
                if (userInputStr.trim() === "" || (userInputStr.length !== expectedLength && expectedLength > 0 && activeInputs.length > 0) || (userInputStr !== "" && isNaN(parseInt(userInputStr)))) {
                    feedbackArea.textContent = `Kérlek, írj be minden számjegyet a ${currentSubStep === 'multiply' ? 'szorzathoz' : 'különbséghez'}!`;
                    feedbackArea.className = 'feedback incorrect mt-4';
                    activeInputs.forEach(inp => updateInputFieldFeedback(inp, false));
                    return;
                }

                if (expectedLength === 0 && userInputStr !== "0" && userInputStr !== "") {
                     isCorrect = false;
                } else if (expectedLength === 0 && (userInputStr === "0" || userInputStr === "")) {
                     isCorrect = true; 
                } else if (currentSubStep === 'multiply') { 
                    isCorrect = parseInt(userInputStr) === currentStepData.multiplyResult;
                    if (isCorrect) currentSubStep = 'subtract'; 
                } else { // subtract
                    isCorrect = parseInt(userInputStr) === currentStepData.subtractResult;
                }
            }
            
            activeInputs.forEach(inp => updateInputFieldFeedback(inp, isCorrect));

            if (isCorrect) {
                feedbackArea.textContent = "Helyes! Haladj tovább.";
                feedbackArea.className = 'feedback correct mt-4';
                activeInputs.forEach(inp => { if(inp) inp.disabled = true }); 

                if (currentSubStep === 'multiply') { 
                    // Új: Szorzási művelet megjelenítése a történet oszlopban
                    if (currentSettings.helpLevel === 'step-by-step') {
                        const multiplyOpCell = document.querySelector(`.multiply-op-step-${currentStepIndex}`);
                        if (multiplyOpCell) {
                            multiplyOpCell.textContent = `${currentStepData.quotientDigit} × ${task.divisor} = ${currentStepData.multiplyResult}`;
                        }
                    }
                } else if (currentSubStep === 'subtract' && parseInt(userInputStr) === currentStepData.subtractResult) { 
                    // Új: Kivonási művelet megjelenítése a történet oszlopban
                    if (currentSettings.helpLevel === 'step-by-step') {
                        const subtractOpCell = document.querySelector(`.subtract-op-step-${currentStepIndex}`);
                        if (subtractOpCell) {
                            subtractOpCell.textContent = `${currentStepData.currentDividendPartNumForStep} - ${currentStepData.multiplyResult} = ${currentStepData.subtractResult}`;
                        }
                    }

                    if (currentStepData.nextDigitToBringDown !== null) {
                        const broughtDownCellContainer = mainDivisionGrid.querySelector(`.grid-cell.brought-down-digit-cell[data-step-context="${currentStepIndex}"]`);
                        if (broughtDownCellContainer) {
                             if (currentSettings.helpLevel !== 'independent') { 
                                broughtDownCellContainer.textContent = currentStepData.nextDigitToBringDown;
                            }
                        } else {
                             console.error(`Brought down cell container not found in handleCheck for context ${currentStepIndex}`);
                        }
                    }
                }
                
                if (currentSettings.helpLevel === 'guided') {
                    if (currentSubStep === 'multiply') { 
                        prepareCurrentStepInputs(); 
                        currentSubStep = 'subtract';
                        prepareCurrentStepInputs(); 
                        if (currentStepData.nextDigitToBringDown !== null && task.steps[currentStepIndex] && task.steps[currentStepIndex].subtractResult !== undefined) {
                             const subtractResultStr = String(task.steps[currentStepIndex].subtractResult); 
                             const alignToDividendCell = mainDivisionGrid.querySelector(`.grid-cell.dividend-digit[data-original-dividend-index="${task.steps[currentStepIndex].baseDigitIndexOfOriginalPartEnd}"]`);
                             if (alignToDividendCell) {
                                 const targetAlignColumn = parseInt(alignToDividendCell.dataset.gridColumnActual);
                                 const subtractActualStartCol = targetAlignColumn - subtractResultStr.length + 1;
                                 const broughtDownCell = mainDivisionGrid.querySelector(`.grid-cell.brought-down-digit-cell[data-step-context="${currentStepIndex}"]`);
                                 if (broughtDownCell) {
                                      broughtDownCell.innerHTML = currentStepData.nextDigitToBringDown; 
                                 }
                             }
                        }
                        handleStepCompletion();     
                    } else if (currentSubStep === 'subtract') { 
                         if (currentStepData.nextDigitToBringDown !== null) {
                             const broughtDownCell = mainDivisionGrid.querySelector(`.grid-cell.brought-down-digit-cell[data-step-context="${currentStepIndex}"]`);
                             if (broughtDownCell) {
                                  broughtDownCell.innerHTML = currentStepData.nextDigitToBringDown; 
                             }
                        }
                        handleStepCompletion();
                    }
                } else { // Not guided (step-by-step)
                    if (currentSubStep === 'multiply' || currentSubStep === 'subtract') {
                        prepareCurrentStepInputs(); 
                    }
                     if (currentSubStep === 'subtract' && parseInt(userInputStr) === currentStepData.subtractResult) { 
                        handleStepCompletion();
                    }
                }
            } else { // Incorrect
                feedbackArea.textContent = "Nem pontos. Próbáld újra!";
                feedbackArea.className = 'feedback incorrect mt-4';
                if (currentSubStep === 'estimate') {
                    const quotientInputToRetry = document.getElementById(`q-${currentStepIndex}`); 
                    if (quotientInputToRetry) {
                        quotientInputToRetry.disabled = false;
                        if (currentSettings.helpLevel !== 'guided') {
                           try { quotientInputToRetry.focus(); } catch (e) { console.warn("Focus failed on retry for estimate", e); }
                        }
                    } else {
                        console.error("Failed to find quotient input to re-enable: #q-" + currentStepIndex); 
                    }
                } else if (currentSettings.helpLevel !== 'guided' && activeInputs.length > 0) {
                    activeInputs.forEach(inp => { if(inp) inp.disabled = false; });
                    if (activeInputs[0]) { 
                           try { activeInputs[0].focus(); } catch (e) { console.warn("Focus failed on retry for multiply/subtract", e); }
                    }
                }
            }
        }
        
        function updateInputFieldFeedback(inputElement, isCorrect) {
            if (!inputElement) return;
            inputElement.style.borderColor = isCorrect ? 'green' : 'red';
        }

        function handleStepCompletion() {
            currentStepIndex++;
            currentSubStep = 'estimate'; 
            
            if (currentStepIndex < task.steps.length) { 
                prepareCurrentStepInputs();
            } else { 
                taskInstructions.textContent = "Kész vagy! Ez volt az utolsó lépés.";
                checkStepButton.textContent = "Új feladat";
                if (currentSettings.helpLevel !== 'independent') {
                    document.getElementById('finalRemainderArea').innerHTML = `Maradék: <span id="finalRemainderValueInputContainer">${task.finalRemainder}</span>`;
                } else {
                }
                feedbackArea.textContent = "Gratulálok, sikeresen elvégezted az osztást!";
                feedbackArea.className = 'feedback correct mt-4';
                updateOperandHighlights(); 
            }
            updateTaskInstructions();
        }
        
        function updateTaskInstructions() {
             if (currentSettings.helpLevel === 'independent') {
                taskInstructions.textContent = `Végezd el az osztást: ${task.dividend} ÷ ${task.divisor}. Add meg a hiányzó számjegyeket és a maradékot.`;
                checkStepButton.textContent = "Ellenőrzés";
                return;
            }

            if (task.steps.length === 0 && task.quotientDigits.length > 0 && task.quotientDigits[0] === 0 && currentStepIndex === 0) {
                if (currentSubStep === 'estimate') {
                     taskInstructions.textContent = `Hányszor van meg a(z) ${task.dividend}-ben a(z) ${task.divisor}? (Hányados 1. számjegye)`;
                     checkStepButton.textContent = "Hányadosjegy ellenőrzése";
                     return;
                }
            }


            if (currentStepIndex >= task.steps.length) {
                 const finalRemainderText = `Az osztás véget ért. A végső maradék: ${task.finalRemainder}.`;
                 taskInstructions.textContent = finalRemainderText;
                 checkStepButton.textContent = "Új feladat"; 
                 return;
            }
            const stepData = task.steps[currentStepIndex]; 
            if (!stepData) {
                console.error("updateTaskInstructions: stepData is undefined for step", currentStepIndex);
                taskInstructions.textContent = "Hiba történt a feladat betöltésekor.";
                return;
            }
            
            switch(currentSubStep) {
                case 'estimate':
                    taskInstructions.textContent = `Hányszor van meg a(z) ${stepData.currentDividendPartNumForStep}-ben a(z) ${task.divisor}? (Hányados ${currentStepIndex+1}. számjegye)`;
                    checkStepButton.textContent = "Hányadosjegy ellenőrzése";
                    break;
                case 'multiply':
                    const qInput = document.getElementById(`q-${currentStepIndex}`); 
                    const qDigit = qInput ? (qInput.value || (currentSettings.helpLevel === 'guided' ? stepData.quotientDigit : '?')) : '?';
                    taskInstructions.textContent = `Mennyi ${qDigit} × ${task.divisor}? (Szorzat)`;
                    checkStepButton.textContent = "Szorzás ellenőrzése";
                    break;
                case 'subtract':
                     const multVal = String(stepData.multiplyResult); 
                    taskInstructions.textContent = `Mennyi ${stepData.currentDividendPartNumForStep} - ${multVal}? (Különbség)`;
                    checkStepButton.textContent = "Kivonás ellenőrzése";
                    break;
            }
        }

        // On page load
        document.addEventListener('DOMContentLoaded', () => {
            applyTheme(currentSettings.theme); 
            generateNewTask();
        });