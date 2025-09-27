const bodyEl = document.body;
        const themeSelector = document.getElementById('themeSelector');
        const helpLevelSelector = document.getElementById('helpLevelSelector');

        let currentSettings = {
            theme: 'theme-candy',
            helpLevel: 'independent'
        };

        const conversionData = {
            length: {
                units: ['m', 'dm', 'cm', 'mm'],
                factors: {
                    'm': {'dm': 10, 'cm': 100, 'mm': 1000},
                    'dm': {'m': 0.1, 'cm': 10, 'mm': 100},
                    'cm': {'m': 0.01, 'dm': 0.1, 'mm': 10},
                    'mm': {'m': 0.001, 'dm': 0.01, 'cm': 0.1}
                },
                tasks: [],
                tableElementId: 'conversionTableLength'
            },
            mass: {
                units: ['kg', 'dkg', 'g'],
                factors: {
                    'kg': {'dkg': 100, 'g': 1000},
                    'dkg': {'kg': 0.01, 'g': 10},
                    'g': {'kg': 0.001, 'dkg': 0.1}
                },
                tasks: [],
                tableElementId: 'conversionTableMass'
            },
            volume: {
                units: ['l', 'dl', 'cl', 'ml'],
                factors: {
                    'l': {'dl': 10, 'cl': 100, 'ml': 1000},
                    'dl': {'l': 0.1, 'cl': 10, 'ml': 100},
                    'cl': {'l': 0.01, 'dl': 0.1, 'ml': 10},
                    'ml': {'l': 0.001, 'dl': 0.01, 'cl': 0.1}
                },
                tasks: [],
                tableElementId: 'conversionTableVolume'
            },
            time: {
                units: ['hét', 'nap', 'óra', 'perc', 'mp'], // mp = másodperc
                factors: { // Ezt a faktort a komplexebb, nem egyirányú generáláshoz használhatnánk
                    'hét': {'nap': 7},
                    'nap': {'hét': 1/7, 'óra': 24},
                    'óra': {'nap': 1/24, 'perc': 60},
                    'perc': {'óra': 1/60, 'mp': 60},
                    'mp': {'perc': 1/60}
                },
                // Egyszerűbb, egyirányú átváltásokra korlátozzuk a 3. osztályban
                simplePairs: [
                    {from: 'hét', to: 'nap', factor: 7},
                    {from: 'nap', to: 'óra', factor: 24},
                    {from: 'óra', to: 'perc', factor: 60},
                    {from: 'perc', to: 'mp', factor: 60}
                ],
                tasks: [],
                tableElementId: 'conversionTableTime'
            }
        };

        themeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.theme = e.target.dataset.theme;
                applyThemeUI();
            }
        });

        helpLevelSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.helpLevel = e.target.dataset.help;
                updateActiveButtonVisuals(helpLevelSelector, e.target);
                toggleConversionTables();
            }
        });

        function applyThemeUI() {
            bodyEl.className = '';
            bodyEl.classList.add(currentSettings.theme);
            updateActiveButtonVisuals(themeSelector, themeSelector.querySelector(`[data-theme="${currentSettings.theme}"]`));
            updateActiveButtonVisuals(helpLevelSelector, helpLevelSelector.querySelector(`[data-help="${currentSettings.helpLevel}"]`));
        }

        function updateActiveButtonVisuals(container, activeButton) {
            if (!container || !activeButton) return;
            container.querySelectorAll('.setting-button').forEach(btn => btn.classList.remove('active'));
            activeButton.classList.add('active');
        }

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generateTasks(type) {
            const config = conversionData[type];
            config.tasks = [];
            const questionsEl = document.getElementById(`questions${type.charAt(0).toUpperCase() + type.slice(1)}`);
            const feedbackEl = document.getElementById(`feedback${type.charAt(0).toUpperCase() + type.slice(1)}`);

            questionsEl.innerHTML = '';
            feedbackEl.innerHTML = '&nbsp;';
            feedbackEl.className = 'feedback';

            const numQuestions = 8;
            const usedPairs = new Set();

            for (let i = 0; i < numQuestions; i++) {
                let fromUnit, toUnit, factor, value, expectedAnswer;
                let attempt = 0;

                do {
                    if (type === 'time') {
                        const pair = config.simplePairs[Math.floor(Math.random() * config.simplePairs.length)];
                        fromUnit = pair.from;
                        toUnit = pair.to;
                        factor = pair.factor;
                    } else {
                        fromUnit = config.units[Math.floor(Math.random() * config.units.length)];
                        do {
                            toUnit = config.units[Math.floor(Math.random() * config.units.length)];
                        } while (toUnit === fromUnit || !config.factors[fromUnit] || !config.factors[fromUnit][toUnit]);
                        factor = config.factors[fromUnit][toUnit];
                    }
                    attempt++;
                } while (usedPairs.has(`${fromUnit}-${toUnit}`) && attempt < 20);
                usedPairs.add(`${fromUnit}-${toUnit}`);


                if (type === 'time') {
                    value = getRandomInt(1, 5);
                } else if (factor > 500) { // Ha nagy az átváltási faktor (pl. m -> mm)
                    value = getRandomInt(1, 5);
                } else if (factor < 0.05) { // Ha kicsi az átváltási faktor (pl. mm -> m)
                    value = getRandomInt(100, 5000);
                     if(value % (1/factor) !== 0 && factor !==0 ) { // ensure whole number result for small factors
                         value = Math.round(value / (1/factor)) * (1/factor);
                         if (value === 0 && getRandomInt(1,2)===1) value = 1/factor; // Avoid 0 if possible
                    }
                     if (value === 0 && type !== 'time') value = getRandomInt(1,5) * (1/factor);

                } else {
                    value = getRandomInt(1, 20);
                }
                 // Ensure value is not 0 for non-time, or if it is, try once more to get non-zero
                if (value === 0 && type !== 'time') {
                    value = getRandomInt(1, 5);
                     if (factor < 0.05 && factor !== 0) value = value * (1/factor);
                }


                expectedAnswer = value * factor;
                if (!Number.isInteger(expectedAnswer)) {
                    if (Math.abs(expectedAnswer - Math.round(expectedAnswer)) < 0.00001) {
                        expectedAnswer = Math.round(expectedAnswer);
                    } else {
                        if (factor === 0.1 || factor === 0.01 || factor === 0.001) {
                             expectedAnswer = parseFloat(expectedAnswer.toPrecision(10)); 
                        } else {
                            expectedAnswer = parseFloat(expectedAnswer.toFixed(3));
                        }
                    }
                }


                config.tasks.push({
                    id: `${type}_q_${i}`,
                    fromUnit: fromUnit,
                    toUnit: toUnit,
                    value: value,
                    expectedAnswer: expectedAnswer
                });

                const item = document.createElement('div');
                item.classList.add('question-item');
                // Updated HTML structure for the question item
                item.innerHTML = `
                    <span class="prompt">${value} ${fromUnit} = </span>
                    <input type="number" id="${type}_q_${i}" step="any">
                    <span class="unit-suffix">${toUnit}</span>
                `;
                questionsEl.appendChild(item);
            }
        }

        function checkAnswers(type) {
            const config = conversionData[type];
            const feedbackEl = document.getElementById(`feedback${type.charAt(0).toUpperCase() + type.slice(1)}`);
            let allCorrect = true;
            let correctCount = 0;
            const totalTasks = config.tasks.length;

            if (totalTasks === 0) {
                feedbackEl.textContent = 'Nincsenek még feladatok. Kattints az "Új feladatok" gombra!';
                feedbackEl.className = 'feedback incorrect';
                return;
            }

            config.tasks.forEach(task => {
                const inputEl = document.getElementById(task.id);
                const userAnswerRaw = inputEl.value.trim().replace(',', '.');
                const userAnswer = parseFloat(userAnswerRaw);

                if (userAnswerRaw === "" || isNaN(userAnswer)) {
                    inputEl.style.borderColor = 'red';
                    allCorrect = false;
                } else {
                    const tolerance = 0.001;
                    if (Math.abs(userAnswer - task.expectedAnswer) < tolerance) {
                        inputEl.style.borderColor = 'green';
                        correctCount++;
                    } else {
                        inputEl.style.borderColor = 'red';
                        allCorrect = false;
                    }
                }
            });

            if (allCorrect) {
                feedbackEl.textContent = 'Minden válasz helyes! Ügyes vagy! 🎉';
                feedbackEl.className = 'feedback correct';
            } else {
                feedbackEl.textContent = `Összesen ${correctCount} helyes válasz a ${totalTasks}-ból. Nézd át a pirossal jelölt válaszokat!`;
                feedbackEl.className = 'feedback incorrect';
            }
        }

        function toggleConversionTables() {
            Object.keys(conversionData).forEach(type => {
                const tableContainerId = conversionData[type].tableElementId;
                const tableContainer = document.getElementById(tableContainerId);
                if (tableContainer) {
                    if (currentSettings.helpLevel === 'assisted') {
                        tableContainer.classList.add('visible');
                    } else {
                        tableContainer.classList.remove('visible');
                    }
                }
            });
        }


        document.addEventListener('DOMContentLoaded', () => {
            applyThemeUI();
            Object.keys(conversionData).forEach(type => generateTasks(type));
            toggleConversionTables();
        });