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
            <div id="source-tens"></div>
            <div id="source-ones"></div>
        `;
        const sourceTens = document.getElementById('source-tens');
        const sourceOnes = document.getElementById('source-ones');

        // 9 db 10-es
        for(let i = 0; i < 9; i++) {
            createRectangle(10, sourceTens);
        }
        // 9 db 1-es
        for(let i = 0; i < 9; i++) {
            createRectangle(1, sourceOnes);
        }
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


    // --- DRAG & DROP LOGIKA ---
    function addDragAndDropListeners() {
        const items = document.querySelectorAll('.rectangle');
        items.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
        });

        const allDropZones = document.querySelectorAll('.source-zone, .drop-zone, #source-tens, #source-ones');
        allDropZones.forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragenter', handleDragEnter);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });
    }

    const handleDragStart = (e) => {
        draggedItem = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    };
    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
    };
    const handleDragOver = (e) => e.preventDefault();
    const handleDragEnter = (e) => {
        const targetZone = e.target.closest('.drop-zone, #source-tens, #source-ones');
        if (targetZone) targetZone.classList.add('drag-over');
    };
    const handleDragLeave = (e) => {
        const targetZone = e.target.closest('.drop-zone, #source-tens, #source-ones');
        if (targetZone) targetZone.classList.remove('drag-over');
    };
    const handleDrop = (e) => {
        e.preventDefault();
        const targetZone = e.target.closest('.drop-zone, #source-tens, #source-ones');
        
        if (targetZone && draggedItem) {
            targetZone.classList.remove('drag-over');
             
            if (targetZone.id === 'source-tens' || targetZone.id === 'source-ones') {
                if (draggedItem.dataset.value === '10') {
                    document.getElementById('source-tens').appendChild(draggedItem);
                } else {
                    document.getElementById('source-ones').appendChild(draggedItem);
                }
            } else {
                targetZone.appendChild(draggedItem);
            }
             
            draggedItem = null;
            updateSum();
        }
    };
    
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
            if (value === 10) {
                tens.push(value);
            } else {
                ones.push(value);
            }
        });

        const expressionParts = [];
        if (tens.length > 0) {
            expressionParts.push(...tens);
        }
        
        const sumOfOnes = ones.reduce((sum, current) => sum + current, 0);
        if (sumOfOnes > 0) {
            expressionParts.push(sumOfOnes);
        }

        const expressionString = expressionParts.join(' + ');
        
        currentSumEl.textContent = `${expressionString} = ${totalSum}`;
    };

    // --- ELLENŐRZÉS ---
    const checkSolution = () => {
        const sumText = currentSumEl.textContent;
        const sum = parseInt(sumText.split('=')[1].trim(), 10);

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