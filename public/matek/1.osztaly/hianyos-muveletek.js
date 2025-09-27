initializeFirebaseAndLogger();

const SVG_NS = "http://www.w3.org/2000/svg";

let currentNumberRange = 10; 

let task1Data = { num1: 3, sum: 7, correctAnswer: 4 };
let task2Data = { minuend: 9, difference: 4, correctAnswer: 5 };
let task3Data = { subtrahend: 6, difference: 8, correctAnswer: 14 };


function drawTicksAndNumbers(svgElement, groupClass, startX, spacing, maxNum, yAxis, highlightedNumbers = []) {
    const g = svgElement.querySelector(groupClass);
    if (!g) return;
    g.innerHTML = ''; 

    const textYPosition = yAxis + 15; 
    const rectHeight = 18;
     

    for (let i = 0; i <= maxNum; i++) {
        const x = startX + i * spacing;
        const tick = document.createElementNS(SVG_NS, "line");
        tick.setAttribute("class", "tick");
        tick.setAttribute("x1", x);
        tick.setAttribute("y1", yAxis - 5); 
        tick.setAttribute("x2", x);
        tick.setAttribute("y2", yAxis + 5); 
        g.appendChild(tick);

        const currentHighlight = highlightedNumbers.find(h => h.value === i);

        if (currentHighlight && currentHighlight.color !== 'transparent') { 
            const rect = document.createElementNS(SVG_NS, "rect");
            const rectWidth = rectHeight; 
            rect.setAttribute("x", x - rectWidth / 2);
            rect.setAttribute("y", textYPosition - rectHeight / 2); 
            rect.setAttribute("width", rectWidth);
            rect.setAttribute("height", rectHeight);
            rect.setAttribute("fill", currentHighlight.color);
            rect.setAttribute("rx", 4);
            rect.setAttribute("ry", 4);
            g.appendChild(rect); 
        }

        const text = document.createElementNS(SVG_NS, "text");
        text.setAttribute("class", "number-text");
        text.setAttribute("x", x);
        text.setAttribute("y", textYPosition); 
        text.setAttribute("dominant-baseline", "middle");
        text.textContent = i;
        g.appendChild(text);
    }
}

function updateNumberDisplayDiv(divId, number, backgroundColorHex = "87CEEB") {
    const divElement = document.getElementById(divId);
    if (divElement) {
        divElement.textContent = number;
        divElement.style.backgroundColor = `#${backgroundColorHex}`;
    }
}

function calculateSpacing(svgWidth, startX, maxNum) {
    const usableWidth = svgWidth - startX - 20; 
    return maxNum > 0 ? usableWidth / maxNum : usableWidth; 
}


function initNumberLine1(num1 = task1Data.num1, sum = task1Data.sum) {
    const svg = document.getElementById("numberLine1");
    const axis = document.getElementById("axis1");
    const startX = 40; 
    const svgWidth = parseInt(svg.getAttribute("viewBox").split(" ")[2]);
    const maxNumOnLine = currentNumberRange; 
    const spacing = calculateSpacing(svgWidth, startX, maxNumOnLine);
    
    const yAxis = 40; 
    const yArrows = yAxis - 15; 
    const yText = yArrows - 7; 

    axis.setAttribute("x1", startX);
    axis.setAttribute("y1", yAxis);
    axis.setAttribute("x2", startX + maxNumOnLine * spacing + 10); 
    axis.setAttribute("y2", yAxis);
    
    const highlightedNumbers1 = [
        { value: num1, color: '#FFD700' }, 
        { value: sum, color: '#87CEEB' }   
    ];
    drawTicksAndNumbers(svg, ".ticks-and-numbers", startX, spacing, maxNumOnLine, yAxis, highlightedNumbers1);

    // Csak az ismeretlent jelző nyíl marad
    let x1_op2 = startX + num1 * spacing;
    let x2_op2 = startX + sum * spacing;
    document.getElementById("arrow1_op2").setAttribute("x1", x1_op2);
    document.getElementById("arrow1_op2").setAttribute("y1", yArrows);
    document.getElementById("arrow1_op2").setAttribute("x2", x2_op2); 
    document.getElementById("arrow1_op2").setAttribute("y2", yArrows);

    const label1Op2Op = document.getElementById("label1_op2_op");
    label1Op2Op.setAttribute("x", (x1_op2 + x2_op2) / 2 - 6); 
    label1Op2Op.setAttribute("y", yText);
    label1Op2Op.textContent = "+";
    
    const label1Op2QMark = document.getElementById("label1_op2_q_mark");
    label1Op2QMark.setAttribute("x", (x1_op2 + x2_op2) / 2 + 6); 
    label1Op2QMark.setAttribute("y", yText);
    
    document.getElementById("marker1_res").setAttribute("cx", startX + sum * spacing);
    document.getElementById("marker1_res").setAttribute("cy", yAxis);

    // Az első nyíl és feliratának eltávolítása (vagy láthatatlanná tétele)
    document.getElementById("arrow1_op1").style.display = "none";
    document.getElementById("label1_op1_num").style.display = "none";
    const label1Op1Op = svg.querySelector("#label1_op1_op"); 
    if(label1Op1Op) label1Op1Op.style.display = "none";
}

function initNumberLine2(minuend = task2Data.minuend, difference = task2Data.difference) {
    const svg = document.getElementById("numberLine2");
    const axis = document.getElementById("axis2");
    const startX = 40;
    const svgWidth = parseInt(svg.getAttribute("viewBox").split(" ")[2]);
    const maxNumOnLine = currentNumberRange; 
    const spacing = calculateSpacing(svgWidth, startX, maxNumOnLine);

    const yAxis = 70; 
    const yNumbers = yAxis + 20;
    const yArrows = yAxis - 35; 
    const yText = yArrows - 7;

    axis.setAttribute("x1", startX);
    axis.setAttribute("y1", yAxis);
    axis.setAttribute("x2", startX + maxNumOnLine * spacing + 10);
    axis.setAttribute("y2", yAxis);

    const highlightedNumbers2 = [
        { value: minuend, color: '#90EE90' },    
        { value: difference, color: '#FFA07A' } 
    ];
    drawTicksAndNumbers(svg, ".ticks-and-numbers", startX, spacing, maxNumOnLine, yAxis, highlightedNumbers2);

    // Csak az ismeretlen kivonást jelző nyíl marad
    let x1_unknown = startX + minuend * spacing;
    let x2_unknown = startX + difference * spacing;
    const arrowUnknownSub = document.getElementById("arrow2_unknown_sub");
    arrowUnknownSub.setAttribute("x1", x1_unknown);
    arrowUnknownSub.setAttribute("y1", yArrows); 
    arrowUnknownSub.setAttribute("x2", x2_unknown); 
    arrowUnknownSub.setAttribute("y2", yArrows); 

    const labelUnknownOp = document.getElementById("label2_unknown_op");
    labelUnknownOp.setAttribute("x", (x1_unknown + x2_unknown) / 2 - 6); 
    labelUnknownOp.setAttribute("y", yText); 
    labelUnknownOp.textContent = "-";

    const labelUnknownNumQ = document.getElementById("label2_unknown_num_q");
    labelUnknownNumQ.setAttribute("x", (x1_unknown + x2_unknown) / 2 + 6); 
    labelUnknownNumQ.setAttribute("y", yText); 
    labelUnknownNumQ.textContent = "?"; 
    
    const markerResult = document.getElementById("marker2_result");
    markerResult.setAttribute("cx", startX + difference * spacing);
    markerResult.setAttribute("cy", yAxis);

    // Az ismert mennyiséget jelző nyíl és felirat eltávolítása
    document.getElementById("arrow2_known").style.display = "none";
    document.getElementById("label2_known_num").style.display = "none";
}

function initNumberLine3(minuend = task3Data.correctAnswer, subtrahend = task3Data.subtrahend, difference = task3Data.difference) {
    const svg = document.getElementById("numberLine3");
    const axis = document.getElementById("axis3");
    const startX = 40;
    const svgWidth = parseInt(svg.getAttribute("viewBox").split(" ")[2]);
    const maxNumOnLine = currentNumberRange; 
    const spacing = calculateSpacing(svgWidth, startX, maxNumOnLine);
    
    const yAxis = 80; 
    const yNumbers = yAxis + 20; 
    const yArrowsTop = yAxis - 50; 
    const yTextTop = yArrowsTop - 7; 
    const yArrowsBottom = yAxis - 30 ; 
    const yTextBottom = yArrowsBottom + 12; 

    axis.setAttribute("x1", startX);
    axis.setAttribute("y1", yAxis);
    axis.setAttribute("x2", startX + maxNumOnLine * spacing + 10);
    axis.setAttribute("y2", yAxis);

    const highlightedNumbers3 = [
        { value: difference, color: '#DDA0DD' }
    ];
    drawTicksAndNumbers(svg, ".ticks-and-numbers", startX, spacing, maxNumOnLine, yAxis, highlightedNumbers3);
    
    // Felső sorozat: ? - 6 = 8
    const qMarkTopX = startX + minuend * spacing;
    const labelStartQTop = document.getElementById("label3_start_q_top");
    labelStartQTop.setAttribute("x", qMarkTopX);
    labelStartQTop.setAttribute("y", yNumbers + 15); // Lejjebb tolva
    labelStartQTop.textContent = "?";
    labelStartQTop.style.fill = "#e53935"; 
    
    let x1_sub_top = startX + minuend * spacing;
    let x2_sub_top = startX + difference * spacing;
    const arrowSubTop = document.getElementById("arrow3_subtraction_top");
    arrowSubTop.setAttribute("x1", x1_sub_top);
    arrowSubTop.setAttribute("y1", yArrowsTop); 
    arrowSubTop.setAttribute("x2", x2_sub_top); 
    arrowSubTop.setAttribute("y2", yArrowsTop); 

    const midPointSubTopX = (x1_sub_top + x2_sub_top) / 2;
    
    const labelSubNumTopBg = document.getElementById("label3_sub_num_top_bg");
    const labelSubNumTop = document.getElementById("label3_sub_num_top");
    labelSubNumTop.textContent = subtrahend.toString();
    
    const tempTextForWidth = document.createElementNS(SVG_NS, "text");
    tempTextForWidth.setAttribute("class", "label-text-num");
    tempTextForWidth.style.visibility = "hidden";
    tempTextForWidth.textContent = subtrahend.toString();
    svg.appendChild(tempTextForWidth);
    const textWidthSub = tempTextForWidth.getComputedTextLength();
    svg.removeChild(tempTextForWidth);

    const rectWidthSub = textWidthSub + 11; // A felhasználó által preferált érték 
    const rectHeightSub = 20; 

    labelSubNumTopBg.setAttribute("x", midPointSubTopX + 6 - rectWidthSub / 2); 
    labelSubNumTopBg.setAttribute("y", yTextTop - rectHeightSub / 2 - 5); // Korrigálva, hogy ne lógjon ki (-5 eltávolítva)
    labelSubNumTopBg.setAttribute("width", rectWidthSub);
    labelSubNumTopBg.setAttribute("height", rectHeightSub);
    labelSubNumTopBg.setAttribute("fill", "#FFC0CB"); 

    document.getElementById("label3_sub_op_top").setAttribute("x", midPointSubTopX - 6);
    document.getElementById("label3_sub_op_top").setAttribute("y", yTextTop); 
    document.getElementById("label3_sub_op_top").textContent = "-";
    document.getElementById("label3_sub_op_top").style.fill = "#ff9800"; 
    labelSubNumTop.setAttribute("x", midPointSubTopX + 6); 
    labelSubNumTop.setAttribute("y", yTextTop); 
    labelSubNumTop.style.fill = "#000000"; 
    
    document.getElementById("marker3_result_top").setAttribute("cx", startX + difference * spacing);
    document.getElementById("marker3_result_top").setAttribute("cy", yAxis);

    // Alsó sorozat: 8 + 6 = ?
    const firstAddendBottom = difference; 
    const secondAddendBottom = subtrahend; 
    const sumResultBottom = minuend; 

    // Első nyíl (0-tól difference-ig) elrejtése
    document.getElementById("arrow3_add1_bottom").style.display = "none";
    document.getElementById("label3_add1_num_bottom").style.display = "none";
    const label3Add1OpBottom = svg.querySelector("#label3_add1_op_bottom");
    if(label3Add1OpBottom) label3Add1OpBottom.style.display = "none";

    // Csak a második nyíl: difference-től minuend-ig (+subtrahend)
    let x1_add2_bottom = startX + difference * spacing;
    let x2_add2_bottom = startX + minuend * spacing;
    const arrow2Bottom = document.getElementById("arrow3_add2_bottom");
    arrow2Bottom.setAttribute("x1", x1_add2_bottom);
    arrow2Bottom.setAttribute("y1", yArrowsBottom); 
    arrow2Bottom.setAttribute("x2", x2_add2_bottom); 
    arrow2Bottom.setAttribute("y2", yArrowsBottom); 

    document.getElementById("label3_add2_op_bottom").setAttribute("x", (x1_add2_bottom + x2_add2_bottom) / 2 - 6); 
    document.getElementById("label3_add2_op_bottom").setAttribute("y", yTextBottom); 
    document.getElementById("label3_add2_op_bottom").textContent = "+";
    document.getElementById("label3_add2_num_bottom").setAttribute("x", (x1_add2_bottom + x2_add2_bottom) / 2 + 6); 
    document.getElementById("label3_add2_num_bottom").setAttribute("y", yTextBottom); 
    document.getElementById("label3_add2_num_bottom").textContent = subtrahend.toString();
}

function generateTask1() {
    let sumMax = currentNumberRange;
    if (sumMax < 2) sumMax = 2; 
    task1Data.num1 = Math.floor(Math.random() * (sumMax -1)) + 1; 
    task1Data.correctAnswer = Math.floor(Math.random() * (sumMax - task1Data.num1)) + 1; 
    task1Data.sum = task1Data.num1 + task1Data.correctAnswer;
    if (task1Data.sum > currentNumberRange) { 
         task1Data.sum = currentNumberRange;
         task1Data.correctAnswer = task1Data.sum - task1Data.num1;
         if (task1Data.correctAnswer < 1) { 
            task1Data.num1 = Math.max(1, Math.floor(currentNumberRange / 2)); 
            task1Data.correctAnswer = currentNumberRange - task1Data.num1;
            if (task1Data.correctAnswer < 1 && currentNumberRange > 1) { 
                task1Data.num1 = currentNumberRange - 1;
                task1Data.correctAnswer = 1;
                task1Data.sum = currentNumberRange;
            } else if (currentNumberRange === 1) {
                task1Data.num1 = 1;
                task1Data.correctAnswer = 0; 
                task1Data.sum = 1;
            }
         }
    }

    document.getElementById('task1_description_p').textContent = `Mennyit kell adni ${task1Data.num1}-hez, hogy ${task1Data.sum} legyen?`;
    updateNumberDisplayDiv("task1_img_num1", task1Data.num1, "FFD700");
    updateNumberDisplayDiv("task1_img_sum", task1Data.sum, "87CEEB");
    document.getElementById('task1_answer').value = '';
    document.getElementById('task1_answer').max = currentNumberRange;
    document.getElementById('task1_feedback').textContent = '';
    document.getElementById('task1_feedback').className = 'feedback';
    initNumberLine1(task1Data.num1, task1Data.sum);
}

function generateTask2() {
    let minuendMax = currentNumberRange;
    if (minuendMax < 2) minuendMax = 2;
    task2Data.minuend = Math.floor(Math.random() * (minuendMax -1)) + 2; 
    task2Data.correctAnswer = Math.floor(Math.random() * (task2Data.minuend -1)) + 1; 
    task2Data.difference = task2Data.minuend - task2Data.correctAnswer;
    if (task2Data.difference < 0) { 
        task2Data.difference = 0;
        task2Data.correctAnswer = task2Data.minuend;
    }

    document.getElementById('task2_description_p').textContent = `Mennyit kell kivonni ${task2Data.minuend}-ből, hogy ${task2Data.difference} legyen?`;
    updateNumberDisplayDiv("task2_img_minuend", task2Data.minuend, "90EE90");
    updateNumberDisplayDiv("task2_img_difference", task2Data.difference, "FFA07A");
    document.getElementById('task2_answer').value = '';
    document.getElementById('task2_answer').max = currentNumberRange;
    document.getElementById('task2_feedback').textContent = '';
    document.getElementById('task2_feedback').className = 'feedback';
    initNumberLine2(task2Data.minuend, task2Data.difference);
}

function generateTask3() {
    let correctAnswerMax = currentNumberRange;
    if (correctAnswerMax < 2) correctAnswerMax = 2; 
    
    task3Data.subtrahend = Math.floor(Math.random() * (correctAnswerMax - 1)) + 1; 
    task3Data.difference = Math.floor(Math.random() * (correctAnswerMax - task3Data.subtrahend)) + 1; 
    task3Data.correctAnswer = task3Data.difference + task3Data.subtrahend; 

    if (task3Data.correctAnswer > currentNumberRange) {
        task3Data.correctAnswer = currentNumberRange;
        if (task3Data.subtrahend >= task3Data.correctAnswer) {
            task3Data.subtrahend = task3Data.correctAnswer -1;
            if (task3Data.subtrahend < 1) task3Data.subtrahend = 1; 
        }
        task3Data.difference = task3Data.correctAnswer - task3Data.subtrahend;
        if(task3Data.difference < 0) { 
            task3Data.difference = 0;
            task3Data.correctAnswer = task3Data.subtrahend; 
        }
    }

    document.getElementById('task3_description_p').textContent = `Melyik számból kell elvenni ${task3Data.subtrahend}-ot, hogy ${task3Data.difference} maradjon?`;
    updateNumberDisplayDiv("task3_img_subtrahend", task3Data.subtrahend, "FFC0CB");
    updateNumberDisplayDiv("task3_img_difference", task3Data.difference, "DDA0DD");
    document.getElementById('task3_answer').value = '';
    document.getElementById('task3_answer').max = currentNumberRange;
    document.getElementById('task3_feedback').textContent = '';
    document.getElementById('task3_feedback').className = 'feedback';
    initNumberLine3(task3Data.correctAnswer, task3Data.subtrahend, task3Data.difference);
}


function clearFeedback(feedbackEl) {
    setTimeout(() => {
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
    }, 10000); 
}

function checkTask1() {
    const answer = parseInt(document.getElementById('task1_answer').value);
    const feedbackEl = document.getElementById('task1_feedback');
    if (answer === task1Data.correctAnswer) { 
        feedbackEl.textContent = 'Ügyes vagy! Pontosan ' + task1Data.correctAnswer + ' hiányzott.';
        feedbackEl.className = 'feedback correct';
    } else if (isNaN(answer)) {
        feedbackEl.textContent = 'Kérlek, írj be egy számot!';
        feedbackEl.className = 'feedback incorrect';
    }
    else {
        feedbackEl.textContent = 'Ez még nem jó. Gondold át, mennyit kell a ' + task1Data.num1 + '-hoz adni, hogy ' + task1Data.sum + ' legyen!';
        feedbackEl.className = 'feedback incorrect';
    }
    clearFeedback(feedbackEl);
}

function checkTask2() {
    const answer = parseInt(document.getElementById('task2_answer').value);
    const feedbackEl = document.getElementById('task2_feedback');
    if (answer === task2Data.correctAnswer) { 
        feedbackEl.textContent = 'Nagyszerű! Valóban ' + task2Data.correctAnswer + '-öt kellett elvenni.';
        feedbackEl.className = 'feedback correct';
    } else if (isNaN(answer)) {
        feedbackEl.textContent = 'Kérlek, írj be egy számot!';
        feedbackEl.className = 'feedback incorrect';
    }
    else {
        feedbackEl.textContent = 'Nem pontos. Számolj utána, mennyit kell elvenni a ' + task2Data.minuend + '-ből, hogy ' + task2Data.difference + ' maradjon!';
        feedbackEl.className = 'feedback incorrect';
    }
    clearFeedback(feedbackEl);
}

function checkTask3() {
    const answer = parseInt(document.getElementById('task3_answer').value);
    const feedbackEl = document.getElementById('task3_feedback');
    if (answer === task3Data.correctAnswer) { 
        feedbackEl.textContent = 'Kiváló! A ' + task3Data.correctAnswer + '-ből kell elvenni ' + task3Data.subtrahend + '-ot.';
        feedbackEl.className = 'feedback correct';
    } else if (isNaN(answer)) {
        feedbackEl.textContent = 'Kérlek, írj be egy számot!';
        feedbackEl.className = 'feedback incorrect';
    }
    else {
        feedbackEl.textContent = 'Ez még nem az igazi. Melyik az a szám, amiből ha elveszel ' + task3Data.subtrahend + '-ot, ' + task3Data.difference + '-at kapsz?';
        feedbackEl.className = 'feedback incorrect';
    }
    clearFeedback(feedbackEl);
}

// Theme switcher logic
const bodyEl = document.body;
const themeButtons = document.querySelectorAll('.theme-button');
const rangeButtons = document.querySelectorAll('.range-button');

function applyTheme(themeClass) {
    bodyEl.className = ''; 
    bodyEl.classList.add(themeClass); 

    themeButtons.forEach(btn => {
        if (btn.dataset.theme === themeClass) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
     // Re-apply active range button style based on currentNumberRange
    rangeButtons.forEach(btn => {
        if (parseInt(btn.dataset.range) === currentNumberRange) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedTheme = button.dataset.theme;
        applyTheme(selectedTheme);
    });
});

rangeButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentNumberRange = parseInt(button.dataset.range);
        
        rangeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Regenerate tasks for the new range
        generateTask1();
        generateTask2();
        generateTask3();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    generateTask1(); 
    generateTask2();
    generateTask3();
    const defaultTheme = 'theme-candy'; 
    applyTheme(defaultTheme); 
    // Set initial active range button
    rangeButtons.forEach(btn => {
        if (parseInt(btn.dataset.range) === currentNumberRange) {
            btn.classList.add('active');
        }
    });
});
