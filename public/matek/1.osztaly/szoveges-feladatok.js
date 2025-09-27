document.addEventListener('DOMContentLoaded', function() {
            const bodyEl = document.body;
            const themeButtons = document.querySelectorAll('.theme-button');
            const modeButtons = document.querySelectorAll('.mode-button');
            const newTaskButton = document.getElementById('newTaskButton');
            const checkButton = document.getElementById('checkButton');

            const problemTextEl = document.getElementById('problemText');
            const problemVisualAidEl = document.getElementById('problemVisualAid');
            const solutionStepsContainerEl = document.getElementById('solutionStepsContainer');
            const independentAnswerContainerEl = document.getElementById('independentAnswerContainer');
            const independentFinalAnswerInput = document.getElementById('independentFinalAnswer');
            const independentAnswerUnitEl = document.getElementById('independentAnswerUnit');
            const feedbackAreaEl = document.getElementById('feedbackArea');
            const taskTitleEl = document.getElementById('taskTitle');

            let currentTheme = 'theme-candy';
            let currentProblem = null;
            let currentMode = 'step-by-step';
            let currentStepIndex = 0;

            const wordProblems = [
                { id: 1, text: "Zsófinak van 7 piros ceruzája és még 5 kék ceruzája. Hány ceruzája van Zsófinak összesen?", imageDesc: "7 piros ceruza és 5 kék ceruza.", data: [{label: "Piros ceruzák:", value: 7}, {label: "Kék ceruzák:", value: 5}], operation: "+", intermediateResult: 12, finalAnswer: { value: 12, unit: "ceruzája" }, solutionText: "Zsófinak 12 ceruzája van.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] },
                { id: 2, text: "A polcon volt 14 kisautó. Peti levett belőle 6 darabot játszani. Hány kisautó maradt a polcon?", imageDesc: "14 kisautó, 6 áthúzva.", data: [{label: "Összes kisautó:", value: 14}, {label: "Elvett kisautó:", value: 6}], operation: "-", intermediateResult: 8, finalAnswer: { value: 8, unit: "kisautó" }, solutionText: "A polcon 8 kisautó maradt.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] },
                { id: 3, text: "Annának 9 matricája van, Bélának pedig 5. Mennyivel van több matricája Annának, mint Bélának?", imageDesc: "9 zöld csillag és 5 sárga kör.", data: [{label: "Anna matricái:", value: 9}, {label: "Béla matricái:", value: 5}], operation: "-", intermediateResult: 4, finalAnswer: { value: 4, unit: "matricával" }, solutionText: "Annának 4 matricával több van.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] },
                { id: 4, text: "A vázában 8 virág van. Hány virágot kell még beletenni, hogy összesen 15 virág legyen benne?", imageDesc: "Váza 8 virággal, mellette + ? = 15.", data: [{label: "Virágok a vázában:", value: 8}, {label: "Összesen kellene:", value: 15}], operation: "-", displayOperationStyle: "targetMinusStart", intermediateResult: 7, finalAnswer: { value: 7, unit: "virágot" }, solutionText: "Még 7 virágot kell beletenni.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] },
                { id: 5, text: "Peti elment horgászni. Fogott 6 halat, de 2 kis halat visszaengedett a tóba. Hány hala maradt Petinek?", imageDesc: "6 hal, 2 visszaengedve.", data: [{label: "Fogott halak:", value: 6}, {label: "Visszaengedett halak:", value: 2}], operation: "-", intermediateResult: 4, finalAnswer: { value: 4, unit: "hala" }, solutionText: "Petinek 4 hala maradt.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] },
                { id: 6, text: "Az udvaron 5 gyerek focizott. Később csatlakozott hozzájuk még 8 gyerek. Hányan fociznak most az udvaron?", imageDesc: "5 gyerek, majd +8 gyerek.", data: [{label: "Eleinte gyerekek:", value: 5}, {label: "Csatlakozott gyerekek:", value: 8}], operation: "+", intermediateResult: 13, finalAnswer: { value: 13, unit: "gyerek" }, solutionText: "Most 13-an fociznak.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] },
                { id: 7, text: "Volt 17 db építőkockám. Elvesztettem belőle 9 db-ot. Hány építőkockám maradt?", imageDesc: "17 kocka, 9 elveszett.", data: [{label: "Összes kocka:", value: 17}, {label: "Elveszett kocka:", value: 9}], operation: "-", intermediateResult: 8, finalAnswer: { value: 8, unit: "kockám" }, solutionText: "8 építőkockám maradt.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] },
                { id: 8, text: "Édesanya sütött 11 palacsintát. A gyerekek megettek belőle 7-et. Hány palacsinta maradt?", imageDesc: "11 palacsinta, 7 megeve.", data: [{label: "Sütött palacsinták:", value: 11}, {label: "Megevett palacsinták:", value: 7}], operation: "-", intermediateResult: 4, finalAnswer: { value: 4, unit: "palacsinta" }, solutionText: "4 palacsinta maradt.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] },
                { id: 9, text: "A kiskertben 4 piros tulipán és 7 sárga tulipán nyílik. Hány tulipán nyílik összesen a kertben?", imageDesc: "4 piros és 7 sárga tulipán.", data: [{label: "Piros tulipánok:", value: 4}, {label: "Sárga tulipánok:", value: 7}], operation: "+", intermediateResult: 11, finalAnswer: { value: 11, unit: "tulipán" }, solutionText: "Összesen 11 tulipán nyílik.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] },
                { id: 10, text: "Egy tálban 16 szem szőlő volt. Zsófi megevett belőle valamennyit, és 9 szem maradt. Hány szemet evett meg Zsófi?", imageDesc: "Tál 16 szőlővel, majd 9 marad.", data: [{label: "Összes szőlő:", value: 16}, {label: "Maradt szőlő:", value: 9}], operation: "-", displayOperationStyle: "startMinusEnd", intermediateResult: 7, finalAnswer: { value: 7, unit: "szemet" }, solutionText: "Zsófi 7 szemet evett meg.", steps: ["Adatok leolvasása", "Művelet kiválasztása", "Számolás", "Szöveges válasz"] }
            ];

            function applyCurrentTheme() {
                const themes = Array.from(themeButtons).map(btn => btn.dataset.theme);
                themes.forEach(themeClass => bodyEl.classList.remove(themeClass));
                bodyEl.classList.add(currentTheme);
                themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === currentTheme));
                modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === currentMode));
            }

            themeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    currentTheme = button.dataset.theme;
                    applyCurrentTheme();
                });
            });

            modeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    currentMode = button.dataset.mode;
                    if (currentProblem) { loadProblem(currentProblem); }
                    applyCurrentTheme(); // Itt is hívjuk, hogy a gombok állapota frissüljön
                });
            });

            newTaskButton.addEventListener('click', selectRandomProblem);

            function selectRandomProblem() {
                const randomIndex = Math.floor(Math.random() * wordProblems.length);
                currentProblem = wordProblems[randomIndex];
                currentStepIndex = 0;
                solutionStepsContainerEl.innerHTML = ''; 
                loadProblem(currentProblem);
            }

            function loadProblem(problem) {
                if (!problem) return;
                taskTitleEl.textContent = `Szöveges feladat (${problem.id}. feladat)`;
                problemTextEl.textContent = problem.text;
                problemVisualAidEl.innerHTML = ''; // Clear previous visual aid before rendering new one
                renderVisualAid(problem);
                feedbackAreaEl.textContent = '';
                feedbackAreaEl.className = 'feedback';
                independentFinalAnswerInput.classList.remove('correct-input', 'incorrect-input');

                if (currentMode === 'step-by-step') {
                    solutionStepsContainerEl.style.display = 'block';
                    independentAnswerContainerEl.style.display = 'none';
                    checkButton.textContent = 'Következő lépés / Ellenőrzés';
                    // Újrarajzoláskor mindig töröljük és újraépítjük a lépéseket
                    solutionStepsContainerEl.innerHTML = ''; 
                    for (let i = 0; i <= currentStepIndex; i++) {
                        if (i >= problem.steps.length && currentStepIndex < problem.steps.length) { // Ha a currentStepIndex túlmutat, de még nem értünk a végére
                           break;
                        }
                        if (i >= problem.steps.length && currentStepIndex >= problem.steps.length) { // Ha már minden lépés megvolt
                             checkButton.textContent = 'Új feladat';
                             feedbackAreaEl.textContent = `Ügyes vagy, megoldottad a feladatot! A helyes válasz: ${currentProblem.solutionText}`;
                             feedbackAreaEl.className = 'feedback correct';
                             break; 
                        }
                        renderStep(problem, i);
                        if (i < currentStepIndex) { 
                            disableInputsInStep(i, true); 
                        }
                    }
                     if (currentStepIndex >= problem.steps.length) { // Ha már minden lépés megvolt az elején
                         checkButton.textContent = 'Új feladat';
                         feedbackAreaEl.textContent = `Ügyes vagy, megoldottad a feladatot! A helyes válasz: ${currentProblem.solutionText}`;
                         feedbackAreaEl.className = 'feedback correct';
                    }

                } else { /* Önálló mód */
                    solutionStepsContainerEl.style.display = 'none';
                    independentAnswerContainerEl.style.display = 'block';
                    independentFinalAnswerInput.value = '';
                    independentAnswerUnitEl.textContent = problem.finalAnswer.unit;
                    checkButton.textContent = 'Ellenőrzés';
                    setTimeout(() => independentFinalAnswerInput.focus(), 0);
                }
                 applyCurrentTheme(); // Biztosítjuk, hogy a téma mindig frissüljön
            }
            
            function renderVisualAid(problem) {
                const svgNS = "http://www.w3.org/2000/svg";
                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute("viewBox", "0 0 300 120");
                svg.setAttribute("width", "300");
                svg.setAttribute("height", "120");
                problemVisualAidEl.innerHTML = ''; 

                function createText(x, y, content, size = 16, color = "var(--text-color)", anchor = "middle") {
                    let textEl = document.createElementNS(svgNS, "text");
                    textEl.setAttribute("x", String(x)); textEl.setAttribute("y", String(y));
                    textEl.setAttribute("font-size", String(size)); textEl.setAttribute("fill", color);
                    textEl.setAttribute("font-family", "Arial, sans-serif"); textEl.setAttribute("text-anchor", anchor);
                    textEl.textContent = content;
                    return textEl;
                }
                
                if (problem.id === 1) { 
                    const pencilWidth = 12, pencilHeight = 60, tipHeight = 15; let x = 20;
                    for (let i = 0; i < 7; i++) { 
                        let g = document.createElementNS(svgNS, "g"); let body = document.createElementNS(svgNS, "rect");
                        body.setAttribute("x", String(x)); body.setAttribute("y", "30"); body.setAttribute("width", String(pencilWidth)); body.setAttribute("height", String(pencilHeight)); body.setAttribute("fill", "#E57373"); body.setAttribute("rx", "2"); body.setAttribute("ry", "2");
                        let tip = document.createElementNS(svgNS, "polygon"); tip.setAttribute("points", `${x},${30+pencilHeight} ${x+pencilWidth},${30+pencilHeight} ${x+pencilWidth/2},${30+pencilHeight+tipHeight}`); tip.setAttribute("fill", "#D2B48C"); 
                        g.appendChild(body); g.appendChild(tip); svg.appendChild(g); x += pencilWidth + 8;
                    }
                    x += 15; 
                    for (let i = 0; i < 5; i++) { 
                        let g = document.createElementNS(svgNS, "g"); let body = document.createElementNS(svgNS, "rect");
                        body.setAttribute("x", String(x)); body.setAttribute("y", "30"); body.setAttribute("width", String(pencilWidth)); body.setAttribute("height", String(pencilHeight)); body.setAttribute("fill", "#64B5F6"); body.setAttribute("rx", "2"); body.setAttribute("ry", "2");
                        let tip = document.createElementNS(svgNS, "polygon"); tip.setAttribute("points", `${x},${30+pencilHeight} ${x+pencilWidth},${30+pencilHeight} ${x+pencilWidth/2},${30+pencilHeight+tipHeight}`); tip.setAttribute("fill", "#D2B48C");
                        g.appendChild(body); g.appendChild(tip); svg.appendChild(g); x += pencilWidth + 8;
                    }
                } else if (problem.id === 2) { 
                    const carWidth = 35, carHeight = 20, wheelRadius = 5; let x = 15, y = 75;
                    let shelf = document.createElementNS(svgNS, "rect"); shelf.setAttribute("x", "10"); shelf.setAttribute("y", String(y + carHeight - wheelRadius + 3)); shelf.setAttribute("width", "280"); shelf.setAttribute("height", "8"); shelf.setAttribute("fill", "#A1887F"); shelf.setAttribute("rx", "3"); shelf.setAttribute("ry", "3"); svg.appendChild(shelf);
                    for (let i = 0; i < 14; i++) {
                        let g = document.createElementNS(svgNS, "g");
                        let body = document.createElementNS(svgNS, "rect"); body.setAttribute("x", String(x)); body.setAttribute("y", String(y)); body.setAttribute("width", String(carWidth)); body.setAttribute("height", String(carHeight - wheelRadius)); body.setAttribute("rx", "5"); body.setAttribute("ry", "5");
                        let roof = document.createElementNS(svgNS, "rect"); roof.setAttribute("x", String(x + carWidth/4)); roof.setAttribute("y", String(y - (carHeight - wheelRadius)/2 +2)); roof.setAttribute("width", String(carWidth/2)); roof.setAttribute("height", String((carHeight - wheelRadius)/2)); roof.setAttribute("rx", "3"); roof.setAttribute("ry", "3");
                        let wheel1 = document.createElementNS(svgNS, "circle"); wheel1.setAttribute("cx", String(x + wheelRadius + 5)); wheel1.setAttribute("cy", String(y + carHeight - wheelRadius)); wheel1.setAttribute("r", String(wheelRadius)); wheel1.setAttribute("fill", "#424242");
                        let wheel2 = document.createElementNS(svgNS, "circle"); wheel2.setAttribute("cx", String(x + carWidth - wheelRadius - 5)); wheel2.setAttribute("cy", String(y + carHeight - wheelRadius)); wheel2.setAttribute("r", String(wheelRadius)); wheel2.setAttribute("fill", "#424242");
                        
                        if (i < (14 - 6)) { 
                            body.setAttribute("fill", "#81C784"); roof.setAttribute("fill", "#A5D6A7");
                        } else { 
                            body.setAttribute("fill", "#E0E0E0"); roof.setAttribute("fill", "#F5F5F5"); g.setAttribute("opacity", "0.5");
                            let cross1 = document.createElementNS(svgNS, "line"); cross1.setAttribute("x1", String(x)); cross1.setAttribute("y1", String(y - (carHeight-wheelRadius)/2 +2)); cross1.setAttribute("x2", String(x + carWidth)); cross1.setAttribute("y2", String(y + carHeight - wheelRadius)); cross1.setAttribute("stroke", "#D32F2F"); cross1.setAttribute("stroke-width", "2.5");
                            let cross2 = document.createElementNS(svgNS, "line"); cross2.setAttribute("x1", String(x + carWidth)); cross2.setAttribute("y1", String(y - (carHeight-wheelRadius)/2 +2)); cross2.setAttribute("x2", String(x)); cross2.setAttribute("y2", String(y + carHeight - wheelRadius)); cross2.setAttribute("stroke", "#D32F2F"); cross2.setAttribute("stroke-width", "2.5");
                            g.appendChild(cross1); g.appendChild(cross2);
                        }
                        g.appendChild(body); g.appendChild(roof); g.appendChild(wheel1); g.appendChild(wheel2); svg.appendChild(g); x += carWidth + 5;
                    }
                } else if (problem.id === 3) { 
                    const itemSize = 20; let x = 20;
                    svg.appendChild(createText(65 , 28, "Anna (9):", 14, "var(--task-instruction-color)", "start"));
                    for (let i = 0; i < 9; i++) {
                        let star = document.createElementNS(svgNS, "polygon"); let points = "";
                        for (let k = 0; k < 5; k++) { points += (x + itemSize/2 + itemSize/2 * Math.cos(2 * Math.PI * k / 5 - Math.PI / 2)) + "," + (50 + itemSize/2 + itemSize/2 * Math.sin(2 * Math.PI * k / 5 - Math.PI / 2)) + " "; points += (x + itemSize/2 + itemSize/4 * Math.cos(2 * Math.PI * (k + 0.5) / 5 - Math.PI / 2)) + "," + (50 + itemSize/2 + itemSize/4 * Math.sin(2 * Math.PI * (k + 0.5) / 5 - Math.PI / 2)) + " ";}
                        star.setAttribute("points", points); star.setAttribute("fill", "#AED581"); star.setAttribute("stroke", "#558B2F"); star.setAttribute("stroke-width", "1.5"); svg.appendChild(star); x += itemSize + 6;
                    }
                    x = 20;
                    svg.appendChild(createText(65, 83, "Béla (5):", 14, "var(--task-instruction-color)", "start"));
                    for (let i = 0; i < 5; i++) {
                        let circle = document.createElementNS(svgNS, "circle"); circle.setAttribute("cx", String(x + itemSize/2)); circle.setAttribute("cy", "105"); circle.setAttribute("r", String(itemSize/2)); circle.setAttribute("fill", "#FFD54F"); circle.setAttribute("stroke", "#FFA000"); circle.setAttribute("stroke-width", "1.5"); svg.appendChild(circle); x += itemSize + 6;
                    }
                } else if (problem.id === 4) { 
                    let vase = document.createElementNS(svgNS, "path"); vase.setAttribute("d", "M40,100 C30,80 30,50 40,30 L50,15 H100 L110,30 C120,50 120,80 110,100 Z"); vase.setAttribute("fill", "#B2EBF2"); vase.setAttribute("stroke", "#00ACC1"); vase.setAttribute("stroke-width", "2"); svg.appendChild(vase);
                    const flowerCoords = [{x:55,y:40},{x:75,y:30},{x:95,y:40},{x:45,y:60},{x:65,y:50},{x:85,y:60},{x:50,y:20},{x:90,y:20}];
                    for(let i=0; i < 8; i++) {
                        let flower = document.createElementNS(svgNS, "g"); let stem = document.createElementNS(svgNS, "line"); stem.setAttribute("x1", String(flowerCoords[i].x)); stem.setAttribute("y1", String(flowerCoords[i].y + 25)); stem.setAttribute("x2", String(flowerCoords[i].x)); stem.setAttribute("y2", String(flowerCoords[i].y + 5)); stem.setAttribute("stroke", "#7CB342"); stem.setAttribute("stroke-width", "2");
                        let head = document.createElementNS(svgNS, "circle"); head.setAttribute("cx", String(flowerCoords[i].x)); head.setAttribute("cy", String(flowerCoords[i].y)); head.setAttribute("r", "10"); head.setAttribute("fill", "#FFB74D"); flower.appendChild(stem); flower.appendChild(head); svg.appendChild(flower);
                    }
                    svg.appendChild(createText(160, 60, "8", 24, "var(--text-color)")); svg.appendChild(createText(190, 60, "+", 24, "var(--text-color)"));
                    svg.appendChild(createText(220, 60, "?", 30, "var(--h1-color)")); svg.appendChild(createText(250, 60, "=", 24, "var(--text-color)"));
                    svg.appendChild(createText(280, 60, "15", 24, "var(--text-color)"));
                } else if (problem.id === 5) { 
                    const fishW = 30, fishH = 15; let x = 30, y = 50;
                    let water = document.createElementNS(svgNS, "path"); water.setAttribute("d", "M0,100 Q75,80 150,100 T300,100 V120 H0 Z"); water.setAttribute("fill", "#81D4FA"); water.setAttribute("opacity", "0.6"); svg.appendChild(water);
                    for (let i = 0; i < 6; i++) {
                        let g = document.createElementNS(svgNS, "g"); let body = document.createElementNS(svgNS, "ellipse"); body.setAttribute("cx", String(x)); body.setAttribute("cy", String(y)); body.setAttribute("rx", String(fishW/2)); body.setAttribute("ry", String(fishH/2));
                        let tail = document.createElementNS(svgNS, "polygon"); tail.setAttribute("points", `${x-fishW/2},${y} ${x-fishW/2-10},${y-fishH/2+3} ${x-fishW/2-10},${y+fishH/2-3}`);
                        if (i < 2) { 
                            body.setAttribute("fill", "#FFCC80"); tail.setAttribute("fill", "#FFCC80"); g.setAttribute("opacity", "0.7");
                            svg.appendChild(createText(x, y + fishH + 10, "vissza", 10, "#0277BD"));
                        } else { 
                            body.setAttribute("fill", "#4DB6AC"); tail.setAttribute("fill", "#4DB6AC");
                        }
                        g.appendChild(body); g.appendChild(tail); svg.appendChild(g); x += fishW + 12;
                    }
                } else if (problem.id === 6) { 
                    const kidR = 12; let x = 30, y=50;
                    for(let i=0; i<5; i++) { let kid = document.createElementNS(svgNS, "circle"); kid.setAttribute("cx", String(x + i*(kidR*2+8))); kid.setAttribute("cy", String(y)); kid.setAttribute("r", String(kidR)); kid.setAttribute("fill", "#9575CD"); svg.appendChild(kid); }
                    let ball = document.createElementNS(svgNS, "circle"); ball.setAttribute("cx", String(x + 2*(kidR*2+8) + kidR)); ball.setAttribute("cy", String(y+kidR+18)); ball.setAttribute("r", String(kidR/1.8)); ball.setAttribute("fill", "white"); ball.setAttribute("stroke", "black"); ball.setAttribute("stroke-width", "1.5"); svg.appendChild(ball);
                    svg.appendChild(createText(x + 5*(kidR*2+8) + 5, y+5, "+", 30, "var(--h1-color)"));
                    x = x + 5*(kidR*2+8) + 40;
                    for(let i=0; i<8; i++) { let kid = document.createElementNS(svgNS, "circle"); let currentX = x + (i % 3) * (kidR * 2 + 8); let currentY = y + Math.floor(i / 3) * (kidR * 2 + 10); kid.setAttribute("cx", String(currentX)); kid.setAttribute("cy", String(currentY)); kid.setAttribute("r", String(kidR)); kid.setAttribute("fill", "#7986CB"); svg.appendChild(kid); }
                } else if (problem.id === 7) { 
                    const blockS = 22; let x=20, y=15; const cols = 6;
                    const colors = ["#EF9A9A", "#CE93D8", "#90CAF9", "#A5D6A7", "#FFE082", "#FFAB91"];
                    for(let i=0; i<17; i++) {
                        let block = document.createElementNS(svgNS, "rect"); block.setAttribute("x", String(x + (i%cols)*(blockS+3))); block.setAttribute("y", String(y + Math.floor(i/cols)*(blockS+3))); block.setAttribute("width", String(blockS)); block.setAttribute("height", String(blockS)); block.setAttribute("rx", "3"); block.setAttribute("ry", "3"); block.setAttribute("stroke", "#5D4037"); block.setAttribute("stroke-width", "1");
                        if(i < (17-9) ) { block.setAttribute("fill", colors[i % colors.length]); } 
                        else { 
                            block.setAttribute("fill", "#BDBDBD"); block.setAttribute("opacity", "0.5");
                            let cross1 = document.createElementNS(svgNS, "line"); cross1.setAttribute("x1", String(x + (i%cols)*(blockS+3))); cross1.setAttribute("y1", String(y + Math.floor(i/cols)*(blockS+3))); cross1.setAttribute("x2", String(x + (i%cols)*(blockS+3) + blockS)); cross1.setAttribute("y2", String(y + Math.floor(i/cols)*(blockS+3) + blockS)); cross1.setAttribute("stroke", "#BF360C"); cross1.setAttribute("stroke-width", "2"); svg.appendChild(cross1);
                            let cross2 = document.createElementNS(svgNS, "line"); cross2.setAttribute("x1", String(x + (i%cols)*(blockS+3) + blockS)); cross2.setAttribute("y1", String(y + Math.floor(i/cols)*(blockS+3))); cross2.setAttribute("x2", String(x + (i%cols)*(blockS+3))); cross2.setAttribute("y2", String(y + Math.floor(i/cols)*(blockS+3) + blockS)); cross2.setAttribute("stroke", "#BF360C"); cross2.setAttribute("stroke-width", "2"); svg.appendChild(cross2);
                        }
                        svg.appendChild(block);
                    }
                } else if (problem.id === 8) { 
                    const pW = 100, pH = 6; let x = 150, y = 105;
                    let plate = document.createElementNS(svgNS, "ellipse"); plate.setAttribute("cx", String(x)); plate.setAttribute("cy", String(y+pH*1.5)); plate.setAttribute("rx", String(pW/2 + 15)); plate.setAttribute("ry", "12"); plate.setAttribute("fill", "#E3F2FD"); plate.setAttribute("stroke", "#64B5F6"); plate.setAttribute("stroke-width", "2"); svg.appendChild(plate);
                    for(let i=0; i<11; i++) {
                        let pancake = document.createElementNS(svgNS, "ellipse"); pancake.setAttribute("cx", String(x)); pancake.setAttribute("cy", String(y - i*pH)); pancake.setAttribute("rx", String(pW/2)); pancake.setAttribute("ry", String(pH/1.5)); pancake.setAttribute("stroke", "#D7CCC8"); pancake.setAttribute("stroke-width", "1");
                        if(i < (11-7)) { pancake.setAttribute("fill", "#FFF176");} 
                        else { pancake.setAttribute("fill", "#FFF9C4"); pancake.setAttribute("opacity", "0.4"); }
                        svg.appendChild(pancake);
                    }
                    svg.appendChild(createText(x, 20, "11 palacsinta volt, 7 elfogyott", 14, "var(--task-instruction-color)"));
                } else if (problem.id === 9) { 
                    const tW = 25, tH = 35, stemH = 45; let x = 20, y = 25;
                    for(let i=0; i<4; i++) {
                        let g = document.createElementNS(svgNS, "g"); let stem = document.createElementNS(svgNS, "line"); stem.setAttribute("x1", String(x + tW/2)); stem.setAttribute("y1", String(y + tH + stemH)); stem.setAttribute("x2", String(x + tW/2)); stem.setAttribute("y2", String(y + tH)); stem.setAttribute("stroke", "#7CB342"); stem.setAttribute("stroke-width", "3");
                        let head = document.createElementNS(svgNS, "path"); head.setAttribute("d", `M${x} ${y+tH} C${x} ${y+10}, ${x+tW} ${y+10}, ${x+tW} ${y+tH} Q${x+tW/2} ${y+tH-15}, ${x} ${y+tH} Z`); head.setAttribute("fill", "#EC407A"); g.appendChild(stem); g.appendChild(head); svg.appendChild(g); x += tW + 8;
                    }
                    x += 15; 
                    for(let i=0; i<7; i++) {
                        let g = document.createElementNS(svgNS, "g"); let stem = document.createElementNS(svgNS, "line"); stem.setAttribute("x1", String(x + tW/2)); stem.setAttribute("y1", String(y + tH + stemH)); stem.setAttribute("x2", String(x + tW/2)); stem.setAttribute("y2", String(y + tH)); stem.setAttribute("stroke", "#7CB342"); stem.setAttribute("stroke-width", "3");
                        let head = document.createElementNS(svgNS, "path"); head.setAttribute("d", `M${x} ${y+tH} C${x} ${y+10}, ${x+tW} ${y+10}, ${x+tW} ${y+tH} Q${x+tW/2} ${y+tH-15}, ${x} ${y+tH} Z`); head.setAttribute("fill", "#FFEE58"); g.appendChild(stem); g.appendChild(head); svg.appendChild(g); x += tW + 8;
                        if (i === 3 && x > 250) { x = 20 + 4*(tW+8)+15; y += stemH; } // Új sor, ha kell
                    }
                } else if (problem.id === 10) { 
                    const grapeR = 8; let cX1 = 70, cY = 50;
                    let bowl1 = document.createElementNS(svgNS, "path"); bowl1.setAttribute("d", `M${cX1-50} ${cY+20} Q${cX1} ${cY+50}, ${cX1+50} ${cY+20} L ${cX1+40} ${cY+60} L ${cX1-40} ${cY+60} Z`); bowl1.setAttribute("fill", "#F5F5F5"); bowl1.setAttribute("stroke", "#9E9E9E"); svg.appendChild(bowl1);
                    let grapeCount1 = 0;
                    for(let row=0; row<5 && grapeCount1<16; row++){ for(let col=0; col<4 && grapeCount1<16; col++){ if(Math.random()>0.3 || row<3){ let grape = document.createElementNS(svgNS, "circle"); grape.setAttribute("cx", String(cX1 -30 + col*(grapeR*2-1) + row%2*grapeR)); grape.setAttribute("cy", String(cY -15 + row*(grapeR*2-4))); grape.setAttribute("r", String(grapeR)); grape.setAttribute("fill", "#7E57C2"); svg.appendChild(grape); grapeCount1++;}}}
                    svg.appendChild(createText(cX1, cY + 55, "16 db", 14, "var(--task-instruction-color)"));
                    svg.appendChild(createText(150, 65, "➔", 30, "var(--h1-color)"));
                    let cX2 = 230;
                    let bowl2 = document.createElementNS(svgNS, "path"); bowl2.setAttribute("d", `M${cX2-50} ${cY+20} Q${cX2} ${cY+50}, ${cX2+50} ${cY+20} L ${cX2+40} ${cY+60} L ${cX2-40} ${cY+60} Z`); bowl2.setAttribute("fill", "#F5F5F5"); bowl2.setAttribute("stroke", "#9E9E9E"); svg.appendChild(bowl2);
                    let grapeCount2 = 0;
                    for(let row=0; row<4 && grapeCount2<9; row++){ for(let col=0; col<3 && grapeCount2<9; col++){ if(Math.random()>0.2 || row<2){let grape = document.createElementNS(svgNS, "circle"); grape.setAttribute("cx", String(cX2 -20 + col*(grapeR*2-1) + row%2*grapeR)); grape.setAttribute("cy", String(cY + row*(grapeR*2-4))); grape.setAttribute("r", String(grapeR)); grape.setAttribute("fill", "#7E57C2"); svg.appendChild(grape); grapeCount2++; }}}
                    svg.appendChild(createText(cX2, cY + 55, "9 db maradt", 14, "var(--task-instruction-color)"));
                } else { 
                    let p = document.createElement("p"); p.textContent = problem.imageDesc || "Kép helye."; p.style.color = "var(--text-color)"; problemVisualAidEl.appendChild(p); return; 
                }
                problemVisualAidEl.appendChild(svg);
            }

            function disableInputsInStep(stepIdx, markAsSolved = true) {
                const stepContainer = solutionStepsContainerEl.querySelector(`.step-container[data-step-index="${stepIdx}"]`);
                if (stepContainer) {
                    stepContainer.querySelectorAll('input, select').forEach(el => { el.disabled = true; });
                    if(markAsSolved) { stepContainer.classList.add('solved'); }
                }
            }

            function updateDisplayedOperation(selectedOperation, displayElement, problem) {
                if (!displayElement) return; 
                if (selectedOperation && problem.data.length >= 2) {
                    let opStr = "";
                    if (problem.displayOperationStyle === "targetMinusStart" && problem.operation === selectedOperation) { 
                        opStr = `${problem.data[1].value} ${selectedOperation} ${problem.data[0].value} =`;
                    } else if (problem.displayOperationStyle === "startMinusEnd" && problem.operation === selectedOperation) { 
                        opStr = `${problem.data[0].value} ${selectedOperation} ${problem.data[1].value} =`;
                    } else if (problem.data.length >= 2) { 
                        const num1 = problem.data[0].value; const num2 = problem.data[1].value;
                         opStr = `${num1} ${selectedOperation} ${num2} =`;
                    } else { opStr = "Válassz műveletet!"; }
                    displayElement.textContent = opStr;
                } else if (selectedOperation === "" && displayElement) { displayElement.textContent = 'Válassz műveletet!';
                } else if (displayElement) { displayElement.textContent = 'Az adatok hiányoznak.'; }
            }

            function renderStep(problem, stepIdx) {
                const stepType = problem.steps[stepIdx];
                const stepDiv = document.createElement('div');
                stepDiv.classList.add('step-container'); stepDiv.dataset.stepIndex = stepIdx; 
                let html = `<h4>${stepIdx + 1}. lépés: ${stepType}</h4>`;
                let nextFocusEl = null;
                switch(stepType) {
                    case "Adatok leolvasása":
                        problem.data.forEach((d, index) => { html += `<div class="input-group"><label for="data_input_${stepIdx}_${index}">${d.label}</label><input type="number" id="data_input_${stepIdx}_${index}" min="0" data-correct="${d.value}"></div>`; });
                        nextFocusEl = `#data_input_${stepIdx}_0`; break;
                    case "Művelet kiválasztása":
                        html += `<div class="input-group"><label for="operation_select_${stepIdx}">Válaszd ki a műveletet:</label><select id="operation_select_${stepIdx}"><option value="">--Válassz--</option><option value="+">Összeadás (+)</option><option value="-">Kivonás (-)</option></select></div><div class="input-group"><label>A művelet:</label><p id="displayed_operation_text_${stepIdx}" style="font-weight: bold; font-size: 1.1em; padding: 8px; border-radius: 4px; margin: 5px 0; color: var(--h2-color);"></p></div>`;
                        nextFocusEl = `#operation_select_${stepIdx}`; break;
                    case "Számolás":
                        let displayOpText = "";
                        const prevOpDisplayContainer = solutionStepsContainerEl.querySelector(`.step-container[data-step-index="${stepIdx -1}"]`);
                        if(prevOpDisplayContainer){ const prevOpDisplay = prevOpDisplayContainer.querySelector(`#displayed_operation_text_${stepIdx -1}`); if(prevOpDisplay && prevOpDisplay.textContent.includes("=")) { displayOpText = prevOpDisplay.textContent; }}
                        if (displayOpText === "" || !displayOpText.includes("=")) { if (problem.displayOperationStyle === "targetMinusStart") { displayOpText = `${problem.data[1].value} ${problem.operation} ${problem.data[0].value} =`; } else if (problem.displayOperationStyle === "startMinusEnd") { displayOpText = `${problem.data[0].value} ${problem.operation} ${problem.data[1].value} =`; } else if (problem.data.length >=2){ displayOpText = problem.data.map(d => d.value).join(` ${problem.operation} `) + " =";} else { displayOpText = "Művelet = "}}
                        html += `<div class="input-group"><label for="calculation_result_${stepIdx}">${displayOpText}</label><input type="number" id="calculation_result_${stepIdx}" min="0" data-correct="${problem.intermediateResult}"></div>`;
                        nextFocusEl = `#calculation_result_${stepIdx}`; break;
                    case "Szöveges válasz":
                        html += `<div class="input-group"><label>A válasz mondatban:</label><p id="displayed_text_answer_content" style="font-weight: bold; font-size: 1.1em; padding: 8px; border-radius: 4px; margin: 5px 0; background-color: var(--feedback-correct-bg-color); color: var(--feedback-correct-text-color); border: 1px solid var(--feedback-correct-border-color);">${problem.solutionText}</p></div>`;
                        break;
                }
                stepDiv.innerHTML = html; solutionStepsContainerEl.appendChild(stepDiv);
                if (stepType === "Művelet kiválasztása") {
                    const opSelectEl = stepDiv.querySelector(`#operation_select_${stepIdx}`); const displayedOpTextEl = stepDiv.querySelector(`#displayed_operation_text_${stepIdx}`);
                    if (opSelectEl && displayedOpTextEl) { updateDisplayedOperation(opSelectEl.value, displayedOpTextEl, problem); opSelectEl.addEventListener('change', function() { updateDisplayedOperation(this.value, displayedOpTextEl, problem); }); }
                }
                if (nextFocusEl) { setTimeout(() => { const elToFocus = document.querySelector(nextFocusEl); if (elToFocus) elToFocus.focus(); }, 0);
                } else if (stepType === "Szöveges válasz") { setTimeout(() => checkButton.focus(), 0); }
                applyCurrentTheme();
            }

            function handleCheckButtonClick() {
                if (!currentProblem) return; if (checkButton.textContent === 'Új feladat') { selectRandomProblem(); return; }
                if (currentMode === 'independent') { checkIndependentAnswer(); } else { checkStepAnswer(); }
            }
            checkButton.addEventListener('click', handleCheckButtonClick);

            function checkIndependentAnswer() {
                const userAnswer = parseInt(independentFinalAnswerInput.value);
                if (isNaN(userAnswer)) { feedbackAreaEl.textContent = 'Kérlek, adj meg egy számot!'; feedbackAreaEl.className = 'feedback incorrect'; independentFinalAnswerInput.classList.add('incorrect-input'); independentFinalAnswerInput.classList.remove('correct-input'); return; }
                if (userAnswer === currentProblem.finalAnswer.value) { feedbackAreaEl.textContent = `Helyes! A válasz: ${currentProblem.solutionText}`; feedbackAreaEl.className = 'feedback correct'; independentFinalAnswerInput.classList.add('correct-input'); independentFinalAnswerInput.classList.remove('correct-input'); checkButton.textContent = 'Új feladat';
                } else { feedbackAreaEl.textContent = `Nem jó. A helyes válasz: ${currentProblem.solutionText}`; feedbackAreaEl.className = 'feedback incorrect'; independentFinalAnswerInput.classList.add('incorrect-input'); independentFinalAnswerInput.classList.remove('correct-input'); }
            }

            function checkStepAnswer() {
                if (currentStepIndex >= currentProblem.steps.length) return;
                const stepType = currentProblem.steps[currentStepIndex]; let correct = false;
                const currentStepDiv = solutionStepsContainerEl.querySelector(`.step-container[data-step-index="${currentStepIndex}"]`);
                if (!currentStepDiv) { console.error("Nem található a lépés konténer:", currentStepIndex); return; }

                switch(stepType) {
                    case "Adatok leolvasása": let allDataCorrect = true; currentProblem.data.forEach((d, index) => { const inputEl = currentStepDiv.querySelector(`#data_input_${currentStepIndex}_${index}`); if (!inputEl) { allDataCorrect = false; return; } if (parseInt(inputEl.value) === d.value) { inputEl.classList.add('correct-input'); inputEl.classList.remove('incorrect-input'); } else { inputEl.classList.add('incorrect-input'); inputEl.classList.remove('correct-input'); allDataCorrect = false; }}); correct = allDataCorrect; break;
                    case "Művelet kiválasztása": const opSelect = currentStepDiv.querySelector(`#operation_select_${currentStepIndex}`); if (!opSelect) { correct = false; break; } if (opSelect.value === currentProblem.operation) { opSelect.classList.add('correct-input'); opSelect.classList.remove('incorrect-input'); correct = true; } else { opSelect.classList.add('incorrect-input'); opSelect.classList.remove('correct-input'); correct = false; } break;
                    case "Számolás": const calcResultInput = currentStepDiv.querySelector(`#calculation_result_${currentStepIndex}`); if (!calcResultInput) { correct = false; break; } if (parseInt(calcResultInput.value) === currentProblem.intermediateResult) { calcResultInput.classList.add('correct-input'); calcResultInput.classList.remove('incorrect-input'); correct = true; } else { calcResultInput.classList.add('incorrect-input'); calcResultInput.classList.remove('correct-input'); correct = false; } break;
                    case "Szöveges válasz": correct = true; break;
                }

                if (correct) {
                    disableInputsInStep(currentStepIndex); currentStepIndex++;
                    if (currentStepIndex < currentProblem.steps.length) { renderStep(currentProblem, currentStepIndex); feedbackAreaEl.textContent = 'Helyes! Következhet a következő lépés.'; feedbackAreaEl.className = 'feedback correct'; checkButton.textContent = 'Következő lépés / Ellenőrzés';
                    } else { feedbackAreaEl.textContent = `Ügyes vagy, megoldottad a feladatot! A helyes válasz: ${currentProblem.solutionText}`; feedbackAreaEl.className = 'feedback correct'; checkButton.textContent = 'Új feladat'; }
                } else {
                    feedbackAreaEl.textContent = 'Valami nem jó. Próbáld újra!'; feedbackAreaEl.className = 'feedback incorrect';
                    const firstIncorrect = currentStepDiv.querySelector('input.incorrect-input, select.incorrect-input'); if(firstIncorrect) setTimeout(() => firstIncorrect.focus(), 0);
                    checkButton.textContent = 'Következő lépés / Ellenőrzés';
                }
            }
            applyCurrentTheme();
            selectRandomProblem();
        });