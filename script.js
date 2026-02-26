function showBet(teamName) {
    const modal = document.getElementById('betModal');
    const teamNameElement = document.getElementById('teamName');
    const modalBalance = document.getElementById('modalBalance');
    const betResult = document.getElementById('betResult');
    const betAmount = document.getElementById('betAmount');
    
    // Güncel bakiyeyi users listesinden al (0 olsa bile değiştirme)
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const savedUser = users.find(u => u.email === currentUser.email);
    
    if (savedUser) {
        // Sadece undefined veya null ise 2000 yap, 0 ise 0 kalsın
        if (savedUser.balance === undefined || savedUser.balance === null) {
            savedUser.balance = 2000;
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            users[userIndex].balance = 2000;
            localStorage.setItem('users', JSON.stringify(users));
        }
        currentUser.balance = savedUser.balance;
    }
    
    teamNameElement.textContent = teamName;
    modalBalance.textContent = currentUser.balance;
    betResult.style.display = 'none';
    betAmount.value = '';
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('betModal');
    modal.style.display = 'none';
}

function confirmBet() {
    const betAmountInput = document.getElementById('betAmount');
    const amount = parseInt(betAmountInput.value);
    const teamName = document.getElementById('teamName').textContent;
    
    // Kontroller
    if (!amount || amount <= 0) {
        alert('❌ Lütfen geçerli bir miktar girin!');
        return;
    }
    
    // Güncel bakiyeyi users listesinden al
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex === -1) {
        alert('❌ Kullanıcı bulunamadı!');
        return;
    }
    
    // Bakiye kontrolü - sadece undefined veya null ise 2000 yap
    if (users[userIndex].balance === undefined || users[userIndex].balance === null) {
        users[userIndex].balance = 2000;
    }
    
    // Yetersiz bakiye kontrolü
    if (amount > users[userIndex].balance) {
        alert('❌ Yetersiz bakiye! Mevcut bakiyeniz: ' + users[userIndex].balance);
        return;
    }
    
    // Bakiyeden düş
    users[userIndex].balance = users[userIndex].balance - amount;
    currentUser.balance = users[userIndex].balance;
    
    // Users listesini kaydet
    localStorage.setItem('users', JSON.stringify(users));
    
    // CurrentUser'ı güncelle
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Bakiyeleri güncelle
    document.getElementById('userBalance').textContent = currentUser.balance;
    document.getElementById('modalBalance').textContent = currentUser.balance;
    
    // Sonuç mesajını göster
    document.getElementById('betResult').style.display = 'block';
    betAmountInput.value = '';
    
    // Bahis geçmişini kaydet
    let betHistory = JSON.parse(localStorage.getItem('betHistory_' + currentUser.email)) || [];
    betHistory.push({
        team: teamName,
        amount: amount,
        date: new Date().toLocaleString('tr-TR'),
        resultDate: '01.03.2026 23:00'
    });
    localStorage.setItem('betHistory_' + currentUser.email, JSON.stringify(betHistory));
}

window.onclick = function(event) {
    const modal = document.getElementById('betModal');
    const overlay = document.getElementById('menuOverlay');
    
    // Modal dışına tıklanırsa modalı kapat
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Kullanıcı Yönetimi
let currentUser = null;
let useFirebase = false;

// Sayfa yüklendiğinde kontrol et
window.onload = function() {
    // Firebase kontrolü
    setTimeout(() => {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            useFirebase = true;
            console.log('✅ Firebase modu aktif');
        } else {
            useFirebase = false;
            console.log('⚠️ LocalStorage modu aktif');
        }
        checkAuth();
        initMusic();
    }, 1000);
}

// Müzik başlatma
function initMusic() {
    const music = document.getElementById('bgMusic');
    if (music) {
        music.volume = 0.15; // %15 ses seviyesi
        
        // Mobil cihaz kontrolü
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Mobilde müziği başlatma (performans için)
            music.pause();
            console.log('📱 Mobil cihaz - Müzik devre dışı');
        } else {
            // Desktop'ta müziği başlat
            document.addEventListener('click', function() {
                music.play().catch(e => console.log('Müzik çalınamadı:', e));
            }, { once: true });
        }
    }
}

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        
        // Admin kontrolü
        if (currentUser.email === 'admin@admin.com') {
            showAdminPanel();
            return;
        }
        
        // Kullanıcının güncel bakiyesini users listesinden al
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const savedUser = users.find(u => u.email === currentUser.email);
        
        if (savedUser) {
            // Eğer bakiye hiç tanımlanmamışsa (ilk kez) 2000 ver
            if (savedUser.balance === undefined || savedUser.balance === null) {
                savedUser.balance = 2000;
                // Users listesini güncelle
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                users[userIndex] = savedUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
            // Güncel bakiyeyi currentUser'a aktar (0 olsa bile)
            currentUser.balance = savedUser.balance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        showMainPage();
    } else {
        showAuthPage();
    }
}

function showMainPage() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('hamburgerMenu').style.display = 'flex';
    document.getElementById('userName').textContent = `👤 ${currentUser.name}`;
    
    // Bakiye göster - users listesinden güncel bakiyeyi al
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const savedUser = users.find(u => u.email === currentUser.email);
    
    if (savedUser) {
        // Eğer bakiye hiç tanımlanmamışsa (ilk kez) 2000 ver
        if (savedUser.balance === undefined || savedUser.balance === null) {
            savedUser.balance = 2000;
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            users[userIndex].balance = 2000;
            localStorage.setItem('users', JSON.stringify(users));
        }
        // Güncel bakiyeyi göster (0 olsa bile)
        currentUser.balance = savedUser.balance;
        document.getElementById('userBalance').textContent = savedUser.balance;
    }
    
    // currentUser'ı güncelle
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Menüyü başlangıçta kapalı tut
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    if (menu) menu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function showAuthPage() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('hamburgerMenu').style.display = 'none';
    
    // Menüyü kapat
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    if (menu) menu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function showLogin() {
    document.getElementById('authTitle').textContent = 'Giriş Yap';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('authTitle').textContent = 'Kayıt Ol';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Kayıt Formu
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (useFirebase) {
        // Firebase ile kayıt
        try {
            // E-posta kontrolü
            const usersSnapshot = await db.collection('users').where('email', '==', email).get();
            if (!usersSnapshot.empty) {
                alert('❌ Bu e-posta zaten kayıtlı!');
                return;
            }
            
            // Yeni kullanıcı ekle
            await db.collection('users').add({
                name: name,
                email: email,
                password: password,
                balance: 2000,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            alert('✅ Kayıt başarılı! 2000 bakiye hediye edildi! Şimdi giriş yapabilirsiniz.');
            showLogin();
            document.getElementById('registerForm').reset();
        } catch (error) {
            console.error('Firebase kayıt hatası:', error);
            alert('❌ Kayıt sırasında hata oluştu: ' + error.message);
        }
    } else {
        // LocalStorage ile kayıt
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.find(u => u.email === email)) {
            alert('❌ Bu e-posta zaten kayıtlı!');
            return;
        }
        
        const newUser = { name, email, password, balance: 2000 };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('✅ Kayıt başarılı! 2000 bakiye hediye edildi! Şimdi giriş yapabilirsiniz.');
        showLogin();
        document.getElementById('registerForm').reset();
    }
});

// Giriş Formu
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Admin kontrolü
    if (email === 'admin@admin.com' && password === 'admin123') {
        currentUser = { name: 'Admin', email: 'admin@admin.com', password: 'admin123' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert('✅ Admin girişi başarılı!');
        showAdminPanel();
        document.getElementById('loginForm').reset();
        return;
    }
    
    if (useFirebase) {
        // Firebase ile giriş
        try {
            const usersSnapshot = await db.collection('users')
                .where('email', '==', email)
                .where('password', '==', password)
                .get();
            
            if (!usersSnapshot.empty) {
                const userDoc = usersSnapshot.docs[0];
                const userData = userDoc.data();
                currentUser = {
                    id: userDoc.id,
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    balance: userData.balance || 2000
                };
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                alert('✅ Giriş başarılı!');
                showMainPage();
                document.getElementById('loginForm').reset();
            } else {
                alert('❌ E-posta veya şifre hatalı!');
            }
        } catch (error) {
            console.error('Firebase giriş hatası:', error);
            alert('❌ Giriş sırasında hata oluştu: ' + error.message);
        }
    } else {
        // LocalStorage ile giriş
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            if (!user.balance && user.balance !== 0) {
                user.balance = 2000;
                const userIndex = users.findIndex(u => u.email === email);
                users[userIndex] = user;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert('✅ Giriş başarılı!');
            showMainPage();
            document.getElementById('loginForm').reset();
        } else {
            alert('❌ E-posta veya şifre hatalı!');
        }
    }
});

// Çıkış Yap
function logout() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showAuthPage();
    }
}

// Menü Toggle
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const hamburger = document.getElementById('hamburgerMenu');
    
    const isActive = menu.classList.contains('active');
    
    if (isActive) {
        // Kapat
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    } else {
        // Aç
        menu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Overlay'e tıklayınca menüyü kapat
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('menuOverlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            toggleMenu();
        });
    }
});

// Admin Paneli
function showAdminPanel() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('hamburgerMenu').style.display = 'none';
    
    loadAdminData();
}

async function loadAdminData() {
    if (useFirebase) {
        // Firebase'den kullanıcıları çek
        try {
            const usersSnapshot = await db.collection('users').get();
            const users = [];
            
            usersSnapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('Firebase kullanıcılar:', users);
            displayAdminData(users);
        } catch (error) {
            console.error('Firebase veri çekme hatası:', error);
            alert('❌ Kullanıcılar yüklenirken hata oluştu');
        }
    } else {
        // LocalStorage'dan kullanıcıları çek
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(u => u.email !== 'admin@admin.com');
        console.log('LocalStorage kullanıcılar:', users);
        displayAdminData(users);
    }
}

function displayAdminData(users) {
    // İstatistikler
    document.getElementById('totalUsers').textContent = users.length;
    
    let totalBalance = 0;
    let totalBets = 0;
    
    users.forEach(user => {
        totalBalance += user.balance || 0;
        let betHistory = JSON.parse(localStorage.getItem('betHistory_' + user.email)) || [];
        totalBets += betHistory.length;
    });
    
    document.getElementById('totalBalance').textContent = totalBalance;
    document.getElementById('totalBets').textContent = totalBets;
    
    // Kullanıcı tablosu
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #FFD700; font-size: 1.2em;">📭 Henüz kayıtlı kullanıcı yok</td></tr>';
        return;
    }
    
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        const userId = user.id || user.email;
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
            <td class="balance-cell">${user.balance || 0}</td>
            <td>
                <button class="admin-btn edit-btn" onclick="editUserBalance('${userId}', '${user.email}')">✏️ Düzenle</button>
                <button class="admin-btn delete-btn" onclick="deleteUser('${userId}', '${user.email}')">🗑️ Sil</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function editUserBalance(userId, email) {
    if (useFirebase) {
        // Firebase'den kullanıcıyı bul
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const newBalance = prompt(`${userData.name} için yeni bakiye girin:`, userData.balance || 0);
                
                if (newBalance !== null) {
                    const balance = parseInt(newBalance);
                    if (!isNaN(balance) && balance >= 0) {
                        await db.collection('users').doc(userId).update({
                            balance: balance
                        });
                        alert('✅ Bakiye güncellendi!');
                        loadAdminData();
                    } else {
                        alert('❌ Geçerli bir sayı girin!');
                    }
                }
            }
        } catch (error) {
            console.error('Bakiye güncelleme hatası:', error);
            alert('❌ Bakiye güncellenirken hata oluştu');
        }
    } else {
        // LocalStorage'dan kullanıcıyı bul
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email);
        
        if (user) {
            const newBalance = prompt(`${user.name} için yeni bakiye girin:`, user.balance || 0);
            
            if (newBalance !== null) {
                const balance = parseInt(newBalance);
                if (!isNaN(balance) && balance >= 0) {
                    const userIndex = users.findIndex(u => u.email === email);
                    users[userIndex].balance = balance;
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    alert('✅ Bakiye güncellendi!');
                    loadAdminData();
                } else {
                    alert('❌ Geçerli bir sayı girin!');
                }
            }
        }
    }
}

async function deleteUser(userId, email) {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
        if (useFirebase) {
            // Firebase'den sil
            try {
                await db.collection('users').doc(userId).delete();
                localStorage.removeItem('betHistory_' + email);
                alert('✅ Kullanıcı silindi!');
                loadAdminData();
            } catch (error) {
                console.error('Kullanıcı silme hatası:', error);
                alert('❌ Kullanıcı silinirken hata oluştu');
            }
        } else {
            // LocalStorage'dan sil
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users = users.filter(u => u.email !== email);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.removeItem('betHistory_' + email);
            
            alert('✅ Kullanıcı silindi!');
            loadAdminData();
        }
    }
}

// Admin hesabı oluştur (KALDIRILDI - artık gerek yok)
// Admin direkt giriş yapabilir, users listesinde tutulmaz

// Bahis Geçmişi Sayfası
function showBetHistory() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('betHistoryPage').style.display = 'block';
    
    loadBetHistory();
}

function showMainContent() {
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('betHistoryPage').style.display = 'none';
}

function loadBetHistory() {
    let betHistory = JSON.parse(localStorage.getItem('betHistory_' + currentUser.email)) || [];
    
    // İstatistikler
    document.getElementById('totalBetsCount').textContent = betHistory.length;
    
    let totalSpent = 0;
    betHistory.forEach(bet => {
        totalSpent += bet.amount;
    });
    document.getElementById('totalSpent').textContent = totalSpent;
    
    // Bahis listesi
    const listContainer = document.getElementById('betHistoryList');
    
    if (betHistory.length === 0) {
        listContainer.innerHTML = '<div class="no-bets">📭 Henüz bahis yapmadınız.</div>';
        return;
    }
    
    listContainer.innerHTML = '';
    
    // Bahisleri ters sırada göster (en yeni üstte)
    betHistory.reverse().forEach((bet, index) => {
        const betCard = document.createElement('div');
        betCard.className = 'bet-card';
        betCard.innerHTML = `
            <div class="bet-card-header">
                <span class="bet-number">#${betHistory.length - index}</span>
                <span class="bet-date">📅 ${bet.date}</span>
            </div>
            <div class="bet-card-body">
                <div class="bet-team">⚽ ${bet.team}</div>
                <div class="bet-amount">💰 ${bet.amount} Bahis</div>
            </div>
            <div class="bet-card-footer">
                <span class="bet-result-date">🕐 Sonuç: ${bet.resultDate}</span>
            </div>
        `;
        listContainer.appendChild(betCard);
    });
}
