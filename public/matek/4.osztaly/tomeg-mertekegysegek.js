document.addEventListener('DOMContentLoaded', () => {
    // Inicializálás
    try {
        if (typeof initializeFirebaseAndLogger === 'function') {
            initializeFirebaseAndLogger();
            logTaskEntry('Tömegmérés - 4. Osztály');
        }
    } catch (e) { console.error('Firebase hiba:', e); }

    // Téma kezelés
    const themeButtons = document.querySelectorAll('.theme-button');
    
    function setTheme(theme) {
        document.body.className = 'theme-' + theme;
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        localStorage.setItem('tomegMertekegysegekTheme', theme);
    }

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });
    
    // Téma betöltése mentésből vagy alapértelmezett
    const savedTheme = localStorage.getItem('tomegMertekegysegekTheme') || 'candy';
    setTheme(savedTheme);

    // Globális változók a feladatokhoz
    let conversionTasks = [];
    let missingTasks = [];
    let sequenceTasks = [];
    let comparisonTasks = [];

    // --- Segédfüggvények ---
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function autoFocusNext(currentInput) {
        const isSelect = currentInput.tagName === 'SELECT';
        const maxLength = parseInt(currentInput.getAttribute('maxlength'));
        const currentLength = currentInput.value ? currentInput.value.length : 0;
        
        if (isSelect || currentLength >= maxLength) {
            const inputs = Array.from(document.querySelectorAll('input:not([disabled]), select:not([disabled])'));
            const index = inputs.indexOf(currentInput);
            if (index > -1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    }

    // --- 1. Feladat: Átváltások (Mixed Units) ---
    // Pl: 3 kg 8 dkg = ... dkg
    // Vagy: 1 kg = ... dkg
    // Vagy: fél kg = ... g

    window.generateConversionTask = function() {
        const container = document.getElementById('conversion-container');
        container.innerHTML = '';
        document.getElementById('feedback-conversion').innerHTML = '&nbsp;';
        conversionTasks = [];

        const taskCount = 6;
        
        for (let i = 0; i < taskCount; i++) {
            let task = {};
            const isLeftColumn = (i % 2 === 0);

            if (isLeftColumn) {
                // Bal oszlop: Egyszerű átváltások vagy törtek
                if (Math.random() < 0.4) {
                    const val = getRandomInt(1, 10);
                    const target = Math.random() > 0.5 ? 'dkg' : 'g';
                    task = {
                        question: `${val} kg`,
                        targetUnit: target,
                        answer: target === 'dkg' ? val * 100 : val * 1000
                    };
                } else {
                    const fractions = [
                        { label: 'fél kg', g: 500, dkg: 50 },
                        { label: 'negyed kg', g: 250, dkg: 25 },
                        { label: 'háromnegyed kg', g: 750, dkg: 75 },
                        { label: 'fél t', kg: 500 }
                    ];
                    const pick = fractions[getRandomInt(0, fractions.length - 1)];
                    const target = pick.kg ? 'kg' : (Math.random() > 0.5 ? 'g' : 'dkg');
                    task = {
                        question: pick.label,
                        targetUnit: target,
                        answer: pick[target]
                    };
                }
            } else {
                // Jobb oszlop: Összetett átváltások (pl. 6kg 40dkg = ? g)
                const kg = getRandomInt(1, 6);
                const dkg = getRandomInt(1, 9) * 10;
                const target = Math.random() > 0.5 ? 'dkg' : 'g';
                const ans = target === 'dkg' ? (kg * 100) + dkg : (kg * 1000) + (dkg * 10);
                
                task = {
                    question: `${kg} kg ${dkg} dkg`,
                    targetUnit: target,
                    answer: ans
                };
            }

            conversionTasks.push(task);

            const div = document.createElement('div');
            div.className = 'question-row';
            
            const answerLength = task.answer.toString().length;

            div.innerHTML = `
                <span>${task.question} = </span>
                <input type="text" 
                       id="conv-${i}" 
                       maxlength="${answerLength}"
                       oninput="this.value = this.value.replace(/[^0-9]/g, ''); autoFocusNext(this)">
                <span>${task.targetUnit}</span>
            `;
            
            // Helper for auto-focus defined above needs to be attached to window or scope
            div.querySelector('input').addEventListener('input', function() { autoFocusNext(this); });
            
            container.appendChild(div);
        }

        if (typeof logNewTask === 'function') logNewTask('Tömeg átváltás', { count: taskCount });
    };

    window.checkConversionTask = function() {
        let correct = 0;
        conversionTasks.forEach((task, i) => {
            const input = document.getElementById(`conv-${i}`);
            const val = parseInt(input.value);
            if (val === task.answer) {
                input.classList.add('correct');
                input.classList.remove('incorrect');
                correct++;
            } else {
                input.classList.add('incorrect');
                input.classList.remove('correct');
            }
        });
        updateFeedback('feedback-conversion', correct, conversionTasks.length);
        if (typeof logTaskCheck === 'function') logTaskCheck('Tömeg átváltás', { correct, total: conversionTasks.length });
    };

    // --- 2. Feladat: Pótlás (Equations) ---
    // Pl: 1 kg + ... dkg = 3 kg
    // Pl: 3 kg - ... dkg = 240 dkg

    window.generateMissingTask = function() {
        const container = document.getElementById('missing-container');
        container.innerHTML = '';
        document.getElementById('feedback-missing').innerHTML = '&nbsp;';
        missingTasks = [];

        const taskCount = 6;

        for (let i = 0; i < taskCount; i++) {
            let task = {};
            const isAddition = Math.random() > 0.5;

            if (isAddition) {
                // A + ? = C
                // 1 kg + ? dkg = 3 kg  -> 100dkg + ? = 300dkg -> ? = 200
                const startKg = getRandomInt(1, 4);
                const endKg = startKg + getRandomInt(1, 2);
                const diffDkg = (endKg - startKg) * 100;
                
                // Néha kg-ban adjuk meg az elejét, néha dkg-ban
                const startLabel = `${startKg} kg`;
                const endLabel = `${endKg} kg`;
                
                task = {
                    pre: `${startLabel} + `,
                    unit: 'dkg',
                    post: ` = ${endLabel}`,
                    answer: diffDkg
                };
            } else {
                // A - ? = C
                // 3 kg - ? dkg = 240 dkg
                const startKg = getRandomInt(2, 5);
                const subtractDkg = getRandomInt(1, 9) * 10; // 10..90
                const resultDkg = (startKg * 100) - subtractDkg;

                task = {
                    pre: `${startKg} kg - `,
                    unit: 'dkg',
                    post: ` = ${resultDkg} dkg`,
                    answer: subtractDkg
                };
            }

            missingTasks.push(task);

            const div = document.createElement('div');
            div.className = 'question-row';
            const answerLength = task.answer.toString().length;

            div.innerHTML = `
                <span>${task.pre}</span>
                <input type="text" 
                       id="miss-${i}" 
                       maxlength="${answerLength}"
                       oninput="this.value = this.value.replace(/[^0-9]/g, '');">
                <span>${task.unit}${task.post}</span>
            `;
             div.querySelector('input').addEventListener('input', function() { autoFocusNext(this); });
            container.appendChild(div);
        }
         if (typeof logNewTask === 'function') logNewTask('Tömeg pótlás', { count: taskCount });
    };

    window.checkMissingTask = function() {
        let correct = 0;
        missingTasks.forEach((task, i) => {
            const input = document.getElementById(`miss-${i}`);
            const val = parseInt(input.value);
            if (val === task.answer) {
                input.classList.add('correct');
                input.classList.remove('incorrect');
                correct++;
            } else {
                input.classList.add('incorrect');
                input.classList.remove('correct');
            }
        });
        updateFeedback('feedback-missing', correct, missingTasks.length);
        if (typeof logTaskCheck === 'function') logTaskCheck('Tömeg pótlás', { correct, total: missingTasks.length });
    };

    // --- 3. Feladat: Sorozatok ---
    // Pl: 30 dkg -> 90 dkg -> 1 kg 50 dkg ...

    function formatMassForSequence(valDkg) {
        // Véletlenszerű formázás: csak dkg, vagy kg+dkg
        const kg = Math.floor(valDkg / 100);
        const rem = valDkg % 100;
        
        const options = [];
        // 1. Csak dkg
        options.push(`${valDkg} dkg`);
        
        // 2. Vegyes vagy tiszta kg
        if (kg > 0) {
            if (rem === 0) {
                options.push(`${kg} kg`);
            } else {
                options.push(`${kg} kg ${rem} dkg`);
            }
        }
        
        return options[getRandomInt(0, options.length - 1)];
    }

    window.generateSequenceTask = function() {
        const container = document.getElementById('sequence-container');
        container.innerHTML = '';
        document.getElementById('feedback-sequence').innerHTML = '&nbsp;';
        sequenceTasks = [];

        const taskCount = 4;

        for (let i = 0; i < taskCount; i++) {
            // Generálunk egy sorozatot
            // Start: 20..800 dkg
            let start = getRandomInt(2, 80) * 10;
            // Lépésköz: +/- 10..150 dkg
            let step = getRandomInt(1, 15) * 10;
            if (Math.random() > 0.5) step *= -1;

            // Ha negatív a lépés, legyen elég nagy a start, hogy ne menjen 0 alá a 6. elem se
            if (step < 0) {
                start = Math.max(start, Math.abs(step) * 6 + 50);
            }

            let current = start;
            let sequenceHTML = '';

            // 4 elem generálása
            for(let k=0; k<4; k++) {
                sequenceHTML += `<span>${formatMassForSequence(current)}</span>`;
                sequenceHTML += '<span class="sequence-arrow">➜</span>';
                current += step;
            }

            // A következő két elem az elvárt válasz
            const ans1 = current;
            const ans2 = current + step;

            sequenceTasks.push({ ans1, ans2 });

            const div = document.createElement('div');
            div.className = 'question-row sequence-row';
            
            div.innerHTML = `
                <div class="sequence-terms">${sequenceHTML} ...</div>
                <div class="sequence-inputs">
                    <div class="sequence-input-group">
                        <input type="text" id="seq-${i}-1-kg" oninput="this.value = this.value.replace(/[^0-9]/g, ''); autoFocusNext(this)"> kg
                        <input type="text" id="seq-${i}-1-dkg" oninput="this.value = this.value.replace(/[^0-9]/g, ''); autoFocusNext(this)"> dkg
                    </div>
                    <div class="sequence-input-group">
                        <input type="text" id="seq-${i}-2-kg" oninput="this.value = this.value.replace(/[^0-9]/g, ''); autoFocusNext(this)"> kg
                        <input type="text" id="seq-${i}-2-dkg" oninput="this.value = this.value.replace(/[^0-9]/g, ''); autoFocusNext(this)"> dkg
                    </div>
                </div>
            `;
            div.querySelectorAll('input').forEach(inp => {
                inp.addEventListener('input', function() { autoFocusNext(this); });
            });
            container.appendChild(div);
        }
        if (typeof logNewTask === 'function') logNewTask('Tömeg sorozatok', { count: taskCount });
    };

    window.checkSequenceTask = function() {
        let correct = 0;
        sequenceTasks.forEach((task, i) => {
            // 1. válasz ellenőrzése
            const kg1 = parseInt(document.getElementById(`seq-${i}-1-kg`).value) || 0;
            const dkg1 = parseInt(document.getElementById(`seq-${i}-1-dkg`).value) || 0;
            const userVal1 = kg1 * 100 + dkg1;

            // 2. válasz ellenőrzése
            const kg2 = parseInt(document.getElementById(`seq-${i}-2-kg`).value) || 0;
            const dkg2 = parseInt(document.getElementById(`seq-${i}-2-dkg`).value) || 0;
            const userVal2 = kg2 * 100 + dkg2;

            const inputs = [
                document.getElementById(`seq-${i}-1-kg`),
                document.getElementById(`seq-${i}-1-dkg`),
                document.getElementById(`seq-${i}-2-kg`),
                document.getElementById(`seq-${i}-2-dkg`)
            ];

            const isCorrect1 = (userVal1 === task.ans1);
            const isCorrect2 = (userVal2 === task.ans2);

            if (isCorrect1 && isCorrect2) {
                inputs.forEach(inp => {
                    inp.classList.add('correct');
                    inp.classList.remove('incorrect');
                });
                correct++;
            } else {
                inputs.forEach(inp => {
                    inp.classList.add('incorrect');
                    inp.classList.remove('correct');
                });
            }
        });
        updateFeedback('feedback-sequence', correct, sequenceTasks.length);
        if (typeof logTaskCheck === 'function') logTaskCheck('Tömeg sorozatok', { correct, total: sequenceTasks.length });
    };

    // --- 4. Feladat: Összehasonlítás ---
    // Pl: 4 kg ... 40 dkg

    window.generateComparisonTask = function() {
        const container = document.getElementById('comparison-container');
        container.innerHTML = '';
        document.getElementById('feedback-comparison').innerHTML = '&nbsp;';
        comparisonTasks = [];

        const taskCount = 6;

        for (let i = 0; i < taskCount; i++) {
            // Generálunk két oldalt (left, right) dkg-ban, aztán formázzuk
            let leftValDkg, rightValDkg;
            let leftLabel, rightLabel;

            const type = getRandomInt(1, 3);
            
            if (type === 1) {
                // kg vs dkg
                const kg = getRandomInt(1, 5);
                leftValDkg = kg * 100;
                leftLabel = `${kg} kg`;
                
                // Jobb oldal kicsit eltér vagy egyenlő
                const offset = getRandomInt(-1, 1) * 10; // -10, 0, +10 dkg differencia
                rightValDkg = leftValDkg + offset;
                
                // Ha negatív lenne (nem szabadna), korrigálunk
                if (rightValDkg <= 0) rightValDkg = 10;

                rightLabel = `${rightValDkg} dkg`;
            } else if (type === 2) {
                // dkg vs g
                const dkg = getRandomInt(10, 50);
                leftValDkg = dkg;
                leftLabel = `${dkg} dkg`;

                const offset = getRandomInt(-1, 1) * 100; // g-ban
                const rightValG = (dkg * 10) + offset;
                rightValDkg = rightValG / 10; 
                rightLabel = `${rightValG} g`;
            } else {
                 // kg vs g
                 const kg = getRandomInt(1, 3);
                 leftValDkg = kg * 100;
                 leftLabel = `${kg} kg`;
                 
                 const offset = getRandomInt(-1, 1) * 100;
                 const rightValG = (kg * 1000) + offset;
                 rightValDkg = rightValG / 10;
                 rightLabel = `${rightValG} g`;
            }

            let sign = '=';
            if (leftValDkg > rightValDkg) sign = '>';
            if (leftValDkg < rightValDkg) sign = '<';

            comparisonTasks.push({ sign });

            const div = document.createElement('div');
            div.className = 'question-row';
            div.style.justifyContent = 'center';
            
            div.innerHTML = `
                <span style="flex: 1; text-align: right;">${leftLabel}</span>
                <select id="comp-${i}" 
                       class="task-select"
                       style="width: 70px; margin: 0 10px;"
                       onchange="autoFocusNext(this)">
                    <option value="" disabled selected></option>
                    <option value="&gt;">&gt;</option>
                    <option value="=">=</option>
                    <option value="&lt;">&lt;</option>
                </select>
                <span style="flex: 1; text-align: left;">${rightLabel}</span>
            `;
            container.appendChild(div);
        }
         if (typeof logNewTask === 'function') logNewTask('Tömeg összehasonlítás', { count: taskCount });
    };

    window.checkComparisonTask = function() {
        let correct = 0;
        comparisonTasks.forEach((task, i) => {
            const input = document.getElementById(`comp-${i}`);
            const val = input.value.trim();
            if (val === task.sign) {
                input.classList.add('correct');
                input.classList.remove('incorrect');
                correct++;
            } else {
                input.classList.add('incorrect');
                input.classList.remove('correct');
            }
        });
        updateFeedback('feedback-comparison', correct, comparisonTasks.length);
        if (typeof logTaskCheck === 'function') logTaskCheck('Tömeg összehasonlítás', { correct, total: comparisonTasks.length });
    };

    function updateFeedback(elementId, correct, total) {
        const el = document.getElementById(elementId);
        if (correct === total) {
            el.textContent = 'Minden válasz helyes! Ügyes vagy! 🎉';
            el.style.color = '#27ae60';
        } else {
            el.textContent = `Helyes válaszok: ${correct} / ${total}. Próbáld újra a hibásakat!`;
            el.style.color = '#c0392b';
        }
    }
    // --- 5. Feladat: Egyenlőtlenség ---
    // Pl: 1 t > [] + 200 kg > fél t

    window.generateInequalityTask = function() {
        const container = document.getElementById('inequality-container');
        container.innerHTML = '';
        document.getElementById('feedback-inequality').innerHTML = '&nbsp;';
        inequalityTasks = [];

        const taskCount = 4;

        for (let i = 0; i < taskCount; i++) {
            const type = getRandomInt(1, 2); // 1: kg-dkg, 2: t-kg
            let unit, subUnit, factor, minVal, maxVal, offset;
            
            if (type === 1) { // kg - dkg
                 unit = 'kg'; subUnit = 'dkg'; factor = 100;
                 minVal = 200; maxVal = 500; 
                 offset = getRandomInt(1, 8) * 10;
            } else { // t - kg
                 unit = 't'; subUnit = 'kg'; factor = 1000;
                 minVal = 2000; maxVal = 5000;
                 offset = getRandomInt(1, 8) * 100;
            }

            let valA = Math.round(getRandomInt(minVal, maxVal) / 50) * 50;
            let valC = Math.round(getRandomInt(minVal, maxVal) / 50) * 50;
            
            // Ensure sufficient gap
            while (Math.abs(valA - valC) < offset * 2 + 100) {
                 valA = Math.round(getRandomInt(minVal, maxVal) / 50) * 50;
                 valC = Math.round(getRandomInt(minVal, maxVal) / 50) * 50;
            }
            
            let rel = '>';
            let leftVal = Math.max(valA, valC);
            let rightVal = Math.min(valA, valC);
            
            if (Math.random() > 0.5) {
                rel = '<';
                let tmp = leftVal; leftVal = rightVal; rightVal = tmp;
            }
            
            let op = Math.random() > 0.5 ? '+' : '-';
            let rangeMin, rangeMax;
            
            if (rel === '>') {
                if (op === '+') {
                    rangeMax = leftVal - offset; // L > X + O > R => X < L-O
                    rangeMin = rightVal - offset; // X > R-O
                } else {
                    rangeMax = leftVal + offset; // L > X - O > R => X < L+O
                    rangeMin = rightVal + offset;
                }
            } else { // <
                if (op === '+') {
                    rangeMin = leftVal - offset; // L < X + O < R => X > L-O
                    rangeMax = rightVal - offset;
                } else {
                    rangeMin = leftVal + offset; // L < X - O < R => X > L+O
                    rangeMax = rightVal + offset;
                }
            }
            
            if (rangeMax - rangeMin < 50 || rangeMin < 0) {
                i--; continue; 
            }

            const formatVal = (val, u, su, f) => {
                if (val === f) return `1 ${u}`;
                if (val === f/2) return `fél ${u}`;
                if (val === f/4) return `negyed ${u}`;
                if (val === f*0.75) return `háromnegyed ${u}`;
                if (val % f === 0) return `${val/f} ${u}`;
                return `${val} ${su}`;
            };
            
            const leftLabel = formatVal(leftVal, unit, subUnit, factor);
            const rightLabel = formatVal(rightVal, unit, subUnit, factor);
            
            inequalityTasks.push({
                min: rangeMin,
                max: rangeMax
            });

            const div = document.createElement('div');
            div.className = 'question-row';
            div.style.flexWrap = 'wrap';
            div.style.justifyContent = 'center';
            
            div.innerHTML = `
                <span>${leftLabel} ${rel} </span>
                <div class="inequality-inputs">
                    <input type="text" id="ineq-${i}-1" class="short-input" maxlength="4" placeholder="${subUnit}" oninput="this.value = this.value.replace(/[^0-9]/g, ''); autoFocusNext(this)">
                    <input type="text" id="ineq-${i}-2" class="short-input" maxlength="4" placeholder="${subUnit}" oninput="this.value = this.value.replace(/[^0-9]/g, ''); autoFocusNext(this)">
                    <input type="text" id="ineq-${i}-3" class="short-input" maxlength="4" placeholder="${subUnit}" oninput="this.value = this.value.replace(/[^0-9]/g, ''); autoFocusNext(this)">
                </div>
                <span> ${op} ${offset} ${subUnit} ${rel} ${rightLabel}</span>
            `;
             div.querySelectorAll('input').forEach(inp => {
                inp.addEventListener('input', function() { autoFocusNext(this); });
            });
            container.appendChild(div);
        }
        if (typeof logNewTask === 'function') logNewTask('Tömeg egyenlőtlenség', { count: taskCount });
    };

    window.checkInequalityTask = function() {
        let correctCount = 0;
        inequalityTasks.forEach((task, i) => {
            const inputs = [
                document.getElementById(`ineq-${i}-1`),
                document.getElementById(`ineq-${i}-2`),
                document.getElementById(`ineq-${i}-3`)
            ];
            const values = inputs.map(inp => parseInt(inp.value));
            const validValues = values.filter(v => !isNaN(v));
            const distinctValues = new Set(validValues);
            
            // Szigorú ellenőrzés: 3 különböző szám, mind érvényes tartományban
            let isRowCorrect = (distinctValues.size === 3 && validValues.length === 3);
            
            values.forEach((v, idx) => {
                 const inp = inputs[idx];
                 if (isNaN(v) || v <= task.min || v >= task.max) {
                     inp.classList.add('incorrect');
                     inp.classList.remove('correct');
                     isRowCorrect = false;
                 } else {
                     inp.classList.add('correct');
                     inp.classList.remove('incorrect');
                 }
            });
            
            if (isRowCorrect) correctCount++;
        });
        updateFeedback('feedback-inequality', correctCount, inequalityTasks.length);
        if (typeof logTaskCheck === 'function') logTaskCheck('Tömeg egyenlőtlenség', { correct: correctCount, total: inequalityTasks.length });
    };

    // Indításkor generálunk feladatokat
    generateConversionTask();
    generateMissingTask();
    generateSequenceTask();
    generateComparisonTask();
    generateInequalityTask();
});