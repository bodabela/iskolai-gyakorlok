let currentNumberRange = 10;
        let task1Data = { targetSum: 0, columns: [] };
        let task2Data = { rule: { variable1: 'Y', variable2: 'X', operation: '+', diff: 0, variable1Icon: '', variable2Icon: ''},
                            tablePairs: [], solutions: {} };
        let task3Data = {
            targetSumPerColumn: 0,
            itemType1: { name: '', svg: '' },
            itemType2: { name: '', svg: '' },
            numCols: 0,
            tableValues: [],
            solutions: [],
            correctRuleString: '',
            ruleOptions: []
        };

        const itemNouns = ["alma", "körte", "virág", "labda", "ceruza", "kocka", "cukorka", "süti", "autó", "hajó", "csillag", "felhő"];

        const themedIcons = {
            "alma": [
                { name: 'alma', svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="#FF6347"/><path d="M50,15 Q60,5 70,15" stroke="#8B4513" stroke-width="5" fill="none"/><ellipse cx="50" cy="40" rx="8" ry="4" fill="#FFF8DC"/></svg>` },
                { name: 'zöldalma', svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="55" r="30" fill="#90EE90"/><path d="M50,25 Q53,18 60,25" stroke="#006400" stroke-width="4" fill="none"/><ellipse cx="45" cy="45" rx="5" ry="3" fill="#FFFFE0" transform="rotate(-10 50 50)"/></svg>` }
            ],
            "körte": [
                { name: 'körte', svg: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="60" rx="30" ry="40" fill="#9ACD32"/><path d="M50,20 Q55,10 60,20" stroke="#8B4513" stroke-width="5" fill="none"/><circle cx="50" cy="45" r="5" fill="#FFFACD"/></svg>` },
                { name: 'sárgakörte', svg: `<svg viewBox="0 0 100 100"><path d="M50,90 C65,90 75,75 75,60 C75,40 60,20 50,10 C40,20 25,40 25,60 C25,75 35,90 50,90Z" fill="#FFD700"/><path d="M50,10 Q48,5 55,10" stroke="#A0522D" stroke-width="4" fill="none"/></svg>` }
            ],
            "virág": [
                { name: 'rózsaszín virág', svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="15" fill="#FFD700"/><circle cx="50" cy="25" r="12" fill="#FF69B4"/><circle cx="75" cy="40" r="12" fill="#FF69B4"/><circle cx="70" cy="65" r="12" fill="#FF69B4"/><circle cx="50" cy="75" r="12" fill="#FF69B4"/><circle cx="30" cy="65" r="12" fill="#FF69B4"/><circle cx="25" cy="40" r="12" fill="#FF69B4"/></svg>` },
                { name: 'lila virág', svg: `<svg viewBox="0 0 100 100"><path d="M50 10 C 40 30, 10 35, 25 50 C 10 65, 40 70, 50 90 C 60 70, 90 65, 75 50 C 90 35, 60 30, 50 10 Z" fill="#DA70D6"/><circle cx="50" cy="50" r="10" fill="#FFEFD5"/></svg>`}
            ],
            "labda": [
                { name: 'kék labda', svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#4682B4"/><path d="M50,10 C77.6,10 100,32.4 100,60 S77.6,110 50,110 S0,87.6 0,60 S22.4,10 50,10 Z" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.3"/><circle cx="50" cy="50" r="10" fill="#FFF"/></svg>` },
                { name: 'focilabda', svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#FFFFFF" stroke="#000000" stroke-width="2"/> <polygon points="50,12 41,30 59,30" fill="#000000"/> <polygon points="50,88 41,70 59,70" fill="#000000"/> <polygon points="19,38 34,30 34,46" fill="#000000"/> <polygon points="81,38 66,30 66,46" fill="#000000"/> <polygon points="19,62 34,70 34,54" fill="#000000"/> <polygon points="81,62 66,70 66,54" fill="#000000"/></svg>` }
            ],
             "autó": [
                { name: 'kék autó', svg: `<svg viewBox="0 0 100 100"><rect x="10" y="40" width="80" height="30" rx="10" fill="#82B1FF"/><rect x="25" y="25" width="50" height="20" fill="#BBDEFB"/><circle cx="30" cy="70" r="10" fill="#424242"/><circle cx="70" cy="70" r="10" fill="#424242"/></svg>` },
                { name: 'piros autó', svg: `<svg viewBox="0 0 100 100"><polygon points="10,60 20,40 80,40 90,60" fill="#FF7043"/><rect x="5" y="60" width="90" height="20" rx="5" fill="#FF7043"/><circle cx="25" cy="80" r="10" fill="#212121"/><circle cx="75" cy="80" r="10" fill="#212121"/><rect x="30" y="45" width="40" height="15" fill="#CFD8DC"/></svg>`}
            ],
            "ceruza": [
                { name: 'sárga ceruza', svg: `<svg viewBox="0 0 100 100"><polygon points="50,10 60,30 40,30" fill="#FFC107"/><rect x="40" y="30" width="20" height="50" fill="#FFD54F"/><polygon points="40,80 60,80 50,90" fill="#795548"/></svg>`},
                { name: 'kék ceruza', svg: `<svg viewBox="0 0 100 100"><polygon points="50,5 55,25 45,25" fill="#BCAAA4"/><rect x="45" y="25" width="10" height="60" fill="#2196F3"/><rect x="42" y="85" width="16" height="5" fill="#9E9E9E"/></svg>`}
            ],
            "kocka": [
                { name: 'zöld kocka', svg: `<svg viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" fill="#4CAF50" stroke="#388E3C" stroke-width="2"/><circle cx="37.5" cy="37.5" r="5" fill="white"/><circle cx="62.5" cy="37.5" r="5" fill="white"/><circle cx="37.5" cy="62.5" r="5" fill="white"/><circle cx="62.5" cy="62.5" r="5" fill="white"/><circle cx="50" cy="50" r="5" fill="white"/></svg>`},
                { name: 'piros kocka', svg: `<svg viewBox="0 0 100 100"><polygon points="50,15 25,35 25,75 50,95 75,75 75,35" fill="#F44336" stroke="#D32F2F" stroke-width="2"/><line x1="25" y1="35" x2="75" y2="75" stroke="#D32F2F" stroke-width="1"/><line x1="75" y1="35" x2="25" y2="75" stroke="#D32F2F" stroke-width="1"/><line x1="50" y1="15" x2="50" y2="95" stroke="#D32F2F" stroke-width="1"/></svg>`}
            ],
            "general": [
                { name: 'csillag', svg: `<svg viewBox="0 0 100 100"><polygon points="50,5 61,35 95,35 67,57 78,90 50,70 22,90 33,57 5,35 39,35" fill="#FFEB3B"/></svg>` },
                { name: 'szív', svg: `<svg viewBox="0 0 100 100"><path d="M50,90 C-20,50 25,-10 50,30 C75,-10 120,50 50,90 Z" fill="#E91E63"/></svg>` },
                { name: 'felhő', svg: `<svg viewBox="0 0 100 100"><path d="M20,70 A20,20 0 0,1 60,70 A15,15 0 0,1 80,55 A25,25 0 0,1 65,30 A20,20 0 0,1 35,30 A25,25 0 0,1 20,55 Z" fill="#ADD8E6"/></svg>` },
                { name: 'hold', svg: `<svg viewBox="0 0 100 100"><path d="M75,5 A50,50 0 0,0 75,95 A35,35 0 0,1 75,5 Z" fill="#F0E68C"/></svg>` },
                { name: 'ház', svg: `<svg viewBox="0 0 100 100"><rect x="20" y="50" width="60" height="45" fill="#FFCC80"/><polygon points="10,50 50,15 90,50" fill="#D2691E"/><rect x="40" y="65" width="20" height="30" fill="#8D6E63"/></svg>` },
                { name: 'cukorka', svg: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="30" ry="20" fill="#FFAB91"/><path d="M20,50 L10,40 L20,30 L30,35 Z" fill="#F48FB1"/><path d="M80,50 L90,60 L80,70 L70,65 Z" fill="#F48FB1"/></svg>`},
                { name: 'süti', svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="30" fill="#D2691E"/><circle cx="40" cy="50" r="5" fill="#4A3B31"/><circle cx="60" cy="50" r="5" fill="#4A3B31"/><circle cx="50" cy="65" r="5" fill="#4A3B31"/><path d="M30,60 A20,15 0,0,0 70,60" fill="none" stroke="#4A3B31" stroke-width="4"/></svg>`},
                { name: 'hajó', svg: `<svg viewBox="0 0 100 100"><polygon points="10,70 90,70 70,90 30,90" fill="#A1887F"/><polygon points="50,10 50,70 70,50" fill="#FFF9C4"/><line x1="50" y1="10" x2="50" y2="70" stroke="#3E2723" stroke-width="4"/></svg>`}
            ]
        };


        const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');
        const rangeButtons = document.querySelectorAll('.range-button');
        const NUM_COLS_TASK1_TASK2 = 8;

        const columnBackgroundColors = [
            { strong: '#FFADAD', pastel: '#FFD6A5' }, { strong: '#A0C4FF', pastel: '#BDB2FF' },
            { strong: '#9BF6FF', pastel: '#CAFFBF' }, { strong: '#FDFFB6', pastel: '#FFD1A0' },
            { strong: '#FFC6FF', pastel: '#D9B9FF' }, { strong: '#A0E7E5', pastel: '#B4F8C8' },
            { strong: '#FFAFCC', pastel: '#BDE0FE' }, { strong: '#FBF8CC', pastel: '#FDE4CF' }
        ];

        function getUniqueColorPairFromArray(availableColorsArray) {
            if (!availableColorsArray || availableColorsArray.length === 0) {
                return columnBackgroundColors[Math.floor(Math.random() * columnBackgroundColors.length)];
            }
            const randomIndex = Math.floor(Math.random() * availableColorsArray.length);
            return availableColorsArray.splice(randomIndex, 1)[0];
        }

        function getDifferentColorPair(excludePair = null) {
            let choice;
            let attempts = 0;
            const maxAttempts = columnBackgroundColors.length * 2;
            do {
                choice = columnBackgroundColors[Math.floor(Math.random() * columnBackgroundColors.length)];
                attempts++;
            } while (excludePair && choice.strong === excludePair.strong && choice.pastel === excludePair.pastel && attempts < maxAttempts && columnBackgroundColors.length > 1);
            return choice;
        }

        function setupInputFocusAndMaxlength(inputElements, setInitialFocus = false) {
            inputElements.forEach((inputEl, index) => {
                if (!inputEl) return;
                
                const expectedValue = inputEl.dataset.expectedValue;
                const fieldMaxLength = String(expectedValue).length;
                inputEl.setAttribute('maxlength', fieldMaxLength);

                inputEl.style.borderColor = `var(--input-border-color, #ccc)`;
                inputEl.style.borderWidth = '1px';
                inputEl.style.borderStyle = 'solid';

                inputEl.addEventListener('input', () => {
                    const value = inputEl.value;
                    if (value.length >= fieldMaxLength) {
                        let nextIndex = index + 1;
                        while (nextIndex < inputElements.length &&
                               inputElements[nextIndex] &&
                               inputElements[nextIndex].value.length >= parseInt(inputElements[nextIndex].getAttribute('maxlength'))) {
                            nextIndex++;
                        }
                        if (nextIndex < inputElements.length && inputElements[nextIndex]) {
                            inputElements[nextIndex].focus();
                        }
                    }
                });
            });

            if (setInitialFocus && inputElements.length > 0) {
                 setTimeout(() => {
                    const firstEmptyInput = inputElements.find(el => el && el.value.length < parseInt(el.getAttribute('maxlength')));
                    if (firstEmptyInput) {
                        firstEmptyInput.focus();
                    } else if (inputElements[0]) {
                        inputElements[0].focus();
                    }
                }, 50);
            }
        }


        function applyTheme(themeClass) {
            bodyEl.className = '';
            bodyEl.classList.add(themeClass);
            themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === themeClass));
            rangeButtons.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.range) === currentNumberRange));
            if (typeof generateTask1 === 'function' && typeof generateTask2 === 'function' && typeof generateTask3 === 'function') {
                generateTask1(true);
                generateTask2(false);
                generateTask3(false);
            }
        }

        themeButtons.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.theme)));
        rangeButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentNumberRange = parseInt(button.dataset.range);
                rangeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                generateTask1(true);
                generateTask2(false);
                generateTask3(false);
            });
        });

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            if (min > max) return min;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generateTask1(shouldSetFocus = false) {
            task1Data.targetSum = getRandomInt(Math.max(1, Math.floor(currentNumberRange / 2) + 1), currentNumberRange);
            if (currentNumberRange === 5 && task1Data.targetSum < 2) task1Data.targetSum = getRandomInt(2,5);
            else if (task1Data.targetSum < 1 && currentNumberRange > 0) task1Data.targetSum = 1;
            else if (currentNumberRange === 0 ) task1Data.targetSum = 0;

            task1Data.columns = [];
            const usedGivenNumbers = new Set();

            for (let i = 0; i < NUM_COLS_TASK1_TASK2; i++) {
                let givenNum;
                let attempts = 0;
                const maxAttempts = 50;
                let uniquePossible = (task1Data.targetSum +1) > usedGivenNumbers.size;

                do {
                    if (task1Data.targetSum === 0) givenNum = 0;
                    else givenNum = getRandomInt(0, task1Data.targetSum -1 );
                    attempts++;
                } while (usedGivenNumbers.has(givenNum) && attempts < maxAttempts && uniquePossible && usedGivenNumbers.size < (task1Data.targetSum +1) );

                if (usedGivenNumbers.has(givenNum) && uniquePossible && usedGivenNumbers.size < (task1Data.targetSum+1)) {
                    for (let fallback = 0; fallback <= task1Data.targetSum; fallback++) {
                        if (!usedGivenNumbers.has(fallback)) {
                            givenNum = fallback;
                            break;
                        }
                    }
                }
                usedGivenNumbers.add(givenNum);
                const solutionNum = task1Data.targetSum - givenNum;
                const isGivenFixed = Math.random() < 0.5;

                task1Data.columns.push({
                    fixedValue: isGivenFixed ? givenNum : solutionNum,
                    valueToFind: isGivenFixed ? solutionNum : givenNum,
                    isFixedOnTop: Math.random() < 0.5,
                    id: `task1_input_col${i}`
                });
            }
            renderTask1Table(shouldSetFocus);
            document.getElementById('task1_feedback').textContent = '';
            document.getElementById('task1_feedback').className = 'feedback';
            document.getElementById('task1_description_p').textContent = `A számokat pótold a táblázat elején megadott ${task1Data.targetSum} számra! Írd a hiányzó mennyiséget a megfelelő helyre!`;
        }

        function renderTask1Table(shouldSetFocus = false) {
            const container = document.getElementById('task1_table_container');
            container.innerHTML = '';
            const table = document.createElement('table');

            const row1 = table.insertRow();
            const row2 = table.insertRow();
            const orderedInputs = [];
            let availableColorsForTask1 = [...columnBackgroundColors];

            const targetCell = row1.insertCell();
            targetCell.rowSpan = 2;
            const targetWrapper = document.createElement('div');
            targetWrapper.classList.add('table-fixed-number');
            targetWrapper.textContent = task1Data.targetSum;
            targetWrapper.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--target-sum-bg-color').trim();
            targetWrapper.style.color = getComputedStyle(document.documentElement).getPropertyValue('--target-sum-text-color').trim();
            targetCell.appendChild(targetWrapper);

            task1Data.columns.forEach((colData) => {
                const cellTop = row1.insertCell();
                const cellBottom = row2.insertCell();

                let colors = getUniqueColorPairFromArray(availableColorsForTask1);

                const fixedEl = document.createElement('div');
                fixedEl.classList.add('table-fixed-number');
                fixedEl.textContent = colData.fixedValue;
                fixedEl.style.backgroundColor = colors.strong;
                fixedEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--fixed-cell-text-color').trim();

                const inputEl = document.createElement('input');
                inputEl.type = 'number';
                inputEl.classList.add('table-input');
                inputEl.id = colData.id;
                inputEl.min = 0;
                inputEl.max = currentNumberRange;
                inputEl.style.backgroundColor = colors.pastel;
                inputEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--input-text-color').trim();
                inputEl.dataset.expectedValue = colData.valueToFind;

                if (colData.isFixedOnTop) {
                    cellTop.appendChild(fixedEl);
                    cellBottom.appendChild(inputEl);
                } else {
                    cellTop.appendChild(inputEl);
                    cellBottom.appendChild(fixedEl);
                }
                orderedInputs.push(inputEl);
            });
            container.appendChild(table);
            setupInputFocusAndMaxlength(orderedInputs, shouldSetFocus);
        }

        function checkTask1() {
            const feedbackEl = document.getElementById('task1_feedback');
            let allCorrect = true;
            let allFilled = true;
            const borderWidth = getComputedStyle(document.documentElement).getPropertyValue('--feedback-border-width').trim();

            task1Data.columns.forEach((colData) => {
                const inputEl = document.getElementById(colData.id);
                if (!inputEl || !inputEl.closest('td')) return;

                if (inputEl.value.trim() === "") {
                    allFilled = false;
                    inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`;
                } else {
                    const userAnswer = parseInt(inputEl.value);
                    if (userAnswer !== colData.valueToFind) {
                        allCorrect = false;
                        inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`;
                    } else {
                        inputEl.style.borderColor = `var(--feedback-correct-border-color)`;
                    }
                }
                inputEl.style.borderWidth = borderWidth;
                inputEl.style.borderStyle = 'solid';
            });

            if (!allFilled) {
                 feedbackEl.textContent = 'Még nem töltöttél ki minden mezőt!';
                 feedbackEl.className = 'feedback incorrect';
            } else if (allCorrect) {
                feedbackEl.textContent = 'Ügyes vagy, minden pótlás helyes!';
                feedbackEl.className = 'feedback correct';
            } else {
                feedbackEl.textContent = 'Van hibás válasz. Nézd át a pirossal jelölteket!';
                feedbackEl.className = 'feedback incorrect';
            }
        }

        function generateTask2(shouldSetFocus = false) {
            const diff = getRandomInt(1, Math.min(5, currentNumberRange >=1 ? Math.max(1, currentNumberRange -1) : 1));
            const operations = ['+', '-'];
            const operation = operations[Math.floor(Math.random() * operations.length)];

            task2Data.rule.operation = operation;
            task2Data.rule.diff = diff;

            const ruleP = document.getElementById('task2_rule_p');

            const generalIconsForTask2 = themedIcons.general || Object.values(themedIcons).flat();
            if (generalIconsForTask2.length < 2) {
                console.error("Not enough general icons for task 2");
                task2Data.rule.variable1Icon = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="blue"></circle></svg>`; // Y fallback
                task2Data.rule.variable2Icon = `<svg viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" fill="green"></rect></svg>`; // X fallback
            } else {
                let idx1_t2 = Math.floor(Math.random() * generalIconsForTask2.length);
                let icon1DataTask2 = generalIconsForTask2[idx1_t2];
                let idx2_t2;
                do {
                    idx2_t2 = Math.floor(Math.random() * generalIconsForTask2.length);
                } while (idx1_t2 === idx2_t2);
                let icon2DataTask2 = generalIconsForTask2[idx2_t2];

                task2Data.rule.variable1Icon = icon2DataTask2.svg; // Y
                task2Data.rule.variable2Icon = icon1DataTask2.svg; // X
            }

            ruleP.innerHTML = `Szabály: <span class="child-icon-rule" style="display:inline-block; vertical-align:middle; width:24px; height:24px;">${task2Data.rule.variable1Icon}</span> = <span class="child-icon-rule" style="display:inline-block; vertical-align:middle; width:24px; height:24px;">${task2Data.rule.variable2Icon}</span> ${operation} ${diff}`;

            task2Data.tablePairs = [];
            task2Data.solutions = {};
            const knownValuesThisTask = { X: new Set(), Y: new Set() };

            for (let i = 0; i < NUM_COLS_TASK1_TASK2; i++) {
                let xVal, yVal;
                let knownVar = (Math.random() < 0.5) ? 'X' : 'Y';
                let attempts = 0;

                do {
                    attempts++;
                    if (knownVar === 'X') {
                        if (operation === '+') {
                            xVal = getRandomInt(0, currentNumberRange - diff);
                            yVal = xVal + diff;
                        } else { // operation === '-'
                            xVal = getRandomInt(diff, currentNumberRange);
                            yVal = xVal - diff;
                        }
                    } else { // knownVar === 'Y'
                        if (operation === '+') {
                            yVal = getRandomInt(diff, currentNumberRange);
                            xVal = yVal - diff;
                        } else { // operation === '-'
                            yVal = getRandomInt(0, currentNumberRange - diff);
                            xVal = yVal + diff;
                        }
                    }
                    if (xVal < 0 || xVal > currentNumberRange || yVal < 0 || yVal > currentNumberRange) {
                        continue;
                    }

                } while ( ((knownVar === 'X' && knownValuesThisTask.X.has(xVal)) || (knownVar === 'Y' && knownValuesThisTask.Y.has(yVal)) ) && attempts < 50);

                if (attempts >= 50 && ((knownVar === 'X' && knownValuesThisTask.X.has(xVal)) || (knownVar === 'Y' && knownValuesThisTask.Y.has(yVal)))) {
                    let foundFallback = false;
                    if (knownVar === 'X') {
                        for(let fx = 0; fx <= currentNumberRange - (operation === '+' ? diff : 0); fx++) {
                            if (!knownValuesThisTask.X.has(fx)) { xVal = fx; yVal = operation === '+' ? fx+diff : fx-diff; if (yVal >=0 && yVal <= currentNumberRange) {foundFallback=true; break;}}
                        }
                    } else {
                         for(let fy = (operation === '+' ? diff : 0); fy <= currentNumberRange - (operation === '-' ? diff : 0); fy++) {
                            if (!knownValuesThisTask.Y.has(fy)) { yVal = fy; xVal = operation === '+' ? fy-diff : fy+diff; if (xVal >=0 && xVal <= currentNumberRange) {foundFallback=true; break;}}
                        }
                    }
                     if (!foundFallback) {
                         if (task2Data.tablePairs.length < NUM_COLS_TASK1_TASK2 -1 || task2Data.tablePairs.length === 0) {i--; continue;} else break;
                    }
                }
                 if (xVal < 0 || xVal > currentNumberRange || yVal < 0 || yVal > currentNumberRange) {
                     if (task2Data.tablePairs.length < NUM_COLS_TASK1_TASK2 -1 || task2Data.tablePairs.length === 0) {i--; continue;} else break;
                }

                if (knownVar === 'X') knownValuesThisTask.X.add(xVal); else knownValuesThisTask.Y.add(yVal);

                task2Data.tablePairs.push({
                    x: (knownVar === 'X' ? xVal : null),
                    y: (knownVar === 'Y' ? yVal : null),
                    xInputId: (knownVar === 'Y' ? `task2_x_col${i}` : null),
                    yInputId: (knownVar === 'X' ? `task2_y_col${i}` : null)
                });
                task2Data.solutions[`x_col${i}`] = xVal;
                task2Data.solutions[`y_col${i}`] = yVal;
            }
            renderTask2Table(shouldSetFocus);
            document.getElementById('task2_feedback').textContent = '';
            document.getElementById('task2_feedback').className = 'feedback';
        }

        function renderTask2Table(shouldSetFocus = false) {
            const container = document.getElementById('task2_table_container');
            container.innerHTML = '';
            if (task2Data.tablePairs.length === 0) return;
            const table = document.createElement('table');
            const orderedInputs = [];

            const xColors = getDifferentColorPair();
            const yColors = getDifferentColorPair(xColors);

            const xRow = table.insertRow();
            const xHeaderCell = xRow.insertCell();
            xHeaderCell.innerHTML = `<span class="child-icon">${task2Data.rule.variable2Icon}</span>`;

            task2Data.tablePairs.forEach((pair, i) => {
                const cell = xRow.insertCell();
                if (pair.x !== null) {
                    const numDisplay = document.createElement('div');
                    numDisplay.classList.add('table-fixed-number');
                    numDisplay.textContent = pair.x;
                    numDisplay.style.backgroundColor = xColors.strong;
                    numDisplay.style.color = getComputedStyle(document.documentElement).getPropertyValue('--fixed-cell-text-color').trim();
                    cell.appendChild(numDisplay);
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.classList.add('table-input');
                    input.id = pair.xInputId;
                    input.min = 0;
                    input.max = currentNumberRange;
                    input.style.backgroundColor = xColors.pastel;
                    input.style.color = getComputedStyle(document.documentElement).getPropertyValue('--input-text-color').trim();
                    input.dataset.expectedValue = task2Data.solutions[`x_col${i}`];
                    cell.appendChild(input);
                }
            });

            const yRow = table.insertRow();
            const yHeaderCell = yRow.insertCell();
            yHeaderCell.innerHTML = `<span class="child-icon">${task2Data.rule.variable1Icon}</span>`;


            task2Data.tablePairs.forEach((pair, i) => {
                const cell = yRow.insertCell();
                if (pair.y !== null) {
                    const numDisplay = document.createElement('div');
                    numDisplay.classList.add('table-fixed-number');
                    numDisplay.textContent = pair.y;
                    numDisplay.style.backgroundColor = yColors.strong;
                    numDisplay.style.color = getComputedStyle(document.documentElement).getPropertyValue('--fixed-cell-text-color').trim();
                    cell.appendChild(numDisplay);
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.classList.add('table-input');
                    input.id = pair.yInputId;
                    input.min = 0;
                    input.max = currentNumberRange;
                    input.style.backgroundColor = yColors.pastel;
                    input.style.color = getComputedStyle(document.documentElement).getPropertyValue('--input-text-color').trim();
                    input.dataset.expectedValue = task2Data.solutions[`y_col${i}`];
                    cell.appendChild(input);
                }
            });
            container.appendChild(table);

            for (let i = 0; i < NUM_COLS_TASK1_TASK2; i++) {
                const pair = task2Data.tablePairs[i];
                if (pair) {
                    const inputEl = pair.xInputId ? document.getElementById(pair.xInputId) : document.getElementById(pair.yInputId);
                    if (inputEl) orderedInputs.push(inputEl);
                }
            }
            setupInputFocusAndMaxlength(orderedInputs, shouldSetFocus);
        }


        function checkTask2() {
            const feedbackEl = document.getElementById('task2_feedback');
            let allCorrect = true;
            let allFilled = true;
            const borderWidth = getComputedStyle(document.documentElement).getPropertyValue('--feedback-border-width').trim();

            task2Data.tablePairs.forEach((pair, i) => {
                const checkInput = (inputId, solutionKey) => {
                    if (pair[solutionKey.charAt(0)] === null && inputId) {
                        const inputEl = document.getElementById(inputId);
                        if (!inputEl) return;
                        if (inputEl.value.trim() === "") {
                            allFilled = false;
                            inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`;
                        } else {
                            const userAnswer = parseInt(inputEl.value);
                            if (userAnswer !== task2Data.solutions[solutionKey]) {
                                allCorrect = false;
                                inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`;
                            } else {
                                inputEl.style.borderColor = `var(--feedback-correct-border-color)`;
                            }
                        }
                        inputEl.style.borderWidth = borderWidth;
                        inputEl.style.borderStyle = 'solid';
                    }
                };
                checkInput(pair.xInputId, `x_col${i}`);
                checkInput(pair.yInputId, `y_col${i}`);
            });

            if (!allFilled) {
                 feedbackEl.textContent = 'Még nem töltöttél ki minden üres mezőt!';
                 feedbackEl.className = 'feedback incorrect';
            } else if (allCorrect) {
                feedbackEl.textContent = 'Helyes! Ügyesen alkalmaztad a szabályt.';
                feedbackEl.className = 'feedback correct';
            } else {
                feedbackEl.textContent = 'Van hibás válasz. Ellenőrizd a pirossal jelölteket és a szabályt!';
                feedbackEl.className = 'feedback incorrect';
            }
        }

        function generateTask3(shouldSetFocus = false) {
            const randomNounKey = itemNouns[Math.floor(Math.random() * itemNouns.length)];

            let iconSet = themedIcons[randomNounKey];
            if (iconSet && iconSet.length >= 2) {
                let idx1 = Math.floor(Math.random() * iconSet.length);
                let idx2;
                do {
                    idx2 = Math.floor(Math.random() * iconSet.length);
                } while (idx1 === idx2 && iconSet.length > 1);
                task3Data.itemType1 = iconSet[idx1];
                task3Data.itemType2 = iconSet[idx2];
            } else {
                const generalIcons = themedIcons.general || Object.values(themedIcons).flat();
                 if (generalIcons.length < 2) {
                    task3Data.itemType1 = {name: 'ikon1', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="purple"></circle></svg>'};
                    task3Data.itemType2 = {name: 'ikon2', svg: '<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" fill="orange"></rect></svg>'};
                } else {
                    let idx1 = Math.floor(Math.random() * generalIcons.length);
                    let idx2;
                    do {
                        idx2 = Math.floor(Math.random() * generalIcons.length);
                    } while (idx1 === idx2 && generalIcons.length > 1);
                    task3Data.itemType1 = generalIcons[idx1];
                    task3Data.itemType2 = generalIcons[idx2];
                }
            }

            task3Data.targetSumPerColumn = getRandomInt(Math.max(2, Math.floor(currentNumberRange / 2)), currentNumberRange);
            if (task3Data.targetSumPerColumn < 2 && currentNumberRange >=2) task3Data.targetSumPerColumn = 2;
            if (currentNumberRange === 5 && task3Data.targetSumPerColumn > 5) task3Data.targetSumPerColumn = 5;

            document.getElementById('task3_text_instruction').textContent = `Összesen ${task3Data.targetSumPerColumn} db ${randomNounKey}t várunk minden oszlopban.`;

            task3Data.numCols = getRandomInt(3, 5);
            task3Data.tableValues = Array(2).fill(null).map(() => Array(task3Data.numCols).fill(null));
            task3Data.solutions = [];

            for (let col = 0; col < task3Data.numCols; col++) {
                let val1 = getRandomInt(0, task3Data.targetSumPerColumn);
                let val2 = task3Data.targetSumPerColumn - val1;
                if (val2 < 0) { val2 = 0; val1 = task3Data.targetSumPerColumn; }

                const hideFirst = Math.random() < 0.5;
                task3Data.tableValues[0][col] = hideFirst ? null : val1;
                task3Data.tableValues[1][col] = hideFirst ? val2 : null;

                task3Data.solutions.push({
                    row0: val1,
                    row1: val2,
                    input0Id: hideFirst ? `task3_r0_c${col}` : null,
                    input1Id: hideFirst ? null : `task3_r1_c${col}`
                });
            }

            task3Data.correctRuleString = `${task3Data.itemType1.name} + ${task3Data.itemType2.name} = ${task3Data.targetSumPerColumn}`;
            generateTask3RuleOptions();
            renderTask3Table(shouldSetFocus);
            renderTask3RuleOptions();
            document.getElementById('task3_feedback').textContent = '';
            document.getElementById('task3_feedback').className = 'feedback';
        }

        function renderTask3Table(shouldSetFocus = false) {
            const container = document.getElementById('task3_table_container');
            container.innerHTML = '';
            const table = document.createElement('table');
            const inputsByCol = new Array(task3Data.numCols).fill(null);
            let availableColors = [...columnBackgroundColors];

            const row1 = table.insertRow();
            const headerCell1 = row1.insertCell();
            headerCell1.innerHTML = `<span class="child-icon-cell">${task3Data.itemType1.svg}</span>`;
            const row1Colors = getUniqueColorPairFromArray(availableColors.length > 1 ? availableColors : [...columnBackgroundColors]);

            for (let col = 0; col < task3Data.numCols; col++) {
                const cell = row1.insertCell();
                if (task3Data.tableValues[0][col] !== null) {
                    const numDisplay = document.createElement('div');
                    numDisplay.classList.add('table-fixed-number');
                    numDisplay.textContent = task3Data.tableValues[0][col];
                    numDisplay.style.backgroundColor = row1Colors.strong;
                    numDisplay.style.color = getComputedStyle(document.documentElement).getPropertyValue('--fixed-cell-text-color').trim();
                    cell.appendChild(numDisplay);
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.classList.add('table-input');
                    input.id = task3Data.solutions[col].input0Id;
                    input.min = 0; input.max = currentNumberRange;
                    input.style.backgroundColor = row1Colors.pastel;
                    input.style.color = getComputedStyle(document.documentElement).getPropertyValue('--input-text-color').trim();
                    input.dataset.expectedValue = task3Data.solutions[col].row0;
                    cell.appendChild(input);
                    inputsByCol[col] = input;
                }
            }

            const row2 = table.insertRow();
            const headerCell2 = row2.insertCell();
            headerCell2.innerHTML = `<span class="child-icon-cell">${task3Data.itemType2.svg}</span>`;
            const row2Colors = getUniqueColorPairFromArray(availableColors.length > 0 ? availableColors : [...columnBackgroundColors]);

            for (let col = 0; col < task3Data.numCols; col++) {
                const cell = row2.insertCell();
                 if (task3Data.tableValues[1][col] !== null) {
                    const numDisplay = document.createElement('div');
                    numDisplay.classList.add('table-fixed-number');
                    numDisplay.textContent = task3Data.tableValues[1][col];
                    numDisplay.style.backgroundColor = row2Colors.strong;
                    numDisplay.style.color = getComputedStyle(document.documentElement).getPropertyValue('--fixed-cell-text-color').trim();
                    cell.appendChild(numDisplay);
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.classList.add('table-input');
                    input.id = task3Data.solutions[col].input1Id;
                    input.min = 0; input.max = currentNumberRange;
                    input.style.backgroundColor = row2Colors.pastel;
                    input.style.color = getComputedStyle(document.documentElement).getPropertyValue('--input-text-color').trim();
                    input.dataset.expectedValue = task3Data.solutions[col].row1;
                    cell.appendChild(input);
                    inputsByCol[col] = input;
                }
            }
            container.appendChild(table);
            const orderedInputs = inputsByCol.filter(i => i);
            setupInputFocusAndMaxlength(orderedInputs, shouldSetFocus);
        }

        function generateTask3RuleOptions() {
            const item1 = task3Data.itemType1;
            const item2 = task3Data.itemType2;
            task3Data.ruleOptions = [];

            task3Data.ruleOptions.push({
                text: `${item1.name} + ${item2.name} = ${task3Data.targetSumPerColumn}`,
                svg1: item1.svg, op: '+', svg2: item2.svg,
                sum: task3Data.targetSumPerColumn,
                isCorrect: true
            });

            let v1_val = (task3Data.solutions[0] && task3Data.solutions[0].row0 !== undefined) ? task3Data.solutions[0].row0 : getRandomInt(0, Math.floor(task3Data.targetSumPerColumn / 2));
            let v2_val = task3Data.targetSumPerColumn - v1_val;

            const incorrectRuleTemplates = [
                { op1: item1, op: '-', op2: item2, result: v1_val - v2_val },
                { op1: item2, op: '-', op2: item1, result: v2_val - v1_val },
                { op1: item1, op: '+', op2: item2, result: task3Data.targetSumPerColumn + getRandomInt(1, 3) },
                { op1: item1, op: '+', op2: item2, result: task3Data.targetSumPerColumn > 1 ? task3Data.targetSumPerColumn - 1: 0 }
            ];

            shuffleArray(incorrectRuleTemplates);
            
            while (task3Data.ruleOptions.length < 4 && incorrectRuleTemplates.length > 0) {
                const template = incorrectRuleTemplates.shift();
                
                const newRuleText = `${template.op1.name} ${template.op} ${template.op2.name} = ${template.result}`;
                const alreadyExists = task3Data.ruleOptions.some(opt => opt.text === newRuleText);

                if (!alreadyExists && template.result >= 0) {
                    task3Data.ruleOptions.push({
                        text: newRuleText,
                        svg1: template.op1.svg,
                        op: template.op,
                        svg2: template.op2.svg,
                        sum: template.result,
                        isCorrect: false
                    });
                }
            }
             let fallbackAttempts = 0;
             while(task3Data.ruleOptions.length < 4 && fallbackAttempts < 10) {
                 const randomResult = getRandomInt(0, currentNumberRange * 1.5);
                 if (randomResult !== task3Data.targetSumPerColumn) {
                     const newRuleText = `${item1.name} + ${item2.name} = ${randomResult}`;
                     const alreadyExists = task3Data.ruleOptions.some(opt => opt.text === newRuleText);
                     if (!alreadyExists) {
                         task3Data.ruleOptions.push({
                            text: newRuleText,
                            svg1: item1.svg, op: '+', svg2: item2.svg,
                            sum: randomResult,
                            isCorrect: false
                        });
                     }
                 }
                 fallbackAttempts++;
             }

            shuffleArray(task3Data.ruleOptions);
        }


        function renderTask3RuleOptions() {
            const container = document.getElementById('task3_rule_options_container');
            container.innerHTML = '';
            task3Data.ruleOptions.forEach((option) => {
                const card = document.createElement('div');
                card.classList.add('rule-card');
                card.dataset.ruleText = option.text;
                card.innerHTML = `
                    <span class="child-icon-rule">${option.svg1}</span>
                    <span class="rule-operator">${option.op}</span>
                    <span class="child-icon-rule">${option.svg2}</span>
                    <span class="rule-operator">=</span>
                    <span class="rule-sum">${option.sum}</span>
                `;
                card.addEventListener('click', () => {
                    document.querySelectorAll('#task3_rule_options_container .rule-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                });
                container.appendChild(card);
            });
        }

        function checkTask3() {
            const feedbackEl = document.getElementById('task3_feedback');
            let allTableCorrect = true;
            let allTableFilled = true;
            const borderWidth = getComputedStyle(document.documentElement).getPropertyValue('--feedback-border-width').trim();

            task3Data.solutions.forEach(sol => {
                if (sol.input0Id) {
                    const inputEl = document.getElementById(sol.input0Id);
                    if (!inputEl) return;
                    if (inputEl.value.trim() === "") { allTableFilled = false; inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`; }
                    else {
                        const userAnswer = parseInt(inputEl.value);
                        if (userAnswer !== sol.row0) { allTableCorrect = false; inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`; }
                        else { inputEl.style.borderColor = `var(--feedback-correct-border-color)`; }
                    }
                    inputEl.style.borderWidth = borderWidth; inputEl.style.borderStyle = 'solid';
                }
                if (sol.input1Id) {
                    const inputEl = document.getElementById(sol.input1Id);
                    if (!inputEl) return;
                    if (inputEl.value.trim() === "") { allTableFilled = false; inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`; }
                    else {
                        const userAnswer = parseInt(inputEl.value);
                        if (userAnswer !== sol.row1) { allTableCorrect = false; inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`; }
                        else { inputEl.style.borderColor = `var(--feedback-correct-border-color)`; }
                    }
                    inputEl.style.borderWidth = borderWidth; inputEl.style.borderStyle = 'solid';
                }
            });

            const selectedRuleCard = document.querySelector('#task3_rule_options_container .rule-card.selected');
            let ruleCorrect = false;
            if (selectedRuleCard) {
                ruleCorrect = selectedRuleCard.dataset.ruleText === task3Data.correctRuleString;
                selectedRuleCard.style.borderColor = ruleCorrect ? `var(--feedback-correct-border-color)` : `var(--feedback-incorrect-border-color)`;
                selectedRuleCard.style.borderWidth = borderWidth;
            } else {
                 feedbackEl.textContent = 'Kérlek, válassz egy szabályt is!';
                 feedbackEl.className = 'feedback incorrect';
                 return;
            }

            if (!allTableFilled) {
                 feedbackEl.textContent = 'Még nem töltöttél ki minden mezőt a táblázatban!';
                 feedbackEl.className = 'feedback incorrect';
            } else if (allTableCorrect && ruleCorrect) {
                feedbackEl.textContent = 'Szuper! A táblázat és a szabály is helyes!';
                feedbackEl.className = 'feedback correct';
            } else {
                let msg = "";
                if (!allTableCorrect) msg += "A táblázatban van hiba. ";
                if (!ruleCorrect && selectedRuleCard) msg += "A kiválasztott szabály nem jó. ";
                else if (!selectedRuleCard) msg += "Nem választottál szabályt. ";
                feedbackEl.textContent = msg.trim() + " Próbáld újra!";
                feedbackEl.className = 'feedback incorrect';
            }
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            let initialTheme = 'theme-candy';
            for (let i = 0; i < bodyEl.classList.length; i++) {
                if (bodyEl.classList[i].startsWith('theme-')) {
                    initialTheme = bodyEl.classList[i];
                    break;
                }
            }
            applyTheme(initialTheme);
        });