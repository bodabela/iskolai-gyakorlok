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
    
    // Külön, láthatatlan mérő elem a "mi lenne ha" teszteléshez
    const tempMeasureElement = createTextElement(0);
    tempMeasureElement.style.visibility = 'hidden';
    svg.appendChild(tempMeasureElement);

    words.forEach(word => {
        // A jelenlegi sor tartalmát belemásoljuk a mérőbe
        tempMeasureElement.innerHTML = currentTextElement.innerHTML;
        // Hozzáadjuk az új szót is a mérőhöz
        word.forEach(part => {
            tempMeasureElement.appendChild(createTspanElement(part.text, part.color));
        });

        // Megmérjük, hogy a teljes tartalom (régi sor + új szó) kifér-e
        if (tempMeasureElement.getComputedTextLength() > SVG_WIDTH - PADDING * 2 && currentTextElement.children.length > 0) {
            // NEM FÉR KI: Új sort kezdünk
            currentY += LINE_HEIGHT;
            currentTextElement = createTextElement(currentY);
            textContainer.appendChild(currentTextElement);
            createRulerForLine(currentY);

            // És az új sorba írjuk be a szót (szóköz nélkül az elején)
            word.forEach(part => {
                if (!part.text.match(/^\s+$/)) {
                    currentTextElement.appendChild(createTspanElement(part.text, part.color));
                }
            });
        } else {
            // ELFÉR: Hozzáadjuk a szót a valódi, látható sorhoz
            word.forEach(part => {
                currentTextElement.appendChild(createTspanElement(part.text, part.color));
            });
        }
    });

    // A láthatatlan mérő elem eltávolítása a végén
    svg.removeChild(tempMeasureElement);
    
    const finalHeight = currentY + FONT_SIZE;
    svg.setAttribute("viewBox", `0 0 ${SVG_WIDTH} ${finalHeight}`);


    // --- SEGÉDFÜGGVÉNYEK ---
    function createTextElement(y) {
        const textElement = document.createElementNS(svgNS, 'text');
        textElement.setAttribute('x', PADDING);
        textElement.setAttribute('y', y);
        textElement.setAttribute('font-family', FONT_FAMILY);
        textElement.setAttribute('font-size', `${FONT_SIZE+30}px`);
        textElement.setAttribute('xml:space', 'preserve');
        return textElement;
    }

    function createTspanElement(text, color) {
        const tspanElement = document.createElementNS(svgNS, 'tspan');
        tspanElement.setAttribute('fill', color);
        tspanElement.setAttribute('xml:space', 'preserve');
        tspanElement.textContent = text;
        return tspanElement;
    }

    function createRulerForLine(y) {
        const vonalak = [
            { y_off: 0, stroke: '#a0c8ff', 'stroke-width': 1.5 },
            { y_off: -(FONT_SIZE * 0.5), stroke: '#a0c8ff', 'stroke-width': 1, 'stroke-dasharray': '4 2' },
            { y_off: -(FONT_SIZE), stroke: '#e0e0e0', 'stroke-width': 1 },
            { y_off: FONT_SIZE * 0.25, stroke: '#e0e0e0', 'stroke-width': 1 }
        ];
        vonalak.forEach(v => {
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('x2', SVG_WIDTH);
            line.setAttribute('y1', y + v.y_off);
            line.setAttribute('y2', y + v.y_off);
            line.setAttribute('stroke', v.stroke);
            line.setAttribute('stroke-width', v['stroke-width']);
            if (v['stroke-dasharray']) line.setAttribute('stroke-dasharray', v['stroke-dasharray']);
            lineContainer.appendChild(line);
        });
    }
}