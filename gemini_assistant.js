// ==UserScript==
// @name         WA-JS Gemini Assistant
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  asisten WA fitur: memori chat, searching google, nyambung kalo di ajak ngomong
// @author       Dwaynimay Farrel
// @match        https://web.whatsapp.com/*
// @icon         https://www.google.com/s2/favicons?domain=whatsapp.com
// @grant        GM_xmlhttpRequest
// @connect      generativelanguage.googleapis.com
// @connect      github.com
// @connect      githubusercontent.com
// ==/UserScript==

/* eslint-disable */

(function () {
	'use strict';
	
	console.log("🛠️ [TM] Memulai Jembatan Sandbox (Gemini Memory Mode)...");
	
	// 🔴 MASUKKAN API KEY YANG BARU DI SINI (JANGAN PAKE YANG LAMA)
	const GEMINI_API_KEY = "GEMINI API";
	
	// 🧠 SISTEM MEMORI AI
	const chatMemory = {}; // Menyimpan riwayat chat berdasarkan nomor WA
	const MAX_HISTORY = 20; // Mengingat 20 pesan terakhir (10 interaksi) agar tidak kepanjangan
	
	window.addEventListener('message', function(event) {
		if (event.data && event.data.type === 'PANGGIL_GEMINI') {
			const promptUser = event.data.prompt;
			const idChat = event.data.idChat;
			
			// 1. Jika belum pernah chat, buatkan memori kosong untuk nomor ini
			if (!chatMemory[idChat]) {
				chatMemory[idChat] = [];
			}
			
			// 2. Masukkan pesan user ke dalam memori
			chatMemory[idChat].push({ role: "user", parts: [{ text: promptUser }] });
			
			// 3. Potong memori jika terlalu panjang (mencegah error Token Limit)
			if (chatMemory[idChat].length > MAX_HISTORY) {
				// Pastikan memotong genap agar urutan user-model tidak rusak
				chatMemory[idChat] = chatMemory[idChat].slice(-MAX_HISTORY);
			}
			const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;
			
			// 4. Kirim SELURUH riwayat memori ke Google
			// Ambil waktu saat ini dari laptop/komputer kamu
			const waktuSekarang = new Date().toLocaleString('id-ID', {
				timeZone: 'Asia/Jakarta',
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
			
			// 4. Kirim riwayat memori, waktu, dan aktifkan Google Search
			const payload = {
				"system_instruction": {
					"parts": [{
						"text": `Kamu adalah asisten pribadi Farrel, mahasiswa Teknik Telekomunikasi Telkom University. Balas santai, ramah, dan manusiawi. INFO PENTING: Waktu saat ini adalah ${waktuSekarang} WIB.`
					}]
				},
				"contents": chatMemory[idChat],
				"tools": [
					{ "googleSearch": {} } // 🌐 INI KUNCI UNTUK MENGAKTIFKAN BROWSING INTERNET
				]
			};
			
			GM_xmlhttpRequest({
				method: "POST",
				url: url,
				headers: { "Content-Type": "application/json" },
				data: JSON.stringify(payload),
							  onload: function(response) {
								  try {
									  const data = JSON.parse(response.responseText);
									  
									  if (data.error) {
										  console.error("❌ ERROR DARI GOOGLE API:", data.error.message);
										  chatMemory[idChat].pop(); // Hapus pesan user terakhir karena gagal dijawab
										  window.postMessage({ type: 'JAWABAN_GEMINI', hasil: `Wah, ditolak Google nih. Error: ${data.error.message}`, idChat: idChat, success: false }, '*');
										  return;
									  }
									  
									  if (data.promptFeedback && data.promptFeedback.blockReason) {
										  chatMemory[idChat].pop(); // Hapus pesan user
										  window.postMessage({ type: 'JAWABAN_GEMINI', hasil: `Maaf, pesannya kena blokir keamanan Google.`, idChat: idChat, success: false }, '*');
										  return;
									  }
									  
									  if (data.candidates && data.candidates[0]) {
										  const reply = data.candidates[0].content.parts[0].text;
										  
										  // 5. Simpan jawaban AI ke dalam memori
										  chatMemory[idChat].push({ role: "model", parts: [{ text: reply }] });
										  
										  window.postMessage({ type: 'JAWABAN_GEMINI', hasil: reply, idChat: idChat, success: true }, '*');
									  } else {
										  chatMemory[idChat].pop();
										  window.postMessage({ type: 'JAWABAN_GEMINI', hasil: "Maaf, AI lagi nge-blank (Data kosong). 🧠", idChat: idChat, success: false }, '*');
									  }
								  } catch (error) {
									  chatMemory[idChat].pop();
									  window.postMessage({ type: 'JAWABAN_GEMINI', hasil: "Gagal memproses JSON dari Google.", idChat: idChat, success: false }, '*');
								  }
							  },
							  onerror: function() {
								  chatMemory[idChat].pop();
								  window.postMessage({ type: 'JAWABAN_GEMINI', hasil: "Koneksi jaringan terputus.", idChat: idChat, success: false }, '*');
							  }
			});
		}
	});
	
	GM_xmlhttpRequest({
		method: "GET",
		url: "https://github.com/wppconnect-team/wa-js/releases/download/nightly/wppconnect-wa.js",
		onload: function(response) {
			const waJsCode = response.responseText;
			
			const scriptBotHalaman = `
			const ingatanPesan = new Set();
			
			function getChatId(msg) { return msg && msg.chat && msg.chat.id ? msg.chat.id._serialized : msg.from; }
			function getBody(msg) { return String(msg.body || msg.caption || msg.content || '').trim(); }
			function isPesanSendiri(msg) { return (msg && msg.id && msg.id.fromMe === true) || msg.fromMe === true; }
			
			const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
			const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
			
			function askGeminiViaBridge(promptText, idChat) {
				return new Promise((resolve) => {
					const listener = (event) => {
						if (event.data && event.data.type === 'JAWABAN_GEMINI' && event.data.idChat === idChat) {
							window.removeEventListener('message', listener);
							resolve(event.data.hasil);
						}
					};
					window.addEventListener('message', listener);
					window.postMessage({ type: 'PANGGIL_GEMINI', prompt: promptText, idChat: idChat }, '*');
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
					
					const options = quotedMsgId ? { quotedMsg: quotedMsgId } : {};
					await WPP.chat.sendTextMessage(to, text, options);
				} catch (error) {
					console.error('Gagal mengirim pesan:', error);
				}
			}
			
			async function prosesPesan(msg) {
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
				console.log('🤖 [Gemini] Memproses pesan dari: ' + chatId);
				
				const balasanAI = await askGeminiViaBridge(body, chatId);
				
				if (balasanAI) {
					await sendHumanizedMessage(chatId, balasanAI, idPesanUnik);
					console.log('✅ Berhasil membalas chat dari: ' + chatId);
				}
			}
			
			const startBot = () => {
				if (typeof WPP === 'undefined' || typeof WPP.webpack === 'undefined') {
					setTimeout(startBot, 1000);
					return;
				}
				
				WPP.webpack.onReady(() => {
					console.log('✅ [Gemini-Bot] WPPConnect Ready di Halaman Utama!');
					WPP.removeAllListeners('chat.new_message');
					WPP.on('chat.new_message', async (msg) => {
						await prosesPesan(msg);
					});
					console.log('🚀 [Gemini-Bot] Asisten AI dgn Memori siap digunakan!');
				});
			};
			
			startBot();
			`;
			
			const finalCode = waJsCode + ";\n\n" + scriptBotHalaman;
			const blob = new Blob([finalCode], { type: 'application/javascript' });
			const scriptEl = document.createElement('script');
			scriptEl.src = URL.createObjectURL(blob);
			document.head.appendChild(scriptEl);
			
			console.log("💉 [TM] Injeksi Gemini berhasil! Menunggu inisialisasi WPP...");
		}
	});
	
})();
