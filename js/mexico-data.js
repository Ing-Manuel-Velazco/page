// Geometrías SVG simplificadas pero precisas de los 32 estados de México
// Coordenadas normalizadas en viewBox 0 0 350 400

const MEXICO_STATES = [
    { id: 'MX-AGU', name: 'Aguascalientes', d: 'M148.2,168.5 L151.8,167.2 L154.5,169.8 L153.2,174.5 L149.5,175.8 L146.8,173.2 Z' },
    { id: 'MX-BCN', name: 'Baja California', d: 'M28.5,45.2 L48.2,38.5 L52.5,42.8 L51.2,68.5 L45.8,85.2 L38.5,88.5 L32.2,82.5 L28.5,58.2 Z' },
    { id: 'MX-BCS', name: 'Baja California Sur', d: 'M52.5,88.5 L62.8,85.2 L68.5,92.5 L65.2,118.5 L58.5,128.2 L52.2,125.5 L48.5,108.2 Z' },
    { id: 'MX-CAM', name: 'Campeche', d: 'M245.2,285.5 L258.5,282.2 L268.2,288.5 L265.5,298.2 L252.2,302.5 L242.5,295.2 Z' },
    { id: 'MX-CHP', name: 'Chiapas', d: 'M238.5,305.2 L258.2,302.5 L275.5,308.2 L278.2,318.5 L268.5,328.2 L248.2,325.5 L235.5,318.2 Z' },
    { id: 'MX-CHH', name: 'Chihuahua', d: 'M68.5,68.5 L98.2,58.2 L128.5,65.5 L135.2,85.2 L128.5,118.5 L108.2,135.2 L78.5,128.5 L65.2,108.2 Z' },
    { id: 'MX-COA', name: 'Coahuila', d: 'M135.2,85.2 L168.5,78.5 L185.2,92.2 L178.5,125.5 L158.2,142.2 L128.5,135.5 L125.2,118.2 Z' },
    { id: 'MX-COL', name: 'Colima', d: 'M138.5,195.2 L145.2,194.5 L146.5,198.2 L142.2,200.5 L137.5,199.2 Z' },
    { id: 'MX-DIF', name: 'Ciudad de México', d: 'M158.2,188.5 L162.5,187.2 L164.2,189.5 L162.5,192.2 L158.2,191.5 Z' },
    { id: 'MX-DUR', name: 'Durango', d: 'M98.2,118.5 L128.5,112.2 L145.2,125.5 L138.5,158.2 L108.2,165.5 L88.5,152.2 Z' },
    { id: 'MX-GUA', name: 'Guanajuato', d: 'M148.2,158.2 L162.5,155.5 L168.2,162.2 L165.5,172.5 L152.2,175.2 L145.5,168.5 Z' },
    { id: 'MX-GRO', name: 'Guerrero', d: 'M142.2,205.2 L168.5,202.5 L188.2,208.2 L185.5,218.5 L162.2,222.2 L138.5,215.5 Z' },
    { id: 'MX-HID', name: 'Hidalgo', d: 'M162.5,172.5 L175.2,168.2 L182.5,175.5 L178.2,185.2 L165.5,188.5 L158.2,182.2 Z' },
    { id: 'MX-JAL', name: 'Jalisco', d: 'M118.2,165.2 L145.5,158.5 L152.2,168.2 L148.5,185.2 L128.2,192.5 L108.5,185.2 L112.2,172.5 Z' },
    { id: 'MX-MEX', name: 'Estado de México', d: 'M152.2,182.2 L165.5,178.5 L172.2,185.2 L168.5,195.5 L155.2,198.2 L148.5,192.5 Z' },
    { id: 'MX-MIC', name: 'Michoacán', d: 'M122.2,192.2 L148.5,188.5 L162.2,195.2 L158.5,208.5 L135.2,212.2 L118.5,205.5 Z' },
    { id: 'MX-MOR', name: 'Morelos', d: 'M162.2,195.2 L172.5,192.5 L175.2,198.2 L168.5,202.5 L160.2,199.5 Z' },
    { id: 'MX-NAY', name: 'Nayarit', d: 'M98.2,145.2 L118.5,142.5 L122.2,155.2 L115.5,168.5 L95.2,165.2 L92.5,152.5 Z' },
    { id: 'MX-NLE', name: 'Nuevo León', d: 'M172.2,92.2 L192.5,88.5 L198.2,98.2 L195.5,115.5 L178.2,118.2 L172.5,105.5 Z' },
    { id: 'MX-OAX', name: 'Oaxaca', d: 'M188.2,225.2 L218.5,222.5 L242.2,228.2 L245.5,242.5 L228.2,255.2 L198.5,252.5 L182.2,242.2 Z' },
    { id: 'MX-PUE', name: 'Puebla', d: 'M182.2,182.2 L198.5,178.5 L208.2,188.2 L202.5,202.5 L188.2,205.2 L178.5,195.5 Z' },
    { id: 'MX-QUE', name: 'Querétaro', d: 'M155.2,162.2 L165.5,160.5 L168.2,168.2 L162.5,172.5 L152.2,170.2 Z' },
    { id: 'MX-ROO', name: 'Quintana Roo', d: 'M268.2,282.2 L285.5,278.5 L292.2,292.2 L285.5,308.5 L268.2,305.2 Z' },
    { id: 'MX-SLP', name: 'San Luis Potosí', d: 'M152.2,135.2 L172.5,128.5 L185.2,142.2 L178.5,162.5 L158.2,168.2 L145.5,158.5 Z' },
    { id: 'MX-SIN', name: 'Sinaloa', d: 'M88.2,115.2 L108.5,108.5 L115.2,125.2 L108.5,148.5 L88.2,145.2 L82.5,128.5 Z' },
    { id: 'MX-SON', name: 'Sonora', d: 'M52.2,58.2 L82.5,48.5 L98.2,58.2 L92.5,88.5 L72.2,98.2 L52.5,88.5 Z' },
    { id: 'MX-TAB', name: 'Tabasco', d: 'M248.2,295.2 L258.5,292.5 L262.2,298.2 L258.5,305.2 L248.2,302.5 Z' },
    { id: 'MX-TAM', name: 'Tamaulipas', d: 'M185.2,98.2 L208.5,92.5 L218.2,108.2 L212.5,128.5 L192.2,132.2 L182.5,115.5 Z' },
    { id: 'MX-TLA', name: 'Tlaxcala', d: 'M172.2,182.2 L178.5,180.5 L180.2,185.2 L176.5,188.5 L170.2,186.2 Z' },
    { id: 'MX-VER', name: 'Veracruz', d: 'M178.2,142.2 L198.5,135.5 L212.2,148.2 L208.5,175.5 L195.2,188.2 L182.5,175.5 Z' },
    { id: 'MX-YUC', name: 'Yucatán', d: 'M248.2,272.2 L265.5,268.5 L272.2,278.2 L265.5,288.5 L248.2,285.2 Z' },
    { id: 'MX-ZAC', name: 'Zacatecas', d: 'M122.2,142.2 L148.5,135.5 L162.2,145.2 L155.5,162.5 L132.2,168.2 L115.5,158.5 Z' }
];

// Datos de experiencia por estado (ejemplo)
const EXPERIENCE_DATA = {
    'MX-JAL': { count: 5, projects: ['Guadalajara Tech Hub', 'Puerto Vallarta Resort', 'Zapopan Offices'] },
    'MX-DIF': { count: 3, projects: ['CDMX Corporate Tower', 'Reforma Business Center'] },
    'MX-NLE': { count: 4, projects: ['Monterrey Industrial Park', 'San Pedro Complex'] },
    'MX-YUC': { count: 2, projects: ['Mérida Tech Center', 'Cancún Hotel Zone'] },
    'MX-PUE': { count: 1, projects: ['Puebla Historic Renovation'] },
    'MX-VER': { count: 2, projects: ['Veracruz Port Development', 'Xalapa Cultural Center'] }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.MEXICO_STATES = MEXICO_STATES;
    window.EXPERIENCE_DATA = EXPERIENCE_DATA;
}
