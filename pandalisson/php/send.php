<?php
/**
 * Global Connect Argentina - Procesador de formulario de contacto
 * Dominio: pandalisson.com
 * 
 * Envía el mensaje al cliente Y una copia a tu correo para monitoreo
 */

// ========== CONFIGURACIÓN ==========
$destinatario = "grupointermediariosfraterndidad@gmail.com";  // Cliente (destinatario principal)
$copia = "amnavarro.cu@gmail.com";                             // Tu correo (copia para chequear)
$from = "formulario@pandalisson.com";                          // Remitente (debe ser de tu dominio)
// ===================================

// Verificar que el formulario fue enviado por POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // ========== CAPTURAR Y SANITIZAR DATOS ==========
    $nombre = isset($_POST['nombre']) ? htmlspecialchars(trim($_POST['nombre'])) : '';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : '';
    $telefono = isset($_POST['telefono']) ? htmlspecialchars(trim($_POST['telefono'])) : '';
    $mensaje = isset($_POST['mensaje']) ? htmlspecialchars(trim($_POST['mensaje'])) : '';
    
    // ========== VALIDACIONES ==========
    $errores = [];
    
    if (empty($nombre) || strlen($nombre) < 2) {
        $errores[] = "El nombre es obligatorio y debe tener al menos 2 caracteres.";
    }
    
    if (!$email) {
        $errores[] = "Por favor, ingresá un correo electrónico válido.";
    }
    
    if (empty($mensaje) || strlen($mensaje) < 10) {
        $errores[] = "El mensaje es obligatorio y debe tener al menos 10 caracteres.";
    }
    
    // Si hay errores, mostrar mensaje y detener ejecución
    if (!empty($errores)) {
        echo "<!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Error - Global Connect Argentina</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 30px rgba(0,0,0,0.08); max-width: 500px; }
                .icono { font-size: 50px; margin-bottom: 15px; }
                h1 { color: #c0392b; font-size: 1.5rem; margin-bottom: 10px; }
                ul { text-align: left; color: #c0392b; margin-bottom: 20px; }
                a { background: #b8860b; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; }
                a:hover { background: #9a7d3a; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='icono'>⚠️</div>
                <h1>Error al enviar el mensaje</h1>
                <ul>";
                foreach ($errores as $error) {
                    echo "<li>$error</li>";
                }
        echo "</ul>
                <a href='javascript:history.back()'>Volver al formulario</a>
            </div>
        </body>
        </html>";
        exit;
    }
    
    // ========== PREPARAR EL CORREO ==========
    $asunto = "Nueva consulta web - $nombre";
    
    // Cabeceras del correo (con CC para tu copia)
    $cabeceras = "From: $from\r\n";
    $cabeceras .= "Reply-To: $email\r\n";
    $cabeceras .= "Cc: $copia\r\n";
    $cabeceras .= "MIME-Version: 1.0\r\n";
    $cabeceras .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $cabeceras .= "X-Mailer: PHP/" . phpversion();
    
    // Cuerpo del mensaje
    $cuerpo = "═══════════════════════════════\n";
    $cuerpo .= "     NUEVA CONSULTA DESDE LA WEB\n";
    $cuerpo .= "═══════════════════════════════\n\n";
    $cuerpo .= "📋 DATOS DE CONTACTO:\n";
    $cuerpo .= "─────────────────────────────\n";
    $cuerpo .= "👤 Nombre: $nombre\n";
    $cuerpo .= "📧 Email: $email\n";
    $cuerpo .= "📞 Teléfono: " . ($telefono ?: 'No especificado') . "\n\n";
    $cuerpo .= "💬 MENSAJE:\n";
    $cuerpo .= "─────────────────────────────\n";
    $cuerpo .= "$mensaje\n\n";
    $cuerpo .= "═══════════════════════════════\n";
    $cuerpo .= "📅 Fecha: " . date('d/m/Y H:i') . " (ART)\n";
    $cuerpo .= "🌐 IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    $cuerpo .= "🖥️ Navegador: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'No disponible') . "\n";
    
    // ========== ENVIAR CORREO ==========
    $enviado = mail($destinatario, $asunto, $cuerpo, $cabeceras);
    
    if ($enviado) {
        // Redirigir a página de agradecimiento
        header("Location: ../thanks.html");
        exit;
    } else {
        // Error al enviar
        echo "<!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Error - Global Connect Argentina</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 30px rgba(0,0,0,0.08); max-width: 500px; }
                .icono { font-size: 50px; margin-bottom: 15px; }
                h1 { color: #c0392b; font-size: 1.5rem; margin-bottom: 10px; }
                p { color: #666; margin-bottom: 20px; }
                a { background: #b8860b; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; }
                a:hover { background: #9a7d3a; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='icono'>❌</div>
                <h1>Error del servidor</h1>
                <p>No se pudo enviar el mensaje en este momento. Por favor, intentá nuevamente más tarde o comunicate directamente por correo electrónico.</p>
                <a href='../index.html'>Volver al inicio</a>
            </div>
        </body>
        </html>";
    }
} else {
    // Si alguien intenta acceder directamente al archivo sin enviar el formulario
    header("Location: ../index.html");
    exit;
}
?>