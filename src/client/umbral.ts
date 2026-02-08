// STATE
let selectedScenario: string | null = null;
let customInput = '';

// DATA
const DIAGNOSIS_DATA: Record<string, any> = {
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

export function initUmbral() {
    const appContainer = document.getElementById('el-umbral-app');
    if (!appContainer) return;

    // Attach event listeners via delegation
    appContainer.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        // Handle Card Selection (find closest .card)
        const card = target.closest('.card');
        if (card && appContainer.contains(card)) {
            const id = card.getAttribute('data-id');
            if (id) selectScenario(id);
        }

        // Handle Buttons
        if (target.closest('[data-action="go-phase-2"]')) {
            goToPhase2();
        }

        if (target.closest('[data-action="reset"]')) {
            resetApp();
        }

        if (target.closest('[data-action="copy"]')) {
            const btn = target.closest('[data-action="copy"]');
            const targetId = btn?.getAttribute('data-target');
            if (targetId) copyToClipboard(targetId);
        }
    });

    // Initialize state
    // We don't want to reset if it's already running or preserving state,
    // but for now let's assume a fresh start or simple navigation.
    // However, if we navigate away and back, Hono/Turbolinks might not re-run script tags unless we are careful.
    // Since this is init(), it's likely a fresh page load.
    // Ensure Phase 1 is active by default in HTML, but logic here confirms.
}

function selectScenario(id: string) {
    selectedScenario = id;
    const cards = document.querySelectorAll('#el-umbral-app .card');
    cards.forEach(c => c.classList.remove('selected'));

    const selectedCard = document.querySelector(`#el-umbral-app .card[data-id="${id}"]`);
    if (selectedCard) selectedCard.classList.add('selected');
}

function goToPhase2() {
    const customInputEl = document.getElementById('umbral-custom-input') as HTMLTextAreaElement;
    if (customInputEl) customInput = customInputEl.value;

    if (!selectedScenario && customInput.trim() === '') {
        alert("Por favor, selecciona un escenario o describe tu situación.");
        return;
    }

    if (!selectedScenario) selectedScenario = 'B'; // Default fallback

    document.getElementById('umbral-phase-1')?.classList.remove('active');
    document.getElementById('umbral-phase-2')?.classList.add('active');

    runScanner();
}

function runScanner() {
    const scannerText = document.getElementById('umbral-scanner-text');
    if (!scannerText) return;

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
    document.getElementById('umbral-phase-2')?.classList.remove('active');
    document.getElementById('umbral-phase-3')?.classList.add('active');

    renderResults();
}

function renderResults() {
    if (!selectedScenario) return;
    const data = DIAGNOSIS_DATA[selectedScenario];

    // 1. Shadow Map
    const shadowContent = document.getElementById('umbral-shadow-content');
    if (shadowContent) {
        shadowContent.innerHTML = `
            <p><strong>Arquetipo:</strong> ${data.shadow}</p>
            <p>${data.analysis}</p>
        `;
        if (customInput) {
            const p = document.createElement('p');
            const em = document.createElement('em');
            em.textContent = `Nota sobre tu entrada: "${customInput}" - Esto confirma la resistencia a enfrentar el núcleo del conflicto.`;
            p.appendChild(em);
            shadowContent.appendChild(p);
        }
    }

    // 2. Totem
    const totemPrompt = document.getElementById('umbral-totem-prompt');
    if (totemPrompt) {
        totemPrompt.innerText = `/imagine prompt: ${data.totemPrompt} --ar 16:9 --v 6.0`;
    }

    // 3. Decree
    const decreeScript = document.getElementById('umbral-decree-script');
    if (decreeScript) {
        decreeScript.innerText = `[ESCENA: Primer plano, luz tenue]

    "Respira hondo."

    (Pausa)

    "${data.decree}"

    (Repetir 3 veces con voz firme)

    "He cruzado el umbral."`;
    }
}

function resetApp() {
    selectedScenario = null;
    customInput = '';

    const customInputEl = document.getElementById('umbral-custom-input') as HTMLTextAreaElement;
    if (customInputEl) customInputEl.value = '';

    document.querySelectorAll('#el-umbral-app .card').forEach(c => c.classList.remove('selected'));

    document.getElementById('umbral-phase-3')?.classList.remove('active');
    document.getElementById('umbral-phase-2')?.classList.remove('active');
    document.getElementById('umbral-phase-1')?.classList.add('active');
}

function copyToClipboard(elementId: string) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const text = el.innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Copiado al portapapeles");
    });
}
