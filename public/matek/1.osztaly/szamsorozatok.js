const bodyEl = document.body;
        const themeSelector = document.getElementById('themeSelector');
        const rangeSelector = document.getElementById('rangeSelector');
        const modeSelector = document.getElementById('modeSelector'); // ÚJ
        const newTaskButton = document.getElementById('newTaskButton');
        
        const sequenceDisplayArea = document.getElementById('sequenceDisplayArea');
        const checkSequenceButton = document.getElementById('checkSequenceButton');
        const feedbackStep1 = document.getElementById('feedbackStep1');
        const step1Instructions = document.getElementById('step1Instructions'); // ÚJ
        
        const step2Container = document.getElementById('step2_select_rule');
        const ruleOptionsContainer = document.getElementById('ruleOptionsContainer');
        const checkRuleButton = document.getElementById('checkRuleButton');
        const feedbackStep2 = document.getElementById('feedbackStep2');

        let currentSettings = {
            theme: 'theme-candy',
            numberRangeMax: 10,
            displayMode: 'memory' // ÚJ: 'memory' vagy 'reminder'
        };

        let currentTask = {
            startNumber: 0,
            rule: [],
            sequence: [],
            shownElements: 3, 
            elementsToFill: 0,
            correctRuleString: "",
            ruleOptions: []
        };
        let userSequenceInputs = [];
        let selectedRuleOption = null;

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function applyTheme(themeClass) {
            bodyEl.className = ''; 
            bodyEl.classList.add(themeClass); 
            currentSettings.theme = themeClass;
            themeSelector.querySelectorAll('.theme-button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
            rangeSelector.querySelectorAll('.range-button').forEach(btn => { 
                btn.classList.toggle('active', parseInt(btn.dataset.range) === currentSettings.numberRangeMax);
            });
            modeSelector.querySelectorAll('.mode-button').forEach(btn => { // ÚJ
                btn.classList.toggle('active', btn.dataset.mode === currentSettings.displayMode);
            });
        }

        themeSelector.addEventListener('click', (e) => { 
            if (e.target.classList.contains('theme-button')) { 
                applyTheme(e.target.dataset.theme); 
            } 
        });
        
        rangeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('range-button')) {
                currentSettings.numberRangeMax = parseInt(e.target.dataset.range);
                // Az applyTheme frissíti az active class-t, de ha csak ez változik, explicit kell
                rangeSelector.querySelectorAll('.range-button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                generateNewSequenceTask();
            }
        });

        // ÚJ: Módválasztó eseménykezelő
        modeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('mode-button')) {
                currentSettings.displayMode = e.target.dataset.mode;
                modeSelector.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                updateStep1Instructions(); // Instrukció frissítése
                renderSequenceStep(); // Csak a megjelenítést frissítjük, nem kell új feladat
            }
        });

        function updateStep1Instructions() {
            if (currentSettings.displayMode === 'reminder') {
                step1Instructions.textContent = "Írd be a hiányzó számokat a sorozatba! A számok közé beírhatod a szabályt, amit gondolsz (pl. +2).";
            } else {
                step1Instructions.textContent = "Írd be a hiányzó számokat a sorozatba!";
            }
        }
        
        function generateNewSequenceTask() {
            feedbackStep1.textContent = ''; feedbackStep1.className = 'feedback';
            feedbackStep2.textContent = ''; feedbackStep2.className = 'feedback';
            step2Container.style.display = 'none';
            checkSequenceButton.disabled = false;
            checkRuleButton.disabled = false; 
            selectedRuleOption = null;
            userSequenceInputs.forEach(input => input.disabled = false);
            userSequenceInputs = [];

            generateRuleAndSequence();
            generateRuleOptions();
            updateStep1Instructions(); // Instrukció frissítése az új feladathoz is
            renderSequenceStep();
            
            console.log("Új feladat generálva:", JSON.parse(JSON.stringify(currentTask)));
        }

        function generateRuleAndSequence() {
            let ruleLength = Math.random() < 0.6 ? 2 : 3;
            currentTask.shownElements = ruleLength + 1; 

            let rule = [];
            let tempSequence = [];
            let startNum;
            let validSequence = false;
            let attempts = 0;

            while(!validSequence && attempts < 200) {
                attempts++;
                rule = [];
                tempSequence = [];
                startNum = getRandomInt(0, Math.floor(currentSettings.numberRangeMax * 0.6)); 

                for (let i = 0; i < ruleLength; i++) {
                    let op = Math.random() < 0.5 ? '+' : '-';
                    let maxRuleVal = 1;
                    if (currentSettings.numberRangeMax === 5) maxRuleVal = 1;
                    else if (currentSettings.numberRangeMax === 10) maxRuleVal = 2;
                    else maxRuleVal = 3; 
                    let val = getRandomInt(1, maxRuleVal); 
                    rule.push({op, val});
                }

                tempSequence.push(startNum);
                let currentNum = startNum;
                const totalElementsInSequence = currentTask.shownElements + (rule.length * 2);

                validSequence = true; 
                for (let i = 0; i < totalElementsInSequence - 1; i++) {
                    const currentRuleStep = rule[i % rule.length];
                    if (currentRuleStep.op === '+') {
                        currentNum += currentRuleStep.val;
                    } else {
                        currentNum -= currentRuleStep.val;
                    }
                    if (currentNum < 0 || currentNum > currentSettings.numberRangeMax) {
                        validSequence = false;
                        break; 
                    }
                    tempSequence.push(currentNum);
                }
                if (validSequence && tempSequence.length !== totalElementsInSequence) {
                    validSequence = false; 
                }
            }

             if (!validSequence) { 
                console.warn("Fallback sequence generation!");
                ruleLength = 2; 
                currentTask.shownElements = ruleLength + 1;
                startNum = currentSettings.numberRangeMax === 5 ? 1 : (currentSettings.numberRangeMax === 10 ? 2: 4);
                rule = [{op: '+', val: 1}, {op: '-', val: 1}];
                if (currentSettings.numberRangeMax === 20) rule = [{op: '+', val: 2}, {op: '-', val: 1}];

                tempSequence = [startNum];
                let currentNumFallback = startNum;
                const totalElementsInSequenceFallback = currentTask.shownElements + (rule.length * 2);

                 for (let i = 0; i < totalElementsInSequenceFallback -1; i++) {
                    const currentRuleStep = rule[i % rule.length];
                    currentNumFallback = (currentRuleStep.op === '+') ? currentNumFallback + currentRuleStep.val : currentNumFallback - currentRuleStep.val;
                    if (currentNumFallback < 0) currentNumFallback = 0;
                    if (currentNumFallback > currentSettings.numberRangeMax) currentNumFallback = currentSettings.numberRangeMax;
                    tempSequence.push(currentNumFallback);
                }
            }

            currentTask.startNumber = startNum;
            currentTask.rule = rule;
            currentTask.sequence = tempSequence;
            currentTask.elementsToFill = rule.length * 2;
            currentTask.correctRuleString = rule.map(r => `${r.op}${r.val}`).join(', ');
        }

        function generateRuleOptions() {
            currentTask.ruleOptions = [];
            const correctRuleStr = currentTask.correctRuleString;
            currentTask.ruleOptions.push(correctRuleStr);

            let maxRuleValOption = 1;
            if (currentSettings.numberRangeMax === 5) maxRuleValOption = 1;
            else if (currentSettings.numberRangeMax === 10) maxRuleValOption = 2;
            else maxRuleValOption = 3;

            while (currentTask.ruleOptions.length < 4) {
                let ruleLength = currentTask.rule.length;
                let fakeRuleArr = [];
                let fakeRuleStr = "";
                let attempts = 0;

                do {
                    attempts++;
                    fakeRuleArr = [];
                    let madeChange = false; 
                    for (let i = 0; i < ruleLength; i++) {
                        let op = currentTask.rule[i].op;
                        let val = currentTask.rule[i].val;

                        if (attempts > 5 && Math.random() < 0.7) { 
                            if (Math.random() < 0.5) { 
                                op = op === '+' ? '-' : '+';
                                madeChange = true;
                            } else { 
                                let newVal;
                                do {
                                    newVal = getRandomInt(1, maxRuleValOption);
                                } while (newVal === val && maxRuleValOption > 1); 
                                if (newVal !== val) madeChange = true;
                                val = newVal;
                            }
                        } else if (attempts <= 5 && i === getRandomInt(0, ruleLength -1) ) {
                             if (Math.random() < 0.5) { op = op === '+' ? '-' : '+'; madeChange = true;}
                             else { 
                                 let tempVal = val;
                                 val = getRandomInt(1, maxRuleValOption); 
                                 if(val !== tempVal) madeChange = true;
                            }
                        } else { 
                            op = Math.random() < 0.5 ? '+' : '-';
                            val = getRandomInt(1, maxRuleValOption);
                        }
                        fakeRuleArr.push({op, val});
                    }
                    fakeRuleStr = fakeRuleArr.map(r => `${r.op}${r.val}`).join(', ');
                    
                    if (fakeRuleStr === correctRuleStr && !madeChange && ruleLength > 0 && attempts < 25) { 
                        let changeIndex = getRandomInt(0, ruleLength-1);
                        if (fakeRuleArr[changeIndex]) { 
                           fakeRuleArr[changeIndex].val = (fakeRuleArr[changeIndex].val % maxRuleValOption) + 1;
                           if(fakeRuleArr[changeIndex].val > maxRuleValOption) fakeRuleArr[changeIndex].val = 1;
                           fakeRuleStr = fakeRuleArr.map(r => `${r.op}${r.val}`).join(', ');
                        }
                    }
                } while ((currentTask.ruleOptions.includes(fakeRuleStr) || fakeRuleStr === correctRuleStr) && attempts < 50); 
                
                if (!currentTask.ruleOptions.includes(fakeRuleStr) && fakeRuleStr !== correctRuleStr) {
                    currentTask.ruleOptions.push(fakeRuleStr);
                } else if (attempts >= 50 && currentTask.ruleOptions.length < 4) { 
                    let randomOp = Math.random() < 0.5 ? '+' : '-';
                    let randomVal = getRandomInt(1, maxRuleValOption + 1); 
                    let fallbackRuleParts = [];
                    for(let k=0; k < ruleLength; k++){
                        fallbackRuleParts.push(`${randomOp}${randomVal + k + currentTask.ruleOptions.length}`);
                    }
                    let uniqueFallbackRule = fallbackRuleParts.join(', ');
                    if(!currentTask.ruleOptions.includes(uniqueFallbackRule) && uniqueFallbackRule !== correctRuleStr){
                       currentTask.ruleOptions.push(uniqueFallbackRule);
                    }
                }
            }
            while(currentTask.ruleOptions.length < 4 && currentTask.rule.length > 0){
                let lastOption = currentTask.ruleOptions[currentTask.ruleOptions.length-1] || correctRuleStr;
                let parts = lastOption.split(',');
                if (parts.length > 0 && parts[parts.length-1].length > 1) { 
                    let lastPartVal = parseInt(parts[parts.length-1].substring(1));
                    if (!isNaN(lastPartVal)) { 
                       parts[parts.length-1] = parts[parts.length-1][0] + (lastPartVal + 1);
                    } else { 
                       parts[parts.length-1] = parts[parts.length-1][0] + "1";
                    }
                } else { 
                     parts = [(Math.random() < 0.5 ? '+' : '-') + "1"];
                }
                let newOpt = parts.join(',');
                if(!currentTask.ruleOptions.includes(newOpt)) currentTask.ruleOptions.push(newOpt);
                else currentTask.ruleOptions.push(correctRuleStr + "_" + currentTask.ruleOptions.length); 
            }
            shuffleArray(currentTask.ruleOptions);
        }

        function renderSequenceStep() {
            sequenceDisplayArea.innerHTML = '';
            userSequenceInputs = []; 

            for (let i = 0; i < currentTask.sequence.length; i++) {
                const itemEl = document.createElement('div');
                itemEl.classList.add('sequence-item');

                if (i < currentTask.shownElements) { 
                    const numDisplay = document.createElement('div');
                    numDisplay.classList.add('number-display');
                    numDisplay.textContent = currentTask.sequence[i];
                    itemEl.appendChild(numDisplay);
                } else { 
                    const inputEl = document.createElement('input');
                    inputEl.type = 'number';
                    inputEl.min = 0;
                    inputEl.max = currentSettings.numberRangeMax;
                    inputEl.pattern = "\\d*"; 
                    inputEl.dataset.index = i - currentTask.shownElements; 
                    
                    inputEl.addEventListener('input', function() {
                        const valStr = this.value;
                        const expectedFullNumberForThisInput = currentTask.sequence[currentTask.shownElements + parseInt(this.dataset.index)];
                        
                        if (valStr.length >= String(expectedFullNumberForThisInput).length && valStr.length > 0) {
                             if (parseInt(valStr) > currentSettings.numberRangeMax) { 
                                this.value = valStr.slice(0, String(currentSettings.numberRangeMax).length); 
                                if (parseInt(this.value) > currentSettings.numberRangeMax) this.value = String(currentSettings.numberRangeMax);
                                return;
                            }
                            const nextInputIndex = parseInt(this.dataset.index) + 1;
                            if (nextInputIndex < currentTask.elementsToFill) { 
                                if (userSequenceInputs[nextInputIndex]) userSequenceInputs[nextInputIndex].focus();
                            } else {
                                checkSequenceButton.focus(); 
                            }
                        }
                    });
                    itemEl.appendChild(inputEl);
                    userSequenceInputs.push(inputEl); 
                }
                sequenceDisplayArea.appendChild(itemEl);

                // ÚJ: Szabály művelet beviteli mező hozzáadása feltételesen
                if (currentSettings.displayMode === 'reminder' && i < currentTask.shownElements - 1) {
                    const operatorInputContainer = document.createElement('div');
                    operatorInputContainer.classList.add('operator-input-item');
                    
                    const opInput = document.createElement('input');
                    opInput.type = 'text';
                    opInput.classList.add('rule-operator-input');
                    opInput.placeholder = "±?"; 
                    opInput.maxLength = 3; 
                    
                    operatorInputContainer.appendChild(opInput);
                    sequenceDisplayArea.appendChild(operatorInputContainer);
                }
            }
            if (userSequenceInputs.length > 0) {
                userSequenceInputs[0].focus();
            }
        }
        
        function renderRuleStep() {
            ruleOptionsContainer.innerHTML = '';
            ruleOptionsContainer.querySelectorAll('.rule-option-button').forEach(btn => btn.disabled = false); 
            currentTask.ruleOptions.forEach((ruleStr) => {
                const button = document.createElement('button');
                button.classList.add('rule-option-button');
                button.textContent = ruleStr;
                button.dataset.rule = ruleStr;
                button.addEventListener('click', function() {
                    selectedRuleOption = this.dataset.rule;
                    ruleOptionsContainer.querySelectorAll('.rule-option-button').forEach(btn => {
                        btn.classList.remove('selected');
                        btn.style.backgroundColor = ''; 
                        btn.style.color = '';
                        btn.style.borderColor = '';
                    });
                    this.classList.add('selected');
                    feedbackStep2.textContent = ''; feedbackStep2.className = 'feedback';
                });
                ruleOptionsContainer.appendChild(button);
            });
        }

        checkSequenceButton.addEventListener('click', function() {
            let allCorrect = true;
            let allFilled = true;

            userSequenceInputs.forEach((inputEl, index) => {
                const userAnswer = parseInt(inputEl.value);
                const correctAnswer = currentTask.sequence[currentTask.shownElements + index];
                
                inputEl.classList.remove('correct-input', 'incorrect-input');

                if (inputEl.value.trim() === "") {
                    allFilled = false;
                    inputEl.classList.add('incorrect-input');
                } else if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
                    allCorrect = false;
                    inputEl.classList.add('incorrect-input');
                } else {
                    inputEl.classList.add('correct-input');
                }
            });

            if (!allFilled) {
                feedbackStep1.textContent = "Kérlek, tölts ki minden hiányzó számot!";
                feedbackStep1.className = 'feedback incorrect';
            } else if (allCorrect) {
                feedbackStep1.textContent = "A sorozat helyes! ✅ Most válaszd ki a szabályt!";
                feedbackStep1.className = 'feedback correct';
                checkSequenceButton.disabled = true;
                userSequenceInputs.forEach(input => input.disabled = true);
                step2Container.style.display = 'block';
                renderRuleStep();
                 if (ruleOptionsContainer.firstChild) ruleOptionsContainer.firstChild.focus(); 
            } else {
                feedbackStep1.textContent = "A sorozatban hiba van. 🧐 Ellenőrizd a pirossal jelölt mezőket!";
                feedbackStep1.className = 'feedback incorrect';
            }
        });

        checkRuleButton.addEventListener('click', function() {
            if (!selectedRuleOption) {
                feedbackStep2.textContent = "Kérlek, válassz egy szabályt!";
                feedbackStep2.className = 'feedback incorrect';
                return;
            }

            const isCorrect = selectedRuleOption === currentTask.correctRuleString;
            feedbackStep2.textContent = isCorrect ? 
                `Helyes a szabály! (${currentTask.correctRuleString}) Szuper vagy! 🎉` :
                `Ez nem a helyes szabály. A jó megoldás: ${currentTask.correctRuleString}. Próbáld meg újra a következő feladatnál!`;
            feedbackStep2.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
            
            checkRuleButton.disabled = true;
            ruleOptionsContainer.querySelectorAll('.rule-option-button').forEach(btn => {
                btn.disabled = true; 
                if (btn.dataset.rule === currentTask.correctRuleString && !isCorrect) {
                    btn.classList.add('selected'); 
                     btn.style.borderColor = getComputedStyle(document.body).getPropertyValue('--feedback-correct-border-color').trim() || 'green';
                } else if (btn.dataset.rule === selectedRuleOption && !isCorrect) {
                     btn.style.borderColor = getComputedStyle(document.body).getPropertyValue('--feedback-incorrect-border-color').trim() || 'red';
                } else if (btn.dataset.rule !== selectedRuleOption && btn.dataset.rule !== currentTask.correctRuleString) {
                    btn.style.opacity = "0.6"; 
                }
            });
        });

        newTaskButton.addEventListener('click', generateNewSequenceTask);

        document.addEventListener('DOMContentLoaded', () => {
            const initialThemeButton = themeSelector.querySelector('.theme-button[data-theme="theme-candy"]');
            if(initialThemeButton) currentSettings.theme = initialThemeButton.dataset.theme;
            else currentSettings.theme = themeSelector.querySelector('.theme-button').dataset.theme; 
            
            const initialRangeButton = rangeSelector.querySelector('.range-button.active');
            if (initialRangeButton) currentSettings.numberRangeMax = parseInt(initialRangeButton.dataset.range);

            const initialModeButton = modeSelector.querySelector('.mode-button.active'); // ÚJ
            if (initialModeButton) currentSettings.displayMode = initialModeButton.dataset.mode;


            applyTheme(currentSettings.theme); // Ez most már a módválasztó gombokat is beállítja
            generateNewSequenceTask();
        });