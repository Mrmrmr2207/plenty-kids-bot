const { Client, Buttons, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Lógica para el Modo de Mantenimiento
if (process.env.MAINTENANCE_MODE === 'ON') {
    console.log('🚧 El bot está en mantenimiento temporalmente. 🛠️');
    console.log('🔒 Finalizando el proceso para evitar que el bot se ejecute.');
    process.exit(0);
}

let tono = 'Amistoso'; // Tono por defecto

const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

console.log('✅ Puppeteer configurado correctamente.');

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Escanea este QR con tu WhatsApp para vincular el bot.');
});

client.on('ready', () => {
    const modo = (process.env.MODE || 'BASICO').trim().toUpperCase();
    console.log(`🟡 Variable de entorno 'MODE': ${modo}`);

    let emoji = '🦆';

    if (modo === 'PRO') {
        emoji = '❤️';
    } else if (modo === 'LEGENDARIO') {
        emoji = '💜';
    }

    client.sendMessage(process.env.PHONE_NUMBER || '1234567890', `✅ ${emoji} ¡El BOT ha sido ENCENDIDO en modo ${modo}!`);
    console.log(`✅ ${emoji} ¡Bot conectado en modo ${modo}!`);
});

client.on('message', async (message) => {
    if (process.env.MAINTENANCE_MODE === 'ON') {
        return message.reply('⚠️ El bot está en mantenimiento temporalmente. Vuelve pronto. 🚧');
    }

    const texto = message.body.toLowerCase();
    const modo = (process.env.MODE || 'BASICO').trim().toUpperCase();

    if (texto.includes('santipiernero')) {
        await message.reply(`🔧 ¿Qué tono quieres usar?
1️⃣ Formal 🧐
2️⃣ Amistoso 😎
3️⃣ Gracioso 😂

Escribe el número de tu elección.`);
        client.on('message', async (msg) => {
            if (['1', '2', '3'].includes(msg.body)) {
                if (msg.body === '1') tono = 'Formal';
                if (msg.body === '2') tono = 'Amistoso';
                if (msg.body === '3') tono = 'Gracioso';
                await msg.reply(`✅ Tono cambiado a **${tono}**`);
                await msg.reply(`¿En qué modo quieres trabajar?
1️⃣ BASICO 🦆
2️⃣ PRO ❤️
3️⃣ LEGENDARIO 💜

Escribe el número de tu elección.`);
            } else if (['1', '2', '3'].includes(msg.body)) {
                if (msg.body === '1') process.env.MODE = 'BASICO';
                if (msg.body === '2') process.env.MODE = 'PRO';
                if (msg.body === '3') process.env.MODE = 'LEGENDARIO';
                await msg.reply(`✅ Modo cambiado a **${process.env.MODE}**`);
            }
        });
        return;
    }

    if (texto.includes('precio')) {
        message.reply('El precio de LA PLENTY KIT es $90.000 COP e incluye envío gratis. 🚀💜');
    } else if (texto.includes('información')) {
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
    } else if (texto.includes('comprar') || texto.includes('adquirir')) {
        message.reply('Puedes adquirir tu PLENTY KIT visitando el sitio web: cursos.goplenty.net 🌐');
    } else if (texto.includes('humano')) {
        message.reply('Ahora te voy a transferir con un humano para que te ayude mejor. Tranquilo, esta persona sabe todo lo que necesitas saber. 😎');
    } else if (texto.includes('pdf')) {
        const pdf = MessageMedia.fromFilePath('./material.pdf');
        await message.reply(pdf);
    } else {
        if (modo === 'LEGENDARIO') {
            message.reply('🤩 Esa es una gran pregunta. ¿Qué tal si te explico más sobre cómo **LA PLENTY KIT** puede ayudar a tus hijos a desarrollar habilidades sorprendentes?');
        } else {
            message.reply('¿En qué más puedo ayudarte? 😊');
        }
    }
});

// Lógica de Reconexión Automática
client.on('disconnected', async (reason) => {
    console.log(`❗ Bot desconectado. Motivo: ${reason}. Intentando reconectar en 10 segundos...`);
    client.sendMessage(process.env.PHONE_NUMBER || '1234567890', '❌ El BOT ha sido APAGADO temporalmente. 🚨');
    setTimeout(() => {
        client.initialize().catch(err => {
            console.error('❌ Error al reiniciar el bot:', err);
        });
    }, 10000); // Espera 10 segundos antes de intentar reconectar
});

// Inicialización del Bot
client.initialize().catch(err => {
    console.error('❌ Error al inicializar el cliente:', err);
});


