const themeSelector = document.getElementById('themeSelector');
        const rangeSelector = document.getElementById('rangeSelector');
        const bodyEl = document.body;

        const questionsArabicToRomanEl = document.getElementById('questionsArabicToRoman');
        const questionsRomanToArabicEl = document.getElementById('questionsRomanToArabic');
        const feedbackArabicToRomanEl = document.getElementById('feedbackArabicToRoman');
        const feedbackRomanToArabicEl = document.getElementById('feedbackRomanToArabic');
        const instructionsArabicToRomanEl = document.getElementById('instructionsArabicToRoman');
        const instructionsRomanToArabicEl = document.getElementById('instructionsRomanToArabic');


        let currentSettings = {
            theme: 'theme-candy', // Alap téma
            numberRangeMax: 20    // Alapértelmezett számkör (max érték)
        };

        let currentArabicToRomanTasks = [];
        let currentRomanToArabicTasks = [];

        const romanMap = [
            { value: 1000, numeral: 'M' }, { value: 900, numeral: 'CM' },
            { value: 500, numeral: 'D' },  { value: 400, numeral: 'CD' },
            { value: 100, numeral: 'C' },  { value: 90, numeral: 'XC' },
            { value: 50, numeral: 'L' },   { value: 40, numeral: 'XL' },
            { value: 10, numeral: 'X' },   { value: 9, numeral: 'IX' },
            { value: 5, numeral: 'V' },    { value: 4, numeral: 'IV' },
            { value: 1, numeral: 'I' }
        ];
        const romanRegexStrict = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;


        function toRoman(num) {
            if (num < 1 || num > 3999) return "Hiba";
            let roman = '';
            for (let i = 0; i < romanMap.length; i++) {
                while (num >= romanMap[i].value) {
                    roman += romanMap[i].numeral;
                    num -= romanMap[i].value;
                }
            }
            return roman;
        }

        function fromRoman(roman) {
            roman = roman.toUpperCase();
            if (!romanRegexStrict.test(roman) && roman !== "") return NaN;

            let result = 0;
            let tempRoman = roman;

            for (const pair of romanMap) {
                while (tempRoman.startsWith(pair.numeral)) {
                    result += pair.value;
                    tempRoman = tempRoman.substring(pair.numeral.length);
                }
            }
             // Kanonikus forma ellenőrzése
            if (tempRoman.length > 0 || (result > 0 && toRoman(result) !== roman)) return NaN;
            if (result === 0 && roman !== "") return NaN; // Üres string 0, de pl. "ZERO" nem valid

            return result;
        }


        themeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.theme = e.target.dataset.theme;
                applyThemeUI();
            }
        });

        rangeSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('setting-button')) {
                currentSettings.numberRangeMax = parseInt(e.target.dataset.range);
                updateActiveButtonVisuals(rangeSelector, e.target);
                generateNewTasks();
            }
        });

        document.getElementById('newTaskArabicToRoman').addEventListener('click', generateArabicToRomanTasks);
        document.getElementById('checkArabicToRoman').addEventListener('click', () => checkAnswers('arabicToRoman'));
        document.getElementById('newTaskRomanToArabic').addEventListener('click', generateRomanToArabicTasks);
        document.getElementById('checkRomanToArabic').addEventListener('click', () => checkAnswers('romanToArabic'));


        function applyThemeUI() {
            bodyEl.className = ''; // Előző téma eltávolítása
            bodyEl.classList.add(currentSettings.theme);
            updateActiveButtonVisuals(themeSelector, themeSelector.querySelector(`[data-theme="${currentSettings.theme}"]`));
            updateActiveButtonVisuals(rangeSelector, rangeSelector.querySelector(`[data-range="${currentSettings.numberRangeMax}"]`));
        }

        function updateActiveButtonVisuals(container, activeButton) {
            if (!container || !activeButton) return;
            container.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            activeButton.classList.add('active');
        }

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function updateInstructionsText() {
            const rangeText = `(1-${currentSettings.numberRangeMax} között)`;
            instructionsArabicToRomanEl.textContent = `Írd át az arab számokat római számmá! ${rangeText}`;
            instructionsRomanToArabicEl.textContent = `Írd át a római számokat arab számmá! ${rangeText}`;
        }

        function generateArabicToRomanTasks() {
            currentArabicToRomanTasks = [];
            questionsArabicToRomanEl.innerHTML = '';
            feedbackArabicToRomanEl.innerHTML = '&nbsp;';
            feedbackArabicToRomanEl.className = 'feedback';
            const generatedNumbers = new Set();

            // Kerüljük a 0-t, ha véletlenül a getRandomInt(0, max) lenne
            const minRange = 1;

            while(generatedNumbers.size < 8 && generatedNumbers.size < (currentSettings.numberRangeMax - minRange + 1)) {
                 generatedNumbers.add(getRandomInt(minRange, currentSettings.numberRangeMax));
            }
             if (generatedNumbers.size === 0 && currentSettings.numberRangeMax > 0) { // Ha a range 1, akkor is legyen 1 feladat
                generatedNumbers.add(1);
            }


            Array.from(generatedNumbers).sort((a,b) => a-b).forEach((num, index) => {
                const inputId = `atr_ans_${index}`;
                currentArabicToRomanTasks.push({
                    arabic: num,
                    roman: toRoman(num),
                    inputId: inputId
                });

                const item = document.createElement('div');
                item.classList.add('question-item');
                item.innerHTML = `
                    <span class="prompt">${num} = </span>
                    <input type="text" id="${inputId}" maxlength="15">
                `;
                questionsArabicToRomanEl.appendChild(item);
            });
            if (generatedNumbers.size === 0) {
                 questionsArabicToRomanEl.innerHTML = '<p style="text-align:center; width:100%;">Nincs generálható szám ebben a tartományban.</p>';
            }
        }

        function generateRomanToArabicTasks() {
            currentRomanToArabicTasks = [];
            questionsRomanToArabicEl.innerHTML = '';
            feedbackRomanToArabicEl.innerHTML = '&nbsp;';
            feedbackRomanToArabicEl.className = 'feedback';
            const generatedRomans = new Set();
            const generatedArabicEquivalents = new Set();
            const minRange = 1;

            let attempts = 0; // Ciklusmegszakító
            while(generatedRomans.size < 8 && generatedRomans.size < (currentSettings.numberRangeMax - minRange +1) && attempts < 1000) {
                const arabicNum = getRandomInt(minRange, currentSettings.numberRangeMax);
                if (!generatedArabicEquivalents.has(arabicNum)) {
                    const romanNum = toRoman(arabicNum);
                    if (romanNum !== "Hiba" && fromRoman(romanNum) === arabicNum) {
                        generatedRomans.add(romanNum);
                        generatedArabicEquivalents.add(arabicNum);
                    }
                }
                attempts++;
            }
            if (generatedRomans.size === 0 && currentSettings.numberRangeMax > 0) {
                 const r = toRoman(1);
                 generatedRomans.add(r);
                 generatedArabicEquivalents.add(1);
            }


            Array.from(generatedRomans).sort((a,b) => fromRoman(a) - fromRoman(b)).forEach((romanNum, index) => {
                const inputId = `rta_ans_${index}`;
                currentRomanToArabicTasks.push({
                    roman: romanNum,
                    arabic: fromRoman(romanNum),
                    inputId: inputId
                });

                const item = document.createElement('div');
                item.classList.add('question-item');
                item.innerHTML = `
                    <span class="prompt">${romanNum} = </span>
                    <input type="number" id="${inputId}" min="1" max="3999">
                `; // Max 3999, mert az M-et is tudnia kell kezelni
                questionsRomanToArabicEl.appendChild(item);
            });
             if (generatedRomans.size === 0) {
                 questionsRomanToArabicEl.innerHTML = '<p style="text-align:center; width:100%;">Nincs generálható római szám ebben a tartományban.</p>';
            }
        }

        function generateNewTasks() {
            updateInstructionsText();
            generateArabicToRomanTasks();
            generateRomanToArabicTasks();
        }

        function checkAnswers(mode) {
            let tasks, feedbackEl;
            let allCorrect = true;
            let correctCount = 0;


            if (mode === 'arabicToRoman') {
                tasks = currentArabicToRomanTasks;
                feedbackEl = feedbackArabicToRomanEl;
                if (tasks.length === 0) {
                    feedbackEl.textContent = 'Nincsenek még feladatok. Válassz számkört!';
                    feedbackEl.className = 'feedback incorrect';
                    return;
                }
                tasks.forEach(task => {
                    const inputEl = document.getElementById(task.inputId);
                    const userAnswer = inputEl.value.toUpperCase().trim();
                    if (userAnswer === task.roman) {
                        inputEl.style.borderColor = 'green';
                        correctCount++;
                    } else {
                        inputEl.style.borderColor = 'red';
                        allCorrect = false;
                    }
                });
            } else { // romanToArabic
                tasks = currentRomanToArabicTasks;
                feedbackEl = feedbackRomanToArabicEl;
                 if (tasks.length === 0) {
                    feedbackEl.textContent = 'Nincsenek még feladatok. Válassz számkört!';
                    feedbackEl.className = 'feedback incorrect';
                    return;
                }
                tasks.forEach(task => {
                    const inputEl = document.getElementById(task.inputId);
                    const userAnswer = parseInt(inputEl.value); // NaN lesz, ha üres vagy nem szám
                    if (userAnswer === task.arabic) {
                        inputEl.style.borderColor = 'green';
                        correctCount++;
                    } else {
                        inputEl.style.borderColor = 'red';
                        allCorrect = false;
                    }
                });
            }
             const totalTasks = tasks.length;
             if (totalTasks === 0) { // Ha valamiért mégis 0 lenne a taskok száma
                feedbackEl.textContent = 'Nincsenek még feladatok. Kattints az "Új feladatok" gombra!';
                feedbackEl.className = 'feedback incorrect';
                return;
            }


            if (allCorrect) {
                feedbackEl.textContent = 'Minden válasz helyes! Ügyes vagy! 🎉';
                feedbackEl.className = 'feedback correct';
            } else {
                feedbackEl.textContent = `Összesen ${correctCount} helyes válasz a ${totalTasks}-ból. Nézd át a pirossal jelölt válaszokat!`;
                feedbackEl.className = 'feedback incorrect';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            applyThemeUI(); // Alkalmazza az alapértelmezett témát és a range gomb aktív állapotát
            generateNewTasks(); // Generálja az első feladatsorokat
        });