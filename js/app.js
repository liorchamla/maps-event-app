let map, // La Google Map
	globalSearchBox, // La searchbox globale
	modalSearchBox, // La searchbox modale
	labels = {
		"blesse": "Personne blessée !",
		"mort": "Personne décédée !",
		"bouchon": "Embouteillage en cours !",
		"travaux": "Travaux en cours !",   
	},
	icons = {
		"blesse": "img/icons/gmap/blesse.png",
		"mort": "img/icons/gmap/mort.png",
		"bouchon": "img/icons/gmap/bouchon.png",
		"travaux": "img/icons/gmap/travaux.png",
	}; 

// Permet de charger toutes les notifications à partir du Backend
function loadNotificationsFromBackend(){
	Notification.loadAll().then(notifications => {
		notifications.forEach(notification => {
			GoogleUtilities.createMarker(notification);
		});
	});
}

// On initialise la map
GoogleUtilities.createMap();

// On initialise les modals
$(".modal").modal();

// On initilise les selects
$("select").material_select();

// On initialise le click sur le bouton plus
$("#btn-add").on("click", onClickPlusButton);

$("[type=checkbox]").on("click", onClickFiltersCheck);

// On initialise le submit du formulaire 
$("#event-form form").on("submit", onSubmitForm);

// On charge les événements à partir du back end
window.addEventListener("load", loadNotificationsFromBackend);

// On gère la taille de la div#map 
$("#map").outerHeight($(window).outerHeight() - $("nav").outerHeight() - $("#search").parent().outerHeight());

const socket = io("https://exia-a3-mongo-liorchamla.c9users.io/");

socket.on("event-notification", data => {
	const notification = new Notification(data.id, data.type, data.description, data.position, data.confirmations, data.infirmations);
	Materialize.toast("<img src=\""+icons[notification.type]+"\"> Nouvelle notification : "+labels[notification.type], 2000, "rounded");
	GoogleUtilities.createMarker(notification);
});