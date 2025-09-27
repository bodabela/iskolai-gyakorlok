const themeSelector = document.getElementById('themeSelector');
        const digitCountSelector = document.getElementById('digitCountSelector');
        const helpLevelSelector = document.getElementById('helpLevelSelector');
        const newTaskButton = document.getElementById('newTaskButton');
        const checkButton = document.getElementById('checkButton');
        const taskInstructions = document.getElementById('taskInstructions');
        const mainAdditionGrid = document.getElementById('mainAdditionGrid'); 
        const feedbackArea = document.getElementById('feedbackArea');
        const bodyEl = document.body;

        let currentSettings = {
            theme: 'theme-candy', 
            digitCount: 3,   
            helpLevel: 'independent' 
        };

        let task = {
            num1: 0,           
            num2: 0,           
            calculatedSumDigits: [], 
            calculatedCarries: []    
        };
        
        let currentStepColumnFromRight = 0; 
        let currentSubStep = 'sum_digit'; 

        themeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.theme = e.target.dataset.theme;
                applyTheme(currentSettings.theme);
            }
        });
        digitCountSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.digitCount = parseInt(e.target.dataset.digits);
                updateActiveButtonVisuals(digitCountSelector, e.target);
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

        newTaskButton.addEventListener('click', generateNewTask);
        checkButton.addEventListener('click', handleCheck);

        function applyTheme(themeClass) {
            bodyEl.className = ''; 
            bodyEl.classList.add(themeClass); 
            themeSelector.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
            updateActiveButtonVisuals(digitCountSelector, digitCountSelector.querySelector(`[data-digits="${currentSettings.digitCount}"]`));
            updateActiveButtonVisuals(helpLevelSelector, helpLevelSelector.querySelector(`[data-help="${currentSettings.helpLevel}"]`));
        }
        
        function updateActiveButtonVisuals(container, activeButton) {
            if (!container || !activeButton) return;
            container.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            activeButton.classList.add('active');
        }

        function generateNewTask() {
            feedbackArea.textContent = '\u00A0'; 
            feedbackArea.className = 'feedback mt-4'; 
            currentStepColumnFromRight = 0; 
            currentSubStep = 'sum_digit';
            checkButton.textContent = "Ellenőrzés";
            
            const minVal = Math.pow(10, currentSettings.digitCount - 1);
            const maxVal = Math.pow(10, currentSettings.digitCount) - 1;

            let attempts = 0;
            const MAX_ATTEMPTS_FOR_CARRY = 100;
            let foundSuitable = false;

            while(attempts < MAX_ATTEMPTS_FOR_CARRY && !foundSuitable) {
                task.num1 = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
                task.num2 = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
                
                let tempN1 = task.num1;
                let tempN2 = task.num2;
                let carryCheck = 0;
                let hasCarryAtLeastOnce = false;
                for (let i = 0; i < currentSettings.digitCount; i++) {
                    const d1 = tempN1 % 10;
                    const d2 = tempN2 % 10;
                    if (d1 + d2 + carryCheck >= 10) {
                        hasCarryAtLeastOnce = true;
                        break;
                    }
                    carryCheck = Math.floor((d1 + d2 + carryCheck) / 10);
                    tempN1 = Math.floor(tempN1 / 10);
                    tempN2 = Math.floor(tempN2 / 10);
                }
                if (hasCarryAtLeastOnce) {
                    foundSuitable = true;
                }
                attempts++;
            }
             if (!foundSuitable) { 
                if (currentSettings.digitCount > 0) {
                    let n1Str = "";
                    let n2Str = "";
                    for(let k=0; k < currentSettings.digitCount; k++) {
                        n1Str += (k === 0 && currentSettings.digitCount > 1 ? '5' : '1'); 
                        n2Str += (k < currentSettings.digitCount -1 ? '5' : (currentSettings.digitCount === 1 ? '5' : '4')); // Utolsó jegy kisebb, hogy biztos legyen átvitel
                        if(currentSettings.digitCount === 1) {n1Str='5'; n2Str='5';}
                    }
                    task.num1 = parseInt(n1Str);
                    task.num2 = parseInt(n2Str);
                     if(task.num1 > maxVal) task.num1 = maxVal - (maxVal % 10) + (currentSettings.digitCount > 1 ? 5 : 1) ; // Ensure it's within bounds and allows carry
                     if(task.num2 > maxVal) task.num2 = maxVal - (maxVal % 10) + 5;
                     if (task.num1 + task.num2 < Math.pow(10, currentSettings.digitCount) && currentSettings.digitCount > 1) { // Ha még mindig nincs átvitel a legmagasabb helyiértéken
                         task.num2 = parseInt(Array(currentSettings.digitCount).fill('9').join('')) - task.num1 +1;
                         if (task.num2 > maxVal) task.num2 = maxVal;
                         if (task.num2 < minVal && minVal > 0) task.num2 = minVal;
                     }
                }
            }

            calculateCorrectSteps();    
            renderTaskDisplay();        
            prepareCurrentStepInputs(); 
            updateTaskInstructions();   
        }

        function calculateCorrectSteps() {
            const sNum1Reversed = String(task.num1).split('').reverse();
            const sNum2Reversed = String(task.num2).split('').reverse();
            const maxLength = Math.max(sNum1Reversed.length, sNum2Reversed.length);
            
            task.calculatedSumDigits = []; 
            task.calculatedCarries = [];  
            let carryVal = 0;

            for (let i = 0; i < maxLength; i++) {
                const d1 = parseInt(sNum1Reversed[i] || '0');
                const d2 = parseInt(sNum2Reversed[i] || '0');
                const currentSum = d1 + d2 + carryVal;
                task.calculatedSumDigits.push(currentSum % 10);
                carryVal = Math.floor(currentSum / 10);
                task.calculatedCarries.push(carryVal);
            }
            if (carryVal > 0) {
                task.calculatedSumDigits.push(carryVal);
                // Az utolsó carry-t (ami az összeg új számjegye) nem kell külön a calculatedCarries-be,
                // mert a calculatedCarries[i] az i. oszlop *utáni* átvitelt jelenti.
                // Ha az összeg hosszabb, a calculatedSumDigits már tartalmazza.
            }
        }

        function renderTaskDisplay() {
            mainAdditionGrid.innerHTML = ''; 
            const sNum1 = String(task.num1);
            const sNum2 = String(task.num2);
            const resultLength = task.calculatedSumDigits.length;
            const gridCols = Math.max(sNum1.length, sNum2.length, resultLength) + 1; 

            mainAdditionGrid.style.gridTemplateColumns = `repeat(${gridCols}, 30px)`;

            // 1. sor: Átvitelek
            for (let i = 0; i < gridCols; i++) {
                const cell = createGridCell(null, 1, i + 1, ['carry-digit-cell']);
                const colFromRightThisCarryIsFor = gridCols -1 - (i+1) ; // Az oszlop indexe (jobbról), AMELYIKBŐL ez az átvitel származik
                
                // Csak a tényleges számjegyek fölé kerüljön átvitel input, és ne az operátor fölé, vagy azon túl
                if (colFromRightThisCarryIsFor >= 0 && colFromRightThisCarryIsFor < task.calculatedCarries.length) {
                    const carryInputId = `carry-input-${colFromRightThisCarryIsFor}`;
                    const input = createStyledInput(true, carryInputId, 'carry');
                    input.dataset.colFromRight = colFromRightThisCarryIsFor; 
                    cell.appendChild(input);
                }
                mainAdditionGrid.appendChild(cell);
            }
            
            // 2. sor: Első összeadandó
            for (let i = 0; i < sNum1.length; i++) {
                const colPosInGrid = gridCols - sNum1.length + i;
                const cell = createGridCell(sNum1[i], 2, colPosInGrid + 1, ['operand-digit']);
                cell.dataset.colFromRight = sNum1.length - 1 - i;
                cell.dataset.rowType = "operand1";
                mainAdditionGrid.appendChild(cell);
            }

            // 3. sor: Plusz jel és Második összeadandó
            const operatorColumn = gridCols - Math.max(sNum1.length, sNum2.length, resultLength) -1;
            if (operatorColumn >= 0 && operatorColumn < gridCols -1 ) { 
                mainAdditionGrid.appendChild(createGridCell('+', 3, operatorColumn + 1, ['op-symbol']));
            } else if (gridCols -1 >=0 && Math.max(sNum1.length, sNum2.length, resultLength) > 0) { // Ha csak egy oszlop van a számoknak
                 const opCell = createGridCell('+', 3, 1, ['op-symbol']); // Tedd az első oszlopba
                 if (gridCols === 1) opCell.style.display = 'none'; // Ha tényleg csak 1 oszlop van az eredménynek, ne látszódjon.
                 mainAdditionGrid.appendChild(opCell);
            }


            for (let i = 0; i < sNum2.length; i++) {
                const colPosInGrid = gridCols - sNum2.length + i;
                 const cell = createGridCell(sNum2[i], 3, colPosInGrid + 1, ['operand-digit']);
                 cell.dataset.colFromRight = sNum2.length - 1 - i;
                 cell.dataset.rowType = "operand2";
                 mainAdditionGrid.appendChild(cell);
            }

            // 4. sor: Vonal
            for (let i = 0; i < gridCols; i++) {
                 if (i >= gridCols - resultLength ) { 
                     mainAdditionGrid.appendChild(createGridCell(null, 4, i + 1, ['cell-with-line-below']));
                 } else if (i === operatorColumn && operatorColumn >=0) { 
                     mainAdditionGrid.appendChild(createGridCell(null, 4, i + 1, ['cell-with-line-below']));
                 }
                 else {
                      mainAdditionGrid.appendChild(createGridCell(null, 4, i + 1, []));
                 }
            }
            
            // 5. sor: Eredmény inputok
            for (let i = 0; i < resultLength; i++) { 
                const colPosInGrid = gridCols - resultLength + i;
                const sumDigitInputId = `sum-digit-${resultLength - 1 - i}`; 
                const input = createStyledInput(true, sumDigitInputId, 'sum');
                input.dataset.colFromRight = resultLength - 1 - i; 
                const cell = createGridCell(null, 5, colPosInGrid + 1, ['sum-digit-cell']);
                cell.appendChild(input);
                mainAdditionGrid.appendChild(cell);
            }
        }
        
        function createGridCell(content, row, col, classList = []) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell', ...classList);
            if (content !== null && typeof content !== 'undefined') cell.textContent = content;
            cell.style.gridRow = String(row); 
            cell.style.gridColumn = String(col); 
            return cell;
        }

        function createStyledInput(disabled, id, type = null) { 
            const input = document.createElement('input');
            input.type = 'text'; 
            input.inputMode = 'numeric'; 
            input.pattern = "[0-9]*"; 
            input.classList.add('styled-input');
            input.id = id; 
            input.maxLength = 1;
            
            input.addEventListener('input', (e) => { 
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                handleInputAndFocusNext(e); 
            });

            if (type === 'sum') input.classList.add('sum-digit-input');
            else if (type === 'carry') input.classList.add('carry-digit-input');
            
            input.disabled = disabled;
            return input;
        }

        function handleInputAndFocusNext(event) {
            const currentInput = event.target;
            if (currentInput.value.length >= currentInput.maxLength && currentSettings.helpLevel === 'independent') {
                 const allInputsInGrid = Array.from(mainAdditionGrid.querySelectorAll('input.styled-input:not([disabled])'));
                const currentInputIndexInArray = allInputsInGrid.indexOf(currentInput);
                
                if (currentInputIndexInArray !== -1 && currentInputIndexInArray < allInputsInGrid.length - 1) {
                    try { allInputsInGrid[currentInputIndexInArray + 1].focus(); } catch (e) {}
                }
            }
            // Lépésenkénti módban a fókuszváltást a prepareCurrentStepInputs és a handleCheck kezeli
        }
        
        function prepareCurrentStepInputs() {
            mainAdditionGrid.querySelectorAll('input.styled-input').forEach(inp => { 
                inp.style.borderColor = ''; 
                if(currentSettings.helpLevel === 'step-by-step') inp.disabled = true; 
            });
            mainAdditionGrid.querySelectorAll('.grid-cell').forEach(cell => cell.classList.remove('highlight-target', 'highlight-carry-text'));
            
            const sNum1 = String(task.num1);
            const sNum2 = String(task.num2);
            const resultTotalDigits = task.calculatedSumDigits.length;
            const gridCols = Math.max(sNum1.length, sNum2.length, resultTotalDigits) + 1;

            if (currentSettings.helpLevel === 'independent') {
                mainAdditionGrid.querySelectorAll('input.styled-input').forEach(inp => inp.disabled = false);
                try {
                    const firstSumInput = document.getElementById(`sum-digit-0`); 
                    if (firstSumInput) firstSumInput.focus(); else {
                        const firstCarryInput = document.getElementById(`carry-input-0`);
                        if(firstCarryInput) firstCarryInput.focus();
                    }
                } catch (e) {}
            } else { // step-by-step
                if (currentStepColumnFromRight >= resultTotalDigits && currentSubStep === 'sum_digit') { 
                    taskInstructions.textContent = "Kész vagy! Az összeadás véget ért.";
                    checkButton.textContent = "Új feladat";
                    return;
                }

                const sNum1Reversed = sNum1.split('').reverse();
                const sNum2Reversed = sNum2.split('').reverse();

                // Operandusok kiemelése az aktuális oszlopban
                const operand1GridCol = gridCols - (currentStepColumnFromRight + 1);
                if (currentStepColumnFromRight < sNum1.length) {
                    const num1Cell = mainAdditionGrid.querySelector(`.grid-cell.operand-digit[data-row-type="operand1"][data-col-from-right="${currentStepColumnFromRight}"]`);
                    if(num1Cell) num1Cell.classList.add('highlight-target');
                }
                if (currentStepColumnFromRight < sNum2.length) {
                     const num2Cell = mainAdditionGrid.querySelector(`.grid-cell.operand-digit[data-row-type="operand2"][data-col-from-right="${currentStepColumnFromRight}"]`);
                    if(num2Cell) num2Cell.classList.add('highlight-target');
                }
                
                // Előző átvitel (az aktuális oszlop FÖLÖTT) megjelenítése és kiemelése
                const carryInValue = currentStepColumnFromRight > 0 ? task.calculatedCarries[currentStepColumnFromRight - 1] : 0;
                const carryDisplayInputForSumStep = document.getElementById(`carry-input-${currentStepColumnFromRight - 1}`); // Az előző oszlopból származó átvitel inputja
                if (carryDisplayInputForSumStep && carryDisplayInputForSumStep.parentElement.classList.contains('carry-digit-cell')) {
                    const displayCell = carryDisplayInputForSumStep.parentElement;
                     if (!carryDisplayInputForSumStep.disabled) carryDisplayInputForSumStep.disabled = true; // Biztosítjuk, hogy le van tiltva
                    displayCell.innerHTML = (carryInValue > 0) ? carryInValue : ''; // Csak akkor írjuk ki, ha nem 0
                    if (carryInValue > 0) displayCell.classList.add('highlight-carry-text');
                }


                if (currentSubStep === 'sum_digit') {
                    const sumInput = document.getElementById(`sum-digit-${currentStepColumnFromRight}`);
                    if (sumInput) {
                        sumInput.disabled = false;
                        sumInput.value = ''; // Töröljük az esetleges korábbi próbálkozást
                        try { sumInput.focus(); } catch (e) {}
                    }
                } else if (currentSubStep === 'carry_digit') {
                    // Az átvitelt az aktuális oszlopból (currentStepColumnFromRight) származó 
                    // carryInput-${currentStepColumnFromRight} inputba kell írni.
                    const carryInputToEnable = document.getElementById(`carry-input-${currentStepColumnFromRight}`);
                     if (currentStepColumnFromRight < task.calculatedCarries.length ) { 
                        if (carryInputToEnable) {
                            carryInputToEnable.disabled = false;
                            carryInputToEnable.value = ''; // Töröljük az esetleges korábbi próbálkozást
                            try { carryInputToEnable.focus(); } catch (e) {}
                            // Kiemelhetjük az előzőleg beírt összeget is
                            const prevSumInput = document.getElementById(`sum-digit-${currentStepColumnFromRight}`);
                            if (prevSumInput && prevSumInput.parentElement) prevSumInput.parentElement.classList.add('highlight-target');
                        }
                    } else { 
                        currentStepColumnFromRight++; 
                        currentSubStep = 'sum_digit';
                        prepareCurrentStepInputs(); // Ez fogja a "Kész vagy" üzenetet kiírni
                    }
                }
            }
            updateTaskInstructions(); 
        }
        
        function handleCheck() {
            const resultTotalDigits = task.calculatedSumDigits.length;

            if (currentSettings.helpLevel === 'independent') {
                let allCorrect = true;
                let allFilled = true;

                for (let i = 0; i < resultTotalDigits; i++) { 
                    const sumInputEl = document.getElementById(`sum-digit-${i}`);
                    if (!sumInputEl) { allCorrect = false; continue; }
                    if (sumInputEl.value.trim() === "") allFilled = false;
                    const userSumDigit = parseInt(sumInputEl.value);
                    if (isNaN(userSumDigit) || userSumDigit !== task.calculatedSumDigits[i]) {
                        updateInputFieldFeedback(sumInputEl, false);
                        allCorrect = false;
                    } else {
                        updateInputFieldFeedback(sumInputEl, true);
                    }
                }
                for (let i = 0; i < task.calculatedCarries.length ; i++) { 
                    const carryInputEl = document.getElementById(`carry-input-${i}`);
                    if (!carryInputEl) continue; 
                    
                    const correctCarry = task.calculatedCarries[i] || 0;
                    // Ha az utolsó carry 0 és az összeg nem lett hosszabb, az input mező nem biztos, hogy létezik
                    // vagy ha létezik is, lehet, hogy üresen kell hagyni.
                    // Csak akkor ellenőrizzük az ürességet, ha a correctCarry nem 0.
                    if (carryInputEl.value.trim() === "" && correctCarry !== 0 && i < resultTotalDigits -1 ) allFilled = false;
                     const userCarry = carryInputEl.value.trim() === "" ? 0 : parseInt(carryInputEl.value);
                     
                    if (i < resultTotalDigits || (i === resultTotalDigits -1 && task.calculatedSumDigits.length > Math.max(String(task.num1).length, String(task.num2).length) )) { // Csak a releváns átviteleket
                        if (isNaN(userCarry) || userCarry !== correctCarry) {
                             updateInputFieldFeedback(carryInputEl, false);
                             allCorrect = false;
                         } else {
                             updateInputFieldFeedback(carryInputEl, true);
                         }
                    } else if (userCarry !== 0) { // Ha felesleges helyre írt átvitelt
                        updateInputFieldFeedback(carryInputEl, false);
                        allCorrect = false;
                    } else {
                         updateInputFieldFeedback(carryInputEl, true); // Ha 0-t írt oda, ahova nem kellett, az jó
                    }
                }

                if (!allFilled) {
                    feedbackArea.textContent = "Kérlek, tölts ki minden szükséges mezőt (összeg és átvitelek)!";
                    feedbackArea.className = 'feedback incorrect mt-4';
                    return;
                }
                
                if (allCorrect) {
                    feedbackArea.textContent = "Gratulálok, sikeresen elvégezted az összeadást!";
                    feedbackArea.className = 'feedback correct mt-4';
                    checkButton.textContent = "Új feladat";
                    mainAdditionGrid.querySelectorAll('input.styled-input').forEach(inp => inp.disabled = true);
                } else {
                    feedbackArea.textContent = "Nem minden számjegy vagy átvitel helyes. Kérlek, ellenőrizd!";
                    feedbackArea.className = 'feedback incorrect mt-4';
                }
            } else { // step-by-step
                if (currentStepColumnFromRight >= resultTotalDigits && currentSubStep === 'sum_digit') { 
                    generateNewTask();
                    return;
                }

                if (currentSubStep === 'sum_digit') {
                    const sumInput = document.getElementById(`sum-digit-${currentStepColumnFromRight}`);
                    if (!sumInput) return;
                    const userInput = parseInt(sumInput.value);
                    const correctValue = task.calculatedSumDigits[currentStepColumnFromRight];

                    if (isNaN(userInput)) {
                        feedbackArea.textContent = 'Kérlek, írj be egy számot az összeghez!';
                        feedbackArea.className = 'feedback incorrect mt-4';
                        updateInputFieldFeedback(sumInput, false);
                        try { sumInput.focus(); } catch(e){}
                        return;
                    }

                    if (userInput === correctValue) {
                        updateInputFieldFeedback(sumInput, true);
                        sumInput.disabled = true;
                        
                        // Ha az utolsó összegjegyet írtuk be, és nincs több átvitel, akkor kész.
                        if (currentStepColumnFromRight === resultTotalDigits - 1 && task.calculatedCarries[currentStepColumnFromRight] === 0) {
                             feedbackArea.textContent = 'Helyes! Az összeadás véget ért.';
                             feedbackArea.className = 'feedback correct mt-4';
                             currentStepColumnFromRight++; // Hogy a következő feltétel igaz legyen a befejezéshez
                             currentSubStep = 'sum_digit'; // Visszaállítjuk a következő feladathoz/befejezéshez
                             prepareCurrentStepInputs();
                        } else {
                            feedbackArea.textContent = 'Helyes az összegjegy! Most add meg az átvitelt (0, ha nincs).';
                            currentSubStep = 'carry_digit';
                            prepareCurrentStepInputs();
                        }
                    } else {
                        feedbackArea.textContent = 'Az összeg ebben az oszlopban nem pontos. Próbáld újra!';
                        feedbackArea.className = 'feedback incorrect mt-4';
                        updateInputFieldFeedback(sumInput, false);
                        try { sumInput.focus(); } catch(e){}
                    }
                } else if (currentSubStep === 'carry_digit') {
                    const carryInputToVerify = document.getElementById(`carry-input-${currentStepColumnFromRight}`);
                    if (!carryInputToVerify) { 
                        // Ha nincs ilyen carry input (pl. az utolsó oszlop utáni carry már az összeg része lett),
                        // akkor lépjünk tovább. Ez a helyzet akkor állhat elő, ha az összeg hosszabb, mint az operandusok.
                        currentStepColumnFromRight++;
                        currentSubStep = 'sum_digit';
                        prepareCurrentStepInputs();
                        return;
                    }

                    const userCarry = carryInputToVerify.value.trim() === "" ? 0 : parseInt(carryInputToVerify.value); // Üres string 0-nak számít
                    const correctCarry = task.calculatedCarries[currentStepColumnFromRight];
                    
                    if (userCarry === correctCarry) {
                        updateInputFieldFeedback(carryInputToVerify, true);
                        carryInputToVerify.disabled = true;
                        const displayCell = carryInputToVerify.parentElement;
                        if (displayCell) { // Kiírjuk a helyes átvitelt fixen
                            displayCell.innerHTML = (correctCarry > 0) ? correctCarry : ''; 
                            if(correctCarry > 0) displayCell.classList.add('highlight-carry-text');
                        }

                        feedbackArea.textContent = 'Az átvitel helyes! Folytasd a következő oszloppal.';
                        feedbackArea.className = 'feedback correct mt-4';
                        currentStepColumnFromRight++;
                        currentSubStep = 'sum_digit';
                        prepareCurrentStepInputs();
                    } else {
                        feedbackArea.textContent = 'Az átvitel nem helyes. Próbáld újra!';
                        feedbackArea.className = 'feedback incorrect mt-4';
                        updateInputFieldFeedback(carryInputToVerify, false);
                        try { carryInputToVerify.focus(); } catch(e){}
                    }
                }
            }
        }
        
        function updateInputFieldFeedback(inputElement, isCorrect) {
            if (!inputElement) return;
            inputElement.style.borderColor = isCorrect ? 'green' : 'red';
        }

        function updateTaskInstructions() {
            const sNum1Rev = String(task.num1).split('').reverse();
            const sNum2Rev = String(task.num2).split('').reverse();
            const resultTotalDigits = task.calculatedSumDigits.length;

            if (currentSettings.helpLevel === 'independent') {
                taskInstructions.textContent = `Végezd el az összeadást: ${task.num1} + ${task.num2}. Írd be az átviteleket is!`;
                checkButton.textContent = "Ellenőrzés";
            } else { // step-by-step
                if (currentStepColumnFromRight >= resultTotalDigits && currentSubStep === 'sum_digit') {
                     taskInstructions.textContent = "Kész vagy! Az összeadás véget ért.";
                     checkButton.textContent = "Új feladat";
                     return;
                }
                
                let placeValueText = "";
                if (currentStepColumnFromRight === 0) placeValueText = "egyeseket";
                else if (currentStepColumnFromRight === 1) placeValueText = "tízeseket";
                else if (currentStepColumnFromRight === 2) placeValueText = "százasokat";
                else if (currentStepColumnFromRight === 3) placeValueText = "ezreseket";
                else placeValueText = `${currentStepColumnFromRight+1}. helyiértéken lévő számjegyeket (jobbról)`;

                const d1 = parseInt(sNum1Rev[currentStepColumnFromRight] || '0');
                const d2 = parseInt(sNum2Rev[currentStepColumnFromRight] || '0');
                const carryIn = currentStepColumnFromRight > 0 ? task.calculatedCarries[currentStepColumnFromRight - 1] : 0;

                if (currentSubStep === 'sum_digit') {
                    taskInstructions.textContent = `Add össze a ${placeValueText}: ${d1} + ${d2}` + (carryIn > 0 ? ` + ${carryIn} (átvitel)` : '') + `. Írd be az eredmény számjegyét!`;
                } else { // carry_digit
                     let nextPlaceValueText = "";
                     if (currentStepColumnFromRight + 1 === 1) nextPlaceValueText = "tízesekhez";
                     else if (currentStepColumnFromRight + 1 === 2) nextPlaceValueText = "százasokhoz";
                     else if (currentStepColumnFromRight + 1 === 3) nextPlaceValueText = "ezresekhez";
                     else if (currentStepColumnFromRight + 1 < resultTotalDigits ) nextPlaceValueText = `${currentStepColumnFromRight + 2}. helyiértékhez (jobbról)`;
                     else nextPlaceValueText = "következő (magasabb) helyiértékre";
                     
                     // Csak akkor kérünk átvitelt, ha van értelme (azaz nem az utolsó oszlop után vagyunk, hacsak nem lesz hosszabb az eredmény)
                     if (currentStepColumnFromRight < task.calculatedCarries.length && document.getElementById(`carry-input-${currentStepColumnFromRight}`)) {
                         taskInstructions.textContent = `Mennyi az átvitel a ${nextPlaceValueText}? (Írj 0-t, ha nincs.)`;
                     } else { // Ha nincs hova átvitelt írni (pl. utolsó oszlopból nincs átvitel vagy az összeg nem hosszabb)
                        taskInstructions.textContent = "Folytasd a következő oszloppal."; // Ezt a handleCheck már kezeli és továbbléptet
                        // Itt lehetne egy auto-továbblépés, ha a helyes átvitel 0, de most a felhasználóra bízzuk
                     }
                }
                checkButton.textContent = "Ellenőrzés";
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            applyTheme(currentSettings.theme); 
            generateNewTask();
        });