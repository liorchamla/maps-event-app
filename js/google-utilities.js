// Les tableaux qui vont contenir les infoWindows
const infoWindows = [];
const overWindows = [];

// Le tableau qui va contenir tous nos markers
const markers = {};
// Le tableau qui contient les types de markers visibles
const visibleMarkers = [
	"blesse", "mort", "travaux", "bouchon"
];

/**
 * La classe qui nous donne plein d'utilitaire (création de map, de markers, d'infowindows etc)
 */
export class GoogleUtilities {

	// Permet de créer la map (sera appelée par le callback du script Google Map)
	static createMap(){
		// Création de la map :
		var uluru = {lat: -25.363, lng: 131.044}; // Uluru est en autralie .. Peut être faudrait-il choisir un autre point de départ :D
		map = new google.maps.Map(document.getElementById("map"), {
			zoom: 12,
			center: uluru,
			disableDefaultUI: true
		});

		// On écoute le click sur la map
		map.addListener("click", onClickMap);

		// On chope la géoloc du mec
		navigator.geolocation.getCurrentPosition(position => {
			const center = {lat: position.coords.latitude, lng: position.coords.longitude};
			map.setCenter(center);
		});

		// On initialise les searchbox global et modal
		GoogleUtilities.initSearchBoxes();
	}

	/**
	 * Permet de créer le contenu l'infoWindow qui sera ouverte au click sur le marker
	 * 
	 * @param {Notification} notification La notification pour laquelle on veut créer un contenu d'OverWindow 
	 */
	static getInfoWindowContent(notification){
		const template = document.getElementById("infoWindow").content.cloneNode(true);

		template.querySelector("img").setAttribute("src", icons[notification.type]);
		template.querySelector(".info-title span").textContent = labels[notification.type];
		template.querySelector("p").textContent = notification.description;
		template.querySelector("div.div-confirm").setAttribute("id", "infowindow-" + notification.id);
		template.querySelector("#btn-confirm span").textContent = notification.confirmations || 0;
		template.querySelector("#btn-infirm span").textContent = notification.infirmations || 0;

		return template.querySelector("div.main").innerHTML;
	}

	/**
	 * Permet de créer le contenu l'infoWindow qui sera ouverte au mouseover
	 * 
	 * @param {Notification} notification la notification pour laquelle on veut un contenu d'OverWindow
	 */
	static getOverWindowContent(notification){
		const template = document.getElementById("overWindow").content.cloneNode(true);
        
		template.querySelector("img").setAttribute("src", icons[notification.type]);
		template.querySelector(".info-title span").textContent = labels[notification.type];
		template.querySelector("p").textContent = notification.description;

		return template.querySelector("div.main").innerHTML;
	}

	/**
	 * Permet de créer les InfoWindow et OverWindow
	 * 
	 * @param {Notification} notification La notification pour laquelle on veut créer une infoWindow
	 * @param {google.maps.Marker} marker Le marker sur lequel on va greffer l'infoWindow
	 */
	static createInfoWindow(notification, marker){
		// Création de l'infoWindow
		const infoWindow = new google.maps.InfoWindow({
			content: GoogleUtilities.getInfoWindowContent(notification)
		});
		// Création de l'overWindow (qui apparaitra au mouseover)
		const overWindow = new google.maps.InfoWindow({
			content: GoogleUtilities.getOverWindowContent(notification)
		});

		// Ajoutons nos infoWindows (over ou normal) dans des tableaux
		infoWindows.push(infoWindow);
		overWindows.push(overWindow);
        
		// Ajout d'un écouteur lors de l'ouverture de la window (plus tard)
		google.maps.event.addListener(infoWindow, "domready", function() {
			// Ajout d'écouteurs sur les boutons
			const id = "#infowindow-" + notification.id;
			document.querySelector(`${id} #btn-confirm`).addEventListener("click", function(e) {
				e.preventDefault();
				notification.confirmations++;
				notification.update().then(response => {
					this.querySelector("span").textContent = notification.confirmations;    
				}).catch(err => {
					alert("Une erreur nous empêche de mettre à jour le statut.");
					console.error(err);
				});
                
			});
    
			document.querySelector(`${id} #btn-infirm`).addEventListener("click", function(e){
				e.preventDefault();
				notification.infirmations++;
				notification.update().then(response => {
					this.querySelector("span").textContent = notification.infirmations;
				}).catch(err => {
					alert("Une erreur nous empêche de mettre à jour le statut.");
					console.error(err);
				});
			});
		});

		// On lie l'infoWindow avec le marker
		marker.addListener("click", function(){
			// On ferme toutes les infoWindow (y compris les overWindows)
			infoWindows.concat(overWindows).forEach(info => info.close());
			// On ouvre que celle qui nous intéresse
			infoWindow.open(map, marker);
			// On lui spécifie qu'elle est ouverte !
			infoWindow.isOpen = true;
		});

		// Quand on ferme l'infoWindow, on lui notifie qu'elle est fermée (...)
		infoWindow.addListener("closeclick",function(){
			infoWindow.isOpen = false;
		});

		// Quand on passe par dessus un marker, si l'infoWindow n'est pas ouverte
		// alors on permet à l'overWindow de s'ouvrir
		marker.addListener("mouseover", function(){
			if(!infoWindow.isOpen){
				overWindow.open(map, marker);
			}
		});
		
		// Quand la souris sort du marker , on ferme l'overWindow
		marker.addListener("mouseout", function(){
			overWindow.close();
		});
	}

	/**
	 * Permet de dire à un marqueur si on veut le voir ou pas
	 * 
	 * @param {string} type Le type de notification concernée
	 * @param {boolean} visibility La visibilité qu'on veut lui donner
	 */
	static setMarkersVisibility(type, visibility){
		// On s'occupe de maintenir un état des marqueurs qu'on doit voir ou pas
		if(!visibility && visibleMarkers.includes(type)){
			// Si ce type doit être invisible et qu'il est toujours dans le tableau des visibles, on le supprime
			visibleMarkers.splice(visibleMarkers.findIndex(item => item === type), 1);
		} else if(visibility && !visibleMarkers.includes(type)){
			// Au contraire si ce type doit être visible mais qu'il n'est pas dans le tableau des visibles, on l'y met !
			visibleMarkers.push(type);
		}
        
		// On boucle sur les markers du type visé, et on leur donne la visibilité demandée (true ou false)
		markers[type].forEach(marker => {
			marker.setVisible(visibility);
		});
	}

	/**
	 * Permet de créer un marqueur pour une notification
	 * 
	 * @param {Notification} notification La notification pour laquelle on veut créer un marqueur
	 */
	static createMarker(notification){
		// Icone pour le marqueur :
		const icon = {
			url: icons[notification.type], // url
			scaledSize: new google.maps.Size(30, 30), // scaled size
			origin: new google.maps.Point(0,0), // origin
			anchor: new google.maps.Point(0, 0) // anchor
		};

		// On veut savoir si le marqueur doit être visible ou pas !
		const visible = visibleMarkers.includes(notification.type);

		// Créons tout de suite le marker
		const marker = new google.maps.Marker({
			map,
			position: notification.position,
			icon,
			visible
		});

		// Ajout du marker dans le tableau des markers avec son type :
		if(!markers[notification.type]) markers[notification.type] = [];
		markers[notification.type].push(marker);
    
		// Créons l'infoWindow
		GoogleUtilities.createInfoWindow(notification, marker);
	}

	/**
	 * Permet d'initialiser un searchbox
	 * 
	 * @param {string} id L'id de l'élément input pour lequel on veut créer un searchBox
	 */
	static createSearchBox(id){
		// On récupère l'input
		const input = document.getElementById(id);
		// On demande à Google de créer un searchbox
		const searchBox = new google.maps.places.SearchBox(input);
		// On renvoie le searchBox créé
		return searchBox;
	}
    
	/**
	 * Permet d'initiliser les 2 searchbox
	 */
	static initSearchBoxes(){
		// Création de l'input global
		globalSearchBox = GoogleUtilities.createSearchBox("search");
    
		// Ecoute du changement de places dans l'input
		globalSearchBox.addListener("places_changed", onChooseGlobalSearchBox);
    
		// Création de l'input au sein de la modal
		modalSearchBox = GoogleUtilities.createSearchBox("search-in-form");
		modalSearchBox.addListener("places_changed", onChooseModalSearchBox);
	}
}