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
            item.draggable = true;
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

    // --- DRAG & DROP LOGIKA (JAVÍTOTT) ---
    function addDragAndDropListeners() {
        const items = document.querySelectorAll('.number-item');
        items.forEach(item => {
            // Mouse events
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);

            // Touch events
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });

        const allDropZones = document.querySelectorAll('.drop-zone, .source-zone');
        allDropZones.forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragenter', handleDragEnter);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });
    }

    // --- EGÉR ESEMÉNYEK ---
    const handleDragStart = (e) => {
        draggedItem = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    };
    const handleDragEnd = () => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
    };
    const handleDragOver = (e) => e.preventDefault();
    const handleDragEnter = (e) => {
        const targetZone = e.target.closest('.drop-zone, .source-zone');
        if (targetZone) targetZone.classList.add('drag-over');
    };
    const handleDragLeave = (e) => {
        const targetZone = e.target.closest('.drop-zone, .source-zone');
        if (targetZone) targetZone.classList.remove('drag-over');
    };
    const handleDrop = (e) => {
        e.preventDefault();
        const targetZone = e.target.closest('.drop-zone, .source-zone');
        if (targetZone && draggedItem) {
             targetZone.classList.remove('drag-over');
             targetZone.appendChild(draggedItem);
        }
    };

    // --- ÉRINTÉS ESEMÉNYEK (AZ ALAKZATOK.HTML MINTÁJÁRA) ---
    let touchClone = null;
    let offsetX = 0, offsetY = 0;

    const handleTouchStart = (e) => {
        e.preventDefault(); // <-- A LEGFONTOSABB VÁLTOZTATÁS!
        draggedItem = e.target;
        
        const touch = e.touches[0];
        const rect = draggedItem.getBoundingClientRect();

        touchClone = draggedItem.cloneNode(true);
        document.body.appendChild(touchClone);
        touchClone.classList.add('dragging');
        touchClone.style.position = 'fixed';
        touchClone.style.zIndex = '1000';
        
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;

        touchClone.style.left = `${touch.clientX - offsetX}px`;
        touchClone.style.top = `${touch.clientY - offsetY}px`;

        draggedItem.style.visibility = 'hidden';

        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        if (!draggedItem || !touchClone) return;
        
        const touch = e.touches[0];
        touchClone.style.left = `${touch.clientX - offsetX}px`;
        touchClone.style.top = `${touch.clientY - offsetY}px`;
    };

    const handleTouchEnd = (e) => {
        if (!draggedItem || !touchClone) return;

        touchClone.style.visibility = 'hidden';
        const endTouch = e.changedTouches[0];
        const dropTarget = document.elementFromPoint(endTouch.clientX, endTouch.clientY);
        touchClone.style.visibility = 'visible';
        
        const targetZone = dropTarget ? dropTarget.closest('.drop-zone, .source-zone') : null;

        if (targetZone) {
            targetZone.appendChild(draggedItem);
        }
        
        draggedItem.style.visibility = 'visible';
        document.body.removeChild(touchClone);
        
        draggedItem = null;
        touchClone = null;

        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    };


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
            allCorrect = false; // Ha maradt a forrásban, nem lehet jó.
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