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

// On se connecte au serveur qui emmet des notifications (serveur temporaire sur c9)
const socket = io(backendSocketURL);

// On attend les messages de type "event-notification" et on y régit
socket.on("event-notification", data => {
	// On construit un objet notification à partir des données reçues
	const notification = new Notification(data.id, data.type, data.description, data.position, data.confirmations, data.infirmations);
	// On affiche un toast qui nous explique qu'une nouvelle notification a été reçue
	Materialize.toast("<img src=\""+icons[notification.type]+"\"> Nouvelle notification : "+labels[notification.type], 2000, "rounded");
	// On créé le marker qui correspond
	GoogleUtilities.createMarker(notification);
});