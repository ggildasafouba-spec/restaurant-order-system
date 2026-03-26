const pptxgen = require('pptxgenjs');
const { calcTextBox, safeOuterShadow } = require('/home/oai/skills/slides/pptxgenjs_helpers');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OpenAI';
pptx.subject = 'Support de présentation TP DWWM';
pptx.title = 'Application de gestion de commandes pour restaurant';
pptx.company = 'OpenAI';
pptx.lang = 'fr-FR';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'fr-FR'
};

const C = {
  burgundy: '8A1538',
  dark: '1F2937',
  green: '166534',
  orange: 'C2410C',
  blue: '1D4ED8',
  light: 'F8FAFC',
  line: 'D8E1EA',
  muted: '6B7280',
  white: 'FFFFFF'
};

function addHeader(slide, title, subtitle) {
  slide.addShape(pptx.ShapeType.rect, { x:0, y:0, w:13.333, h:0.6, fill:{color:C.burgundy}, line:{color:C.burgundy} });
  slide.addText(title, { x:0.55, y:0.82, w:8.5, h:0.35, fontFace:'Aptos Display', fontSize:24, bold:true, color:C.dark });
  if (subtitle) slide.addText(subtitle, { x:0.55, y:1.18, w:11.5, h:0.3, fontSize:10.5, color:C.muted });
}
function addFooter(slide, n) {
  slide.addText(`Projet fil rouge — ${n}`, { x:11.8, y:7.08, w:1.1, h:0.2, align:'right', fontSize:8.5, color:C.muted });
}
function bulletRuns(items, color=C.dark) {
  return items.map(t => ({ text: t, options: { bullet: { indent: 14 }, hanging: 3, fontSize: 17, color, breakLine: true, paraSpaceAfterPt: 10 } }));
}

// Slide 1
{
  const s = pptx.addSlide();
  s.background = { color: C.light };
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:13.333, h:7.5, fill:{color:C.light}, line:{color:C.light} });
  s.addShape(pptx.ShapeType.roundRect, { x:0.65, y:0.75, w:12.05, h:5.35, rectRadius:0.08, fill:{color:C.white}, line:{color:C.line}, shadow:safeOuterShadow('000000', 0.14, 45, 1.5, 1) });
  s.addShape(pptx.ShapeType.rect, { x:0.65, y:0.75, w:0.28, h:5.35, fill:{color:C.burgundy}, line:{color:C.burgundy} });
  s.addText('Application de gestion de commandes\npour restaurant', { x:1.15, y:1.3, w:7.2, h:1.25, fontFace:'Aptos Display', fontSize:24, bold:true, color:C.dark });
  s.addText('Support de présentation — préparation examen TP DWWM', { x:1.18, y:2.7, w:6.5, h:0.3, fontSize:13, color:C.burgundy, bold:true });
  s.addText('Monorepo full-stack avec serveur Node.js, interfaces React par rôle et synchronisation temps réel via Socket.io.', { x:1.18, y:3.15, w:7.3, h:0.75, fontSize:18, color:C.dark });
  s.addText('Livrables préparés : code source, dossier de projet, support de soutenance.', { x:1.18, y:4.3, w:7.0, h:0.4, fontSize:16, color:C.muted });
  s.addShape(pptx.ShapeType.roundRect, { x:9.1, y:1.45, w:2.9, h:0.6, rectRadius:0.08, fill:{color:'ECFDF5'}, line:{color:'BBF7D0'} });
  s.addText('Temps réel', { x:9.55, y:1.62, w:2.0, h:0.2, fontSize:18, bold:true, color:C.green, align:'center' });
  s.addShape(pptx.ShapeType.roundRect, { x:9.1, y:2.25, w:2.9, h:0.6, rectRadius:0.08, fill:{color:'FFF7ED'}, line:{color:'FED7AA'} });
  s.addText('4 interfaces', { x:9.55, y:2.42, w:2.0, h:0.2, fontSize:18, bold:true, color:C.orange, align:'center' });
  s.addShape(pptx.ShapeType.roundRect, { x:9.1, y:3.05, w:2.9, h:0.6, rectRadius:0.08, fill:{color:'EFF6FF'}, line:{color:'BFDBFE'} });
  s.addText('API centrale', { x:9.55, y:3.22, w:2.0, h:0.2, fontSize:18, bold:true, color:C.blue, align:'center' });
  addFooter(s,1);
}

// Slide 2
{
  const s = pptx.addSlide(); s.background = { color: C.light }; addHeader(s, 'Contexte et besoin métier', 'Pourquoi ce projet répond à un usage concret en restauration');
  s.addText(bulletRuns([
    'Réduire les erreurs de transmission entre caisse, cuisine et service.',
    'Donner une visibilité immédiate sur l’état de chaque commande.',
    'Permettre au client de suivre l’avancement sans solliciter le personnel.',
    'Standardiser le cycle de vie : nouvelle, en préparation, prête, servie.'
  ]), { x:0.75, y:1.8, w:6.0, h:4.4, margin:0.02, valign:'top' });
  s.addShape(pptx.ShapeType.roundRect, { x:7.2, y:1.8, w:5.25, h:3.75, rectRadius:0.06, fill:{color:C.white}, line:{color:C.line} });
  s.addText('Valeur métier', { x:7.55, y:2.08, w:2.2, h:0.25, fontSize:18, bold:true, color:C.burgundy });
  s.addText(bulletRuns([
    'service plus fluide',
    'moins d’oublis',
    'communication simplifiée',
    'expérience client améliorée'
  ], C.dark), { x:7.45, y:2.55, w:4.5, h:2.3, fontSize:16 });
  s.addText('Le projet démontre une logique métier complète et observable pendant une soutenance.', { x:7.55, y:5.0, w:4.3, h:0.75, fontSize:16, color:C.muted });
  addFooter(s,2);
}

// Slide 3
{
  const s = pptx.addSlide(); s.background = { color: C.light }; addHeader(s, 'Acteurs et parcours global', 'Chaque rôle dispose de sa propre interface spécialisée');
  const boxes = [
    ['Client / Caisse', 'Créer et payer la commande', 'DCFCE7', C.green, 0.7],
    ['Cuisinier', 'Passer à en préparation puis prête', 'FEE2E2', '991B1B', 3.35],
    ['Serveur', 'Voir les commandes prêtes et marquer servie', 'FFEDD5', C.orange, 6.0],
    ['Suivi client', 'Consulter l’avancement en direct', 'DBEAFE', C.blue, 8.65]
  ];
  boxes.forEach(([title, text, fill, color, x]) => {
    s.addShape(pptx.ShapeType.roundRect, { x, y:2.2, w:2.0, h:2.2, rectRadius:0.08, fill:{color:fill}, line:{color:fill} });
    s.addText(title, { x:x+0.15, y:2.45, w:1.7, h:0.45, fontSize:18, bold:true, color });
    s.addText(text, { x:x+0.15, y:3.05, w:1.7, h:0.95, fontSize:13, color:C.dark, valign:'mid' });
  });
  s.addText('Commande validée', { x:1.0, y:5.2, w:1.5, h:0.25, fontSize:15, bold:true, color:C.green, align:'center' });
  s.addText('En préparation', { x:3.6, y:5.2, w:1.5, h:0.25, fontSize:15, bold:true, color:'991B1B', align:'center' });
  s.addText('Prête', { x:6.45, y:5.2, w:1.0, h:0.25, fontSize:15, bold:true, color:C.orange, align:'center' });
  s.addText('Servie', { x:9.2, y:5.2, w:1.0, h:0.25, fontSize:15, bold:true, color:C.blue, align:'center' });
  addFooter(s,3);
}

// Slide 4
{
  const s = pptx.addSlide(); s.background = { color: C.light }; addHeader(s, 'Architecture technique', 'Un backend central pilote les données, les API et les événements temps réel');
  s.addShape(pptx.ShapeType.roundRect, { x:5.0, y:2.35, w:3.4, h:1.2, rectRadius:0.06, fill:{color:C.white}, line:{color:C.burgundy, pt:2} });
  s.addText('Serveur Node.js + Express\nSocket.io + logique métier', { x:5.2, y:2.62, w:3.0, h:0.6, align:'center', fontSize:20, bold:true, color:C.dark });
  const cols = [
    [0.9, 'Apps React', ['Client / Caisse', 'Cuisinier', 'Serveur', 'Suivi client']],
    [9.2, 'Persistance', ['MongoDB', 'Mongoose', 'Menu', 'Commandes / Utilisateurs']]
  ];
  cols.forEach(([x,title,items]) => {
    s.addShape(pptx.ShapeType.roundRect, { x, y:1.75, w:2.8, h:2.4, rectRadius:0.05, fill:{color:C.white}, line:{color:C.line} });
    s.addText(title, { x:x+0.2, y:2.02, w:2.1, h:0.25, fontSize:18, bold:true, color:C.burgundy });
    s.addText(bulletRuns(items, C.dark), { x:x+0.15, y:2.45, w:2.4, h:1.35 });
  });
  s.addText('Routes REST\n/api/menu\n/api/orders', { x:5.7, y:4.25, w:2.0, h:0.8, align:'center', fontSize:16, color:C.muted });
  s.addText('Événements Socket.io\norder:new • order:update • order:ready • order:served', { x:3.2, y:5.45, w:6.9, h:0.8, align:'center', fontSize:16, color:C.green, bold:true });
  addFooter(s,4);
}

// Slide 5
{
  const s = pptx.addSlide(); s.background = { color: C.light }; addHeader(s, 'Démonstration fonctionnelle', 'Exemple de scénario de bout en bout');
  const steps = [
    ['1', 'Client / Caisse', 'Choisit les plats et valide le paiement'],
    ['2', 'Backend', 'Crée la commande et diffuse order:new'],
    ['3', 'Cuisinier', 'Passe la commande à in_preparation puis ready'],
    ['4', 'Serveur', 'Reçoit ready et marque la commande served'],
    ['5', 'Client', 'Observe la progression en direct jusqu’à la remise']
  ];
  steps.forEach((step, i) => {
    const y = 1.75 + i*1.0;
    s.addShape(pptx.ShapeType.ellipse, { x:0.85, y, w:0.45, h:0.45, fill:{color:C.burgundy}, line:{color:C.burgundy} });
    s.addText(step[0], { x:0.98, y: y+0.1, w:0.18, h:0.16, fontSize:12, bold:true, color:C.white, align:'center' });
    s.addText(step[1], { x:1.6, y:y-0.02, w:2.2, h:0.22, fontSize:18, bold:true, color:C.dark });
    s.addText(step[2], { x:4.0, y:y-0.02, w:7.6, h:0.35, fontSize:16, color:C.dark });
  });
  addFooter(s,5);
}

// Slide 6
{
  const s = pptx.addSlide(); s.background = { color: C.light }; addHeader(s, 'Compétences TP DWWM mobilisées', 'Le projet permet de montrer des compétences front-end et back-end');
  s.addShape(pptx.ShapeType.roundRect, { x:0.8, y:1.8, w:5.8, h:4.6, rectRadius:0.06, fill:{color:C.white}, line:{color:C.line} });
  s.addShape(pptx.ShapeType.roundRect, { x:6.75, y:1.8, w:5.8, h:4.6, rectRadius:0.06, fill:{color:C.white}, line:{color:C.line} });
  s.addText('Front-end', { x:1.1, y:2.1, w:1.8, h:0.25, fontSize:20, bold:true, color:C.green });
  s.addText(bulletRuns([
    'maquetter plusieurs écrans métier',
    'réaliser des interfaces lisibles et responsives',
    'gérer l’état, les formulaires et l’actualisation temps réel'
  ]), { x:1.0, y:2.55, w:4.9, h:2.7 });
  s.addText('Back-end', { x:7.05, y:2.1, w:1.8, h:0.25, fontSize:20, bold:true, color:C.burgundy });
  s.addText(bulletRuns([
    'structurer les données menu, commandes et utilisateurs',
    'développer des routes API et des contrôleurs',
    'porter une logique métier centralisée et réutilisable'
  ]), { x:6.95, y:2.55, w:4.9, h:2.7 });
  addFooter(s,6);
}

// Slide 7
{
  const s = pptx.addSlide(); s.background = { color: C.light }; addHeader(s, 'Livrables préparés', 'Éléments prêts à être remis et adaptés à la soutenance');
  const rows = [
    ['Code source', 'Monorepo backend + 4 applications React + modules partagés'],
    ['Dossier projet', 'Version rédigée à partir du cahier des charges et des compétences TP'],
    ['Support oral', 'Diaporama synthétique, aéré et cohérent avec le dossier'],
    ['GitHub', 'À publier en dépôt public avant dépôt du lien sur la plateforme']
  ];
  s.addShape(pptx.ShapeType.roundRect, { x:0.9, y:1.8, w:11.5, h:4.6, rectRadius:0.06, fill:{color:C.white}, line:{color:C.line} });
  rows.forEach((r,i) => {
    const y = 2.15 + i*0.95;
    s.addText(r[0], { x:1.2, y, w:2.0, h:0.22, fontSize:18, bold:true, color:C.burgundy });
    s.addText(r[1], { x:3.2, y, w:8.3, h:0.36, fontSize:16, color:C.dark });
    if (i < rows.length - 1) s.addShape(pptx.ShapeType.line, { x:1.1, y:y+0.48, w:10.9, h:0, line:{color:C.line, pt:1} });
  });
  addFooter(s,7);
}

// Slide 8
{
  const s = pptx.addSlide(); s.background = { color: C.light }; addHeader(s, 'Conclusion et perspectives', 'Ce que montre le projet et ce qui peut être ajouté ensuite');
  s.addText(bulletRuns([
    'Le projet couvre un flux complet de prise de commande jusqu’au service.',
    'La démonstration valorise la coordination entre plusieurs interfaces métier.',
    'Le temps réel rend la soutenance visuelle et facile à comprendre.',
    'Des extensions possibles : authentification, tableau de bord admin, impression ticket, déploiement cloud.'
  ]), { x:0.85, y:1.9, w:7.3, h:3.9 });
  s.addShape(pptx.ShapeType.roundRect, { x:8.7, y:2.0, w:3.3, h:2.5, rectRadius:0.08, fill:{color:'ECFDF5'}, line:{color:'BBF7D0'} });
  s.addText('Message final', { x:9.2, y:2.35, w:2.2, h:0.25, fontSize:20, bold:true, color:C.green, align:'center' });
  s.addText('Une architecture claire, un parcours métier démontrable et des compétences TP DWWM visibles.', { x:9.0, y:2.9, w:2.7, h:1.0, fontSize:16, color:C.dark, align:'center', valign:'mid' });
  addFooter(s,8);
}

pptx.writeFile({ fileName: '/mnt/data/restaurant-order-system/docs/support-presentation.pptx' });
