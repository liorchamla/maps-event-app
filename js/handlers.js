/**
 * Gestion du formulaire dans la modal
 * @param {DOMEvent} event 
 */
function onSubmitForm(event){
	// On stop le comportement par défaut
	event.preventDefault();

	// On va récupérer les données :
	const description = document.querySelector("textarea#description").value;
	const position = JSON.parse(document.querySelector("#coords-modal").value);
	const type = document.querySelector("select#type").value;
    
	// Les infos sont récupérées (il faudra les envoyer au backend)
	const notification = new Notification(Date.now(), type, description, position);
    
	// Envoi au backend via AJAX
	notification.save();

	// Création du Marker
	GoogleUtilities.createMarker(notification);

	// Recentrage de la map sur le nouveau Marker
	map.setCenter(position);
    
	// On ferme la modal
	$("#event-form").modal("close");
	// On nettoie le formulaire :
	$("#event-form form")[0].reset();
}

/**
 * Gestion du choix dans la Google Searchbox globale
 */
function onChooseGlobalSearchBox(){
	const coords = this.getPlaces().shift().geometry.location;
	const position = {lat: coords.lat(), lng: coords.lng()};
	// On place la map sur cette place
	map.setCenter(position);
}

/**
 * Gestion du choix dans la Google searchbox de la modal
 */
function onChooseModalSearchBox(){
	const coords = this.getPlaces().shift().geometry.location;
	const position = {lat: coords.lat(), lng: coords.lng()};
	// On place les données dans l'input hidden
	$("#coords-modal").val(JSON.stringify(position));
}

/**
 * Gestion du click sur la map
 * @param {DOMEvent} event 
 */
function onClickMap(event){
	const position = {lat: event.latLng.lat(), lng: event.latLng.lng()};
	// On place les données dans l'input hidden
	$("#coords-modal").val(JSON.stringify(position));
	// On cache la searchbox de la modal
	$("#search-block").hide();
	// On ouvre la modal
	$("#event-form").modal("open");
}

/**
 * Gestion du click sur le bouton + en bas de page
 */
function onClickPlusButton(){
	$("#search-block").show();
	$("#search-in-form").val("");
	$("#event-form").modal("open");
}

/**
 * Gestion du click sur les checkbox de filtres
 * @param {DOMEvent} event 
 */
function onClickFiltersCheck(event){
	const type = event.target.id;
	const checked = event.target.checked;
	GoogleUtilities.setMarkersVisibility(type, checked);
}