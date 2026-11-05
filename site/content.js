// Pending with the restaurant (also listed in README → Content checklist):
// TODO(ciao): current full menu and prices, authorised by the restaurant (text, PDF or URL); then replace the
//             category overview below and remove the "vollständige aktuelle Speisekarte" note (roteiro 04)
// TODO(ciao): Impressum and Datenschutz texts approved by the owner (required before the owner's own domain)
// TODO(ciao): permission for the two visitor photos (dining room, table) or the owner's own photos
// TODO(ciao): opening hours, only if the owner confirms them (not published until then)
// TODO(ciao): own domain → canonical + og:url in index.html, drop noindex (meta, vercel.json, robots.txt)
window.CIAO=Object.freeze({
  name:'Ciao Mamma!',
  phone:'+494032513764',
  address:'Am Sandtorkai 38–40, 20457 Hamburg',
  map:'https://www.google.com/maps/search/?api=1&query=Ciao+Mamma+Am+Sandtorkai+38-40+20457+Hamburg',
  menu:{
    pizza:{title:'Pizza',description:'Tomate, Mozzarella, Basilikum – und viel Amore. Frag uns nach der aktuellen Auswahl an italienischen Pizzaklassikern.'},
    pasta:{title:'Pasta',description:'Ein Teller Pasta gehört mit auf den Tisch. Die aktuelle Auswahl und Preise erfährst du direkt im Restaurant.'}
  },
  menuStatus:'category_overview_only_current_full_menu_not_supplied'
});
