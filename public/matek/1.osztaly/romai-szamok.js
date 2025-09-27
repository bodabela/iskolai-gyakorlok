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
            theme: 'theme-candy',
            numberRangeMax: 10 // Alapértelmezett számkör (max érték)
        };

        let currentArabicToRomanTasks = [];
        let currentRomanToArabicTasks = [];

        const romanMap = [
            // Csökkentett map a kisebb számkörökhöz, de a függvények a teljeset használhatják
            // A generálás korlátozza a számokat, nem a konverziós logika
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
            if (tempRoman.length > 0 || (result > 0 && toRoman(result) !== roman)) return NaN;
            if (result === 0 && roman !== "") return NaN;

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
            bodyEl.className = '';
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
            const minRange = 1;
            let attempts = 0;

            const maxPossibleUniqueNumbers = currentSettings.numberRangeMax - minRange + 1;
            const numbersToGenerate = Math.min(8, maxPossibleUniqueNumbers);

            if (numbersToGenerate <= 0) { // Ha a számkör 0 vagy negatív (pl. max 0)
                 questionsArabicToRomanEl.innerHTML = '<p style="text-align:center; width:100%;">Nincs generálható szám ebben a tartományban.</p>';
                 return;
            }

            while(generatedNumbers.size < numbersToGenerate && attempts < 100) {
                 generatedNumbers.add(getRandomInt(minRange, currentSettings.numberRangeMax));
                 attempts++;
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
             if (currentArabicToRomanTasks.length === 0 && numbersToGenerate > 0) { // Ha mégsem sikerült generálni, bár kellett volna
                 questionsArabicToRomanEl.innerHTML = '<p style="text-align:center; width:100%;">Hiba történt a feladat generálásakor.</p>';
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
            let attempts = 0;

            const maxPossibleUniqueNumbers = currentSettings.numberRangeMax - minRange + 1;
            const numbersToGenerate = Math.min(8, maxPossibleUniqueNumbers);

            if (numbersToGenerate <= 0) {
                 questionsRomanToArabicEl.innerHTML = '<p style="text-align:center; width:100%;">Nincs generálható római szám ebben a tartományban.</p>';
                 return;
            }

            while(generatedRomans.size < numbersToGenerate && attempts < 200) {
                const arabicNum = getRandomInt(minRange, currentSettings.numberRangeMax);
                if (!generatedArabicEquivalents.has(arabicNum)) {
                    const romanNum = toRoman(arabicNum);
                    if (romanNum !== "Hiba" && !generatedRomans.has(romanNum) && fromRoman(romanNum) === arabicNum) {
                        generatedRomans.add(romanNum);
                        generatedArabicEquivalents.add(arabicNum);
                    }
                }
                attempts++;
            }

            Array.from(generatedRomans).sort((a,b) => fromRoman(a) - fromRoman(b)).forEach((romanNum, index) => {
                const inputId = `rta_ans_${index}`;
                const arabicEquivalent = fromRoman(romanNum);
                currentRomanToArabicTasks.push({
                    roman: romanNum,
                    arabic: arabicEquivalent,
                    inputId: inputId
                });

                const item = document.createElement('div');
                item.classList.add('question-item');
                item.innerHTML = `
                    <span class="prompt">${romanNum} = </span>
                    <input type="number" id="${inputId}" min="1" max="3999">
                `;
                questionsRomanToArabicEl.appendChild(item);
            });
            if (currentRomanToArabicTasks.length === 0 && numbersToGenerate > 0) {
                 questionsRomanToArabicEl.innerHTML = '<p style="text-align:center; width:100%;">Hiba történt a feladat generálásakor.</p>';
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
            } else { // romanToArabic
                tasks = currentRomanToArabicTasks;
                feedbackEl = feedbackRomanToArabicEl;
            }

            if (!tasks || tasks.length === 0) {
                feedbackEl.textContent = 'Nincsenek még feladatok. Válassz számkört és kattints az "Új feladatok" gombra!';
                feedbackEl.className = 'feedback incorrect';
                return;
            }
            const totalTasks = tasks.length;

            tasks.forEach(task => {
                const inputEl = document.getElementById(task.inputId);
                let isCurrentTaskCorrect = false;
                if (mode === 'arabicToRoman') {
                    const userAnswer = inputEl.value.toUpperCase().trim();
                    if (userAnswer === task.roman) {
                        isCurrentTaskCorrect = true;
                    }
                } else { // romanToArabic
                    const userAnswer = parseInt(inputEl.value);
                    if (!isNaN(userAnswer) && userAnswer === task.arabic) { // Ellenőrizzük, hogy szám-e
                         isCurrentTaskCorrect = true;
                    }
                }

                if (isCurrentTaskCorrect) {
                    inputEl.style.borderColor = 'green';
                    correctCount++;
                } else {
                    inputEl.style.borderColor = 'red';
                    allCorrect = false;
                }
            });

            if (allCorrect && totalTasks > 0) {
                feedbackEl.textContent = 'Minden válasz helyes! Ügyes vagy! 🎉';
                feedbackEl.className = 'feedback correct';
            } else if (totalTasks > 0) {
                feedbackEl.textContent = `Összesen ${correctCount} helyes válasz a ${totalTasks}-ból. Nézd át a pirossal jelölt válaszokat!`;
                feedbackEl.className = 'feedback incorrect';
            } else {
                 feedbackEl.textContent = 'Nincsenek még feladatok. Próbálj másik számkört, vagy generálj újakat!';
                 feedbackEl.className = 'feedback incorrect';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            currentSettings.numberRangeMax = 10; // Új alapértelmezett
            applyThemeUI();
            generateNewTasks();
        });