// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';


console.log('Hieronder moet je waarschijnlijk nog wat veranderen')
// Doe een fetch naar de data die je nodig hebt

const apiUser = await fetch('https://fdnd-agency.directus.app/items/snappthis_user')
const apiSnap = await fetch('https://fdnd-agency.directus.app/items/snappthis_snap')
const apiSnapMap = await fetch('https://fdnd-agency.directus.app/items/snappthis_snapmap')
const apiGroup = await fetch('https://fdnd-agency.directus.app/items/snappthis_group')
const apiAction = await fetch('https://fdnd-agency.directus.app/items/snappthis_action')

// Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
const apiUserJSON = await apiUser.json()
const apiSnapJSON = await apiSnap.json()
const apiSnapMapJSON = await apiSnapMap.json()
const apiGroupJSON = await apiGroup.json()
const apiActionJSON = await apiAction.json()

// Controleer eventueel de data in je console
// (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
// console.log(apiResponseJSON)


// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({extended: true}))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express()); 

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Maak een GET route voor de index (meestal doe je dit in de root, als /)
app.get('/', async function (request, response) {

  response.render('index.liquid', {
    snapmaps: apiSnapMapJSON.data
  })

})

app.get('/snappmap/:name', async function (request, response) {
  const name = request.params.name;

  // Fetch van de specifieke snapmap via filter
  const apiSnapMap = await fetch(`https://fdnd-agency.directus.app/items/snappthis_snapmap?filter[name][_eq]=${name}`);
  const apiSnapMapJSON = await apiSnapMap.json();

  response.render('snappmap.liquid', {
    snapmaps: apiSnapMapJSON.data
  });
});

app.get('/search', async function (request, response) {
   // Render index.liquid uit de Views map
   // Geef hier eventueel data aan mee
   response.render('search.liquid')
})

// Maak een GET route voor de groepen (meestal doe je dit in de root, als /)
app.get('/groups', async function (request, response) {
  try {
    const apiGroup = await fetch('https://fdnd-agency.directus.app/items/snappthis_group');
    const apiGroupJSON = await apiGroup.json();

    // fallback naar lege array als er geen data is
    const groups = apiGroupJSON.data || [];

    response.render('groups.liquid', {
      groups: groups
    });

  } catch (err) {
    console.error(err);
    response.status(500).send('Er is iets misgegaan bij het ophalen van groepen.');
  }
});

app.get('/group/:name', async function (request, response) {
  try {
    const groupname = request.params.name;

    // Fetch van de specifieke groep via filter
    const apiSnapGroup = await fetch(`https://fdnd-agency.directus.app/items/snappthis_group?filter[name][_eq]=${groupname}`);
    const apiSnapGroupJSON = await apiSnapGroup.json();

    response.render('squad.liquid', {
      snapgroup: apiSnapGroupJSON.data || [] // fallback naar lege array
    });

  } catch (err) {
    console.error(err);
    response.status(500).send('Er is iets misgegaan bij het ophalen van de groep');
  }
});

// Maak een GET route voor het profiel (meestal doe je dit in de root, als /)
app.get('/profile', async function (request, response) {
   // Render index.liquid uit de Views map
   // Geef hier eventueel data aan mee
   response.render('profile.liquid')
})

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post('/', async function (request, response) {
  // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
  // Er is nog geen afhandeling van een POST, dus stuur de bezoeker terug naar /
  response.redirect(303, '/')
})

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})

// 404 pagina
app.use((request, response) => {
  response.status(404).render('404.liquid', { 
    path: request.path 
  });
});