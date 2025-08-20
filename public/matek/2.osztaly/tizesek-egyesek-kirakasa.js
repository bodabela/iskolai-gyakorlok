document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();
    // --- DOM ELEMEK ---
    const sourceElements = document.getElementById('source-elements');
    const dropZone = document.getElementById('drop-zone');
    const checkBtn = document.getElementById('check-btn');
    const newTaskBtn = document.getElementById('new-task-btn');
    const feedback = document.getElementById('feedback');
    const themeSelector = document.getElementById('themeSelector');
    const rangeSelector = document.getElementById('rangeSelector');
    const taskNumberEl = document.getElementById('task-number');
    const currentSumEl = document.getElementById('current-sum');

    // --- ÁLLAPOT VÁLTOZÓK ---
    let draggedItem = null;
    let currentTask = {
        id: null,
        number: 0
    };
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
        currentTask.id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        currentTask.number = getRandomInt(11, currentSettings.range);
        
        taskNumberEl.textContent = currentTask.number;
        sourceElements.innerHTML = '';
        dropZone.innerHTML = '';
        feedback.innerHTML = '&nbsp;';
        feedback.className = 'feedback';
        dropZone.style.borderColor = '';
        updateSum();

        logNewTask('tizesek-egyesek-kirakasa', { 
            taskId: currentTask.id, 
            details: { 
                range: currentSettings.range,
                number: currentTask.number
            } 
        });

        createRectangles();
        addDragAndDropListeners();
    };

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const createRectangles = () => {
        sourceElements.innerHTML = `
            <div id="source-tens" class="source-zone"></div>
            <div id="source-ones" class="source-zone"></div>
        `;
        const sourceTens = document.getElementById('source-tens');
        const sourceOnes = document.getElementById('source-ones');

        for(let i = 0; i < 9; i++) { createRectangle(10, sourceTens); }
        for(let i = 0; i < 9; i++) { createRectangle(1, sourceOnes); }
    };
    
    const createRectangle = (value, parent) => {
        const rect = document.createElement('div');
        rect.className = `rectangle ${value === 10 ? 'ten-block' : 'one-block'}`;
        rect.draggable = true;
        rect.dataset.value = value;

        for (let i = 0; i < value; i++) {
            const cell = document.createElement('div');
            cell.className = 'unit-cell';
            rect.appendChild(cell);
        }
        parent.appendChild(rect);
    };

    // --- DRAG & DROP LOGIKA (JAVÍTOTT) ---
    function addDragAndDropListeners() {
        const items = document.querySelectorAll('.rectangle');
        items.forEach(item => {
            // Mouse events
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
            // Touch events
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });

        const allDropZones = document.querySelectorAll('.source-zone, .drop-zone');
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
        if(draggedItem) {
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
            updateSum();
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
        } else {
            // Ha nem érvényes zónába esik, visszakerül a kiindulási helyére
            const originalSourceId = draggedItem.dataset.value === '10' ? 'source-tens' : 'source-ones';
            document.getElementById(originalSourceId).appendChild(draggedItem);
        }
        
        draggedItem.style.visibility = 'visible';
        document.body.removeChild(touchClone);
        
        draggedItem = null;
        touchClone = null;

        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        updateSum();
    };

    // --- ÖSSZEGZÉS ÉS ELLENŐRZÉS ---
    const updateSum = () => {
        const rectanglesInDropZone = dropZone.querySelectorAll('.rectangle');
        if (rectanglesInDropZone.length === 0) {
            currentSumEl.textContent = '0';
            return;
        }

        let totalSum = Array.from(rectanglesInDropZone).reduce((sum, rect) => sum + parseInt(rect.dataset.value, 10), 0);
        currentSumEl.textContent = totalSum;
    };

    const checkSolution = () => {
        const sum = parseInt(currentSumEl.textContent, 10);

        if (isNaN(sum)) return;

        const isCorrect = sum === currentTask.number;
        
        if (isCorrect) {
            feedback.textContent = 'Helyes! Ügyes vagy!';
            feedback.className = 'feedback correct';
            dropZone.style.borderColor = 'var(--feedback-correct-color)';
        } else {
            feedback.textContent = 'Nem jó. Próbáld újra!';
            feedback.className = 'feedback incorrect';
            dropZone.style.borderColor = 'var(--feedback-incorrect-color)';
        }

        logTaskCheck('tizesek-egyesek-kirakasa', { 
            taskId: currentTask.id, 
            correct: isCorrect, 
            provided: sum,
            expected: currentTask.number
        });
    };

    // --- INDÍTÁS ---
    newTaskBtn.addEventListener('click', generateNewTask);
    checkBtn.addEventListener('click', checkSolution);
    logTaskEntry('tizesek-egyesek-kirakasa');
    applySettings();
    generateNewTask();
});