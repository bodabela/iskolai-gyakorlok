document.getElementById('generatorGomb').addEventListener('click', () => {
    const teljesSzoveg = document.getElementById('teljesSzoveg').value;
    const kimenetDiv = document.getElementById('kimenet');
    kimenetDiv.innerHTML = ''; 
    generateHandwritingSVG(teljesSzoveg, kimenetDiv);
});

function generateHandwritingSVG(text, outputContainer) {
    // --- BEÁLLÍTÁSOK ÉS SZABÁLYOK ---
    const FONT_FAMILY = 'IrottBetuk';
    const FONT_SIZE = 40;
    const LINE_HEIGHT = FONT_SIZE * 2.2;
    const SVG_WIDTH = 800;
    const PADDING = 20;
    const BLACK_COLOR = '#333333';
    const RED_COLOR = '#d90000';

    const ekezetesMaganhangzok = ['á', 'é', 'í', 'ó', 'ö', 'ő', 'ú', 'ü', 'ű'];
    const ketjegyuMassalhangzok = ['cs', 'gy', 'ly', 'ny', 'sz', 'ty', 'zs'];
    const hosszuMassalhangzok = [
        'bb', 'cc', 'dd', 'ff', 'gg', 'jj', 'kk', 'll', 'mm', 'nn', 'pp', 'rr', 'ss', 'tt', 'vv', 'zz',
        'ccs', 'ggy', 'lly', 'nny', 'ssz', 'tty', 'zzs'
    ];
    const highlights = [...ekezetesMaganhangzok, ...ketjegyuMassalhangzok, ...hosszuMassalhangzok]
                        .sort((a, b) => b.length - a.length);

    // --- SVG LÉTREHOZÁSA ÉS BEILLESZTÉSE ---
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    outputContainer.appendChild(svg);
    
    const lineContainer = document.createElementNS(svgNS, 'g');
    const textContainer = document.createElementNS(svgNS, 'g');
    svg.appendChild(lineContainer);
    svg.appendChild(textContainer);

    // --- SZÖVEG FELDOLGOZÁSA ---

    // 1. Színezés
    let segments = [{ text: text, color: BLACK_COLOR }];
    highlights.forEach(highlight => {
        let newSegments = [];
        segments.forEach(segment => {
            if (segment.color === BLACK_COLOR) {
                const parts = segment.text.split(highlight);
                for (let i = 0; i < parts.length; i++) {
                    if (parts[i]) newSegments.push({ text: parts[i], color: BLACK_COLOR });
                    if (i < parts.length - 1) newSegments.push({ text: highlight, color: RED_COLOR });
                }
            } else { newSegments.push(segment); }
        });
        segments = newSegments;
    });

    // 2. Szavakká csoportosítás
    const words = [];
    let currentWord = [];
    segments.forEach(segment => {
        const parts = segment.text.split(/(\s+)/);
        parts.forEach(part => {
            if (!part) return;
            currentWord.push({ text: part, color: part.match(/\s+/) ? BLACK_COLOR : segment.color });
            if (part.match(/\s+/)) {
                words.push(currentWord);
                currentWord = [];
            }
        });
    });
    if (currentWord.length > 0) words.push(currentWord);

    // --- VIZUÁLIS FELÉPÍTÉS (SZAVANKÉNT) ---
    let currentY = PADDING + FONT_SIZE;
    let currentTextElement = createTextElement(currentY);
    textContainer.appendChild(currentTextElement);
    createRulerForLine(currentY);

    words.forEach(word => {
        const originalSpans = currentTextElement.innerHTML;
        let wordFits = true;
        
        word.forEach(part => {
            currentTextElement.appendChild(createTspanElement(part.text, part.color));
        });

        if (currentTextElement.getComputedTextLength() > SVG_WIDTH - PADDING * 2) {
            if (originalSpans.length > 0