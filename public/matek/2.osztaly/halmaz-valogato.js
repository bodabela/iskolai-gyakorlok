document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();
    // --- DOM ELEMEK ---
    const sourceElements = document.getElementById('source-elements');
    const set1 = document.getElementById('set1'); // DOM id marad set1, a páros halmaz
    const set2 = document.getElementById('set2'); // DOM id marad set2, a páratlan halmaz
    const checkBtn = document.getElementById('check-btn');
    const newTaskBtn = document.getElementById('new-task-btn');
    const feedback = document.getElementById('feedback');
    const themeSelector = document.getElementById('themeSelector');
    const rangeSelector = document.getElementById('rangeSelector');

    // --- ÁLLAPOT VÁLTOZÓK ---
    let draggedItem = null;
    let offsetX = 0, offsetY = 0; // Touch eseményekhez
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

    // --- DRAG & DROP LOGIKA ---
    function addDragAndDropListeners() {
        const items = document.querySelectorAll('.number-item');
        items.forEach(item => {
            // Mouse events
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
            // Touch events
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });
        const allDropZones = document.querySelectorAll('.drop-zone');
        allDropZones.forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragenter', handleDragEnter);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });

        // Touch move and end listeners on the whole document
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }

    const handleDragStart = (e) => {
        draggedItem = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    };
    const handleDragEnd = (e) => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
    };
    const handleDragOver = (e) => e.preventDefault();
    const handleDragEnter = (e) => {
        const targetZone = e.target.closest('.drop-zone');
        if (targetZone) targetZone.classList.add('drag-over');
    };
    const handleDragLeave = (e) => {
        const targetZone = e.target.closest('.drop-zone');
        if (targetZone) targetZone.classList.remove('drag-over');
    };
    const handleDrop = (e) => {
        e.preventDefault();
        const targetZone = e.target.closest('.drop-zone');
        if (targetZone && draggedItem) {
             targetZone.classList.remove('drag-over');
             targetZone.appendChild(draggedItem);
             // draggedItem is cleared in handleDragEnd
        }
    };

    // --- TOUCH EVENT HANDLERS ---
    const handleTouchStart = (e) => {
        e.preventDefault();
        draggedItem = e.target;
        const touch = e.touches[0];
        const rect = draggedItem.getBoundingClientRect();

        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;

        draggedItem.style.position = 'fixed';
        draggedItem.style.zIndex = '1000';
        draggedItem.classList.add('dragging');
        
        // Initial position update
        draggedItem.style.left = `${touch.clientX - offsetX}px`;
        draggedItem.style.top = `${touch.clientY - offsetY}px`;
    };

    const handleTouchMove = (e) => {
        if (!draggedItem) return;
        e.preventDefault();
        const touch = e.touches[0];
        draggedItem.style.left = `${touch.clientX - offsetX}px`;
        draggedItem.style.top = `${touch.clientY - offsetY}px`;
    };

    const handleTouchEnd = (e) => {
        if (!draggedItem) return;
        
        const touch = e.changedTouches[0];
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetZone = dropTarget ? dropTarget.closest('.drop-zone') : null;

        if (targetZone) {
            targetZone.appendChild(draggedItem);
        }

        // Cleanup styles
        draggedItem.style.position = '';
        draggedItem.style.left = '';
        draggedItem.style.top = '';
        draggedItem.style.zIndex = '';
        draggedItem.classList.remove('dragging');

        draggedItem = null;
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