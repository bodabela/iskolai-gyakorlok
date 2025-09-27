let currentNumberRange = 5;
        let taskData = { total: 0, part1: 0, part2: 0 };
        let draggedElement = null;
        let offsetX = 0, offsetY = 0;
        
        const ballLayouts = {
            1: [[0, 0]],
            2: [[-0.5, 0], [0.5, 0]],
            3: [[0, -0.4], [-0.5, 0.4], [0.5, 0.4]],
            4: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]],
            5: [[-0.8, -0.8], [0.8, -0.8], [0, 0], [-0.8, 0.8], [0.8, 0.8]],
            6: [[-0.5, -1], [-0.5, 0], [-0.5, 1], [0.5, -1], [0.5, 0], [0.5, 1]],
            7: [[0,0], [0, -1], [0, 1], [-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]],
            8: [[-0.5, -1.3], [0.5, -1.3], [-0.5, -0.4], [0.5, -0.4], [-0.5, 0.5], [0.5, 0.5], [-0.5, 1.4], [0.5, 1.4]],
            9: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
            10: [[0, -1.5*0.866], [-0.5, -0.5*0.866], [0.5, -0.5*0.866], [-1, 0.5*0.866], [0, 0.5*0.866], [1, 0.5*0.866], [-1.5, 1.5*0.866], [-0.5, 1.5*0.866], [0.5, 1.5*0.866], [1.5, 1.5*0.866]]
        };
        
        function layoutBalls(container) {
            const balls = Array.from(container.children);
            const count = balls.length;
            const ballDiameter = 33;
            if (count === 0) return;

            const layout = ballLayouts[count];
            const containerRect = container.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            
            balls.forEach((ball, i) => {
                ball.classList.add('idle-in-bowl');
                if (layout && layout[i]) {
                    const [xOffset, yOffset] = layout[i];
                    ball.style.left = `${centerX + xOffset * ballDiameter - ballDiameter / 2}px`;
                    ball.style.top = `${centerY + yOffset * ballDiameter - ballDiameter / 2}px`;
                }
            });
        }
        
        function applyTheme(themeClass) { document.body.className = ''; document.body.classList.add(themeClass); document.querySelectorAll('.theme-button').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === themeClass)); document.querySelectorAll('.range-button').forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.range) === currentNumberRange)); generateTask(); }
        document.querySelectorAll('.theme-button').forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.theme)));
        document.querySelectorAll('.range-button').forEach(b => { b.addEventListener('click', () => { currentNumberRange = parseInt(b.dataset.range); document.querySelectorAll('.range-button').forEach(btn => btn.classList.remove('active')); b.classList.add('active'); generateTask(); }); });

        function generateTask() { taskData.total = Math.floor(Math.random() * (currentNumberRange - 1)) + 2; taskData.part1 = Math.floor(Math.random() * (taskData.total - 1)) + 1; taskData.part2 = taskData.total - taskData.part1; clearAndSetup(); renderBalls(); updateCounts(); }
        
        function clearAndSetup() {
            ['mainBowl', 'smallBowl1', 'smallBowl2'].forEach(id => { document.getElementById(id).innerHTML = ''; });
            document.getElementById('mainBowlLabel').textContent = ''; 
            document.getElementById('resultTotal').textContent = taskData.total;
            const feedbackEl = document.getElementById('feedbackArea');
            feedbackEl.textContent = ''; feedbackEl.className = 'feedback';
        }

        function renderBalls() {
            const mainBowl = document.getElementById('mainBowl');
            const ballColor1 = getComputedStyle(document.documentElement).getPropertyValue('--ball1-color').trim();
            const ballColor2 = getComputedStyle(document.documentElement).getPropertyValue('--ball2-color').trim();
            for (let i = 0; i < taskData.part1; i++) createBall(mainBowl, ballColor1, '1');
            for (let i = 0; i < taskData.part2; i++) createBall(mainBowl, ballColor2, '2');
            layoutBalls(mainBowl);
        }
        
        function createBall(parent, color, colorId) { const ball = document.createElement('div'); ball.className = 'ball'; ball.style.backgroundColor = color; ball.dataset.colorId = colorId; parent.appendChild(ball); addDragListeners(ball); }
        
        function updateCounts() {
            document.getElementById('result1').textContent = document.getElementById('smallBowl1').children.length;
            document.getElementById('result2').textContent = document.getElementById('smallBowl2').children.length;
            const mainBowlCount = document.getElementById('mainBowl').children.length;
            document.getElementById('mainBowlLabel').textContent = mainBowlCount > 0 ? mainBowlCount : '';
        }

        function checkAnswer() {
            const feedbackEl = document.getElementById('feedbackArea');
            if (document.getElementById('mainBowl').children.length > 0) { feedbackEl.textContent = 'Még nem pakoltál át minden golyót!'; feedbackEl.className = 'feedback incorrect'; return; }
            const ballsInBowl1 = Array.from(document.getElementById('smallBowl1').children);
            const ballsInBowl2 = Array.from(document.getElementById('smallBowl2').children);
            const bowl1Color1Count = ballsInBowl1.filter(b => b.dataset.colorId === '1').length;
            const bowl1Color2Count = ballsInBowl1.filter(b => b.dataset.colorId === '2').length;
            const bowl2Color1Count = ballsInBowl2.filter(b => b.dataset.colorId === '1').length;
            const bowl2Color2Count = ballsInBowl2.filter(b => b.dataset.colorId === '2').length;
            const bowl1HasMixedColors = bowl1Color1Count > 0 && bowl1Color2Count > 0;
            const bowl2HasMixedColors = bowl2Color1Count > 0 && bowl2Color2Count > 0;
            if (bowl1HasMixedColors || bowl2HasMixedColors) { feedbackEl.textContent = 'Egy tálba csak egyféle színű golyót tegyél!'; feedbackEl.className = 'feedback incorrect'; return; }
            const isDecompositionCorrect = (bowl1Color1Count === taskData.part1 && bowl2Color2Count === taskData.part2) || (bowl1Color2Count === taskData.part2 && bowl2Color1Count === taskData.part1);
            if (isDecompositionCorrect) { feedbackEl.textContent = 'Ügyes vagy, ez a helyes megoldás!'; feedbackEl.className = 'feedback correct'; } else { feedbackEl.textContent = 'A golyók nincsenek jól szétosztva. Számold meg újra a színeket a tálakban!'; feedbackEl.className = 'feedback incorrect'; }
        }

        function addDragListeners(element) { element.addEventListener('mousedown', e => handleDragStart(e, element)); element.addEventListener('touchstart', e => handleDragStart(e, element), { passive: false }); }

        function handleDragStart(e, element) {
            if (draggedElement) return;
            e.preventDefault();
            draggedElement = element;
            
            const rect = draggedElement.getBoundingClientRect();
            const eventPos = e.type === 'touchstart' ? e.touches[0] : e;
            offsetX = eventPos.clientX - rect.left;
            offsetY = eventPos.clientY - rect.top;

            document.body.appendChild(draggedElement);
            draggedElement.classList.remove('idle-in-bowl');
            draggedElement.classList.add('dragging');
            draggedElement.style.top = `${rect.top}px`;
            draggedElement.style.left = `${rect.left}px`;
            
            updateCounts();

            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('touchend', handleDragEnd);
        }

        function handleDragMove(e) {
            if (!draggedElement) return;
            e.preventDefault();
            const eventPos = e.type === 'touchmove' ? e.touches[0] : e;
            draggedElement.style.top = `${eventPos.clientY - offsetY}px`;
            draggedElement.style.left = `${eventPos.clientX - offsetX}px`;
        }

        function handleDragEnd(e) {
            if (!draggedElement) return;
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
            
            draggedElement.style.visibility = 'hidden';
            const eventPos = e.type === 'touchend' ? e.changedTouches[0] : e;
            const dropTarget = document.elementFromPoint(eventPos.clientX, eventPos.clientY);
            draggedElement.style.visibility = 'visible';
            
            let newParent = document.getElementById('mainBowl');
            if (dropTarget) {
                const bowl = dropTarget.closest('.drop-target');
                if (bowl) { newParent = bowl; }
            }
            
            draggedElement.classList.remove('dragging');
            draggedElement.style.top = '';
            draggedElement.style.left = '';
            newParent.appendChild(draggedElement);

            layoutBalls(newParent);
            
            draggedElement = null;
            offsetX = 0; offsetY = 0;
            updateCounts();
        }

        document.addEventListener('DOMContentLoaded', () => { applyTheme('theme-candy'); });