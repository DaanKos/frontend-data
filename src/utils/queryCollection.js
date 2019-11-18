// File that contains the query that's used in runQuery
// Changes according to the given parameter, which should be the termMasterId for the query

export default function(termMasterId) {
	return `
        #+ summary: Wapens query - haalt alle aantallen van de wapens subcategorieen op per land
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX gn: <http://www.geonames.org/ontology#>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX edm: <http://www.europeana.eu/schemas/edm/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
        # tel aantallen per land
        SELECT ?subcategorie ?subcategorieLabel ?lat ?long ?land ?landLabel (COUNT(?cho) AS ?choCount) WHERE {
        # haal van een term in de thesaurus de subcategorieen op
        <https://hdl.handle.net/20.500.11840/termmaster${termMasterId}> skos:narrower* ?subcategorie .
        # haal de objecten van deze subcategorieen en de plaats
        ?cho edm:isRelatedTo ?subcategorie .
        ?cho dct:spatial ?plaats .
        ?subcategorie skos:prefLabel ?subcategorieLabel .
        # haal het landLabel op van de plaats
        ?plaats skos:exactMatch/gn:parentCountry ?land .
        ?land wgs84:lat ?lat .
        ?land wgs84:long ?long .
        ?land gn:name ?landLabel .
        }
        GROUP BY ?lat ?long ?land ?subcategorie ?landLabel ?subcategorieLabel
        ORDER BY DESC(?choCount)
        LIMIT 1000
        `
    }