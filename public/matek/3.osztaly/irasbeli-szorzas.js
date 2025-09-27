const themeSelector = document.getElementById('themeSelector');
        const multiplierDigitCountSelector = document.getElementById('multiplierDigitCountSelector');
        const multiplicandDigitCountSelector = document.getElementById('multiplicandDigitCountSelector');
        const helpLevelSelector = document.getElementById('helpLevelSelector');
        const newTaskButton = document.getElementById('newTaskButton');
        const checkButton = document.getElementById('checkButton');
        const taskInstructions = document.getElementById('taskInstructions');
        const mainMultiplicationGrid = document.getElementById('mainMultiplicationGrid');
        const feedbackArea = document.getElementById('feedbackArea');
        const bodyEl = document.body;

        let currentSettings = {
            theme: 'theme-candy',
            multiplicandDigits: 3,
            multiplierDigits: 2,
            helpLevel: 'independent'
        };

        let task = {
            multiplicand: 0,
            multiplier: 0,
            partialProducts: [], // A szorzó balról első számjegyével képzett szorzat a [0] indexen
            // multiplicationCarries: [], // Jelenleg nem használt a megjelenítésben
            // summationCarries: [],   // Jelenleg nem használt a megjelenítésben
            finalProductDigits: [],
        };

        let currentStep = {
            phase: 'multiply',
            currentMultiplierDigitIndexFromLeft: 0,
            currentMultiplicandDigitIndexFromRight: 0,
            sumColumnNo: 0
        };

        themeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.theme = e.target.dataset.theme;
                applyTheme(currentSettings.theme);
            }
        });
        multiplierDigitCountSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.multiplierDigits = parseInt(e.target.dataset.digits);
                updateActiveButtonVisuals(multiplierDigitCountSelector, e.target);
                generateNewTask();
            }
        });
        multiplicandDigitCountSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.multiplicandDigits = parseInt(e.target.dataset.digits);
                updateActiveButtonVisuals(multiplicandDigitCountSelector, e.target);
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
            updateActiveButtonVisuals(multiplierDigitCountSelector, multiplierDigitCountSelector.querySelector(`[data-digits="${currentSettings.multiplierDigits}"]`));
            updateActiveButtonVisuals(multiplicandDigitCountSelector, multiplicandDigitCountSelector.querySelector(`[data-digits="${currentSettings.multiplicandDigits}"]`));
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

            const minMultiplicand = Math.pow(10, currentSettings.multiplicandDigits - 1);
            const maxMultiplicand = Math.pow(10, currentSettings.multiplicandDigits) - 1;
            const minMultiplier = Math.pow(10, currentSettings.multiplierDigits - 1);
            const maxMultiplier = Math.pow(10, currentSettings.multiplierDigits) - 1;

            task.multiplicand = Math.floor(Math.random() * (maxMultiplicand - minMultiplicand + 1)) + minMultiplicand;
            task.multiplier = Math.floor(Math.random() * (maxMultiplier - minMultiplier + 1)) + minMultiplier;

            if (currentSettings.multiplierDigits === 1 && task.multiplier < 2) {
                task.multiplier = Math.floor(Math.random() * 8) + 2;
            }
             if (String(task.multiplier).length > currentSettings.multiplierDigits && String(task.multiplier).startsWith('0')) {
                 task.multiplier = parseInt(String(task.multiplier).substring(String(task.multiplier).length - currentSettings.multiplierDigits));
                 if (task.multiplier === 0 && currentSettings.multiplierDigits > 0) {
                     task.multiplier = Math.floor(Math.random() * (maxMultiplier - minMultiplier +1)) + minMultiplier;
                 }
            }
             if (String(task.multiplier).endsWith('0') && currentSettings.multiplierDigits > 1 && String(task.multiplier) !== '10' ) {
                 task.multiplier = Math.floor(Math.random() * (maxMultiplier - minMultiplier) / 10) * 10 + Math.floor(Math.random()*9)+1;
                 if (task.multiplier > maxMultiplier) task.multiplier = maxMultiplier;
                 if (task.multiplier < minMultiplier) task.multiplier = minMultiplier + (Math.floor(Math.random()*8)+1);
                 if (String(task.multiplier).length > currentSettings.multiplierDigits && String(task.multiplier).startsWith('0')) {
                    task.multiplier = parseInt(String(task.multiplier).substring(String(task.multiplier).length - currentSettings.multiplierDigits));
                 }
            }
            calculateCorrectSteps();
            renderTaskDisplay();
            prepareCurrentStepInputs();
            updateTaskInstructions();
        }

        function calculateCorrectSteps() {
            task.partialProducts = [];
            const sMultiplicand = String(task.multiplicand);
            const sMultiplier = String(task.multiplier);

            for (let i = 0; i < sMultiplier.length; i++) { // Szorzó számjegyei BALRÓL JOBBRA
                const multiplierDigit = parseInt(sMultiplier[i]);
                let currentPartialProductDigitsReversed = [];
                let carry = 0;
                for (let j = 0; j < sMultiplicand.length; j++) { // Szorzandó JOBBRÓL BALRA
                    const multiplicandDigit = parseInt(sMultiplicand[sMultiplicand.length - 1 - j]);
                    const productResult = multiplicandDigit * multiplierDigit + carry;
                    currentPartialProductDigitsReversed.push(String(productResult % 10));
                    carry = Math.floor(productResult / 10);
                }
                if (carry > 0) {
                    currentPartialProductDigitsReversed.push(String(carry));
                }
                const finalPartialProductString = currentPartialProductDigitsReversed.reverse().join('');
                task.partialProducts.push(finalPartialProductString.length > 0 ? finalPartialProductString : "0");
            }
            task.finalProductDigits = String(task.multiplicand * task.multiplier).split('');
        }


        function renderTaskDisplay() {
            mainMultiplicationGrid.innerHTML = '';
            const sMultiplicand = String(task.multiplicand);
            const sMultiplier = String(task.multiplier);
            const numPartialProducts = task.partialProducts.length;
            const finalProductLength = task.finalProductDigits.length;

            const taskString = `${sMultiplicand} × ${sMultiplier}`;
            let maxLen = taskString.length;

            // Meghatározzuk a grid maximális szélességét
            // Az i-edik részszorzat (0-indexelt) hossza + az 'i' darab jobbra tolás (ami valójában i db karakterrel növeli a szükséges szélességet a jobb szélen)
            task.partialProducts.forEach((pp, index) => {
                maxLen = Math.max(maxLen, pp.length + index);
            });
            maxLen = Math.max(maxLen, finalProductLength);
            if (numPartialProducts > 1) { // Ha van összeadás, a '+' jelnek is kell hely
                maxLen = Math.max(maxLen, finalProductLength + 1);
            }
            const gridCols = maxLen+1;
            mainMultiplicationGrid.style.gridTemplateColumns = `repeat(${gridCols}, 30px)`;

            let currentRow = 1;

            // 1. SOR: FELADVÁNY (pl. 123 × 45) - Jobbra igazítva
            const taskRenderStartCol = gridCols - taskString.length + 1;
            for (let k = 1; k < taskRenderStartCol; k++) {
                mainMultiplicationGrid.appendChild(createGridCell('', currentRow, k));
            }
            let currentTaskCol = taskRenderStartCol;
            sMultiplicand.split('').forEach((digit, index) => {
                const cell = createGridCell(digit, currentRow, currentTaskCol++, ['operand-digit', `multiplicand-digit-${index}`]);
                cell.dataset.originalIndex = index;
                mainMultiplicationGrid.appendChild(cell);
            });
            mainMultiplicationGrid.appendChild(createGridCell('×', currentRow, currentTaskCol++, ['op-symbol']));
            sMultiplier.split('').forEach((digit, index) => {
                const cell = createGridCell(digit, currentRow, currentTaskCol++, ['operand-digit', `multiplier-digit-${index}`]);
                cell.dataset.originalIndex = index;
                mainMultiplicationGrid.appendChild(cell);
            });
            currentRow++;

            // RÉSZSZORZATOK
            for (let i = 0; i < numPartialProducts; i++) {
                const partialProductStrArray = task.partialProducts[i].split('');
                const ppLen = partialProductStrArray.length;
                // Az 'i'-edik részszorzat (0-indexelt, fentről) 'i' karakterrel jobbra tolódik.
                // Azaz az utolsó számjegye a szorzandó utolsó számjegyének oszlopa + i.
                const multiplicandLastDigitCol = gridCols - sMultiplier.length -1 -1; // szorzandó utolsó oszlopa
                
                // Az i-edik részszorzat utolsó VALÓDI számjegyének oszlopa
                const lastActualDigitColPP = multiplicandLastDigitCol + i - 1;
                // Az első VALÓDI számjegyének oszlopa
                const firstDigitColPP = lastActualDigitColPP - ppLen + 1;


                for (let k = 1; k < firstDigitColPP; k++) { // Üres cellák balra
                    mainMultiplicationGrid.appendChild(createGridCell('', currentRow, k));
                }
                for (let j = 0; j < ppLen; j++) { // Részszorzat inputjai
                    const input = createStyledInput(true, `pp-${i}-${j}`, 'partial-product');
                    const cell = createGridCell(null, currentRow, firstDigitColPP + j, ['partial-product-digit']);
                    cell.appendChild(input);
                    mainMultiplicationGrid.appendChild(cell);
                }
                // Üres cellák jobbra, ha a rács szélesebb
                for (let k = firstDigitColPP + ppLen; k <= gridCols; k++) {
                     mainMultiplicationGrid.appendChild(createGridCell('', currentRow, k));
                }
                currentRow++;
            }

            if (numPartialProducts > 1) {
                const lineUnderPartialProductsStartCol = gridCols - finalProductLength + (finalProductLength < task.partialProducts[numPartialProducts-1].length + numPartialProducts -1 ? 0 : 1) ;
                 const plusSignCol = 1;


                for (let k = 1; k < plusSignCol; k++) {
                     mainMultiplicationGrid.appendChild(createGridCell('', currentRow, k));
                }
                if (finalProductLength < gridCols && plusSignCol > 0){ // Csak akkor írjuk ki a + jelet, ha van helye
                     mainMultiplicationGrid.appendChild(createGridCell('+', currentRow-1, plusSignCol, ['op-symbol']));
                } else if (finalProductLength === gridCols && plusSignCol === 0) { // Ha a + jel a 0. oszlopba kerülne
                     // Ne tegyünk semmit, vagy tegyük az 1. oszlopba, ha az üres
                }

            }

            const finalProductRenderStartCol = sMultiplicand.length - finalProductLength + 3;
            for(let k=1; k < finalProductRenderStartCol; k++){
                 mainMultiplicationGrid.appendChild(createGridCell('',currentRow, k));
            }
            for (let j = 0; j < finalProductLength; j++) {
                const input = createStyledInput(true, `fp-${j}`, 'final-product');
                const cell = createGridCell(null, currentRow, finalProductRenderStartCol + j, ['final-product-digit']);
                cell.appendChild(input);
                mainMultiplicationGrid.appendChild(cell);
            }
        }
        function createGridCell(content, row, col, classList = []) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell', ...classList);
            if (content !== null && content !== undefined) cell.textContent = content;
            cell.style.gridRow = String(row);
            cell.style.gridColumn = String(col);
            return cell;
        }

        function createStyledInput(disabled, id, type = null) {
            const input = document.createElement('input');
            input.type = 'text';
            input.classList.add('styled-input');
            input.id = id;
            input.maxLength = 1;
            input.inputMode = 'numeric';
            input.pattern = "[0-9]*";

            input.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (type !== 'carry') {
                     handleInputAndFocusNext(e);
                }
            });

            if (type === 'partial-product') {
                const parts = id.split('-');
                input.dataset.rowIndex = parts[1];
                input.dataset.digitIndex = parts[2];
            } else if (type === 'final-product') {
                input.dataset.digitIndex = id.split('-')[1];
            }
            input.disabled = disabled;
            return input;
        }

        function handleInputAndFocusNext(event) {
            const currentInput = event.target;
            if (currentInput.value.length >= currentInput.maxLength) {
                const allInputs = Array.from(mainMultiplicationGrid.querySelectorAll('input.styled-input:not([disabled])'));
                const currentInputIndexInArray = allInputs.indexOf(currentInput);
                if (currentInputIndexInArray !== -1 && currentInputIndexInArray < allInputs.length - 1) {
                    try { allInputs[currentInputIndexInArray + 1].focus(); } catch (e) {}
                }
            }
        }

       function prepareCurrentStepInputs() {
            mainMultiplicationGrid.querySelectorAll('input.styled-input').forEach(inp => {
                inp.style.borderColor = '';
                // Alapból minden input tiltott, az activateNextStepInput engedélyezi a megfelelőt step-by-step módban
                inp.disabled = (currentSettings.helpLevel === 'step-by-step');
            });
            mainMultiplicationGrid.querySelectorAll('.grid-cell.highlight-target').forEach(cell => cell.classList.remove('highlight-target'));

            if (currentSettings.helpLevel === 'independent') {
                mainMultiplicationGrid.querySelectorAll('input.styled-input').forEach(inp => inp.disabled = false);
                try {
					const focuInputId = `input[id="pp-0-${task.partialProducts[0].length-1}"]`;
					console.log('focuInputId', focuInputId);
                    const firstFocusableInput = mainMultiplicationGrid.querySelector(focuInputId);
                    if (firstFocusableInput) {
                        firstFocusableInput.focus();
                    } else { // Ha nincs részszorzat (pl. 1 jegyű szorzó)
                        const firstFinalInput = mainMultiplicationGrid.querySelector('input[id^="fp-"]');
                        if (firstFinalInput) firstFinalInput.focus();
                    }
                } catch (e) { console.warn("Focusing first input failed:", e); }
            } else { // step-by-step
                currentStep.phase = 'multiply';
                currentStep.currentMultiplierDigitIndexFromLeft = 0;
                currentStep.currentMultiplicandDigitIndexFromRight = 0;
                currentStep.sumColumnNo = 0;
                activateNextStepInput();
            }
            updateTaskInstructions();
        }


		function activateNextStepInput() {
            if (currentSettings.helpLevel !== 'step-by-step') return;
            mainMultiplicationGrid.querySelectorAll('.grid-cell.highlight-target').forEach(cell => cell.classList.remove('highlight-target'));

            const sMultiplicand = String(task.multiplicand);
            const sMultiplier = String(task.multiplier);

            if (currentStep.phase === 'multiply') {
                if (currentStep.currentMultiplierDigitIndexFromLeft < sMultiplier.length) { // Van még feldolgozandó szorzó számjegy
                    const ppString = task.partialProducts[currentStep.currentMultiplierDigitIndexFromLeft];
                    // currentMultiplicandDigitIndexFromRight mostantól a részszorzat jobbról számított n-edik számjegyét jelöli (0-tól)
                    if (currentStep.currentMultiplicandDigitIndexFromRight < ppString.length) {
                        // Van még beírandó számjegy az AKTUÁLIS részszorzatból

                        // Kiemelés (opcionális, de hasznos a felhasználónak)
                        const currentMultiplierDigit = sMultiplier[currentStep.currentMultiplierDigitIndexFromLeft];
                        // A szorzandó melyik számjegye releváns ehhez a részszorzat-számjegyhez (bonyolultabb az átvitelek miatt, egyszerűsítve)
                        // const multiplicandDigitIndexForHighlight = sMultiplicand.length - 1 - (currentStep.currentMultiplicandDigitIndexFromRight % sMultiplicand.length) ; // Ez nem mindig pontos átvitellel
                        // Egyszerűbb kiemelni az aktuális szorzót és az egész szorzandót, ha még az elején vagyunk
                        const multiplierCellToHighlight = mainMultiplicationGrid.querySelector(`.multiplier-digit-${currentStep.currentMultiplierDigitIndexFromLeft}`);
                        if (multiplierCellToHighlight) multiplierCellToHighlight.classList.add('highlight-target');
                        // Lehetne még finomítani a szorzandó kiemelését az aktuális szorzási lépéshez

                        const targetDigitIndexInPP_Left = ppString.length - 1 - currentStep.currentMultiplicandDigitIndexFromRight;
                        const targetInput = document.getElementById(`pp-${currentStep.currentMultiplierDigitIndexFromLeft}-${targetDigitIndexInPP_Left}`);
                        if (targetInput) {
                            targetInput.disabled = false;
                            try { targetInput.focus(); } catch (e) { console.warn("Focus failed on pp input", e); }
                        } else {
                            console.error(`Error: Input field pp-${currentStep.currentMultiplierDigitIndexFromLeft}-${targetDigitIndexInPP_Left} not found, but expected for partial product.`);
                            // Hiba esetén próbáljunk továbblépni, hogy ne akadjon be a feladat
                            currentStep.currentMultiplicandDigitIndexFromRight = 0;
                            currentStep.currentMultiplierDigitIndexFromLeft++;
                            activateNextStepInput(); // Rekurzív hívás a következő állapothoz
                            return;
                        }
                    } else {
                        // Az aktuális részszorzattal végeztünk, lépünk a következő szorzó számjegyre
                        currentStep.currentMultiplicandDigitIndexFromRight = 0; // Visszaállítjuk a részszorzat-számjegy indexet
                        currentStep.currentMultiplierDigitIndexFromLeft++;
                        activateNextStepInput(); // Rekurzív hívás
                        return;
                    }
                } else {
                    // Nincs több szorzó számjegy, átlépünk a sum fázisra
                    currentStep.phase = 'sum';
                    currentStep.sumColumnNo = 0; // Jobbról az első oszloppal kezdünk
                    activateNextStepInput(); // Rekurzív hívás
                    return;
                }
            } else if (currentStep.phase === 'sum') {
                if (currentStep.sumColumnNo < task.finalProductDigits.length) {
                    const targetFpInputIndexLeft = task.finalProductDigits.length - 1 - currentStep.sumColumnNo;
                    const targetInput = document.getElementById(`fp-${targetFpInputIndexLeft}`);
                    if (targetInput) {
                        targetInput.disabled = false;
                        try { targetInput.focus(); } catch (e) { console.warn("Focus failed on fp input", e); }
                    } else {
                        console.error(`Error: Input field fp-${targetFpInputIndexLeft} not found for final product.`);
                        // Hiba esetén próbáljunk továbblépni
                        currentStep.sumColumnNo++;
                        activateNextStepInput();
                        return;
                    }
                } else {
                    taskInstructions.textContent = "Kész vagy a szorzással és az összeadással!";
                    checkButton.textContent = "Új Feladat";
                    currentStep.phase = 'done';
                }
            }
            updateTaskInstructions();
        }

        function handleCheck() {
            let allCorrectGlobally = true; // A teljes feladat helyességét jelzi, nem csak az aktuális lépését
            let allInputsFilled = true;
            const isStepByStep = currentSettings.helpLevel === 'step-by-step';

            if (isStepByStep && currentStep.phase !== 'done') {
                let currentInputEl;
                let correctValueStr;
                let isCurrentStepCorrect = false; // Csak az aktuális lépés helyességét jelzi

                if (currentStep.phase === 'multiply') {
                    const currentPPString = task.partialProducts[currentStep.currentMultiplierDigitIndexFromLeft];
                    if (currentPPString && currentStep.currentMultiplicandDigitIndexFromRight < currentPPString.length) {
                        const digitIdxInPP_Left = currentPPString.length - 1 - currentStep.currentMultiplicandDigitIndexFromRight;
                        currentInputEl = document.getElementById(`pp-${currentStep.currentMultiplierDigitIndexFromLeft}-${digitIdxInPP_Left}`);
                        if (currentInputEl) {
                           correctValueStr = currentPPString[digitIdxInPP_Left];
                        } else {
                            // Ha az input nem található, de a logika szerint léteznie kellene, az hiba.
                            console.error(`Error in handleCheck: Input pp-${currentStep.currentMultiplierDigitIndexFromLeft}-${digitIdxInPP_Left} not found for multiply phase.`);
                            isCurrentStepCorrect = false; // Jelöljük hibásnak, hogy ne akadjon be
                        }
                    } else {
                        // Ha nincs mit ellenőrizni ebben a részszorzatban (mert túlmentünk a hosszán),
                        // akkor ezt a "nem létező" lépést vegyük helyesnek, hogy tovább tudjunk lépni.
                        isCurrentStepCorrect = true;
                    }
                } else if (currentStep.phase === 'sum') {
                    if (currentStep.sumColumnNo < task.finalProductDigits.length) {
                        const digitIdxInFP_Left = task.finalProductDigits.length - 1 - currentStep.sumColumnNo;
                        currentInputEl = document.getElementById(`fp-${digitIdxInFP_Left}`);
                        if (currentInputEl) {
                            correctValueStr = task.finalProductDigits[digitIdxInFP_Left];
                        } else {
                             console.error(`Error in handleCheck: Input fp-${digitIdxInFP_Left} not found for sum phase.`);
                             isCurrentStepCorrect = false;
                        }
                    } else {
                        isCurrentStepCorrect = true; // Vége az összeadásnak
                    }
                }

                if (currentInputEl) {
                    const userInputStr = currentInputEl.value;
                    if (userInputStr === "") {
                        feedbackArea.textContent = 'Kérlek, írj be egy számot!';
                        updateInputFieldFeedback(currentInputEl, false);
                        try { currentInputEl.focus(); } catch(e){}
                        isCurrentStepCorrect = false;
                    } else if (userInputStr === correctValueStr) {
                        isCurrentStepCorrect = true;
                        updateInputFieldFeedback(currentInputEl, true);
                    } else {
                        isCurrentStepCorrect = false;
                        updateInputFieldFeedback(currentInputEl, false);
                    }
                } else if (!isCurrentStepCorrect && currentStep.phase !== 'done') {
                    // Ha nem volt currentInputEl (pl. error), de nem is jelöltük helyesnek, akkor hiba van
                    // Ez az ág azért kell, hogy ne akadjon be, ha currentInputEl null, de isCurrentStepCorrect nem lett true
                    feedbackArea.textContent = 'Hiba történt a lépés ellenőrzésekor. Próbálj új feladatot kérni.';
                }


                if (isCurrentStepCorrect) {
                    feedbackArea.textContent = 'Helyes! Haladj tovább.';
                    feedbackArea.className = 'feedback correct mt-4';
                    if(currentInputEl) currentInputEl.disabled = true;

                    if (currentStep.phase === 'multiply') {
                        currentStep.currentMultiplicandDigitIndexFromRight++;
                    } else if (currentStep.phase === 'sum') {
                        currentStep.sumColumnNo++;
                    }
                    activateNextStepInput(); // Következő lépés engedélyezése
                } else if (currentInputEl) { // Csak akkor, ha volt mit ellenőrizni és az hibás volt
                    feedbackArea.textContent = 'Nem pontos. Próbáld újra!';
                    feedbackArea.className = 'feedback incorrect mt-4';
                    try { currentInputEl.focus(); } catch(e){}
                }
                return;
            }

            // Independent mód vagy a step-by-step végén a teljes ellenőrzés
            for (let i = 0; i < task.partialProducts.length; i++) {
                const partialProductStr = task.partialProducts[i];
                for (let j = 0; j < partialProductStr.length; j++) {
                    const inputEl = document.getElementById(`pp-${i}-${j}`);
                    if (!inputEl) { allCorrectGlobally = false; continue; }
                    if (inputEl.value === "") allInputsFilled = false;
                    if (inputEl.value !== partialProductStr[j]) {
                        updateInputFieldFeedback(inputEl, false); allCorrectGlobally = false;
                    } else { updateInputFieldFeedback(inputEl, true); }
                }
            }

            if (task.partialProducts.length > 1) { // Csak akkor ellenőrizzük az összeget, ha volt mit összeadni
                for (let j = 0; j < task.finalProductDigits.length; j++) {
                    const inputEl = document.getElementById(`fp-${j}`);
                    if (!inputEl) { allCorrectGlobally = false; continue; }
                    if (inputEl.value === "") allInputsFilled = false;
                    if (inputEl.value !== task.finalProductDigits[j]) {
                         updateInputFieldFeedback(inputEl, false); allCorrectGlobally = false;
                    } else { updateInputFieldFeedback(inputEl, true); }
                }
            } else { // Ha csak egy részszorzat van, az a végeredmény
                 for (let j = 0; j < task.finalProductDigits.length; j++) { // Az fp- mezők itt a részszorzatot jelentik
                    const inputEl = document.getElementById(`fp-${j}`); // Vagy pp-0-j, attól függ, hogy van-e fp- mező egyáltalán
                    if (!inputEl) { // Ha fp-k helyett pp-0-kat kell ellenőrizni
                        const pp0InputEl = document.getElementById(`pp-0-${j}`);
                        if(!pp0InputEl) {allCorrectGlobally = false; continue;}
                        if (pp0InputEl.value === "") allInputsFilled = false;
                        if (pp0InputEl.value !== task.finalProductDigits[j]) { // finalProductDigits[j] itt a ppString[j]-nek felel meg
                            updateInputFieldFeedback(pp0InputEl, false); allCorrectGlobally = false;
                        } else { updateInputFieldFeedback(pp0InputEl, true); }
                        continue;
                    }
                    if (inputEl.value === "") allInputsFilled = false;
                    if (inputEl.value !== task.finalProductDigits[j]) {
                         updateInputFieldFeedback(inputEl, false); allCorrectGlobally = false;
                    } else { updateInputFieldFeedback(inputEl, true); }
                }
            }


            if (!allInputsFilled && currentSettings.helpLevel === 'independent') {
                 feedbackArea.textContent = "Kérlek, tölts ki minden mezőt!";
                 feedbackArea.className = 'feedback incorrect mt-4';
                 return;
            }

            if (allCorrectGlobally) {
                feedbackArea.textContent = "Gratulálok, sikeresen elvégezted a szorzást!";
                feedbackArea.className = 'feedback correct mt-4';
                checkButton.textContent = "Új feladat";
                mainMultiplicationGrid.querySelectorAll('input.styled-input').forEach(inp => inp.disabled = true);
                currentStep.phase = 'done'; // Biztosítjuk, hogy 'done' állapotba kerüljön
            } else {
                feedbackArea.textContent = "Nem minden számjegy helyes. Kérlek, ellenőrizd!";
                feedbackArea.className = 'feedback incorrect mt-4';
            }
        }

        function updateInputFieldFeedback(inputElement, isCorrect) {
            if (!inputElement) return;
            inputElement.style.borderColor = isCorrect ? 'green' : 'red';
        }

        function updateTaskInstructions() {
            taskInstructions.textContent = `Végezd el a szorzást: ${task.multiplicand} × ${task.multiplier}.`;
            if (currentSettings.helpLevel === 'independent' || currentStep.phase === 'done') {
                checkButton.textContent = (currentStep.phase === 'done' && feedbackArea.classList.contains('correct')) ? "Új feladat" : "Ellenőrzés";
            } else {
                checkButton.textContent = "Lépés ellenőrzése";
                const sMultiplicand = String(task.multiplicand);
                const sMultiplier = String(task.multiplier);
                if (currentStep.phase === 'multiply' && currentStep.currentMultiplierDigitIndexFromLeft < sMultiplier.length && currentStep.currentMultiplicandDigitIndexFromRight < sMultiplicand.length) {
                    const multiplicandDigit = sMultiplicand[sMultiplicand.length - 1 - currentStep.currentMultiplicandDigitIndexFromRight];
                    const multiplierDigit = sMultiplier[currentStep.currentMultiplierDigitIndexFromLeft];
                    taskInstructions.textContent = `Szorozd: ${multiplicandDigit} (szorzandó ${currentStep.currentMultiplicandDigitIndexFromRight+1}. jegye jobbról) × ${multiplierDigit} (szorzó ${currentStep.currentMultiplierDigitIndexFromLeft+1}. jegye balról). Írd be az eredmény (utolsó) számjegyét.`;
                } else if (currentStep.phase === 'sum' && currentStep.sumColumnNo < task.finalProductDigits.length) {
                    // Pontosított instrukció a végeredmény számjegyének beírásához
                    taskInstructions.textContent = `Írd be a végeredmény ${task.finalProductDigits.length - currentStep.sumColumnNo}. számjegyét (jobbról számolva).`;
                } else if (currentStep.phase === 'multiply' && currentStep.currentMultiplierDigitIndexFromLeft >= sMultiplier.length) {
                    taskInstructions.textContent = (task.partialProducts.length > 1) ? "Minden szorzás kész. Most írd be a végeredmény számjegyeit!" : "A szorzás kész! Írd be a végeredmény számjegyeit.";
                } else if (currentStep.phase === 'sum' && currentStep.sumColumnNo >= task.finalProductDigits.length) {
                    taskInstructions.textContent = "Az összeadás kész!";
                }
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            applyTheme(currentSettings.theme);
            generateNewTask();
        });