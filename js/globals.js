let map, // La Google Map
	globalSearchBox, // La searchbox globale
	modalSearchBox, // La searchbox modale
	// Les labels contiennent une phrase formatée correspondant à chaque type d'événement
	labels = {
		"blesse": "Personne blessée !",
		"mort": "Personne décédée !",
		"bouchon": "Embouteillage en cours !",
		"travaux": "Travaux en cours !",   
	},
	// Les icons contiennent une URL d'image pour chaque type d'événement
	icons = {
		"blesse": "img/icons/gmap/blesse.png",
		"mort": "img/icons/gmap/mort.png",
		"bouchon": "img/icons/gmap/bouchon.png",
		"travaux": "img/icons/gmap/travaux.png",
	}; 

// On doit disposer de l'URL du serveur pour ouvrir une socket avec Socket.IO
const backendSocketURL = "https://exia-a3-mongo-liorchamla.c9users.io/";