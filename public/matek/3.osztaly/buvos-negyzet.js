let currentTheme = 'theme-candy';
        let currentGridSize = 3;
        let currentNumberPoolMax = 20;
        let magicSquareData = []; 
        let emptyCellCoords = []; 
        let magicSum = 0;

        const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');
        const sizeButtons = document.querySelectorAll('.size-button');
        const rangeButtons = document.querySelectorAll('.range-button');
        const magicSquareGridEl = document.getElementById('magicSquareGrid');
        const magicSumDisplayEl = document.getElementById('magicSumDisplay').querySelector('span');
        const feedbackEl = document.getElementById('magicFeedback');
        const generationErrorEl = document.getElementById('generationErrorMessage');

        function applyTheme(themeClass) {
            bodyEl.className = ''; 
            bodyEl.classList.add(themeClass); 
            currentTheme = themeClass;

            themeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
            rangeButtons.forEach(btn => {
                 btn.classList.toggle('active', parseInt(btn.dataset.range) === currentNumberPoolMax);
            });
             sizeButtons.forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.size) === currentGridSize);
            });
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });

        sizeButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentGridSize = parseInt(button.dataset.size);
                sizeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                generateNewMagicSquare();
            });
        });

        rangeButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentNumberPoolMax = parseInt(button.dataset.range);
                rangeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                generateNewMagicSquare();
            });
        });
        
       function generateMagicSquareInternal(N, maxValInCell) {
            const square = Array(N).fill(null).map(() => Array(N).fill(0));
            const d = 1; 

            const max_a_for_progression = maxValInCell - (N * N - 1) * d;

            if (max_a_for_progression < 1) {
                generationErrorEl.textContent = `A(z) ${N}x${N}-es négyzethez legalább ${N*N}-es számkör szükséges a cellákban (1-től kezdődő, ${d} különbségű sorozat esetén). Jelenlegi maximum: ${maxValInCell}. Kérlek, válassz nagyobb számkört vagy kisebb négyzetet.`;
                generationErrorEl.style.display = 'block';
                magicSquareGridEl.innerHTML = ''; 
                magicSumDisplayEl.textContent = '-';
                return null; 
            }
            generationErrorEl.style.display = 'none';

            const start_a = Math.floor(Math.random() * max_a_for_progression) + 1;

            const numbers = [];
            for (let i = 0; i < N * N; i++) {
                numbers.push(start_a + i * d);
            }

            let num = 1; 
            let r = 0;
            let c = Math.floor(N / 2);

            while (num <= N * N) {
                square[r][c] = numbers[num-1]; 

                num++;
                const prev_r = r;
                const prev_c = c;
                r--;
                c++;

                if (r < 0) r = N - 1;
                if (c === N) c = 0;

                if (square[r][c] !== 0) { 
                    r = (prev_r + 1) % N;
                    c = prev_c;
                }
            }
            
            magicSum = N * (start_a + ((N * N - 1) / 2) * d);
            return square;
        }


        function renderMagicSquare() {
            magicSquareGridEl.innerHTML = '';
            if (!magicSquareData || magicSquareData.length === 0) { 
                magicSumDisplayEl.textContent = '-';
                return;
            }

            const N = currentGridSize;
            const cellSize = (currentNumberPoolMax === 1000 && N === 5) ? 65 : (currentNumberPoolMax === 1000 && N === 3) ? 70 : 50; // Dinamikus cellaméret
            
            magicSquareGridEl.className = 'magic-square-grid'; 
            magicSquareGridEl.classList.add(N === 3 ? 'size-3x3' : 'size-5x5');
            magicSquareGridEl.style.gridTemplateColumns = `repeat(${N}, ${cellSize}px)`;
            magicSquareGridEl.style.gridTemplateRows = `repeat(${N}, ${cellSize}px)`;


            emptyCellCoords = []; 
            const totalCells = N * N;
            let numTargetEmptyCells = Math.max(N, Math.floor(totalCells * 0.4)); 

            const allCellCoords = [];
            for (let r_idx = 0; r_idx < N; r_idx++) {
                for (let c_idx = 0; c_idx < N; c_idx++) {
                    allCellCoords.push({ r: r_idx, c: c_idx });
                }
            }

            for (let i = allCellCoords.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allCellCoords[i], allCellCoords[j]] = [allCellCoords[j], allCellCoords[i]];
            }
            
            const tempEmptySet = new Set(); 

            for(let i=0; i < numTargetEmptyCells && i < allCellCoords.length; i++){
                const coord = allCellCoords[i];
                tempEmptySet.add(`${coord.r}-${coord.c}`);
            }
            
            // --- Post-processing to ensure no line is full ---
            const lines = [];
            for (let r = 0; r < N; r++) { // Rows
                const row = [];
                for (let c = 0; c < N; c++) row.push({ r, c });
                lines.push(row);
            }
            for (let c = 0; c < N; c++) { // Columns
                const col = [];
                for (let r = 0; r < N; r++) col.push({ r, c });
                lines.push(col);
            }
            const diag1 = []; // Main diagonal
            for (let i = 0; i < N; i++) diag1.push({ r: i, c: i });
            lines.push(diag1);
            const diag2 = []; // Anti-diagonal
            for (let i = 0; i < N; i++) diag2.push({ r: i, c: N - 1 - i });
            lines.push(diag2);

            lines.forEach(line => {
                const isFull = line.every(cell => !tempEmptySet.has(`${cell.r}-${cell.c}`));
                if (isFull && line.length > 0) {
                    const cellToEmpty = line[Math.floor(Math.random() * line.length)];
                    tempEmptySet.add(`${cellToEmpty.r}-${cellToEmpty.c}`);
                }
            });
            
            emptyCellCoords = []; // Újraépítjük az emptyCellCoords tömböt a Set alapján
            tempEmptySet.forEach(strCoord => {
                const [r,c] = strCoord.split('-').map(Number);
                emptyCellCoords.push({r,c});
            });
            // --- End of post-processing ---


            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N; c++) {
                    const cell = document.createElement('div');
                    cell.classList.add('magic-square-cell');
                    cell.style.width = `${cellSize}px`;
                    cell.style.height = `${cellSize}px`;
                    
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.dataset.row = r;
                    input.dataset.col = c;
                    input.min = 1; 
                    input.max = currentNumberPoolMax * N * 2; 

                    const isEmpty = emptyCellCoords.some(coord => coord.r === r && coord.c === c);

                    if (isEmpty) {
                        input.value = '';
                        input.disabled = false;
                    } else {
                        input.value = magicSquareData[r][c];
                        input.disabled = true;
                    }
                    cell.appendChild(input);
                    magicSquareGridEl.appendChild(cell);
                }
            }
            magicSumDisplayEl.textContent = magicSum;
        }

        function generateNewMagicSquare() {
            feedbackEl.textContent = '';
            feedbackEl.className = 'feedback';
            generationErrorEl.style.display = 'none'; 

            magicSquareData = generateMagicSquareInternal(currentGridSize, currentNumberPoolMax);
            renderMagicSquare();
        }

        function checkMagicSquare() {
            if (!magicSquareData || magicSquareData.length === 0) {
                 feedbackEl.textContent = 'Először generálj egy feladatot a megfelelő beállításokkal!';
                 feedbackEl.className = 'feedback incorrect';
                 return;
            }
            let isCorrect = true;
            const userInputs = [];
            let allCellsFilled = true;

            for (let r = 0; r < currentGridSize; r++) {
                userInputs[r] = [];
                let rowSum = 0;
                for (let c = 0; c < currentGridSize; c++) {
                    const inputEl = magicSquareGridEl.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
                    if (!inputEl.value && !inputEl.disabled) { 
                        allCellsFilled = false;
                    }
                    const val = parseInt(inputEl.value);
                    if (isNaN(val)) { 
                        if(!inputEl.disabled) isCorrect = false; 
                        userInputs[r][c] = inputEl.disabled ? magicSquareData[r][c] : 0; 
                    } else {
                         userInputs[r][c] = val;
                    }
                    rowSum += userInputs[r][c];
                }
                if (rowSum !== magicSum) isCorrect = false;
            }

            if (!allCellsFilled) {
                feedbackEl.textContent = 'Kérlek, tölts ki minden üres mezőt!';
                feedbackEl.className = 'feedback incorrect';
                return;
            }

            for (let c = 0; c < currentGridSize; c++) {
                let colSum = 0;
                for (let r = 0; r < currentGridSize; r++) {
                    colSum += userInputs[r][c];
                }
                if (colSum !== magicSum) isCorrect = false;
            }

            let diag1Sum = 0;
            let diag2Sum = 0;
            for (let i = 0; i < currentGridSize; i++) {
                diag1Sum += userInputs[i][i];
                diag2Sum += userInputs[i][currentGridSize - 1 - i];
            }
            if (diag1Sum !== magicSum || diag2Sum !== magicSum) isCorrect = false;

            if (isCorrect) {
                feedbackEl.textContent = 'Gratulálok, a bűvös négyzet helyes!';
                feedbackEl.className = 'feedback correct';
            } else {
                feedbackEl.textContent = `Sajnos nem jó. A bűvös összegnek ${magicSum}-nak kellene lennie mindenhol.`;
                feedbackEl.className = 'feedback incorrect';
            }
        }


        function clearFeedback(feedbackEl) {
            setTimeout(() => {
                feedbackEl.textContent = '';
                feedbackEl.className = 'feedback';
            }, 10000); 
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            generateNewMagicSquare(); 
            const defaultTheme = 'theme-candy'; 
            applyTheme(defaultTheme); 
            
            rangeButtons.forEach(btn => { 
                if (parseInt(btn.dataset.range) === currentNumberPoolMax) {
                    btn.classList.add('active');
                }
            });
        });