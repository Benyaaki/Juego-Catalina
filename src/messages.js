// Objetivos del juego con sus mensajes específicos
export const gameTargets = [
    {
        type: 'choripan',
        message: 'Encontraste el choripán espacial supremo… cuidado, este te deja repitiendo en 3 galaxias distintas'
    },
    {
        type: 'lodin',
        message: 'Encontraste a Lodín, el perro salchicha guardián del universo 🐶💫'
    },
    {
        type: 'vino',
        message: 'Noooo… hallaste el vino chileno pero nivel interplanetario. Con una tonta copita estai pa mear a la abuela de la Nustas'
    },
    {
        type: 'antofagasta',
        message: 'Llegaste a Antofagasta… cuidado con los peruanos (Tu gente)'
    },
    {
        type: 'ticket',
        message: 'Pase libre pa’ cualquier concierto… excepto pa’ Milo J porque no estamos pa’ hueás.'
    },
    {
        type: 'odin',
        message: '¡Rescataste a Odín! El diente malvado ha sido derrotado 🐶💫'
    }
];

export function getTargetMessage(type) {
    const target = gameTargets.find(t => t.type === type);
    return target ? target.message : 'Objetivo encontrado!';
}

// Mensajes de humor absurdo para cuando se encuentra un perrito (mantenidos por compatibilidad)
export const birthdayMessages = [
    "Un perrito galáctico acaba de decretar que tu cumpleaños es feriado universal.",
    "Un choripán cósmico te eligió como Presidenta del Sistema Solar.",
    "La Luna Salchicha informa que ya orbitó 32 veces en tu honor.",
    "Vino chileno interdimensional detectado. Catalina, proceda a brindar.",
    "Confirmado por la NASA: tienes la sonrisa que desplaza galaxias."
];

export function getRandomMessage() {
    const randomIndex = Math.floor(Math.random() * birthdayMessages.length);
    return birthdayMessages[randomIndex];
}

