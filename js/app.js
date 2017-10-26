import { Notification } from "./notification.model";
import { GoogleUtilities } from "./google-utilities";

/**
 * Permet de charger les notifications à partir du Backend
 */
function loadNotificationsFromBackend(){
	// On demande à la classe Notification de nous renvoyer les notifications du Serveur
	Notification.loadAll().then(notifications => {
		// Pour chaque notificatio, créons un marqueur
		notifications.forEach(notification => {
			GoogleUtilities.createMarker(notification);
		});
	});
}

// On initialise la map
GoogleUtilities.createMap();

// MATERIALIZE SHIT :
// On initialise les modals
$(".modal").modal();
// On initilise les selects
$("select").material_select();

// EVENTS LISTENERS
// On initialise le click sur le bouton plus
document.querySelector("#btn-add").addEventListener("click", onClickPlusButton);

// On initialise le click sur les checkboxes des filtres
Array.from(document.querySelectorAll("[type=checkbox]")).forEach(input => input.addEventListener("click", onClickFiltersCheck));

// On initialise le submit du formulaire 
document.querySelector("#event-form form").addEventListener("submit", onSubmitForm);

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