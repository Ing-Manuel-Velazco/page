/**
 * Mapa Interactivo de México - Implementación Profesional
 * Renderizado SVG con zoom, pan y tooltips modernos
 */

document.addEventListener('DOMContentLoaded', () => {
    initMexicoMap();
});

function initMexicoMap() {
    const wrapper = document.getElementById('mexico-map-wrapper');
    if (!wrapper || typeof MEXICO_STATES === 'undefined') {
        console.error('No se pudo inicializar el mapa de México');
        return;
    }

    // Estado inicial del mapa
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY;
    const minScale = 1;
    const maxScale = 8;

    // Crear SVG
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 350 400");
    svg.setAttribute("class", "mexico-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Mapa interactivo de México mostrando experiencias de campo por estado");

    // Grupo principal para transformaciones
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "map-content");
    svg.appendChild(g);

    // Renderizar cada estado
    MEXICO_STATES.forEach(state => {
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", state.d);
        path.setAttribute("id", state.id);
        path.setAttribute("class", "state-path");
        
        // Verificar si tiene experiencia
        const hasExp = EXPERIENCE_DATA && EXPERIENCE_DATA[state.id];
        if (hasExp) {
            path.classList.add('has-experience');
        }
        
        // Datos para tooltip
        path.setAttribute("data-name", state.name);
        path.setAttribute("data-info", hasExp ? JSON.stringify(hasExp) : '');

        // Event listeners
        path.addEventListener('mouseenter', (e) => showTooltip(e, state.name, hasExp));
        path.addEventListener('mousemove', moveTooltip);
        path.addEventListener('mouseleave', hideTooltip);
        path.addEventListener('click', () => selectState(state.id, state.name));
        path.addEventListener('focus', () => path.classList.add('focused'));
        path.addEventListener('blur', () => path.classList.remove('focused'));

        g.appendChild(path);
    });

    // Agregar etiquetas de texto para estados principales
    const labels = [
        { id: 'MX-SON', x: 65, y: 75, text: 'Sonora' },
        { id: 'MX-CHH', x: 95, y: 95, text: 'Chihuahua' },
        { id: 'MX-COA', x: 155, y: 105, text: 'Coahuila' },
        { id: 'MX-NLE', x: 185, y: 105, text: 'N.L.' },
        { id: 'MX-TAM', x: 195, y: 115, text: 'Tamps.' },
        { id: 'MX-SIN', x: 95, y: 130, text: 'Sinaloa' },
        { id: 'MX-DUR', x: 115, y: 140, text: 'Durango' },
        { id: 'MX-ZAC', x: 135, y: 155, text: 'Zacatecas' },
        { id: 'MX-JAL', x: 125, y: 175, text: 'Jalisco' },
        { id: 'MX-DIF', x: 160, y: 190, text: 'CDMX' },
        { id: 'MX-PUE', x: 195, y: 190, text: 'Puebla' },
        { id: 'MX-VER', x: 190, y: 165, text: 'Veracruz' },
        { id: 'MX-OAX', x: 210, y: 235, text: 'Oaxaca' },
        { id: 'MX-CHP', x: 250, y: 315, text: 'Chiapas' },
        { id: 'MX-YUC', x: 260, y: 280, text: 'Yucatán' },
        { id: 'MX-ROO', x: 280, y: 295, text: 'Q.Roo' }
    ];

    labels.forEach(lbl => {
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", lbl.x);
        text.setAttribute("y", lbl.y);
        text.setAttribute("class", "state-label");
        text.setAttribute("data-state", lbl.id);
        text.textContent = lbl.text;
        g.appendChild(text);
    });

    // Limpiar y agregar al DOM
    wrapper.innerHTML = '';
    wrapper.appendChild(svg);

    // Función de actualización de transformación
    function updateTransform() {
        g.setAttribute("transform", `translate(${translateX}, ${translateY}) scale(${scale})`);
        
        // Actualizar etiquetas para que sean legibles
        const labels = g.querySelectorAll('.state-label');
        const apparentSize = Math.max(10, Math.min(10 * Math.sqrt(scale), 14));
        const fontSize = apparentSize / scale;
        labels.forEach(label => {
            label.setAttribute("font-size", fontSize.toFixed(2));
        });
    }

    // Controles de zoom
    function zoomIn() {
        const newScale = Math.min(scale * 1.3, maxScale);
        const centerX = wrapper.clientWidth / 2;
        const centerY = wrapper.clientHeight / 2;
        
        // Zoom hacia el centro
        translateX = centerX - (centerX - translateX) * (newScale / scale);
        translateY = centerY - (centerY - translateY) * (newScale / scale);
        scale = newScale;
        
        updateTransform();
    }

    function zoomOut() {
        const newScale = Math.max(scale / 1.3, minScale);
        const centerX = wrapper.clientWidth / 2;
        const centerY = wrapper.clientHeight / 2;
        
        // Zoom hacia el centro
        translateX = centerX - (centerX - translateX) * (newScale / scale);
        translateY = centerY - (centerY - translateY) * (newScale / scale);
        scale = newScale;
        
        // Resetear posición si estamos en zoom mínimo
        if (scale === minScale) {
            translateX = 0;
            translateY = 0;
        }
        
        updateTransform();
    }

    function resetMap() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    }

    // Event listeners para controles
    document.getElementById('zoom-in')?.addEventListener('click', zoomIn);
    document.getElementById('zoom-out')?.addEventListener('click', zoomOut);
    document.getElementById('reset-map')?.addEventListener('click', resetMap);

    // Zoom con rueda del mouse
    svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(minScale, Math.min(scale * delta, maxScale));
        
        // Zoom hacia el cursor
        translateX = mouseX - (mouseX - translateX) * (newScale / scale);
        translateY = mouseY - (mouseY - translateY) * (newScale / scale);
        scale = newScale;
        
        if (scale === minScale) {
            translateX = 0;
            translateY = 0;
        }
        
        updateTransform();
    }, { passive: false });

    // Pan con mouse
    svg.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'path' || e.target.tagName === 'text') return;
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        svg.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        
        // Límites de desplazamiento
        const limit = 150 * scale;
        translateX = Math.max(-limit, Math.min(limit, translateX));
        translateY = Math.max(-limit, Math.min(limit, translateY));
        
        updateTransform();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        svg.style.cursor = 'grab';
    });

    // Touch support para móviles
    let lastTouchDistance = 0;
    
    svg.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        } else if (e.touches.length === 2) {
            lastTouchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    });

    svg.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateTransform();
        } else if (e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = distance / lastTouchDistance;
            const newScale = Math.max(minScale, Math.min(scale * delta, maxScale));
            
            const centerX = wrapper.clientWidth / 2;
            const centerY = wrapper.clientHeight / 2;
            translateX = centerX - (centerX - translateX) * (newScale / scale);
            translateY = centerY - (centerY - translateY) * (newScale / scale);
            scale = newScale;
            lastTouchDistance = distance;
            updateTransform();
        }
    });

    svg.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Tooltip
    const tooltip = document.getElementById('map-tooltip');
    
    function showTooltip(e, name, data) {
        if (!tooltip) return;
        tooltip.style.opacity = '1';
        tooltip.innerHTML = `<strong>${name}</strong>${data ? '<br><small>' + data.projects.join(', ') + '</small>' : ''}`;
        moveTooltip(e);
    }

    function moveTooltip(e) {
        if (!tooltip) return;
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left + 15;
        const y = e.clientY - rect.top + 15;
        
        // Evitar que el tooltip salga del contenedor
        const maxX = rect.width - tooltip.offsetWidth - 10;
        const maxY = rect.height - tooltip.offsetHeight - 10;
        
        tooltip.style.left = `${Math.min(x, maxX)}px`;
        tooltip.style.top = `${Math.min(y, maxY)}px`;
    }

    function hideTooltip() {
        if (!tooltip) return;
        tooltip.style.opacity = '0';
    }

    // Selección de estado
    function selectState(id, name) {
        console.log(`Estado seleccionado: ${name} (${id})`);
        
        // Resaltar estado seleccionado
        document.querySelectorAll('.state-path').forEach(p => p.classList.remove('selected'));
        const selectedPath = document.getElementById(id);
        if (selectedPath) {
            selectedPath.classList.add('selected');
        }
        
        // Filtrar experiencias si existe la función
        if (window.filterExperiencesByState) {
            window.filterExperiencesByState(id);
        }
    }

    // Inicializar transformación
    updateTransform();
}
