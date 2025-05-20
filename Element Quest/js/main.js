// js/main.js
import { elementsData, elementCategories, gameZones, learningContent, loadLearningContentData } from './data.js';

// --- DOM ELEMENT REFERENCES ---
const periodicTableContainer = document.getElementById("periodic-table-container");
const elementInfoContainer = document.getElementById("element-info-container");
const elementInfoTitle = document.getElementById("element-info-title");
const elementDetailsContainer = document.getElementById("element-details");
const atomDiagramContainer = document.getElementById("atom-diagram-container");
const d3AtomModelContainer = document.getElementById("d3-atom-model-container");
const atomDiagramPlaceholder = document.getElementById("atom-diagram-placeholder");
const atomDiagramTitle = document.getElementById("atom-diagram-title");
const legendContentDiv = document.getElementById("legend-content");

const gameSelectionContainer = document.getElementById("game-selection-container");
const zoneButtonsContainer = document.getElementById("zone-buttons-container");
const zoneHighlightToggle = document.getElementById("zone-highlight-toggle");
const currentZoneNameSpan = document.getElementById("current-zone-name");

const particlePinpointSelectBtn = document.getElementById("select-particle-pinpoint-btn");
const propertyProfilerSelectBtn = document.getElementById("select-property-profiler-btn");
const elementSleuthSelectBtn = document.getElementById("select-element-sleuth-btn");

const proceedToChallengeBtn = document.getElementById("proceed-to-challenge-btn");
const setupInstructionsP = document.getElementById("setup-instructions");

const gameControlsContainer = document.getElementById("game-controls-container");
const currentChallengeTitle = document.getElementById("current-challenge-title");
const startChallengeBtn = document.getElementById("start-challenge-btn");
const scoreValueSpan = document.getElementById("score-value");
const attemptsValueSpan = document.getElementById("attempts-value");
const maxAttemptsSpan = document.getElementById("max-attempts-value");
const gameInstructionsP = document.getElementById("game-instructions");
const backToSettingsBtn = document.getElementById("back-to-settings-btn"); 

const particlePinpointUI = document.getElementById("particle-pinpoint-ui");
const protonInput = document.getElementById("proton-input");
const neutronInput = document.getElementById("neutron-input");
const electronInput = document.getElementById("electron-input");

const propertyProfilerUI = document.getElementById("property-profiler-ui");
const propertyQuestionText = document.getElementById("property-question-text");
const mcqOptionsContainer = document.getElementById("mcq-options-container");

const elementSleuthUI = document.getElementById("element-sleuth-ui");
const elementSleuthInstructionsP = document.getElementById("element-sleuth-instructions");
const clueDisplayArea = document.getElementById("clue-display-area");
const clueListUl = document.getElementById("clue-list");
const revealNextClueBtn = document.getElementById("reveal-next-clue-btn");
const clueCountCurrentSpan = document.getElementById("clue-count-current");
const clueCountTotalSpan = document.getElementById("clue-count-total");
const sleuthGuessesRemainingP = document.getElementById("sleuth-guesses-remaining");
const sleuthGuessesValueSpan = document.getElementById("sleuth-guesses-value");
const sleuthClueFilterToggle = document.getElementById("sleuth-clue-filter-toggle"); 

const gameActionContainer = document.getElementById("game-action-container");
const checkAnswerBtn = document.getElementById("check-answer-btn");
const feedbackMessageDiv = document.getElementById("feedback-message");

const hintExplanationArea = document.getElementById("hint-explanation-area");
const hintExplanationText = document.getElementById("hint-explanation-text");

const gameSetupView = document.getElementById('game-setup-view');
const activeGameView = document.getElementById('active-game-view');
const sessionSummaryView = document.getElementById('session-summary-view');
const allViews = [gameSetupView, activeGameView, sessionSummaryView];

const summaryScoreSpan = document.getElementById("summary-score");
const summaryAccuracySpan = document.getElementById("summary-accuracy");
const summaryCorrectSpan = document.getElementById("summary-correct");
const summaryTotalPlayedSpan = document.getElementById("summary-total-played");
const summaryPlayAgainBtn = document.getElementById("summary-play-again-btn");
const summaryNewSettingsBtn = document.getElementById("summary-new-settings-btn");
const sessionSummaryTitle = document.getElementById("session-summary-title");

const D3_SVG_WIDTH = 350; const D3_SVG_HEIGHT = 350; const D3_SVG_CENTER_X = D3_SVG_WIDTH / 2; const D3_SVG_CENTER_Y = D3_SVG_HEIGHT / 2; const NUCLEUS_DISPLAY_RADIUS = 75; const PARTICLE_RADIUS = 5; const NUCLEON_PACKING_EFFECTIVE_RADIUS = NUCLEUS_DISPLAY_RADIUS - PARTICLE_RADIUS - 2; const SHELL_INCREMENT_RADIUS = 35; const FIRST_SHELL_RADIUS = NUCLEUS_DISPLAY_RADIUS + SHELL_INCREMENT_RADIUS * 0.7;

let currentChallengeElementData = null;
let d3Svg = null;
let nucleonSimulation = null;
let score = 0;
let attemptsForCurrentQuestion = 0;
const MAX_ATTEMPTS_PER_QUESTION = 3;
const POINTS_PER_CORRECT_ANSWER = 10;
let currentGameMode = null;
let gameActive = false;
let questionAnswered = false;
let currentQuestionDetails = {};
let selectedMCQAnswer = null;
let isZoneHighlightingActive = true;
let targetElementSleuth = null;
let revealedCluesSleuth = [];
let potentialCluesSleuth = [];
let currentClueIndexSleuth = 0;
const MAX_CLUES_SLEUTH = 5;
let sleuthGuessesRemaining = 3;
const MAX_GUESSES_SLEUTH_ROUND = 3;
let questionsPlayedThisSession = 0;
let correctAnswersThisSession = 0;
const MAX_QUESTIONS_PER_SESSION = 5;
let currentZoneKey = "all";
let isSleuthClueFilteringActive = false; 

function showView(viewIdToShow) {
    allViews.forEach(view => { if (view) view.style.display = 'none'; });
    const viewToShowDOM = document.getElementById(viewIdToShow);
    if (viewToShowDOM) {
        viewToShowDOM.style.display = (viewIdToShow === 'active-game-view') ? 'flex' : 'block';
        // console.log(`Showing view: ${viewIdToShow}`);
    } else { console.error(`View ID '${viewIdToShow}' not found.`); }
}

function calculateSubatomicParticles(elementData) {
    if (!elementData || typeof elementData.atomicNumber === 'undefined' || typeof elementData.massNumber === 'undefined') { return { protons: 0, neutrons: 0, electrons: 0, error: true }; }
    const protons = elementData.atomicNumber; const electrons = elementData.atomicNumber; const roundedMassNumber = Math.round(elementData.massNumber);
    let neutrons = roundedMassNumber - protons; if (neutrons < 0) neutrons = 0;
    return { protons, neutrons, electrons };
}

function displayElementInfo(elementData, revealAll = false) {
    if (!elementDetailsContainer || !elementInfoTitle || !elementInfoContainer) return;
    if (!elementData) {
        elementInfoTitle.textContent = "Element Information"; elementDetailsContainer.innerHTML = '<p>Select an element or start a challenge.</p>';
        elementInfoContainer.classList.remove('game-mode-hidden'); return;
    }
    const particles = calculateSubatomicParticles(elementData); let particleCountsHTML = ''; let infoTitleText = `Details for: ${elementData.name}`;
    if (revealAll) particleCountsHTML = `<div class="subatomic-counts revealed"><h4>Subatomic Particles:</h4><p><strong>Protons:</strong> ${particles.protons}</p><p><strong>Neutrons:</strong> ${particles.neutrons}</p><p><strong>Electrons:</strong> ${particles.electrons}</p></div>`;
    else if (gameActive && currentGameMode === 'particle-pinpoint') { particleCountsHTML = `<div class="subatomic-counts hidden-counts"><p><em>Identify particles to see details!</em></p></div>`; infoTitleText = "Identify Element's Particles!"; }
    else if (gameActive && currentGameMode === 'property-profiler') { particleCountsHTML = `<div class="subatomic-counts revealed"><h4>Subatomic Particles (Reference):</h4><p><strong>Protons:</strong> ${particles.protons}</p><p><strong>Neutrons:</strong> ${particles.neutrons}</p><p><strong>Electrons:</strong> ${particles.electrons}</p></div>`; infoTitleText = `Profiling: ${elementData.name}`; }
    else if (gameActive && currentGameMode === 'element-sleuth' && !revealAll) { particleCountsHTML = `<div class="subatomic-counts hidden-counts"><p><em>Identify element to see details!</em></p></div>`; infoTitleText = "Mystery Element Profile"; }
    else particleCountsHTML = `<div class="subatomic-counts hidden-counts"><p><em>Particle counts hidden.</em></p></div>`;
    elementInfoTitle.textContent = infoTitleText; const categoryInfo = elementCategories[elementData.category] || elementCategories["unknown"];
    const infoHTML = `<h3>${elementData.name} (${elementData.symbol})</h3><p><strong>Atomic Number:</strong> ${elementData.atomicNumber}</p><p><strong>Symbol:</strong> ${elementData.symbol}</p><p><strong>Name:</strong> ${elementData.name}</p><p><strong>Atomic Mass (approx.):</strong> ${elementData.massNumber.toFixed(3)}</p><p><strong>Group:</strong> ${elementData.group !== null ? elementData.group : 'N/A'}</p><p><strong>Period:</strong> ${elementData.period}</p><p><strong>Category:</strong> <span style="color:${categoryInfo.color}; font-weight:bold;">${categoryInfo.name}</span></p>${particleCountsHTML}`;
    elementDetailsContainer.innerHTML = infoHTML;
    const shouldHideDetails = gameActive && !revealAll && (currentGameMode === 'particle-pinpoint' || currentGameMode === 'element-sleuth');
    elementInfoContainer.classList.toggle('game-mode-hidden', shouldHideDetails);
}

function initializeD3Canvas() {
    if (!d3AtomModelContainer) return;
    if (!d3Svg) {
        d3Svg = d3.select("#d3-atom-model-container").append("svg").attr("width", D3_SVG_WIDTH).attr("height", D3_SVG_HEIGHT).attr("viewBox", `0 0 ${D3_SVG_WIDTH} ${D3_SVG_HEIGHT}`);
        d3Svg.append("g").attr("class", "shells-group"); d3Svg.append("g").attr("class", "nucleus-boundary-group");
        d3Svg.append("g").attr("class", "nucleons-group"); d3Svg.append("g").attr("class", "electrons-group");
    }
    d3Svg.selectAll("g > *").remove();
}

function nucleonDragStarted(event, d) { if (!event.active && nucleonSimulation) nucleonSimulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; d3.select(this).raise().style("cursor", "grabbing");}
function nucleonDragged(event, d) { d.fx = event.x; d.fy = event.y; }
function nucleonDragEnded(event, d) { if (!event.active && nucleonSimulation) nucleonSimulation.alphaTarget(0); d.fx = null; d.fy = null; d3.select(this).style("cursor", "grab");}
function electronDragStarted(event, d) { d3.select(this).raise().style("cursor", "grabbing");}
function electronDragged(event, d) { d3.select(this).attr("transform", `translate(${event.x},${event.y})`);}
function electronDragEnded(event, d) { const oX = D3_SVG_CENTER_X + d.shellRadius * Math.cos(d.angleDeg*Math.PI/180); const oY = D3_SVG_CENTER_Y + d.shellRadius * Math.sin(d.angleDeg*Math.PI/180); d3.select(this).style("cursor", "grab").transition().duration(300).attr("transform", `translate(${oX},${oY})`);}

function drawAtomWithD3(particles) {
    if (!d3AtomModelContainer || !d3Svg) { console.error("D3 setup incomplete."); return; }
    initializeD3Canvas();
    d3Svg.select(".nucleus-boundary-group").append("circle").attr("cx", D3_SVG_CENTER_X).attr("cy", D3_SVG_CENTER_Y).attr("r", NUCLEUS_DISPLAY_RADIUS).attr("class", "nucleus-boundary-svg");
    let nucleonsData = []; const iSR = NUCLEON_PACKING_EFFECTIVE_RADIUS * 0.5;
    for (let i=0; i<particles.protons; i++) nucleonsData.push({type:'proton',id:`p${i}`,x:D3_SVG_CENTER_X+(Math.random()-0.5)*iSR,y:D3_SVG_CENTER_Y+(Math.random()-0.5)*iSR});
    for (let i=0; i<particles.neutrons; i++) nucleonsData.push({type:'neutron',id:`n${i}`,x:D3_SVG_CENTER_X+(Math.random()-0.5)*iSR,y:D3_SVG_CENTER_Y+(Math.random()-0.5)*iSR});
    if (nucleonSimulation) nucleonSimulation.stop();
    const nGroups = d3Svg.select(".nucleons-group").selectAll("g.nucleon").data(nucleonsData,d=>d.id).join("g").attr("class",d=>`nucleon ${d.type}-group`).attr("transform",d=>`translate(${d.x},${d.y})`).style("cursor","grab").call(d3.drag().on("start",nucleonDragStarted).on("drag",nucleonDragged).on("end",nucleonDragEnded));
    nGroups.append("circle").attr("r",PARTICLE_RADIUS); nGroups.filter(d=>d.type==='proton').append("text").attr("class","particle-charge-text").text("+");
    if(nucleonsData.length>0){ nucleonSimulation = d3.forceSimulation(nucleonsData).force("collide",d3.forceCollide(PARTICLE_RADIUS+1).strength(0.9).iterations(4)).force("center",d3.forceCenter(D3_SVG_CENTER_X,D3_SVG_CENTER_Y).strength(0.01)).force("boundary",()=>{for(const n of nucleonsData){const r=Math.sqrt((n.x-D3_SVG_CENTER_X)**2+(n.y-D3_SVG_CENTER_Y)**2); if(r>NUCLEON_PACKING_EFFECTIVE_RADIUS){const a=Math.atan2(n.y-D3_SVG_CENTER_Y,n.x-D3_SVG_CENTER_X); n.x=D3_SVG_CENTER_X+NUCLEON_PACKING_EFFECTIVE_RADIUS*Math.cos(a); n.y=D3_SVG_CENTER_Y+NUCLEON_PACKING_EFFECTIVE_RADIUS*Math.sin(a); if(n.vx!=null&&n.vy!=null){n.vx*=0.1;n.vy*=0.1;}}}}).on("tick",()=>nGroups.attr("transform",d=>`translate(${d.x},${d.y})`)); } else if(nucleonSimulation) nucleonSimulation.nodes([]);
    let eTP=particles.electrons; let sN=1; const sC=[2,8,18,32]; const sGrp=d3Svg.select(".shells-group"); const eGrp=d3Svg.select(".electrons-group");
    while(eTP>0&&sN<=4){ const sR=FIRST_SHELL_RADIUS+(sN-1)*SHELL_INCREMENT_RADIUS; if(sR+PARTICLE_RADIUS>D3_SVG_WIDTH/2-5)break; sGrp.append("circle").attr("cx",D3_SVG_CENTER_X).attr("cy",D3_SVG_CENTER_Y).attr("r",sR).attr("class","electron-shell-svg"); const eITS=Math.min(eTP,sC[sN-1]||eTP); if(eITS===0&&eTP>0&&sN<sC.length){sN++;continue;} if(eITS===0)break; let eDFS=[]; for(let i=0;i<eITS;i++){const aD=(i/eITS)*360-90;eDFS.push({id:`e-s${sN}-i${i}`,angleDeg:aD,shellRadius:sR});} const ePGs=eGrp.selectAll(`g.electron-group-s${sN}`).data(eDFS,d=>d.id).join("g").attr("class",`electron-group electron-group-s${sN}`).style("cursor","grab").attr("transform",d=>{const x=D3_SVG_CENTER_X+d.shellRadius*Math.cos(d.angleDeg*Math.PI/180);const y=D3_SVG_CENTER_Y+d.shellRadius*Math.sin(d.angleDeg*Math.PI/180);return `translate(${x},${y})`;}).call(d3.drag().on("start",electronDragStarted).on("drag",electronDragged).on("end",electronDragEnded)); ePGs.append("circle").attr("r",PARTICLE_RADIUS); ePGs.append("text").attr("class","particle-charge-text").text("-"); eTP-=eITS; sN++; }
}

function showAtomModelForChallenge(elementDataForModel) {
    if (!d3AtomModelContainer || !atomDiagramPlaceholder || !atomDiagramTitle) return;
    if (!elementDataForModel) { d3AtomModelContainer.style.display='none'; atomDiagramPlaceholder.style.display='block'; atomDiagramPlaceholder.textContent="Select element for model."; atomDiagramTitle.textContent="Atom Diagram"; if(nucleonSimulation)nucleonSimulation.nodes([]).alpha(1).stop(); return; }
    atomDiagramTitle.textContent=`Atom Diagram: ${elementDataForModel.name} (${elementDataForModel.symbol})`; d3AtomModelContainer.style.display='block'; atomDiagramPlaceholder.style.display='none';
    const particles=calculateSubatomicParticles(elementDataForModel); if(particles.error){atomDiagramPlaceholder.textContent="Error loading model data."; atomDiagramPlaceholder.style.display='block'; d3AtomModelContainer.style.display='none'; return;}
    drawAtomWithD3(particles);
}

function updateGameStatusDisplay() {
    if (scoreValueSpan) scoreValueSpan.textContent = score;
    if (currentZoneNameSpan && gameZones[currentZoneKey]) currentZoneNameSpan.textContent = gameZones[currentZoneKey].name;
    const attemptsLabelEl = gameControlsContainer ? gameControlsContainer.querySelector('p:nth-of-type(2)') : null;
    if (currentGameMode === 'element-sleuth') {
        if (attemptsValueSpan) attemptsValueSpan.textContent = sleuthGuessesRemaining; if (maxAttemptsSpan) maxAttemptsSpan.textContent = MAX_GUESSES_SLEUTH_ROUND;
        if (sleuthGuessesValueSpan) sleuthGuessesValueSpan.textContent = sleuthGuessesRemaining;
        if (clueCountTotalSpan) clueCountTotalSpan.textContent = Math.min(MAX_CLUES_SLEUTH, potentialCluesSleuth.length || MAX_CLUES_SLEUTH);
        if (clueCountCurrentSpan) clueCountCurrentSpan.textContent = revealedCluesSleuth.length;
        if (attemptsLabelEl && attemptsLabelEl.childNodes.length > 0) attemptsLabelEl.childNodes[0].nodeValue = "Guesses Left: ";
    } else {
        if (attemptsValueSpan) attemptsValueSpan.textContent = attemptsForCurrentQuestion; if (maxAttemptsSpan) maxAttemptsSpan.textContent = MAX_ATTEMPTS_PER_QUESTION;
        if (attemptsLabelEl && attemptsLabelEl.childNodes.length > 0) attemptsLabelEl.childNodes[0].nodeValue = "Attempts: ";
    }
}

function getElementsForCurrentZone() {
    const zone = gameZones[currentZoneKey];
    if (!zone) { console.warn(`Zone key "${currentZoneKey}" not found.`); return elementsData; }
    if (zone.elementAtomicNumbers === null) return elementsData;
    if (zone.elementAtomicNumbers) return elementsData.filter(el => zone.elementAtomicNumbers.includes(el.atomicNumber));
    if (zone.categories) return elementsData.filter(el => zone.categories.includes(el.category));
    if (zone.customFilter && typeof zone.customFilter === 'function') return elementsData.filter(zone.customFilter);
    console.warn(`Zone "${zone.name}" has no valid filter.`); return elementsData;
}

function selectRandomElementForChallenge() {
    const availableElements = getElementsForCurrentZone();
    if (availableElements.length === 0) {
        console.error(`CRITICAL: No elements for zone '${currentZoneKey}'.`);
        const allElements = elementsData;
        if (allElements.length === 0) {
            console.error("CRITICAL: elementsData array is empty.");
            if (gameInstructionsP) gameInstructionsP.textContent = "Error: No element data loaded!";
            return null;
        }
        return allElements[Math.floor(Math.random() * allElements.length)];
    }
    return availableElements[Math.floor(Math.random() * availableElements.length)];
}

function setupParticlePinpointChallenge() {
    if (!currentChallengeElementData) return;
    if (currentChallengeTitle) currentChallengeTitle.textContent = "Particle Pinpoint Challenge";
    if (gameInstructionsP) gameInstructionsP.textContent = `Count particles for ${currentChallengeElementData.name} (${currentChallengeElementData.symbol}).`;
    if (particlePinpointUI) particlePinpointUI.style.display = 'block';
    if (propertyProfilerUI) propertyProfilerUI.style.display = 'none';
    if (elementSleuthUI) elementSleuthUI.style.display = 'none';
    showAtomModelForChallenge(currentChallengeElementData);
    displayElementInfo(currentChallengeElementData, false);
    [protonInput, neutronInput, electronInput].forEach(input => {
        if (input) { input.value = ''; input.classList.remove('input-error', 'input-correct'); input.disabled = false; }
    });
    if (hintExplanationArea) hintExplanationArea.style.display = 'none';
}

function generateMCQOptions(correctAnswer, propertyType, element) {
    let options = new Set(); let correctAnswerValue = correctAnswer;
    if (propertyType === 'category') {
        options.add(correctAnswerValue); let distractors = Object.keys(elementCategories).filter(catKey => catKey !== correctAnswerValue && catKey !== "unknown"); distractors.sort(() => 0.5 - Math.random());
        while (options.size < 4 && distractors.length > 0) { options.add(distractors.shift()); }
        return Array.from(options).map(optValue => ({ text: elementCategories[optValue]?.name || optValue, value: optValue.toString() })).sort(() => 0.5 - Math.random());
    } else if (propertyType === 'group' || propertyType === 'period' || propertyType === 'valenceElectrons') {
        options.add(correctAnswerValue.toString()); let allPossibleValues = [];
        if (propertyType === 'valenceElectrons') allPossibleValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
        else if (propertyType === 'group') allPossibleValues = [...new Set(elementsData.map(el => el.group).filter(g => g !== null).map(String))].sort((a, b) => parseInt(a) - parseInt(b));
        else allPossibleValues = [...new Set(elementsData.map(el => el.period.toString()))].sort((a, b) => parseInt(a) - parseInt(b));
        let distractors = allPossibleValues.filter(valStr => valStr !== correctAnswerValue.toString()); distractors.sort(() => 0.5 - Math.random());
        while (options.size < 4 && distractors.length > 0) { options.add(distractors.shift()); }
        return Array.from(options).map(optValue => {
            let textToShow = optValue;
            if (propertyType === 'group') textToShow = `Group ${optValue}`;
            else if (propertyType === 'period') textToShow = `Period ${optValue}`;
            else if (propertyType === 'valenceElectrons') textToShow = `${optValue} valence electron(s)`;
            return { text: textToShow, value: optValue.toString() };
        }).sort(() => 0.5 - Math.random());
    } else if (propertyType === 'standardState') {
        options.add(correctAnswerValue); const states = ["Solid", "Liquid", "Gas"]; let distractors = states.filter(s => s !== correctAnswerValue); distractors.sort(() => 0.5 - Math.random());
        while (options.size < 3 && distractors.length > 0) { options.add(distractors.shift()); }
        return Array.from(options).map(optValue => ({ text: optValue, value: optValue.toString() })).sort(() => 0.5 - Math.random());
    }
    console.warn("Unhandled MCQ property type:", propertyType); options.add(correctAnswerValue.toString());
    return Array.from(options).map(optValue => ({ text: optValue, value: optValue.toString() }));
}

function setupPropertyProfilerChallenge() {
    if (!currentChallengeElementData) return;
    if (currentChallengeTitle) currentChallengeTitle.textContent = "Property Profiler Challenge";
    if (particlePinpointUI) particlePinpointUI.style.display = 'none';
    if (propertyProfilerUI) propertyProfilerUI.style.display = 'block';
    if (elementSleuthUI) elementSleuthUI.style.display = 'none';
    if (d3AtomModelContainer) d3AtomModelContainer.style.display = 'none';
    if (atomDiagramPlaceholder) { atomDiagramPlaceholder.style.display = 'block'; atomDiagramPlaceholder.textContent = `Focus on properties of ${currentChallengeElementData.name}. Model hidden.`; }
    if (atomDiagramTitle) atomDiagramTitle.textContent = "Element Properties Challenge";
    if (hintExplanationArea) hintExplanationArea.style.display = 'none';
    displayElementInfo(currentChallengeElementData, false);
    const questionTypes = ['category', 'group', 'period', 'valenceElectrons', 'standardState'];
    const availableQuestionTypes = questionTypes.filter(type => {
        if (type === 'valenceElectrons' && typeof currentChallengeElementData.valenceElectrons === 'undefined') return false;
        if (type === 'standardState' && typeof currentChallengeElementData.standardState === 'undefined') return false;
        if (type === 'group' && currentChallengeElementData.group === null) return false;
        return true;
    });
    if (availableQuestionTypes.length === 0) {
        console.error("No property questions for element:", currentChallengeElementData.name);
        if (gameInstructionsP) gameInstructionsP.textContent = `No property questions for ${currentChallengeElementData.name}. Skipping.`;
        setTimeout(loadNextChallengeQuestion, 1500); return;
    }
    const randomQuestionType = availableQuestionTypes[Math.floor(Math.random() * availableQuestionTypes.length)]; currentQuestionDetails.type = randomQuestionType;
    let questionTextContent = ""; let correctAnswerValue;
    switch (randomQuestionType) {
        case 'category': questionTextContent = `What is the category of ${currentChallengeElementData.name} (${currentChallengeElementData.symbol})?`; correctAnswerValue = currentChallengeElementData.category; currentQuestionDetails.correctAnswerDisplay = elementCategories[correctAnswerValue]?.name || correctAnswerValue; break;
        case 'group': questionTextContent = `Which group is ${currentChallengeElementData.name} (${currentChallengeElementData.symbol}) in?`; correctAnswerValue = currentChallengeElementData.group; currentQuestionDetails.correctAnswerDisplay = `Group ${correctAnswerValue}`; break;
        case 'period': questionTextContent = `Which period is ${currentChallengeElementData.name} (${currentChallengeElementData.symbol}) in?`; correctAnswerValue = currentChallengeElementData.period; currentQuestionDetails.correctAnswerDisplay = `Period ${correctAnswerValue}`; break;
        case 'valenceElectrons': questionTextContent = `How many valence electrons does a neutral atom of ${currentChallengeElementData.name} (${currentChallengeElementData.symbol}) typically have?`; correctAnswerValue = currentChallengeElementData.valenceElectrons; currentQuestionDetails.correctAnswerDisplay = `${correctAnswerValue} valence electron(s)`; break;
        case 'standardState': questionTextContent = `What is the standard physical state of ${currentChallengeElementData.name} (${currentChallengeElementData.symbol})?`; correctAnswerValue = currentChallengeElementData.standardState; currentQuestionDetails.correctAnswerDisplay = correctAnswerValue; break;
    }
    currentQuestionDetails.correctAnswerValue = correctAnswerValue.toString();
    currentQuestionDetails.options = generateMCQOptions(correctAnswerValue, randomQuestionType, currentChallengeElementData);
    if (propertyQuestionText) propertyQuestionText.textContent = questionTextContent;
    if (gameInstructionsP) gameInstructionsP.textContent = `Select the correct property for ${currentChallengeElementData.name}.`;
    if (mcqOptionsContainer) mcqOptionsContainer.innerHTML = ''; selectedMCQAnswer = null;
    currentQuestionDetails.options.forEach(option => {
        const btn = document.createElement('button'); btn.classList.add('mcq-option-btn'); btn.textContent = option.text; btn.dataset.value = option.value;
        btn.addEventListener('click', () => {
            if (questionAnswered || btn.disabled) return;
            const currentlySelected = mcqOptionsContainer.querySelector('.selected-answer');
            if (currentlySelected) currentlySelected.classList.remove('selected-answer');
            btn.classList.add('selected-answer'); selectedMCQAnswer = btn.dataset.value;
        });
        if (mcqOptionsContainer) mcqOptionsContainer.appendChild(btn);
    });
}

function generateCluesForElement(element) {
    if (!element) return []; let clues = [];
    if (element.period) clues.push({ type: 'period', value: element.period, text: `I am in Period ${element.period}.` });
    if (element.group !== null) { let groupText = `I am in Group ${element.group}`; if (element.category === "alkali-metal") groupText += " (Alkali Metals)."; else if (element.category === "alkaline-earth-metal") groupText += " (Alkaline Earth Metals)."; else if (element.category === "halogen") groupText += " (Halogens)."; else if (element.category === "noble-gas") groupText += " (Noble Gases)."; else groupText += "."; clues.push({ type: 'group', value: element.group, text: groupText }); }
    if (element.category && elementCategories[element.category]) clues.push({ type: 'category', value: element.category, text: `My category is ${elementCategories[element.category].name}.` });
    if (element.standardState) clues.push({ type: 'standardState', value: element.standardState, text: `I am a ${element.standardState.toLowerCase()} at standard conditions.` });
    if (typeof element.valenceElectrons !== 'undefined' && (element.group === 1 || element.group === 2 || (element.group >= 13 && element.group <= 18))) clues.push({ type: 'valenceElectrons', value: element.valenceElectrons, text: `I have ${element.valenceElectrons} valence electron(s).` });
    const range = Math.max(2, Math.floor(element.atomicNumber * 0.15)); const lowerBound = Math.max(1, element.atomicNumber - range); const upperBound = element.atomicNumber + range;
    clues.push({ type: 'atomicNumberRange', value: { min: lowerBound, max: upperBound }, text: `My atomic number is between ${lowerBound} and ${upperBound} (inclusive).` });
    if (clues.length < MAX_CLUES_SLEUTH -1 && Math.random() > 0.4) clues.push({ type: 'protons', value: element.atomicNumber, text: `I have ${element.atomicNumber} protons.` });
    if (clues.length < MAX_CLUES_SLEUTH && Math.random() > 0.5) clues.push({type: 'massApprox', value: Math.round(element.massNumber), text: `My mass number is approximately ${Math.round(element.massNumber)}.`});
    return clues.sort(() => 0.5 - Math.random()).slice(0, MAX_CLUES_SLEUTH);
}

function revealNextClueSleuth() {
    if (!clueListUl || !clueCountCurrentSpan || !revealNextClueBtn || !elementSleuthInstructionsP) return;
    if (currentClueIndexSleuth < potentialCluesSleuth.length && revealedCluesSleuth.length < MAX_CLUES_SLEUTH) {
        const nextClueObject = potentialCluesSleuth[currentClueIndexSleuth]; revealedCluesSleuth.push(nextClueObject);
        const clueListItem = document.createElement('li'); clueListItem.textContent = nextClueObject.text;
        clueListItem.style.animationDelay = `${revealedCluesSleuth.length * 0.1}s`;
        clueListUl.appendChild(clueListItem); currentClueIndexSleuth++;
        clueCountCurrentSpan.textContent = revealedCluesSleuth.length;
        updateZoneHighlighting(); // This will call filterPeriodicTableForSleuth if in sleuth mode
    }
    const maxPossibleClues = Math.min(MAX_CLUES_SLEUTH, potentialCluesSleuth.length);
    if (revealedCluesSleuth.length >= maxPossibleClues) {
        revealNextClueBtn.disabled = true; revealNextClueBtn.style.display = 'none';
        elementSleuthInstructionsP.textContent = "All clues revealed for this round! Make your guess from the table.";
    } else {
        revealNextClueBtn.disabled = false; revealNextClueBtn.style.display = 'inline-block';
    }
}

function setupElementSleuthChallenge() {
    if (!currentChallengeTitle || !elementSleuthUI || !elementSleuthInstructionsP || !clueListUl || !revealNextClueBtn || !periodicTableContainer || !elementInfoContainer || !sleuthClueFilterToggle) return;
    currentChallengeTitle.textContent = "Element Sleuth Challenge";
    if (particlePinpointUI) particlePinpointUI.style.display = 'none'; if (propertyProfilerUI) propertyProfilerUI.style.display = 'none'; elementSleuthUI.style.display = 'block';
    if (d3AtomModelContainer) d3AtomModelContainer.style.display = 'none';
    if (atomDiagramPlaceholder) { atomDiagramPlaceholder.style.display = 'block'; atomDiagramPlaceholder.textContent = "Use the Periodic Table to find the mystery element!"; }
    if (atomDiagramTitle) atomDiagramTitle.textContent = "Periodic Table - Guessing Board";
    if (hintExplanationArea) hintExplanationArea.style.display = 'none';
    displayElementInfo(null, false); if (elementInfoTitle) elementInfoTitle.textContent = "Mystery Element Profile";
    if (elementDetailsContainer) elementDetailsContainer.innerHTML = "<p>Clues will guide you. Click an element on the table to guess.</p>";
    elementInfoContainer.classList.add('game-mode-hidden');
    targetElementSleuth = selectRandomElementForChallenge();
    if (!targetElementSleuth) { elementSleuthInstructionsP.textContent = "Error: Could not select a target element."; if (startChallengeBtn) { startChallengeBtn.disabled = false; startChallengeBtn.textContent = "Try New Game"; } return; }
    // console.log("Element Sleuth Target:", targetElementSleuth.name);
    potentialCluesSleuth = generateCluesForElement(targetElementSleuth);
    if (potentialCluesSleuth.length === 0) { elementSleuthInstructionsP.textContent = "Error: Not enough info for clues for this element."; if (startChallengeBtn) { startChallengeBtn.disabled = false; startChallengeBtn.textContent = "Try New Sleuth Round"; } return; }
    revealedCluesSleuth = []; currentClueIndexSleuth = 0; clueListUl.innerHTML = '';
    sleuthGuessesRemaining = MAX_GUESSES_SLEUTH_ROUND; questionAnswered = false;
    isSleuthClueFilteringActive = false; if(sleuthClueFilterToggle) { sleuthClueFilterToggle.checked = false; sleuthClueFilterToggle.disabled = false; }
    
    periodicTableContainer.querySelectorAll('.element-square.eliminated-by-guess').forEach(sq => sq.classList.remove('eliminated-by-guess'));

    updateGameStatusDisplay(); // Update counts before first clue reveal potentially changes them
    revealNextClueSleuth(); // This will reveal the first clue and trigger table filtering via updateZoneHighlighting

    periodicTableContainer.classList.add('element-sleuth-active'); periodicTableContainer.classList.remove('periodic-table-disabled');
    elementSleuthInstructionsP.textContent = "A new mystery element! Review the first clue and make your guess, or reveal more clues.";
    if (gameInstructionsP) gameInstructionsP.textContent = "";
}

function checkElementSleuthGuess(guessedElementData) {
    if (!gameActive || questionAnswered || !targetElementSleuth || !feedbackMessageDiv || !startChallengeBtn) return;
    sleuthGuessesRemaining--; let message = ""; let messageClass = "";
    if (guessedElementData.atomicNumber === targetElementSleuth.atomicNumber) {
        const pointsEarned = POINTS_PER_CORRECT_ANSWER + (MAX_CLUES_SLEUTH - revealedCluesSleuth.length) * 2; score += pointsEarned; correctAnswersThisSession++;
        message = `Amazing! You found ${targetElementSleuth.name}! You earned ${pointsEarned} points.`; messageClass = 'feedback-success'; questionAnswered = true;
    } else {
        const guessedSquare = periodicTableContainer.querySelector(`.element-square[data-atomic-number="${guessedElementData.atomicNumber}"]`);
        if (guessedSquare) { guessedSquare.classList.add('eliminated-element', 'eliminated-by-guess'); guessedSquare.style.cursor = 'not-allowed'; }
        if (sleuthGuessesRemaining <= 0) { message = `Out of guesses! The mystery element was ${targetElementSleuth.name}.`; messageClass = 'feedback-error'; questionAnswered = true; }
        else { message = `Not ${guessedElementData.name}. That's not it. ${sleuthGuessesRemaining} guesses left.`; messageClass = 'feedback-warning'; if (revealNextClueBtn && revealedCluesSleuth.length < Math.min(MAX_CLUES_SLEUTH, potentialCluesSleuth.length)) revealNextClueBtn.disabled = false; }
    }
    feedbackMessageDiv.textContent = message; feedbackMessageDiv.className = `feedback-message ${messageClass}`; feedbackMessageDiv.style.display = 'block';
    updateGameStatusDisplay();

    if (questionAnswered) {
        displayElementInfo(targetElementSleuth, true); elementInfoContainer.classList.remove('game-mode-hidden');
        if (revealNextClueBtn) { revealNextClueBtn.style.display = 'none'; revealNextClueBtn.disabled = true; }
        if (sleuthClueFilterToggle) sleuthClueFilterToggle.disabled = true;
        startChallengeBtn.disabled = false; 
        // Table remains 'element-sleuth-active' for styling the answer, but guessing interaction stops.
        // Cursors are handled by filterPeriodicTableForSleuth based on gameActive/questionAnswered.

        filterPeriodicTableForSleuth(true); // Force all clues to be applied for review

        if (questionsPlayedThisSession >= MAX_QUESTIONS_PER_SESSION) { setTimeout(showSessionSummary, 2000); }
        else { startChallengeBtn.textContent = "Next Sleuth Round"; if(elementSleuthInstructionsP) elementSleuthInstructionsP.textContent = "Click 'Next Sleuth Round' for a new mystery!"; }
    } else {
        // If guess was wrong but game continues, just update the table based on current toggle.
        filterPeriodicTableForSleuth();
    }
}

function showHint() {
    if (!hintExplanationArea || !hintExplanationText || !learningContent || !currentQuestionDetails) return;
    const propertyType = currentQuestionDetails.type;
    if (learningContent.properties && learningContent.properties[propertyType]) {
        const content = learningContent.properties[propertyType];
        hintExplanationText.innerHTML = `<strong>${content.displayName || propertyType} - Definition:</strong> ${content.definition}<br><br><strong>Hint:</strong> ${content.hint}`;
    } else { hintExplanationText.textContent = learningContent.general?.tryAgainHint || "No specific hint available."; }
    hintExplanationArea.style.display = 'block';
}

function checkSelectedAnswer() {
    if (!gameActive || questionAnswered || !currentChallengeElementData || !feedbackMessageDiv || !startChallengeBtn) return;
    attemptsForCurrentQuestion++; let isCorrect = false;
    if (currentGameMode === 'particle-pinpoint') {
        const studentProtons = parseInt(protonInput.value,10), studentNeutrons = parseInt(neutronInput.value,10), studentElectrons = parseInt(electronInput.value,10); const correctParticles = calculateSubatomicParticles(currentChallengeElementData);
        [protonInput,neutronInput,electronInput].forEach(input=>input.classList.remove('input-error','input-correct'));
        if(isNaN(studentProtons)||isNaN(studentNeutrons)||isNaN(studentElectrons)){ feedbackMessageDiv.textContent="Please enter valid numbers for all fields."; feedbackMessageDiv.className='feedback-message feedback-error'; if(isNaN(studentProtons)&&protonInput)protonInput.classList.add('input-error'); if(isNaN(studentNeutrons)&&neutronInput)neutronInput.classList.add('input-error'); if(isNaN(studentElectrons)&&electronInput)electronInput.classList.add('input-error'); }
        else{ let pCorrect=studentProtons===correctParticles.protons,nCorrect=studentNeutrons===correctParticles.neutrons,eCorrect=studentElectrons===correctParticles.electrons; if(pCorrect&&protonInput)protonInput.classList.add('input-correct');else if(protonInput)protonInput.classList.add('input-error'); if(nCorrect&&neutronInput)neutronInput.classList.add('input-correct');else if(neutronInput)neutronInput.classList.add('input-error'); if(eCorrect&&electronInput)electronInput.classList.add('input-correct');else if(electronInput)electronInput.classList.add('input-error'); isCorrect=pCorrect&&nCorrect&&eCorrect; }
    } else if (currentGameMode === 'property-profiler') {
        if(!selectedMCQAnswer){ feedbackMessageDiv.textContent="Please select an answer."; feedbackMessageDiv.className='feedback-message feedback-error'; attemptsForCurrentQuestion--; }
        else{ isCorrect = selectedMCQAnswer === currentQuestionDetails.correctAnswerValue; }
    }
    if(isCorrect){ score+=POINTS_PER_CORRECT_ANSWER; correctAnswersThisSession++; feedbackMessageDiv.textContent=`Excellent! That's correct for ${currentChallengeElementData.name}! You earned ${POINTS_PER_CORRECT_ANSWER} points.`; feedbackMessageDiv.className='feedback-message feedback-success'; questionAnswered=true; if(hintExplanationArea)hintExplanationArea.style.display='none'; }
    else{
        if(attemptsForCurrentQuestion >= MAX_ATTEMPTS_PER_QUESTION){ questionAnswered=true; if(hintExplanationArea)hintExplanationArea.style.display='none'; let revealText=`Maximum attempts reached. `; if(currentGameMode==='particle-pinpoint'){const cp=calculateSubatomicParticles(currentChallengeElementData);revealText+=`The correct counts for ${currentChallengeElementData.name} were P: ${cp.protons}, N: ${cp.neutrons}, E: ${cp.electrons}.`;}else if(currentGameMode==='property-profiler'){revealText+=`The correct ${currentQuestionDetails.type} for ${currentChallengeElementData.name} is ${currentQuestionDetails.correctAnswerDisplay}.`;} feedbackMessageDiv.textContent=revealText; feedbackMessageDiv.className='feedback-message feedback-error'; }
        else{ feedbackMessageDiv.textContent=`Not quite right. (${MAX_ATTEMPTS_PER_QUESTION-attemptsForCurrentQuestion} attempts left).`; feedbackMessageDiv.className='feedback-message feedback-warning'; if(currentGameMode==='property-profiler'){ if(attemptsForCurrentQuestion===1&&learningContent){showHint();feedbackMessageDiv.textContent+=" Review the hint and try again!";} mcqOptionsContainer.querySelectorAll('.mcq-option-btn').forEach(btn=>btn.classList.remove('selected-answer')); selectedMCQAnswer=null;}}
    }
    updateGameStatusDisplay(); if(feedbackMessageDiv)feedbackMessageDiv.style.display='block';
    if(questionAnswered){
        displayElementInfo(currentChallengeElementData,true); elementInfoContainer.classList.remove('game-mode-hidden');
        if(checkAnswerBtn)checkAnswerBtn.disabled=true; if(startChallengeBtn)startChallengeBtn.disabled=false;
        if(currentGameMode==='particle-pinpoint'){[protonInput,neutronInput,electronInput].forEach(input=>{if(input)input.disabled=true;});}
        else if(currentGameMode==='property-profiler'&&mcqOptionsContainer){mcqOptionsContainer.querySelectorAll('.mcq-option-btn').forEach(btn=>{btn.disabled=true; if(btn.dataset.value===currentQuestionDetails.correctAnswerValue){btn.classList.remove('incorrect-answer','selected-answer');btn.classList.add('correct-answer');}else if(btn.classList.contains('selected-answer')&&!isCorrect){btn.classList.add('incorrect-answer');}});}
        if(questionsPlayedThisSession>=MAX_QUESTIONS_PER_SESSION){setTimeout(showSessionSummary,2000);}
        else{ if(startChallengeBtn) startChallengeBtn.textContent = (currentGameMode === 'element-sleuth') ? "Next Sleuth Round" : "Next Question"; if(gameInstructionsP && currentGameMode !== 'element-sleuth') gameInstructionsP.textContent="Click 'Next...' for a new challenge!"; }
    }
}

function filterPeriodicTableForSleuth(forceShowAllRevealedCluesFilter = false) {
    if (!periodicTableContainer || currentGameMode !== 'element-sleuth') {
        // This function should only be actively filtering if in sleuth mode.
        // If called otherwise, it might be a leftover from a state change,
        // updateZoneHighlighting will handle general cases.
        return;
    }

    const allElementSquares = periodicTableContainer.querySelectorAll('.element-square');
    // Determine if clue filtering logic should be applied based on game state and toggle
    const applyClueFilteringLogic = (gameActive && !questionAnswered && isSleuthClueFilteringActive) || // During active game, respect toggle
                                (questionAnswered && forceShowAllRevealedCluesFilter); // At end of round (review), force filter

    allElementSquares.forEach(square => {
        square.classList.remove('eliminated-element', 'highlight-zone-element', 'dim-non-zone-element', 'selected-element');
        // Base cursor state for sleuth mode
        square.style.cursor = (gameActive && !questionAnswered) ? 'help' : 'pointer';


        const atomicNumberStr = square.dataset.atomicNumber;
        if (!atomicNumberStr) return;
        const atomicNumber = parseInt(atomicNumberStr);
        const element = elementsData.find(el => el.atomicNumber === atomicNumber);
        if (!element) return;

        let isEliminatedByActiveClues = false;
        if (applyClueFilteringLogic && revealedCluesSleuth.length > 0) {
            let matchesAllClues = true;
            for (const clue of revealedCluesSleuth) {
                if (clue.type === 'period' && element.period !== clue.value) matchesAllClues = false;
                else if (clue.type === 'group' && element.group !== clue.value) matchesAllClues = false;
                else if (clue.type === 'category' && element.category !== clue.value) matchesAllClues = false;
                else if (clue.type === 'standardState' && element.standardState !== clue.value) matchesAllClues = false;
                else if (clue.type === 'valenceElectrons' && element.valenceElectrons !== clue.value) matchesAllClues = false;
                else if (clue.type === 'atomicNumberRange' && (element.atomicNumber < clue.value.min || element.atomicNumber > clue.value.max)) matchesAllClues = false;
                else if (clue.type === 'protons' && element.atomicNumber !== clue.value) matchesAllClues = false;
                else if (clue.type === 'massApprox' && Math.round(element.massNumber) !== clue.value) matchesAllClues = false;
                if (!matchesAllClues) break;
            }
            if (!matchesAllClues) {
                isEliminatedByActiveClues = true;
            }
        }
        
        if (square.classList.contains('eliminated-by-guess')) {
            square.classList.add('eliminated-element');
            square.style.cursor = 'not-allowed';
        } else if (isEliminatedByActiveClues) {
            square.classList.add('eliminated-element');
            square.style.cursor = 'not-allowed';
        } else {
            // Not eliminated by guess or active clues. Apply zone highlighting.
            if (isZoneHighlightingActive) {
                if (isElementInCurrentZone(element)) {
                    square.classList.add('highlight-zone-element');
                } else {
                    square.classList.add('dim-non-zone-element');
                }
            }
            // Ensure cursor is 'help' if game is active, not answered, and element is a valid target
            if (gameActive && !questionAnswered) {
                 square.style.cursor = 'help';
            }
        }
    });

    if (targetElementSleuth && questionAnswered) {
        const correctSquare = periodicTableContainer.querySelector(`.element-square[data-atomic-number="${targetElementSleuth.atomicNumber}"]`);
        if (correctSquare) {
            correctSquare.classList.remove('eliminated-element', 'dim-non-zone-element');
            correctSquare.classList.add('selected-element');
            correctSquare.style.cursor = 'default'; 

            if (isZoneHighlightingActive && isElementInCurrentZone(targetElementSleuth)) {
                 correctSquare.classList.add('highlight-zone-element'); // Can co-exist with selected-element
            }
        }
    }
}

function showSessionSummary() {
    gameActive = false; showView('session-summary-view');
    if (summaryScoreSpan) summaryScoreSpan.textContent = score;
    if (summaryCorrectSpan) summaryCorrectSpan.textContent = correctAnswersThisSession;
    if (summaryTotalPlayedSpan) summaryTotalPlayedSpan.textContent = questionsPlayedThisSession;
    const accuracy = questionsPlayedThisSession > 0 ? ((correctAnswersThisSession / questionsPlayedThisSession) * 100).toFixed(1) : 0;
    if (summaryAccuracySpan) summaryAccuracySpan.textContent = `${accuracy}%`;
    if (sessionSummaryTitle && currentGameMode && gameZones[currentZoneKey]) { sessionSummaryTitle.textContent = `${gameZones[currentZoneKey].name} - ${currentGameMode.replace('-',' ')} Challenge Complete!`.replace(/\b\w/g,l=>l.toUpperCase()); }
    else if (sessionSummaryTitle) { sessionSummaryTitle.textContent = `Challenge Complete!`; }
    if (periodicTableContainer) { periodicTableContainer.classList.remove('periodic-table-disabled', 'element-sleuth-active'); document.querySelectorAll('.element-square').forEach(sq => sq.classList.remove('eliminated-element', 'selected-element', 'eliminated-by-guess')); }
    updateZoneHighlighting(); // Reset table to general zone view
}

function loadNextChallengeQuestion() {
    questionAnswered = false; selectedMCQAnswer = null;
    if (checkAnswerBtn) checkAnswerBtn.disabled = false;
    if (startChallengeBtn) startChallengeBtn.disabled = true;
    if (hintExplanationArea) hintExplanationArea.style.display = 'none';
    if (feedbackMessageDiv) { feedbackMessageDiv.textContent = ''; feedbackMessageDiv.className = 'feedback-message'; feedbackMessageDiv.style.display = 'none'; }
    currentChallengeElementData = selectRandomElementForChallenge();
    if (!currentChallengeElementData) { if (gameInstructionsP) gameInstructionsP.textContent = "Error: Could not load element."; if (checkAnswerBtn) checkAnswerBtn.disabled = true; if (startChallengeBtn) startChallengeBtn.disabled = true; gameActive = false; return; }
    attemptsForCurrentQuestion = 0; 
    
    if(elementInfoContainer) elementInfoContainer.style.display = 'block';
    if(atomDiagramContainer) atomDiagramContainer.style.display = 'block';
    
    if (currentGameMode === 'particle-pinpoint') setupParticlePinpointChallenge();
    else if (currentGameMode === 'property-profiler') setupPropertyProfilerChallenge();
    else if (currentGameMode === 'element-sleuth') setupElementSleuthChallenge(); // This also calls updateGameStatusDisplay via revealNextClue
    else updateGameStatusDisplay(); // For non-sleuth modes primarily.

    if (gameActionContainer) gameActionContainer.style.display = 'block';
    if (checkAnswerBtn) checkAnswerBtn.style.display = (currentGameMode === 'element-sleuth') ? 'none' : 'block';
    if (gameInstructionsP && currentGameMode !== 'element-sleuth') gameInstructionsP.textContent = `Challenge for ${currentChallengeElementData.name}. Good luck!`;
    else if (gameInstructionsP && currentGameMode === 'element-sleuth') gameInstructionsP.textContent = ""; // Sleuth has its own instruction panel
}

function handleGameModeSelection(mode) {
    currentGameMode = mode;
    document.querySelectorAll('.game-mode-select-btn').forEach(btn => btn.classList.remove('active-mode'));
    const activeBtn = document.getElementById(`select-${mode}-btn`); if (activeBtn) activeBtn.classList.add('active-mode');
    if (currentChallengeTitle) currentChallengeTitle.textContent = mode.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase()) + " Challenge";
    if (gameInstructionsP && gameZones[currentZoneKey]) gameInstructionsP.textContent = `Click "Start Challenge" to begin the ${mode.replace('-',' ')} in the '${gameZones[currentZoneKey].name}' zone.`;
    if (proceedToChallengeBtn && gameZones[currentZoneKey]) proceedToChallengeBtn.disabled = false;
    if (setupInstructionsP && gameZones[currentZoneKey]) setupInstructionsP.textContent = `Selected Zone: '${gameZones[currentZoneKey].name}', Mode: '${mode.replace('-',' ')}'. Ready?`;
    if (startChallengeBtn) { startChallengeBtn.textContent = "Start Challenge"; startChallengeBtn.classList.remove("next-element-btn"); }
    if (particlePinpointUI) particlePinpointUI.style.display = 'none'; if (propertyProfilerUI) propertyProfilerUI.style.display = 'none'; if (elementSleuthUI) elementSleuthUI.style.display = 'none';
    if (gameActionContainer) gameActionContainer.style.display = 'none'; if (hintExplanationArea) hintExplanationArea.style.display = 'none';
    if (elementInfoTitle) elementInfoTitle.textContent = "Element Information"; if (elementDetailsContainer) elementDetailsContainer.innerHTML = "<p>Element details will appear here when the challenge starts.</p>";
    if(elementInfoContainer) elementInfoContainer.classList.remove('game-mode-hidden');
    if (d3AtomModelContainer) d3AtomModelContainer.style.display = 'none';
    if (atomDiagramPlaceholder) { atomDiagramPlaceholder.style.display = 'block'; atomDiagramPlaceholder.textContent = "Atom model will appear here when the challenge starts."; }
    if(atomDiagramTitle) atomDiagramTitle.textContent = "Atom Diagram";
    
    updateZoneHighlighting(); // This will clear sleuth-specific classes if mode changes
}

function isElementInCurrentZone(elementData) {
    if (typeof currentZoneKey === 'undefined' || !gameZones || typeof gameZones[currentZoneKey] === 'undefined') { console.error("isElementInCurrentZone: currentZoneKey or gameZones invalid:", currentZoneKey); return true; }
    const zone = gameZones[currentZoneKey]; if (zone.elementAtomicNumbers === null) return true;
    if (zone.elementAtomicNumbers && zone.elementAtomicNumbers.includes(elementData.atomicNumber)) return true;
    if (zone.categories && zone.categories.includes(elementData.category)) return true;
    if (zone.customFilter && typeof zone.customFilter === 'function' && zone.customFilter(elementData)) return true;
    return false;
}

function updateZoneHighlighting() {
    if (!periodicTableContainer) return;

    if (currentGameMode === 'element-sleuth' && gameActive) {
        filterPeriodicTableForSleuth(); // Let Sleuth's dedicated filter handle everything
        return;
    }

    // General zone highlighting for non-sleuth modes or when sleuth is not active
    const allElementSquares = periodicTableContainer.querySelectorAll('.element-square');
    allElementSquares.forEach(square => {
        // Clear all potentially relevant classes first
        square.classList.remove('highlight-zone-element', 'dim-non-zone-element', 
                                'eliminated-element', 'selected-element', 'eliminated-by-guess');
        square.style.cursor = 'pointer'; // Default cursor

        const atomicNumberStr = square.dataset.atomicNumber;
        if (!atomicNumberStr) return;
        const atomicNumber = parseInt(atomicNumberStr);
        const elementData = elementsData.find(el => el.atomicNumber === atomicNumber);

        if (elementData) {
            if (isZoneHighlightingActive) {
                if (isElementInCurrentZone(elementData)) {
                    square.classList.add('highlight-zone-element');
                } else {
                    square.classList.add('dim-non-zone-element');
                }
            }
        }
    });
}

function populateZoneSelection() {
    if (!zoneButtonsContainer) return; zoneButtonsContainer.innerHTML = '';
    Object.keys(gameZones).forEach(zoneKey => {
        const zone = gameZones[zoneKey]; const button = document.createElement('button'); button.classList.add('zone-select-btn'); button.textContent = zone.name; button.dataset.zoneKey = zoneKey;
        if (zoneKey === currentZoneKey) button.classList.add('active-zone');
        button.addEventListener('click', () => handleZoneSelection(zoneKey)); zoneButtonsContainer.appendChild(button);
    });
    updateGameStatusDisplay(); 
    updateZoneHighlighting();
}

function handleZoneSelection(selectedZoneKey) {
    if (gameActive) {
        const feedbackTarget = (activeGameView.style.display === 'flex' && feedbackMessageDiv) ? feedbackMessageDiv : null;
        if (feedbackTarget) { feedbackTarget.textContent = "Cannot change zone during an active challenge."; feedbackTarget.className = 'feedback-message feedback-warning'; feedbackTarget.style.display = 'block'; setTimeout(() => { if(feedbackTarget) feedbackTarget.style.display = 'none'; }, 3000); }
        console.warn("Zone change denied during active game."); return;
    }
    currentZoneKey = selectedZoneKey;
    document.querySelectorAll('.zone-select-btn').forEach(btn => { btn.classList.remove('active-zone'); if (btn.dataset.zoneKey === selectedZoneKey) btn.classList.add('active-zone'); });
    updateGameStatusDisplay(); 
    updateZoneHighlighting();
    if (setupInstructionsP && gameSetupView.style.display === 'block' && gameZones[currentZoneKey]) {
        if (currentGameMode) setupInstructionsP.textContent = `Selected Zone: '${gameZones[currentZoneKey].name}', Mode: '${currentGameMode.replace('-',' ')}'. Ready?`;
        else setupInstructionsP.textContent = `Selected Zone: '${gameZones[currentZoneKey].name}'. Now select a mode.`;
    }
}

function returnToGameSetup() {
    gameActive = false; score = 0; questionsPlayedThisSession = 0; correctAnswersThisSession = 0;
    attemptsForCurrentQuestion = 0; sleuthGuessesRemaining = MAX_GUESSES_SLEUTH_ROUND;
    if (particlePinpointUI) particlePinpointUI.style.display = 'none'; if (propertyProfilerUI) propertyProfilerUI.style.display = 'none';
    if (elementSleuthUI) elementSleuthUI.style.display = 'none'; if (gameActionContainer) gameActionContainer.style.display = 'none';
    if (hintExplanationArea) hintExplanationArea.style.display = 'none'; if (feedbackMessageDiv) feedbackMessageDiv.style.display = 'none';
    if (sleuthClueFilterToggle) { sleuthClueFilterToggle.disabled = false; sleuthClueFilterToggle.checked = true; } isSleuthClueFilteringActive = true;
    if (elementInfoTitle) elementInfoTitle.textContent = "Element Information"; if (elementDetailsContainer) elementDetailsContainer.innerHTML = "<p>Element details will appear here.</p>";
    if(elementInfoContainer) elementInfoContainer.classList.remove('game-mode-hidden');
    if (d3AtomModelContainer) d3AtomModelContainer.style.display = 'none';
    if (atomDiagramPlaceholder) { atomDiagramPlaceholder.style.display = 'block'; atomDiagramPlaceholder.textContent = "Select your zone and challenge mode to begin!"; }
    if (atomDiagramTitle) atomDiagramTitle.textContent = "Atom Diagram";
    
    // Crucially, set currentGameMode to null *before* calling updateZoneHighlighting
    // so it doesn't try to run Sleuth logic.
    const prevGameMode = currentGameMode;
    currentGameMode = null; 
    if (periodicTableContainer) { 
        periodicTableContainer.classList.remove('periodic-table-disabled', 'element-sleuth-active'); 
        // updateZoneHighlighting will clear other classes like eliminated-element
    }
    updateZoneHighlighting(); // This will now apply general highlighting
    
    document.querySelectorAll('.game-mode-select-btn.active-mode').forEach(btn => btn.classList.remove('active-mode'));
    // currentGameMode is already null
    if (setupInstructionsP && gameZones[currentZoneKey]) setupInstructionsP.textContent = `Selected Zone: '${gameZones[currentZoneKey].name}'. Now select a mode.`;
    else if (setupInstructionsP) setupInstructionsP.textContent = "Select a zone and mode to proceed.";
    if (proceedToChallengeBtn) proceedToChallengeBtn.disabled = true;
    showView('game-setup-view'); 
    updateGameStatusDisplay(); // updateGameStatusDisplay uses currentGameMode, so call after it's set/reset.
}

function resetUIElementsState() {
    if(proceedToChallengeBtn) proceedToChallengeBtn.disabled = true;
    if(setupInstructionsP) setupInstructionsP.textContent = "Select a zone and mode to proceed.";
    document.querySelectorAll('.game-mode-select-btn.active-mode').forEach(btn => btn.classList.remove('active-mode'));
    if(gameControlsContainer) gameControlsContainer.style.display = 'none';
    if(currentChallengeTitle) currentChallengeTitle.textContent = "Challenge Title";
    if(gameInstructionsP) gameInstructionsP.textContent = "Instructions will appear here.";
    if(startChallengeBtn) { startChallengeBtn.textContent = "Start Challenge"; startChallengeBtn.disabled = true; startChallengeBtn.classList.remove("next-element-btn"); }
    if(particlePinpointUI) particlePinpointUI.style.display = 'none'; if(propertyProfilerUI) propertyProfilerUI.style.display = 'none'; if(elementSleuthUI) elementSleuthUI.style.display = 'none';
    if(gameActionContainer) gameActionContainer.style.display = 'none'; if(hintExplanationArea) hintExplanationArea.style.display = 'none'; if(feedbackMessageDiv) feedbackMessageDiv.style.display = 'none';
    if(elementInfoTitle) elementInfoTitle.textContent = "Element Information"; if(elementDetailsContainer) elementDetailsContainer.innerHTML = "<p>Details will appear here.</p>";
    if(elementInfoContainer) elementInfoContainer.classList.remove('game-mode-hidden');
    if(d3AtomModelContainer) d3AtomModelContainer.style.display = 'none';
    if(atomDiagramPlaceholder) { atomDiagramPlaceholder.style.display = 'block'; atomDiagramPlaceholder.textContent = "Select zone & mode to begin!"; }
    if(atomDiagramTitle) atomDiagramTitle.textContent = "Atom Diagram";
    
    currentGameMode = null; gameActive = false; score = 0; questionsPlayedThisSession = 0; correctAnswersThisSession = 0;
    isSleuthClueFilteringActive = true; if(sleuthClueFilterToggle) { sleuthClueFilterToggle.checked = true; sleuthClueFilterToggle.disabled = false; } // Default to enabled for next Sleuth game
    if(zoneHighlightToggle) zoneHighlightToggle.checked = isZoneHighlightingActive;
    
    if(periodicTableContainer) { 
      periodicTableContainer.classList.remove('periodic-table-disabled', 'element-sleuth-active');
      // updateZoneHighlighting will be called by initializeAppView to clear specific element classes
    }
}

function initializeAppView() {
    currentZoneKey = "all"; 
    resetUIElementsState(); 
    populateZoneSelection(); 
    showView('game-setup-view'); if (gameSelectionContainer) gameSelectionContainer.style.display = 'block';
    updateGameStatusDisplay(); 
    updateZoneHighlighting(); 
}

function displayPeriodicTableElements() {
    if (!periodicTableContainer) return; periodicTableContainer.innerHTML = "";
    elementsData.forEach(elementDataFromLoop => {
        const elementSquare = document.createElement("div"); elementSquare.classList.add("element-square", elementDataFromLoop.category || "unknown");
        elementSquare.style.gridColumnStart = elementDataFromLoop.group; elementSquare.style.gridRowStart = elementDataFromLoop.period; elementSquare.dataset.atomicNumber = elementDataFromLoop.atomicNumber;
        const atomicNumberDisplay = document.createElement("div"); atomicNumberDisplay.classList.add("atomic-number"); atomicNumberDisplay.textContent = elementDataFromLoop.atomicNumber;
        const symbolDisplay = document.createElement("div"); symbolDisplay.classList.add("symbol"); symbolDisplay.textContent = elementDataFromLoop.symbol;
        elementSquare.appendChild(atomicNumberDisplay); elementSquare.appendChild(symbolDisplay);
        elementSquare.addEventListener('click', () => {
            const previouslySelected = periodicTableContainer.querySelector('.selected-element'); 
            if (previouslySelected && previouslySelected !== elementSquare) { // Deselect if different square
                previouslySelected.classList.remove('selected-element');
            }

            if (gameActive && currentGameMode === 'element-sleuth' && !questionAnswered) {
                const guessedAtomicNumber = parseInt(elementSquare.dataset.atomicNumber); const guessedElement = elementsData.find(el => el.atomicNumber === guessedAtomicNumber);
                if (guessedElement && !elementSquare.classList.contains('eliminated-element')) {
                    checkElementSleuthGuess(guessedElement);
                }
            } else if (gameActive && !questionAnswered && currentGameMode !== 'element-sleuth') { 
                // In other active game modes, clicking the table is disabled (by periodic-table-disabled class)
                // but if it were enabled, this would prevent interaction.
                return; 
            }
            else { 
                // Not in active sleuth guessing, or game not active, or question answered.
                // Allow selection for info display.
                displayElementInfo(elementDataFromLoop, true); 
                showAtomModelForChallenge(elementDataFromLoop); 
                // Toggle selection for non-game or post-answer states
                if (elementSquare.classList.contains('selected-element')) {
                    elementSquare.classList.remove('selected-element');
                    displayElementInfo(null); // Clear info if deselecting
                    showAtomModelForChallenge(null); // Clear model if deselecting
                } else {
                    elementSquare.classList.add('selected-element');
                }
            }
        });
        periodicTableContainer.appendChild(elementSquare);
    });
    updateZoneHighlighting();
}

function displayLegend() {
    if (!legendContentDiv) return; legendContentDiv.innerHTML = "";
    for (const categoryKey in elementCategories) {
        if (categoryKey === "unknown" && !elementsData.some(el => !el.category || el.category === "unknown")) continue;
        const category = elementCategories[categoryKey]; const legendItem = document.createElement("div"); legendItem.classList.add("legend-item");
        const colorBox = document.createElement("div"); colorBox.classList.add("legend-color-box"); colorBox.style.backgroundColor = category.color;
        const text = document.createElement("span"); text.classList.add("legend-text"); text.textContent = category.name;
        legendItem.appendChild(colorBox); legendItem.appendChild(text); legendContentDiv.appendChild(legendItem);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // console.log("Element Quest Initializing!"); 
    await loadLearningContentData();
    if (typeof d3 !== 'undefined') { 
        // console.log("D3 v:", d3.version); 
        initializeD3Canvas(); 
    }
    else { console.error("D3 NOT LOADED!"); if(atomDiagramPlaceholder) atomDiagramPlaceholder.textContent = "Error: D3.js not loaded."; }
    displayLegend(); displayPeriodicTableElements(); initializeAppView();

    if (particlePinpointSelectBtn) particlePinpointSelectBtn.addEventListener('click', () => handleGameModeSelection('particle-pinpoint'));
    if (propertyProfilerSelectBtn) propertyProfilerSelectBtn.addEventListener('click', () => handleGameModeSelection('property-profiler'));
    if (elementSleuthSelectBtn) elementSleuthSelectBtn.addEventListener('click', () => handleGameModeSelection('element-sleuth'));

    if (proceedToChallengeBtn) {
        proceedToChallengeBtn.addEventListener('click', () => {
            if (!currentGameMode) { if (setupInstructionsP) setupInstructionsP.textContent = "Select mode first!"; return; }
            questionsPlayedThisSession=0; correctAnswersThisSession=0; score=0; gameActive=false; // gameActive will be true after Start Challenge
            updateGameStatusDisplay(); showView('active-game-view');
            if (gameControlsContainer) gameControlsContainer.style.display = 'block';
            if (startChallengeBtn) { startChallengeBtn.textContent = "Start Challenge"; startChallengeBtn.disabled = false; startChallengeBtn.classList.remove("next-element-btn"); }
            if (gameInstructionsP && currentGameMode && gameZones[currentZoneKey]) { gameInstructionsP.textContent = `Click "Start Challenge" for ${currentGameMode.replace('-',' ')} in '${gameZones[currentZoneKey].name}'.`; }
            
            if (periodicTableContainer) {
                 if (currentGameMode === 'element-sleuth') { 
                    periodicTableContainer.classList.add('element-sleuth-active'); 
                    periodicTableContainer.classList.remove('periodic-table-disabled'); 
                    if(sleuthClueFilterToggle) sleuthClueFilterToggle.disabled = false;
                } else { 
                    periodicTableContainer.classList.remove('element-sleuth-active'); 
                    periodicTableContainer.classList.add('periodic-table-disabled'); 
                    if(sleuthClueFilterToggle) sleuthClueFilterToggle.disabled = true;
                }
            }
            // Don't call updateZoneHighlighting here yet, let startChallengeBtn or loadNext do it
            // after gameActive is true and mode is fully set.
        });
    }

    if (startChallengeBtn) {
        startChallengeBtn.addEventListener('click', () => {
            if (!currentGameMode) { if (gameInstructionsP) gameInstructionsP.textContent = "Error: No mode selected."; return; }
            if (startChallengeBtn.textContent === "Start Challenge" || startChallengeBtn.textContent.startsWith("Next")) { 
                questionsPlayedThisSession++; 
            }
            gameActive = true; // Set game active *before* loading question which might rely on this
            
            if (gameControlsContainer) gameControlsContainer.style.display = 'block';
            if (elementInfoContainer) elementInfoContainer.style.display = 'block';
            if (atomDiagramContainer) atomDiagramContainer.style.display = 'block';
            
            // Ensure table classes are correctly set now that game is active
            if (periodicTableContainer) {
                 if (currentGameMode === 'element-sleuth') { 
                    periodicTableContainer.classList.add('element-sleuth-active'); 
                    periodicTableContainer.classList.remove('periodic-table-disabled'); 
                 } else { 
                    periodicTableContainer.classList.remove('element-sleuth-active'); 
                    periodicTableContainer.classList.add('periodic-table-disabled'); 
                 }
            }
            loadNextChallengeQuestion(); // This will also call updateGameStatusDisplay and table updates
        });
    }

    if (backToSettingsBtn) backToSettingsBtn.addEventListener('click', returnToGameSetup);
    
    if (sleuthClueFilterToggle) { 
        sleuthClueFilterToggle.addEventListener('change', () => { 
            isSleuthClueFilteringActive = sleuthClueFilterToggle.checked; 
            updateZoneHighlighting(); // This will correctly call filterPeriodicTableForSleuth if in sleuth mode
        });
    }
    if (checkAnswerBtn) checkAnswerBtn.addEventListener('click', checkSelectedAnswer);
    if (revealNextClueBtn) revealNextClueBtn.addEventListener('click', revealNextClueSleuth);
    
    if (zoneHighlightToggle) { 
        zoneHighlightToggle.addEventListener('change', () => { 
            isZoneHighlightingActive = zoneHighlightToggle.checked; 
            updateZoneHighlighting(); // This will also delegate to sleuth filter if needed
        }); 
    }
    if (summaryPlayAgainBtn) {
        summaryPlayAgainBtn.addEventListener('click', () => {
            questionsPlayedThisSession=0; correctAnswersThisSession=0; score=0; gameActive=false;
            updateGameStatusDisplay(); showView('active-game-view');
            if (gameControlsContainer) gameControlsContainer.style.display = 'block';
            if (startChallengeBtn) { startChallengeBtn.textContent = "Start Challenge"; startChallengeBtn.disabled = false; startChallengeBtn.classList.remove("next-element-btn"); }
            if (gameInstructionsP && currentGameMode && gameZones[currentZoneKey]) { gameInstructionsP.textContent = `Click "Start Challenge" for ${currentGameMode.replace('-',' ')} in '${gameZones[currentZoneKey].name}'.`; }
            
            if (periodicTableContainer) {
                 if (currentGameMode === 'element-sleuth') { 
                    periodicTableContainer.classList.add('element-sleuth-active'); 
                    periodicTableContainer.classList.remove('periodic-table-disabled'); 
                    if(sleuthClueFilterToggle) sleuthClueFilterToggle.disabled = false;
                } else { 
                    periodicTableContainer.classList.remove('element-sleuth-active'); 
                    periodicTableContainer.classList.add('periodic-table-disabled'); 
                    if(sleuthClueFilterToggle) sleuthClueFilterToggle.disabled = true;
                }
            }
            // gameActive becomes true when "Start Challenge" is clicked.
        });
    }
    if (summaryNewSettingsBtn) { summaryNewSettingsBtn.addEventListener('click', () => { initializeAppView(); }); }
});