<?php
// Veritabanı bağlantı ayarları
$servername = "127.0.0.1"; 
$username = "root";       // XAMPP varsayılan kullanıcı adı
$password = "";           // XAMPP varsayılan şifre boştur
$dbname = "halisaha_db";  // Güncellenmiş veritabanı adı

// Bağlantıyı oluştur
$conn = new mysqli($servername, $username, $password, $dbname);

// Bağlantıyı kontrol et
if ($conn->connect_error) {
    die("Veritabanı bağlantı hatası: " . $conn->connect_error);
}
?>