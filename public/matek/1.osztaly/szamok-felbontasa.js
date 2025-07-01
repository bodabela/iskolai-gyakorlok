
initializeFirebaseAndLogger();

const bodyEl = document.body;
const themeButtons = document.querySelectorAll('.theme-button');
const rangeButtons = document.querySelectorAll('.range-button');

let currentNumberRange = 10;
let allTasksSetup = [
	{
		mode: 'guided',
		mainTaskTitleElementId: 'guided_task_title',
		mainInstructionsElementId: 'guided_task_instructions',
		mainTaskTitleText: '1. Feladat: Felbontás Segítséggel',
		mainInstructionsText: 'A táblázatokban a megadott számok egyik felbontott részét előre kitöltöttük. Írd be a hiányzó másik részt!',
		feedbackAreaId: 'feedback_area_g',
		tables: [ 
			{ targetNumber: 0, decompositions: [], containerId: 'decomposition_table_container_g1', inputPrefix: 'g_task1_input' },
			{ targetNumber: 0, decompositions: [], containerId: 'decomposition_table_container_g2', inputPrefix: 'g_task2_input' }
		]
	},
	{
		mode: 'standard',
		mainTaskTitleElementId: 'standard_task_title',
		mainInstructionsElementId: 'standard_task_instructions',
		mainTaskTitleText: '2. Feladat: Önálló Felbontás',
		mainInstructionsText: 'Bontsd fel a fenti számokat két részre a megadott módokon! Írd be a hiányzó számokat a táblázatokba. Minden lehetséges felbontást adj meg!',
		feedbackAreaId: 'feedback_area_s',
		tables: [
			{ targetNumber: 0, decompositions: [], containerId: 'decomposition_table_container_s1', inputPrefix: 's_task1_input' },
			{ targetNumber: 0, decompositions: [], containerId: 'decomposition_table_container_s2', inputPrefix: 's_task2_input' }
		]
	}
];


const columnBackgroundColors = [
	{ pastel: '#FFE0B2', strong: '#FFB74D' }, { pastel: '#C8E6C9', strong: '#81C784' },
	{ pastel: '#BBDEFB', strong: '#64B5F6' }, { pastel: '#FFCDD2', strong: '#E57373' },
	{ pastel: '#F8BBD0', strong: '#F06292' }, { pastel: '#E1BEE7', strong: '#BA68C8' },
	{ pastel: '#B2EBF2', strong: '#4DD0E1' }, { pastel: '#DCEDC8', strong: '#A5D6A7' },
	{ pastel: '#D1C4E9', strong: '#9575CD' }, { pastel: '#FFF9C4', strong: '#FFF176' },
	{ pastel: '#CFD8DC', strong: '#90A4AE' }, { pastel: '#F5F5DC', strong: '#D7CCC8' }
];
let usedColorPairsForRowGeneration = new Set();

const targetNumberBackgroundColors = [
	'#FFD700', '#87CEEB', '#90EE90', '#FFB6C1', '#FFA07A',
	'#ADD8E6', '#FFDEAD', '#DA70D6', '#F0E68C', '#B0E0E6'
];

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTargetNumberBackgroundColor() {
	return targetNumberBackgroundColors[getRandomInt(0, targetNumberBackgroundColors.length - 1)];
}

function applyTheme(themeClass) {
	bodyEl.className = '';
	bodyEl.classList.add(themeClass);
	themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === themeClass));
	rangeButtons.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.range) === currentNumberRange));
	generateAllDecompositionTasks();
}

themeButtons.forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.theme)));
rangeButtons.forEach(button => {
	button.addEventListener('click', () => {
		currentNumberRange = parseInt(button.dataset.range);
		rangeButtons.forEach(btn => btn.classList.remove('active'));
		button.classList.add('active');
		generateAllDecompositionTasks();
	});
});

function generateSpecificTasksAndUpdate(taskSetIndex) {
	const taskSet = allTasksSetup[taskSetIndex];
	const feedbackEl = document.getElementById(taskSet.feedbackAreaId);
	   if (feedbackEl) {
		   feedbackEl.textContent = '';
		   feedbackEl.className = 'feedback';
	   }

	let generatedTargetNumbersForThisSet = new Set();
	   taskSet.tables.forEach(tableDetail => {
			let targetNum;
		let attempts = 0;
		do {
			targetNum = getRandomInt(Math.max(1, Math.floor(currentNumberRange / 2)), currentNumberRange);
			if (currentNumberRange === 5 && targetNum < 1) targetNum = getRandomInt(1,5);
			else if (targetNum < 1 && currentNumberRange > 0) targetNum = 1;
			else if (currentNumberRange === 0 ) targetNum = 0;
			attempts++;
		} while (generatedTargetNumbersForThisSet.has(targetNum) && attempts < 10 && generatedTargetNumbersForThisSet.size < taskSet.tables.length);
		generatedTargetNumbersForThisSet.add(targetNum);
		   tableDetail.targetNumber = targetNum;


		   tableDetail.decompositions = [];
		   if (tableDetail.targetNumber === 0) {
			   tableDetail.decompositions.push({ num1: 0, num2: 0 });
		   } else {
			   for (let i = 0; i <= tableDetail.targetNumber; i++) {
				   tableDetail.decompositions.push({ num1: i, num2: tableDetail.targetNumber - i });
			   }
		   }
		   renderDecompositionTable(tableDetail.containerId, tableDetail.targetNumber, tableDetail.decompositions, tableDetail.inputPrefix, taskSet.mode);
		 });
	setupAllInputFocusAndMaxlength();
	
	// Logolás
	logNewTask('Számok felbontása feladat generálva (egyedi)', {
		range: currentNumberRange,
		mode: taskSet.mode,
		tasks: taskSet.tables.map(t => ({
			target: t.targetNumber,
			decompositions: t.decompositions
		}))
	});
}

function generateGuidedTasksForButton() {
	generateSpecificTasksAndUpdate(0);
}
function generateStandardTasksForButton() {
	generateSpecificTasksAndUpdate(1);
}

function generateAllDecompositionTasks() {
	allTasksSetup.forEach(taskSet => {
		const feedbackEl = document.getElementById(taskSet.feedbackAreaId);
		if (feedbackEl) {
			feedbackEl.textContent = '';
			feedbackEl.className = 'feedback';
		}
		document.getElementById(taskSet.mainTaskTitleElementId).textContent = taskSet.mainTaskTitleText;
		document.getElementById(taskSet.mainInstructionsElementId).textContent = taskSet.mainInstructionsText;

	});
	usedColorPairsForRowGeneration.clear(); 

	let generatedTargetNumbers = new Set();

	allTasksSetup.forEach(taskSet => {
		taskSet.tables.forEach(tableDetail => {
			let targetNum;
			let attempts = 0;
			do { 
				targetNum = getRandomInt(Math.max(1, Math.floor(currentNumberRange / 2)), currentNumberRange);
				if (currentNumberRange === 5 && targetNum < 1) targetNum = getRandomInt(1,5);
				else if (targetNum < 1 && currentNumberRange > 0) targetNum = 1;
				else if (currentNumberRange === 0 ) targetNum = 0;
				attempts++;
			} while (generatedTargetNumbers.has(targetNum) && attempts < 10 && generatedTargetNumbers.size < Math.min(4, currentNumberRange));

			generatedTargetNumbers.add(targetNum);
			tableDetail.targetNumber = targetNum;


			tableDetail.decompositions = [];
			if (tableDetail.targetNumber === 0) {
				tableDetail.decompositions.push({ num1: 0, num2: 0 });
			} else {
				for (let i = 0; i <= tableDetail.targetNumber; i++) {
					tableDetail.decompositions.push({ num1: i, num2: tableDetail.targetNumber - i });
				}
			}
			renderDecompositionTable(tableDetail.containerId, tableDetail.targetNumber, tableDetail.decompositions, tableDetail.inputPrefix, taskSet.mode);
		});
	});
	setupAllInputFocusAndMaxlength();
	
	// Logolás
	logNewTask('Számok felbontása kezdeti feladatok', {
		range: currentNumberRange,
		tasks: allTasksSetup.map(ts => ({
			mode: ts.mode,
			tables: ts.tables.map(t => ({
				target: t.targetNumber,
				decompositions: t.decompositions
			}))
		}))
	});
}


function getDifferentColorPairForRow() {
	let selectedPair;
	let attempts = 0;
	const maxAttempts = columnBackgroundColors.length * 2;
	do {
		selectedPair = columnBackgroundColors[getRandomInt(0, columnBackgroundColors.length - 1)];
		attempts++;
	} while (usedColorPairsForRowGeneration.has(JSON.stringify(selectedPair)) && attempts < maxAttempts && usedColorPairsForRowGeneration.size < columnBackgroundColors.length);

	usedColorPairsForRowGeneration.add(JSON.stringify(selectedPair));
	if (usedColorPairsForRowGeneration.size >= columnBackgroundColors.length) {
		usedColorPairsForRowGeneration.clear();
	}
	return selectedPair;
}

function renderDecompositionTable(containerId, targetNum, decompositionsArray, inputIdPrefix, mode) {
	const container = document.getElementById(containerId);
	if (!container) return;
	container.innerHTML = '';
	const table = document.createElement('table');
	table.classList.add('decomposition-table');

	const headerRow = table.insertRow();
	const mergedHeaderCell = headerRow.insertCell();
	mergedHeaderCell.colSpan = 3;
	mergedHeaderCell.classList.add('merged-header');
	const targetDiv = document.createElement('div');
	targetDiv.classList.add('task-number-display');
	targetDiv.textContent = targetNum;
	targetDiv.style.backgroundColor = getRandomTargetNumberBackgroundColor();
	mergedHeaderCell.appendChild(targetDiv);
	table.appendChild(headerRow);

	const colHeaderRow = table.insertRow();
	colHeaderRow.innerHTML = `
		<th class="column-header">1. rész</th>
		<th class="empty-placeholder-cell"></th>
		<th class="column-header">2. rész</th>`;
	table.appendChild(colHeaderRow);

	const tableBody = document.createElement('tbody');
	decompositionsArray.forEach((decomp, index) => {
		const row = table.insertRow();
		const colors = getDifferentColorPairForRow();
		let prefillNum1 = false;
		if (mode === 'guided') {
			prefillNum1 = ((index + ((index > (decompositionsArray.length / 2 - 1) && (decompositionsArray.length % 2) == 0) ? 1 : 0)) % 2 === 0);
			if (decompositionsArray.length === 1 && targetNum === 0) prefillNum1 = true;
		}

		const cell1 = row.insertCell();
		if (mode === 'guided' && prefillNum1) {
			const displayDiv1 = document.createElement('div');
			displayDiv1.classList.add('task-number-display');
			displayDiv1.textContent = decomp.num1;
			displayDiv1.style.backgroundColor = getRandomTargetNumberBackgroundColor();
			cell1.appendChild(displayDiv1);
		} else {
			const input1 = document.createElement('input');
			input1.type = 'number'; input1.classList.add('table-input');
			input1.id = `${inputIdPrefix}-${index}-1`;
			input1.min = 0; input1.max = targetNum;
			input1.dataset.expected = decomp.num1;
			input1.style.backgroundColor = colors.pastel;
			input1.style.color = getComputedStyle(document.documentElement).getPropertyValue('--input-text-color').trim();
			cell1.appendChild(input1);
		}

		const cellPlus = row.insertCell();
		cellPlus.classList.add('plus-sign'); cellPlus.textContent = '+';
		cellPlus.style.color = colors.strong;

		const cell2 = row.insertCell();
		if (mode === 'guided' && !prefillNum1) {
			const displayDiv2 = document.createElement('div');
			displayDiv2.classList.add('task-number-display');
			displayDiv2.textContent = decomp.num2;
			displayDiv2.style.backgroundColor = getRandomTargetNumberBackgroundColor();
			cell2.appendChild(displayDiv2);
		} else {
			const input2 = document.createElement('input');
			input2.type = 'number'; input2.classList.add('table-input');
			input2.id = `${inputIdPrefix}-${index}-2`;
			input2.min = 0; input2.max = targetNum;
			input2.dataset.expected = decomp.num2;
			input2.style.backgroundColor = colors.pastel;
			input2.style.color = getComputedStyle(document.documentElement).getPropertyValue('--input-text-color').trim();
			cell2.appendChild(input2);
		}
		tableBody.appendChild(row);
	});
	table.appendChild(tableBody);
	container.appendChild(table);
}

function setupAllInputFocusAndMaxlength() {
	const allInputsOnPage = [];
	allTasksSetup.forEach(taskSet => {
		taskSet.tables.forEach(tableDetail => {
			const container = document.getElementById(tableDetail.containerId);
			if (container) {
				const inputsInThisTable = Array.from(container.querySelectorAll('.table-input'));
				inputsInThisTable.forEach(inputEl => {
					inputEl.dataset.targetNumContext = tableDetail.targetNumber;
					allInputsOnPage.push(inputEl);
				});
			}
		});
	});
	
	allInputsOnPage.forEach(inputEl => inputEl.disabled = true);

	allTasksSetup.forEach(taskSet => {
		taskSet.tables.forEach(tableDetail => {
			const container = document.getElementById(tableDetail.containerId);
			if (container) {
				const firstRowWithInput = container.querySelector('tbody tr:has(.table-input)');
				if(firstRowWithInput) {
					const firstRowInputs = firstRowWithInput.querySelectorAll('.table-input');
					firstRowInputs.forEach(inp => inp.disabled = false);
				}
			}
		});
	});


	allInputsOnPage.forEach((inputEl, index) => {
		inputEl.dataset.focusOrder = index;

		const targetNumForThisInput = parseInt(inputEl.dataset.targetNumContext);
		const targetNumStr = String(isNaN(targetNumForThisInput) ? currentNumberRange : targetNumForThisInput);
		const fieldMaxLength = targetNumStr.length > 0 ? targetNumStr.length : 1;
		inputEl.setAttribute('maxlength', fieldMaxLength);

		inputEl.style.borderColor = `var(--input-border-color)`;
		inputEl.style.borderWidth = `1px`;

		inputEl.addEventListener('input', function() {
			const currentInput = this;
			const maxLength = parseInt(currentInput.getAttribute('maxlength')) || 1;
			let focusMovedToNextRow = false;
			
			const currentRow = currentInput.closest('tr');
			if (currentRow) {
				const inputsInCurrentRow = Array.from(currentRow.querySelectorAll('.table-input'));
				const isCurrentRowFilled = inputsInCurrentRow.every(inp => inp.value.trim() !== '');

				if(isCurrentRowFilled) {
					let nextRow = currentRow.nextElementSibling;
					if (nextRow) {
						const inputsInNextRow = nextRow.querySelectorAll('.table-input');
						if (inputsInNextRow.length > 0 && inputsInNextRow[0].disabled) {
							inputsInNextRow.forEach(inp => inp.disabled = false);
							inputsInNextRow[0].focus();
							focusMovedToNextRow = true;
						}
					}
				}
			}

			if (!focusMovedToNextRow && currentInput.value.length >= maxLength) {
				const taskBlock = currentInput.closest('.task');
				if (taskBlock) {
					// Csak az aktuális feladatblokkon belüli inputokat gyűjtjük
					const inputsInTask = Array.from(taskBlock.querySelectorAll('.table-input'));
					const currentIndexInTask = inputsInTask.indexOf(currentInput);

					let nextInputFound = false;
					// Keressük a következő engedélyezett inputot a feladaton belül
					for (let i = currentIndexInTask + 1; i < inputsInTask.length; i++) {
						if (!inputsInTask[i].disabled) {
							inputsInTask[i].focus();
							nextInputFound = true;
							break;
						}
					}

					// Ha nincs több kitölthető input a feladatban, az ellenőrzés gombra ugrunk
					if (!nextInputFound) {
						const checkButton = taskBlock.querySelector('.task-button[onclick^="checkSpecificTasks"]');
						if (checkButton) {
							checkButton.focus();
						}
					}
				}
			}
		});
	});

	if (allInputsOnPage.length > 0) {
		 const firstEnabledInput = allInputsOnPage.find(inp => !inp.disabled);
		 if (firstEnabledInput) {
			 setTimeout(() => firstEnabledInput.focus(), 100);
		 }
	}
}


function checkSpecificTasks(taskBlockIndex) {
	const taskSet = allTasksSetup[taskBlockIndex];
	const feedbackEl = document.getElementById(taskSet.feedbackAreaId);
	if (!feedbackEl) return;

	let allCorrectOverall = true;
	let allFilledOverall = true;
	const borderWidth = getComputedStyle(document.documentElement).getPropertyValue('--feedback-border-width').trim();
	let messagePrefix = taskSet.mode === 'guided' ? "A segített feladatban" : "Az önálló feladatban";
	let hasAnyInputsInThisBlock = false;

	taskSet.tables.forEach(tableDetail => {
		tableDetail.decompositions.forEach((decomp, index) => {
			const input1 = document.getElementById(`${tableDetail.inputPrefix}-${index}-1`);
			const input2 = document.getElementById(`${tableDetail.inputPrefix}-${index}-2`);
			let rowCorrect = true;
			let hasInputInRow = false;

			[input1, input2].forEach((inputEl) => {
				if (inputEl) {
					hasInputInRow = true;
					hasAnyInputsInThisBlock = true;
					if (inputEl.value.trim() === "") {
						if (!inputEl.disabled) {
							allFilledOverall = false; rowCorrect = false;
							inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`;
						}
					} else {
						const val = parseInt(inputEl.value);
						const expectedVal = parseInt(inputEl.dataset.expected);
						if (val !== expectedVal) {
							rowCorrect = false;
							inputEl.style.borderColor = `var(--feedback-incorrect-border-color)`;
						} else {
							inputEl.style.borderColor = `var(--feedback-correct-border-color)`;
						}
					}
					inputEl.style.borderWidth = borderWidth;
					inputEl.style.borderStyle = 'solid';
				}
			});
			if (!hasInputInRow && taskSet.mode === 'guided') { rowCorrect = true; }
			if (!rowCorrect) allCorrectOverall = false;
		});
	});

	if (!hasAnyInputsInThisBlock && taskSet.mode === 'guided') { 
		allFilledOverall = true;
		allCorrectOverall = true;
	}


	if (!allFilledOverall && hasAnyInputsInThisBlock) {
		feedbackEl.textContent = `${messagePrefix} nem töltöttél ki minden mezőt!`;
		feedbackEl.className = 'feedback incorrect';
	} else if (allCorrectOverall) {
		feedbackEl.textContent = `Gratulálok! ${messagePrefix} minden megoldás helyes! 🎉`;
		feedbackEl.className = 'feedback correct';
	} else { 
		feedbackEl.textContent = `${messagePrefix} van hibás megoldás. Nézd át a pirossal jelölteket!`;
		feedbackEl.className = 'feedback incorrect';
	}
	
	// Felhasználói válaszok összegyűjtése a logoláshoz
	let userAnswersForLog = {};
	taskSet.tables.forEach(tableDetail => {
		const tableId = tableDetail.containerId;
		userAnswersForLog[tableId] = {};
		tableDetail.decompositions.forEach((decomp, index) => {
			const rowId = `sor_${index}`;
			userAnswersForLog[tableId][rowId] = {};
			const input1 = document.getElementById(`${tableDetail.inputPrefix}-${index}-1`);
			const input2 = document.getElementById(`${tableDetail.inputPrefix}-${index}-2`);
			if (input1) {
				userAnswersForLog[tableId][rowId].input1 = input1.value;
			}
			if (input2) {
				userAnswersForLog[tableId][rowId].input2 = input2.value;
			}
		});
	});
	
	// Ellenőrzés logolása
	logTaskCheck(`Számok felbontása ellenőrzés: ${taskSet.mode}`, {
		range: currentNumberRange,
		allCorrect: allCorrectOverall,
		userAnswers: userAnswersForLog,
		correctAnswers: taskSet.tables.map(t => ({ 
			target: t.targetNumber, 
			decompositions: t.decompositions 
		}))
	});
	
}

document.addEventListener('DOMContentLoaded', () => {
	// Logolás: Feladatba belépés
	logTaskEntry('Számfelbontás Gyakorló');

	themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === 'theme-candy'));
	rangeButtons.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.range) === currentNumberRange));
	generateAllDecompositionTasks();
});
