// --- SAHA VE GÖRSEL BİLGİLERİ ---
const pitches = [
    {
        name: "Çengel SK",
        image: "https://pbs.twimg.com/media/DDARfEtW0AATppV.jpg"
    },
    {
        name: "Halısaha 2000",
        image: "https://sosyalhalisaha.com/images/whatsapp-image-2017-02-02-at-131306_1486216840.jpeg" 
    },
    {
        name: "Paris Saha",
        image: "https://psgacademyturkey.com/images/tesislerimiz/psg_beylikduzu-sahasi.jpg"
    },
    {
        name: "Hasan Özaydın",
        image: "https://www.olleyy.com/api/Foto?id=8974&fotoTuru=Desktop"
    },
    {
        name: "Koşuyolu SK",
        image: "https://sporenvanteri.ibb.istanbul/images/facilityImage/1920x1024/869-2434.png"
    }
];

const timeSlots = [
    "17.00-18.00", 
    "18.00-19.00", 
    "19.00-20.00", 
    "20.00-21.00", 
    "21.00-22.00", 
    "22.00-23.00", 
    "23.00-00.00"
];

// --- MERKEZİ VERİ VE DURUM YÖNETİMİ ---
const reservations = {};
pitches.forEach(pitch => {
    reservations[pitch.name] = {};
});

let currentPitch = null;
let currentUser = null; 

// --- SAYFA YÜKLENDİĞİNDE ÇALIŞACAK KODLAR ---
document.addEventListener("DOMContentLoaded", () => {
    const pitchList = document.getElementById("pitch-list");
    
    if (pitchList) {
        pitches.forEach(pitch => {
            const card = document.createElement("div");
            card.className = "pitch-card";
            card.innerHTML = `
                <img src="${pitch.image}" alt="${pitch.name}" class="pitch-image" onerror="this.src='https://via.placeholder.com/300x180?text=Görsel+Bulunamadı'">
                <h3>⚽ ${pitch.name}</h3>
            `;
            card.onclick = () => openReservationPage(pitch.name);
            pitchList.appendChild(card);
        });
    }
});

// --- KULLANICI KAYIT İŞLEMLERİ ---
function openLoginModal() {
    const userInput = document.getElementById("user-fullname");
    if (userInput) userInput.value = ""; 
    
    const modal = document.getElementById("login-modal");
    if (modal) modal.style.display = "block";
}

function closeLoginModal() {
    const modal = document.getElementById("login-modal");
    if (modal) modal.style.display = "none";
}

function registerUser() {
    const userInput = document.getElementById("user-fullname");
    if (!userInput) return;

    const fullNameInput = userInput.value.trim();
    
    if (fullNameInput === "") {
        alert("Lütfen adınızı ve soyadınızı girin!");
        return;
    }
    
    currentUser = fullNameInput;
    
    const userInfoDisplay = document.getElementById("user-info-display");
    if (userInfoDisplay) userInfoDisplay.innerText = `👤 Hoş geldin, ${currentUser}`;
    
    const navBtn = document.getElementById("nav-register-btn");
    if (navBtn) navBtn.style.display = "none"; 
    
    closeLoginModal();
    alert(`Sisteme başarıyla kayıt oldunuz Sayın ${currentUser}. Artık sahalardan rezervasyon yapabilirsiniz!`);
}

// --- REZERVASYON İŞLEMLERİ ---
function openReservationPage(pitchName) {
    currentPitch = pitchName;
    
    document.getElementById("home-page").classList.remove("active");
    document.getElementById("reservation-page").classList.add("active");
    
    const pitchNameHeader = document.getElementById("selected-pitch-name");
    if (pitchNameHeader) pitchNameHeader.innerText = `${pitchName} Sahası Saatleri`;
    
    // Her yeni saha açıldığında kantin sepetini sıfırla
    document.getElementById("krampon").checked = false;
    document.getElementById("yelek").checked = false;
    document.getElementById("su").checked = false;
    toplamHesapla();

    renderTimeSlots();
}

function renderTimeSlots() {
    const slotsContainer = document.getElementById("time-slots");
    if (!slotsContainer) return;

    slotsContainer.innerHTML = "";
    
    timeSlots.forEach(slot => {
        const btn = document.createElement("button");
        btn.className = "time-btn";
        
        // Saat doluysa
        if (reservations[currentPitch] && reservations[currentPitch][slot]) {
            btn.classList.add("booked");
            btn.style.whiteSpace = "pre-wrap"; 
            btn.innerText = `${slot}\n(Dolu: ${reservations[currentPitch][slot]})`;
            btn.disabled = true;
        } else {
            // Saat boşsa
            btn.innerText = `${slot} (MÜSAİT)`;
            btn.onclick = () => handleReservationClick(slot);
        }
        slotsContainer.appendChild(btn);
    });
}

function handleReservationClick(slot) {
    if (!currentUser) {
        alert("Rezervasyon yapabilmek için lütfen önce sağ üst köşeden 'Kayıt Ol' butonuna basarak adınızı girin.");
        openLoginModal();
        return;
    }
    
    let ucret = document.getElementById("genelToplam").innerText;
    const isConfirmed = confirm(`Sayın ${currentUser},\n\n${currentPitch} sahası için saat ${slot} aralığını kiralıyorsunuz.\nEkstralar Dahil Toplam Tutar: ${ucret} TL.\n\nOnaylıyor musunuz?`);
    
    if (isConfirmed) {
        if (!reservations[currentPitch]) {
            reservations[currentPitch] = {};
        }
        reservations[currentPitch][slot] = currentUser;
        
        renderTimeSlots();
        updateAdminPanel();
        
        alert("Rezervasyonunuz başarıyla oluşturuldu!");
    }
}

// --- ANA SAYFAYA DÖNÜŞ VE OTURUM SIFIRLAMA ---
function goBack() {
    currentPitch = null;
    
    document.getElementById("reservation-page").classList.remove("active");
    document.getElementById("home-page").classList.add("active");
    
    currentUser = null;
    
    const userInfoDisplay = document.getElementById("user-info-display");
    if (userInfoDisplay) userInfoDisplay.innerText = "";
    
    const navBtn = document.getElementById("nav-register-btn");
    if (navBtn) navBtn.style.display = "inline-block";
    
    openLoginModal();
}

// --- ADMİN PANELİ ---
function updateAdminPanel() {
    const logsBody = document.getElementById("admin-logs");
    if (!logsBody) return;

    logsBody.innerHTML = "";
    let totalReservations = 0;
    
    for (const pitchName in reservations) {
        for (const slot in reservations[pitchName]) {
            totalReservations++;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${pitchName}</strong></td>
                <td><span style="color:#d32f2f; font-weight:bold;">${slot}</span></td>
                <td>👤 ${reservations[pitchName][slot]}</td>
            `;
            logsBody.appendChild(row);
        }
    }
    
    if (totalReservations === 0) {
        logsBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #999;">Henüz yapılmış bir kiralama kaydı bulunmuyor.</td></tr>`;
    }
}

function toggleAdminPanel() {
    const panel = document.querySelector(".admin-panel");
    const icon = document.getElementById("admin-toggle-icon");
    
    if (!panel || !icon) return;

    if (panel.classList.contains("open")) {
        panel.classList.remove("open");
        icon.innerText = "▲ Panelini Genişlet";
    } else {
        panel.classList.add("open");
        icon.innerText = "▼ Panelini Kapat";
    }
}

// --- YENİ ENTEGRASYON MODÜLÜ CODES ---

// Kantin Sepet Hesaplaması
function toplamHesapla() {
    let sahaSabitUcret = 400; 
    let ekstraToplam = 0;

    if (document.getElementById("krampon").checked) ekstraToplam += 50;
    if (document.getElementById("yelek").checked) ekstraToplam += 20;
    if (document.getElementById("su").checked) ekstraToplam += 30;

    document.getElementById("ekstraFiyat").innerText = ekstraToplam;
    document.getElementById("genelToplam").innerText = sahaSabitUcret + ekstraToplam;
}

// Oyuncu Bulma Panosu Maça Katıl Butonu
function macaKatil(takimAdi) {
    if (!currentUser) {
        alert("Maça katılım isteği gönderebilmek için önce sistemde adınızın kayıtlı olması gerekir. Lütfen sağ üstten 'Kayıt Ol' butonuna tıklayın.");
        openLoginModal();
        return;
    }
    alert(`Tebrikler Sayın ${currentUser}! ${takimAdi} takımının kaptanına katılım isteğiniz başarıyla iletildi.`);
}