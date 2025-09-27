const bodyEl = document.body;
        const themeButtons = document.querySelectorAll('.theme-button');

		const wordList = [
            // j/ly
            'papagáj', 'boglya', 'gólya', 'vályú', 'pikkely', 'gerely', 'keselyű', 
            'pálya', 'folyó', 'folyosó', 'héja', 'karvaly', 'muszáj', 'sólyom',
            'súly', 'tavaly', 'vaj', 'jég', 'játék', 'jel', 'juh', 'járda',

            // Hosszú magánhangzók
            'hosszú', 'hűséges', 'készít', 'tűz', 'víz', 'szép', 'jó',
            'fű', 'út', 'árvíz', 'gyönyörű', 'búcsú', 'póráz', 'pózna', 
            'tető', 'tér', 'szőlő', 'lufi', 'szív',

            // Kétjegyű betűk (gy, ny, ty, sz, zs, cs)
            'gyöngy', 'ágyú', 'betyár', 'kesztyű', 'hattyú', 'tyúk', 'kutya',
            'anyja', 'nyúl', 'nyár', 'száll', 'szék', 'szem', 'száj', 'szín',
            'zsivány', 'zseb', 'zsák', 'rózsa', 'pizsama', 'kulcs', 'papucs',
            'csiga', 'csoki', 'ecset', 'kacsa', 'bocs',

            // Dupla/hosszú mássalhangzók (pl. cc, dd, ff, gg)
            'loccsan', 'loccsanás', 'pattog', 'pattanás', 'roppan', 'cseppen',
            'koppan', 'durran', 'füttyent', 'fütty', 'hattyú', 'könnyű', 
            'meggy', 'meggyfa', 'gally', 'asszony', 'pöttyös', 'brummog',
            'szisszen', 'hosszú', 'rossz', 'váll', 'orra', 'orra', 'tolla',
            'csekk', 'sakk', 'makk', 'hall', 'fullad', 'varr', 'forr', 'berreg',

            // Vegyes példák
            'barátság', 'figyelj', 'edző', 'meggyújt', 'pöffeszkedik', 'ücsörög', 
            'bütykös', 'koccan', 'fénylő', 'gyűrű', 'rozzsal', 'könnyű', 'mennyei',
            'szívből', 'folyóparton', 'ujj', 'pénz', 'cérna', 'dinnye', 'reggel'
        ];
		
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function generateWordTask() {
            const szavakKimenetDiv = document.getElementById('szavakKimenet');
            szavakKimenetDiv.innerHTML = '';
            
            shuffleArray(wordList);
            const selectedWords = wordList.slice(0, 5).join(' ');

            generateHandwritingSVG(selectedWords, szavakKimenetDiv);
        }

        document.getElementById('wordGeneratorGomb').addEventListener('click', generateWordTask);
        
        function applyTheme(themeClass) {
            bodyEl.className = '';
            bodyEl.classList.add(themeClass);

            themeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === themeClass);
            });
            
            if (document.getElementById('teljesSzoveg').value) {
                document.getElementById('generatorGomb').click();
            }
            
            generateWordTask();
        }

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(button.dataset.theme);
            });
        });

        document.addEventListener('DOMContentLoaded', function() {
            applyTheme('theme-jungle');
        });