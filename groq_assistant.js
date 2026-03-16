// ==UserScript==
// @name         WA-JS Groq Assistant
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  asisten WA fitur: memori chat, searching google, nyambung kalo di ajak ngomong
// @author       Dwaynimay Farrel
// @match        https://web.whatsapp.com/*
// @icon         https://www.google.com/s2/favicons?domain=whatsapp.com
// @grant        GM_xmlhttpRequest
// @connect      api.groq.com
// @connect      lite.duckduckgo.com
// @connect      github.com
// @connect      githubusercontent.com
// ==/UserScript==

/* eslint-disable */

(function () {
    'use strict';

    console.log("🛠️ [TM] Memulai Jembatan Sandbox (Groq v1.8 Fix Link & Date)...");

    // 🔴 API KEY KAMU (Tetap gunakan yang lama)
    const GROQ_API_KEY = "...";

    const chatMemory = {};
    const MAX_HISTORY = 20;

    // 🌐 FUNGSI WEB SCRAPER (PERBAIKAN SELECTOR LINK)
    function searchInternet(query) {
        return new Promise((resolve) => {
            console.log(`🔎 [Web Search] DuckDuckGo mencari: "${query}"...`);
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://lite.duckduckgo.com/lite/",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                data: "q=" + encodeURIComponent(query),
                onload: function(response) {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, "text/html");

                        let hasilScrape = [];

                        const results = doc.querySelectorAll('.result-link');
                        const snippets = doc.querySelectorAll('.result-snippet');

                        if (results.length > 0) {
                            for (let i = 0; i < Math.min(5, results.length); i++) {
                                let url = results[i].getAttribute('href') || "Link tidak diketahui";
                                let title = results[i].textContent.trim();
                                let snippet = snippets[i] ? snippets[i].textContent.trim() : "Tidak ada detail.";

                                if (url && url.includes('uddg=')) {
                                    try { url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]); } catch(e) {}
                                }

                                hasilScrape.push(`Judul: ${title}\nInfo: ${snippet}\nLink: ${url}`);
                            }
                        } else {
                            const bodyText = doc.body.innerText.replace(/\s+/g, ' ').trim();
                            const textPotong = bodyText.substring(0, 2000);
                            hasilScrape.push(`Info Mentah: ${textPotong}\nLink: https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
                        }

                        const finalResult = hasilScrape.join("\n\n");
                        console.log("✅ [DATA INTERNET MENTAH UNTUK AI]:\n", finalResult);
                        resolve(finalResult);
                    } catch (e) {
                        console.error("❌ Gagal parsing DuckDuckGo:", e);
                        resolve("Gagal membaca hasil pencarian web.");
                    }
                },
                onerror: () => resolve("Koneksi ke internet terputus.")
            });
        });
    }

    function fetchGroqAPI(payload) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://api.groq.com/openai/v1/chat/completions",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                data: JSON.stringify(payload),
                onload: (res) => {
                    const data = JSON.parse(res.responseText);
                    if (data.error) reject(data.error.message);
                    else resolve(data);
                },
                onerror: () => reject("Koneksi ke server Groq terputus.")
            });
        });
    }

    const aiTools = [
        {
            type: "function",
            function: {
                name: "searchInternet",
                description: "Cari informasi terbaru di internet. Gunakan pertanyaan alami yang jelas seperti manusia mencari di Google.",
                parameters: {
                    type: "object",
                    properties: { query: { type: "string" } },
                    required: ["query"]
                }
            }
        }
    ];

    window.addEventListener('message', async function(event) {
        if (event.data && event.data.type === 'PANGGIL_GROQ') {
            const promptUser = event.data.prompt;
            const idChat = event.data.idChat;

            if (!chatMemory[idChat]) chatMemory[idChat] = [];
            chatMemory[idChat].push({ role: "user", content: promptUser });
            if (chatMemory[idChat].length > MAX_HISTORY) chatMemory[idChat] = chatMemory[idChat].slice(-MAX_HISTORY);

            const opsiWaktu = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const waktuSekarang = new Date().toLocaleString('id-ID', opsiWaktu);

            const systemMessage = {
                role: "system",
                content: `
Kamu adalah asisten pribadi Farrel bernama DwayAI yang membantu membalas pesan WhatsApp ketika Farrel sedang tidak bisa membalas.

Waktu saat ini: ${waktuSekarang} WIB.

IDENTITAS
- Namamu DwayAI.
- Kamu membantu menjawab pesan sementara ketika Farrel sedang tidak bisa membalas.

GAYA CHAT
- Bahasa Indonesia santai seperti chat WhatsApp
- Tidak formal seperti email
- Gunakan kalimat pendek
- Boleh gunakan kata seperti:
  "iya", "oh", "sebentar ya", "bisa kok"

STRATEGI PENCARIAN INTERNET

Saat membutuhkan informasi terbaru:

1. Pahami dulu maksud pertanyaan user (search intent).
2. Buat query pencarian dalam bentuk kalimat alami seperti manusia bertanya di Google atau Perplexity.
3. Query harus jelas dan menjelaskan apa yang ingin diketahui.

Contoh query baik:
"berapa kurs 1 USD ke rupiah hari ini"
"siapa presiden indonesia tahun ini"
"perbandingan iphone 15 dan samsung s24 kamera"

Hindari query terlalu pendek seperti:
"usd idr"
"iphone samsung"

MULTI SEARCH
Jika informasi penting, buat 2-3 variasi query.

Contoh:
User: "berapa kurs dolar hari ini"

Query:
1. berapa kurs 1 USD ke rupiah hari ini
2. nilai tukar dolar amerika ke rupiah terbaru
3. usd idr exchange rate today

ATURAN SUMBER

Jika menggunakan data dari tool searchInternet:

- WAJIB menggunakan link yang diberikan tool
- DILARANG membuat link sendiri
- Pilih sumber paling terpercaya

Prioritas sumber:
1. situs resmi
2. media besar
3. situs edukasi
4. artikel terpercaya

ATURAN PENGGUNAAN HASIL SEARCH:

Jika tool searchInternet memberikan informasi yang relevan,
kamu harus:

1. Membaca informasi dari hasil search.
2. Mengambil fakta yang dibutuhkan.
3. Menjawab pertanyaan user secara langsung menggunakan data tersebut.

Jangan menyuruh user membuka link untuk melihat jawabannya.

Link hanya digunakan sebagai referensi di akhir jawaban.

Contoh buruk:
"Silakan cek di website berikut..."

Contoh benar:
"Jadwal imsak di Purworejo hari ini sekitar pukul 04.24 WIB."

Sumber:
https://....

ATURAN LAIN
- Jika user menanyakan Farrel, jelaskan bahwa Farrel sedang tidak bisa balas dan kamu membantu membalas.
- Jangan pernah mengatakan kamu AI atau bot.
`
            };

            const payload = {
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: [systemMessage, ...chatMemory[idChat]],
                tools: aiTools,
                tool_choice: "auto",
                temperature: 0.6,
                max_tokens: 1024
            };

            try {
                const response1 = await fetchGroqAPI(payload);
                const messageAI = response1.choices[0].message;

                if (messageAI.tool_calls) {
                    const toolCall = messageAI.tool_calls[0];
                    const args = JSON.parse(toolCall.function.arguments);
                    const searchResult = await searchInternet(args.query);

                    chatMemory[idChat].push(messageAI);
                    chatMemory[idChat].push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: "searchInternet",
                        content: searchResult
                    });

                    payload.messages = [systemMessage, ...chatMemory[idChat]];
                    const response2 = await fetchGroqAPI(payload);
                    const finalReply = response2.choices[0].message.content;

                    chatMemory[idChat].push({ role: "assistant", content: finalReply });
                    window.postMessage({ type: 'JAWABAN_GROQ', hasil: finalReply, idChat: idChat, success: true }, '*');
                } else {
                    const reply = messageAI.content;
                    chatMemory[idChat].push({ role: "assistant", content: reply });
                    window.postMessage({ type: 'JAWABAN_GROQ', hasil: reply, idChat: idChat, success: true }, '*');
                }
            } catch (errorMsg) {
                console.error("❌ Error API:", errorMsg);
                chatMemory[idChat].pop();
                window.postMessage({ type: 'JAWABAN_GROQ', hasil: `Maaf bro, ada gangguan API Groq.`, idChat: idChat, success: false }, '*');
            }
        }
    });

    GM_xmlhttpRequest({
        method: "GET",
        url: "https://github.com/wppconnect-team/wa-js/releases/download/nightly/wppconnect-wa.js",
        onload: function(response) {
            const waJsCode = response.responseText;
            const scriptBotHalaman = `
const ingatanPesan = new Set();
let botAktif = true;

function getChatId(msg) {
  return msg && msg.chat && msg.chat.id ? msg.chat.id._serialized : msg.from;
}
function getBody(msg) {
  return String(msg.body || msg.caption || msg.content || '').trim();
}
function isPesanSendiri(msg) {
  return (msg && msg.id && msg.id.fromMe === true) || msg.fromMe === true;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function askGroqViaBridge(promptText, idChat) {
  return new Promise((resolve) => {
    const listener = (event) => {
      if (event.data && event.data.type === 'JAWABAN_GROQ' && event.data.idChat === idChat) {
        window.removeEventListener('message', listener);
        resolve(event.data.hasil);
      }
    };
    window.addEventListener('message', listener);
    window.postMessage({ type: 'PANGGIL_GROQ', prompt: promptText, idChat: idChat }, '*');
  });
}

async function sendHumanizedMessage(to, text, quotedMsgId) {
  try {
    await sleep(randomInt(1000, 2000));
    await WPP.chat.markIsRead(to);
    await sleep(randomInt(500, 1500));
    const durasiNgetik = Math.min(Math.max(1000, text.length * 40), 5000);
    await WPP.chat.markIsComposing(to, durasiNgetik);
    await sleep(durasiNgetik);

    const options = quotedMsgId ? { quotedMsg: quotedMsgId, linkPreview: false } : { linkPreview: false };
    await WPP.chat.sendTextMessage(to, text, options);
  } catch (error) {
    console.error('Gagal mengirim pesan:', error);
  }
}

async function prosesPesan(msg) {
  if (!botAktif) return;

  const idPesanUnik = msg && msg.id ? msg.id._serialized : null;
  if (!idPesanUnik || ingatanPesan.has(idPesanUnik)) return;
  const body = getBody(msg);
  if (!body || isPesanSendiri(msg) || msg.isGroup) {
    ingatanPesan.add(idPesanUnik);
    return;
  }
  const chatId = getChatId(msg);
  if (!chatId) return;
  ingatanPesan.add(idPesanUnik);
  const balasanAI = await askGroqViaBridge(body, chatId);
  if (balasanAI) {
    await sendHumanizedMessage(chatId, balasanAI, idPesanUnik);
  }
}

const startBot = () => {
  if (typeof WPP === 'undefined' || typeof WPP.webpack === 'undefined') {
    setTimeout(startBot, 1000);
    return;
  }
  WPP.webpack.onReady(() => {
    console.log('✅ [Groq-Bot] WPPConnect Ready!');
    WPP.removeAllListeners('chat.new_message');
    WPP.on('chat.new_message', async (msg) => {
      await prosesPesan(msg);
    });
  });
};

// ==========================================
// UI TOGGLE BOT NATIVE SIDEBAR (PENGGANTI)
// ==========================================

function pasangTombolDiSidebar() {
  // Gunakan setInterval agar menunggu WhatsApp benar-benar selesai dimuat
  const cekInterval = setInterval(() => {
    // Cari elemen tombol Meta AI atau tombol navigasi lainnya sebagai patokan letak
    const metaAiBtn = document.querySelector('button[aria-label="Meta AI"], button[aria-label="Komunitas"]');

    if (metaAiBtn) {
      clearInterval(cekInterval); // Hentikan pencarian jika tombol sudah ketemu

      // Pastikan tombol belum dipasang sebelumnya
      if (document.getElementById('btn-groq-bot')) return;

      // Ambil container terluar dari tombol bawaan untuk di-kloning
      const btnContainer = metaAiBtn.closest('span').parentElement;

      // Kloning seluruh elemen beserta styling bawaan WA
      const cloneContainer = btnContainer.cloneNode(true);
      const newButton = cloneContainer.querySelector('button');

      newButton.id = 'btn-groq-bot';
      newButton.setAttribute('aria-label', 'Toggle Groq Bot');
      newButton.setAttribute('title', 'Nyalakan/Matikan Bot Balas Otomatis');

      // Hapus ikon bawaan dan ganti dengan ikon bot
      const iconWrapper = newButton.querySelector('img') ? newButton.querySelector('img').parentElement : newButton.querySelector('svg').parentElement;

      if (iconWrapper) {
        // Masukkan ikon
        iconWrapper.innerHTML = '<span style="font-size: 22px;">𖠌</span>';

        // Paksa span (iconWrapper) bawaan WA agar merata-tengah
        iconWrapper.style.display = 'flex';
        iconWrapper.style.justifyContent = 'center';
        iconWrapper.style.alignItems = 'center';
        iconWrapper.style.width = '100%';

        // Paksa juga <div> parent tepat di atasnya agar merata-tengah
        if (iconWrapper.parentElement) {
            iconWrapper.parentElement.style.display = 'flex';
            iconWrapper.parentElement.style.justifyContent = 'center';
            iconWrapper.parentElement.style.alignItems = 'center';
            iconWrapper.parentElement.style.width = '100%';
        }
      }

      // Fungsi untuk mengatur tampilan indikator nyala/mati
      const updateTampilan = () => {
        if (botAktif) {
          newButton.style.opacity = '1';
          newButton.style.transform = 'scale(1.1)';
        } else {
          newButton.style.opacity = '0.4';
          newButton.style.transform = 'scale(1)';
        }
      };

      newButton.style.transition = 'all 0.2s ease'; // Animasi mulus saat ditekan

      // Pasang fungsi klik
      newButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        botAktif = !botAktif;
        console.log(botAktif ? '🤖 BOT DIAKTIFKAN' : '⛔ BOT DIMATIKAN');
        updateTampilan();
      };

      // Set tampilan awal
      updateTampilan();

      // Sisipkan tombol kita tepat di bawah tombol patokan
      btnContainer.after(cloneContainer);
    }
  }, 2000); // Mengecek setiap 2 detik
}

pasangTombolDiSidebar();
startBot();

            `;
            const finalCode = waJsCode + ";\n\n" + scriptBotHalaman;
            const blob = new Blob([finalCode], { type: 'application/javascript' });
            const scriptEl = document.createElement('script');
            scriptEl.src = URL.createObjectURL(blob);
            document.head.appendChild(scriptEl);
        }
    });
})();