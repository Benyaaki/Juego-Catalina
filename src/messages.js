// Objetivos del juego con sus mensajes específicos
export const gameTargets = [
    {
        type: 'choripan',
        message: 'Encontraste el delicioso choripán espacial supremo 🌭✨'
    },
    {
        type: 'lodin',
        message: 'Encontraste a Lodín, el perro salchicha guardián del universo 🐶💫'
    },
    {
        type: 'vino',
        message: 'Noooo, has encontrado el vino chileno a nivel cósmico 🍷🚀'
    },
    {
        type: 'antofagasta',
        message: 'Llegaste a Antofagasta… por favor huye ☀️🏜️'
    },
    {
        type: 'ticket',
        message: 'Wnnnn es el ticket de acceso completo a cualquier concierto de cualquier cantante (Milo J no se lo merece) 🎟️🎵'
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

