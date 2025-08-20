document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();
    // --- DOM ELEMEK ---
    const sourceElements = document.getElementById('source-elements');
    const set1 = document.getElementById('set1'); // Páros halmaz
    const set2 = document.getElementById('set2'); // Páratlan halmaz
    const checkBtn = document.getElementById('check-btn');
    const newTaskBtn = document.getElementById('new-task-btn');
    const feedback = document.getElementById('feedback');
    const themeSelector = document.getElementById('themeSelector');
    const rangeSelector = document.getElementById('rangeSelector');

    // --- ÁLLAPOT VÁLTOZÓK ---
    let draggedItem = null;
    let currentTaskID = null;
    let currentSettings = {
        theme: 'theme-candy',
        range: 100
    };
    let offsetX = 0, offsetY = 0;
    
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

    // --- FELADAT GENERÁLÁS ---
    const generateNewTask = () => {
        currentTaskID = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        sourceElements.innerHTML = '';
        document.querySelectorAll('.drop-zone').forEach(zone => zone.innerHTML = '');
        feedback.innerHTML = '&nbsp;';
        feedback.className = 'feedback';
        
        const numbers = generateUniqueNumbers(8, 1, currentSettings.range);
        
        logNewTask('halmaz-valogato', { 
            taskId: currentTaskID, 
            details: { 
                range: currentSettings.range,
                numbers: numbers
            } 
        });

        numbers.forEach(num => {
            const item = document.createElement('div');
            item.className = 'number-item';
            item.textContent = num;
            item.draggable = false;
            item.setAttribute('data-number', num);
            sourceElements.appendChild(item);
        });
        addDragAndDropListeners();
    };

    const generateUniqueNumbers = (count, min, max) => {
        const numbers = new Set();
        while (numbers.size < count) {
            numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return Array.from(numbers);
    };

    // --- EGYSÉGESÍTETT DRAG & DROP LOGIKA ---
    function addDragAndDropListeners() {
        const items = document.querySelectorAll('.number-item');
        items.forEach(item => {
            item.addEventListener('mousedown', (e) => handleDragStart(e, item));
            item.addEventListener('touchstart', (e) => handleDragStart(e, item), { passive: false });
        });

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
    }
    
    function handleDragStart(e, element) {
        if (e.type === 'mousedown' && e.button !== 0) return;
        if (draggedItem) return;

        e.preventDefault();
        draggedItem = element;

        const rect = draggedItem.getBoundingClientRect();
        const eventPos = e.type === 'touchstart' ? e.touches[0] : e;
        
        offsetX = eventPos.clientX - rect.left;
        offsetY = eventPos.clientY - rect.top;

        document.body.appendChild(draggedItem); 
        draggedItem.classList.add('dragging');
        draggedItem.style.position = 'fixed';
        draggedItem.style.left = `${rect.left}px`;
        draggedItem.style.top = `${rect.top}px`;
        draggedItem.style.zIndex = '1000';
    }

    function handleDragMove(e) {
        if (!draggedItem) return;
        e.preventDefault();
        const eventPos = e.type === 'touchmove' ? e.touches[0] : e;

        draggedItem.style.pointerEvents = 'none';
        document.querySelectorAll('.drop-zone').forEach(zone => {
            const targetUnder = document.elementFromPoint(eventPos.clientX, eventPos.clientY);
            zone.classList.toggle('drag-over', zone.contains(targetUnder));
        });
        draggedItem.style.pointerEvents = 'auto';

        draggedItem.style.left = `${eventPos.clientX - offsetX}px`;
        draggedItem.style.top = `${eventPos.clientY - offsetY}px`;
    }

    function handleDragEnd(e) {
        if (!draggedItem) return;
    
        document.querySelectorAll('.drop-zone').forEach(zone => zone.classList.remove('drag-over'));
    
        // A 'pointer-events: none' megbízhatóbb módszer a célpont azonosítására.
        draggedItem.style.pointerEvents = 'none';
        const eventPos = e.type === 'touchend' ? e.changedTouches[0] : e;
        const dropTarget = document.elementFromPoint(eventPos.clientX, eventPos.clientY);
        draggedItem.style.pointerEvents = 'auto';
    
        let newParent = sourceElements; // Alapértelmezett cél a kiindulási zóna
        if (dropTarget) {
            const bowl = dropTarget.closest('.drop-zone');
            if (bowl) {
                newParent = bowl;
            }
        }
        
        draggedItem.classList.remove('dragging');
        draggedItem.style.position = '';
        draggedItem.style.top = '';
        draggedItem.style.left = '';
        draggedItem.style.zIndex = '';
        
        newParent.appendChild(draggedItem);
        
        draggedItem = null;
        offsetX = 0;
        offsetY = 0;
    }

    // --- ELLENŐRZÉS ---
    const checkSolution = () => {
        let allCorrect = true;
        const userSolution = { setEven: [], setOdd: [], source: [] };
        
        document.querySelectorAll('.number-item').forEach(item => item.classList.remove('correct', 'incorrect'));
        
        const checkZone = (zone, rule, solutionArray) => {
            zone.querySelectorAll('.number-item').forEach(item => {
                const num = parseInt(item.dataset.number, 10);
                solutionArray.push(num);
                const isCorrect = (rule === 'even' && num % 2 === 0) || (rule === 'odd' && num % 2 !== 0);
                item.classList.toggle('correct', isCorrect);
                item.classList.toggle('incorrect', !isCorrect);
                if (!isCorrect) allCorrect = false;
            });
        };
        
        checkZone(set1, 'even', userSolution.setEven);
        checkZone(set2, 'odd', userSolution.setOdd);

        sourceElements.querySelectorAll('.number-item').forEach(item => {
            userSolution.source.push(parseInt(item.dataset.number, 10));
            allCorrect = false;
        });

        if (sourceElements.children.length > 0) {
            feedback.textContent = 'Minden számot tegyél a helyére!';
            feedback.className = 'feedback incorrect';
            allCorrect = false;
        } else if (allCorrect) {
            feedback.textContent = 'Nagyon ügyes vagy, minden tökéletes!';
            feedback.className = 'feedback correct';
        } else {
            feedback.textContent = 'Nézd át újra, van néhány hiba!';
            feedback.className = 'feedback incorrect';
        }
        
        logTaskCheck('halmaz-valogato', { taskId: currentTaskID, correct: allCorrect, solution: userSolution });
    };

    // --- INDÍTÁS ---
    newTaskBtn.addEventListener('click', generateNewTask);
    checkBtn.addEventListener('click', checkSolution);
    logTaskEntry('halmaz-valogato');
    applySettings();
    generateNewTask();
});