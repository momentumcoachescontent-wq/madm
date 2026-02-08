// STATE
let selectedScenario = null;
let customInput = '';

// DOM ELEMENTS
const phase1 = document.getElementById('phase-1');
const phase2 = document.getElementById('phase-2');
const phase3 = document.getElementById('phase-3');
const scannerText = document.getElementById('scanner-text');

// DATA: "Más allá del Miedo" Knowledge Base
const DIAGNOSIS_DATA = {
    'A': {
        name: "El Trono del Mártir",
        shadow: "El Guardián del Sacrificio",
        analysis: "Tu bloqueo no es la carga que llevas, sino la identidad que has construido alrededor de ella. Al salvar a otros, evitas salvarte a ti mismo. Tu miedo secreto es ser irrelevante si no eres útil.",
        totemPrompt: "A weary king sitting on a throne made of heavy chains, holding the weight of a crumbling ceiling, dark cinematic lighting, hyper-realistic, symbol of self-imposed burden.",
        decree: "Renuncio a la arrogancia de creer que solo yo puedo sostener el mundo. Suelto la carga que no es mía. Mi valor no depende de mi sufrimiento. Soy libre de ser, no solo de hacer."
    },
    'B': {
        name: "La Niebla de Gas",
        shadow: "El Fantasma de la Duda",
        analysis: "Has entregado el timón de tu realidad. Tu sombra te susurra que tu percepción es defectuosa para mantenerte dependiente. El beneficio oculto es evitar la responsabilidad de tener la razón y actuar en consecuencia.",
        totemPrompt: "A silhouette standing in thick gray fog, mirrors surrounding them but showing distorted reflections, ominous atmosphere, abstract surrealism, psychological horror style.",
        decree: "Recupero mi juicio. Mi percepción es válida. Rompo el espejo de la distorsión. Confío en lo que veo, confío en lo que siento. La verdad es mi brújula y yo soy el capitán."
    },
    'C': {
        name: "La Jaula de Oro",
        shadow: "El Carcelero de la Comodidad",
        analysis: "Estás muriendo de seguridad. Tu sombra te ha convencido de que el exterior es demasiado peligroso. El beneficio oculto es no enfrentar la posibilidad del fracaso... ni la del éxito rotundo.",
        totemPrompt: "A golden birdcage with the door open, but the bird refuses to fly, looking at a stormy but magnificent sky outside, dramatic contrast, high detail, metaphorical art.",
        decree: "La seguridad es una ilusión. Elijo la vida sobre la supervivencia. Abro mis alas no porque no tenga miedo, sino porque mi vuelo es más grande que mi jaula. Acepto el riesgo de brillar."
    }
};

// FUNCTIONS

function selectScenario(id) {
    selectedScenario = id;
    
    // Visual feedback
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    // Find the card that was clicked (this is a bit hacky but works for simple structure)
    // Actually, let's just use the index logic since we know the order A, B, C
    const index = id === 'A' ? 0 : id === 'B' ? 1 : 2;
    document.querySelectorAll('.card')[index].classList.add('selected');
}

function goToPhase2() {
    customInput = document.getElementById('custom-input').value;
    
    if (!selectedScenario && customInput.trim() === '') {
        alert("Por favor, selecciona un escenario o describe tu situación.");
        return;
    }

    // Default to A if only text is provided, or analyze text (simplified for this demo)
    if (!selectedScenario) selectedScenario = 'B'; // Default fallback

    phase1.classList.remove('active');
    phase2.classList.add('active');

    runScanner();
}

function runScanner() {
    const steps = [
        "Iniciando enlace neural...",
        "Escaneando micro-expresiones...",
        "Detectando patrones de evitación...",
        "Cruzando datos con 'Más allá del Miedo'...",
        "Identificando la Sombra Predominante..."
    ];

    let i = 0;
    const interval = setInterval(() => {
        scannerText.innerText = steps[i];
        i++;
        if (i >= steps.length) {
            clearInterval(interval);
            setTimeout(goToPhase3, 1000);
        }
    }, 800);
}

function goToPhase3() {
    phase2.classList.remove('active');
    phase3.classList.add('active');
    
    renderResults();
}

function renderResults() {
    const data = DIAGNOSIS_DATA[selectedScenario];
    
    // 1. Shadow Map
    const shadowContent = document.getElementById('shadow-content');
    shadowContent.innerHTML = `
        <p><strong>Arquetipo:</strong> ${data.shadow}</p>
        <p>${data.analysis}</p>
        ${customInput ? `<p><em>Nota sobre tu entrada: "${customInput}" - Esto confirma la resistencia a enfrentar el núcleo del conflicto.</em></p>` : ''}
    `;

    // 2. Totem
    document.getElementById('totem-prompt').innerText = `/imagine prompt: ${data.totemPrompt} --ar 16:9 --v 6.0`;

    // 3. Decree
    document.getElementById('decree-script').innerText = `[ESCENA: Primer plano, luz tenue]
    
    "Respira hondo."
    
    (Pausa)
    
    "${data.decree}"
    
    (Repetir 3 veces con voz firme)
    
    "He cruzado el umbral."`;
}

function resetApp() {
    selectedScenario = null;
    customInput = '';
    document.getElementById('custom-input').value = '';
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    
    phase3.classList.remove('active');
    phase1.classList.add('active');
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Copiado al portapapeles");
    });
}
