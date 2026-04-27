const fs = require('fs');
let content = fs.readFileSync('src/hooks/useTranslation.tsx', 'utf8');

const keysEs = `
    'booking.step1_title': 'Seleccionar Servicio',
    'booking.step1_subtitle': 'Elige un tratamiento especializado adaptado a tus necesidades.',
    'booking.step2_title': 'Seleccionar Fecha',
    'booking.step2_subtitle': 'Agenda clínica disponible hasta el próximo mes.',
    'booking.step3_title': 'Seleccionar Hora',
    'booking.step3_subtitle': 'Mostrando horas disponibles para {FECHA}',
    'booking.step4_title': 'Detalles Finales',
    'booking.step4_subtitle': 'La validación clínica requiere un número de teléfono válido.',
    'booking.full_name': 'Nombre Completo',
    'booking.professional': 'Especialista',
`;

const keysEn = `
    'booking.step1_title': 'Select Service',
    'booking.step1_subtitle': 'Choose a specialized treatment tailored to your needs.',
    'booking.step2_title': 'Select Date',
    'booking.step2_subtitle': 'Clinical agenda available until next month.',
    'booking.step3_title': 'Select Time',
    'booking.step3_subtitle': 'Showing slots for {FECHA}',
    'booking.step4_title': 'Final Details',
    'booking.step4_subtitle': 'Clinical validation requires a valid phone number.',
    'booking.full_name': 'Full Name',
    'booking.professional': 'Professional',
`;

const keysFr = `
    'booking.step1_title': 'Sélectionner un service',
    'booking.step1_subtitle': 'Choisissez un traitement spécialisé adapté à vos besoins.',
    'booking.step2_title': 'Sélectionner une date',
    'booking.step2_subtitle': 'Agenda clinique disponible jusqu\\'au mois prochain.',
    'booking.step3_title': 'Sélectionner l\\'heure',
    'booking.step3_subtitle': 'Affichage des créneaux pour {FECHA}',
    'booking.step4_title': 'Détails finaux',
    'booking.step4_subtitle': 'La validation clinique nécessite un numéro de téléphone valide.',
    'booking.full_name': 'Nom complet',
    'booking.professional': 'Spécialiste',
`;

const keysDe = `
    'booking.step1_title': 'Service auswählen',
    'booking.step1_subtitle': 'Wählen Sie eine auf Ihre Bedürfnisse zugeschnittene Fachbehandlung.',
    'booking.step2_title': 'Datum auswählen',
    'booking.step2_subtitle': 'Klinische Agenda bis nächsten Monat verfügbar.',
    'booking.step3_title': 'Zeit auswählen',
    'booking.step3_subtitle': 'Zeige verfügbare Zeiten für {FECHA}',
    'booking.step4_title': 'Letzte Details',
    'booking.step4_subtitle': 'Klinische Validierung erfordert eine gültige Telefonnummer.',
    'booking.full_name': 'Vollständiger Name',
    'booking.professional': 'Spezialist',
`;

const keysPt = `
    'booking.step1_title': 'Selecionar Serviço',
    'booking.step1_subtitle': 'Escolha um tratamento especializado adaptado às suas necessidades.',
    'booking.step2_title': 'Selecionar Data',
    'booking.step2_subtitle': 'Agenda clínica disponível até o próximo mês.',
    'booking.step3_title': 'Selecionar Hora',
    'booking.step3_subtitle': 'Mostrando vagas para {FECHA}',
    'booking.step4_title': 'Detalhes Finais',
    'booking.step4_subtitle': 'A validação clínica requer um número de telefone válido.',
    'booking.full_name': 'Nome Completo',
    'booking.professional': 'Especialista',
`;

const keysIt = `
    'booking.step1_title': 'Seleziona Servizio',
    'booking.step1_subtitle': 'Scegli un trattamento specializzato adatto alle tue esigenze.',
    'booking.step2_title': 'Seleziona Data',
    'booking.step2_subtitle': 'Agenda clinica disponibile fino al prossimo mese.',
    'booking.step3_title': 'Seleziona Ora',
    'booking.step3_subtitle': 'Mostrando gli orari per {FECHA}',
    'booking.step4_title': 'Dettagli Finali',
    'booking.step4_subtitle': 'La validazione clinica richiede un numero di telefono valido.',
    'booking.full_name': 'Nome Completo',
    'booking.professional': 'Specialista',
`;

const replaceLang = (content, langVar, keys) => {
    // Find the end of the object for the given lang
    const startIdx = content.indexOf('export const ' + langVar);
    if (startIdx === -1) return content;
    const endIdx = content.indexOf('};', startIdx);
    if (endIdx === -1) return content;
    
    return content.slice(0, endIdx) + keys + content.slice(endIdx);
};

content = replaceLang(content, 'es = {', keysEs);
content = replaceLang(content, 'en: typeof es = {', keysEn);
content = replaceLang(content, 'fr: typeof es = {', keysFr);
content = replaceLang(content, 'de: typeof es = {', keysDe);
content = replaceLang(content, 'pt: typeof es = {', keysPt);
content = replaceLang(content, 'it: typeof es = {', keysIt);

fs.writeFileSync('src/hooks/useTranslation.tsx', content);
console.log('Translations injected successfully.');
