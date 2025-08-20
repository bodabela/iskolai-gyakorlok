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
        rect.draggable = false; // Natív D&D kikapcsolása
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
        
        // Elem áthelyezése a body-ba a rétegezés miatt
        document.body.appendChild(draggedItem);
        draggedItem.classList.add('dragging');
        draggedItem.style.position = 'fixed';
        draggedItem.style.left = `${rect.left}px`;
        draggedItem.style.top = `${rect.top}px`;
        draggedItem.style.zIndex = '1000';
        updateSum();
    }
    
    function handleDragMove(e) {
        if (!draggedItem) return;
        e.preventDefault();
        const eventPos = e.type === 'touchmove' ? e.touches[0] : e;

        // Vizuális visszajelzés a célzónák felett
        draggedItem.style.pointerEvents = 'none';
        const allDropZones = document.querySelectorAll('.source-zone, .drop-zone');
        allDropZones.forEach(zone => {
            const targetUnder = document.elementFromPoint(eventPos.clientX, eventPos.clientY);
            zone.classList.toggle('drag-over', zone.contains(targetUnder));
        });
        draggedItem.style.pointerEvents = 'auto';

        draggedItem.style.top = `${eventPos.clientY - offsetY}px`;
        draggedItem.style.left = `${eventPos.clientX - offsetX}px`;
    }

    function handleDragEnd(e) {
        if (!draggedItem) return;
        
        document.querySelectorAll('.source-zone, .drop-zone').forEach(zone => zone.classList.remove('drag-over'));

        draggedItem.style.pointerEvents = 'none';
        const eventPos = e.type === 'touchend' ? e.changedTouches[0] : e;
        const dropTarget = document.elementFromPoint(eventPos.clientX, eventPos.clientY);
        draggedItem.style.pointerEvents = 'auto';
        
        const targetZone = dropTarget ? dropTarget.closest('.drop-zone, .source-zone') : null;

        let newParent = null;
        if (targetZone) {
            newParent = targetZone;
        } else {
            // Ha nem zónára esik, visszatesszük a saját kiindulási helyére
            const targetId = draggedItem.dataset.value === '10' ? 'source-tens' : 'source-ones';
            newParent = document.getElementById(targetId);
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
        offsetX = 0;
        offsetY = 0;
        updateSum();
    }
    
    // --- ÖSSZEGZÉS ---
    const updateSum = () => {
        const rectanglesInDropZone = dropZone.querySelectorAll('.rectangle');
        
        if (rectanglesInDropZone.length === 0) {
            currentSumEl.textContent = '0';
            return;
        }

        let totalSum = 0;
        const tens = [];
        const ones = [];

        rectanglesInDropZone.forEach(rect => {
            const value = parseInt(rect.dataset.value, 10);
            totalSum += value;
            if (value === 10) tens.push(value); else ones.push(value);
        });

        const expressionParts = [];
        if (tens.length > 0) expressionParts.push(...tens);
        const sumOfOnes = ones.reduce((sum, current) => sum + current, 0);
        if (sumOfOnes > 0) expressionParts.push(sumOfOnes);

        currentSumEl.textContent = `${expressionParts.join(' + ')} = ${totalSum}`;
    };

    // --- ELLENŐRZÉS ---
    const checkSolution = () => {
        const sumText = currentSumEl.textContent;
        const sum = parseInt(sumText.split('=')[1]?.trim(), 10);

        if (isNaN(sum)) return;

        const isCorrect = sum === currentTask.number;
        feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
        feedback.textContent = isCorrect ? 'Helyes! Ügyes vagy!' : 'Nem jó. Próbáld újra!';
        dropZone.style.borderColor = isCorrect ? 'var(--feedback-correct-color)' : 'var(--feedback-incorrect-color)';

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