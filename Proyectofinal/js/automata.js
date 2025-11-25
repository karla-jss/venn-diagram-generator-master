document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('automata-canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvas-container');

    // Resize canvas to fit container
    // Resize canvas to fit container
    function resizeCanvas() {
        // Set a fixed minimum width or the container width, whichever is larger
        canvas.width = Math.max(container.clientWidth, 1100);
        canvas.height = container.clientHeight;
        drawAutomata();
    }
    window.addEventListener('resize', resizeCanvas);

    // Automaton Definition
    // Regex: /^[a-z]{2,4}[0-9]{2,3}@uni\.edu\.ni$/

    // States:
    // 0: Start
    // 1: 1 letter
    // 2: 2 letters (Valid start for numbers)
    // 3: 3 letters (Valid start for numbers)
    // 4: 4 letters (Max letters, must go to numbers)
    // 5: 1 number
    // 6: 2 numbers (Valid start for @)
    // 7: 3 numbers (Max numbers, must go to @)
    // 8: @
    // 9: u
    // 10: n
    // 11: i
    // 12: .
    // 13: e
    // 14: d
    // 15: u
    // 16: .
    // 17: n
    // 18: i (Final)

    const states = [
        { id: 0, label: 'Inicio', x: 50, y: 250 },
        { id: 1, label: 'L1', x: 120, y: 250 },
        { id: 2, label: 'L2', x: 190, y: 250 },
        { id: 3, label: 'L3', x: 260, y: 250 },
        { id: 4, label: 'L4', x: 330, y: 250 },
        { id: 5, label: 'N1', x: 400, y: 250 },
        { id: 6, label: 'N2', x: 470, y: 250 },
        { id: 7, label: 'N3', x: 540, y: 250 },
        { id: 8, label: '@', x: 610, y: 250 },
        { id: 9, label: 'u', x: 680, y: 250 },
        { id: 10, label: 'n', x: 750, y: 250 },
        { id: 11, label: 'i', x: 820, y: 250 },
        { id: 12, label: '.', x: 890, y: 250 },
        { id: 13, label: 'e', x: 960, y: 250 },
        { id: 14, label: 'd', x: 1030, y: 250 },
        { id: 15, label: 'u', x: 1100, y: 250 },
        { id: 16, label: '.', x: 1170, y: 250 },
        { id: 17, label: 'n', x: 1240, y: 250 },
        { id: 18, label: 'i', x: 1310, y: 250, isFinal: true }
    ];

    let activeState = 0;
    let path = [];
    let errorState = false;

    function drawNode(state, isActive) {
        ctx.beginPath();
        ctx.arc(state.x, state.y, 24, 0, 2 * Math.PI);
        ctx.fillStyle = isActive ? '#07eb1aff' : (errorState && isActive ? '#F44336' : '#fff');
        ctx.fill();
        ctx.strokeStyle = state.isFinal ? '#000' : '#333';
        ctx.lineWidth = state.isFinal ? 3 : 1;
        ctx.stroke();

        if (state.isFinal) {
            ctx.beginPath();
            ctx.arc(state.x, state.y, 12, 0, 2 * Math.PI);
            ctx.stroke();
        }

        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.label, state.x, state.y);
    }

    function drawEdge(from, to, label) {
        ctx.beginPath();
        ctx.moveTo(from.x + 18, from.y);
        ctx.lineTo(to.x - 18, to.y);
        ctx.strokeStyle = '#d600f7ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        ctx.beginPath();
        ctx.moveTo(to.x - 18, to.y);
        ctx.lineTo(to.x - 24, to.y - 3);
        ctx.lineTo(to.x - 24, to.y + 3);
        ctx.fill();
    }

    function drawAutomata() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw edges (simplified for visualization)
        for (let i = 0; i < states.length - 1; i++) {
            drawEdge(states[i], states[i + 1]);
        }

        // Special edges for variable length parts
        // L2 -> N1
        drawEdge(states[2], states[5]);
        // L3 -> N1
        drawEdge(states[3], states[5]);

        // N2 -> @
        drawEdge(states[6], states[8]);

        // Draw nodes
        states.forEach(state => {
            drawNode(state, state.id === activeState);
        });
    }

    function validateEmail(email) {
        activeState = 0;
        errorState = false;
        path = [0];

        let i = 0;

        // 1. Letters (2-4)
        let letterCount = 0;
        while (i < email.length && /[a-z]/.test(email[i])) {
            letterCount++;
            i++;
            if (letterCount > 4) {
                errorState = true;
                break;
            }
            activeState = letterCount; // 1, 2, 3, 4
            path.push(activeState);
        }

        if (letterCount < 2 || errorState) {
            errorState = true;
            drawAutomata();
            return false;
        }

        // 2. Numbers (2-3)
        let numberCount = 0;
        // Transition to number state base
        // If we are at state 2, 3, or 4, we move to 5 on first digit

        while (i < email.length && /[0-9]/.test(email[i])) {
            numberCount++;
            i++;
            if (numberCount > 3) {
                errorState = true;
                break;
            }
            activeState = 4 + numberCount; // 5, 6, 7
            path.push(activeState);
        }

        if (numberCount < 2 || errorState) {
            errorState = true;
            drawAutomata();
            return false;
        }

        // 3. Suffix @uni.edu.ni
        const suffix = "@uni.edu.ni";
        const remaining = email.substring(i);

        if (remaining === suffix) {
            // Animate through the suffix states
            let suffixStates = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
            // We just jump to final for simplicity in this synchronous check, 
            // but for visualization we might want to step through.
            // For now, let's just set active to 18 if valid.
            activeState = 18;
            drawAutomata();
            return true;
        } else {
            errorState = true;
            drawAutomata();
            return false;
        }
    }

    // Animation function to step through states
    async function animateValidation(email) {
        activeState = 0;
        errorState = false;
        drawAutomata();

        let i = 0;

        // Helper to wait
        const wait = ms => new Promise(r => setTimeout(r, ms));

        // Letters
        let letterCount = 0;
        while (i < email.length && /[a-z]/.test(email[i])) {
            await wait(500);
            letterCount++;
            if (letterCount > 4) {
                errorState = true;
                drawAutomata();
                return false;
            }
            activeState = letterCount;
            drawAutomata();
            i++;
        }

        if (letterCount < 2) {
            errorState = true;
            drawAutomata();
            return false;
        }

        // Numbers
        let numberCount = 0;
        while (i < email.length && /[0-9]/.test(email[i])) {
            await wait(500);
            numberCount++;
            if (numberCount > 3) {
                errorState = true;
                drawAutomata();
                return false;
            }
            activeState = 4 + numberCount; // 5, 6, 7
            drawAutomata();
            i++;
        }

        if (numberCount < 2) {
            errorState = true;
            drawAutomata();
            return false;
        }

        // Suffix
        const suffix = "@uni.edu.ni";
        const remaining = email.substring(i);

        for (let j = 0; j < remaining.length; j++) {
            await wait(300);
            if (j < suffix.length && remaining[j] === suffix[j]) {
                activeState = 8 + j;
                drawAutomata();
            } else {
                errorState = true;
                drawAutomata();
                return false;
            }
        }

        if (remaining.length === suffix.length) {
            return true;
        } else {
            errorState = true;
            drawAutomata();
            return false;
        }
    }

    document.getElementById('validate-btn').addEventListener('click', async () => {
        const email = document.getElementById('email-input').value;
        const resultP = document.getElementById('result-message');
        resultP.textContent = "Validando...";
        resultP.style.color = "blue";

        const isValid = await animateValidation(email);

        if (isValid) {
            resultP.textContent = "Correo Válido";
            resultP.style.color = "green";
        } else {
            resultP.textContent = "Correo Inválido";
            resultP.style.color = "red";
        }
    });

    resizeCanvas();
});
