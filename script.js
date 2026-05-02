// Clase Graph: Implementa un grafo no dirigido usando lista de adyacencia
class Graph {
    constructor() {
        this.adjacencyList = {}; // personaId -> Set de amigos
        this.nodes = {}; // personaId -> datos de la persona
    }

    // Agregar un nodo (persona)
    addNode(personId, personData) {
        if (!this.adjacencyList[personId]) {
            this.adjacencyList[personId] = new Set();
            this.nodes[personId] = personData;
        }
    }

    // Agregar una arista (amistad) no dirigida
    addEdge(personId1, personId2) {
        if (this.adjacencyList[personId1] && this.adjacencyList[personId2]) {
            this.adjacencyList[personId1].add(personId2);
            this.adjacencyList[personId2].add(personId1);
        }
    }

    // Eliminar una arista
    removeEdge(personId1, personId2) {
        if (this.adjacencyList[personId1] && this.adjacencyList[personId2]) {
            this.adjacencyList[personId1].delete(personId2);
            this.adjacencyList[personId2].delete(personId1);
        }
    }

    // Obtener vecinos directos
    getNeighbors(personId) {
        return Array.from(this.adjacencyList[personId] || []);
    }

    // BFS para encontrar amigos de amigos y niveles
    bfs(startId, maxDepth = 2) {
        const visited = new Set();
        const queue = [{ id: startId, depth: 0 }];
        const levels = { 0: [startId], 1: [], 2: [] };

        visited.add(startId);

        while (queue.length > 0) {
            const { id, depth } = queue.shift();

            if (depth >= maxDepth) continue;

            for (const neighbor of this.getNeighbors(id)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push({ id: neighbor, depth: depth + 1 });
                    if (levels[depth + 1]) {
                        levels[depth + 1].push(neighbor);
                    }
                }
            }
        }

        return levels;
    }

    // DFS para encontrar componentes conexas (comunidades)
    dfs(startId, visited = new Set()) {
        visited.add(startId);
        const component = [startId];

        for (const neighbor of this.getNeighbors(startId)) {
            if (!visited.has(neighbor)) {
                component.push(...this.dfs(neighbor, visited));
            }
        }

        return component;
    }

    // Obtener todos los nodos
    getNodes() {
        return Object.keys(this.nodes);
    }

    // Obtener datos de un nodo
    getNodeData(personId) {
        return this.nodes[personId];
    }

    // Amigos en común entre dos personas
    getCommonFriends(personId1, personId2) {
        const friends1 = new Set(this.getNeighbors(personId1));
        const friends2 = new Set(this.getNeighbors(personId2));
        return [...friends1].filter(friend => friends2.has(friend));
    }
}

// Clase Recommendations: Usa heurística local para sugerir amistades
class Recommendations {
    constructor(graph) {
        this.graph = graph;
    }

    // Calcular puntaje de recomendación basado en múltiples criterios
    calculateScore(personId, candidateId) {
        let score = 0;
        const reasons = [];

        // 1. Amigos de amigos
        const friendsOfFriends = this.graph.bfs(personId, 2)[2] || [];
        if (friendsOfFriends.includes(candidateId)) {
            score += 3;
            reasons.push("amigo de amigo");
        }

        // 2. Comunidad en común
        const personData = this.graph.getNodeData(personId);
        const candidateData = this.graph.getNodeData(candidateId);
        if (personData.community === candidateData.community && personData.community) {
            score += 2;
            reasons.push("comunidad en común");
        }

        // 3. Hobbies compartidos
        const sharedHobbies = this.getSharedItems(personData.hobbies || [], candidateData.hobbies || []);
        if (sharedHobbies.length > 0) {
            score += sharedHobbies.length;
            reasons.push(`${sharedHobbies.length} hobby(s) compartido(s): ${sharedHobbies.join(', ')}`);
        }

        // 4. Deportes compartidos
        const sharedSports = this.getSharedItems(personData.sports || [], candidateData.sports || []);
        if (sharedSports.length > 0) {
            score += sharedSports.length;
            reasons.push(`${sharedSports.length} deporte(s) compartido(s): ${sharedSports.join(', ')}`);
        }

        // 5. Gustos/intereses compartidos
        const sharedTastes = this.getSharedItems(personData.tastes || [], candidateData.tastes || []);
        const sharedInterests = this.getSharedItems(personData.interests || [], candidateData.interests || []);
        const totalShared = sharedTastes.length + sharedInterests.length;
        if (totalShared > 0) {
            score += totalShared;
            reasons.push(`${totalShared} gusto(s)/interese(s) compartido(s)`);
        }

        // 6. Amigos en común
        const commonFriends = this.graph.getCommonFriends(personId, candidateId);
        if (commonFriends.length > 0) {
            score += commonFriends.length * 2;
            reasons.push(`${commonFriends.length} amigo(s) en común`);
        }

        return { score, reasons };
    }

    // Obtener items compartidos entre dos arrays
    getSharedItems(arr1, arr2) {
        return arr1.filter(item => arr2.includes(item));
    }

    // Generar recomendaciones para una persona
    getRecommendations(personId) {
        const recommendations = [];
        const allNodes = this.graph.getNodes();

        for (const candidateId of allNodes) {
            if (candidateId !== personId && !this.graph.getNeighbors(personId).includes(candidateId)) {
                const { score, reasons } = this.calculateScore(personId, candidateId);
                if (score > 0) {
                    recommendations.push({
                        personId: candidateId,
                        name: this.graph.getNodeData(candidateId).name,
                        score,
                        reasons
                    });
                }
            }
        }

        // Ordenar por puntaje descendente
        return recommendations.sort((a, b) => b.score - a.score);
    }
}

// Clase Storage: Maneja localStorage para persistir datos
class Storage {
    constructor() {
        this.KEY = 'red-amigos-grafos-data';
    }

    // Guardar datos en localStorage
    saveData(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error al guardar datos:', error);
        }
    }

    // Cargar datos desde localStorage
    loadData() {
        try {
            const data = localStorage.getItem(this.KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al cargar datos:', error);
            return null;
        }
    }

    // Limpiar datos
    clearData() {
        localStorage.removeItem(this.KEY);
    }
}

// Instancias globales
const graph = new Graph();
const recommendations = new Recommendations(graph);
const storage = new Storage();

// Datos de ejemplo
const sampleData = {
    nodes: [
        { id: '1', name: 'Ana', community: 'Estudiantes', hobbies: ['Lectura', 'Música'], sports: ['Fútbol'], tastes: ['Cine', 'Viajes'], interests: ['Programación', 'Matemáticas'] },
        { id: '2', name: 'Diego', community: 'Estudiantes', hobbies: ['Videojuegos', 'Deportes'], sports: ['Fútbol', 'Baloncesto'], tastes: ['Cine'], interests: ['Programación', 'Física'] },
        { id: '3', name: 'Carlos', community: 'Profesionales', hobbies: ['Cocina', 'Lectura'], sports: ['Tenis'], tastes: ['Arte', 'Viajes'], interests: ['Historia', 'Literatura'] },
        { id: '4', name: 'María', community: 'Estudiantes', hobbies: ['Música', 'Danza'], sports: ['Yoga'], tastes: ['Cine', 'Teatro'], interests: ['Arte', 'Psicología'] },
        { id: '5', name: 'Pedro', community: 'Profesionales', hobbies: ['Fotografía', 'Viajes'], sports: ['Ciclismo'], tastes: ['Naturaleza'], interests: ['Geografía', 'Fotografía'] },
        { id: '6', name: 'Laura', community: 'Estudiantes', hobbies: ['Lectura', 'Música'], sports: ['Natación'], tastes: ['Cine'], interests: ['Literatura', 'Historia'] },
        { id: '7', name: 'Juan', community: 'Profesionales', hobbies: ['Deportes', 'Videojuegos'], sports: ['Fútbol', 'Tenis'], tastes: ['Cine'], interests: ['Ingeniería', 'Deportes'] },
        { id: '8', name: 'Sofia', community: 'Estudiantes', hobbies: ['Arte', 'Música'], sports: ['Yoga'], tastes: ['Teatro', 'Viajes'], interests: ['Arte', 'Psicología'] }
    ],
    edges: [
        ['1', '2'], ['1', '4'], ['1', '6'],
        ['2', '4'], ['2', '7'],
        ['3', '5'], ['3', '7'],
        ['4', '6'], ['4', '8'],
        ['5', '7'],
        ['6', '8']
    ]
};

// Aplicación principal
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const personForm = document.getElementById('person-form');
    const friendshipForm = document.getElementById('friendship-form');
    const person1Select = document.getElementById('person1');
    const person2Select = document.getElementById('person2');
    const clearDataBtn = document.getElementById('clear-data');
    const restoreSampleBtn = document.getElementById('restore-sample');
    const graphSvg = d3.select('#graph-svg');
    const personDetails = document.getElementById('person-details');
    const directFriends = document.getElementById('direct-friends');
    const friendsOfFriends = document.getElementById('friends-of-friends');
    const commonFriends = document.getElementById('common-friends');
    const suggestionsList = document.getElementById('suggestions-list');

    let selectedPerson = null;
    let secondSelectedPerson = null;

    // Cargar datos iniciales
    loadInitialData();

    // Event listeners
    personForm.addEventListener('submit', addPerson);
    friendshipForm.addEventListener('submit', addFriendship);
    clearDataBtn.addEventListener('click', clearData);
    restoreSampleBtn.addEventListener('click', restoreSampleData);

    // Funciones principales
    function loadInitialData() {
        const savedData = storage.loadData();
        if (savedData) {
            loadGraphData(savedData);
        } else {
            loadGraphData(sampleData);
        }
        updateUI();
        renderGraph();
    }

    function loadGraphData(data) {
        // Limpiar grafo
        graph.adjacencyList = {};
        graph.nodes = {};

        // Agregar nodos
        data.nodes.forEach(node => {
            graph.addNode(node.id, node);
        });

        // Agregar aristas
        data.edges.forEach(edge => {
            graph.addEdge(edge[0], edge[1]);
        });
    }

    function addPerson(event) {
        event.preventDefault();
        const name = document.getElementById('name').value.trim();
        if (!name) return;

        const personData = {
            id: Date.now().toString(),
            name,
            community: document.getElementById('community').value.trim(),
            hobbies: document.getElementById('hobbies').value.split(',').map(h => h.trim()).filter(h => h),
            sports: document.getElementById('sports').value.split(',').map(s => s.trim()).filter(s => s),
            tastes: document.getElementById('tastes').value.split(',').map(t => t.trim()).filter(t => t),
            interests: document.getElementById('interests').value.split(',').map(i => i.trim()).filter(i => i)
        };

        graph.addNode(personData.id, personData);
        saveData();
        updateUI();
        renderGraph();
        personForm.reset();
    }

    function addFriendship(event) {
        event.preventDefault();
        const person1 = person1Select.value;
        const person2 = person2Select.value;
        if (person1 && person2 && person1 !== person2) {
            graph.addEdge(person1, person2);
            saveData();
            renderGraph();
            friendshipForm.reset();
        }
    }

    function clearData() {
        graph.adjacencyList = {};
        graph.nodes = {};
        storage.clearData();
        updateUI();
        renderGraph();
    }

    function restoreSampleData() {
        loadGraphData(sampleData);
        saveData();
        updateUI();
        renderGraph();
    }

    function saveData() {
        const data = {
            nodes: Object.values(graph.nodes),
            edges: Object.entries(graph.adjacencyList).flatMap(([id, friends]) =>
                Array.from(friends).filter(f => f > id).map(f => [id, f])
            )
        };
        storage.saveData(data);
    }

    function updateUI() {
        // Actualizar selects
        const nodes = graph.getNodes();
        const options = nodes.map(id => `<option value="${id}">${graph.getNodeData(id).name}</option>`).join('');
        person1Select.innerHTML = '<option value="">Seleccionar Persona 1</option>' + options;
        person2Select.innerHTML = '<option value="">Seleccionar Persona 2</option>' + options;
    }

    function renderGraph() {
        const width = 800;
        const height = 600;

        graphSvg.selectAll('*').remove();

        const nodes = graph.getNodes().map(id => ({ id, ...graph.getNodeData(id) }));
        const links = Object.entries(graph.adjacencyList).flatMap(([source, targets]) =>
            Array.from(targets).filter(target => source < target).map(target => ({ source, target }))
        );

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = graphSvg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', 'link');

        const node = graphSvg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', 20)
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }))
            .on('click', (event, d) => selectPerson(d.id));

        const labels = graphSvg.append('g')
            .selectAll('text')
            .data(nodes)
            .enter().append('text')
            .text(d => d.name)
            .attr('font-size', 12)
            .attr('dx', 25)
            .attr('dy', 5);

        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            labels
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
    }

    function selectPerson(personId) {
        if (selectedPerson === personId) {
            selectedPerson = null;
            secondSelectedPerson = null;
        } else if (selectedPerson && !secondSelectedPerson) {
            secondSelectedPerson = personId;
        } else {
            selectedPerson = personId;
            secondSelectedPerson = null;
        }

        updateDetails();
        renderGraph();
    }

    function updateDetails() {
        if (!selectedPerson) {
            personDetails.innerHTML = '';
            directFriends.innerHTML = '';
            friendsOfFriends.innerHTML = '';
            commonFriends.innerHTML = '';
            suggestionsList.innerHTML = '';
            return;
        }

        const personData = graph.getNodeData(selectedPerson);
        personDetails.innerHTML = `
            <p><strong>Nombre:</strong> ${personData.name}</p>
            <p><strong>Comunidad:</strong> ${personData.community || 'N/A'}</p>
            <p><strong>Hobbies:</strong> ${personData.hobbies?.join(', ') || 'N/A'}</p>
            <p><strong>Deportes:</strong> ${personData.sports?.join(', ') || 'N/A'}</p>
            <p><strong>Gustos:</strong> ${personData.tastes?.join(', ') || 'N/A'}</p>
            <p><strong>Intereses:</strong> ${personData.interests?.join(', ') || 'N/A'}</p>
        `;

        // Amigos directos
        const direct = graph.getNeighbors(selectedPerson);
        directFriends.innerHTML = direct.map(id => `<li>${graph.getNodeData(id).name}</li>`).join('');

        // Amigos de amigos
        const levels = graph.bfs(selectedPerson, 2);
        const fof = levels[2] || [];
        friendsOfFriends.innerHTML = fof.map(id => `<li>${graph.getNodeData(id).name}</li>`).join('');

        // Amigos en común
        if (secondSelectedPerson) {
            const common = graph.getCommonFriends(selectedPerson, secondSelectedPerson);
            commonFriends.innerHTML = common.map(id => `<li>${graph.getNodeData(id).name}</li>`).join('');
        } else {
            commonFriends.innerHTML = '<li>Selecciona otra persona para ver amigos en común</li>';
        }

        // Sugerencias
        const recs = recommendations.getRecommendations(selectedPerson);
        suggestionsList.innerHTML = recs.slice(0, 5).map(rec => `
            <li>
                <strong>${rec.name}</strong> (Puntaje: ${rec.score})<br>
                Razones: ${rec.reasons.join(', ')}
            </li>
        `).join('');
    }
});