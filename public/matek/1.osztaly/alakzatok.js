initializeFirebaseAndLogger();

// --- GLOBÁLIS KONSTANSOK ÉS SEGÉDFÜGGVÉNYEK ---
        const SVG_NS = "http://www.w3.org/2000/svg";
        const ALL_SHAPE_TYPES = [
            "kor", "negyzet", "haromszog", "teglalap",
            "otszog", "hatszog", "trapez", "rombusz", "paralelogramma"
        ];
        const SHAPE_CATEGORIES = {
            "kor": "kor",
            "negyzet": "negyszog",
            "teglalap": "negyszog",
            "rombusz": "negyszog",
            "paralelogramma": "negyszog",
            "trapez": "negyszog",
            "haromszog": "haromszog",
            "otszog": "otszog", 
            "hatszog": "hatszog" 
        };

        const SHAPE_NAMES = {
            kor: "Kör", negyzet: "Négyzet", haromszog: "Háromszög", teglalap: "Téglalap",
            otszog: "Ötszög", hatszog: "Hatszög", trapez: "Trapéz", rombusz: "Rombusz",
            paralelogramma: "Paralelogramma"
        };
        const SHAPE_NAMES_PLURAL = {
            kor: "köröket", negyzet: "négyzeteket", haromszog: "háromszögeket", teglalap: "téglalapokat",
            otszog: "ötszögeket", hatszog: "hatszögeket", trapez: "trapézokat", rombusz: "rombuszokat",
            paralelogramma: "paralelogrammákat"
        };
        const SHAPE_NEVELO = {
            kor: "a", negyzet: "a", haromszog: "a", teglalap: "a",
            otszog: "az", hatszog: "a", trapez: "a", rombusz: "a",
            paralelogramma: "a"
        };


        const TASK8_COLORS = [
            { name: "piros", value: "#FF0000" }, { name: "kék", value: "#0000FF" },
            { name: "zöld", value: "#008000" }, { name: "sárga", value: "#FFFF00" },
            { name: "narancs", value: "#FFA500" }, { name: "lila", value: "#8f00ff" },
            { name: "rózsaszín", value: "#ff6fff" }, { name: "barna", value: "#A52A2A" }
        ];

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function getThemeColor(variableName, fallbackColor) {
            if (document.body) {
                const color = getComputedStyle(document.body).getPropertyValue(variableName).trim();
                return color || fallbackColor;
            }
            return fallbackColor;
        }

        function createShapeSvg(type, size = 70, options = {}) {
            const svg = document.createElementNS(SVG_NS, "svg");
            svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
            svg.setAttribute("width", size);
            svg.setAttribute("height", size);

            const strokeWidth = options.strokeWidth || Math.max(1, size * 0.035);
            const padding = strokeWidth / 2;

            const defaultFill = getThemeColor('--shape-fill-default', '#d1d5db');
            const defaultStroke = getThemeColor('--shape-stroke-default', '#6b7280');
            const shadowFill = getThemeColor('--shadow-fill-default', '#a1a1aa');

            const currentFill = options.isShadow ? shadowFill : (options.fill || defaultFill);
            const currentStroke = options.isShadow ? "none" : (options.stroke || defaultStroke);

            let shapeEl;
            switch (type) {
                case "kor":
                    shapeEl = document.createElementNS(SVG_NS, "circle");
                    shapeEl.setAttribute("cx", size / 2);
                    shapeEl.setAttribute("cy", size / 2);
                    shapeEl.setAttribute("r", Math.max(1, size / 2 - padding));
                    break;
                case "negyzet":
                    shapeEl = document.createElementNS(SVG_NS, "rect");
                    shapeEl.setAttribute("x", padding);
                    shapeEl.setAttribute("y", padding);
                    shapeEl.setAttribute("width", Math.max(1, size - 2 * padding));
                    shapeEl.setAttribute("height", Math.max(1, size - 2 * padding));
                    shapeEl.setAttribute("rx", size * 0.05);
                    break;
                case "haromszog":
                    shapeEl = document.createElementNS(SVG_NS, "polygon");
                    const sideH_eq = size - 2 * padding;
                    const triangleHeight_eq = (Math.sqrt(3) / 2) * sideH_eq;
                    const topYH_eq = (size - triangleHeight_eq) / 2 ;
                    const bottomYH_eq = topYH_eq + triangleHeight_eq;
                    shapeEl.setAttribute("points", `${size/2},${topYH_eq} ${padding},${bottomYH_eq} ${size-padding},${bottomYH_eq}`);
                    break;
                case "teglalap":
                    shapeEl = document.createElementNS(SVG_NS, "rect");
                    shapeEl.setAttribute("x", padding);
                    shapeEl.setAttribute("y", size * 0.25 + padding / 2);
                    shapeEl.setAttribute("width", Math.max(1, size - 2 * padding));
                    shapeEl.setAttribute("height", Math.max(1, size * 0.5 - padding));
                    shapeEl.setAttribute("rx", size * 0.05);
                    break;
                case "otszog":
                    shapeEl = document.createElementNS(SVG_NS, "polygon");
                    let pointsO = "";
                    const radiusO = size / 2 - padding;
                    const centerXO = size / 2;
                    const centerYO = size / 2;
                    for (let i = 0; i < 5; i++) {
                        pointsO += `${centerXO + radiusO * Math.cos(Math.PI / 2 - (2 * Math.PI * i) / 5)},${centerYO - radiusO * Math.sin(Math.PI / 2 - (2 * Math.PI * i) / 5)} `;
                    }
                    shapeEl.setAttribute("points", pointsO.trim());
                    break;
                case "hatszog":
                    shapeEl = document.createElementNS(SVG_NS, "polygon");
                    let pointsHex = "";
                    const radiusHex = size / 2 - padding;
                    const centerXHex = size/2;
                    const centerYHex = size/2;
                    for (let i = 0; i < 6; i++) {
                        pointsHex += `${centerXHex + radiusHex * Math.cos((Math.PI/6) + (2 * Math.PI * i) / 6)},${centerYHex + radiusHex * Math.sin((Math.PI/6) + (2 * Math.PI * i) / 6)} `;
                    }
                    shapeEl.setAttribute("points", pointsHex.trim());
                    break;
                case "trapez":
                    shapeEl = document.createElementNS(SVG_NS, "polygon");
                    const topWidthT = (size - 2 * padding) * 0.6;
                    const bottomWidthT = size - 2 * padding;
                    const heightT = (size - 2 * padding) * 0.7;
                    const topY_T = (size - heightT) / 2;
                    const bottomY_T = topY_T + heightT;
                    const topX1_T = (size - topWidthT) / 2;
                    const topX2_T = topX1_T + topWidthT;
                    const bottomX1_T = padding;
                    const bottomX2_T = size-padding;
                    shapeEl.setAttribute("points", `${topX1_T},${topY_T} ${topX2_T},${topY_T} ${bottomX2_T},${bottomY_T} ${bottomX1_T},${bottomY_T}`);
                    break;
                case "rombusz":
                    shapeEl = document.createElementNS(SVG_NS, "polygon");
                    const midX_R = size / 2;
                    const midY_R = size / 2;
                    const diagX_R = size - 2 * padding;
                    const diagY_R = (size - 2 * padding) * 0.7;
                    shapeEl.setAttribute("points", `${midX_R},${midY_R - diagY_R/2} ${midX_R + diagX_R/2},${midY_R} ${midX_R},${midY_R + diagY_R/2} ${midX_R - diagX_R/2},${midY_R}`);
                    break;
                case "paralelogramma":
                    shapeEl = document.createElementNS(SVG_NS, "polygon");
                    const P_w = (size - 2 * padding) * 0.8; // Szélesség
                    const P_h = (size - 2 * padding) * 0.6; // Magasság
                    const P_skew_abs = (size - 2 * padding) * 0.25; // Dőlés abszolút értéke

                    const topY_P = (size - P_h) / 2;
                    const bottomY_P = topY_P + P_h;

                    // Javított pontok: A bal alsó pont a (padding, bottomY_P) lesz, a többi ehhez igazodik
                    const p4x = padding;                         // Bal alsó x
                    const p4y = bottomY_P;                     // Bal alsó y
                    const p1x = padding + P_skew_abs;          // Bal felső x
                    const p1y = topY_P;                        // Bal felső y
                    const p2x = padding + P_skew_abs + P_w;    // Jobb felső x
                    const p2y = topY_P;                        // Jobb felső y
                    const p3x = padding + P_w;                 // Jobb alsó x
                    const p3y = bottomY_P;                     // Jobb alsó y

                    shapeEl.setAttribute("points", `${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}`);
                    break;
                 default:
                    shapeEl = document.createElementNS(SVG_NS, "text");
                    shapeEl.setAttribute("x", size/2);
                    shapeEl.setAttribute("y", size/2);
                    shapeEl.setAttribute("text-anchor", "middle");
                    shapeEl.setAttribute("dominant-baseline", "central");
                    shapeEl.setAttribute("font-size", size * 0.8);
                    shapeEl.setAttribute("fill", getThemeColor('--text-color', '#333'));
                    shapeEl.textContent = "?";
            }
            if (shapeEl) {
                if (type !== "default") {
                    shapeEl.setAttribute("fill", currentFill);
                    shapeEl.setAttribute("stroke", currentStroke);
                    shapeEl.setAttribute("stroke-width", strokeWidth);
                }
                if (options.transform) shapeEl.setAttribute("transform", options.transform);
                svg.appendChild(shapeEl);
            }
            return svg;
        }


        function clearFeedback(feedbackElId) {
            const el = document.getElementById(feedbackElId);
            if (el) {
                el.innerHTML = '';
                el.className = 'feedback';
            }
        }

        function setFeedback(feedbackElId, message, isCorrect) {
            const el = document.getElementById(feedbackElId);
            if (el) {
                el.innerHTML = message;
                el.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
                 if (isCorrect) {
                    setTimeout(() => {
                         if(el.classList.contains('correct')) {
                             el.innerHTML = '';
                             el.className = 'feedback';
                         }
                    }, 3000);
                }
            }
        }

        let draggedElement = null;
        let draggedElementData = null;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        function makeDraggable(element, data) {
            element.draggable = true;
            element.style.cursor = 'grab';

            // Desktop / Mouse events
            element.addEventListener('dragstart', (event) => {
                draggedElement = element;
                draggedElementData = data || { type: element.dataset.shapeType, id: element.id, originalParentId: element.parentElement.id };
                event.dataTransfer.setData('text/plain', JSON.stringify(draggedElementData));
                event.dataTransfer.effectAllowed = 'move';
                element.style.opacity = '0.5';
                element.classList.add('dragging');

                const rect = element.getBoundingClientRect();
                dragOffsetX = event.clientX - rect.left;
                dragOffsetY = event.clientY - rect.top;
            });
            element.addEventListener('dragend', (event) => {
                element.style.opacity = '1';
                element.style.cursor = 'grab';
                element.classList.remove('dragging');
                draggedElement = null;
                draggedElementData = null;
                dragOffsetX = 0;
                dragOffsetY = 0;
            });

            // Mobile / Touch events
            element.addEventListener('touchstart', (event) => {
                // Prevent scrolling while dragging on touch devices
                event.preventDefault(); 
                draggedElement = element;
                draggedElementData = data || { type: element.dataset.shapeType, id: element.id, originalParentId: element.parentElement.id };
                
                const touch = event.touches[0];
                const rect = element.getBoundingClientRect();
                dragOffsetX = touch.clientX - rect.left;
                dragOffsetY = touch.clientY - rect.top;

                element.classList.add('dragging'); // Add dragging class immediately for visual feedback
                element.style.position = 'absolute'; // Allow free movement
                element.style.left = (touch.clientX - rect.left) + 'px';
                element.style.top = (touch.clientY - rect.top) + 'px';
                
            }, { passive: false }); // Use passive: false to allow preventDefault

            element.addEventListener('touchmove', (event) => {
                event.preventDefault(); // Prevent scrolling
                if (draggedElement) {
                    const touch = event.touches[0];
                    // Update position relative to the viewport, not parent directly
                    draggedElement.style.left = (touch.clientX - dragOffsetX) + 'px';
                    draggedElement.style.top = (touch.clientY - dragOffsetY) + 'px';

                    // Trigger droppable hover effect - check elements under the touch
                    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
                    document.querySelectorAll('.grouping-bin, .build-canvas, .sequence-drop-target-area, .build-palette').forEach(bin => {
                        if (bin.contains(targetElement) && !bin.classList.contains('over')) {
                            bin.classList.add('over');
                        } else if (!bin.contains(targetElement) && bin.classList.contains('over')) {
                            bin.classList.remove('over');
                        }
                    });
                }
            }, { passive: false }); // Use passive: false to allow preventDefault

            element.addEventListener('touchend', (event) => {
                if (draggedElement) {
                    draggedElement.classList.remove('dragging');
                    draggedElement.style.position = ''; // Reset position properties
                    draggedElement.style.left = '';
                    draggedElement.style.top = '';
                    draggedElement.style.zIndex = '';

                    const touch = event.changedTouches[0];
                    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

                    let droppedSuccessfully = false;
                    document.querySelectorAll('.grouping-bin, .build-canvas, #sequence_drop_target, .build-palette').forEach(dropTarget => {
                        dropTarget.classList.remove('over'); // Remove hover effect

                        const dropTargetRect = dropTarget.getBoundingClientRect();
                        if (
                            touch.clientX >= dropTargetRect.left &&
                            touch.clientX <= dropTargetRect.right &&
                            touch.clientY >= dropTargetRect.top &&
                            touch.clientY <= dropTargetRect.bottom
                        ) {
                            // This is the drop target
                            if (dropTarget.classList.contains('grouping-bin')) {
                                onDropToBinTask3(draggedElement, dropTarget, draggedElementData);
                                droppedSuccessfully = true;
                            } else if (dropTarget.id === 'build_canvas_task10') {
                                // For build canvas, re-calculate position based on drop coordinates
                                const canvasRect = dropTarget.getBoundingClientRect();
                                let newX = touch.clientX - canvasRect.left - dragOffsetX;
                                let newY = touch.clientY - canvasRect.top - dragOffsetY;
                                newX = Math.max(0, Math.min(newX, canvasRect.width - draggedElement.offsetWidth));
                                newY = Math.max(0, Math.min(newY, canvasRect.height - draggedElement.offsetHeight));

                                if (draggedElementData.fromPalette) {
                                    const clone = draggedElement.cloneNode(true);
                                    clone.style.position = 'absolute';
                                    clone.style.left = newX + 'px';
                                    clone.style.top = newY + 'px';
                                    clone.id = `built_shape_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                                    clone.dataset.shapeType = draggedElementData.type;
                                    dropTarget.appendChild(clone);
                                    task10State.placedShapes.push({id: clone.id, type: draggedElementData.type, x: newX, y: newY});
                                    makeDraggable(clone, {type: draggedElementData.type, id: clone.id, fromPalette: false});
                                } else {
                                    draggedElement.style.left = newX + 'px';
                                    draggedElement.style.top = newY + 'px';
                                    const shapeState = task10State.placedShapes.find(s => s.id === draggedElementData.id);
                                    if(shapeState) {
                                        shapeState.x = newX;
                                        shapeState.y = newY;
                                    }
                                }
                                droppedSuccessfully = true;
                            } else if (dropTarget.id === 'build_palette_task10' && draggedElementData && !draggedElementData.fromPalette) {
                                // Dropping back to palette from canvas (Task 10 only)
                                draggedElement.remove();
                                task10State.placedShapes = task10State.placedShapes.filter(s => s.id !== draggedElementData.id);
                                droppedSuccessfully = true;
                            } else if (dropTarget.id === 'sequence_drop_target') {
                                // Task 5 drop target
                                dropTarget.innerHTML = '';
                                dropTarget.appendChild(createShapeSvg(draggedElementData.type, 70));
                                task5State.droppedShapeType = draggedElementData.type;
                                clearFeedback('feedback_task5');
                                document.querySelectorAll('#sequence_options_area .shape-item').forEach(item => item.classList.remove('selected'));
                                const originalOption = document.getElementById(draggedElementData.id);
                                if(originalOption) originalOption.classList.add('selected');
                                droppedSuccessfully = true;
                            }
                        }
                    });

                    // If not dropped on a valid target, revert to original position for grouping task
                    if (!droppedSuccessfully) {
                        // For grouping task, if dropped outside a bin, move back to draggable area
                        if (draggedElementData && draggedElementData.originalParentId === 'grouping_draggable_shapes_area') {
                            const originalParent = document.getElementById('grouping_draggable_shapes_area');
                            if (originalParent) {
                                originalParent.appendChild(draggedElement);
                                draggedElement.style.position = 'relative';
                                draggedElement.style.left = '';
                                draggedElement.style.top = '';
                                const shapeState = task3State.shapes.find(s => s.id === draggedElementData.id);
                                if (shapeState && shapeState.currentBinCategory) {
                                    task3State.binContents[shapeState.currentBinCategory] = task3State.binContents[shapeState.currentBinCategory].filter(id => id !== draggedElementData.id);
                                    shapeState.currentBinCategory = null;
                                }
                            }
                        }
                        // For sequence task, if dropped outside, it just disappears from view (already handled by not cloning).
                        // For build task, if dropped outside, it also disappears from canvas if it was a clone.
                    }

                    draggedElement = null;
                    draggedElementData = null;
                    dragOffsetX = 0;
                    dragOffsetY = 0;
                    clearFeedback('feedback_task3'); 
                    clearFeedback('feedback_task10');
                }
            });
        }

        function makeDroppable(element, onDropCallback) {
            // Desktop / Mouse events
            element.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                element.classList.add('over');
            });
            element.addEventListener('dragleave', () => {
                element.classList.remove('over');
            });
            element.addEventListener('drop', (event) => {
                event.preventDefault();
                element.classList.remove('over');
                const data = JSON.parse(event.dataTransfer.getData('text/plain'));
                if (draggedElement && data) {
                    // Pass event to calculate position for tasks that need it (like task 10)
                    onDropCallback(draggedElement, element, data, event);
                }
                draggedElement = null;
                draggedElementData = null;
            });
            // No touch event listeners for droppable targets, they are handled by the draggable's touchend
        }
        // --- END SEGÉDFÜGGVÉNYEK ---

        // --- TÉMA KEZELÉS ---
        const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');
        let currentTheme = localStorage.getItem('alakzatokPageTheme') || 'theme-candy';

        function applyTheme(themeClass) {
            if (!document.body) {
                console.warn("applyTheme hívva, mielőtt a body betöltődött volna.");
                return;
            }
            document.body.className = '';
            if (themeClass !== 'default') {
                 document.body.classList.add(themeClass);
            }
            currentTheme = themeClass;
            localStorage.setItem('alakzatokPageTheme', themeClass);

            themeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });

            const styles = getComputedStyle(document.body);
            document.documentElement.style.setProperty('--current-body-bg-start', styles.getPropertyValue('--body-bg-start').trim());
            document.documentElement.style.setProperty('--current-body-bg-end', styles.getPropertyValue('--body-bg-end').trim());
            document.body.style.background = `linear-gradient(to bottom right, var(--current-body-bg-start), var(--current-body-bg-end))`;

            const containerEl = document.querySelector('.container');
            if(containerEl) containerEl.style.backgroundColor = styles.getPropertyValue('--container-bg').trim();
            document.body.style.color = styles.getPropertyValue('--text-color').trim();

            const h1El = document.querySelector('h1');
            if (h1El) h1El.style.color = styles.getPropertyValue('--h1-color').trim();
            const h2El = document.querySelector('h2');
            if (h2El) h2El.style.color = styles.getPropertyValue('--h2-color').trim();

            document.querySelectorAll('.task').forEach(task => {
                task.style.backgroundColor = styles.getPropertyValue('--task-bg').trim();
                task.style.borderColor = styles.getPropertyValue('--task-border').trim();
            });

            if (typeof generateShapeLegend === 'function') {
                try { generateShapeLegend(); } catch(e) { console.warn("Hiba az alakzat ismertető frissítésekor:", e); }
            }

            const isThemeChange = true;
            if (typeof generateTask1 === 'function') try { generateTask1(isThemeChange); } catch(e){console.warn("Hiba T1 újragenerálásakor témaváltáskor:",e)}
            if (typeof generateTask2 === 'function') try { generateTask2(isThemeChange); } catch(e){console.warn("Hiba T2 újragenerálásakor témaváltáskor:",e)}
            if (typeof generateTask3 === 'function') try { generateTask3(isThemeChange); } catch(e){console.warn("Hiba T3 újragenerálásakor témaváltáskor:",e)}
            if (typeof generateTask4 === 'function') try { generateTask4(isThemeChange); } catch(e){console.warn("Hiba T4 újragenerálásakor témaváltáskor:",e)}
            if (typeof generateTask5 === 'function') try { generateTask5(isThemeChange); } catch(e){console.warn("Hiba T5 újragenerálásakor témaváltáskor:",e)}
            if (typeof generateTask7 === 'function') try { generateTask7(isThemeChange); } catch(e){console.warn("Hiba T7 újragenerálásakor témaváltáskor:",e)}
            if (typeof generateTask8 === 'function') try { generateTask8(isThemeChange); } catch(e){console.warn("Hiba T8 újragenerálásakor témaváltáskor:",e)}
            if (typeof generateTask9 === 'function') try { generateTask9(isThemeChange); } catch(e){console.warn("Hiba T9 újragenerálásakor témaváltáskor:",e.message, e.stack)}
            if (typeof generateTask10 === 'function') try { generateTask10(isThemeChange); } catch(e){console.warn("Hiba T10 újragenerálásakor témaváltáskor:",e)}
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });
        // --- END TÉMA KEZELÉS ---

        // --- ALAKZAT ISMERTETŐ ---
        function generateShapeLegend() {
            const legendArea = document.getElementById('shape_legend_area');
            if (!legendArea) return;
            legendArea.innerHTML = '';

            ALL_SHAPE_TYPES.forEach(type => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('shape-legend-item');

                const shapeDisplay = document.createElement('div');
                shapeDisplay.classList.add('legend-shape-item-display');
                shapeDisplay.appendChild(createShapeSvg(type, 100));

                const nameP = document.createElement('p');
                nameP.textContent = SHAPE_NAMES[type] || type.charAt(0).toUpperCase() + type.slice(1);

                itemDiv.appendChild(shapeDisplay);
                itemDiv.appendChild(nameP);
                legendArea.appendChild(itemDiv);
            });
        }

        // --- FELADAT SPECIFIKUS LOGIKA ---
        let task1State = {};
        function generateTask1(isThemeChange = false) {
            if (!isThemeChange) clearFeedback('feedback_task1');
            const col1Container = document.getElementById('connect_col1');
            const col2Container = document.getElementById('connect_col2');
            const svgLinesContainer = document.getElementById('connection_lines_svg_task1');
            col1Container.innerHTML = '';
            col2Container.innerHTML = '';
            svgLinesContainer.innerHTML = '';

            const availableForTask1 = ["kor", "negyzet", "haromszog", "teglalap", "otszog", "rombusz"];
            let baseShapes = [];
            const numberOfPairs = 3;
            let usedTypes = [];

            for(let i=0; i < numberOfPairs; i++){
                let randomType;
                if (usedTypes.length < availableForTask1.length) {
                    do {
                        randomType = availableForTask1[Math.floor(Math.random() * availableForTask1.length)];
                    } while (usedTypes.includes(randomType));
                    usedTypes.push(randomType);
                } else {
                    randomType = availableForTask1[Math.floor(Math.random() * availableForTask1.length)];
                }
                baseShapes.push(randomType);
            }


            let column1ShapesData = [...baseShapes];
            let column2ShapesData = [...baseShapes];
            shuffleArray(column1ShapesData);
            shuffleArray(column2ShapesData);

            task1State = {
                col1: [],
                col2: [],
                connections: [],
                selectedShape: null,
                mapCol1: column1ShapesData,
                mapCol2: column2ShapesData
            };
             if (!isThemeChange) {
                logNewTask('Alakzatok - Összekötés', { 
                    pairs: numberOfPairs, 
                    shapes: baseShapes 
                });
            }
            const shapeSize = 65;
            column1ShapesData.forEach((type, index) => {
                const shapeDiv = document.createElement('div');
                shapeDiv.classList.add('shape-item');
                shapeDiv.dataset.shapeType = type;
                shapeDiv.dataset.id = `t1_col1_${index}`;
                const svg = createShapeSvg(type, shapeSize);
                shapeDiv.appendChild(svg);
                shapeDiv.addEventListener('click', () => handleShapeConnectClickTask1(shapeDiv));
                col1Container.appendChild(shapeDiv);
                task1State.col1.push(shapeDiv);
            });
            column2ShapesData.forEach((type, index) => {
                const shapeDiv = document.createElement('div');
                shapeDiv.classList.add('shape-item');
                shapeDiv.dataset.shapeType = type;
                shapeDiv.dataset.id = `t1_col2_${index}`;
                const svg = createShapeSvg(type, shapeSize);
                shapeDiv.appendChild(svg);
                shapeDiv.addEventListener('click', () => handleShapeConnectClickTask1(shapeDiv));
                col2Container.appendChild(shapeDiv);
                task1State.col2.push(shapeDiv);
            });
        }
        function handleShapeConnectClickTask1(shapeDiv) {
            const svgLinesContainer = document.getElementById('connection_lines_svg_task1');
            const mainConnectArea = document.getElementById('connect_shapes_area');
            if (!mainConnectArea) return;
            const mainContainerRect = mainConnectArea.getBoundingClientRect();
            task1State.col1.forEach(s => s.classList.remove('correct-connection', 'incorrect-connection','selected'));
            task1State.col2.forEach(s => s.classList.remove('correct-connection', 'incorrect-connection','selected'));

            const existingConnectionIndex = task1State.connections.findIndex(conn => conn.from === shapeDiv || conn.to === shapeDiv);
            if (existingConnectionIndex !== -1) {
                const removedConn = task1State.connections.splice(existingConnectionIndex, 1)[0];
                if (removedConn && removedConn.line) removedConn.line.remove();
                if (task1State.selectedShape === shapeDiv) task1State.selectedShape = null;
                shapeDiv.classList.remove('selected');
                clearFeedback('feedback_task1');
                if (removedConn) {
                    const partner = removedConn.from === shapeDiv ? removedConn.to : removedConn.from;
                    if(partner) partner.classList.remove('selected');
                }
                return;
            }

            if (!task1State.selectedShape) {
                shapeDiv.classList.add('selected');
                task1State.selectedShape = shapeDiv;
                setFeedback('feedback_task1', "Válassz egy párt a másik oszlopból.", false);
            } else {
                if (task1State.selectedShape === shapeDiv) {
                    task1State.selectedShape.classList.remove('selected');
                    task1State.selectedShape = null;
                    clearFeedback('feedback_task1');
                    return;
                }
                const isSelectedFromCol1 = task1State.col1.includes(task1State.selectedShape);
                const isCurrentFromCol2 = task1State.col2.includes(shapeDiv);
                const isSelectedFromCol2 = task1State.col2.includes(task1State.selectedShape);
                const isCurrentFromCol1 = task1State.col1.includes(shapeDiv);

                if (!((isSelectedFromCol1 && isCurrentFromCol2) || (isSelectedFromCol2 && isCurrentFromCol1))) {
                    setFeedback('feedback_task1', "Kérlek, a másik oszlopból válassz párt!", false);
                    return;
                }
                const line = document.createElementNS(SVG_NS, 'line');
                const rect1 = task1State.selectedShape.getBoundingClientRect();
                const rect2 = shapeDiv.getBoundingClientRect();
                const x1 = rect1.left + rect1.width / 2 - mainContainerRect.left;
                const y1 = rect1.top + rect1.height / 2 - mainContainerRect.top;
                const x2 = rect2.left + rect2.width / 2 - mainContainerRect.left;
                const y2 = rect2.top + rect2.height / 2 - mainContainerRect.top;
                line.setAttribute('x1', x1); line.setAttribute('y1', y1);
                line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.style.stroke = getThemeColor('--connection-line-color', '#6b7280');
                line.style.strokeWidth = '3';
                svgLinesContainer.appendChild(line);
                task1State.connections.push({ from: task1State.selectedShape, to: shapeDiv, line: line });
                task1State.selectedShape.classList.remove('selected');
                task1State.selectedShape = null;
                clearFeedback('feedback_task1');
            }
        }
        function checkTask1() {
            clearFeedback('feedback_task1');
            if (task1State.connections.length === 0) {
                setFeedback('feedback_task1', "Kérlek, köss össze legalább egy párt!", false);
                return;
            }
            let correctConnectionsCount = 0;
            const totalPossiblePairs = task1State.col1.length;
            task1State.connections.forEach(conn => {
                const type1 = conn.from.dataset.shapeType;
                const type2 = conn.to.dataset.shapeType;
                conn.from.classList.remove('correct-connection', 'incorrect-connection');
                conn.to.classList.remove('correct-connection', 'incorrect-connection');
                if (type1 === type2) {
                    correctConnectionsCount++;
                    conn.line.style.stroke = getThemeColor('--feedback-correct-border-color', 'green');
                    conn.from.classList.add('correct-connection');
                    conn.to.classList.add('correct-connection');
                } else {
                    conn.line.style.stroke = getThemeColor('--feedback-incorrect-border-color', 'red');
                    conn.from.classList.add('incorrect-connection');
                    conn.to.classList.add('incorrect-connection');
                }
            });
            const isComplete = correctConnectionsCount === totalPossiblePairs && task1State.connections.length === totalPossiblePairs;
            logTaskCheck('Alakzatok - Összekötés', { 
                connections: task1State.connections.map(c => ({ from: c.from.dataset.shapeType, to: c.to.dataset.shapeType })),
                correctCount: correctConnectionsCount, 
                totalPossible: totalPossiblePairs,
                isComplete: isComplete
            });
            if (isComplete) {
                setFeedback('feedback_task1', `Szuper! Mind a ${totalPossiblePairs} kapcsolat helyes! 🎉`, true);
            } else if (correctConnectionsCount > 0 && task1State.connections.length < totalPossiblePairs) {
                 setFeedback('feedback_task1', `Helyes kapcsolatok: ${correctConnectionsCount}. Még ${totalPossiblePairs - task1State.connections.length} párt kell összekötnöd.`, false);
            } else if (correctConnectionsCount > 0) {
                 setFeedback('feedback_task1', `Helyes kapcsolatok: ${correctConnectionsCount} / ${task1State.connections.length}. Próbáld újra a hibásakat, vagy kösd össze a hiányzókat! (Összesen ${totalPossiblePairs} helyes pár van.)`, false);
            } else {
                 setFeedback('feedback_task1', `Sajnos egyik kapcsolat sem helyes. Próbáld újra! (Összesen ${totalPossiblePairs} helyes pár van.)`, false);
            }
        }

        let task2State = {};
        function generateTask2(isThemeChange = false) {
            if(!isThemeChange) clearFeedback('feedback_task2');
            const originalShapeDisplay = document.getElementById('shadow_original_shape_display');
            const shadowOptionsArea = document.getElementById('shadow_options_area');
            originalShapeDisplay.innerHTML = '';
            shadowOptionsArea.innerHTML = '';

            const shapeType = ALL_SHAPE_TYPES[Math.floor(Math.random() * ALL_SHAPE_TYPES.length)];
            task2State.correctShapeType = shapeType;
            task2State.selectedShadow = null;

            const originalSvg = createShapeSvg(shapeType, 80);
            originalShapeDisplay.appendChild(originalSvg);

            let options = [shapeType];
            let otherShapes = ALL_SHAPE_TYPES.filter(s => s !== shapeType);
            shuffleArray(otherShapes);
            for(let i=0; i < Math.min(2, otherShapes.length) ; i++) {
                if(otherShapes[i]) options.push(otherShapes[i]);
            }
            shuffleArray(options);

            if (!isThemeChange) {
                logNewTask('Alakzatok - Árnyékkereső', { 
                    correctShape: shapeType, 
                    options: options 
                });
            }

            options.forEach((optType, index) => {
                const shadowDiv = document.createElement('div');
                shadowDiv.classList.add('shadow-item', 'shape-item');
                shadowDiv.dataset.shapeType = optType;
                const shadowSvg = createShapeSvg(optType, 70, { isShadow: true });
                shadowDiv.appendChild(shadowSvg);
                shadowDiv.addEventListener('click', () => handleShadowOptionClick(shadowDiv));
                shadowOptionsArea.appendChild(shadowDiv);
            });
        }
        function handleShadowOptionClick(clickedDiv) {
            document.querySelectorAll('#shadow_options_area .shadow-item').forEach(item => {
                item.classList.remove('selected', 'correct-selection', 'incorrect-selection');
            });
            clickedDiv.classList.add('selected');
            task2State.selectedShadow = clickedDiv;
            clearFeedback('feedback_task2');
        }
        function checkTask2() {
            if (!task2State.selectedShadow) {
                setFeedback('feedback_task2', "Kérlek, válassz egy árnyékot!", false);
                return;
            }
            const isCorrect = task2State.selectedShadow.dataset.shapeType === task2State.correctShapeType;
            logTaskCheck('Alakzatok - Árnyékkereső', { 
                selected: task2State.selectedShadow.dataset.shapeType, 
                correct: task2State.correctShapeType, 
                isCorrect: isCorrect 
            });
            task2State.selectedShadow.classList.remove('selected');
            task2State.selectedShadow.classList.add(isCorrect ? 'correct-selection' : 'incorrect-selection');
            setFeedback('feedback_task2', isCorrect ? "Helyes! Ez a jó árnyék! 👍" : "Ez nem a helyes árnyék. Próbáld újra!", isCorrect);
        }

        let task3State = {};
        function generateTask3(isThemeChange = false) {
            if(!isThemeChange) clearFeedback('feedback_task3');
            const draggableArea = document.getElementById('grouping_draggable_shapes_area');
            const bins = {
                kor: document.getElementById('grouping_bin_korok'),
                negyszog: document.getElementById('grouping_bin_negyszogek'),
                haromszog: document.getElementById('grouping_bin_haromszogek')
            };
            draggableArea.innerHTML = '';
            Object.values(bins).forEach(bin => {
                if(bin) {
                    Array.from(bin.children).forEach(child => {
                        if (child.classList.contains('shape-item')) child.remove();
                    });
                    bin.classList.remove('correct-bin', 'incorrect-bin');
                    bin.style.borderColor = getThemeColor('--bin-border-default', '#9ca3af');
                }
            });

            const shapesForTask3 = ALL_SHAPE_TYPES.filter(type =>
                SHAPE_CATEGORIES[type] === "kor" || SHAPE_CATEGORIES[type] === "negyszog" || SHAPE_CATEGORIES[type] === "haromszog"
            );
            if (shapesForTask3.length === 0) {
                 console.error("Nincsenek elérhető alakzatok a 3. feladathoz!"); return;
            }

            let shapesToGroupTypes = [];
            const numberOfShapesToGroup = 5 + Math.floor(Math.random() * 3);
            for(let i=0; i < numberOfShapesToGroup; i++){
                shapesToGroupTypes.push(shapesForTask3[Math.floor(Math.random() * shapesForTask3.length)]);
            }
            shuffleArray(shapesToGroupTypes);

            task3State.shapes = [];
            task3State.binContents = { kor: [], negyszog: [], haromszog: [] };

            if (!isThemeChange) {
                logNewTask('Alakzatok - Csoportosítás', { 
                    shapes: shapesToGroupTypes 
                });
            }

            shapesToGroupTypes.forEach((type, index) => {
                const shapeDiv = document.createElement('div');
                shapeDiv.classList.add('shape-item');
                shapeDiv.id = `group_shape_${index}`;
                shapeDiv.dataset.shapeType = type;
                shapeDiv.dataset.category = SHAPE_CATEGORIES[type];
                const svg = createShapeSvg(type, 50);
                shapeDiv.appendChild(svg);
                makeDraggable(shapeDiv, { type: type, category: SHAPE_CATEGORIES[type], id: shapeDiv.id, originalParentId: draggableArea.id });
                draggableArea.appendChild(shapeDiv);
                task3State.shapes.push({id: shapeDiv.id, type: type, category: SHAPE_CATEGORIES[type], currentBinCategory: null});
            });

            Object.entries(bins).forEach(([category, binElement]) => {
                if(binElement) makeDroppable(binElement, onDropToBinTask3);
            });
            makeDroppable(draggableArea, onDropToDraggableAreaTask3);
        }

        function onDropToBinTask3(draggedItem, binElement, data) {
            const shapeState = task3State.shapes.find(s => s.id === data.id);
            const targetBinCategory = binElement.dataset.category;

            if (shapeState) {
                if (shapeState.currentBinCategory && task3State.binContents[shapeState.currentBinCategory]) {
                    task3State.binContents[shapeState.currentBinCategory] = task3State.binContents[shapeState.currentBinCategory].filter(id => id !== data.id);
                }
                shapeState.currentBinCategory = targetBinCategory;
                if (!task3State.binContents[targetBinCategory]) task3State.binContents[targetBinCategory] = [];
                task3State.binContents[targetBinCategory].push(data.id);
            }
            binElement.appendChild(draggedItem);
            draggedItem.style.position = 'relative'; // Ensure it's static/relative within the bin
            draggedItem.style.left = '';
            draggedItem.style.top = '';
            clearFeedback('feedback_task3');
        }
        function onDropToDraggableAreaTask3(draggedItem, targetArea, data) {
            const shapeState = task3State.shapes.find(s => s.id === data.id);
            if (shapeState && shapeState.currentBinCategory) {
                 task3State.binContents[shapeState.currentBinCategory] = task3State.binContents[shapeState.currentBinCategory].filter(id => id !== data.id);
                 shapeState.currentBinCategory = null;
            }
            targetArea.appendChild(draggedItem);
            draggedItem.style.position = 'relative'; // Ensure it's static/relative within the area
            draggedItem.style.left = '';
            draggedItem.style.top = '';
            clearFeedback('feedback_task3');
        }

        function checkTask3() {
            let allCorrect = true;
            let placedCount = 0;
            document.querySelectorAll('.grouping-bin').forEach(bin => {
                bin.classList.remove('correct-bin', 'incorrect-bin');
                bin.style.borderColor = getThemeColor('--bin-border-default', '#9ca3af');
                const binCategory = bin.dataset.category;
                const itemsInBin = Array.from(bin.children).filter(child => child.classList.contains('shape-item'));
                placedCount += itemsInBin.length;

                if (itemsInBin.length > 0) {
                    let binIsInternallyCorrect = true;
                    itemsInBin.forEach(item => {
                        if (item.dataset.category !== binCategory) {
                            binIsInternallyCorrect = false;
                            allCorrect = false;
                        }
                    });
                    if (binIsInternallyCorrect) {
                         bin.style.borderColor = getThemeColor('--feedback-correct-border-color', 'green');
                    } else {
                         bin.style.borderColor = getThemeColor('--feedback-incorrect-border-color', 'red');
                    }
                }
            });

            const totalShapes = task3State.shapes.length;
            if (placedCount < totalShapes) {
                allCorrect = false;
            }

            logTaskCheck('Alakzatok - Csoportosítás', { 
                placed: placedCount, 
                total: totalShapes, 
                isCorrect: allCorrect && (placedCount === totalShapes)
            });

            if (placedCount < totalShapes) {
                setFeedback('feedback_task3', `Még nem minden alakzat van a dobozokban! Helyezd el a maradék ${totalShapes - placedCount} alakzatot is.`, false);
                return;
            }

            if (allCorrect) {
                setFeedback('feedback_task3', "Nagyon ügyes! Minden alakzat a helyén van! 🎉", true);
            } else {
                setFeedback('feedback_task3', "Néhány alakzat nincs a jó helyen. Nézd át a piros keretes dobozokat, vagy azokat, amikben nem megfelelő alakzat van!", false);
            }
        }


        let task4State = {};
        function generateTask4(isThemeChange = false) {
            if(!isThemeChange) clearFeedback('feedback_task4');
            const area = document.getElementById('odd_one_out_area');
            area.innerHTML = '';
            task4State.selectedShape = null;

            const commonShapesCount = 3 + Math.floor(Math.random() * 2);
            const commonShapeType = ALL_SHAPE_TYPES[Math.floor(Math.random() * ALL_SHAPE_TYPES.length)];
            let oddShapeType;
            do {
                oddShapeType = ALL_SHAPE_TYPES[Math.floor(Math.random() * ALL_SHAPE_TYPES.length)];
            } while (oddShapeType === commonShapeType);

            task4State.oddOneOutType = oddShapeType;
            let shapesToDisplay = [];
            for(let i=0; i<commonShapesCount; i++) shapesToDisplay.push(commonShapeType);
            shapesToDisplay.push(oddShapeType);
            shuffleArray(shapesToDisplay);

            if (!isThemeChange) {
                logNewTask('Alakzatok - Kakukktojás', { 
                    commonShape: commonShapeType, 
                    oddShape: oddShapeType,
                    display: shapesToDisplay
                });
            }

            shapesToDisplay.forEach((type, index) => {
                const shapeDiv = document.createElement('div');
                shapeDiv.classList.add('shape-item');
                shapeDiv.dataset.shapeType = type;
                shapeDiv.id = `odd_shape_${index}`;
                const svg = createShapeSvg(type, 60);
                shapeDiv.appendChild(svg);
                shapeDiv.addEventListener('click', () => handleOddOneOutClick(shapeDiv));
                area.appendChild(shapeDiv);
            });
        }
        function handleOddOneOutClick(clickedDiv) {
            document.querySelectorAll('#odd_one_out_area .shape-item').forEach(item => {
                item.classList.remove('selected', 'correct-selection', 'incorrect-selection');
            });
            clickedDiv.classList.add('selected');
            task4State.selectedShape = clickedDiv;
            clearFeedback('feedback_task4');
        }
        function checkTask4() {
            if (!task4State.selectedShape) {
                setFeedback('feedback_task4', "Kérlek, válassz egy alakzatot!", false);
                return;
            }
            const isCorrect = task4State.selectedShape.dataset.shapeType === task4State.oddOneOutType;
            logTaskCheck('Alakzatok - Kakukktojás', { 
                selected: task4State.selectedShape.dataset.shapeType, 
                correct: task4State.oddOneOutType, 
                isCorrect: isCorrect 
            });
             task4State.selectedShape.classList.remove('selected');
            task4State.selectedShape.classList.add(isCorrect ? 'correct-selection' : 'incorrect-selection');
            setFeedback('feedback_task4', isCorrect ? "Helyes! Ez volt a kakukktojás! 🥚" : "Ez az alakzat illik a sorba. Keresd meg azt, amelyik más!", isCorrect);
        }

        let task5State = {};
        function generateTask5(isThemeChange = false) {
            if(!isThemeChange) clearFeedback('feedback_task5');
            const sequenceArea = document.getElementById('sequence_display_area');
            const dropTarget = document.getElementById('sequence_drop_target');
            const optionsArea = document.getElementById('sequence_options_area');
            sequenceArea.innerHTML = '';
            dropTarget.innerHTML = '?';
            dropTarget.classList.remove('correct-choice', 'incorrect-choice');
            optionsArea.innerHTML = '';
            task5State.droppedShapeType = null;

            const typeA = ALL_SHAPE_TYPES[Math.floor(Math.random() * ALL_SHAPE_TYPES.length)];
            let typeB;
            do {
                typeB = ALL_SHAPE_TYPES[Math.floor(Math.random() * ALL_SHAPE_TYPES.length)];
            } while (typeB === typeA);

            const sequencePatternChoice = Math.random();
            let sequence = [];
            if (sequencePatternChoice < 0.5) {
                sequence = [typeA, typeB, typeA];
                task5State.correctNext = typeB;
            } else {
                sequence = [typeA, typeA, typeB, typeA, typeA];
                task5State.correctNext = typeB;
            }


            sequence.forEach(type => {
                const shapeDiv = document.createElement('div');
                shapeDiv.classList.add('shape-item', 'sequence-item-display');
                shapeDiv.appendChild(createShapeSvg(type, 50));
                sequenceArea.appendChild(shapeDiv);
            });

            let options = [task5State.correctNext];
            let wrongOptions = ALL_SHAPE_TYPES.filter(s => s !== task5State.correctNext && s !== typeA && s !== typeB);
            shuffleArray(wrongOptions);
            if(wrongOptions[0]) options.push(wrongOptions[0]);
            if(options.length < 3 && typeA !== task5State.correctNext) options.push(typeA);

            while(options.length < 2 && wrongOptions.length > 1) options.push(wrongOptions.pop());
            if(options.length < 2) {
                ALL_SHAPE_TYPES.forEach(s_type => {
                    if (options.length < 3 && !options.includes(s_type)) options.push(s_type);
                })
            }

            shuffleArray(options);

            if (!isThemeChange) {
                logNewTask('Alakzatok - Sorozat', { 
                    sequence: sequence, 
                    correctNext: task5State.correctNext,
                    options: options.slice(0,3)
                });
            }

            options.slice(0,3).forEach((optType, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.classList.add('shape-item');
                optionDiv.id = `seq_opt_${index}`;
                optionDiv.dataset.shapeType = optType;
                optionDiv.appendChild(createShapeSvg(optType, 50));
                makeDraggable(optionDiv, { type: optType, id: optionDiv.id, fromPalette: true, task: 'task5' }); // Add task identifier
                optionDiv.addEventListener('click', () => {
                    dropTarget.innerHTML = '';
                    dropTarget.appendChild(createShapeSvg(optType, 70));
                    task5State.droppedShapeType = optType;
                     document.querySelectorAll('#sequence_options_area .shape-item').forEach(item => item.classList.remove('selected'));
                    optionDiv.classList.add('selected');
                    clearFeedback('feedback_task5');
                });
                optionsArea.appendChild(optionDiv);
            });
             makeDroppable(dropTarget, (draggedItem, target, data) => {
                // This specific onDropCallback for Task 5 needs to be handled
                // differently than the general one in makeDroppable/touchend for this specific task
                // The touchend logic in makeDraggable now covers this.
                // This is a fallback for mouse drag & drop only or if needed specifically.
                if (data.task === 'task5') {
                    target.innerHTML = '';
                    target.appendChild(createShapeSvg(data.type, 70));
                    task5State.droppedShapeType = data.type;
                    clearFeedback('feedback_task5');
                    document.querySelectorAll('#sequence_options_area .shape-item').forEach(item => item.classList.remove('selected'));
                    const originalOption = document.getElementById(data.id);
                    if(originalOption) originalOption.classList.add('selected');
                }
            });
        }
        function checkTask5() {
            const dropTarget = document.getElementById('sequence_drop_target');
            dropTarget.classList.remove('correct-choice', 'incorrect-choice');
            if (!task5State.droppedShapeType) {
                setFeedback('feedback_task5', "Kérlek, válassz vagy húzz egy alakzatot a kérdőjel helyére!", false);
                return;
            }
            const isCorrect = task5State.droppedShapeType === task5State.correctNext;
            logTaskCheck('Alakzatok - Sorozat', { 
                selected: task5State.droppedShapeType, 
                correct: task5State.correctNext, 
                isCorrect: isCorrect 
            });
            dropTarget.classList.add(isCorrect ? 'correct-choice' : 'incorrect-choice');
            setFeedback('feedback_task5', isCorrect ? "Ügyes! Ez a helyes folytatás! 🏁" : "Nem ez következik a sorban. Figyelj jobban!", isCorrect);
        }

        let task7State = {};
        function generateTask7(isThemeChange = false) {
            if(!isThemeChange) clearFeedback('feedback_task7');
            const displayArea = document.getElementById('identify_shape_display_area');
            const optionsContainer = document.getElementById('identify_answer_options');
            displayArea.innerHTML = '';
            optionsContainer.innerHTML = '';
            task7State.selectedOption = null;

            const shapeType = ALL_SHAPE_TYPES[Math.floor(Math.random() * ALL_SHAPE_TYPES.length)];
            task7State.correctType = shapeType;
            displayArea.appendChild(createShapeSvg(shapeType, 90));

            let options = [shapeType];
            let otherTypes = ALL_SHAPE_TYPES.filter(s => s !== shapeType);
            shuffleArray(otherTypes);
            for(let i=0; i< Math.min(2, otherTypes.length); i++) { if(otherTypes[i]) options.push(otherTypes[i]); }
            shuffleArray(options);

            if (!isThemeChange) {
                logNewTask('Alakzatok - Megnevezés', { 
                    correctShape: shapeType, 
                    options: options 
                });
            }

            options.forEach(optType => {
                const button = document.createElement('button');
                button.classList.add('answer-option-button');
                button.textContent = SHAPE_NAMES[optType] || optType;
                button.dataset.shapeType = optType;
                button.addEventListener('click', () => handleIdentifyOptionClick(button));
                optionsContainer.appendChild(button);
            });
        }
        function handleIdentifyOptionClick(clickedButton) {
            document.querySelectorAll('#identify_answer_options .answer-option-button').forEach(btn => {
                btn.classList.remove('selected', 'correct-choice', 'incorrect-choice');
            });
            clickedButton.classList.add('selected');
            task7State.selectedOption = clickedButton;
            clearFeedback('feedback_task7');
        }
        function checkTask7() {
            if (!task7State.selectedOption) {
                setFeedback('feedback_task7', "Kérlek, válassz egy megnevezést!", false);
                return;
            }
            const isCorrect = task7State.selectedOption.dataset.shapeType === task7State.correctType;
            logTaskCheck('Alakzatok - Megnevezés', { 
                selected: task7State.selectedOption.dataset.shapeType, 
                correct: task7State.correctType, 
                isCorrect: isCorrect 
            });
            task7State.selectedOption.classList.remove('selected');
            setFeedback('feedback_task7', isCorrect ? "Pontosan! Ez egy " + (SHAPE_NAMES[task7State.correctType] || task7State.correctType) + ". ✅" : "Ez nem a helyes név. Próbáld újra!", isCorrect);
        }

        let task8State = {};
        function generateTask8(isThemeChange = false) {
            if(!isThemeChange) clearFeedback('feedback_task8');
            const instructionEl = document.getElementById('color_task_instruction');
            const paletteArea = document.getElementById('color_palette_task8');
            const shapesArea = document.getElementById('coloring_shapes_area');
            paletteArea.innerHTML = '';
            shapesArea.innerHTML = '';

            // Új: Több utasítás egyidejűleg
            const tasksToColor = [];
            let availableShapeTypes = [...ALL_SHAPE_TYPES];
            shuffleArray(availableShapeTypes);

            const numInstructions = getRandomInt(2, 4); // 2-4 utasítás
            let usedColors = new Set();
            let usedShapeTypes = new Set();

            // Collect unique shape types and colors for instructions
            for(let i = 0; i < numInstructions; i++) {
                let shapeType;
                do {
                    shapeType = availableShapeTypes[getRandomInt(0, availableShapeTypes.length - 1)];
                } while (usedShapeTypes.has(shapeType) && availableShapeTypes.length > usedShapeTypes.size); // Ensure unique shape types if possible
                usedShapeTypes.add(shapeType);

                let colorObj;
                do {
                    colorObj = TASK8_COLORS[getRandomInt(0, TASK8_COLORS.length - 1)];
                } while (usedColors.has(colorObj.value) && TASK8_COLORS.length > usedColors.size); // Ensure unique colors if possible
                usedColors.add(colorObj.value);

                tasksToColor.push({
                    shapeType: shapeType,
                    color: colorObj
                });
            }
            task8State.coloringInstructions = tasksToColor;

            const instructionsText = tasksToColor.map(task => 
                `<br/>Színezd ${SHAPE_NEVELO[task.shapeType]} <b>${SHAPE_NAMES_PLURAL[task.shapeType] || task.shapeType+"-okat/eket"}</b> <i>${task.color.name}</i> színűre.`
            ).join('');
            instructionEl.innerHTML = `Válaszd ki a színt, majd kattints az alakzatokra! ${instructionsText}`;

            if (!isThemeChange) {
                logNewTask('Alakzatok - Színező', { 
                    instructions: tasksToColor, 
                    shapesOnDisplay: 0 // Will be updated later
                });
            }

            TASK8_COLORS.forEach(color => {
                const btn = document.createElement('button');
                btn.classList.add('color-palette-button');
                btn.style.backgroundColor = color.value;
                btn.dataset.colorValue = color.value;
                btn.dataset.colorName = color.name;
                btn.title = color.name;
                btn.addEventListener('click', () => {
                    task8State.selectedPaletteColor = color;
                    document.querySelectorAll('#color_palette_task8 .color-palette-button').forEach(b => b.classList.remove('selected-color'));
                    btn.classList.add('selected-color');
                });
                paletteArea.appendChild(btn);
            });

            // Új: Legalább 8, de legfeljebb 12 síkidom megjelenítése
            const numShapesToDisplay = getRandomInt(8, 12); 
            let displayShapesTypes = [];
            let targetShapeTypes = tasksToColor.map(t => t.shapeType);
            let nonTargetShapes = ALL_SHAPE_TYPES.filter(type => !targetShapeTypes.includes(type));

            // Biztosítjuk, hogy minden cél alakzatból legyen legalább 1-2 példány
            tasksToColor.forEach(task => {
                const numInstances = getRandomInt(1, 2); 
                for(let i = 0; i < numInstances; i++) {
                    displayShapesTypes.push(task.shapeType);
                }
            });

            // Feltöltjük a maradék helyet véletlenszerű alakzatokkal, beleértve a már használtakat és a nem cél alakzatokat is.
            while(displayShapesTypes.length < numShapesToDisplay) {
                let randomType = ALL_SHAPE_TYPES[getRandomInt(0, ALL_SHAPE_TYPES.length - 1)];
                displayShapesTypes.push(randomType);
            }
            shuffleArray(displayShapesTypes);


            task8State.shapesData = {}; // Rögzítjük az alakzatok kezdeti állapotát
            displayShapesTypes.forEach((type, index) => {
                const shapeDiv = document.createElement('div');
                shapeDiv.classList.add('colorable-shape','shape-item');
                shapeDiv.id = `color_shape_${index}`;
                shapeDiv.dataset.shapeType = type;
                const defaultShapeFill = getThemeColor('--shape-fill-default', '#eeeeee');
                shapeDiv.appendChild(createShapeSvg(type, 60, { fill: defaultShapeFill }));
                
                task8State.shapesData[shapeDiv.id] = {
                    type: type,
                    currentColor: defaultShapeFill, // Aktuális szín
                    originalFill: defaultShapeFill  // Eredeti szín (nem változik)
                };

                shapeDiv.addEventListener('click', () => {
                    if (task8State.selectedPaletteColor) {
                        const svgEl = shapeDiv.querySelector('svg > *:not(text)');
                        if (svgEl) {
                            svgEl.setAttribute('fill', task8State.selectedPaletteColor.value);
                            task8State.shapesData[shapeDiv.id].currentColor = task8State.selectedPaletteColor.value;
                            shapeDiv.classList.remove('correct-color', 'incorrect-color');
                        }
                    } else {
                        setFeedback('feedback_task8', "Először válassz egy színt a palettáról!", false);
                    }
                });
                shapesArea.appendChild(shapeDiv);
            });
        }
        function checkTask8() {
            let overallCorrect = true;
            const instructionMap = new Map(); // shapeType -> expectedColor
            task8State.coloringInstructions.forEach(inst => {
                instructionMap.set(inst.shapeType, inst.color.value);
            });

            document.querySelectorAll('#coloring_shapes_area .colorable-shape').forEach(shapeDiv => {
                shapeDiv.classList.remove('correct-color', 'incorrect-color');
                const shapeType = shapeDiv.dataset.shapeType;
                const currentShapeData = task8State.shapesData[shapeDiv.id];
                const currentColor = currentShapeData.currentColor;

                const expectedColorForThisType = instructionMap.get(shapeType);

                if (expectedColorForThisType) { // Ez egy olyan alakzat, amit színeznünk kellene
                    if (currentColor === expectedColorForThisType) {
                        shapeDiv.classList.add('correct-color');
                    } else {
                        shapeDiv.classList.add('incorrect-color');
                        overallCorrect = false;
                    }
                } else { // Ez egy olyan alakzat, amit NEM kellene színeznünk a feladat alapján
                    if (currentColor !== currentShapeData.originalFill) { // Ha át lett színezve (és nem a default színre)
                        shapeDiv.classList.add('incorrect-color');
                        overallCorrect = false;
                    }
                }
            });

            logTaskCheck('Alakzatok - Színező', { 
                isCorrect: overallCorrect,
                userColors: Object.values(task8State.shapesData).map(s => ({type: s.type, color: s.currentColor})),
                instructions: task8State.coloringInstructions
            });

            if (overallCorrect) {
                setFeedback('feedback_task8', "Tökéletes színezés! 🎨", true);
            } else {
                let feedbackMsg = "Valami nem stimmel a színekkel. ";
                const incorrectShapes = document.querySelectorAll('#coloring_shapes_area .colorable-shape.incorrect-color');
                if (incorrectShapes.length > 0) {
                     feedbackMsg += "Nézd át a pirossal jelölt alakzatokat! ";
                }
                feedbackMsg += "Győződj meg róla, hogy minden kért alakzat a megfelelő színnel van kiszínezve, és más alakzat nincs kiszínezve!";
                setFeedback('feedback_task8', feedbackMsg, false);
            }
        }


        let task9State = {
            shapesInOrder: [],
            questionedShapeType: null,
            questionedShapeIndex: -1,
            correctPosFromLeft: 0,
            correctPosFromRight: 0
        };
        function generateTask9(isThemeChange = false) {
            if (!isThemeChange) clearFeedback('feedback_task9');
            const displayArea = document.getElementById('position_shapes_display_area');
            const instructionTextEl = document.getElementById('position_task_instruction_text');
            const inputLeftEl = document.getElementById('position_input_left');
            const inputRightEl = document.getElementById('position_input_right');

            displayArea.innerHTML = '';
            inputLeftEl.value = '';
            inputRightEl.value = '';
            inputLeftEl.classList.remove('correct-input', 'incorrect-input');
            inputRightEl.classList.remove('correct-input', 'incorrect-input');

            const numShapes = getRandomInt(5, 8);
            task9State.shapesInOrder = [];

            task9State.questionedShapeType = ALL_SHAPE_TYPES[Math.floor(Math.random() * ALL_SHAPE_TYPES.length)];
            task9State.questionedShapeIndex = Math.floor(Math.random() * numShapes);

            for (let i = 0; i < numShapes; i++) {
                if (i === task9State.questionedShapeIndex) {
                    task9State.shapesInOrder.push(task9State.questionedShapeType);
                } else {
                    let randomOtherType;
                    do {
                        randomOtherType = ALL_SHAPE_TYPES[Math.floor(Math.random() * ALL_SHAPE_TYPES.length)];
                    } while (randomOtherType === task9State.questionedShapeType);
                    task9State.shapesInOrder.push(randomOtherType);
                }
            }

            task9State.correctPosFromLeft = task9State.questionedShapeIndex + 1;
            task9State.correctPosFromRight = numShapes - task9State.questionedShapeIndex;

            const questionedShapeName = SHAPE_NAMES[task9State.questionedShapeType] || "alakzat";
            instructionTextEl.textContent = `Figyeld meg az alakzatokat! A sorban lévő ${questionedShapeName} balról és jobbról hanyadik?`;

            if (!isThemeChange) {
                logNewTask('Alakzatok - Hányadik a sorban', { 
                    shapes: task9State.shapesInOrder, 
                    questionedShape: task9State.questionedShapeType,
                    correct: { left: task9State.correctPosFromLeft, right: task9State.correctPosFromRight }
                });
            }

            task9State.shapesInOrder.forEach((type) => {
                const shapeDiv = document.createElement('div');
                shapeDiv.classList.add('position-task-shape');
                shapeDiv.appendChild(createShapeSvg(type, 60));
                displayArea.appendChild(shapeDiv);
            });

             inputLeftEl.max = numShapes;
             inputRightEl.max = numShapes;

             inputLeftEl.addEventListener('input', function() {
                inputLeftEl.classList.remove('correct-input', 'incorrect-input');
                if (this.value && this.value.length >= String(this.max).length && parseInt(this.value) <= parseInt(this.max)) {
                    document.getElementById('position_input_right').focus();
                }
            });
            inputRightEl.addEventListener('input', function() {
                inputRightEl.classList.remove('correct-input', 'incorrect-input');
            });
        }
        function checkTask9() {
            const inputLeftEl = document.getElementById('position_input_left');
            const inputRightEl = document.getElementById('position_input_right');

            const userAnswerLeft = parseInt(inputLeftEl.value);
            const userAnswerRight = parseInt(inputRightEl.value);

            let leftCorrect = false;
            let rightCorrect = false;
            let allFilledAndValid = true;

            if (isNaN(userAnswerLeft) || userAnswerLeft < 1 || userAnswerLeft > parseInt(inputLeftEl.max) ) {
                inputLeftEl.classList.add('incorrect-input');
                inputLeftEl.classList.remove('correct-input');
                allFilledAndValid = false;
            } else if (userAnswerLeft === task9State.correctPosFromLeft) {
                inputLeftEl.classList.add('correct-input');
                inputLeftEl.classList.remove('incorrect-input');
                leftCorrect = true;
            } else {
                inputLeftEl.classList.add('incorrect-input');
                inputLeftEl.classList.remove('correct-input');
            }

            if (isNaN(userAnswerRight) || userAnswerRight < 1 || userAnswerRight > parseInt(inputRightEl.max)) {
                inputRightEl.classList.add('incorrect-input');
                inputRightEl.classList.remove('correct-input');
                allFilledAndValid = false;
            } else if (userAnswerRight === task9State.correctPosFromRight) {
                inputRightEl.classList.add('correct-input');
                inputRightEl.classList.remove('incorrect-input');
                rightCorrect = true;
            } else {
                inputRightEl.classList.add('incorrect-input');
                inputRightEl.classList.remove('correct-input');
            }

            logTaskCheck('Alakzatok - Hányadik a sorban', { 
                answerLeft: userAnswerLeft, 
                answerRight: userAnswerRight, 
                correctLeft: task9State.correctPosFromLeft, 
                correctRight: task9State.correctPosFromRight, 
                isCorrect: leftCorrect && rightCorrect 
            });

            if (!allFilledAndValid && (isNaN(userAnswerLeft) || isNaN(userAnswerRight)) ) {
                setFeedback('feedback_task9', "Kérlek, mindkét helyre írj be egy számot!", false);
            } else if (!allFilledAndValid) {
                 setFeedback('feedback_task9', "Kérlek, érvényes sorszámokat adj meg!", false);
            }
            else if (leftCorrect && rightCorrect) {
                setFeedback('feedback_task9', "Helyes! Ügyesen meghatároztad a pozíciókat! 👍", true);
            } else {
                let errorMsg = "Nem tökéletes. ";
                if (!leftCorrect && (inputLeftEl.value !== "")) errorMsg += "A balról számolt sorszám nem jó. ";
                else if (inputLeftEl.value === "") errorMsg += "A balról számolt sorszám hiányzik. ";

                if (!rightCorrect && (inputRightEl.value !== "")) errorMsg += "A jobbról számolt sorszám nem jó. ";
                else if (inputRightEl.value === "") errorMsg += "A jobbról számolt sorszám hiányzik. ";

                errorMsg += "Próbáld újra!";
                setFeedback('feedback_task9', errorMsg, false);
            }
        }

        const BUILD_GOALS = {
            haziko: { name: "házikót", instruction: "Építs házikót a megadott alakzatokból!", required: { negyzet: 1, haromszog: 1 } },
            auto: { name: "autót", instruction: "Építs autót a megadott alakzatokból!", required: { teglalap: 1, kor: 2 } },
            sator: { name: "sátrat", instruction: "Építs sátrat a megadott alakzatból!", required: { haromszog: 1 } },
            var: { name: "várat", instruction: "Építs várat a megadott alakzatokból!", required: { negyzet: 1, teglalap: 1, haromszog: 2 } }
        };

        let task10State = {
            currentGoalKey: 'haziko',
            paletteShapes: ["kor", "negyzet", "haromszog", "teglalap", "otszog", "rombusz", "trapez"],
            placedShapes: []
        };

        function generateTask10(isThemeChange = false) {
            if(!isThemeChange) clearFeedback('feedback_task10');
            const paletteArea = document.getElementById('build_palette_task10');
            const canvasArea = document.getElementById('build_canvas_task10');
            const instructionEl = document.getElementById('build_task_instruction');
            paletteArea.innerHTML = '';
            canvasArea.innerHTML = '';
            task10State.placedShapes = [];

            const goalKeys = Object.keys(BUILD_GOALS);
            task10State.currentGoalKey = goalKeys[Math.floor(Math.random() * goalKeys.length)];
            const currentGoal = BUILD_GOALS[task10State.currentGoalKey];

            let requiredShapesList = [];
            for (const shapeType in currentGoal.required) {
                requiredShapesList.push(`${currentGoal.required[shapeType]} db ${SHAPE_NAMES[shapeType] || shapeType}`);
            }
            instructionEl.textContent = `${currentGoal.instruction} (Szükséges: ${requiredShapesList.join(', ')}.)`;


            if (!document.getElementById('build-task-styles')) {
                const style = document.createElement('style');
                style.id = 'build-task-styles';
                style.innerHTML = `
                    .build-area-container { display: flex; gap: 20px; margin-top: 20px; justify-content: center; flex-wrap: wrap;}
                    .build-palette { width: 150px; min-height: 250px; border: 2px dashed var(--task-border); padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 10px; background-color: var(--build-palette-bg, var(--task-bg)); border-radius: 8px;}
                    .build-canvas { width: 300px; height: 250px; border: 2px solid var(--build-canvas-border, var(--task-border)); position: relative; background-color: var(--container-bg); border-radius: 8px; overflow: hidden; touch-action: none;}
                    .build-palette .shape-item { cursor: grab !important; }
                    .build-canvas .shape-item { position: absolute !important; cursor: move !important; }
                `;
                document.head.appendChild(style);
            }

            let paletteSet = new Set();
            Object.keys(currentGoal.required).forEach(type => paletteSet.add(type));

            const extrasNeeded = Math.max(0, 4 - paletteSet.size);
            let availableExtras = task10State.paletteShapes.filter(type => !paletteSet.has(type));
            shuffleArray(availableExtras);
            for(let i=0; i < Math.min(extrasNeeded, availableExtras.length); i++) {
                paletteSet.add(availableExtras[i]);
            }
            if (paletteSet.size < 3) {
                shuffleArray(task10State.paletteShapes);
                for(const type of task10State.paletteShapes){
                    if(paletteSet.size >= 4) break;
                    paletteSet.add(type);
                }
            }

            let finalPalette = Array.from(paletteSet);
            shuffleArray(finalPalette);

            if (!isThemeChange) {
                logNewTask('Alakzatok - Építő', { 
                    goal: task10State.currentGoalKey,
                    palette: finalPalette
                });
            }

            finalPalette.forEach((type, index) => {
                const shapeDiv = document.createElement('div');
                shapeDiv.classList.add('shape-item');
                shapeDiv.id = `build_palette_${type}_${index}`;
                shapeDiv.dataset.shapeType = type;
                shapeDiv.appendChild(createShapeSvg(type, 50));
                makeDraggable(shapeDiv, { type: type, id: shapeDiv.id, fromPalette: true, task: 'task10' }); // Add task identifier
                paletteArea.appendChild(shapeDiv);
            });

            makeDroppable(canvasArea, onDropToBuildCanvasTask10);
            makeDroppable(paletteArea, (draggedItem, targetPalette, data) => {
                if (data.task === 'task10' && !data.fromPalette) { // Only allow dropping back to palette for task 10 items not originally from palette
                    draggedItem.remove();
                    task10State.placedShapes = task10State.placedShapes.filter(s => s.id !== data.id);
                }
            });
        }
        function onDropToBuildCanvasTask10(draggedItem, targetCanvas, data, event = null) {
            const canvasRect = targetCanvas.getBoundingClientRect();
            let newX, newY;

            if (event && event.touches && event.touches.length > 0) { // Touch event
                const touch = event.touches[0] || event.changedTouches[0];
                newX = touch.clientX - canvasRect.left - dragOffsetX;
                newY = touch.clientY - canvasRect.top - dragOffsetY;
            } else if (event) { // Mouse event
                newX = event.clientX - canvasRect.left - dragOffsetX;
                newY = event.clientY - canvasRect.top - dragOffsetY;
            } else { // Fallback, should not happen if called correctly
                newX = draggedItem.offsetLeft;
                newY = draggedItem.offsetTop;
            }
            
            newX = Math.max(0, Math.min(newX, canvasRect.width - draggedItem.offsetWidth));
            newY = Math.max(0, Math.min(newY, canvasRect.height - draggedItem.offsetHeight));

            if (data.fromPalette) {
                const clone = draggedItem.cloneNode(true);
                clone.style.position = 'absolute';
                clone.style.left = newX + 'px';
                clone.style.top = newY + 'px';
                clone.id = `built_shape_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                clone.dataset.shapeType = data.type;
                targetCanvas.appendChild(clone);
                task10State.placedShapes.push({id: clone.id, type: data.type, x: newX, y: newY});
                makeDraggable(clone, {type: data.type, id: clone.id, fromPalette: false, task: 'task10'}); // Add task identifier
            } else {
                draggedItem.style.left = newX + 'px';
                draggedItem.style.top = newY + 'px';
                const shapeState = task10State.placedShapes.find(s => s.id === data.id);
                if(shapeState) {
                    shapeState.x = newX;
                    shapeState.y = newY;
                }
            }
            clearFeedback('feedback_task10');
        }
        function checkTask10() {
            const currentGoal = BUILD_GOALS[task10State.currentGoalKey];
            const requiredShapesForGoal = currentGoal.required;

            const placedTypesCount = {};
            task10State.placedShapes.forEach(s => {
                placedTypesCount[s.type] = (placedTypesCount[s.type] || 0) + 1;
            });

            let allRequiredMet = true;
            for (const type in requiredShapesForGoal) {
                if ((placedTypesCount[type] || 0) < requiredShapesForGoal[type]) {
                    allRequiredMet = false;
                    break;
                }
            }

            logTaskCheck('Alakzatok - Építő', { 
                goal: task10State.currentGoalKey, 
                placedShapes: placedTypesCount,
                required: requiredShapesForGoal,
                isCorrect: allRequiredMet 
            });

            if (allRequiredMet) {
                 setFeedback('feedback_task10', `Ügyes! Sikeresen felhasználtad a szükséges alakzatokat a ${currentGoal.name} építéséhez! 🎉`, true);
            } else {
                 let missingMsg = `Hiányoznak még elemek a ${currentGoal.name} építéséhez: `;
                 let missingParts = [];
                 for (const type in requiredShapesForGoal) {
                     const needed = requiredShapesForGoal[type];
                     const placed = placedTypesCount[type] || 0;
                     if (placed < needed) {
                         missingParts.push(`${needed - placed} db ${SHAPE_NAMES[type] || type}`);
                     }
                     // Highlight missing shapes for visual feedback on canvas
                     if (placed > needed) { // Too many of a certain shape
                        // This would require iterating over placedShapes and adding a class to extras
                     }
                 }
                 setFeedback('feedback_task10', missingMsg + missingParts.join(', ') + ".", false);
            }
        }


        // --- INICIALIZÁLÁS ---
        document.addEventListener('DOMContentLoaded', function() {
            logTaskEntry('Alakzatok Gyakorló');
            generateShapeLegend();
            applyTheme(currentTheme);

            const initialGenerators = [
                generateTask1, generateTask2, generateTask3, generateTask4, generateTask5,
                generateTask7, generateTask8, generateTask9, generateTask10
            ];
            initialGenerators.forEach(genFunc => {
                if (typeof genFunc === 'function') {
                    try {
                        genFunc(false);
                    } catch(e) {
                        console.error("Hiba a kezdeti generáláskor (" + genFunc.name + "): ", e.message, e.stack);
                    }
                } else {
                    console.warn("Nem található generáló függvény: ", genFunc);
                }
            });
        });