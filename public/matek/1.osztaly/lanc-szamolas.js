initializeFirebaseAndLogger();

const bodyEl = document.body;
        const themeSelector = document.getElementById('themeSelector');
        const rangeSelector = document.getElementById('rangeSelector');
        const lengthSelectorButtonsContainer = document.getElementById('lengthSelectorButtons'); // Konténer ID
        const newTaskButton = document.getElementById('newTaskButton');
        const checkButton = document.getElementById('checkButton');
        const chainCalculationDisplay = document.getElementById('chainCalculationDisplay');
        const feedbackArea = document.getElementById('feedbackArea');

        let currentSettings = {
            theme: 'theme-candy',
            numberRange: 10,
            chainLength: 3
        };

        let currentTask = {
            startNumber: 0,
            operations: [],
            userInputs: []
        };

        const operatorConfig = {
            '+': { signColorThemeVar: '--theme-operator-plus-sign-color', cssClassKey: 'op-plus' },
            '-': { signColorThemeVar: '--theme-operator-minus-sign-color', cssClassKey: 'op-minus' }
        };
        const numberDisplayColorCount = 6; // Ha szükség lenne rá JS oldali színezéshez

        function applyTheme(themeClass) {
            bodyEl.className = ''; // Először minden téma osztályt eltávolítunk
            bodyEl.classList.add(themeClass); // Majd hozzáadjuk az aktuálisat

            // Aktív gombok frissítése
            themeSelector.querySelectorAll('.theme-button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
            rangeSelector.querySelectorAll('.range-button').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.range) === currentSettings.numberRange);
            });
            lengthSelectorButtonsContainer.querySelectorAll('.length-button').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.length) === currentSettings.chainLength);
            });
        }

        themeSelector.addEventListener('click', (e) => { if (e.target.classList.contains('theme-button')) { currentSettings.theme = e.target.dataset.theme; applyTheme(currentSettings.theme); } });
        rangeSelector.addEventListener('click', (e) => { if (e.target.classList.contains('range-button')) { currentSettings.numberRange = parseInt(e.target.dataset.range); applyTheme(currentSettings.theme); generateNewChainTask(); } });
        
        lengthSelectorButtonsContainer.addEventListener('click', (e) => {
             if (e.target.classList.contains('length-button')) {
                currentSettings.chainLength = parseInt(e.target.dataset.length);
                applyTheme(currentSettings.theme);
                generateNewChainTask();
            }
        });

        newTaskButton.addEventListener('click', generateNewChainTask);
        checkButton.addEventListener('click', checkChainTask);

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generateNewChainTask() {
            feedbackArea.textContent = '\u00A0';
            feedbackArea.className = 'feedback';
            currentTask.operations = [];
            currentTask.userInputs = [];
            currentTask.startNumber = getRandomInt(0, Math.floor(currentSettings.numberRange * 0.75));
            if (currentTask.startNumber > currentSettings.numberRange) currentTask.startNumber = currentSettings.numberRange;
            let currentResult = currentTask.startNumber;

            for (let i = 0; i < currentSettings.chainLength; i++) {
                let operator, number, nextResult, attempts = 0;
                do {
                    operator = Math.random() < 0.5 ? '+' : '-';
                    if (operator === '+') {
                        let maxAdd = currentSettings.numberRange - currentResult;
                        if (maxAdd < 1 && currentResult < currentSettings.numberRange) maxAdd = 1; else if (maxAdd < 1) maxAdd = 0;
                        number = getRandomInt((maxAdd > 0 ? 1 : 0), maxAdd);
                        nextResult = currentResult + number;
                    } else {
                        let maxSubtract = currentResult;
                        if (maxSubtract < 1 && currentResult > 0) maxSubtract = 1; else if (maxSubtract < 1) maxSubtract = 0;
                        number = getRandomInt((maxSubtract > 0 ? 1 : 0), maxSubtract);
                        nextResult = currentResult - number;
                    }
                    attempts++;
                } while ((nextResult < 0 || nextResult > currentSettings.numberRange) && attempts < 50);
                if (attempts >= 50) {
                    if(operator === '+') number = Math.max(0, currentSettings.numberRange - currentResult); else number = currentResult;
                    nextResult = (operator === '+') ? (currentResult + number) : (currentResult - number);
                    nextResult = Math.max(0, Math.min(nextResult, currentSettings.numberRange));
                }
                currentTask.operations.push({ operator, number, intermediateResult: nextResult });
                currentResult = nextResult;
            }
            renderChain();
            if (currentTask.userInputs.length > 0) currentTask.userInputs[0].focus();
            logNewTask('Láncszámolás', { 
                settings: currentSettings, 
                task: {
                    startNumber: currentTask.startNumber,
                    operations: currentTask.operations
                }
            });
        }

        function renderChain() {
            chainCalculationDisplay.innerHTML = '';
            currentTask.userInputs = [];

            // Dinamikus osztályok eltávolítása és hozzáadása
            chainCalculationDisplay.classList.remove('long-chain-4-5', 'long-chain-6', 'long-chain-7', 'long-chain-8');
            if (currentSettings.chainLength === 4 || currentSettings.chainLength === 5) {
                chainCalculationDisplay.classList.add('long-chain-4-5');
            } else if (currentSettings.chainLength === 6) {
                chainCalculationDisplay.classList.add('long-chain-6');
            } else if (currentSettings.chainLength === 7) {
                chainCalculationDisplay.classList.add('long-chain-7');
            } else if (currentSettings.chainLength >= 8) { // >= 8 a biztonság kedvéért
                chainCalculationDisplay.classList.add('long-chain-8');
            }

            const startNumElContainer = document.createElement('div');
            startNumElContainer.classList.add('chain-item');
            const startNumEl = document.createElement('div');
            startNumEl.classList.add('number-display');
            startNumEl.textContent = currentTask.startNumber;
            // A startNumEl színezését teljesen a CSS-re bízzuk a témán keresztül
            startNumElContainer.appendChild(startNumEl);
            chainCalculationDisplay.appendChild(startNumElContainer);

            currentTask.operations.forEach((op, index) => {
                const operationGroup = document.createElement('div');
                operationGroup.classList.add('chain-operation-group');

                const opDisplayContainer = document.createElement('div');
                opDisplayContainer.classList.add('op-display-container');

                const opSign = document.createElement('span');
                opSign.classList.add('op-sign');
                opSign.textContent = op.operator;
                // Az opSign színét a CSS témákból vesszük a .op-sign osztályon keresztül
                // opSign.style.color = getComputedStyle(document.documentElement).getPropertyValue(operatorConfig[op.operator].signColorThemeVar).trim() || (op.operator === '+' ? '#388E3C' : '#D32F2F');
                opDisplayContainer.appendChild(opSign);

                const opNumberEl = document.createElement('div');
                opNumberEl.classList.add('chain-item');
                const opNumberDisplay = document.createElement('div');
                opNumberDisplay.classList.add('operation-number-display');
                opNumberDisplay.classList.add(operatorConfig[op.operator].cssClassKey);
                opNumberDisplay.textContent = op.number;
                opNumberEl.appendChild(opNumberDisplay);
                opDisplayContainer.appendChild(opNumberEl);

                operationGroup.appendChild(opDisplayContainer);

                const arrowSymbol = document.createElement('span');
                arrowSymbol.classList.add('arrow-symbol');
                arrowSymbol.innerHTML = '→';
                // A nyíl színét is a CSS témákból vesszük
                // arrowSymbol.style.color = getComputedStyle(document.documentElement).getPropertyValue(operatorConfig[op.operator].signColorThemeVar).trim() || (op.operator === '+' ? '#388E3C' : '#D32F2F');
                operationGroup.appendChild(arrowSymbol);
                chainCalculationDisplay.appendChild(operationGroup);

                const inputEl = document.createElement('input');
                inputEl.type = 'number';
                inputEl.min = 0;
                inputEl.max = currentSettings.numberRange;
                inputEl.dataset.stepIndex = index;
                inputEl.maxLength = String(currentSettings.numberRange).length;

                inputEl.addEventListener('input', function() {
                    const currentStepIndex = parseInt(this.dataset.stepIndex);
                    const expectedValueStr = String(currentTask.operations[currentStepIndex].intermediateResult);
                    if (this.value.length >= expectedValueStr.length && this.value.length > 0) {
                        if (currentStepIndex < currentTask.userInputs.length - 1) {
                            currentTask.userInputs[currentStepIndex + 1].focus();
                        } else {
                            document.getElementById('checkButton').focus();
                        }
                    }
                });
                const inputWrapper = document.createElement('div');
                inputWrapper.classList.add('chain-item');
                inputWrapper.appendChild(inputEl);
                chainCalculationDisplay.appendChild(inputWrapper);
                currentTask.userInputs.push(inputEl);
            });
        }

        function checkChainTask() {
            let allCorrect = true;
            let allFilled = true;
            let userAnswers = [];
            if (currentTask.userInputs.length === 0) { feedbackArea.textContent = "Nincs feladat generálva."; feedbackArea.className = 'feedback incorrect'; return; }
            currentTask.userInputs.forEach((inputEl, index) => {
                const userAnswerStr = inputEl.value.trim();
                userAnswers.push(userAnswerStr);
                if (userAnswerStr === "") { allFilled = false; inputEl.style.borderColor = 'red'; }
                else {
                    const userAnswer = parseInt(userAnswerStr);
                    const correctAnswer = currentTask.operations[index].intermediateResult;
                    if (isNaN(userAnswer) || userAnswer !== correctAnswer) { allCorrect = false; inputEl.style.borderColor = 'red'; }
                    else { inputEl.style.borderColor = 'green'; }
                }
            });

            logTaskCheck('Láncszámolás', {
                settings: currentSettings,
                answers: userAnswers,
                correct: allCorrect,
                filled: allFilled
            });

            if (!allFilled) { feedbackArea.textContent = 'Kérlek, tölts ki minden mezőt!'; feedbackArea.className = 'feedback incorrect'; }
            else if (allCorrect) { feedbackArea.textContent = 'Minden lépés helyes! Ügyes vagy! 🎉'; feedbackArea.className = 'feedback correct'; }
            else { feedbackArea.textContent = 'Van néhány hiba. Nézd át a pirossal jelölt részeket! 🤔'; feedbackArea.className = 'feedback incorrect'; }
        }

        document.addEventListener('DOMContentLoaded', () => {
            logTaskEntry('Láncszámolás Gyakorló');
            applyTheme(currentSettings.theme);
            generateNewChainTask();
        });