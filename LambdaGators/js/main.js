console.log("Lambda Gators main.js Loaded!");

// --- Core Data Structures ---
// ... (This section is unchanged, keep as is) ...
let nextFamilyId = 0;
const PREDEFINED_COLORS = ['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'pink', 'teal', 'cyan', 'magenta'];
const PREDEFINED_VARIABLES = ['x', 'y', 'z', 'a', 'b', 'c', 'f', 'g', 'm', 'n', 'p', 'q', 's', 't', 'u', 'v', 'w'];
let colorIndex = 0;
let variableIndex = 0;

function getNewColor() {
    const color = PREDEFINED_COLORS[colorIndex % PREDEFINED_COLORS.length];
    colorIndex++; 
    return color;
}

function getNewVariableName() {
    const variableName = PREDEFINED_VARIABLES[variableIndex % PREDEFINED_VARIABLES.length];
    variableIndex++; 
    return variableName;
}

function resetColorAndVariableCounters() {
    colorIndex = 0; 
    variableIndex = 0;
}

class Egg {
    constructor(color, variableName) {
        this.type = 'egg'; 
        this.color = color; 
        this.variableName = variableName;
    }
    toString() { 
        return `Egg(${this.variableName}:${this.color})`; 
    }
}

class Alligator {
    constructor(color, variableName, isHungry = true, guards = null) {
        this.type = 'alligator'; 
        this.color = color; 
        this.variableName = variableName; 
        this.isHungry = isHungry; 
        this.guards = guards;            
    }
    toString() {
        const hungerStatus = this.isHungry ? 'H' : 'O'; 
        const guardsStr = this.guards ? this.guards.toString() : 'null';
        return `Alligator(${this.variableName}:${this.color}, ${hungerStatus}, guards: ${guardsStr})`;
    }
}

class Family {
    constructor(expression) {
        this.id = `family-${nextFamilyId++}`; 
        this.expression = expression; 
        this.currentContainerId = null; 
    }
    toString() {
        if (!this.expression) return `Family(id: ${this.id}, expr: null)`;
        return `Family(id: ${this.id}, expr: ${this.expression.toString()})`;
    }
}
// --- End of Core Data Structures ---


// --- Substitution Logic ---
// ... (This section is unchanged, keep as is) ...
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') return obj; 
    try { 
        return JSON.parse(JSON.stringify(obj)); 
    } catch (e) { 
        console.error("Deep copy failed:", obj, e); 
        return obj; 
    }
}

function substitute(expression, variableColorToReplace, replacementExpression) {
    if (!expression) return null;
    const currentExprCopy = deepCopy(expression); 

    if (currentExprCopy.type === 'egg') {
        if (currentExprCopy.color === variableColorToReplace) {
            return deepCopy(replacementExpression); 
        }
        return currentExprCopy;
    }

    if (currentExprCopy.type === 'alligator') {
        if (currentExprCopy.color === variableColorToReplace) { 
            return currentExprCopy; 
        }
        if (currentExprCopy.guards) {
            currentExprCopy.guards = substitute(currentExprCopy.guards, variableColorToReplace, replacementExpression);
        }
        return currentExprCopy;
    }
    console.warn("Unknown type in substitute:", currentExprCopy); 
    return currentExprCopy; 
}
// --- End of Substitution Logic ---


// --- Eating (Application) Logic ---
// ... (This section is unchanged, keep as is) ...
function performApplication(eatingAlligatorFamily, argumentFamily) {
    if (!eatingAlligatorFamily?.expression) { 
        console.error("performApplication: eatingAlligatorFamily or its expression is invalid."); 
        return null;
    }
    if (!argumentFamily) { 
        console.error("performApplication: argumentFamily is invalid."); 
        return null;
    }

    const eaterExpression = eatingAlligatorFamily.expression;

    if (eaterExpression.type !== 'alligator' || !eaterExpression.isHungry) {
        console.warn("performApplication: Eater is not a hungry alligator.", eaterExpression); 
        return null; 
    }

    const { color: variableColorToReplace, guards: bodyToSubstituteIn } = eaterExpression;
    const replacementExpr = argumentFamily.expression; 

    if (bodyToSubstituteIn === null) { 
        console.log("performApplication: Hungry alligator guards null; result of application is null expression.");
        return new Family(null); 
    }

    const resultingExpression = substitute(bodyToSubstituteIn, variableColorToReplace, replacementExpr);
    return new Family(resultingExpression); 
}
// --- End of Eating (Application) Logic ---


// --- Alpha Renaming (Color Rule) Logic Stubs ---
// ... (This section is unchanged, keep as is) ...
function needsAlphaRenaming(eatingAlligatorFamily, argumentFamily) {
    if (!eatingAlligatorFamily?.expression || eatingAlligatorFamily.expression.type !== 'alligator') {
        return false;
    }
    if (!argumentFamily) { 
        return false; 
    }

    const eatingAlligator = eatingAlligatorFamily.expression;
    const functionBody = eatingAlligator.guards; 
    const argumentExpression = argumentFamily.expression;

    if (!functionBody || !argumentExpression) { 
        return false; 
    }

    const functionBodyBinderColors = new Set();
    function _collectBinders(expr, set) {
        if (!expr || typeof expr !== 'object') return; 
        if (expr.type === 'alligator') { 
            set.add(expr.color); 
            _collectBinders(expr.guards, set); 
        }
    }
    _collectBinders(functionBody, functionBodyBinderColors);

    const argumentBinderColors = new Set();
    _collectBinders(argumentExpression, argumentBinderColors);

    for (const argColor of argumentBinderColors) {
        if (functionBodyBinderColors.has(argColor)) {
            console.warn(`Alpha Renaming Check: Potential binder color clash for color '${argColor}'.`); 
            return true;
        }
    }

    const freeVarsInArgumentColors = new Set();
    function _collectFreeEggColors(expr, boundColorsInScope, freeSet) {
        if (!expr || typeof expr !== 'object') return; 
        if (expr.type === 'egg') { 
            if (!boundColorsInScope.has(expr.color)) {
                freeSet.add(expr.color);
            }
        } else if (expr.type === 'alligator') {
            const newBoundColors = new Set(boundColorsInScope); 
            newBoundColors.add(expr.color);
            _collectFreeEggColors(expr.guards, newBoundColors, freeSet);
        }
    }
    _collectFreeEggColors(argumentExpression, new Set(), freeVarsInArgumentColors);

    for (const freeVarColor of freeVarsInArgumentColors) {
        if (functionBodyBinderColors.has(freeVarColor) && freeVarColor !== eatingAlligator.color) {
            console.warn(`Alpha Renaming Check: Free variable color '${freeVarColor}' in argument would be captured.`); 
            return true;
        }
    }
    return false; 
}

function alphaRename(familyToRename, existingColorsSet) {
    if (!familyToRename?.expression) { 
        console.warn("alphaRename: familyToRename or its expression is invalid."); 
        return familyToRename; 
    }

    const exprString = typeof familyToRename.expression.toString === 'function' ? 
                       familyToRename.expression.toString() : JSON.stringify(familyToRename.expression);
    console.log(`alphaRename STUB: Alpha renaming would be performed on family '${familyToRename.id}' (expr: ${exprString}) to avoid clashes with colors:`, existingColorsSet);
    
    return familyToRename; 
}
// --- End of Alpha Renaming (Color Rule) Logic Stubs ---

        
// --- DOM Rendering Functions ---
// ... (This section is unchanged, keep as is) ...
let activeFamilies = {}; 

function registerFamily(family) {
    if (family?.id) { 
        console.log(`%cREGISTERING: ${family.id}`, 'color: green; font-weight: bold;', JSON.parse(JSON.stringify(family)));
        activeFamilies[family.id] = family;
    } else {
        console.warn('%cREGISTER FAIL: Family or family.id is undefined', 'color: orange;', family);
    }
}
function unregisterFamily(familyId) { 
    if (activeFamilies[familyId]) {
        console.log(`%cUNREGISTERING: ${familyId}`, 'color: red; font-weight: bold;', JSON.parse(JSON.stringify(activeFamilies[familyId])));
    } else {
        console.warn(`%cUNREGISTER ATTEMPT: Family ${familyId} not found in activeFamilies.`, 'color: orange;');
    }
    delete activeFamilies[familyId]; 
}

function renderExpressionToDOM(expression) {
    if (!expression) { 
        const emptyNode = document.createElement('div'); 
        emptyNode.textContent = '∅'; 
        emptyNode.style.cssText = 'font-size:0.8em; color:#aaa; padding:5px; display:inline-block;'; 
        return emptyNode;
    }

    let parentDiv = null; 
    let tooltipMessage = "";

    if (expression.type === 'egg') {
        const eggDiv = document.createElement('div'); 
        eggDiv.className = `egg color-${expression.color} has-tooltip`; 
        eggDiv.textContent = expression.variableName; 
        parentDiv = eggDiv;
        tooltipMessage = `Type: Egg (Variable)\nName: ${expression.variableName}\nColor: ${expression.color}`;
    } else if (expression.type === 'alligator') {
        const alligatorDiv = document.createElement('div');
        alligatorDiv.className = `alligator color-${expression.color} has-tooltip`; 
        if (!expression.isHungry) {
            alligatorDiv.classList.add('old');
        }

        const nameSpan = document.createElement('span'); 
        nameSpan.className = 'variable-name'; 
        nameSpan.textContent = expression.variableName.toUpperCase();
        alligatorDiv.appendChild(nameSpan);

        parentDiv = alligatorDiv;
        const typeString = expression.isHungry ? "Hungry Alligator (Lambda)" : "Old Alligator (Constant/Applied)";
        tooltipMessage = `Type: ${typeString}\nBinds: ${expression.variableName}\nColor: ${expression.color}`;

        const guardsWrapper = document.createElement('div');
        guardsWrapper.className = 'expression-wrapper';
        const guardedElement = renderExpressionToDOM(expression.guards); 
        guardsWrapper.appendChild(guardedElement);
        alligatorDiv.appendChild(guardsWrapper);
        
    } else {
        console.warn("renderExpressionToDOM: Unrecognized expression object", expression);
        const unknownDiv = document.createElement('div'); 
        unknownDiv.textContent = '[?Unknown?]'; 
        unknownDiv.style.color = 'red'; 
        return unknownDiv;
    }

    if (parentDiv && tooltipMessage) {
        const tooltipSpan = document.createElement('span');
        tooltipSpan.classList.add('tooltip-text');
        tooltipSpan.innerText = tooltipMessage; 
        parentDiv.appendChild(tooltipSpan);
    }
    
    return parentDiv;
}


function renderFamilyToDOM(familyToRender, containerElementId, clearPreviousInContainer = true) {
    const containerElement = document.getElementById(containerElementId);
    if (!containerElement) { 
        console.error(`Render Error: Container element with ID '${containerElementId}' not found.`); 
        return; 
    }

    if (clearPreviousInContainer) {
        containerElement.querySelectorAll('.family-container').forEach(fc => {
            const familyIdFromOldDOM = fc.dataset.familyId;
            if (familyIdFromOldDOM) {
                const jsFamilyObject = activeFamilies[familyIdFromOldDOM];
                if (jsFamilyObject && 
                    jsFamilyObject.currentContainerId === containerElementId && 
                    (!familyToRender || familyToRender.id !== familyIdFromOldDOM) ) {
                    console.log(`RENDER (in clear): Family ${familyIdFromOldDOM} (which JS says is in ${containerElementId}) is being cleared/replaced. Unregistering.`);
                    unregisterFamily(familyIdFromOldDOM);
                } else if (jsFamilyObject && familyToRender && familyToRender.id === familyIdFromOldDOM) {
                    console.log(`RENDER (in clear): Re-rendering same family ${familyIdFromOldDOM} in ${containerElementId}. JS object preserved for update.`);
                } else if (jsFamilyObject && jsFamilyObject.currentContainerId !== containerElementId) {
                    console.log(`RENDER (in clear): Family ${familyIdFromOldDOM} (JS state: in ${jsFamilyObject.currentContainerId}) old DOM found in ${containerElementId}. Not unregistering JS object as it has moved.`);
                } else if (!jsFamilyObject) {
                    console.log(`RENDER (in clear): Ghost DOM for ${familyIdFromOldDOM} in ${containerElementId}. No JS object to unregister.`);
                }
            }
        });
        containerElement.innerHTML = ''; 
    }
    
    if (!familyToRender) { 
        if (clearPreviousInContainer) { 
            const p = document.createElement('p'); 
            p.className = 'placeholder-text';
            p.textContent = '(No family to display)'; 
            containerElement.appendChild(p);
        }
        return; 
    }

    const familyContainerDiv = document.createElement('div');
    familyContainerDiv.className = 'family-container';
    familyContainerDiv.draggable = true; 
    familyContainerDiv.dataset.familyId = familyToRender.id; 
    
    familyToRender.currentContainerId = containerElementId; 
    console.log(`RENDER: About to register/update family: ${familyToRender.id} (currentContainerId: ${familyToRender.currentContainerId}) into container: ${containerElementId}`);
    registerFamily(familyToRender); 

    const expressionWrapperDiv = document.createElement('div');
    expressionWrapperDiv.className = 'expression-wrapper'; 
    const expressionElement = renderExpressionToDOM(familyToRender.expression);
    
    if (expressionElement) {
        expressionWrapperDiv.appendChild(expressionElement);
        familyContainerDiv.appendChild(expressionWrapperDiv);
        containerElement.appendChild(familyContainerDiv);
    } else {
        console.error(`Render Error: Failed to render expression for family '${familyToRender.id}'.`);
        if (clearPreviousInContainer) {
            const p = document.createElement('p'); 
            p.className = 'placeholder-text';
            p.textContent = '(Error rendering expression)'; 
            containerElement.appendChild(p);
        }
    }
}
// --- End of DOM Rendering Functions ---

// --- Lambda Calculus Notation Display Logic ---
// ... (This section is unchanged, keep as is) ...
function getLambdaNotation(expression) {
    if (!expression) {
        return "∅"; 
    }
    const type = expression.type;
    const variableName = expression.variableName || '?'; 

    if (type === 'egg') {
        return variableName;
    }
    if (type === 'alligator') {
        const guardsNotation = getLambdaNotation(expression.guards);
        if (expression.isHungry) {
            return `(λ${variableName}.${guardsNotation})`;
        } else {
            return variableName.toUpperCase(); 
        }
    }
    console.warn("getLambdaNotation: Unknown expression type", expression);
    return "[?unknown_expr?]";
}

function updateLambdaDisplay() {
    const displayElement = document.getElementById('lambda-notation-display');
    if (!displayElement) {
        console.warn("updateLambdaDisplay: Element with ID 'lambda-notation-display' not found.");
        return;
    }
    const funcContainer = document.getElementById('function-display-area');
    const argContainer = document.getElementById('argument-staging-area');
    const funcFamilyId = funcContainer?.querySelector('.family-container')?.dataset.familyId;
    const argFamilyId = argContainer?.querySelector('.family-container')?.dataset.familyId;
    const funcFamily = funcFamilyId ? activeFamilies[funcFamilyId] : null;
    const argFamily = argFamilyId ? activeFamilies[argFamilyId] : null;

    let funcNotation = "Function: (empty)";
    if (funcFamily) { 
        funcNotation = `Function: ${getLambdaNotation(funcFamily.expression)}`;
    }
    let argNotation = "Argument: (empty)";
    if (argFamily) { 
        argNotation = `Argument: ${getLambdaNotation(argFamily.expression)}`;
    }
    displayElement.innerHTML = `<p>${funcNotation}</p><p>${argNotation}</p>`;
}
// --- End of Lambda Calculus Notation Display Logic ---

// --- Explanation Panel Logic ---
// ... (This section is unchanged, keep as is) ...
function updateExplanation(text) {
    const explanationElement = document.getElementById('explanation-text-display');
    if (explanationElement) {
        explanationElement.innerHTML = text; 
    } else {
        console.warn("updateExplanation: Element with ID 'explanation-text-display' not found.");
    }
}
// --- End of Explanation Panel Logic ---

// --- Tromp Diagram Data Structures ---
// ... (This section is unchanged, keep as is) ...
let nextTrompNodeId = 0;

function getNewTrompNodeId() {
    return `tromp-node-${nextTrompNodeId++}`;
}

class TrompNode {
    constructor(id, type, label = '', additionalProps = {}) {
        this.id = id;
        this.type = type;
        this.label = label;
        Object.assign(this, additionalProps);
    }
}

class TrompLink {
    constructor(sourceNodeId, targetNodeId, type, additionalProps = {}) {
        this.source = sourceNodeId; 
        this.target = targetNodeId;
        this.type = type;
        Object.assign(this, additionalProps);
    }
}

function resetTrompNodeIdCounter() {
    nextTrompNodeId = 0;
}
// --- End of Tromp Diagram Data Structures ---

// --- Tromp Diagram Conversion Logic ---
// ... (This section is unchanged, keep as is) ...
function convertToTrompData(expression, initialScope = {}) {
    const nodes = [];
    const links = [];
    resetTrompNodeIdCounter(); 

    function _convertRecursively(currentExpr, currentScope) {
        if (!currentExpr) {
            const nullNodeId = getNewTrompNodeId();
            nodes.push(new TrompNode(nullNodeId, 'constant', '∅'));
            return nullNodeId;
        }

        const exprType = currentExpr.type;
        const exprColor = currentExpr.color;
        const exprVarName = currentExpr.variableName;
        let rootNodeIdForCurrentExpr = null; 

        if (exprType === 'egg') {
            const varNodeId = getNewTrompNodeId();
            const binderKey = `${exprVarName}_${exprColor}`; 
            nodes.push(new TrompNode(varNodeId, 'variable', exprVarName, { 
                color: exprColor, 
                isBound: currentScope.hasOwnProperty(binderKey) 
            }));
            rootNodeIdForCurrentExpr = varNodeId;

            if (currentScope.hasOwnProperty(binderKey)) {
                const binderNodeId = currentScope[binderKey];
                links.push(new TrompLink(varNodeId, binderNodeId, 'variable_binding', { style: 'dashed' }));
            }
        } else if (exprType === 'alligator') {
            if (currentExpr.isHungry) {
                const lambdaSymbolNodeId = getNewTrompNodeId();
                nodes.push(new TrompNode(lambdaSymbolNodeId, 'lambda', `λ`, { color: exprColor, boundVarName: exprVarName }));
                rootNodeIdForCurrentExpr = lambdaSymbolNodeId;

                const paramVarNodeId = getNewTrompNodeId();
                nodes.push(new TrompNode(paramVarNodeId, 'variable', exprVarName, { 
                    color: exprColor, 
                    isBinder: true 
                }));
                
                links.push(new TrompLink(lambdaSymbolNodeId, paramVarNodeId, 'scope_link', { style: 'dotted' }));

                const newScope = { ...currentScope };
                const binderKey = `${exprVarName}_${exprColor}`;
                newScope[binderKey] = paramVarNodeId; 

                const bodyRootNodeId = _convertRecursively(currentExpr.guards, newScope);
                
                if (bodyRootNodeId) { 
                    links.push(new TrompLink(lambdaSymbolNodeId, bodyRootNodeId, 'abstraction_body'));
                }
            } else { 
                const constNodeId = getNewTrompNodeId();
                nodes.push(new TrompNode(constNodeId, 'constant', exprVarName.toUpperCase(), { color: exprColor }));
                rootNodeIdForCurrentExpr = constNodeId;
            }
        } else {
            console.warn("convertToTrompData: Unknown expression type encountered during recursion.", currentExpr);
            const unknownNodeId = getNewTrompNodeId();
            nodes.push(new TrompNode(unknownNodeId, 'constant', '[?UNK?]'));
            rootNodeIdForCurrentExpr = unknownNodeId;
        }
        return rootNodeIdForCurrentExpr;
    }

    const rootNodeId = _convertRecursively(expression, initialScope);
    return { nodes, links, rootNodeId };
}
// --- End of Tromp Diagram Conversion Logic ---

// --- Tromp Diagram D3.js Rendering Logic ---
// ... (This section is unchanged, keep as is) ...
function drawTrompDiagram(trompData, svgContainerId) {
    const svgElement = d3.select(`#${svgContainerId}`);
    if (svgElement.empty()) {
        console.error(`drawTrompDiagram: SVG container #${svgContainerId} not found.`);
        return;
    }
    svgElement.selectAll("*").remove();

    const width = +svgElement.attr("width");
    const height = +svgElement.attr("height");

    const nodes = trompData.nodes.map(d => ({...d})); 
    const links = trompData.links.map(d => ({...d})); 

    if (!nodes.length) {
        svgElement.append("text")
            .attr("x", width / 2).attr("y", height / 2)
            .attr("text-anchor", "middle").style("font-size", "16px")
            .text("No diagram to display.");
        return;
    }

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id)
            .distance(d => (d.type === 'scope_link') ? 20 : (d.type === 'variable_binding' ? 60 : 40))
            .strength(0.7))
        .force("charge", d3.forceManyBody().strength(-150))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => d.type === 'lambda' ? 20 : 15));

    svgElement.append("defs").selectAll("marker")
        .data(["end-arrow"]) 
        .join("marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10").attr("refX", 19) 
            .attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6)
            .attr("orient", "auto")
        .append("path").attr("fill", "#555").attr("d", "M0,-5L10,0L0,5");

    const link = svgElement.append("g").attr("class", "tromp-links-group")
        .selectAll("line").data(links).join("line")
        .attr("class", d => `tromp-link ${d.type}`)
        .attr("marker-end", d => (d.type === 'abstraction_body') ? "url(#end-arrow)" : null);

    const node = svgElement.append("g").attr("class", "tromp-nodes-group")
        .selectAll("g").data(nodes).join("g")
        .attr("class", d => `tromp-node ${d.type} color-${d.color} ${d.isBinder ? 'isBinder' : ''}`)
        .call(drag(simulation)); 

    node.append("circle")
        .attr("r", d => {
            if (d.type === 'lambda') return 12;
            if (d.type === 'variable' && d.isBinder) return 8;
            if (d.type === 'variable') return 7;
            if (d.type === 'constant') return 9;
            return 8;
        });
    node.append("text").attr("dy", "0.35em").attr("text-anchor", "middle").text(d => d.label);
    node.append("title").text(d => `ID: ${d.id}\nType: ${d.type}\nLabel: ${d.label}${d.color ? '\nColor: ' + d.color : ''}${d.boundVarName ? '\nBinds: ' + d.boundVarName : ''}`);

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
        }
        function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
        }
        return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }
}
// --- End of Tromp Diagram D3.js Rendering Logic ---

// --- Animation Logic & Animated Application ---
// ... (This section is unchanged, keep as is) ...
async function performAnimatedApplication(functionFamily, argumentFamily, functionContainerId, argumentContainerId) {
    const functionContainerElement = document.getElementById(functionContainerId);
    const argumentContainerElement = document.getElementById(argumentContainerId);
    const functionFamilyElement = functionContainerElement?.querySelector(`.family-container[data-family-id="${functionFamily.id}"]`);
    const argumentFamilyElement = argumentContainerElement?.querySelector(`.family-container[data-family-id="${argumentFamily.id}"]`);

    let applicationPerformed = false;
    let finalFunctionFamilyForUpdates = functionFamily; 

    if (!functionFamilyElement || !argumentFamilyElement) {
        console.warn("Animation: DOM elements not found. Performing non-animated application.");
        const resultFamily = performApplication(functionFamily, argumentFamily);
        if (resultFamily) {
            renderFamilyToDOM(resultFamily, functionContainerId);
            renderFamilyToDOM(null, argumentContainerId);
            finalFunctionFamilyForUpdates = resultFamily;
            applicationPerformed = true;
        }
        updateAllUIDisplays(finalFunctionFamilyForUpdates);
        if(applicationPerformed) checkWinCondition();
        return; 
    }

    return new Promise(resolve => {
        argumentFamilyElement.classList.add('animating-argument-consumed');
        setTimeout(() => {
            argumentFamilyElement.style.visibility = 'hidden'; 
            if (functionFamilyElement) {
                functionFamilyElement.classList.add('animating-function-disappear');
            }
            setTimeout(() => {
                const resultFamily = performApplication(functionFamily, argumentFamily);
                if (resultFamily) {
                    renderFamilyToDOM(resultFamily, functionContainerId); 
                    const newFunctionFamilyElement = functionContainerElement.querySelector(`.family-container[data-family-id="${resultFamily.id}"]`);
                    if (newFunctionFamilyElement) {
                        newFunctionFamilyElement.classList.add('animating-function-appear');
                    }
                    renderFamilyToDOM(null, argumentContainerId); 
                    finalFunctionFamilyForUpdates = resultFamily;
                    applicationPerformed = true;
                } else { 
                    if (functionFamilyElement) functionFamilyElement.classList.remove('animating-function-disappear');
                    if (argumentFamilyElement) { 
                         argumentFamilyElement.classList.remove('animating-argument-consumed');
                         argumentFamilyElement.style.visibility = 'visible';
                    }
                }
                
                updateAllUIDisplays(finalFunctionFamilyForUpdates);
                if(applicationPerformed) checkWinCondition();
                resolve(); 
            }, 300); 
        }, 300); 
    });
}

function updateAllUIDisplays(familyInFunctionArea = null) {
    updateLambdaDisplay();
    updateApplyManuallyButtonState();

    let expressionForTromp = null;
    if (familyInFunctionArea) { 
        expressionForTromp = familyInFunctionArea.expression;
    } else { 
        const funcContainer = document.getElementById('function-display-area');
        const funcFamilyId = funcContainer?.querySelector('.family-container')?.dataset.familyId;
        const currentFuncFamily = funcFamilyId ? activeFamilies[funcFamilyId] : null;
        if (currentFuncFamily) {
            expressionForTromp = currentFuncFamily.expression;
        }
    }

    if (expressionForTromp) {
        const trompData = convertToTrompData(expressionForTromp);
        drawTrompDiagram(trompData, "tromp-diagram-svg-container");
    } else {
        drawTrompDiagram({ nodes: [], links: [], rootNodeId: null }, "tromp-diagram-svg-container");
    }
}
// --- End of Animation Logic ---

// --- Enhanced Puzzle/Level Structure & Definitions ---
// ... (This section is unchanged, keep as is, including PUZZLE_LEVELS definition) ...
/** @type {import('./jsdocs.js').Level[]} */ 
const PUZZLE_LEVELS = [
    {
        name: "IdentityApplication",
        title: "Level 1: The Identity Mirror",
        instructionText: "<b>Welcome to Lambda Gators!</b><br>This is the <strong>Identity function (λx.x)</strong>. It's like a perfect mirror: whatever you give it, it gives right back.<br><br>Drag the <strong>argument egg</strong> and drop it onto the <strong>function alligator</strong> to see it in action.",
        initialFunctionSetup: () => {
            resetColorAndVariableCounters(); 
            const x_col = getNewColor(); 
            const x_var = getNewVariableName(); 
            return new Family(new Alligator(x_col, x_var, true, new Egg(x_col, x_var)));
        },
        initialArgumentSetup: () => {
            const y_col = getNewColor(); 
            const y_var = getNewVariableName(); 
            return new Family(new Egg(y_col, y_var));
        },
        successCondition: (mainFamily) => {
            return mainFamily?.expression?.type === 'egg' && 
                   mainFamily.expression.color === 'green' && 
                   mainFamily.expression.variableName === 'y'; 
        },
        winMessage: "Great! The identity alligator reflected the 'Y' egg perfectly. You've performed your first β-reduction!"
    },
    {
        name: "KCombinatorFirstArg",
        title: "Level 2: The K-Combinator's Choice",
        instructionText: "This is the <strong>K-Combinator (λx.λy.x)</strong>. It takes two arguments, discards the second, and returns the first.<br><br>Drag the <strong>first argument egg</strong> and drop it onto the <strong>outer alligator</strong>. The K-combinator will 'eat' it and transform into a new function.",
        initialFunctionSetup: () => {
            resetColorAndVariableCounters();
            const x_col = getNewColor(); 
            const x_var = getNewVariableName(); 
            const y_col = getNewColor(); 
            const y_var = getNewVariableName(); 
            return new Family(
                new Alligator(x_col, x_var, true, 
                    new Alligator(y_col, y_var, true, new Egg(x_col, x_var)) 
                )
            );
        },
        initialArgumentSetup: () => {
            const z_col = getNewColor(); 
            const z_var = getNewVariableName(); 
            return new Family(new Egg(z_col, z_var));
        },
        successCondition: (mainFamily) => {
            if (mainFamily?.expression?.type === 'alligator' && mainFamily.expression.isHungry) {
                const innerAlligator = mainFamily.expression;
                return innerAlligator.color === 'green' && 
                       innerAlligator.guards?.type === 'egg' &&
                       innerAlligator.guards.color === 'red'; 
            }
            return false;
        },
        winMessage: "Excellent! The K-combinator consumed the 'Z' egg and became a new function: (λy.Z). It will now always return 'Z', no matter what 'Y' it gets."
    },
    {
        name: "SelfApplicationOmegaSimpler",
        title: "Level 3: A Taste of Self-Application",
        instructionText: "Let's look at a function <strong>F = (λf.A)</strong>, where 'A' is just an egg. What happens if you apply F to itself? That is, F(F) which means (λf.A) (λg.B).<br><br>Drag the <strong>argument F</strong> and drop it onto the <strong>function F</strong>.",
        initialFunctionSetup: () => { 
            resetColorAndVariableCounters();
            const f_col = getNewColor(); 
            const f_var = getNewVariableName(); 
            const a_col = getNewColor(); 
            const a_var = getNewVariableName(); 
            return new Family(new Alligator(f_col, f_var, true, new Egg(a_col, a_var) )); 
        },
        initialArgumentSetup: () => { 
            const g_col = getNewColor(); 
            const g_var = getNewVariableName(); 
            const b_col = getNewColor(); 
            const b_var = getNewVariableName(); 
            return new Family(new Alligator(g_col, g_var, true, new Egg(b_col, b_var) )); 
        },
        successCondition: (mainFamily) => {
            return mainFamily?.expression?.type === 'egg' && mainFamily.expression.color === 'green';
        },
        winMessage: "Intriguing! Applying this version of F to itself resulted in the egg 'A'. Self-application can lead to various behaviors!"
    }
];
let currentLevelIndex = 0;
let resetButton, nextExampleButton, applyManuallyButton, aboutProjectButton; // Added aboutProjectButton

// --- Level Progression Logic ---
// ... (This section is unchanged, keep as is, including checkWinCondition) ...
function checkWinCondition() {
    if (currentLevelIndex < 0 || currentLevelIndex >= PUZZLE_LEVELS.length) {
        console.error("checkWinCondition: Invalid currentLevelIndex.");
        return false;
    }

    const level = PUZZLE_LEVELS[currentLevelIndex];
    const funcContainer = document.getElementById('function-display-area');
    const funcFamilyId = funcContainer?.querySelector('.family-container')?.dataset.familyId;
    const mainFamily = funcFamilyId ? activeFamilies[funcFamilyId] : null;

    if (!mainFamily) { return false; }

    let is_won = false;

    if (typeof level.successCondition === 'function') {
        if (level.successCondition(mainFamily)) {
            is_won = true;
        }
    } else if (level.targetLambdaNotation) {
        const currentNotation = getLambdaNotation(mainFamily.expression);
        if (currentNotation === level.targetLambdaNotation) {
            is_won = true;
        }
    } else {
        function hasHungryAlligator(expression) {
            if (!expression) return false;
            if (expression.type === 'alligator') {
                if (expression.isHungry) return true;
                return hasHungryAlligator(expression.guards);
            }
            return false;
        }
        if (mainFamily.expression && !hasHungryAlligator(mainFamily.expression)) { 
             console.log("Default win: No hungry alligators left in the main expression.");
             is_won = true; 
        }
    }

    if (is_won) {
        console.log(`Level ${currentLevelIndex}: "${level.title}" COMPLETED!`);
        saveProgress(currentLevelIndex); // Save progress on win
        const winMsg = level.winMessage || "Level completed successfully!";
        updateExplanation(winMsg + "<br><br>Click 'Next Puzzle' to continue, or 'Reset' to try again."); 

        if (nextExampleButton) {
            if (currentLevelIndex < PUZZLE_LEVELS.length - 1) {
                nextExampleButton.disabled = false;
            } else {
                nextExampleButton.disabled = true; 
                updateExplanation(winMsg + "<br><br>Congratulations, you've completed all available puzzles!");
            }
        }
        return true;
    }
    return false;
}

// --- UI Controls Logic ---
// ... (loadLevel and updateApplyManuallyButtonState are unchanged, keep as is) ...
function loadLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= PUZZLE_LEVELS.length) {
        console.error("Error: Level index out of bounds.", levelIndex);
        if (nextExampleButton) nextExampleButton.disabled = true;
        return;
    }
    currentLevelIndex = levelIndex;
    const level = PUZZLE_LEVELS[currentLevelIndex];
    console.log(`Loading Level ${currentLevelIndex}: ${level.title}`);

    activeFamilies = {}; 
    nextFamilyId = 0; 
    resetColorAndVariableCounters(); 

    const funcFamily = level.initialFunctionSetup();
    renderFamilyToDOM(funcFamily, 'function-display-area');
    
    let familyForInitialTromp = null;
    const funcFamilyFromActive = activeFamilies[funcFamily.id]; 
    if (funcFamilyFromActive) {
        familyForInitialTromp = funcFamilyFromActive;
    }
    updateAllUIDisplays(familyForInitialTromp); 

    if (level.initialArgumentSetup) {
        const argFamily = level.initialArgumentSetup();
        renderFamilyToDOM(argFamily, 'argument-staging-area');
    } else {
        renderFamilyToDOM(null, 'argument-staging-area');
    }

    if (level.instructionText) {
        updateExplanation(level.instructionText); 
    } else {
        updateExplanation("Solve the puzzle!");
    }
    
    if (resetButton) resetButton.disabled = false;
    if (nextExampleButton) {
        nextExampleButton.disabled = true; 
    }
    updateApplyManuallyButtonState(); 
    checkWinCondition(); 
}

function updateApplyManuallyButtonState() {
    if (!applyManuallyButton) return;
    const funcContainer = document.getElementById('function-display-area');
    const argContainer = document.getElementById('argument-staging-area');

    const funcFamilyId = funcContainer?.querySelector('.family-container')?.dataset.familyId;
    const argFamilyId = argContainer?.querySelector('.family-container')?.dataset.familyId;

    const funcFamily = funcFamilyId ? activeFamilies[funcFamilyId] : null;
    const argFamily = argFamilyId ? activeFamilies[argFamilyId] : null;

    applyManuallyButton.disabled = !(funcFamily?.expression?.type === 'alligator' && funcFamily.expression.isHungry && argFamily);
}


// --- Local Storage Logic for Progress Saving ---
const STORAGE_KEY_MAX_LEVEL_REACHED = 'lambdaGatorsMaxLevelReached';

function saveProgress(completedLevelIndex) {
    try {
        let highestLevelUnlocked = completedLevelIndex + 1;
        const storedMaxLevel = loadProgress(); 
        if (highestLevelUnlocked > storedMaxLevel) {
            if (highestLevelUnlocked >= PUZZLE_LEVELS.length) {
                highestLevelUnlocked = PUZZLE_LEVELS.length; 
            }
            localStorage.setItem(STORAGE_KEY_MAX_LEVEL_REACHED, highestLevelUnlocked.toString());
            console.log(`Progress Saved: Highest level unlocked is now ${highestLevelUnlocked}`);
        }
    } catch (e) {
        console.error("Error saving progress to localStorage:", e);
    }
}

function loadProgress() {
    try {
        const savedLevelIndexStr = localStorage.getItem(STORAGE_KEY_MAX_LEVEL_REACHED);
        if (savedLevelIndexStr !== null) {
            const savedLevelIndex = parseInt(savedLevelIndexStr, 10);
            if (!isNaN(savedLevelIndex) && savedLevelIndex >= 0 && savedLevelIndex <= PUZZLE_LEVELS.length) {
                console.log(`Progress Loaded: User has unlocked up to level ${savedLevelIndex}`);
                return savedLevelIndex;
            }
        }
    } catch (e) {
        console.error("Error loading progress from localStorage:", e);
    }
    return 0; 
}
// --- End of Local Storage Logic ---

// --- Project Description Content ---
const projectDescriptionHTML = `
    <p><strong>Dive into the fascinating world of computation with Lambda Gators!</strong> This interactive web application, built with an innovative AI-first development approach, transforms the abstract concepts of Lambda Calculus into an engaging, visual, and gamified learning experience. Prepare to feed some hungry alligators and watch fundamental computer science principles come to life!</p>
    
    <h3>What Are You Learning?</h3>
    <p>Lambda Calculus is a foundational system in computer science, forming the theoretical underpinnings of most functional programming languages and influencing many other areas of computation. It might seem daunting, but Lambda Gators is here to demystify it! Through our unique "Alligator Eggs" game and supplementary "Tromp Diagram" visualizations, you'll intuitively grasp complex topics, including:</p>
    
    <h4>1. The Essence of Lambda Calculus:</h4>
    <ul>
        <li><strong>Functions as First-Class Citizens:</strong> Understand how functions can be treated like any other value – passed as arguments, returned from other functions, and assigned to variables.</li>
        <li><strong>Anonymous Functions (Lambdas):</strong> Meet the "hungry alligators" – our visual analogy for lambda abstractions (λ). These are functions without a formal name, defined by what variable they bind and what expression (their "body") they guard.</li>
        <li><strong>Function Application:</strong> Witness the core action! See what happens when a function (a hungry alligator) "eats" an argument (an egg or another alligator family).</li>
        <li><strong>Variables, Binding & Scope:</strong> Discover how variables (eggs) are "bound" by lambda abstractions (hungry alligators of a matching color). Understand the concept of scope – where a variable is meaningful and tied to its specific binder.</li>
        <li><strong>Free vs. Bound Variables:</strong> Learn to distinguish variables that are tied to a binder within an expression from those that are "free" (their meaning comes from an outer context).</li>
    </ul>

    <h4>2. The Mechanics of Computation:</h4>
    <ul>
        <li><strong>Beta-Reduction (The "Eating" Game):</strong> This is the star of the show! When an alligator eats a compatible argument, you're performing a beta-reduction – the fundamental process of computation in Lambda Calculus.</li>
        <li><strong>Alpha-Conversion (The "Color Rule"):</strong> Avoid paradoxes! Our "color rule" introduces the concept of alpha-conversion – renaming bound variables to prevent accidental "capture" by the wrong binder during substitution.</li>
    </ul>

    <h4>3. Sharpening Your Computational Thinking:</h4>
    <ul>
        <li><strong>Abstraction:</strong> Creating general functions that can operate on various inputs.</li>
        <li><strong>Decomposition:</strong> Breaking down complex lambda expressions into simpler parts.</li>
        <li><strong>Pattern Recognition:</strong> Identifying common lambda calculus patterns.</li>
        <li><strong>Algorithmic Thinking:</strong> The step-by-step process of reducing expressions.</li>
    </ul>

    <h4>4. Our Unique Visualizations:</h4>
    <ul>
        <li><strong>Alligator Eggs:</strong>
            <ul>
                <li>Hungry Alligators: Represent lambda abstractions (λx.M).</li>
                <li>Eggs: Represent variables.</li>
                <li>Old Alligators: Represent constants or applied functions.</li>
                <li>Families: Grouped expressions.</li>
            </ul>
        </li>
        <li><strong>Tromp Diagrams:</strong> A graph-based visualization showing lambda structure, binders, variable usage, and binding links.</li>
    </ul>

    <h4>Our Goal:</h4>
    <p>Lambda Gators aims to make these powerful concepts more tangible. By interacting with these systems, you're building an intuitive understanding of computation.</p>
    <p><em>This project was developed with significant code generated via AI collaboration.</em></p>
`;
// --- End of Project Description Content ---


function initializeControls() {
    resetButton = document.getElementById('reset-button');
    nextExampleButton = document.getElementById('next-example-button');
    applyManuallyButton = document.getElementById('apply-manually-button');
    aboutProjectButton = document.getElementById('about-project-button'); // Get the new button
    
    const controlsPlaceholder = document.getElementById('controls-placeholder-text');
    if (controlsPlaceholder) controlsPlaceholder.style.display = 'none';
    
    if(resetButton) resetButton.style.display = 'inline-block';
    if(nextExampleButton) nextExampleButton.style.display = 'inline-block';
    if(applyManuallyButton) applyManuallyButton.style.display = 'inline-block';
    if(aboutProjectButton) aboutProjectButton.style.display = 'inline-block'; // Make it visible

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            console.log("Reset button clicked.");
            const descriptionSection = document.getElementById('project-description-section');
            if (descriptionSection) descriptionSection.style.display = 'none'; // Hide about on reset
            loadLevel(currentLevelIndex); 
        });
    }
    if (nextExampleButton) {
        nextExampleButton.addEventListener('click', () => {
            console.log("Next Example button clicked.");
            const descriptionSection = document.getElementById('project-description-section');
            if (descriptionSection) descriptionSection.style.display = 'none'; // Hide about on next
            if (!nextExampleButton.disabled && currentLevelIndex < PUZZLE_LEVELS.length - 1) { 
                loadLevel(currentLevelIndex + 1);
            } else if (currentLevelIndex >= PUZZLE_LEVELS.length - 1) {
                console.log("Already on the last level or no more levels.");
            }
        });
    }
    if (applyManuallyButton) {
        applyManuallyButton.addEventListener('click', () => {
            console.log("Apply Manually button clicked.");
            const descriptionSection = document.getElementById('project-description-section');
            if (descriptionSection) descriptionSection.style.display = 'none'; // Hide about on apply

            const funcContainer = document.getElementById('function-display-area');
            const argContainer = document.getElementById('argument-staging-area');
            const funcFamilyId = funcContainer?.querySelector('.family-container')?.dataset.familyId;
            const argFamilyId = argContainer?.querySelector('.family-container')?.dataset.familyId;
            const functionFamily = funcFamilyId ? activeFamilies[funcFamilyId] : null;
            const argumentFamily = argFamilyId ? activeFamilies[argFamilyId] : null;

            if (functionFamily && argumentFamily && functionFamily.expression?.type === 'alligator' && functionFamily.expression.isHungry) {
                if (needsAlphaRenaming(functionFamily, argumentFamily)) {
                    alert("Alpha renaming needed! (Full feature not implemented yet)"); return;
                }
                performAnimatedApplication(functionFamily, argumentFamily, 'function-display-area', 'argument-staging-area')
                    .catch(err => console.error("Error during manual animated application:", err));
            } else { alert("Cannot apply: Ensure a hungry alligator function and an argument are present."); }
        });
    }

    // Event listener for the "About Lambda Gators" button
    if (aboutProjectButton) {
        aboutProjectButton.addEventListener('click', () => {
            const descriptionSection = document.getElementById('project-description-section');
            const descriptionContentDiv = document.getElementById('project-description-content');
            if (descriptionSection && descriptionContentDiv) {
                if (descriptionSection.style.display === 'none') {
                    descriptionContentDiv.innerHTML = projectDescriptionHTML; // Inject content
                    descriptionSection.style.display = 'block';
                    aboutProjectButton.textContent = 'Hide About';
                } else {
                    descriptionSection.style.display = 'none';
                    aboutProjectButton.textContent = 'About Lambda Gators';
                }
            }
        });
    }

    const startingLevelIndex = loadProgress();
    let levelToLoad = startingLevelIndex;
    if (startingLevelIndex >= PUZZLE_LEVELS.length && PUZZLE_LEVELS.length > 0) {
        levelToLoad = PUZZLE_LEVELS.length - 1; 
    } else if (PUZZLE_LEVELS.length === 0) {
        levelToLoad = 0; 
    }
    loadLevel(levelToLoad); 
}
// --- End of UI Controls Logic ---


// --- Drag and Drop Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const gameAreaElementForDnD = document.getElementById('game-area'); 
    if (gameAreaElementForDnD) {
        gameAreaElementForDnD.addEventListener('dragstart', function(event) {
            const familyContainer = event.target.closest('.family-container');
            if (familyContainer?.dataset.familyId) { 
                event.dataTransfer.setData('text/plain', familyContainer.dataset.familyId);
                event.dataTransfer.effectAllowed = 'move';
            } else { 
                event.preventDefault(); 
            }
        });
    }

    const dropZoneIds = ['function-display-area', 'argument-staging-area'];
    dropZoneIds.forEach(zoneId => {
        const zone = document.getElementById(zoneId);
        if (!zone) {
            console.error(`DragDrop Setup: Drop zone with ID '${zoneId}' not found.`);
            return;
        }

        zone.addEventListener('dragenter', function(event) {
            event.preventDefault();
            let targetHighlightElement = zone; 
            if (zone.id === 'function-display-area') {
                const alligatorEl = event.target.closest('.alligator:not(.old)');
                if (alligatorEl && alligatorEl.closest('.family-container')?.parentElement === zone) {
                    targetHighlightElement = alligatorEl; 
                }
            }
            targetHighlightElement.classList.add('drag-over-active');
        });

        zone.addEventListener('dragover', function(event) {
            event.preventDefault(); 
            event.dataTransfer.dropEffect = 'move';
        });

        zone.addEventListener('dragleave', function(event) {
            event.preventDefault();
            zone.classList.remove('drag-over-active');
            zone.querySelectorAll('.alligator.drag-over-active').forEach(el => el.classList.remove('drag-over-active'));
        });

        zone.addEventListener('drop', function(event) {
            event.preventDefault(); 
            const descriptionSection = document.getElementById('project-description-section');
            if (descriptionSection) descriptionSection.style.display = 'none'; // Hide about on drop
            if(aboutProjectButton) aboutProjectButton.textContent = 'About Lambda Gators';


            zone.classList.remove('drag-over-active');
            zone.querySelectorAll('.alligator.drag-over-active').forEach(el => el.classList.remove('drag-over-active'));

            const draggedFamilyId = event.dataTransfer.getData('text/plain');
            const draggedFamily = activeFamilies[draggedFamilyId];

            if (!draggedFamily) { 
                console.error("Drop Error: Could not find dragged family data for ID:", draggedFamilyId); 
                event.stopPropagation(); 
                return; 
            }

            const targetIsHungryAlligator = event.target.closest('.alligator:not(.old)');
            const targetAlligatorFamilyContainer = targetIsHungryAlligator ? targetIsHungryAlligator.closest('.family-container') : null;

            const functionFamilyContainerInZone = zone.id === 'function-display-area' ? zone.querySelector('.family-container') : null;
            const functionFamilyIdInZone = functionFamilyContainerInZone?.dataset.familyId;
            const functionFamilyInZone = functionFamilyIdInZone ? activeFamilies[functionFamilyIdInZone] : null;

            if (zone.id === 'function-display-area' && 
                targetIsHungryAlligator && 
                targetAlligatorFamilyContainer === functionFamilyContainerInZone && 
                functionFamilyInZone &&
                functionFamilyInZone.expression?.type === 'alligator' && 
                functionFamilyInZone.expression.isHungry) {
                
                performAnimatedApplication(functionFamilyInZone, draggedFamily, 'function-display-area', 'argument-staging-area')
                    .catch(err => console.error("Error during D&D animated application:", err));

            } else {
                const previousContainerId = draggedFamily.currentContainerId; 
                console.log(`Generic drop of ${draggedFamily.id} (from ${previousContainerId}) into ${zone.id}.`);
                
                renderFamilyToDOM(draggedFamily, zone.id);

                if (previousContainerId && previousContainerId !== zone.id) {
                    console.log(`Clearing out previous container: ${previousContainerId} after moving family ${draggedFamily.id} to ${zone.id}.`);
                    renderFamilyToDOM(null, previousContainerId);
                }
                updateAllUIDisplays(); 
            }
            
            event.stopPropagation(); 
            console.log("Drop event propagation stopped for zone:", zone.id); 
        });
    });

    initializeControls(); 
});
// --- End of Drag and Drop Logic ---