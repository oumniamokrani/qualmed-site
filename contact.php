<?php
/* QUALMED — traitement du formulaire de contact.
   Envoie la demande à contact@qualmed.fr. Renvoie du JSON honnête :
   { "ok": true } seulement si l'email part réellement. */

header('Content-Type: application/json; charset=utf-8');

// --- Destinataire ---
$TO = 'contact@qualmed.fr';

// --- Méthode POST uniquement ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method']);
    exit;
}

// --- Anti-spam : honeypot (champ caché "website" rempli => bot) ---
if (!empty($_POST['website'])) {
    // On fait semblant d'accepter pour ne pas renseigner le bot, mais on n'envoie rien.
    echo json_encode(['ok' => true]);
    exit;
}

// --- Récupération et nettoyage ---
function clean($k) {
    return isset($_POST[$k]) ? trim(filter_var($_POST[$k], FILTER_UNSAFE_RAW)) : '';
}
$name    = clean('name');
$company = clean('company');
$email   = clean('email');
$phone   = clean('phone');
$country = clean('country');
$size    = clean('size');
$operator= clean('operator');
$need    = clean('need');
$sector  = clean('sector');
$timeline= clean('timeline');
$budget  = clean('budget');
$message = clean('message');
$consent = isset($_POST['consent']);

// --- Validation minimale ---
$errors = [];
if ($name === '')  $errors[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($message === '') $errors[] = 'message';
if (!$consent) $errors[] = 'consent';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation', 'fields' => $errors]);
    exit;
}

// --- Anti-injection d'en-têtes ---
$safe_email = preg_replace('/[\r\n]+/', ' ', $email);
$safe_name  = preg_replace('/[\r\n]+/', ' ', $name);

// --- Corps du message ---
$body  = "Nouvelle demande via qualmed.fr\n";
$body .= "----------------------------------------\n";
$body .= "Nom et prénom : $name\n";
$body .= "Entreprise    : $company\n";
$body .= "Email         : $email\n";
$body .= "Téléphone     : $phone\n";
$body .= "Pays          : $country\n";
$body .= "Taille        : $size\n";
$body .= "Profil        : $operator\n";
$body .= "Besoin        : $need\n";
$body .= "Secteur       : $sector\n";
$body .= "Délai souhaité: $timeline\n";
$body .= "Budget        : $budget\n";
$body .= "----------------------------------------\n";
$body .= "Message :\n$message\n";
$body .= "----------------------------------------\n";
$body .= "Reçu le " . date('d/m/Y H:i') . " — IP " . ($_SERVER['REMOTE_ADDR'] ?? '') . "\n";

$subject = "[QualMed] Demande de " . $safe_name . ($need ? " — $need" : "");

// --- En-têtes ---
$headers  = "From: QualMed <no-reply@qualmed.fr>\r\n";
$headers .= "Reply-To: $safe_name <$safe_email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// --- Envoi ---
$sent = @mail($TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'send']);
}
