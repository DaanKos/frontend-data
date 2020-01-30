# Frontend data - Interactieve Visualisatie: de categorie met de meeste objecten, per land. Klik op een land om de verdeling van de categorieën in dit land te zien.


Dit is mijn repository voor het vak Frontend-data. Ik heb dit vak gevolgd van 18-11-2019 t/m 29-11-2019. Het vak is een onderdeel van de tech-track van Information Design in jaar 3 van CMD aan de HvA.

![Afbeelding huidige uitwerking concept](https://i.imgur.com/5dBXyKo.png)

## Inhoud
* [Link naar de applicatie](#link-naar-de-applicatie)
* [Lokale installatie](#lokale-installatie)
* [Leerdoelen](#leerdoelen)
* [Introductie](#introductie)
* [Doelgroep](#doelgroep)
* [Het concept](#het-concept)
* [Features](#features)
* [Gebruikte data & verwerken data](#gebruikte-data--verwerken-data)
* [Credits](#credits)

## Link naar de applicatie
[Klik hier om de applicatie te gebruiken/bekijken.](https://sharp-cray-04d003.netlify.com)

## Wiki
Houd het ontwikkelingsproces bij in de [wiki!](https://github.com/DaanKos/frontend-data/wiki)

## Bekende bugs
* NOG UPDATEN

## Lokale installatie
### Installatie
Om de applicatie lokaal te installeren, moet je een ```git clone``` uitvoeren.

Voordat je de clone uitvoert:
* Installeer node.js
* Installeer een code editor (zoals bijv. Visual Studio Code)
* Installeer een CLI (command line interface)

Gebruikte bronnen/packages:
* NPM
* Rollup.js
* d3.js

**Doorloop dit proces:**

Clone deze repository
```
git clone https://github.com/DaanKos/frontend-data.git
```

Ga naar de juiste folder
```
cd frontend-data
```

Installeer de gebruikte bronnen/packages met NPM
```
npm install
```

### Gebruik
Start de applicatie
```
npm run start
```

Om de code klaar te maken voor deployment
```
npm run build
```

### Up to date blijven
Als ik nog actief aan dit project werk is het slim om af en toe een ```git pull``` uit te voeren om er zeker van te zijn dat je de meest recente versie gebruikt.

## Leerdoelen
- [x] Beter worden in het gebruik van D3 in het algemeen
- [x] Een interactieve data visualisatie kunnen maken
- [x] Werken met een enter update exit pattern in D3
- [x] Nog meer leren omtrent het opschonen van data op een efficiente manier

## Introductie
Voor het vak Frontend-data heb ik de opdracht gekregen om aan de slag te gaan met de database van het NMVW (Nationaal Museum van Wereldkunde).

Het NMVW heeft een ontzettend grote collectie, en maar een deel hiervan wordt tentoongesteld in de musea die bij het NMVW horen. 
Deze grote collectie is online te bekijken, maar hier komen maar weinig mensen op af.

Aan mij de taak om de data die in de database beschikbaar is te verwerken in een datavisualisatie die mensen dichter bij de collectie kan brengen op een informatieve en overzichtelijke manier.

## Doelgroep
Dit concept is vooral passend voor een online omgeving. In een volledig uitgewerkte datavisualisatie wil ik de gebruiker de mogelijkheid geven om per land te ontdekken hoe de verdeling van de objecten en bijbehorende categorieën is.

Verder denk ik dat mijn concept eigenlijk meerdere doelgroepen kent. Het is een simpel te begrijpen visualisatie, dus mensen die weinig over de collectie weten kunnen er makkelijk mee aan de slag. Toch is het ook interessant voor mensen die wat bekender zijn met de collectie omdat de visualistie nieuwe inzichten brengt die eerder niet bekend waren.

## Features
* Ontdek welke categorie het vaakst voorkomt in ieder land op een wereldkaart.
* Klik op een land om de verdeling van de objecten met hun bijbehorende categorieënen is voor dit land.

## Gebruikte data & verwerken data
In de applicatie wordt data opgehaald uit de collectie database van het NMVW. Hiervoor gebruik ik een SPARQL query die objecten ophaalt die aan vooraf opgestelde voorwaarden voldoen. Meer hierover in de wiki op de [SPARQL query](https://github.com/DaanKos/frontend-data/wiki/SPARQL-query) pagina. De opgehaalde data heb ik opgeschoond en getransformeerd met JavaScript, hoe ik dit heb gedaan is te lezen op de  [data ophalen en verwerken](https://github.com/DaanKos/frontend-data/wiki/3-Data-ophalen-en-verwerken) pagina in de wiki.

## Credits
* [Hulp van Giovanni Kaaijk](https://github.com/GiovanniKaaijk)
* [Hulp van Kris Kuiper](https://github.com/kriskuiper)
* [Hulp van Robert](https://github.com/roberrrt-s)
* [Hulp van Laurens](https://github.com/razpudding)
