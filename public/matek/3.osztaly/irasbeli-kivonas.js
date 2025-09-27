// Globális DOM Elemek Referenciái
        const themeSelector = document.getElementById('themeSelector');
        const digitCountSelector = document.getElementById('digitCountSelector');
        const helpLevelSelector = document.getElementById('helpLevelSelector');
        const newTaskButton = document.getElementById('newTaskButton');
        const checkButton = document.getElementById('checkButton');
        const taskInstructions = document.getElementById('taskInstructions');
        const mainSubtractionGrid = document.getElementById('mainSubtractionGrid');
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
            calculatedDifferenceDigits: [],
            calculatedBorrows: []
        };

        let currentStepColumnFromRight = 0;
        let currentSubStep = 'difference_digit';

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
            currentSubStep = 'difference_digit';
            checkButton.textContent = (currentSettings.helpLevel === 'independent') ? "Ellenőrzés" : "Lépés ellenőrzése";

            const minNum1 = Math.pow(10, currentSettings.digitCount - 1);
            const maxNum1 = Math.pow(10, currentSettings.digitCount) - 1;

            let attempts = 0;
            const MAX_ATTEMPTS = 100;
            let foundSuitable = false;

            while(attempts < MAX_ATTEMPTS && !foundSuitable) {
                task.num1 = Math.floor(Math.random() * (maxNum1 - minNum1 + 1)) + minNum1;
                let maxNum2 = task.num1 -1;
                 if (maxNum2 < 0) maxNum2 = 0;
                let minNum2Allowed = (currentSettings.digitCount > 1) ? Math.pow(10, currentSettings.digitCount - 2) : 0;
                if (task.num1 < Math.pow(10, currentSettings.digitCount -1) * 1.2 && currentSettings.digitCount > 1) {
                     minNum2Allowed = 1;
                }
                if (maxNum2 < minNum2Allowed && maxNum2 >=0) minNum2Allowed = 0;


                task.num2 = Math.floor(Math.random() * (maxNum2 - minNum2Allowed + 1)) + minNum2Allowed;
                 if (task.num1 === task.num2 && task.num1 > 0) {
                    task.num2 = Math.max(0, task.num2 - (Math.floor(Math.random()* (task.num1 > 10 ? 5:1) )+1) );
                }
                 if (task.num2 < 0) task.num2 = 0;

                let s1_check = String(task.num1).padStart(currentSettings.digitCount, '0');
                let s2_check = String(task.num2).padStart(currentSettings.digitCount, '0');
                let carryCheckLogic = 0;
                let hasBorrowInLogic = false;
                 for(let i = 0; i < currentSettings.digitCount; i++){
                    let d1_check = parseInt(s1_check[currentSettings.digitCount - 1 - i]);
                    let d2_check = parseInt(s2_check[currentSettings.digitCount - 1 - i]);
                    let eff_d2_check = d2_check + carryCheckLogic;
                    if(d1_check < eff_d2_check){
                        hasBorrowInLogic = true;
                        carryCheckLogic = 1;
                    } else {
                        carryCheckLogic = 0;
                    }
                }
                if (hasBorrowInLogic || currentSettings.digitCount === 1) {
                    foundSuitable = true;
                }
                attempts++;
            }
             if (!foundSuitable) {
                 let n1Base = "5";
                 let n2Base = "1";
                 if (currentSettings.digitCount === 2) { n1Base = "50"; n2Base = "15";}
                 else if (currentSettings.digitCount === 3) { n1Base = "500"; n2Base = "155";}
                 else if (currentSettings.digitCount === 4) { n1Base = "5000"; n2Base = "1555";}
                 else {n1Base = "8"; n2Base="3";}

                 task.num1 = parseInt(n1Base);
                 task.num2 = parseInt(n2Base);
                 if(task.num1 <= task.num2 && task.num1 > 0) task.num2 = task.num1-1;
             }

            calculateCorrectSteps();
            renderTaskDisplay();
            prepareCurrentStepInputs();
            updateTaskInstructions();
        }

        function calculateCorrectSteps() {
            task.calculatedDifferenceDigits = [];
            task.calculatedBorrows = [];

            let carryForNextSubtrahend = 0;
            const maxLength = currentSettings.digitCount;

            const sNum1Padded = String(task.num1).padStart(maxLength, '0');
            const sNum2Padded = String(task.num2).padStart(maxLength, '0');

            let tempDiffDigitsReversed = [];
            let tempBorrowsForSubtrahendReversed = [];


            for (let i = 0; i < maxLength; i++) {
                const currentDigitIndexFromLeft = maxLength - 1 - i;

                let digit1 = parseInt(sNum1Padded[currentDigitIndexFromLeft]);
                let digit2Original = parseInt(sNum2Padded[currentDigitIndexFromLeft]);

                tempBorrowsForSubtrahendReversed.push(carryForNextSubtrahend);

                let effectiveDigit2 = digit2Original + carryForNextSubtrahend;

                if (digit1 < effectiveDigit2) {
                    tempDiffDigitsReversed.push((digit1 + 10) - effectiveDigit2);
                    carryForNextSubtrahend = 1;
                } else {
                    tempDiffDigitsReversed.push(digit1 - effectiveDigit2);
                    carryForNextSubtrahend = 0;
                }
            }
            task.calculatedDifferenceDigits = tempDiffDigitsReversed.reverse();
            task.calculatedBorrows = tempBorrowsForSubtrahendReversed.reverse();
			task.calculatedBorrows.pop();
        }


        function renderTaskDisplay() {
            mainSubtractionGrid.innerHTML = '';
            const sNum1 = String(task.num1).padStart(currentSettings.digitCount, '0');
            const sNum2 = String(task.num2).padStart(currentSettings.digitCount, '0');
            const maxLength = currentSettings.digitCount;
            const gridCols = maxLength + 1;

            mainSubtractionGrid.style.gridTemplateColumns = `repeat(${gridCols}, 30px)`;
            mainSubtractionGrid.style.gridTemplateRows = `repeat(5, auto)`;

            // 1. sor: Kisebbítendő
            for (let i = 0; i < maxLength; i++) {
                const cell = createGridCell(sNum1[i], 1, i + 2, ['operand-digit']);
                cell.dataset.colFromLeft = i;
                cell.dataset.rowType = "minuend";
                mainSubtractionGrid.appendChild(cell);
            }

            // 2. sor: Operátor + Kivonandó
            mainSubtractionGrid.appendChild(createGridCell('-', 2, 1, ['op-symbol']));
            for (let i = 0; i < maxLength; i++) {
                const cell = createGridCell(sNum2[i], 2, i + 2, ['operand-digit']);
                cell.dataset.colFromLeft = i;
                cell.dataset.rowType = "subtrahend";
                mainSubtractionGrid.appendChild(cell);
            }

            // 3. sor: Pótlás inputok
            mainSubtractionGrid.appendChild(createGridCell(null, 3, 1)); // Operátor alatt
            for (let i = 0; i < maxLength; i++) { // Oszlopok balról jobbra
                const currentGridColumnForOperand = i + 2;
                const cell = createGridCell(null, 3, currentGridColumnForOperand, ['borrow-input-cell']);
                if (i < maxLength - 1) {
                    // A balról 'i' indexű 'borrow-input' a (i+1) indexű (balról) oszlop kivonandója alá kerül.
                    // A helyes értéke a task.calculatedBorrows[i+1] lesz (mivel a borrows tömb is balról indexelt).
                    const borrowInputId = `borrow-input-${i}`; // borrowSlotIndex = i
                    const input = createStyledInput(true, borrowInputId, 'borrow');
                    input.dataset.borrowSlotIndex = i;
                    cell.appendChild(input);
                } else {
                    cell.classList.add('empty-borrow');
                }
                mainSubtractionGrid.appendChild(cell);
            }


            // 4. sor: Vonal
            mainSubtractionGrid.appendChild(createGridCell(null, 4, 1));
            for (let i = 0; i < maxLength; i++) {
                mainSubtractionGrid.appendChild(createGridCell(null, 4, i + 2, ['cell-with-line-below']));
            }

            // 5. sor: Különbség inputok
            mainSubtractionGrid.appendChild(createGridCell(null, 5, 1));
            for (let i = 0; i < maxLength; i++) {
                const diffInputId = `diff-digit-${i}`;
                const input = createStyledInput(true, diffInputId, 'difference');
                input.dataset.colFromLeft = i;
                const cell = createGridCell(null, 5, i + 2, ['difference-digit-cell']);
                cell.appendChild(input);
                mainSubtractionGrid.appendChild(cell);
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
            if (type === 'borrow') input.classList.add('borrow-digit-input');
            if (type === 'difference') input.classList.add('diff-digit-input');
            input.id = id;
            input.maxLength = 1;

            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                handleInputAndFocusNext(e);
            });
            input.disabled = disabled;
            return input;
        }

        // ÚJ SEGÉDFÜGGVÉNY A FÓKUSZ SORRENDHEZ
        function getFocusOrderIndependent() {
            const order = [];
            const maxLength = currentSettings.digitCount;

            for (let i = maxLength - 1; i >= 0; i--) {
                order.push(`diff-digit-${i}`);
                order.push(`borrow-input-${i-1}`);
            }

            return order;
        }

        function handleInputAndFocusNext(event) {
            const currentInput = event.target;
            // Csak akkor lépj tovább, ha az input tele van (1 karakteres mezők esetén ez mindig igaz, ha van benne valami)
            if (currentInput.value.length >= currentInput.maxLength) {
                if (currentSettings.helpLevel === 'independent') {
                    const focusOrder = getFocusOrderIndependent();
                    const currentId = currentInput.id;
                    const currentIndexInOrder = focusOrder.indexOf(currentId);

                    if (currentIndexInOrder !== -1 && currentIndexInOrder < focusOrder.length - 1) {
                        const nextInputId = focusOrder[currentIndexInOrder + 1];
                        const nextInputToFocus = document.getElementById(nextInputId);
                        if (nextInputToFocus && (typeof nextInputToFocus.disabled === 'undefined' || nextInputToFocus.disabled === false)) {
                            try {
                                nextInputToFocus.focus();
                                if (nextInputToFocus.value.length > 0) { // Ha már van benne érték, jelölje ki
                                    nextInputToFocus.select();
                                }
                            } catch (e) {
                                console.warn("Fókuszálás sikertelen:", nextInputId, e);
                            }
                        }
                    }
                } else { // Step-by-step or other modes
                    // Ide kerülhetne az eredeti, egyszerűbb DOM-sorrend alapú léptetés, ha volt,
                    // vagy a step-by-step mód saját fókuszkezelése, amit most nem érintünk.
                    // Például:
                    // const allInputs = Array.from(mainSubtractionGrid.querySelectorAll('input.styled-input:not([disabled])'));
                    // const currentInputIndexInArray = allInputs.indexOf(currentInput);
                    // if (currentInputIndexInArray !== -1 && currentInputIndexInArray < allInputs.length - 1) {
                    //     try { allInputs[currentInputIndexInArray + 1].focus(); } catch (e) {}
                    // }
                }
            }
        }

        function prepareCurrentStepInputs() {
            mainSubtractionGrid.querySelectorAll('input.styled-input').forEach(inp => {
                inp.style.borderColor = '';
                if(currentSettings.helpLevel === 'step-by-step') inp.disabled = true;
            });
            mainSubtractionGrid.querySelectorAll('.grid-cell')
                .forEach(cell => cell.classList.remove('highlight-target', 'highlight-group'));

            const maxLength = currentSettings.digitCount;
            const targetColFromLeft = maxLength - 1 - currentStepColumnFromRight;

            if (currentSettings.helpLevel === 'independent') {
                mainSubtractionGrid.querySelectorAll('input.styled-input').forEach(inp => {
                    inp.disabled = false
                });
                try {
                    // Kezdeti fókusz a jobbról első különbség mezőre
                    const firstDiffInput = document.getElementById(`diff-digit-${maxLength-1}`);
                    if (firstDiffInput) firstDiffInput.focus();
                } catch (e) {}
            } else { // step-by-step
                if (currentStepColumnFromRight >= maxLength && currentSubStep === 'difference_digit') {
                    taskInstructions.textContent = "Kész vagy! A kivonás véget ért.";
                    checkButton.textContent = "Új feladat";
                    return;
                }
                if (currentSubStep === 'borrow_digit' && targetColFromLeft < 0 ) {
                     taskInstructions.textContent = "Kész vagy! A kivonás véget ért.";
                     checkButton.textContent = "Új feladat";
                     return;
                }


                const minuendCell = mainSubtractionGrid.querySelector(`.operand-digit[data-row-type="minuend"][data-col-from-left="${targetColFromLeft}"]`);
                const subtrahendCell = mainSubtractionGrid.querySelector(`.operand-digit[data-row-type="subtrahend"][data-col-from-left="${targetColFromLeft}"]`);

                if (targetColFromLeft > 0 && currentSubStep === 'difference_digit') {
                    const borrowInputForCurrentSubtrahend = document.getElementById(`borrow-input-${targetColFromLeft - 1}`);
                    if (borrowInputForCurrentSubtrahend && borrowInputForCurrentSubtrahend.disabled) {
                        const borrowVal = parseInt(borrowInputForCurrentSubtrahend.value);
                        if (!isNaN(borrowVal) && borrowVal > 0) {
                            if(subtrahendCell) subtrahendCell.classList.add('highlight-group');
                            if(borrowInputForCurrentSubtrahend.parentElement) borrowInputForCurrentSubtrahend.parentElement.classList.add('highlight-group');
                        }
                    }
                }


                if (currentSubStep === 'difference_digit') {
                    if (minuendCell) minuendCell.classList.add('highlight-target');
                    if (subtrahendCell && !subtrahendCell.classList.contains('highlight-group')) subtrahendCell.classList.add('highlight-target');

                    const diffInput = document.getElementById(`diff-digit-${targetColFromLeft}`);
                    if (diffInput) {
                        diffInput.disabled = false;
                        diffInput.value = '';
                        try { diffInput.focus(); } catch (e) {}
                    }
                } else {
                    const borrowSlotIndexToEnable = targetColFromLeft - 1;
                    if (borrowSlotIndexToEnable >= 0) {
                        const borrowInput = document.getElementById(`borrow-input-${borrowSlotIndexToEnable}`);
                        if (borrowInput) {
                            borrowInput.disabled = false;
                            borrowInput.value = '';
                            try { borrowInput.focus(); } catch (e) {}
                            const prevDiffInput = document.getElementById(`diff-digit-${targetColFromLeft}`);
                            if(prevDiffInput && prevDiffInput.parentElement) prevDiffInput.parentElement.classList.add('highlight-target');
                        }
                    } else {
                         currentStepColumnFromRight++;
                         currentSubStep = 'difference_digit';
                         prepareCurrentStepInputs();
                    }
                }
            }
            updateTaskInstructions();
        }

        function handleCheck() {
            const maxLength = currentSettings.digitCount;

            if (currentSettings.helpLevel === 'independent') {
                let allCorrect = true;
                let allFilledProperly = true;

                for (let i = 0; i < maxLength; i++) {
                    const diffInputEl = document.getElementById(`diff-digit-${i}`);
                    if (!diffInputEl) { allCorrect = false; continue; }
                    if (diffInputEl.value.trim() === "") allFilledProperly = false;
                    const userDiffDigit = parseInt(diffInputEl.value);
                    const correctDiffDigit = task.calculatedDifferenceDigits[i];
                    if (isNaN(userDiffDigit) || userDiffDigit !== correctDiffDigit) {
                        updateInputFieldFeedback(diffInputEl, false); allCorrect = false;
                    } else { updateInputFieldFeedback(diffInputEl, true); }

                    if (i > 0) {
                        const borrowInputEl = document.getElementById(`borrow-input-${i-1}`);
                        if (!borrowInputEl) continue;

                        const correctBorrow = task.calculatedBorrows[i-1] || 0;
                        if (borrowInputEl.value.trim() === "" && correctBorrow !== 0) allFilledProperly = false;
                        const userBorrow = borrowInputEl.value.trim() === "" ? 0 : parseInt(borrowInputEl.value);

                        if (isNaN(userBorrow) || userBorrow !== correctBorrow) {
                             updateInputFieldFeedback(borrowInputEl, false); allCorrect = false;
                        } else { updateInputFieldFeedback(borrowInputEl, true); }
                    }
                }

                if (!allFilledProperly && allCorrect) {
                    feedbackArea.textContent = "Kérlek, tölts ki minden szükséges mezőt (különbség és pótlások)!";
                    feedbackArea.className = 'feedback incorrect mt-4';
                    return;
                }

                if (allCorrect) {
                    feedbackArea.textContent = "Gratulálok, sikeresen elvégezted a kivonást!";
                    feedbackArea.className = 'feedback correct mt-4';
                    checkButton.textContent = "Új feladat";
                    mainSubtractionGrid.querySelectorAll('input.styled-input').forEach(inp => inp.disabled = true);
                } else {
                    feedbackArea.textContent = "Nem minden számjegy vagy pótlás helyes. Kérlek, ellenőrizd!";
                    feedbackArea.className = 'feedback incorrect mt-4';
                }
            } else { // step-by-step
                const targetColFromLeft = maxLength - 1 - currentStepColumnFromRight;

                if (currentSubStep === 'difference_digit') {
                    if (targetColFromLeft < 0) { generateNewTask(); return;}
                    const diffInput = document.getElementById(`diff-digit-${targetColFromLeft}`);
                    if (!diffInput) return;
                    const userInput = parseInt(diffInput.value);
                    const correctValue = task.calculatedDifferenceDigits[targetColFromLeft];

                    if (isNaN(userInput)) {
                        feedbackArea.textContent = 'Kérlek, írj be egy számot a különbséghez!';
                        updateInputFieldFeedback(diffInput, false); try { diffInput.focus(); } catch(e){}
                        feedbackArea.className = 'feedback incorrect mt-4';
                        return;
                    }
                    if (userInput === correctValue) {
                        updateInputFieldFeedback(diffInput, true);
                        diffInput.disabled = true;

                        let borrowGeneratedForNextCol = 0;
                        if (targetColFromLeft > 0) {
                             let digit1 = parseInt(String(task.num1).padStart(maxLength, '0')[targetColFromLeft]);
                             let digit2Orig = parseInt(String(task.num2).padStart(maxLength, '0')[targetColFromLeft]);
                             let borrowInCurrent = task.calculatedBorrows[targetColFromLeft] || 0;
                             if (digit1 < (digit2Orig + borrowInCurrent)) {
                                 borrowGeneratedForNextCol = 1;
                             }
                        }


                        if (targetColFromLeft > 0 && borrowGeneratedForNextCol > 0) {
                            feedbackArea.textContent = 'Helyes a különbség! Most add meg a pótlékot a következő oszlop kivonandója alá (1).';
                            currentSubStep = 'borrow_digit';
                        } else if (targetColFromLeft > 0 && borrowGeneratedForNextCol === 0) {
                             feedbackArea.textContent = 'Helyes a különbség! Most add meg a pótlékot (0).';
                             currentSubStep = 'borrow_digit';
                        }
                        else {
                            feedbackArea.textContent = 'Helyes! Az utolsó számjegy is megvan.';
                            currentStepColumnFromRight++;
                            currentSubStep = 'difference_digit';
                        }
                        prepareCurrentStepInputs();
                    } else {
                        feedbackArea.textContent = 'A különbség ebben az oszlopban nem pontos. Próbáld újra!';
                        updateInputFieldFeedback(diffInput, false); try { diffInput.focus(); } catch(e){}
                    }
                } else { // borrow_digit
                    const borrowHtmlInputIndex = targetColFromLeft - 1;
                    if (borrowHtmlInputIndex < 0) {
                        currentStepColumnFromRight++;
                        currentSubStep = 'difference_digit';
                        prepareCurrentStepInputs();
                        return;
                    }

                    const borrowInputEl = document.getElementById(`borrow-input-${borrowHtmlInputIndex}`);
                    if (!borrowInputEl) return;

                    const userBorrow = borrowInputEl.value.trim() === "" ? 0 : parseInt(borrowInputEl.value);
                    const correctBorrow = task.calculatedBorrows[targetColFromLeft -1 ] || 0;

                    if (isNaN(userBorrow)){
                         feedbackArea.textContent = 'Kérlek, írj be egy számot (0 vagy 1) a pótlékhoz!';
                         updateInputFieldFeedback(borrowInputEl, false); try { borrowInputEl.focus(); } catch(e){}
                         return;
                    }

                    if (userBorrow === correctBorrow) {
                        updateInputFieldFeedback(borrowInputEl, true);
                        borrowInputEl.disabled = true;
                        if(correctBorrow > 0) borrowInputEl.parentElement.classList.add('highlight-group');


                        feedbackArea.textContent = 'A pótlék helyes! Folytasd a következő oszloppal.';
                        currentStepColumnFromRight++;
                        currentSubStep = 'difference_digit';
                        prepareCurrentStepInputs();
                    } else {
                        feedbackArea.textContent = 'A pótlék nem helyes. Próbáld újra (0 vagy 1)!';
                        updateInputFieldFeedback(borrowInputEl, false);
                        try { borrowInputEl.focus(); } catch(e){}
                    }
                }
            }
            feedbackArea.className = feedbackArea.textContent.includes("Helyes") || feedbackArea.textContent.includes("Kész vagy") ? 'feedback correct mt-4' : 'feedback incorrect mt-4';
        }

        function updateInputFieldFeedback(inputElement, isCorrect) {
            if (!inputElement) return;
            inputElement.style.borderColor = isCorrect ? 'green' : 'red';
        }

       function updateTaskInstructions() {
            const maxLength = currentSettings.digitCount;
            const targetColFromLeft = maxLength - 1 - currentStepColumnFromRight;

            if (currentSettings.helpLevel === 'independent') {
                taskInstructions.textContent = `Végezd el a kivonást: ${task.num1} - ${task.num2}. Írd be a pótlásokat is (ahol szükséges, 0 vagy 1)!`;
                checkButton.textContent = "Ellenőrzés";
            } else {
                if (currentStepColumnFromRight >= maxLength && currentSubStep === 'difference_digit') {
                    taskInstructions.textContent = "Kész vagy! A kivonás véget ért.";
                    checkButton.textContent = "Új feladat";
                    return;
                }
                 if (targetColFromLeft < 0 && currentSubStep === 'borrow_digit') {
                     taskInstructions.textContent = "Kész vagy! A kivonás véget ért.";
                     checkButton.textContent = "Új feladat";
                     return;
                 }

                let placeValueText = "";
                if (currentStepColumnFromRight === 0) placeValueText = "az egyeseknél";
                else if (currentStepColumnFromRight === 1) placeValueText = "a tízeseknél";
                else if (currentStepColumnFromRight === 2) placeValueText = "a százasoknál";
                else if (currentStepColumnFromRight === 3) placeValueText = "az ezreseknél";
                else placeValueText = `a ${maxLength - targetColFromLeft}. helyiértéken (jobbról)`;

                const sNum1Padded = String(task.num1).padStart(maxLength, '0');
                const sNum2Padded = String(task.num2).padStart(maxLength, '0');
                const d1 = parseInt(sNum1Padded[targetColFromLeft]);
                const d2Orig = parseInt(sNum2Padded[targetColFromLeft]);
                const borrowValueForTheCurrentColumn = task.calculatedBorrows[targetColFromLeft] || 0;

                if (currentSubStep === 'difference_digit') {
                    const effectiveD2 = d2Orig + borrowValueForTheCurrentColumn;
                    let instruction = `Számold ki a különbséget ${placeValueText}: ${d1} - (${d2Orig}` + (borrowValueForTheCurrentColumn > 0 ? ` + ${borrowValueForTheCurrentColumn} pótlék` : '') + `) = ?`;
                    if (d1 < effectiveD2) {
                         instruction += ` (Vegyél kölcsön: ${d1+10} - ${effectiveD2})`;
                    }
                    taskInstructions.textContent = instruction;
                } else { // borrow_digit
                    let nextPlaceValueText = "";
                    if (targetColFromLeft === 1) nextPlaceValueText = "százasok";
                    else if (targetColFromLeft === 2) nextPlaceValueText = "ezresek";
                    else if (targetColFromLeft > 0) nextPlaceValueText = `következő (balra) oszlop`;

                    if (targetColFromLeft > 0) {
                         taskInstructions.textContent = `Mennyi pótlékot kell írni a ${nextPlaceValueText} kivonandója alá? (0, ha nem kellett kölcsönvenni ${placeValueText}.)`;
                    } else {
                         taskInstructions.textContent = "Minden pótlékot megadtál.";
                    }
                }
                checkButton.textContent = "Lépés ellenőrzése";
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            applyTheme(currentSettings.theme);
            generateNewTask();
        });