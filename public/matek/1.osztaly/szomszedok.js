let currentNumberRangeMax = 20; 
        const NUM_EXAMPLES_PER_TYPE = 5;
        let currentTheme = 'theme-candy';

        let currentSettings = { 
            theme: 'theme-candy',
            numberRangeMax: 20
        };

        let tasks = {
            direct: [],
            even: [],
            odd: []
        };

        const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');
        const rangeButtons = document.querySelectorAll('.range-button');
        const oddNumbersListEl = document.getElementById('oddNumbersList');
        const evenNumbersListEl = document.getElementById('evenNumbersList');
        const directNeighborsColumnEl = document.getElementById('directNeighborsColumn');
        const evenNeighborsColumnEl = document.getElementById('evenNeighborsColumn');
        const oddNeighborsColumnEl = document.getElementById('oddNeighborsColumn');
        const globalFeedbackEl = document.getElementById('globalFeedback');

        function applyTheme(themeClass) {
            bodyEl.className = ''; 
            bodyEl.classList.add(themeClass); 
            currentTheme = themeClass;
            currentSettings.theme = themeClass;

            themeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
            rangeButtons.forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.range) === currentNumberRangeMax);
            });
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });

        rangeButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentNumberRangeMax = parseInt(button.dataset.range);
                currentSettings.numberRangeMax = currentNumberRangeMax;
                applyTheme(currentTheme); 
                updateOddEvenDisplay();
                generateAllTasks();
            });
        });
        
        function updateOddEvenDisplay() {
            oddNumbersListEl.innerHTML = '';
            evenNumbersListEl.innerHTML = '';
            for (let i = 1; i <= currentNumberRangeMax; i++) {
                const item = document.createElement('span');
                item.classList.add('number-list-item');
                item.textContent = i;
                if (i % 2 === 0) {
                    evenNumbersListEl.appendChild(item);
                } else {
                    oddNumbersListEl.appendChild(item);
                }
            }
        }

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            if (min > max) return min; 
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generateProblemHTML(idPrefix, targetNumber) {
            const problemDiv = document.createElement('div');
            problemDiv.classList.add('neighbor-problem');
            problemDiv.innerHTML = `
                <input type="number" id="${idPrefix}_before" min="0" max="${currentNumberRangeMax + 10}">
                <span class="relation-symbol">&lt;</span>
                <span class="target-number-display" id="${idPrefix}_target">${targetNumber}</span>
                <span class="relation-symbol">&lt;</span>
                <input type="number" id="${idPrefix}_after" min="0" max="${currentNumberRangeMax + 10}">
            `;
            return problemDiv;
        }
        
        function generateTasksForType(type, columnEl) {
            tasks[type] = [];
            const problemElements = columnEl.querySelectorAll('.neighbor-problem');
            problemElements.forEach(el => el.remove());

            const usedTargetNumbers = new Set();

            for (let i = 0; i < NUM_EXAMPLES_PER_TYPE; i++) {
                let targetNumber, smallerNeighbor, largerNeighbor;
                let isValidTask = false;
                let attempts = 0;
                const maxAttemptsForTargetGen = 100; // Növeltük a próbálkozások számát

                while (!isValidTask && attempts < maxAttemptsForTargetGen) {
                    targetNumber = getRandomInt(0, currentNumberRangeMax);
                    attempts++;

                    if (type === 'direct') {
                        if (currentNumberRangeMax < 2) { isValidTask = false; break; }
                        targetNumber = getRandomInt(1, currentNumberRangeMax - 1); // Cél szám 1 és max-1 között
                        smallerNeighbor = targetNumber - 1;
                        largerNeighbor = targetNumber + 1;
                        isValidTask = (smallerNeighbor >= 0 && largerNeighbor <= currentNumberRangeMax);
                    
                    } else if (type === 'even') {
                        // A cél számot úgy választjuk, hogy biztosan legyenek érvényes páros szomszédai
                        // Kerüljük a 0-t targetNumber-ként, mert a <0 reláció problémás
                        targetNumber = getRandomInt(1, currentNumberRangeMax); 

                        // Kisebb páros szomszéd
                        if (targetNumber === 1) smallerNeighbor = 0;
                        else if (targetNumber % 2 === 0) smallerNeighbor = targetNumber - 2;
                        else smallerNeighbor = targetNumber - 1;
                        
                        // Nagyobb páros szomszéd
                        if (targetNumber === currentNumberRangeMax) largerNeighbor = currentNumberRangeMax; // Ha a cél a max, a nagyobb páros is max lehet
                        else if (targetNumber === currentNumberRangeMax - 1 && currentNumberRangeMax % 2 === 0) largerNeighbor = currentNumberRangeMax; // pl. max 20, target 19 -> LN 20
                        else largerNeighbor = (targetNumber % 2 === 0) ? targetNumber + 2 : targetNumber + 1;

                        isValidTask = (smallerNeighbor >= 0 && smallerNeighbor % 2 === 0 && smallerNeighbor < targetNumber &&
                                       largerNeighbor <= currentNumberRangeMax && largerNeighbor % 2 === 0 && largerNeighbor > targetNumber &&
                                       smallerNeighbor < largerNeighbor);
                        // Ha a targetNumber 0 lenne (amit fentebb már kizártunk ennél a pontnál),
                        // akkor a smallerNeighbor < targetNumber nem teljesülne, ha sN=0.
                        // Ha currentNumberRangeMax = 0 vagy 1, és a targetNumber = 0 vagy 1, nehéz érvényes páros szomszédokat találni.
                        if (currentNumberRangeMax < 2 && (targetNumber < 2 || targetNumber > currentNumberRangeMax -2) ) isValidTask = false; // Kicsi range esetén
                        if (currentNumberRangeMax === 2 && targetNumber === 1) { // Speciális eset: 0 < 1 < 2
                             smallerNeighbor = 0; largerNeighbor = 2; isValidTask = true;
                        } else if (currentNumberRangeMax === 2 && (targetNumber === 0 || targetNumber === 2)) {
                            isValidTask = false; // Nincs két különböző páros szomszéd
                        }


                    } else { // odd
                        // Cél számot úgy választjuk, hogy legyenek érvényes páratlan szomszédai
                        // Kerüljük a 0-t és 1-et targetNumber-ként, mert a <T reláció problémás a kisebb páratlan szomszéddal
                         if (currentNumberRangeMax < 3) { isValidTask = false; break; } // Legalább 0,1,2,3 kell a _ < T < _ páratlanhoz
                        targetNumber = getRandomInt(2, currentNumberRangeMax -1); // pl. 2 és max-1 között

                        // Kisebb páratlan szomszéd
                        if (targetNumber % 2 !== 0) smallerNeighbor = targetNumber - 2;
                        else smallerNeighbor = targetNumber - 1;
                        
                        // Nagyobb páratlan szomszéd
                        if (targetNumber === currentNumberRangeMax -1 && currentNumberRangeMax % 2 !== 0) largerNeighbor = currentNumberRangeMax; // pl. max 19, target 18 -> LN 19
                        else largerNeighbor = (targetNumber % 2 !== 0) ? targetNumber + 2 : targetNumber + 1;
                        
                        isValidTask = (smallerNeighbor >= 1 && smallerNeighbor % 2 !== 0 && smallerNeighbor < targetNumber &&
                                       largerNeighbor <= currentNumberRangeMax && largerNeighbor % 2 !== 0 && largerNeighbor > targetNumber &&
                                       smallerNeighbor < largerNeighbor);

                        // Kezeljük a 19-es esetet 20-as számkörben expliciten
                        if (targetNumber === 19 && currentNumberRangeMax === 20 && type === 'odd') {
                             smallerNeighbor = 17; largerNeighbor = 19; isValidTask = true;
                        } else if (targetNumber === currentNumberRangeMax && currentNumberRangeMax % 2 !== 0 && type === 'odd') { // Ha a cél a max és páratlan
                             smallerNeighbor = targetNumber - 2; largerNeighbor = targetNumber;
                             isValidTask = smallerNeighbor >= 1 && smallerNeighbor < targetNumber;
                        }

                    }

                    if (isValidTask && usedTargetNumbers.has(targetNumber) && tasks[type].length < NUM_EXAMPLES_PER_TYPE -1) {
                        isValidTask = false; 
                    }
                } // end while

                if (!isValidTask) {
                    // Ha nem sikerült feladatot generálni, kihagyjuk ezt az iterációt.
                    // Ez akkor fordulhat elő, ha a számkör túl kicsi az adott típushoz.
                    console.warn(`Could not generate a valid task for type '${type}' after ${maxAttemptsForTargetGen} attempts. Current range: 0-${currentNumberRangeMax}. Target was: ${targetNumber}. Skipping this instance.`);
                    continue; 
                }
                
                usedTargetNumbers.add(targetNumber);
                tasks[type].push({
                    idPrefix: `${type}_task_${i}`,
                    target: targetNumber,
                    correctBefore: smallerNeighbor,
                    correctAfter: largerNeighbor
                });
                const problemEl = generateProblemHTML(`${type}_task_${i}`, targetNumber);
                columnEl.appendChild(problemEl);
            }
        }

        function generateAllTasks() {
            globalFeedbackEl.textContent = '';
            globalFeedbackEl.className = 'feedback';
            generateTasksForType('direct', directNeighborsColumnEl);
            generateTasksForType('even', evenNeighborsColumnEl);
            generateTasksForType('odd', oddNeighborsColumnEl);
        }

        function checkAllAnswers() {
            let allCorrectOverall = true;
            let correctCount = 0;
            let totalInputsChecked = 0;

            ['direct', 'even', 'odd'].forEach(type => {
                tasks[type].forEach(task => {
                    const beforeInputEl = document.getElementById(`${task.idPrefix}_before`);
                    const afterInputEl = document.getElementById(`${task.idPrefix}_after`);
                    
                    if (!beforeInputEl || !afterInputEl) return;

                    totalInputsChecked += 2; 

                    const userAnswerBeforeRaw = beforeInputEl.value.trim();
                    const userAnswerAfterRaw = afterInputEl.value.trim();
                    
                    let isBeforeCorrect = false;
                    if (userAnswerBeforeRaw === "") { 
                        if (task.correctBefore === 0 && type !== 'odd') isBeforeCorrect = true; // Párosnál és egyesnél elfogadjuk a 0-t üresen
                        else if (task.correctBefore === 1 && type === 'odd' && task.target === 0) isBeforeCorrect = true; // 0 páratlan sz. 1
                        else allCorrectOverall = false;
                    } else {
                        const userAnswerBefore = parseInt(userAnswerBeforeRaw);
                        if (!isNaN(userAnswerBefore) && userAnswerBefore === task.correctBefore) {
                            isBeforeCorrect = true;
                        } else {
                            allCorrectOverall = false;
                        }
                    }
                    beforeInputEl.style.borderColor = isBeforeCorrect ? 'green' : 'red';
                    if(isBeforeCorrect) correctCount++;


                    let isAfterCorrect = false;
                     if (userAnswerAfterRaw === "") {
                        allCorrectOverall = false; 
                    } else {
                        const userAnswerAfter = parseInt(userAnswerAfterRaw);
                        if (!isNaN(userAnswerAfter) && userAnswerAfter === task.correctAfter) {
                            isAfterCorrect = true;
                        } else {
                            allCorrectOverall = false;
                        }
                    }
                    afterInputEl.style.borderColor = isAfterCorrect ? 'green' : 'red';
                    if(isAfterCorrect) correctCount++;
                });
            });
            
            if (totalInputsChecked === 0 && NUM_EXAMPLES_PER_TYPE > 0) { 
                 globalFeedbackEl.textContent = "Nem sikerült feladatokat generálni. Próbálj másik számkört!";
                 globalFeedbackEl.className = 'feedback incorrect';
                 return;
            }
            if (totalInputsChecked === 0 && NUM_EXAMPLES_PER_TYPE === 0) { 
                 globalFeedbackEl.textContent = "Nincsenek feladatok!";
                 globalFeedbackEl.className = 'feedback incorrect';
                 return;
            }


            if (allCorrectOverall && correctCount === totalInputsChecked) {
                globalFeedbackEl.textContent = 'Minden válasz helyes! Ügyes vagy! 🎉';
                globalFeedbackEl.className = 'feedback correct';
            } else {
                globalFeedbackEl.textContent = `Összesen ${correctCount} helyes válasz a ${tasks.direct.length + tasks.even.length + tasks.odd.length} feladatból. Nézd át a pirossal jelölt válaszokat!`;
                globalFeedbackEl.className = 'feedback incorrect';
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            applyTheme(currentSettings.theme); 
            updateOddEvenDisplay(); 
            generateAllTasks();     
        });