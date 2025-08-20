document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAndLogger();
    // --- DOM ELEMEK ---
    const sourceElements = document.getElementById('source-elements');
    const dropZone = document.getElementById('drop-zone');
    const dropZoneTens = document.getElementById('drop-zone-tens');
    const dropZoneOnes = document.getElementById('drop-zone-ones');
    const checkBtn = document.getElementById('check-btn');
    const newTaskBtn = document.getElementById('new-task-btn');
    const feedback = document.getElementById('feedback');
    const themeSelector = document.getElementById('themeSelector');
    const rangeSelector = document.getElementById('rangeSelector');
    const taskNumberEl = document.getElementById('task-number');
    const currentSumEl = document.getElementById('current-sum');

    // --- ÁLLAPOT VÁLTOZÓK ---
    let draggedItem = null;
    let currentTask = { id: null, number: 0 };
    let currentSettings = { theme: 'theme-candy', range: 100 };
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
        currentTask.id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        currentTask.number = getRandomInt(11, currentSettings.range);
        
        taskNumberEl.textContent = currentTask.number;
        dropZoneTens.innerHTML = '';
        dropZoneOnes.innerHTML = '';
        feedback.innerHTML = '&nbsp;';
        feedback.className = 'feedback';
        
        logNewTask('tizesek-egyesek-kirakasa', { 
            taskId: currentTask.id, 
            details: { range: currentSettings.range, number: currentTask.number } 
        });

        createRectangles();
        addDragAndDropListeners();
        updateSum();
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
        rect.draggable = false;
        rect.dataset.value = value;
        for (let i = 0; i < value; i++) {
            rect.appendChild(document.createElement('div')).className = 'unit-cell';
        }
        parent.appendChild(rect);
    };

    // --- EGYSÉGESÍTETT DRAG & DROP LOGIKA ---
    function addDragAndDropListeners() {
        const items = document.querySelectorAll('.rectangle');
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
        const allZones = document.querySelectorAll('.source-zone, .element-box[data-droptarget]');
        allZones.forEach(zone => {
            const targetUnder = document.elementFromPoint(eventPos.clientX, eventPos.clientY);
            zone.classList.toggle('drag-over', zone.contains(targetUnder));
        });
        draggedItem.style.pointerEvents = 'auto';

        draggedItem.style.top = `${eventPos.clientY - offsetY}px`;
        draggedItem.style.left = `${eventPos.clientX - offsetX}px`;
    }

    function handleDragEnd(e) {
        if (!draggedItem) return;
        
        document.querySelectorAll('.source-zone, .element-box').forEach(zone => zone.classList.remove('drag-over'));
        
        draggedItem.style.pointerEvents = 'none';
        const eventPos = e.type === 'touchend' ? e.changedTouches[0] : e;
        const dropTarget = document.elementFromPoint(eventPos.clientX, eventPos.clientY);
        draggedItem.style.pointerEvents = 'auto';
        
        const targetDropBox = dropTarget ? dropTarget.closest('.element-box[data-droptarget]') : null;
        const targetSourceZone = dropTarget ? dropTarget.closest('.source-zone') : null;

        let newParent = null;

        if (targetDropBox) {
            newParent = draggedItem.dataset.value === '10' ? dropZoneTens : dropZoneOnes;
        } else if (targetSourceZone) {
            newParent = targetSourceZone;
        } else {
            const sourceId = draggedItem.dataset.value === '10' ? 'source-tens' : 'source-ones';
            newParent = document.getElementById(sourceId);
        }
        
        draggedItem.classList.remove('dragging');
        draggedItem.style.position = '';
        draggedItem.style.top = '';
        draggedItem.style.left = '';
        draggedItem.style.zIndex = '';
        
        if (newParent) {
            newParent.appendChild(draggedItem);
        }
        
        draggedItem = null;
        updateSum();
    }
    
    const updateSum = () => {
        const rectanglesInDropZone = dropZone.querySelectorAll('.rectangle');
        let totalSum = 0;
        rectanglesInDropZone.forEach(rect => {
            totalSum += parseInt(rect.dataset.value, 10);
        });
        currentSumEl.textContent = totalSum;
    };

    const checkSolution = () => {
        const sum = parseInt(currentSumEl.textContent, 10);
        const isCorrect = sum === currentTask.number;
        
        feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
        feedback.textContent = isCorrect ? 'Helyes! Ügyes vagy!' : 'Nem jó. Próbáld újra!';
        
        logTaskCheck('tizesek-egyesek-kirakasa', { 
            taskId: currentTask.id, 
            correct: isCorrect, 
            provided: sum,
            expected: currentTask.number
        });
    };

    newTaskBtn.addEventListener('click', generateNewTask);
    checkBtn.addEventListener('click', checkSolution);
    logTaskEntry('tizesek-egyesek-kirakasa');
    applySettings();
    generateNewTask();
});