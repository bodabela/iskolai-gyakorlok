document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMEK ---
    const taskContainer = document.getElementById('task-container');
    const checkBtn = document.getElementById('check-btn');
    const newTaskBtn = document.getElementById('new-task-btn');
    const feedback = document.getElementById('feedback');
    const themeSelector = document.getElementById('themeSelector');
    const rangeSelector = document.getElementById('rangeSelector');
    
    // --- ÁLLAPOT VÁLTOZÓK ---
    let currentTaskID = null;
    let currentSettings = {
        theme: 'theme-candy',
        range: 100
    };
    let sessionID = `local-${Date.now()}`;
    let isLoggerAvailable = false;

    // --- TÉMA- ÉS BEÁLLÍTÁSKEZELÉS ---
    function applySettings() {
        document.body.className = '';
        document.body.classList.add(currentSettings.theme);
        themeSelector.querySelectorAll('.setting-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === currentSettings.theme);
        });
        rangeSelector.querySelectorAll('.setting-button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.range) === currentSettings.range);
        });
    }

    themeSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('setting-button')) {
            currentSettings.theme = e.target.dataset.theme;
            applySettings();
        }
    });
    rangeSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('setting-button') && !e.target.classList.contains('active')) {
            currentSettings.range = parseInt(e.target.dataset.range);
            applySettings();
            generateNewTask();
        }
    });

    // --- LOGGER ---
    if (window.logger && typeof window.logger.getSessionId === 'function') {
        sessionID = window.logger.getSessionId();
        isLoggerAvailable = true;
    } else {
        console.warn("Firebase logger nem elérhető.");
    }
    const logEvent = (eventName, eventData) => {
        if (isLoggerAvailable) { window.logger.log(eventName, eventData); }
    };

    // --- FELADAT GENERÁLÁS ---
    const generateNewTask = () => {
        currentTaskID = `task-${Date.now()}`;
        logEvent('feladvany_generalasa', { sessionId: sessionID, taskId: currentTaskID, taskType: 'szamszomszed-relacio', details: { range: currentSettings.range } });

        taskContainer.innerHTML = '';
        feedback.innerHTML = '&nbsp;';
        feedback.className = 'feedback';
        
        const taskTypes = ['neighbor', 'relation'];
        for (let i = 0; i < 5; i++) {
            const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
            taskContainer.appendChild(
                type === 'neighbor' ? createNeighborTask() : createRelationTask()
            );
        }
        addEventListeners();
    };

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const createNeighborTask = () => {
        const max = currentSettings.range;
        const num = getRandomInt(1, max - 1);
        const row = document.createElement('div');
        row.className = 'task-row';
        row.innerHTML = `
            <input type="number" class="solution-input" data-correct="${num - 1}" maxlength="3">
            <span class="number-display">${num}</span>
            <input type="number" class="solution-input" data-correct="${num + 1}" maxlength="3">
        `;
        return row;
    };

    const createRelationTask = () => {
        const max = currentSettings.range;
        const num1 = getRandomInt(0, max);
        let num2;
        do { num2 = getRandomInt(0, max); } while (num1 === num2);

        const correctRelation = num1 < num2 ? '<' : '>';
        const row = document.createElement('div');
        row.className = 'task-row';
        row.setAttribute('data-correct-relation', correctRelation);
        row.innerHTML = `
            <span class="number-display">${num1}</span>
            <div class="relation-selector" data-selected-relation="">
                <button class="relation-btn" data-relation="<">&lt;</button>
                <button class="relation-btn" data-relation=">">&gt;</button>
            </div>
            <span class="number-display">${num2}</span>
        `;
        return row;
    };
    
    // --- ESEMÉNYKEZELŐK ---
    const addEventListeners = () => {
        taskContainer.querySelectorAll('.relation-btn').forEach(btn => btn.addEventListener('click', handleRelationClick));
        taskContainer.querySelectorAll('.solution-input').forEach(input => input.addEventListener('input', autoTab));
    };

    const handleRelationClick = (e) => {
        const selector = e.target.parentElement;
        selector.querySelectorAll('.relation-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
        selector.setAttribute('data-selected-relation', e.target.dataset.relation);
    };

    const autoTab = (element) => {
        const val = element.value;
        const max = element.getAttribute('maxlength');
        if (val.length >= max) {
            const inputs = Array.from(taskContainer.querySelectorAll('input.solution-input'));
            const currentIndex = inputs.indexOf(element);
            const nextInput = inputs[currentIndex + 1];
            if (nextInput) nextInput.focus();
        }
    };

    // --- ELLENŐRZÉS ---
    const checkSolution = () => {
        let correctCount = 0;
        const allTasks = taskContainer.querySelectorAll('.task-row');
        const userSolution = [];

        allTasks.forEach(row => {
            let isRowCorrect = true;
            row.querySelectorAll('.solution-input, .relation-btn').forEach(el => el.classList.remove('correct', 'incorrect', 'correct-choice', 'incorrect-choice'));

            // Számszomszéd ellenőrzés
            row.querySelectorAll('.solution-input').forEach(input => {
                const isCorrect = input.value === input.dataset.correct;
                input.classList.toggle('correct', isCorrect);
                input.classList.toggle('incorrect', !isCorrect);
                if (!isCorrect) isRowCorrect = false;
            });

            // Reláció ellenőrzés
            const relationSelector = row.querySelector('.relation-selector');
            if (relationSelector) {
                const selected = relationSelector.getAttribute('data-selected-relation');
                const correct = row.getAttribute('data-correct-relation');
                const selectedBtn = relationSelector.querySelector('.relation-btn.selected');
                if (selected === correct) {
                    if (selectedBtn) selectedBtn.classList.add('correct-choice');
                } else {
                    if (selectedBtn) selectedBtn.classList.add('incorrect-choice');
                    isRowCorrect = false;
                }
                if (!selected) isRowCorrect = false; // Ha nincs választás, nem helyes
            }
            
            if (isRowCorrect) correctCount++;
        });

        if (correctCount === allTasks.length) {
            feedback.textContent = 'Szép munka! Minden megoldásod helyes!';
            feedback.className = 'feedback correct';
        } else {
            feedback.textContent = `Nézd át újra, ${allTasks.length}-ból ${correctCount} lett helyes!`;
            feedback.className = 'feedback incorrect';
        }

        logEvent('feladvany_ellenorzese', { sessionId: sessionID, taskId: currentTaskID, correct: correctCount === allTasks.length });
    };

    // --- INDÍTÁS ---
    newTaskBtn.addEventListener('click', generateNewTask);
    checkBtn.addEventListener('click', checkSolution);
    logEvent('belepes_feladatba', { sessionId: sessionID, taskType: 'szamszomszed-relacio' });
    applySettings();
    generateNewTask();
});