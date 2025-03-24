const { Client, Buttons, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Modo de Mantenimiento
if (process.env.MAINTENANCE_MODE === 'ON') {
    console.log('🚧 El bot está en mantenimiento temporalmente. 🛠️');
    process.exit(0);
}

// Configuración del Cliente
const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth({ dataPath: process.env.SESSION_PATH || './session' })
});

console.log('✅ Puppeteer configurado correctamente.');

// Generación del QR
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📲 Escanea este QR con tu WhatsApp para vincular el bot.');
});

// Conexión Exitosa
client.on('ready', async () => {
    const modo = (process.env.MODE || 'BASICO').trim().toUpperCase();
    console.log(`🟡 Variable de entorno 'MODE': ${modo}`);
    console.log(`✅ 🦆 ¡Bot conectado en modo ${modo}!`);
});

// Variables para guardar configuración
tipoDeModo = "BASICO";
tipoDeTono = "FRIENDLY";

// Manejo de Mensajes
client.on('message', async (message) => {
    if (process.env.MAINTENANCE_MODE === 'ON') {
        return message.reply('⚠️ El bot está en mantenimiento temporalmente. Vuelve pronto. 🚧');
    }

    const texto = message.body.toUpperCase();

    if (texto.includes('ACTIVARBOT')) {
        message.reply(`🎯 Hola, gracias por activar el bot. Para configurarme escribe algo así:
➡️ *MODOBASICO* o *MODOLEGENDARIO*
➡️ *TONOFRIENDLY* o *TONOPROFESSIONAL*
¡Y listo! El equipo de Plenty 💜`);
        return;
    }

    if (texto.includes('MODO')) {
        if (texto.includes('MODOBASICO')) tipoDeModo = "BASICO";
        else if (texto.includes('MODOPRO')) tipoDeModo = "PRO";
        else if (texto.includes('MODOLEGENDARIO')) tipoDeModo = "LEGENDARIO";
        else message.reply('⚠️ Modo no reconocido. Escribe: *MODOBASICO*, *MODOPRO* o *MODOLEGENDARIO*.');
    }

    if (texto.includes('TONO')) {
        if (texto.includes('TONOFRIENDLY')) tipoDeTono = "FRIENDLY";
        else if (texto.includes('TONOPROFESSIONAL')) tipoDeTono = "PROFESSIONAL";
        else if (texto.includes('TONOEMOTIONAL')) tipoDeTono = "EMOTIONAL";
        else message.reply('⚠️ Tono no reconocido. Escribe: *TONOFRIENDLY*, *TONOPROFESSIONAL* o *TONOEMOTIONAL*.');
    }

    if (texto.includes('MODO') || texto.includes('TONO')) {
        message.reply(`✅ *Configuración exitosa:*
🔥 **Modo:** ${tipoDeModo}
🎵 **Tono:** ${tipoDeTono}
Ahora puedes interactuar libremente. 😊`);
    }

    // Respuestas a triggers básicos
    if (texto.includes('PRECIO')) {
        message.reply('El precio de LA PLENTY KIT es $90.000 COP e incluye envío gratis. 🚀💜');
    } else if (texto.includes('INFORMACIÓN')) {
        const botones = new Buttons(
            '¿Quieres más información detallada o cómo adquirirlo?',
            [
                { body: '💡 Más Información' },
                { body: '🛒 Cómo Comprar' },
                { body: '📞 Hablar con un Humano' }
            ],
            '¿En qué te puedo ayudar?',
            'Elige una opción:'
        );
        await message.reply(botones);
    } else if (texto.includes('COMPRAR') || texto.includes('ADQUIRIR')) {
        message.reply('Puedes adquirir tu PLENTY KIT visitando el sitio web: cursos.goplenty.net 🌐');
    } else {
        message.reply('¿En qué más puedo ayudarte? 😊');
    }
});

// Reconexión Automática
client.on('disconnected', async (reason) => {
    console.log(`❗ Bot desconectado. Motivo: ${reason}. Intentando reconectar en 10 segundos...`);
    setTimeout(() => {
        client.initialize().catch(err => {
            console.error('❌ Error al reiniciar el bot:', err);
        });
    }, 10000);
});

// Inicialización del Bot
client.initialize().catch(err => {
    console.error('❌ Error al inicializar el cliente:', err);
});
